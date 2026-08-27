import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import {
  buildDocumentPath,
  buildOrganizationAddressLines,
  type ActivityLog,
  type BusinessGoal,
  type Contact,
  type Customer,
  type DocumentRecord,
  type Invoice,
  type InvoiceLine,
  type Organization,
  type OrganizationMember,
  type Task,
} from "./hub";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "./hub/pagination.ts";
import {
  assertMembership,
  assertTenantResource,
} from "./hub/tenant-security.ts";
import { hubFeatureFlags } from "./hub/feature-flags.ts";
import { assertSafeHubServerEnvironment } from "./hub/runtime-environment-server.ts";
import {
  calculateSha256,
  SupabaseStorageProvider,
} from "./hub/providers/supabase-storage-provider.ts";
import { createSupabaseServerClient } from "./supabase-server";
import type {
  CustomerFollowUpFilter,
  CustomerReadinessFilter,
  CustomerSalesStage,
  CustomerStatusFilter,
} from "./hub/sales.ts";
import {
  customerSalesStageTag,
  normalizeCustomerRegistrySearch,
} from "./hub/sales.ts";
import {
  buildSalesValidationSummary,
  SALES_VALIDATION_END_EXCLUSIVE,
  SALES_VALIDATION_START,
  SALES_VALIDATION_WON_ACTION,
  salesValidationActivityActions,
} from "./hub/sales-validation.ts";

type HubContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
  };
  organization: Organization;
  membership: OrganizationMember;
};

export async function createOrganizationForUser(context: {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  email: string | null;
  fullName: string | null;
  organizationName?: string | null;
  orgNumber?: string | null;
}) {
  assertSafeHubServerEnvironment();
  const organizationName =
    context.organizationName?.trim() ||
    context.fullName?.trim() ||
    context.email?.split("@")[0]?.replace(/[._-]+/g, " ") ||
    "Mitt företag";

  const { data: organizationId, error } = await context.supabase.rpc(
    "create_hub_organization",
    {
      target_name: organizationName,
      target_org_number: context.orgNumber ?? null,
      target_email: context.email,
    },
  );

  if (error || !organizationId) {
    throw new Error("Kunde inte skapa organisationen och ägarbehörigheten just nu.");
  }

  return organizationId;
}

export const requireHubContext = cache(async (): Promise<HubContext> => {
  assertSafeHubServerEnvironment();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/hub/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      null,
  });

  const membershipQuery = await supabase
    .from("organization_members")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membershipQuery.data) {
    redirect("/hub/onboarding");
  }

  if (membershipQuery.error || !membershipQuery.data?.organizations) {
    throw new Error("Kunde inte läsa din hubbåtkomst just nu.");
  }

  assertMembership({
    membership: membershipQuery.data,
    organizationId: membershipQuery.data.organization_id,
    userId: user.id,
  });

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
      fullName:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        null,
    },
    membership: {
      id: membershipQuery.data.id,
      organization_id: membershipQuery.data.organization_id,
      user_id: membershipQuery.data.user_id,
      role: membershipQuery.data.role,
      created_at: membershipQuery.data.created_at,
    },
    organization: membershipQuery.data.organizations as unknown as Organization,
  };
});

export async function logHubActivity(params: {
  organizationId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
}) {
  const { supabase, organization } = await requireHubContext();
  assertTenantResource({
    activeOrganizationId: organization.id,
    resourceOrganizationId: params.organizationId,
  });

  await supabase.from("activity_log").insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    description: params.description ?? null,
  });
}

