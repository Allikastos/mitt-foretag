import type { Database } from "./supabase";

export const HUB_DOCUMENTS_BUCKET = "hub-documents";
export const HUB_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const customerStatuses = ["lead", "active", "inactive"] as const;
export const taskStatuses = ["todo", "in_progress", "waiting", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;
export const invoiceStatuses = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;
export const documentCategories = [
  "receipt",
  "supplier_invoice",
  "contract",
  "bank_statement",
  "other",
] as const;
export const memberRoles = ["owner", "admin", "member", "viewer"] as const;

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type DocumentRecord = Database["public"]["Tables"]["documents"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceLine = Database["public"]["Tables"]["invoice_lines"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type EmailConnection =
  Database["public"]["Tables"]["email_connections"]["Row"];

export function formatDate(dateValue: string | null | undefined) {
  if (!dateValue) {
    return "Ej angivet";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}

export function formatCurrency(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function taskStatusLabel(status: Task["status"]) {
  switch (status) {
    case "todo":
      return "Att göra";
    case "in_progress":
      return "Pågår";
    case "waiting":
      return "Väntar";
    case "done":
      return "Klart";
    default:
      return status;
  }
}

export function priorityLabel(priority: Task["priority"]) {
  switch (priority) {
    case "low":
      return "Låg";
    case "medium":
      return "Medel";
    case "high":
      return "Hög";
    default:
      return priority;
  }
}

export function emailProviderLabel(provider: EmailConnection["provider"]) {
  switch (provider) {
    case "gmail":
      return "Gmail";
    case "outlook":
      return "Outlook";
    case "imap":
      return "IMAP";
    default:
      return provider;
  }
}

export function emailConnectionStatusLabel(status: EmailConnection["status"]) {
  switch (status) {
    case "not_connected":
      return "Ej ansluten";
    case "connected":
      return "Ansluten";
    case "error":
      return "Fel";
    default:
      return status;
  }
}

export function customerStatusLabel(status: Customer["status"]) {
  switch (status) {
    case "lead":
      return "Lead";
    case "active":
      return "Aktiv";
    case "inactive":
      return "Inaktiv";
    default:
      return status;
  }
}

export function invoiceStatusLabel(status: Invoice["status"]) {
  switch (status) {
    case "draft":
      return "Utkast";
    case "sent":
      return "Skickad";
    case "paid":
      return "Betald";
    case "overdue":
      return "Förfallen";
    case "cancelled":
      return "Annullerad";
    default:
      return status;
  }
}

export function isInvoiceLocked(status: Invoice["status"]) {
  return status !== "draft";
}

export function canEditInvoice(invoice: Pick<Invoice, "status" | "locked_at">) {
  return !invoice.locked_at && !isInvoiceLocked(invoice.status);
}

export function buildOrganizationAddressLines(organization: Pick<
  Organization,
  | "address_line_1"
  | "address_line_2"
  | "postal_code"
  | "city"
  | "country"
  | "address"
>) {
  const fallbackLine = organization.address?.trim() || null;
  const cityLine = [organization.postal_code, organization.city]
    .filter(Boolean)
    .join(" ")
    .trim();

  return [
    organization.address_line_1?.trim() || fallbackLine,
    organization.address_line_2?.trim() || null,
    cityLine || null,
    organization.country?.trim() || null,
  ].filter((line): line is string => Boolean(line));
}

export function documentCategoryLabel(category: DocumentRecord["category"]) {
  switch (category) {
    case "receipt":
      return "Kvitto";
    case "supplier_invoice":
      return "Leverantörsfaktura";
    case "contract":
      return "Avtal";
    case "bank_statement":
      return "Kontoutdrag";
    case "other":
      return "Övrigt";
    default:
      return category;
  }
}

export function roleLabel(role: OrganizationMember["role"]) {
  switch (role) {
    case "owner":
      return "Ägare";
    case "admin":
      return "Admin";
    case "member":
      return "Medlem";
    case "viewer":
      return "Läsbehörig";
    default:
      return role;
  }
}

export function buildDocumentPath(params: {
  organizationId: string;
  customerId?: string | null;
  fileId: string;
  fileName: string;
}) {
  const safeName = params.fileName
    .replace(/[^\p{L}\p{N}.\-_]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return [
    params.organizationId,
    params.customerId || "general",
    `${params.fileId}-${safeName || "fil"}`,
  ].join("/");
}

export function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value;
}
