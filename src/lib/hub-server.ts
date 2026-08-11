import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import {
  HUB_DOCUMENTS_BUCKET,
  buildDocumentPath,
  buildOrganizationAddressLines,
  type ActivityLog,
  type Contact,
  type Customer,
  type DocumentRecord,
  type Invoice,
  type InvoiceLine,
  type Organization,
  type OrganizationMember,
  type Task,
} from "./hub";
import { createSupabaseServerClient } from "./supabase-server";

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
  userId: string;
  email: string | null;
  fullName: string | null;
  organizationName?: string | null;
  orgNumber?: string | null;
}) {
  const organizationId = randomUUID();
  const organizationName =
    context.organizationName?.trim() ||
    context.fullName?.trim() ||
    context.email?.split("@")[0]?.replace(/[._-]+/g, " ") ||
    "Mitt företag";

  const { error: organizationError } = await context.supabase
    .from("organizations")
    .insert({
      id: organizationId,
      name: organizationName,
      org_number: context.orgNumber ?? null,
      email: context.email,
    });

  if (organizationError) {
    throw organizationError ?? new Error("Kunde inte skapa organisation.");
  }

  const { error: memberError } = await context.supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: context.userId,
      role: "owner",
    });

  if (memberError) {
    throw memberError;
  }

  await context.supabase.from("activity_log").insert({
    organization_id: organizationId,
    user_id: context.userId,
    action: "organization_bootstrapped",
    description: "Första hubborganisationen skapades automatiskt.",
  });

  return organizationId;
}

export const requireHubContext = cache(async (): Promise<HubContext> => {
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
    throw membershipQuery.error ?? new Error("Kunde inte läsa hubbkontext.");
  }

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
  const { supabase } = await requireHubContext();

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
    .select("*")
    .eq("organization_id", organization.id)
    .not("follow_up_date", "is", null)
    .lte("follow_up_date", new Date().toISOString().slice(0, 10))
    .order("follow_up_date", { ascending: true })
    .limit(5);

  if (!isOwnerLevel) {
    followUpCustomersQuery = followUpCustomersQuery.eq(
      "visibility",
      "organization",
    );

    if (organization.employee_customer_scope === "assigned_only") {
      followUpCustomersQuery = followUpCustomersQuery.or(
        `created_by.eq.${user.id},owner_user_id.eq.${user.id}`,
      );
    }
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
      .select("*")
      .eq("organization_id", organization.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("invoices")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("documents")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_log")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(6),
    followUpCustomersQuery,
  ]);

  const tasks = tasksResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const documents = documentsResult.data ?? [];
  const activity = activityResult.data ?? [];
  const followUpCustomers = followUpCustomersResult.data ?? [];

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
  };
}

