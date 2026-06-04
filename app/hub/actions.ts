"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CustomerStatus,
  DocumentCategory,
  InvoiceStatus,
  TaskPriority,
  TaskStatus,
} from "@/src/lib/supabase";
import {
  HUB_MAX_FILE_SIZE_BYTES,
  parseOptionalDate,
  parseOptionalNumber,
  parseOptionalString,
} from "@/src/lib/hub";
import {
  getHubLists,
  logHubActivity,
  requireHubContext,
  uploadHubFile,
} from "@/src/lib/hub-server";

function requireString(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value.trim();
}

export async function saveCustomerAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const customerId = parseOptionalString(formData.get("customer_id"));
  const payload = {
    organization_id: organization.id,
    company_name: requireString(formData.get("company_name"), "Företagsnamn"),
    org_number: parseOptionalString(formData.get("org_number")),
    contact_name: parseOptionalString(formData.get("contact_name")),
    email: parseOptionalString(formData.get("email")),
    phone: parseOptionalString(formData.get("phone")),
    address: parseOptionalString(formData.get("address")),
    notes: parseOptionalString(formData.get("notes")),
    status:
      (parseOptionalString(formData.get("status")) as CustomerStatus | null) ??
      "active",
  };

  const query = customerId
    ? supabase.from("customers").update(payload).eq("id", customerId)
    : supabase.from("customers").insert(payload);

  const { error, data } = customerId
    ? await query.select("id").single()
    : await query.select("id").single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte spara kund.");
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

export async function saveContactAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const customerId = requireString(formData.get("customer_id"), "Kund");
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
    throw error ?? new Error("Kunde inte spara kontakt.");
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

  const query = taskId
    ? supabase.from("tasks").update(payload).eq("id", taskId)
    : supabase.from("tasks").insert(payload);

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte spara uppgift.");
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
  let customerSnapshot = {
    customer_name_snapshot: null as string | null,
    customer_address_snapshot: null as string | null,
    customer_email_snapshot: null as string | null,
  };

  if (customerId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("company_name, address, email")
      .eq("organization_id", organization.id)
      .eq("id", customerId)
      .single();

    customerSnapshot = {
      customer_name_snapshot: customer?.company_name ?? null,
      customer_address_snapshot: customer?.address ?? null,
      customer_email_snapshot: customer?.email ?? null,
    };
  }

  const payload = {
    organization_id: organization.id,
    customer_id: customerId,
    status:
      (parseOptionalString(formData.get("status")) as InvoiceStatus | null) ??
      "draft",
    issue_date:
      parseOptionalDate(formData.get("issue_date")) ??
      new Date().toISOString().slice(0, 10),
    due_date: parseOptionalDate(formData.get("due_date")),
    currency: parseOptionalString(formData.get("currency")) ?? "SEK",
    notes: parseOptionalString(formData.get("notes")),
    ...customerSnapshot,
  };

  let invoiceNumber = parseOptionalString(formData.get("invoice_number"));

  if (!invoiceId && !invoiceNumber) {
    const { data, error } = await supabase.rpc("claim_next_invoice_number", {
      target_organization_id: organization.id,
    });

    if (error) {
      throw error;
    }

    invoiceNumber = data;
  }

  const query = invoiceId
    ? supabase
        .from("invoices")
        .update({ ...payload, invoice_number: invoiceNumber })
        .eq("id", invoiceId)
    : supabase
        .from("invoices")
        .insert({ ...payload, invoice_number: invoiceNumber });

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte spara faktura.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: invoiceId ? "invoice_updated" : "invoice_created",
    entityType: "invoice",
    entityId: data.id,
    description: `Faktura ${invoiceNumber ?? "utan nummer"} sparades.`,
  });

  revalidatePath("/hub");
  revalidatePath("/hub/fakturor");
  revalidatePath(`/hub/fakturor/${data.id}`);

  if (!invoiceId) {
    redirect(`/hub/fakturor/${data.id}`);
  }
}

export async function saveInvoiceLineAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = requireString(formData.get("invoice_id"), "Faktura");
  const lineId = parseOptionalString(formData.get("line_id"));
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
    ? supabase.from("invoice_lines").update(payload).eq("id", lineId)
    : supabase.from("invoice_lines").insert(payload);

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte spara fakturarad.");
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
  const invoiceNumber = parseOptionalString(formData.get("invoice_number"));

  const { error } = await supabase
    .from("invoices")
    .update({
      status,
      invoice_number: invoiceNumber,
    })
    .eq("organization_id", organization.id)
    .eq("id", invoiceId);

  if (error) {
    throw error;
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
      category:
        (parseOptionalString(formData.get("category")) as DocumentCategory | null) ??
        "other",
      notes: parseOptionalString(formData.get("notes")),
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte spara dokument.");
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
      address: parseOptionalString(formData.get("address")),
      email: parseOptionalString(formData.get("email")),
      phone: parseOptionalString(formData.get("phone")),
      default_vat_rate: parseOptionalNumber(formData.get("default_vat_rate")) ?? 25,
      payment_terms_days:
        Number(parseOptionalNumber(formData.get("payment_terms_days")) ?? 30),
      invoice_prefix: requireString(formData.get("invoice_prefix"), "Fakturaprefix"),
      next_invoice_number:
        Number(parseOptionalNumber(formData.get("next_invoice_number")) ?? 1),
    })
    .eq("id", organization.id);

  if (error) {
    throw error;
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
