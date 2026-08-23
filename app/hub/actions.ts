"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CustomerStatus,
  CustomerVisibility,
  DocumentCategory,
  EmployeeCustomerScope,
  HubTheme,
  InvoiceRow,
  InvoiceStatus,
  PreferredContactMethod,
  TaskPriority,
  TaskStatus,
} from "@/src/lib/supabase";
import { buildInvoicePdf } from "@/src/lib/invoice-pdf";
import { hubFeatureFlags } from "@/src/lib/hub/feature-flags";
import { normalizeIdempotencyKey } from "@/src/lib/hub/idempotency";
import { assertSafeHubServerEnvironment } from "@/src/lib/hub/runtime-environment-server";
import { calculateSha256 } from "@/src/lib/hub/providers/supabase-storage-provider";
import {
  HUB_MAX_FILE_SIZE_BYTES,
  buildOrganizationAddressLines,
  customerFieldKeys,
  parseOptionalDate,
  parseOptionalNumber,
  parseOptionalString,
} from "@/src/lib/hub";
import {
  createOrganizationForUser,
  getInvoicePdfData,
  getHubLists,
  logHubActivity,
  requireHubContext,
  uploadHubBuffer,
  uploadHubFile,
} from "@/src/lib/hub-server";

function requireString(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value.trim();
}

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

type HubOperationResult = {
  outcome: "start" | "retry" | "replay" | "in_progress";
  resultEntityId?: string | null;
  invoiceNumber?: string | null;
  storageKey?: string | null;
};

function parseHubOperationResult(value: unknown): HubOperationResult {
  if (!value || typeof value !== "object" || !("outcome" in value)) {
    throw new Error("Databasen returnerade ett ogiltigt processvar.");
  }

  const outcome = (value as { outcome: unknown }).outcome;
  if (
    typeof outcome !== "string" ||
    !["start", "retry", "replay", "in_progress"].includes(outcome)
  ) {
    throw new Error("Databasen returnerade ett okänt processläge.");
  }

  return value as HubOperationResult;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? "Dokumenthanteringen misslyckades."
    : "Ett okänt fel inträffade.";
}

async function completeHubOperation(params: {
  supabase: Awaited<ReturnType<typeof requireHubContext>>["supabase"];
  organizationId: string;
  operation: "upload_document";
  key: string;
  entityType: string;
  entityId: string;
}) {
  const { error } = await params.supabase.rpc(
    "complete_hub_idempotent_operation",
    {
      target_organization_id: params.organizationId,
      target_operation: params.operation,
      target_key: params.key,
      target_result_entity_type: params.entityType,
      target_result_entity_id: params.entityId,
    },
  );

  if (error) throw new Error("Dokumentprocessen kunde inte slutföras.");
}

async function failHubOperation(params: {
  supabase: Awaited<ReturnType<typeof requireHubContext>>["supabase"];
  organizationId: string;
  operation: "upload_document";
  key: string;
  error: unknown;
}) {
  await params.supabase.rpc("fail_hub_idempotent_operation", {
    target_organization_id: params.organizationId,
    target_operation: params.operation,
    target_key: params.key,
    target_error_message: errorMessage(params.error),
  });
}

async function getInvoiceForMutation(params: {
  invoiceId: string;
  organizationId: string;
}) {
  const { supabase } = await requireHubContext();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, organization_id, customer_id, invoice_number, status, paid_at, locked_at",
    )
    .eq("organization_id", params.organizationId)
    .eq("id", params.invoiceId)
    .single();

  if (error || !data) {
    throw new Error("Fakturan kunde inte hittas i det aktiva företaget.");
  }

  return data;
}

async function requireCustomerInOrganization(params: {
  customerId: string;
  organizationId: string;
}) {
  const { supabase } = await requireHubContext();
  const { data, error } = await supabase
    .from("customers")
    .select("id, company_name, address, email")
    .eq("organization_id", params.organizationId)
    .eq("id", params.customerId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Kunden kunde inte hittas i det aktiva företaget.");
  }

  return data;
}

async function requireMemberInOrganization(params: {
  userId: string;
  organizationId: string;
}) {
  const { supabase } = await requireHubContext();
  const { data, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Användaren kunde inte hittas i det aktiva företaget.");
  }
}

function ensureInvoiceEditable(invoice: Pick<InvoiceRow, "status" | "locked_at">) {
  if (invoice.status !== "draft" || invoice.locked_at) {
    throw new Error("Fakturan är låst och kan inte längre redigeras.");
  }
}