export async function getCustomers() {
  const { supabase, organization, membership, user } = await requireHubContext();
  const isOwnerLevel = ["owner", "admin"].includes(membership.role);
  let query = supabase
    .from("customers")
    .select("*")
    .eq("organization_id", organization.id)
    .order("follow_up_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!isOwnerLevel) {
    query = query.eq("visibility", "organization");

    if (organization.employee_customer_scope === "assigned_only") {
      query = query.or(`created_by.eq.${user.id},owner_user_id.eq.${user.id}`);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCustomerDetail(customerId: string) {
  const { supabase, organization, membership, user } = await requireHubContext();

  const [customerResult, contactsResult, tasksResult, invoicesResult, documentsResult] =
    await Promise.all([
      supabase
        .from("customers")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("id", customerId)
        .single(),
      supabase
        .from("contacts")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("invoices")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
    ]);

  if (customerResult.error) {
    throw customerResult.error;
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
    customer,
    contacts: contactsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    documents: await attachSignedUrls(
      supabase,
      documentsResult.data ?? []
    ),
  };
}

export async function getTasks(filters?: {
  status?: string | null;
  due?: string | null;
}) {
  const { supabase, organization } = await requireHubContext();
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", organization.id)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (filters?.status) {
    query = query.eq("status", filters.status as Task["status"]);
  }

  if (filters?.due === "overdue") {
    query = query.lt("due_date", new Date().toISOString().slice(0, 10));
  }

  if (filters?.due === "upcoming") {
    query = query.gte("due_date", new Date().toISOString().slice(0, 10));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
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

  return tasks.map((task) => ({
    ...task,
    customers: task.customer_id ? customerMap.get(task.customer_id) ?? null : null,
  }));
}

export async function getDocuments() {
  const { supabase, organization } = await requireHubContext();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
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

  return attachSignedUrls(
    supabase,
    documents.map((document) => ({
      ...document,
      customers: document.customer_id
        ? customerMap.get(document.customer_id) ?? null
        : null,
      invoices: document.invoice_id
        ? invoiceMap.get(document.invoice_id) ?? null
        : null,
    }))
  );
}

export async function getInvoices() {
  const { supabase, organization } = await requireHubContext();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
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

  return invoices.map((invoice) => ({
    ...invoice,
    customers: invoice.customer_id
      ? customerMap.get(invoice.customer_id) ?? null
      : null,
  }));
}

export async function getInvoiceDetail(invoiceId: string) {
  const { supabase, organization } = await requireHubContext();
  const [invoiceResult, lineResult, documentsResult] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("id", invoiceId)
      .single(),
    supabase
      .from("invoice_lines")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("invoice_id", invoiceId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("documents")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false }),
  ]);

  if (invoiceResult.error) {
    throw invoiceResult.error;
  }

  let customer:
    | {
        id: string;
        company_name: string;
      }
    | null = null;

  if (invoiceResult.data.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("id, company_name")
      .eq("organization_id", organization.id)
      .eq("id", invoiceResult.data.customer_id)
      .maybeSingle();

    customer = data ?? null;
  }

  return {
    invoice: {
      ...invoiceResult.data,
      customers: customer,
    },
    lines: lineResult.data ?? [],
    documents: await attachSignedUrls(supabase, documentsResult.data ?? []),
  };
}

export async function getSettingsData() {
  const { supabase, organization } = await requireHubContext();
  const [membersResult, emailConnectionsResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("email_connections")
      .select("*")
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
      .order("company_name", { ascending: true }),
    supabase
      .from("invoices")
      .select("id, invoice_number")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false }),
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
  documents: T[]
) {
  const results = await Promise.all(
    documents.map(async (document) => {
      const { data } = await supabase.storage
        .from(HUB_DOCUMENTS_BUCKET)
        .createSignedUrl(document.file_path, 60 * 30);

      return {
        ...document,
        signedUrl: data?.signedUrl ?? null,
      };
    })
  );

  return results;
}

export async function uploadHubFile(params: {
  file: File;
  organizationId: string;
  customerId?: string | null;
}) {
  const { supabase } = await requireHubContext();
  const fileId = randomUUID();
  const filePath = buildDocumentPath({
    organizationId: params.organizationId,
    customerId: params.customerId,
    fileId,
    fileName: params.file.name,
  });

  const { error } = await supabase.storage
    .from(HUB_DOCUMENTS_BUCKET)
    .upload(filePath, params.file, {
      upsert: false,
      contentType: params.file.type || "application/octet-stream",
    });

  if (error) {
    throw error;
  }

  return { fileId, filePath };
}

export async function uploadHubBuffer(params: {
  bytes: Uint8Array<ArrayBufferLike>;
  fileName: string;
  contentType: string;
  organizationId: string;
  customerId?: string | null;
}) {
  const { supabase } = await requireHubContext();
  const fileId = randomUUID();
  const filePath = buildDocumentPath({
    organizationId: params.organizationId,
    customerId: params.customerId,
    fileId,
    fileName: params.fileName,
  });

  const { error } = await supabase.storage
    .from(HUB_DOCUMENTS_BUCKET)
    .upload(filePath, params.bytes, {
      upsert: true,
      contentType: params.contentType,
    });

  if (error) {
    throw error;
  }

  return { fileId, filePath };
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
  contacts: Contact[];
  tasks: Task[];
  invoices: Invoice[];
  documents: Array<DocumentRecord & { signedUrl: string | null }>;
};

export type HubActivity = ActivityLog;
