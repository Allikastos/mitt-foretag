import { notFound } from "next/navigation";
import { ContactForm, CustomerForm } from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  customerStatusLabel,
  customerFieldLabel,
  formatCurrency,
  formatDate,
  followUpTone,
  formatTags,
  getCustomerFieldPreferences,
  invoiceStatusLabel,
  preferredContactMethodLabel,
  taskStatusLabel,
} from "@/src/lib/hub";
import { getCustomerDetail } from "@/src/lib/hub-server";

export default async function HubCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contactsPage?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const detail = await getCustomerDetail(id, {
    contactsPage: filters.contactsPage,
  }).catch(() => null);

  if (!detail?.customer) {
    notFound();
  }

  const visibleFields = getCustomerFieldPreferences(detail.organization);
  const customerFieldValues = {
    org_number: detail.customer.org_number || "Ej angivet",
    contact_name: detail.customer.contact_name || "Ej angivet",
    email: detail.customer.email || "Ej angivet",
    phone: detail.customer.phone || "Ej angivet",
    address: detail.customer.address || "Ej angivet",
    preferred_contact_method: preferredContactMethodLabel(
      detail.customer.preferred_contact_method,
    ),
    last_contacted_at: formatDate(detail.customer.last_contacted_at),
    follow_up_date: formatDate(detail.customer.follow_up_date),
    relationship_owner: detail.customer.relationship_owner || "Ej angivet",
    tags: formatTags(detail.customer.tags),
    notes: detail.customer.notes || "Ej angivet",
  };

  return (
    <HubShell
      title={detail.customer.company_name}
      description="Kundkort med kopplade kontakter, uppgifter, fakturor och dokument."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <HubCard>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-[#0B0B0C]">Kundöversikt</h2>
                  <StatusBadge tone={detail.customer.status === "active" ? "success" : "warning"}>
                    {customerStatusLabel(detail.customer.status)}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                  Kontakt via{" "}
                  {preferredContactMethodLabel(detail.customer.preferred_contact_method)}
                  {detail.customer.relationship_owner
                    ? ` • ansvarig ${detail.customer.relationship_owner}`
                    : ""}
                </p>
              </div>
              {detail.customer.follow_up_date ? (
                <StatusBadge tone={followUpTone(detail.customer)}>
                  Återkoppla {formatDate(detail.customer.follow_up_date)}
                </StatusBadge>
              ) : null}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleFields.map((field) => (
                <div
                  key={field}
                  className={field === "notes" ? "md:col-span-2" : undefined}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                    {customerFieldLabel(field)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#0B0B0C]">
                    {customerFieldValues[field]}
                  </p>
                </div>
              ))}
            </div>
            {detail.customer.tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {detail.customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F1EFE8] px-3 py-1 text-xs text-[#6B6B6B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kontakter</h2>
            <div className="mt-5 space-y-3">
              {detail.contacts.items.length ? (
                detail.contacts.items.map((contact) => (
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
            <HubPagination
              basePath={`/hub/kunder/${id}`}
              pageParam="contactsPage"
              {...detail.contacts}
            />
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