export async function saveCustomerAction(formData: FormData) {
  const { supabase, organization, membership, user } = await requireHubContext();
  const customerId = parseOptionalString(formData.get("customer_id"));
  const canSetPrivateVisibility = ["owner", "admin"].includes(membership.role);
  const requestedVisibility =
    (parseOptionalString(formData.get("visibility")) as CustomerVisibility | null) ??
    "organization";
  const ownerUserId =
    parseOptionalString(formData.get("owner_user_id")) ?? user.id;

  await requireMemberInOrganization({
    userId: ownerUserId,
    organizationId: organization.id,
  });

  const payload = {
    organization_id: organization.id,
    owner_user_id: ownerUserId,
    visibility: canSetPrivateVisibility ? requestedVisibility : "organization",
    company_name: requireString(formData.get("company_name"), "Företagsnamn"),
    org_number: parseOptionalString(formData.get("org_number")),
    contact_name: parseOptionalString(formData.get("contact_name")),
    email: parseOptionalString(formData.get("email")),
    phone: parseOptionalString(formData.get("phone")),
    address: parseOptionalString(formData.get("address")),
    preferred_contact_method:
      (parseOptionalString(
        formData.get("preferred_contact_method"),
      ) as PreferredContactMethod | null) ?? "email",
    last_contacted_at: parseOptionalDate(formData.get("last_contacted_at")),
    follow_up_date: parseOptionalDate(formData.get("follow_up_date")),
    relationship_owner: parseOptionalString(formData.get("relationship_owner")),
    tags: parseTags(formData.get("tags")),
    notes: parseOptionalString(formData.get("notes")),
    status:
      (parseOptionalString(formData.get("status")) as CustomerStatus | null) ??
      "lead",
  };

  const writePayload = customerId ? payload : { ...payload, created_by: user.id };

  const query = customerId
    ? supabase
        .from("customers")
        .update(writePayload)
        .eq("organization_id", organization.id)
        .eq("id", customerId)
    : supabase.from("customers").insert(writePayload);

  const { error, data } = customerId
    ? await query.select("id").single()
    : await query.select("id").single();

  if (error || !data) {
    throw new Error("Kunden kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: customerId ? "customer_updated" : "customer_created",
    entityType: "customer",
    entityId: data.id,
    description: `${payload.company_name} sparades i kundregistret.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/kunder");
  revalidatePath(`/hub/kunder/${data.id}`);
}

export async function createOrganizationOnboardingAction(formData: FormData) {
  assertSafeHubServerEnvironment();
  const { createSupabaseServerClient } = await import("@/src/lib/supabase-server");
  const serverClient = await createSupabaseServerClient();

  if (!serverClient) {
    redirect("/hub/login");
  }

  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const { data: membership } = await serverClient
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect("/hub");
  }

  const companyName = requireString(formData.get("company_name"), "Företagsnamn");
  const orgNumber = parseOptionalString(formData.get("org_number"));

  await createOrganizationForUser({
    supabase: serverClient,
    email: user.email ?? null,
    fullName:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      null,
    organizationName: companyName,
    orgNumber,
  });

  redirect("/hub/installningar");
}

export async function saveContactAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const customerId = requireString(formData.get("customer_id"), "Kund");
  await requireCustomerInOrganization({
    customerId,
    organizationId: organization.id,
  });
  const payload = {
    organization_id: organization.id,
    customer_id: customerId,
    name: requireString(formData.get("name"), "Kontaktperson"),
    email: parseOptionalString(formData.get("email")),
    phone: parseOptionalString(formData.get("phone")),
    role_title: parseOptionalString(formData.get("role_title")),
    notes: parseOptionalString(formData.get("notes")),
  };

  const { error, data } = await supabase
    .from("contacts")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Kontakten kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "contact_created",
    entityType: "contact",
    entityId: data.id,
    description: `${payload.name} lades till som kontakt.`,
  });

  revalidatePath(`/hub/kunder/${customerId}`);
}

export async function saveTaskAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const taskId = parseOptionalString(formData.get("task_id"));
  const payload = {
    organization_id: organization.id,
    title: requireString(formData.get("title"), "Titel"),
    description: parseOptionalString(formData.get("description")),
    status:
      (parseOptionalString(formData.get("status")) as TaskStatus | null) ??
      "todo",
    priority:
      (parseOptionalString(formData.get("priority")) as TaskPriority | null) ??
      "medium",
    due_date: parseOptionalDate(formData.get("due_date")),
    customer_id: parseOptionalString(formData.get("customer_id")),
    assigned_to: parseOptionalString(formData.get("assigned_to")),
  };

  if (payload.customer_id) {
    await requireCustomerInOrganization({
      customerId: payload.customer_id,
      organizationId: organization.id,
    });
  }

  if (payload.assigned_to) {
    await requireMemberInOrganization({
      userId: payload.assigned_to,
      organizationId: organization.id,
    });
  }

  const query = taskId
    ? supabase
        .from("tasks")
        .update(payload)
        .eq("organization_id", organization.id)
        .eq("id", taskId)
    : supabase.from("tasks").insert(payload);

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    throw new Error("Uppgiften kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: taskId ? "task_updated" : "task_created",
    entityType: "task",
    entityId: data.id,
    description: `${payload.title} sparades i uppgiftslistan.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/uppgifter");

  if (payload.customer_id) {
    revalidatePath(`/hub/kunder/${payload.customer_id}`);
  }
}

export async function saveInvoiceAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = parseOptionalString(formData.get("invoice_id"));
  const customerId = parseOptionalString(formData.get("customer_id"));
  const issueDate =
    parseOptionalDate(formData.get("issue_date")) ??
    new Date().toISOString().slice(0, 10);
  const defaultDueDate = new Date(issueDate);
  defaultDueDate.setDate(defaultDueDate.getDate() + organization.payment_terms_days);

  if (invoiceId) {
    const existingInvoice = await getInvoiceForMutation({
      invoiceId,
      organizationId: organization.id,
    });
    ensureInvoiceEditable(existingInvoice);
  }

  let customerSnapshot = {
    customer_name_snapshot: null as string | null,
    customer_address_snapshot: null as string | null,
    customer_email_snapshot: null as string | null,
  };

  if (customerId) {
    const customer = await requireCustomerInOrganization({
      customerId,
      organizationId: organization.id,
    });

    customerSnapshot = {
      customer_name_snapshot: customer?.company_name ?? null,
      customer_address_snapshot: customer?.address ?? null,
      customer_email_snapshot: customer?.email ?? null,
    };
  }

  const payload = {
    organization_id: organization.id,
    customer_id: customerId,
    status: "draft" as const,
    issue_date: issueDate,
    due_date:
      parseOptionalDate(formData.get("due_date")) ??
      defaultDueDate.toISOString().slice(0, 10),
    currency: parseOptionalString(formData.get("currency")) ?? "SEK",
    notes: parseOptionalString(formData.get("notes")),
    ...customerSnapshot,
  };

  let savedInvoiceId = invoiceId;

  if (invoiceId) {
    const { data, error } = await supabase
      .from("invoices")
      .update(payload)
      .eq("organization_id", organization.id)
      .eq("id", invoiceId)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error("Fakturan kunde inte sparas.");
    }
  } else {
    savedInvoiceId = randomUUID();
    const { error } = await supabase.from("invoices").insert({
      id: savedInvoiceId,
      ...payload,
    });

    if (error) {
      throw new Error("Fakturan kunde inte sparas.");
    }
  }

  if (!savedInvoiceId) {
    throw new Error("Fakturan kunde inte identifieras efter sparning.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: invoiceId ? "invoice_updated" : "invoice_created",
    entityType: "invoice",
    entityId: savedInvoiceId,
    description: `Faktura ${invoiceId ? "utkast" : "utan nummer"} sparades.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/fakturor");
  revalidatePath(`/hub/fakturor/${savedInvoiceId}`);

  if (!invoiceId) {
    redirect(`/hub/fakturor/${savedInvoiceId}`);
  }
}

export async function saveInvoiceLineAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = requireString(formData.get("invoice_id"), "Faktura");
  const lineId = parseOptionalString(formData.get("line_id"));
  const invoice = await getInvoiceForMutation({
    invoiceId,
    organizationId: organization.id,
  });
  ensureInvoiceEditable(invoice);
  const payload = {
    organization_id: organization.id,
    invoice_id: invoiceId,
    description: requireString(formData.get("description"), "Beskrivning"),
    quantity: parseOptionalNumber(formData.get("quantity")) ?? 1,
    unit_price: parseOptionalNumber(formData.get("unit_price")) ?? 0,
    vat_rate: parseOptionalNumber(formData.get("vat_rate")) ?? 25,
    sort_order: Number(parseOptionalNumber(formData.get("sort_order")) ?? 0),
  };

  const query = lineId
    ? supabase
        .from("invoice_lines")
        .update(payload)
        .eq("organization_id", organization.id)
        .eq("invoice_id", invoiceId)
        .eq("id", lineId)
    : supabase.from("invoice_lines").insert(payload);

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    throw new Error("Fakturaraden kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: lineId ? "invoice_line_updated" : "invoice_line_created",
    entityType: "invoice_line",
    entityId: data.id,
    description: `Fakturarad "${payload.description}" sparades.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/fakturor");
  revalidatePath(`/hub/fakturor/${invoiceId}`);
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = requireString(formData.get("invoice_id"), "Faktura");
  const status = requireString(
    formData.get("status"),
    "Status"
  ) as InvoiceStatus;
  const invoice = await getInvoiceForMutation({
    invoiceId,
    organizationId: organization.id,
  });

  if (status === "sent" && invoice.status === "draft") {
    throw new Error("Slutför fakturan innan den kan markeras som skickad.");
  }

  if (invoice.status === "draft" && status !== "cancelled") {
    throw new Error("Utkast måste slutföras innan status kan ändras.");
  }

  const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    draft: ["cancelled"],
    sent: ["sent", "paid", "overdue", "cancelled"],
    paid: ["paid"],
    overdue: ["overdue", "paid", "cancelled"],
    cancelled: ["cancelled"],
  };

  if (!allowedTransitions[invoice.status].includes(status)) {
    throw new Error("Den statusändringen är inte tillåten.");
  }

  const timestamp = new Date().toISOString();

  const { error } = await supabase
    .from("invoices")
    .update({
      status,
      paid_at: status === "paid" ? timestamp : invoice.paid_at,
    })
    .eq("organization_id", organization.id)
    .eq("id", invoiceId);

  if (error) {
    throw new Error("Fakturastatusen kunde inte uppdateras.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "invoice_status_updated",
    entityType: "invoice",
    entityId: invoiceId,
    description: `Fakturastatus ändrades till ${status}.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/fakturor");
  revalidatePath(`/hub/fakturor/${invoiceId}`);
}

async function finalizeInvoiceWithResumableWorkflow(params: {
  supabase: Awaited<ReturnType<typeof requireHubContext>>["supabase"];
  organizationId: string;
  customerId: string;
  invoiceId: string;
  userId: string;
  idempotencyKey: string;
}) {
  const { data, error } = await params.supabase.rpc(
    "begin_invoice_finalization",
    {
      target_organization_id: params.organizationId,
      target_invoice_id: params.invoiceId,
      target_idempotency_key: params.idempotencyKey,
    },
  );

  if (error) throw new Error("Fakturaprocessen kunde inte startas.");
  const operation = parseHubOperationResult(data);

  if (operation.outcome === "replay") {
    return { invoiceNumber: operation.invoiceNumber ?? "", replayed: true };
  }

  if (operation.outcome === "in_progress") {
    throw new Error("Fakturan håller redan på att slutföras.");
  }

  if (!operation.invoiceNumber || !operation.storageKey) {
    throw new Error("Fakturan saknar reserverat nummer eller lagringsnyckel.");
  }

  try {
    const pdfData = await getInvoicePdfData(params.invoiceId);
    const generatedAt = new Date().toISOString();
    const pdfBytes = buildInvoicePdf({
      organization: pdfData.organization,
      organizationAddressLines: buildOrganizationAddressLines(
        pdfData.organization,
      ),
      invoice: {
        ...pdfData.invoice,
        invoice_number: operation.invoiceNumber,
        finalized_at: generatedAt,
      },
      lines: pdfData.lines,
    });
    const pdfFileName = `${operation.invoiceNumber}.pdf`;
    const pdfLookup = await params.supabase
      .from("documents")
      .select("id")
      .eq("organization_id", params.organizationId)
      .eq("invoice_id", params.invoiceId)
      .eq("idempotency_key", params.idempotencyKey)
      .maybeSingle();

    if (pdfLookup.error) throw pdfLookup.error;
    let pdfDocument = pdfLookup.data;

    if (!pdfDocument) {
      const uploaded = await uploadHubBuffer({
        bytes: pdfBytes,
        fileName: pdfFileName,
        contentType: "application/pdf",
        organizationId: params.organizationId,
        customerId: params.customerId,
        filePath: operation.storageKey,
        resumeExisting: true,
      });
      const insertResult = await params.supabase
        .from("documents")
        .insert({
          organization_id: params.organizationId,
          customer_id: params.customerId,
          invoice_id: params.invoiceId,
          file_name: pdfFileName,
          file_path: uploaded.filePath,
          original_storage_key: uploaded.filePath,
          mime_type: "application/pdf",
          size_bytes: pdfBytes.byteLength,
          sha256: uploaded.sha256,
          document_type: "invoice_pdf",
          processing_status: "ready",
          retention_locked: true,
          idempotency_key: params.idempotencyKey,
          category: "other",
          notes: "Automatiskt genererad faktura-PDF.",
          uploaded_by: params.userId,
        })
        .select("id")
        .single();

      if (insertResult.error || !insertResult.data) {
        throw new Error("Faktura-PDF:en kunde inte registreras.");
      }

      pdfDocument = insertResult.data;
    }

    const { error: completeError } = await params.supabase.rpc(
      "complete_invoice_finalization",
      {
        target_organization_id: params.organizationId,
        target_invoice_id: params.invoiceId,
        target_idempotency_key: params.idempotencyKey,
        target_document_id: pdfDocument.id,
      },
    );

    if (completeError) {
      throw new Error("Fakturaprocessen kunde inte slutföras.");
    }
    return { invoiceNumber: operation.invoiceNumber, replayed: false };
  } catch (workflowError) {
    await params.supabase.rpc("fail_invoice_finalization", {
      target_organization_id: params.organizationId,
      target_invoice_id: params.invoiceId,
      target_idempotency_key: params.idempotencyKey,
      target_error_message: errorMessage(workflowError),
    });
    throw new Error("Fakturaprocessen misslyckades och kan återupptas senare.");
  }
}

export async function finalizeInvoiceAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = requireString(formData.get("invoice_id"), "Faktura");
  const idempotencyKey = normalizeIdempotencyKey(
    requireString(formData.get("idempotency_key"), "Idempotensnyckel"),
  );
  const invoice = await getInvoiceForMutation({
    invoiceId,
    organizationId: organization.id,
  });

  ensureInvoiceEditable(invoice);

  if (!invoice.customer_id) {
    throw new Error("Välj kund innan fakturan kan slutföras.");
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, company_name, address, email")
    .eq("organization_id", organization.id)
    .eq("id", invoice.customer_id)
    .single();

  if (customerError || !customer) {
    throw new Error("Kunden kunde inte läsas.");
  }

  const { data: lines, error: linesError } = await supabase
    .from("invoice_lines")
    .select(
      "id, organization_id, invoice_id, description, quantity, unit_price, vat_rate, line_subtotal, line_vat, line_total, sort_order, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true });

  if (linesError) {
    throw new Error("Fakturaraderna kunde inte läsas.");
  }

  if (!lines?.length) {
    throw new Error("Lägg till minst en fakturarad innan fakturan slutförs.");
  }

  const hasAddress =
    Boolean(organization.address_line_1?.trim()) ||
    Boolean(organization.address?.trim());
  const hasPaymentDetails = Boolean(
    organization.bankgiro ||
      organization.plusgiro ||
      organization.bank_account ||
      organization.swish_number ||
      organization.payment_instructions
  );

  if (!organization.org_number?.trim()) {
    throw new Error("Lägg till organisationsnummer i inställningarna först.");
  }

  if (!hasAddress) {
    throw new Error("Lägg till företagets adress i inställningarna först.");
  }

  if (!hasPaymentDetails) {
    throw new Error("Lägg till betalningsuppgifter i inställningarna först.");
  }

  if (hubFeatureFlags.safeMutations) {
    const finalization = await finalizeInvoiceWithResumableWorkflow({
      supabase,
      organizationId: organization.id,
      customerId: invoice.customer_id,
      invoiceId,
      userId: user.id,
      idempotencyKey,
    });

    if (!finalization.replayed) {
      await logHubActivity({
        organizationId: organization.id,
        userId: user.id,
        action: "invoice_finalized",
        entityType: "invoice",
        entityId: invoiceId,
        description: `Faktura ${finalization.invoiceNumber} slutfördes och PDF skapades.`,
      });
    }

    revalidatePath("/hub");
    revalidatePath("/hub/fakturor");
    revalidatePath(`/hub/fakturor/${invoiceId}`);
    revalidatePath("/hub/dokument");
    return;
  }

  let invoiceNumber = invoice.invoice_number;

  if (!invoiceNumber) {
    const { data, error } = await supabase.rpc("claim_next_invoice_number", {
      target_organization_id: organization.id,
    });

    if (error) {
      throw new Error("Ett fakturanummer kunde inte reserveras.");
    }

    invoiceNumber = data;

    const reservation = await supabase
      .from("invoices")
      .update({ invoice_number: invoiceNumber })
      .eq("organization_id", organization.id)
      .eq("id", invoiceId)
      .eq("status", "draft")
      .is("locked_at", null)
      .is("invoice_number", null)
      .select("invoice_number")
      .maybeSingle();

    if (reservation.error) throw reservation.error;

    if (!reservation.data) {
      const reservedInvoice = await getInvoiceForMutation({
        invoiceId,
        organizationId: organization.id,
      });
      ensureInvoiceEditable(reservedInvoice);
      invoiceNumber = reservedInvoice.invoice_number;
    }
  }

  if (!invoiceNumber) {
    throw new Error("Kunde inte reservera ett fakturanummer.");
  }

  const finalizedAt = new Date().toISOString();
  const pdfData = await getInvoicePdfData(invoiceId);
  const pdfBytes = buildInvoicePdf({
    organization: pdfData.organization,
    organizationAddressLines: buildOrganizationAddressLines(pdfData.organization),
    invoice: {
      ...pdfData.invoice,
      invoice_number: invoiceNumber,
      status: "sent",
      finalized_at: finalizedAt,
      sent_at: finalizedAt,
      locked_at: finalizedAt,
    },
    lines: pdfData.lines,
  });

  const pdfFileName = `${invoiceNumber}.pdf`;
  const uploaded = await uploadHubBuffer({
    bytes: pdfBytes,
    fileName: pdfFileName,
    contentType: "application/pdf",
    organizationId: organization.id,
    customerId: invoice.customer_id,
    fileId: idempotencyKey,
    resumeExisting: true,
  });

  const { data: existingPdfDocument, error: pdfLookupError } = await supabase
    .from("documents")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("invoice_id", invoiceId)
    .eq("file_path", uploaded.filePath)
    .maybeSingle();

  if (pdfLookupError) throw new Error("Faktura-PDF:en kunde inte kontrolleras.");

  let pdfDocument = existingPdfDocument;

  if (!pdfDocument) {
    const pdfDocumentResult = await supabase
      .from("documents")
      .insert({
        organization_id: organization.id,
        customer_id: invoice.customer_id,
        invoice_id: invoiceId,
        file_name: pdfFileName,
        file_path: uploaded.filePath,
        mime_type: "application/pdf",
        size_bytes: pdfBytes.byteLength,
        category: "other",
        notes: "Automatiskt genererad faktura-PDF.",
        uploaded_by: user.id,
      })
      .select("id")
      .single();

    if (pdfDocumentResult.error || !pdfDocumentResult.data) {
      throw (
        pdfDocumentResult.error ?? new Error("Kunde inte spara faktura-PDF.")
      );
    }

    pdfDocument = pdfDocumentResult.data;
  }

  const { error: finalizeError, data: finalizedInvoice } = await supabase
    .from("invoices")
    .update({
      invoice_number: invoiceNumber,
      status: "sent",
      customer_name_snapshot: customer.company_name,
      customer_address_snapshot: customer.address,
      customer_email_snapshot: customer.email,
      finalized_at: finalizedAt,
      sent_at: finalizedAt,
      locked_at: finalizedAt,
      pdf_document_id: pdfDocument.id,
    })
    .eq("organization_id", organization.id)
    .eq("id", invoiceId)
    .eq("status", "draft")
    .is("locked_at", null)
    .select("id")
    .single();

  if (finalizeError || !finalizedInvoice) {
    throw new Error("Fakturan kunde inte slutföras.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "invoice_finalized",
    entityType: "invoice",
    entityId: invoiceId,
    description: `Faktura ${invoiceNumber} slutfördes och PDF skapades.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/fakturor");
  revalidatePath(`/hub/fakturor/${invoiceId}`);
  revalidatePath("/hub/dokument");
}

async function uploadDocumentWithIdempotency(params: {
  supabase: Awaited<ReturnType<typeof requireHubContext>>["supabase"];
  organizationId: string;
  userId: string;
  file: File;
  customerId: string | null;
  invoiceId: string | null;
  category: DocumentCategory;
  notes: string | null;
  idempotencyKey: string;
}) {
  const sha256 = await calculateSha256(params.file);
  const requestHash = [
    sha256,
    params.customerId ?? "",
    params.invoiceId ?? "",
    params.category,
  ].join(":");
  const beginResult = await params.supabase.rpc(
    "begin_hub_idempotent_operation",
    {
      target_organization_id: params.organizationId,
      target_operation: "upload_document",
      target_key: params.idempotencyKey,
      target_request_hash: requestHash,
    },
  );

  if (beginResult.error) {
    throw new Error("Dokumentprocessen kunde inte startas.");
  }
  const operation = parseHubOperationResult(beginResult.data);

  if (operation.outcome === "replay" && operation.resultEntityId) {
    return { id: operation.resultEntityId, created: false };
  }

  if (operation.outcome === "in_progress") {
    throw new Error("Samma dokumentuppladdning behandlas redan.");
  }

  try {
    const duplicateResult = await params.supabase
      .from("documents")
      .select("id")
      .eq("organization_id", params.organizationId)
      .eq("sha256", sha256)
      .maybeSingle();

    if (duplicateResult.error) {
      throw new Error("Dokumentarkivet kunde inte kontrolleras.");
    }

    if (duplicateResult.data) {
      await completeHubOperation({
        supabase: params.supabase,
        organizationId: params.organizationId,
        operation: "upload_document",
        key: params.idempotencyKey,
        entityType: "document",
        entityId: duplicateResult.data.id,
      });
      return { id: duplicateResult.data.id, created: false };
    }

    const uploaded = await uploadHubFile({
      file: params.file,
      organizationId: params.organizationId,
      customerId: params.customerId,
      fileId: params.idempotencyKey,
      resumeExisting: true,
    });
    const insertResult = await params.supabase
      .from("documents")
      .insert({
        organization_id: params.organizationId,
        customer_id: params.customerId,
        invoice_id: params.invoiceId,
        file_name: params.file.name,
        file_path: uploaded.filePath,
        original_storage_key: uploaded.filePath,
        mime_type: params.file.type || null,
        size_bytes: params.file.size,
        sha256: uploaded.sha256,
        document_type: "original",
        processing_status: "not_required",
        retention_locked: false,
        idempotency_key: params.idempotencyKey,
        category: params.category,
        notes: params.notes,
        uploaded_by: params.userId,
      })
      .select("id")
      .single();

    let documentId = insertResult.data?.id ?? null;

    if (insertResult.error?.code === "23505") {
      const { data: duplicate } = await params.supabase
        .from("documents")
        .select("id")
        .eq("organization_id", params.organizationId)
        .eq("sha256", sha256)
        .maybeSingle();
      documentId = duplicate?.id ?? null;
    } else if (insertResult.error) {
      throw new Error("Dokumentets metadata kunde inte registreras.");
    }

    if (!documentId) {
      throw new Error("Kunde inte registrera dokumentets metadata.");
    }

    await completeHubOperation({
      supabase: params.supabase,
      organizationId: params.organizationId,
      operation: "upload_document",
      key: params.idempotencyKey,
      entityType: "document",
      entityId: documentId,
    });

    return { id: documentId, created: Boolean(insertResult.data) };
  } catch (uploadError) {
    await failHubOperation({
      supabase: params.supabase,
      organizationId: params.organizationId,
      operation: "upload_document",
      key: params.idempotencyKey,
      error: uploadError,
    });
    throw new Error("Dokumentet kunde inte laddas upp.");
  }
}

export async function uploadDocumentAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Välj en fil att ladda upp.");
  }

  if (file.size > HUB_MAX_FILE_SIZE_BYTES) {
    throw new Error("Filen är för stor. Maxstorlek är 10 MB.");
  }

  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (file.type && !allowedMimeTypes.includes(file.type)) {
    throw new Error("Filtypen stöds inte ännu.");
  }

  const customerId = parseOptionalString(formData.get("customer_id"));
  const invoiceId = parseOptionalString(formData.get("invoice_id"));
  const category =
    (parseOptionalString(formData.get("category")) as DocumentCategory | null) ??
    "other";
  const notes = parseOptionalString(formData.get("notes"));

  if (customerId) {
    await requireCustomerInOrganization({
      customerId,
      organizationId: organization.id,
    });
  }

  if (invoiceId) {
    const invoice = await getInvoiceForMutation({
      invoiceId,
      organizationId: organization.id,
    });

    if (customerId && invoice.customer_id && invoice.customer_id !== customerId) {
      throw new Error("Fakturan och kunden hör inte ihop.");
    }
  }

  if (hubFeatureFlags.safeMutations) {
    const idempotencyKey = normalizeIdempotencyKey(
      requireString(formData.get("idempotency_key"), "Idempotensnyckel"),
    );
    const result = await uploadDocumentWithIdempotency({
      supabase,
      organizationId: organization.id,
      userId: user.id,
      file,
      customerId,
      invoiceId,
      category,
      notes,
      idempotencyKey,
    });

    if (result.created) {
      await logHubActivity({
        organizationId: organization.id,
        userId: user.id,
        action: "document_uploaded",
        entityType: "document",
        entityId: result.id,
        description: `${file.name} laddades upp till dokumentarkivet.`,
      });
    }

    revalidatePath("/hub");
    revalidatePath("/hub/dokument");
    if (customerId) revalidatePath(`/hub/kunder/${customerId}`);
    if (invoiceId) revalidatePath(`/hub/fakturor/${invoiceId}`);
    return;
  }

  const { filePath } = await uploadHubFile({
    file,
    organizationId: organization.id,
    customerId,
  });

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: organization.id,
      customer_id: customerId,
      invoice_id: invoiceId,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type || null,
      size_bytes: file.size,
      category,
      notes,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Dokumentet kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "document_uploaded",
    entityType: "document",
    entityId: data.id,
    description: `${file.name} laddades upp till dokumentarkivet.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/dokument");

  if (customerId) {
    revalidatePath(`/hub/kunder/${customerId}`);
  }

  if (invoiceId) {
    revalidatePath(`/hub/fakturor/${invoiceId}`);
  }
}

export async function updateOrganizationSettingsAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();

  const { error } = await supabase
    .from("organizations")
    .update({
      name: requireString(formData.get("name"), "Företagsnamn"),
      org_number: parseOptionalString(formData.get("org_number")),
      vat_number: parseOptionalString(formData.get("vat_number")),
      address: parseOptionalString(formData.get("address")),
      address_line_1: parseOptionalString(formData.get("address_line_1")),
      address_line_2: parseOptionalString(formData.get("address_line_2")),
      postal_code: parseOptionalString(formData.get("postal_code")),
      city: parseOptionalString(formData.get("city")),
      country: parseOptionalString(formData.get("country")),
      email: parseOptionalString(formData.get("email")),
      phone: parseOptionalString(formData.get("phone")),
      website: parseOptionalString(formData.get("website")),
      logo_url: parseOptionalString(formData.get("logo_url")),
      default_vat_rate: parseOptionalNumber(formData.get("default_vat_rate")) ?? 25,
      payment_terms_days:
        Number(parseOptionalNumber(formData.get("payment_terms_days")) ?? 30),
      invoice_prefix: requireString(formData.get("invoice_prefix"), "Fakturaprefix"),
      next_invoice_number:
        Number(parseOptionalNumber(formData.get("next_invoice_number")) ?? 1),
      bankgiro: parseOptionalString(formData.get("bankgiro")),
      plusgiro: parseOptionalString(formData.get("plusgiro")),
      bank_account: parseOptionalString(formData.get("bank_account")),
      iban: parseOptionalString(formData.get("iban")),
      swift_bic: parseOptionalString(formData.get("swift_bic")),
      swish_number: parseOptionalString(formData.get("swish_number")),
      payment_instructions: parseOptionalString(
        formData.get("payment_instructions")
      ),
      invoice_footer: parseOptionalString(formData.get("invoice_footer")),
      late_fee_terms: parseOptionalString(formData.get("late_fee_terms")),
      company_reference: parseOptionalString(formData.get("company_reference")),
      hub_theme:
        (parseOptionalString(formData.get("hub_theme")) as HubTheme | null) ??
        "nova",
      employee_customer_scope:
        (parseOptionalString(
          formData.get("employee_customer_scope"),
        ) as EmployeeCustomerScope | null) ?? "all_customers",
      customer_field_preferences: customerFieldKeys.filter((field) =>
        formData.getAll("customer_field_preferences").includes(field),
      ),
      follow_up_email_alerts_enabled: parseCheckbox(
        formData.get("follow_up_email_alerts_enabled"),
      ),
      follow_up_alert_email: parseOptionalString(
        formData.get("follow_up_alert_email"),
      ),
      follow_up_digest_weekday:
        Number(parseOptionalNumber(formData.get("follow_up_digest_weekday")) ?? 1),
    })
    .eq("id", organization.id);

  if (error) {
    throw new Error("Företagsinställningarna kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "organization_settings_updated",
    entityType: "organization",
    entityId: organization.id,
    description: "Organisationsinställningar uppdaterades.",
  });

  revalidatePath("/hub");
  revalidatePath("/hub/installningar");
}

export async function warmHubListsAction() {
  await getHubLists();
}

// TODO: Add Gmail and Outlook OAuth connection setup here when the integration
// architecture is defined and security review is completed.
// TODO: Add PDF generation service orchestration for invoices once a stable
// renderer strategy is selected for the existing stack.
// TODO: Add email sending workflow for invoices after provider integrations are
// in place and delivery logging is designed.
// TODO: Add bookkeeping export service layer (for example SIE/Fortnox/Bokio)
// after accounting requirements are finalized.
// TODO: Add AI assistant orchestration only after scoped prompts, audit trails
// and permission boundaries are implemented for organization data.
