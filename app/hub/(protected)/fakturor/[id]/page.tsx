import { notFound } from "next/navigation";
import {
  DocumentUploadForm,
  InvoiceForm,
  InvoiceLineForm,
  InvoiceStatusForm,
} from "@/components/hub/forms";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  canEditInvoice,
  formatCurrency,
  formatDate,
  invoiceStatusLabel,
} from "@/src/lib/hub";
import {
  getHubLists,
  getInvoiceDetail,
  requireHubContext,
} from "@/src/lib/hub-server";

export default async function HubInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, lists, context] = await Promise.all([
    getInvoiceDetail(id).catch(() => null),
    getHubLists(),
    requireHubContext(),
  ]);

  if (!detail?.invoice) {
    notFound();
  }

  const isLocked = !canEditInvoice(detail.invoice);
  const pdfHref = `/hub/fakturor/${detail.invoice.id}/pdf`;
  const hasAddress = Boolean(
    context.organization.address_line_1?.trim() ||
      context.organization.address?.trim(),
  );
  const hasPaymentDetails = Boolean(
    context.organization.bankgiro ||
      context.organization.plusgiro ||
      context.organization.bank_account ||
      context.organization.swish_number ||
      context.organization.payment_instructions,
  );
  const finalizationBlockers = [
    !detail.lines.length ? "minst en fakturarad" : null,
    !context.organization.org_number?.trim() ? "organisationsnummer" : null,
    !hasAddress ? "företagsadress" : null,
    !hasPaymentDetails ? "betalningsuppgifter" : null,
  ].filter((item): item is string => Boolean(item));
  const finalizationBlockedMessage = finalizationBlockers.length
    ? `Komplettera ${finalizationBlockers.join(", ")} innan fakturan kan slutföras.`
    : null;

  return (
    <HubShell
      title={detail.invoice.invoice_number ?? "Fakturautkast"}
      description="Redigera fakturahuvud, rader, totalsummor och dokumentkopplingar."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <HubCard>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Sammanfattning</h2>
              <StatusBadge>{invoiceStatusLabel(detail.invoice.status)}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Kund</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">
                  {detail.invoice.customers?.company_name ??
                    detail.invoice.customer_name_snapshot ??
                    "Ej vald"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Fakturadatum</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">{formatDate(detail.invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Förfallodatum</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">{formatDate(detail.invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Valuta</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">{detail.invoice.currency}</p>
              </div>
            </div>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Fakturarader</h2>
            <div className="mt-5 space-y-3">
              {detail.lines.length ? (
                detail.lines.map((line) => (
                  <div key={line.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-medium text-[#0B0B0C]">{line.description}</p>
                      <p className="text-sm text-[#0B0B0C]">
                        {formatCurrency(line.line_total)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-[#6B6B6B]">
                      {line.quantity} x {formatCurrency(line.unit_price)} • Moms {line.vat_rate}%
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Lägg till första fakturaraden för att få totalsummor beräknade automatiskt.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.2rem] bg-[#F7F7F5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Subtotal</p>
                <p className="mt-2 font-semibold text-[#0B0B0C]">
                  {formatCurrency(detail.invoice.subtotal)}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-[#F7F7F5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Moms</p>
                <p className="mt-2 font-semibold text-[#0B0B0C]">
                  {formatCurrency(detail.invoice.vat_total)}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-[#F7F7F5] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Totalt</p>
                <p className="mt-2 font-semibold text-[#0B0B0C]">
                  {formatCurrency(detail.invoice.total)}
                </p>
              </div>
            </div>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kopplade dokument</h2>
            <div className="mt-5 space-y-3">
              {detail.documents.length ? (
                detail.documents.map((document) => (
                  <div key={document.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <p className="font-medium text-[#0B0B0C]">{document.file_name}</p>
                    <p className="mt-2 text-sm text-[#6B6B6B]">
                      Uppladdad {formatDate(document.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">Inga dokument kopplade till denna faktura ännu.</p>
              )}
            </div>
          </HubCard>
        </div>

        <div className="space-y-6">
          {context.membership.role === "viewer" ? (
            <HubCard>
              <p className="font-semibold text-[var(--hub-text)]">Läsbehörighet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                Du kan läsa fakturan men inte redigera, slutföra eller ladda upp underlag.
              </p>
            </HubCard>
          ) : (
            <>
              <InvoiceForm
                invoice={detail.invoice}
                customers={lists.customers}
                organization={context.organization}
              />
              <InvoiceLineForm invoiceId={detail.invoice.id} locked={isLocked} />
              <InvoiceStatusForm
                invoiceId={detail.invoice.id}
                invoiceNumber={detail.invoice.invoice_number}
                currentStatus={detail.invoice.status}
                locked={isLocked}
                pdfHref={pdfHref}
                pdfStatus={detail.invoice.pdf_status}
                pdfError={detail.invoice.pdf_error}
                finalizationBlockedMessage={finalizationBlockedMessage}
              />
              <DocumentUploadForm customers={lists.customers} invoices={lists.invoices} />
            </>
          )}
        </div>
      </div>
    </HubShell>
  );
}
