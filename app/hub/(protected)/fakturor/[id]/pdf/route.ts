import { buildInvoicePdf } from "@/src/lib/invoice-pdf";
import { getInvoicePdfData } from "@/src/lib/hub-server";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;
  const pdfData = await getInvoicePdfData(id);
  const pdfBytes = buildInvoicePdf(pdfData);
  const fileName = `${pdfData.invoice.invoice_number ?? `faktura-${id}`}.pdf`;

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