export async function getHubDashboardData() {
  const { supabase, organization, membership, user } = await requireHubContext();
  const isOwnerLevel = ["owner", "admin"].includes(membership.role);
  let followUpCustomersQuery = supabase
    .from("customers")
    .select(
      "id, company_name, contact_name, preferred_contact_method, status, follow_up_date",
    )
    .eq("organization_id", organization.id)
    .not("follow_up_date", "is", null)
    .lte("follow_up_date", new Date().toISOString().slice(0, 10))
    .order("follow_up_date", { ascending: true })
    .limit(5);
  let validationCustomersQuery = supabase
    .from("customers")
    .select(
      "id, status, last_contacted_at, created_at, updated_at, created_by, owner_user_id, visibility",
    )
    .eq("organization_id", organization.id)
    .limit(2000);

  if (!isOwnerLevel) {
    followUpCustomersQuery = followUpCustomersQuery.eq(
      "visibility",
      "organization",
    );

    if (organization.employee_customer_scope === "assigned_only") {
      followUpCustomersQuery = followUpCustomersQuery.or(
        `created_by.eq.${user.id},owner_user_id.eq.${user.id}`,
      );
      validationCustomersQuery = validationCustomersQuery.or(
        `created_by.eq.${user.id},owner_user_id.eq.${user.id}`,
      );
    }

    validationCustomersQuery = validationCustomersQuery.eq(
      "visibility",
      "organization",
    );
  }

  const [
    openTasksResult,
    draftInvoicesResult,
    unpaidInvoicesResult,
    documentCountResult,
    activityCountResult,
    tasksResult,
    invoicesResult,
    documentsResult,
    activityResult,
    followUpCustomersResult,
    validationCustomersResult,
    validationActivitiesResult,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .neq("status", "done"),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "draft"),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .in("status", ["sent", "overdue"]),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("tasks")
      .select("id, title, status, due_date")
      .eq("organization_id", organization.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("invoices")
      .select("id, invoice_number, status, total, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("documents")
      .select("id, file_name, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_log")
      .select("id, action, description, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    followUpCustomersQuery,
    validationCustomersQuery,
    supabase
      .from("activity_log")
      .select("action, entity_id, created_at")
      .eq("organization_id", organization.id)
      .eq("entity_type", "customer")
      .in("action", [
        ...Object.values(salesValidationActivityActions),
        SALES_VALIDATION_WON_ACTION,
      ])
      .gte("created_at", `${SALES_VALIDATION_START}T00:00:00.000Z`)
      .lt("created_at", `${SALES_VALIDATION_END_EXCLUSIVE}T00:00:00.000Z`)
      .limit(2000),
  ]);

  const tasks = tasksResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const documents = documentsResult.data ?? [];
  const activity = activityResult.data ?? [];
  const followUpCustomers = followUpCustomersResult.data ?? [];
  const salesValidation = buildSalesValidationSummary(
    validationCustomersResult.data ?? [],
    validationActivitiesResult.data ?? [],
  );
  const isSalesValidationAvailable =
    !validationCustomersResult.error && !validationActivitiesResult.error;

  return {
    organization,
    stats: {
      openTasks: openTasksResult.count ?? 0,
      draftInvoices: draftInvoicesResult.count ?? 0,
      unpaidInvoices: unpaidInvoicesResult.count ?? 0,
      documents: documentCountResult.count ?? 0,
      recentActivity: activityCountResult.count ?? 0,
      dueFollowUps: followUpCustomers.length,
    },
    tasks,
    invoices,
    documents,
    activity,
    followUpCustomers,
    salesValidation: {
      ...salesValidation,
      isAvailable: isSalesValidationAvailable,
    },
  };
}

export async function getCustomers(options: {
  page?: number | string | null;
  status?: CustomerStatusFilter | null;
  followUp?: CustomerFollowUpFilter | null;
  stage?: CustomerSalesStage | null;
  readiness?: CustomerReadinessFilter | null;
  search?: string | null;
} = {}) {
  const { supabase, organization, membership, user } = await requireHubContext();
  const pagination = normalizePagination({ page: options.page });
  const search = normalizeCustomerRegistrySearch(options.search);
  const isOwnerLevel = ["owner", "admin"].includes(membership.role);
  let query = supabase
    .from("customers")
    .select(
      "id, company_name, contact_name, email, phone, notes, status, last_contacted_at, follow_up_date, preferred_contact_method, relationship_owner, tags, created_at, created_by, owner_user_id, visibility",
      { count: "exact" },
    )
    .eq("organization_id", organization.id)
    .order("follow_up_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (search) {
    query = query.ilike("company_name", `%${search}%`);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.stage === "won") {
    query = query.eq("status", "active");
  } else if (options.stage === "paused") {
    query = query.eq("status", "inactive");
  } else if (options.stage) {
    const stageTag = customerSalesStageTag(options.stage);
    if (stageTag) query = query.eq("status", "lead").contains("tags", [stageTag]);
  }

  const today = new Date().toISOString().slice(0, 10);

  if (options.followUp === "due") {
    query = query.not("follow_up_date", "is", null).lte("follow_up_date", today);
  }

  if (options.followUp === "missing") {
    query = query.eq("status", "lead").is("follow_up_date", null);
  }

  if (options.followUp === "scheduled") {
    query = query.gt("follow_up_date", today);
  }

  if (options.readiness) {
    query = query.eq("status", "lead");

    if (options.readiness === "missing_contact") {
      query = query.is("email", null).is("phone", null);
    } else if (options.readiness === "missing_owner") {
      query = query.is("relationship_owner", null);
    } else if (options.readiness === "missing_notes") {
      query = query.is("notes", null);
    } else if (options.readiness === "missing_follow_up") {
      query = query.is("follow_up_date", null);
    }
  }

  if (!isOwnerLevel) {
    query = query.eq("visibility", "organization");

    if (organization.employee_customer_scope === "assigned_only") {
      query = query.or(`created_by.eq.${user.id},owner_user_id.eq.${user.id}`);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Kundlistan kunde inte hämtas just nu.");
  }

  return createPaginatedResult({
    items: data ?? [],
    count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getCustomerDetail(
  customerId: string,
  options: { contactsPage?: number | string | null } = {},
) {
  const { supabase, organization, membership, user } = await requireHubContext();
  const contactsPagination = normalizePagination({ page: options.contactsPage });

  const [
    customerResult,
    contactsResult,
    tasksResult,
    invoicesResult,
    documentsResult,
    activityResult,
  ] =
    await Promise.all([
      supabase
        .from("customers")
        .select(
          "id, organization_id, created_by, owner_user_id, visibility, company_name, org_number, contact_name, email, phone, address, preferred_contact_method, last_contacted_at, follow_up_date, relationship_owner, tags, notes, status, created_at, updated_at",
        )
        .eq("organization_id", organization.id)
        .eq("id", customerId)
        .single(),
      supabase
        .from("contacts")
        .select("id, name, email, role_title, created_at", { count: "exact" })
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: true })
        .range(contactsPagination.from, contactsPagination.to),
      supabase
        .from("tasks")
        .select("id, title, status, due_date")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(25),
      supabase
        .from("invoices")
        .select("id, invoice_number, status, total")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("documents")
        .select("id, file_name, file_path, created_at")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("activity_log")
        .select("id, action, description, created_at")
        .eq("organization_id", organization.id)
        .eq("entity_type", "customer")
        .eq("entity_id", customerId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  if (customerResult.error) {
    throw new Error("Kunden kunde inte hämtas just nu.");
  }

  const isOwnerLevel = ["owner", "admin"].includes(membership.role);
  const customer = customerResult.data;
  const isOwnCustomer =
    customer.created_by === user.id || customer.owner_user_id === user.id;

  if (
    !isOwnerLevel &&
    (customer.visibility === "owners_only" ||
      (organization.employee_customer_scope === "assigned_only" && !isOwnCustomer))
  ) {
    throw new Error("Du har inte behörighet till den här kunden.");
  }

  return {
    organization,
    membership,
    customer,
    contacts: createPaginatedResult({
      items: contactsResult.data ?? [],
      count: contactsResult.count,
      page: contactsPagination.page,
      pageSize: contactsPagination.pageSize,
    }),
    tasks: tasksResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    activity: activityResult.data ?? [],
    documents: await attachSignedUrls(
      supabase,
      organization.id,
      documentsResult.data ?? []
    ),
  };
}

export async function getTasks(filters?: {
  status?: string | null;
  due?: string | null;
  page?: number | string | null;
}) {
  const { supabase, organization } = await requireHubContext();
  const pagination = normalizePagination({ page: filters?.page });
  let query = supabase
    .from("tasks")
    .select(
      "id, organization_id, customer_id, assigned_to, title, description, status, priority, due_date, created_at, updated_at",
      { count: "exact" },
    )
    .eq("organization_id", organization.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .range(pagination.from, pagination.to);

  if (filters?.status) {
    query = query.eq("status", filters.status as Task["status"]);
  }

  if (filters?.due === "overdue") {
    query = query.lt("due_date", new Date().toISOString().slice(0, 10));
  }

  if (filters?.due === "upcoming") {
    query = query.gte("due_date", new Date().toISOString().slice(0, 10));
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Uppgiftslistan kunde inte hämtas just nu.");
  }

  const tasks = data ?? [];
  const customerIds = Array.from(
    new Set(tasks.map((task) => task.customer_id).filter(Boolean))
  ) as string[];

  const customerMap = new Map<string, { id: string; company_name: string }>();

  if (customerIds.length) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, company_name")
      .eq("organization_id", organization.id)
      .in("id", customerIds);

    for (const customer of customers ?? []) {
      customerMap.set(customer.id, customer);
    }
  }

  return createPaginatedResult({
    items: tasks.map((task) => ({
      ...task,
      customers: task.customer_id
        ? customerMap.get(task.customer_id) ?? null
        : null,
    })),
    count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getBusinessGoals() {
  const { supabase, organization } = await requireHubContext();
  const { data, error } = await supabase
    .from("business_goals")
    .select(
      "id, organization_id, created_by, title, description, target_value, current_value, unit, due_date, status, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error("Målen kunde inte hämtas just nu.");
  }

  return (data ?? []) as BusinessGoal[];
}

export async function getDocuments(paginationInput: PaginationInput = {}) {
  const { supabase, organization } = await requireHubContext();
  const pagination = normalizePagination(paginationInput);
  const { data, error, count } = await supabase
    .from("documents")
    .select(
      "id, customer_id, invoice_id, file_name, file_path, category, mime_type, size_bytes, created_at",
      { count: "exact" },
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (error) {
    throw new Error("Dokumentlistan kunde inte hämtas just nu.");
  }

  const documents = data ?? [];
  const customerIds = Array.from(
    new Set(documents.map((document) => document.customer_id).filter(Boolean))
  ) as string[];
  const invoiceIds = Array.from(
    new Set(documents.map((document) => document.invoice_id).filter(Boolean))
  ) as string[];

  const [customersResult, invoicesResult] = await Promise.all([
    customerIds.length
      ? supabase
          .from("customers")
          .select("id, company_name")
          .eq("organization_id", organization.id)
          .in("id", customerIds)
      : Promise.resolve({ data: [] }),
    invoiceIds.length
      ? supabase
          .from("invoices")
          .select("id, invoice_number")
          .eq("organization_id", organization.id)
          .in("id", invoiceIds)
      : Promise.resolve({ data: [] }),
  ]);

  const customerMap = new Map(
    (customersResult.data ?? []).map((customer) => [customer.id, customer])
  );
  const invoiceMap = new Map(
    (invoicesResult.data ?? []).map((invoice) => [invoice.id, invoice])
  );

  const items = await attachSignedUrls(
    supabase,
    organization.id,
    documents.map((document) => ({
      ...document,
      customers: document.customer_id
        ? customerMap.get(document.customer_id) ?? null
        : null,
      invoices: document.invoice_id
        ? invoiceMap.get(document.invoice_id) ?? null
        : null,
    })),
  );

  return createPaginatedResult({
    items,
    count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getInvoices(paginationInput: PaginationInput = {}) {
  const { supabase, organization } = await requireHubContext();
  const pagination = normalizePagination(paginationInput);
  const { data, error, count } = await supabase
    .from("invoices")
    .select(
      "id, customer_id, invoice_number, status, issue_date, due_date, total, created_at",
      { count: "exact" },
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (error) {
    throw new Error("Fakturalistan kunde inte hämtas just nu.");
  }

  const invoices = data ?? [];
  const customerIds = Array.from(
    new Set(invoices.map((invoice) => invoice.customer_id).filter(Boolean))
  ) as string[];

  const customerMap = new Map<string, { id: string; company_name: string }>();

  if (customerIds.length) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, company_name")
      .eq("organization_id", organization.id)
      .in("id", customerIds);

    for (const customer of customers ?? []) {
      customerMap.set(customer.id, customer);
    }
  }

  return createPaginatedResult({
    items: invoices.map((invoice) => ({
      ...invoice,
      customers: invoice.customer_id
        ? customerMap.get(invoice.customer_id) ?? null
        : null,
    })),
    count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getInvoiceDetail(invoiceId: string) {
  const { supabase, organization } = await requireHubContext();
  const invoiceQuery = hubFeatureFlags.safeMutations
    ? supabase
        .from("invoices")
        .select(
          "id, organization_id, customer_id, invoice_number, status, issue_date, due_date, currency, customer_name_snapshot, customer_address_snapshot, customer_email_snapshot, notes, subtotal, vat_total, total, finalized_at, sent_at, paid_at, locked_at, pdf_document_id, pdf_status, pdf_error, pdf_storage_key, finalization_idempotency_key, finalization_started_at, created_at, updated_at",
        )
        .eq("organization_id", organization.id)
        .eq("id", invoiceId)
        .single()
    : supabase
        .from("invoices")
        .select(
          "id, organization_id, customer_id, invoice_number, status, issue_date, due_date, currency, customer_name_snapshot, customer_address_snapshot, customer_email_snapshot, notes, subtotal, vat_total, total, finalized_at, sent_at, paid_at, locked_at, pdf_document_id, created_at, updated_at",
        )
        .eq("organization_id", organization.id)
        .eq("id", invoiceId)
        .single();
  const [invoiceResult, lineResult, documentsResult] = await Promise.all([
    invoiceQuery,
    supabase
      .from("invoice_lines")
      .select(
        "id, organization_id, invoice_id, description, quantity, unit_price, vat_rate, line_subtotal, line_vat, line_total, sort_order, created_at, updated_at",
      )
      .eq("organization_id", organization.id)
      .eq("invoice_id", invoiceId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("documents")
      .select("id, organization_id, customer_id, invoice_id, file_name, file_path, mime_type, size_bytes, category, notes, uploaded_by, created_at, updated_at")
      .eq("organization_id", organization.id)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false }),
  ]);

  if (invoiceResult.error) {
    throw new Error("Fakturan kunde inte hämtas just nu.");
  }

  const invoiceData = invoiceResult.data as Invoice;

  let customer:
    | {
        id: string;
        company_name: string;
      }
    | null = null;

  if (invoiceData.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("id, company_name")
      .eq("organization_id", organization.id)
      .eq("id", invoiceData.customer_id)
      .maybeSingle();

    customer = data ?? null;
  }

  return {
    invoice: {
      ...invoiceData,
      customers: customer,
    },
    lines: lineResult.data ?? [],
    documents: await attachSignedUrls(
      supabase,
      organization.id,
      documentsResult.data ?? [],
    ),
  };
}

export async function getSettingsData() {
  const { supabase, organization } = await requireHubContext();
  const [membersResult, emailConnectionsResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("id, organization_id, user_id, role, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("email_connections")
      .select("id, organization_id, provider, email_address, status, created_at, updated_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false }),
  ]);

  const members = membersResult.data ?? [];
  const userIds = members.map((member) => member.user_id);
  const profileMap = new Map<string, { full_name: string | null; email: string | null }>();

  if (userIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, {
        full_name: profile.full_name,
        email: profile.email,
      });
    }
  }

  return {
    organization,
    members: members.map((member) => ({
      ...member,
      profiles: profileMap.get(member.user_id) ?? null,
    })),
    emailConnections: emailConnectionsResult.data ?? [],
  };
}

export async function getHubLists() {
  const { supabase, organization } = await requireHubContext();
  const [customersResult, invoicesResult] = await Promise.all([
    supabase
      .from("customers")
      .select("id, company_name")
      .eq("organization_id", organization.id)
      .order("company_name", { ascending: true })
      .limit(500),
    supabase
      .from("invoices")
      .select("id, invoice_number")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return {
    customers: customersResult.data ?? [],
    invoices: invoicesResult.data ?? [],
  };
}

async function attachSignedUrls<
  T extends { file_path: string } & Record<string, unknown>,
>(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  organizationId: string,
  documents: T[]
) {
  const results = await Promise.all(
    documents.map(async (document) => {
      const storage = new SupabaseStorageProvider(supabase);
      const signedUrl = await storage
        .getAuthorizedUrl({
          organizationId,
          key: document.file_path,
          expiresInSeconds: 60 * 30,
        })
        .catch(() => null);

      return {
        ...document,
        signedUrl,
      };
    })
  );

  return results;
}

export async function uploadHubFile(params: {
  file: File;
  organizationId: string;
  customerId?: string | null;
  fileId?: string;
  resumeExisting?: boolean;
}) {
  const { supabase, user, organization } = await requireHubContext();
  assertTenantResource({
    activeOrganizationId: organization.id,
    resourceOrganizationId: params.organizationId,
  });
  const fileId = params.fileId ?? randomUUID();
  const filePath = buildDocumentPath({
    organizationId: params.organizationId,
    customerId: params.customerId,
    fileId,
    fileName: params.file.name,
  });

  const storage = new SupabaseStorageProvider(supabase);
  if (
    params.resumeExisting &&
    (await storage.exists({
      organizationId: params.organizationId,
      key: filePath,
    }))
  ) {
    return {
      fileId,
      filePath,
      sha256: await calculateSha256(params.file),
    };
  }

  const uploaded = await storage.upload({
    organizationId: params.organizationId,
    key: filePath,
    fileName: params.file.name,
    contentType: params.file.type || "application/octet-stream",
    bytes: params.file,
    uploadedBy: user.id,
  });

  return { fileId, filePath, sha256: uploaded.sha256 };
}

export async function uploadHubBuffer(params: {
  bytes: Uint8Array<ArrayBufferLike>;
  fileName: string;
  contentType: string;
  organizationId: string;
  customerId?: string | null;
  fileId?: string;
  filePath?: string;
  resumeExisting?: boolean;
}) {
  const { supabase, user, organization } = await requireHubContext();
  assertTenantResource({
    activeOrganizationId: organization.id,
    resourceOrganizationId: params.organizationId,
  });
  const fileId = params.fileId ?? randomUUID();
  const filePath =
    params.filePath ??
    buildDocumentPath({
      organizationId: params.organizationId,
      customerId: params.customerId,
      fileId,
      fileName: params.fileName,
    });

  const storage = new SupabaseStorageProvider(supabase);
  if (
    params.resumeExisting &&
    (await storage.exists({
      organizationId: params.organizationId,
      key: filePath,
    }))
  ) {
    return {
      fileId,
      filePath,
      sha256: await calculateSha256(params.bytes),
    };
  }

  const uploaded = await storage.upload({
    organizationId: params.organizationId,
    key: filePath,
    fileName: params.fileName,
    contentType: params.contentType,
    bytes: params.bytes,
    uploadedBy: user.id,
  });

  return { fileId, filePath, sha256: uploaded.sha256 };
}

export async function getInvoicePdfData(invoiceId: string) {
  const { organization } = await requireHubContext();
  const detail = await getInvoiceDetail(invoiceId);

  return {
    organization,
    organizationAddressLines: buildOrganizationAddressLines(organization),
    invoice: detail.invoice,
    lines: detail.lines,
  };
}

export type HubInvoiceDetail = {
  invoice: Invoice & {
    customers?: { id: string; company_name: string } | null;
  };
  lines: InvoiceLine[];
  documents: Array<DocumentRecord & { signedUrl: string | null }>;
};

export type HubCustomerDetail = {
  customer: Customer;
  contacts: PaginatedResult<Contact>;
  tasks: Task[];
  invoices: Invoice[];
  documents: Array<DocumentRecord & { signedUrl: string | null }>;
};

export type HubActivity = ActivityLog;
