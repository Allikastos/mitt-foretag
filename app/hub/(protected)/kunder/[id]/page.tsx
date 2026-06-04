import { notFound } from "next/navigation";
import { ContactForm, CustomerForm } from "@/components/hub/forms";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  customerStatusLabel,
  formatCurrency,
  formatDate,
  invoiceStatusLabel,
  taskStatusLabel,
} from "@/src/lib/hub";
import { getCustomerDetail } from "@/src/lib/hub-server";

export default async function HubCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerDetail(id).catch(() => null);

  if (!detail?.customer) {
    notFound();
  }

  return (
    <HubShell
      title={detail.customer.company_name}
      description="Kundkort med kopplade kontakter, uppgifter, fakturor och dokument."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <HubCard>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Kundöversikt</h2>
              <StatusBadge tone={detail.customer.status === "active" ? "success" : "warning"}>
                {customerStatusLabel(detail.customer.status)}
              </StatusBadge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Kontakt</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">
                  {detail.customer.contact_name || "Ej angivet"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">E-post</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">
                  {detail.customer.email || "Ej angivet"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Telefon</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">
                  {detail.customer.phone || "Ej angivet"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">Adress</p>
                <p className="mt-2 text-sm text-[#0B0B0C]">
                  {detail.customer.address || "Ej angivet"}
                </p>
              </div>
            </div>
            {detail.customer.notes ? (
              <p className="mt-5 text-sm leading-7 text-[#5F5F5F]">{detail.customer.notes}</p>
            ) : null}
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kontakter</h2>
            <div className="mt-5 space-y-3">
              {detail.contacts.length ? (
                detail.contacts.map((contact) => (
                  <div key={contact.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <p className="font-medium text-[#0B0B0C]">{contact.name}</p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      {contact.role_title || "Ingen roll angiven"} • {contact.email || "Ingen e-post"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">Inga kundkontakter registrerade ännu.</p>
              )}
            </div>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Uppgifter</h2>
            <div className="mt-5 space-y-3">
              {detail.tasks.length ? (
                detail.tasks.map((task) => (
                  <div key={task.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-medium text-[#0B0B0C]">{task.title}</p>
                      <StatusBadge>{taskStatusLabel(task.status)}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-[#6B6B6B]">
                      Förfallodatum {formatDate(task.due_date)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">Inga uppgifter kopplade till kunden ännu.</p>
              )}
            </div>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Fakturor</h2>
            <div className="mt-5 space-y-3">
              {detail.invoices.length ? (
                detail.invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-medium text-[#0B0B0C]">
                        {invoice.invoice_number ?? "Utan nummer"}
                      </p>
                      <StatusBadge>{invoiceStatusLabel(invoice.status)}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-[#6B6B6B]">
                      Totalt {formatCurrency(invoice.total)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">Inga fakturor kopplade till kunden ännu.</p>
              )}
            </div>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Dokument</h2>
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
                <p className="text-sm text-[#6B6B6B]">Inga dokument kopplade till kunden ännu.</p>
              )}
            </div>
          </HubCard>
        </div>

        <div className="space-y-6">
          <CustomerForm customer={detail.customer} />
          <ContactForm customerId={detail.customer.id} />
        </div>
      </div>
    </HubShell>
  );
}
