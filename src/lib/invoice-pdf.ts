import { formatCurrency, formatDate, invoiceStatusLabel } from "./hub";
import type { Invoice, InvoiceLine, Organization } from "./hub";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildPdfContent(lines: string[]) {
  let y = 800;
  const content: string[] = ["BT", "/F1 11 Tf", "50 800 Td"];
  let firstLine = true;

  for (const line of lines) {
    const safeLine = escapePdfText(line);

    if (firstLine) {
      content.push(`(${safeLine}) Tj`);
      firstLine = false;
    } else {
      y -= 16;
      content.push(`1 0 0 1 50 ${y} Tm`);
      content.push(`(${safeLine}) Tj`);
    }
  }

  content.push("ET");
  return content.join("\n");
}

export function buildInvoicePdf(params: {
  organization: Organization;
  organizationAddressLines: string[];
  invoice: Invoice & {
    customers?: { id: string; company_name: string } | null;
  };
  lines: InvoiceLine[];
}) {
  const issueDate = formatDate(params.invoice.issue_date);
  const dueDate = formatDate(params.invoice.due_date);
  const customerName =
    params.invoice.customers?.company_name ??
    params.invoice.customer_name_snapshot ??
    "Ej vald kund";

  const bodyLines = [
    params.organization.name,
    ...(params.organizationAddressLines.length
      ? params.organizationAddressLines
      : ["Adress saknas"]),
    params.organization.org_number
      ? `Org.nr: ${params.organization.org_number}`
      : "Org.nr: saknas",
    params.organization.vat_number
      ? `VAT: ${params.organization.vat_number}`
      : "VAT: saknas",
    params.organization.email ? `E-post: ${params.organization.email}` : "E-post: saknas",
    params.organization.website ? `Webb: ${params.organization.website}` : "",
    "",
    `Faktura: ${params.invoice.invoice_number ?? "UTKAST"}`,
    `Status: ${invoiceStatusLabel(params.invoice.status)}`,
    `Fakturadatum: ${issueDate}`,
    `Förfallodatum: ${dueDate}`,
    `Kund: ${customerName}`,
    "",
    "Fakturarader:",
    ...(params.lines.length
      ? params.lines.flatMap((line) => [
          `${line.description}`,
          `  ${asNumber(line.quantity)} x ${formatCurrency(line.unit_price)} | Moms ${asNumber(
            line.vat_rate
          )}% | Summa ${formatCurrency(line.line_total)}`,
        ])
      : ["Inga fakturarader"]),
    "",
    `Subtotal: ${formatCurrency(params.invoice.subtotal)}`,
    `Moms: ${formatCurrency(params.invoice.vat_total)}`,
    `Totalt: ${formatCurrency(params.invoice.total)}`,
    "",
    params.organization.payment_instructions
      ? `Betalningsinstruktioner: ${params.organization.payment_instructions}`
      : "",
    params.organization.bankgiro ? `Bankgiro: ${params.organization.bankgiro}` : "",
    params.organization.plusgiro ? `Plusgiro: ${params.organization.plusgiro}` : "",
    params.organization.swish_number ? `Swish: ${params.organization.swish_number}` : "",
    params.organization.invoice_footer ?? "",
  ].filter(Boolean);

  const contentStream = buildPdfContent(bodyLines);
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}
