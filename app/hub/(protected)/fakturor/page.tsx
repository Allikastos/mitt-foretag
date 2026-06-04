import Link from "next/link";
import { InvoiceForm } from "@/components/hub/forms";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  formatCurrency,
  formatDate,
  invoiceStatusLabel,
} from "@/src/lib/hub";
import { getHubLists, getInvoices, requireHubContext } from "@/src/lib/hub-server";

function invoiceTone(status: string) {
  if (status === "paid") return "success";
  if (status === "overdue") return "danger";
  if (status === "sent") return "warning";
  return "neutral";
}

export default async function HubInvoicesPage() {
  const [{ organization }, invoices, lists] = await Promise.all([
    requireHubContext(),
    getInvoices(),
    getHubLists(),
  ]);

  return (
    <HubShell
      title="Fakturor"
      description="Skapa och följ upp fakturautkast med rader, moms och manuella statusändringar."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <h2 className="text-lg font-semibold text-[#0B0B0C]">Fakturalista</h2>
          <div className="mt-5 space-y-3">
            {invoices.length ? (
              invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/hub/fakturor/${invoice.id}`}
                  className="block rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4 transition hover:border-black/14 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-[#0B0B0C]">
                        {invoice.invoice_number ?? "Utan nummer"}
                      </p>
                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        {invoice.customers?.company_name ?? "Ingen kund vald"} •{" "}
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                    <StatusBadge tone={invoiceTone(invoice.status)}>
                      {invoiceStatusLabel(invoice.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                    Fakturadatum {formatDate(invoice.issue_date)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Skapa första fakturautkastet"
                description="Fakturor börjar som utkast. Lägg sedan till rader, granska totalsummor och markera som skickad eller betald manuellt."
              />
            )}
          </div>
        </HubCard>

        <InvoiceForm customers={lists.customers} organization={organization} />
      </div>
    </HubShell>
  );
}
