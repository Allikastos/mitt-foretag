"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CustomerStatus,
  DocumentCategory,
  InvoiceRow,
  InvoiceStatus,
  TaskPriority,
  TaskStatus,
} from "@/src/lib/supabase";
import { buildInvoicePdf } from "@/src/lib/invoice-pdf";
import {
  HUB_MAX_FILE_SIZE_BYTES,
  buildOrganizationAddressLines,
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

async function getInvoiceForMutation(params: {
  invoiceId: string;
  organizationId: string;
}) {
  const { supabase } = await requireHubContext();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", params.organizationId)
    .eq("id", params.invoiceId)
    .single();

  if (error || !data) {
    throw error ?? new Error("Kunde inte hitta fakturan.");
  }

  return data;
}

function ensureInvoiceEditable(invoice: Pick<InvoiceRow, "status" | "locked_at">) {
  if (invoice.status !== "draft" || invoice.locked_at) {
    throw new Error("Fakturan är låst och kan inte längre redigeras.");
  }
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

export async function createOrganizationOnboardingAction(formData: FormData) {
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
    userId: user.id,
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
    issue_date: issueDate,
    due_date:
      parseOptionalDate(formData.get("due_date")) ??
      defaultDueDate.toISOString().slice(0, 10),
    currency: parseOptionalString(formData.get("currency")) ?? "SEK",
    notes: parseOptionalString(formData.get("notes")),
    ...customerSnapshot,
  };

  const query = invoiceId
    ? supabase
        .from("invoices")
        .update(payload)
        .eq("id", invoiceId)
    : supabase.from("invoices").insert(payload);

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
    description: `Faktura ${invoiceId ? "utkast" : "utan nummer"} sparades.`,
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

export async function finalizeInvoiceAction(formData: FormData) {
  const { supabase, organization, user } = await requireHubContext();
  const invoiceId = requireString(formData.get("invoice_id"), "Faktura");
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
    .select("*")
    .eq("organization_id", organization.id)
    .eq("id", invoice.customer_id)
    .single();

  if (customerError || !customer) {
    throw customerError ?? new Error("Kunden kunde inte läsas.");
  }

  const { data: lines, error: linesError } = await supabase
    .from("invoice_lines")
    .select("*")
    .eq("organization_id", organization.id)
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true });

  if (linesError) {
    throw linesError;
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

  let invoiceNumber = invoice.invoice_number;

  if (!invoiceNumber) {
    const { data, error } = await supabase.rpc("claim_next_invoice_number", {
      target_organization_id: organization.id,
    });

    if (error) {
      throw error;
    }

    invoiceNumber = data;
  }

  const finalizedAt = new Date().toISOString();

  const { error: finalizeError } = await supabase
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
    })
    .eq("organization_id", organization.id)
    .eq("id", invoiceId);

  if (finalizeError) {
    throw finalizeError;
  }

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
  const { filePath } = await uploadHubBuffer({
    bytes: pdfBytes,
    fileName: pdfFileName,
    contentType: "application/pdf",
    organizationId: organization.id,
    customerId: invoice.customer_id,
  });

  const { data: pdfDocument, error: pdfDocumentError } = await supabase
    .from("documents")
    .insert({
      organization_id: organization.id,
      customer_id: invoice.customer_id,
      invoice_id: invoiceId,
      file_name: pdfFileName,
      file_path: filePath,
      mime_type: "application/pdf",
      size_bytes: pdfBytes.byteLength,
      category: "other",
      notes: "Automatiskt genererad faktura-PDF.",
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (pdfDocumentError || !pdfDocument) {
    throw pdfDocumentError ?? new Error("Kunde inte spara faktura-PDF.");
  }

  const { error: updatePdfReferenceError } = await supabase
    .from("invoices")
    .update({
      pdf_document_id: pdfDocument.id,
    })
    .eq("organization_id", organization.id)
    .eq("id", invoiceId);

  if (updatePdfReferenceError) {
    throw updatePdfReferenceError;
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
