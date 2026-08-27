import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ContactForm,
  CustomerForm,
  SalesValidationActivityForm,
} from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
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
import {
  customerSalesStageLabel,
  customerSalesStageTone,
  getCustomerSalesNextStep,
  getCustomerSalesStage,
} from "@/src/lib/hub/sales";

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
  const nextStep = getCustomerSalesNextStep(detail.customer);
  const salesStage = getCustomerSalesStage(detail.customer);
  const deliveryChecklist = [
    {
      label: "Kontaktuppgifter finns",
      complete: Boolean(detail.customer.email || detail.customer.phone),
    },
    {
      label: "Nästa återkoppling är planerad",
      complete: Boolean(detail.customer.follow_up_date),
    },
    {
      label: "Behov och offertläge är dokumenterat",
      complete: Boolean(detail.customer.notes),
    },
    {
      label: "Leveransuppgift är skapad",
      complete: detail.tasks.some((task) => task.status !== "done"),
    },
    {
      label: "Kundmaterial är uppladdat",
      complete: detail.documents.length > 0,
    },
    {
      label: "Fakturautkast finns",
      complete: detail.invoices.length > 0,
    },
  ];
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
      description="Samlad relation från första kontakt till leverans, dokument och faktura."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <HubCard className="bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent)]">
              Nästa steg
            </p>
            <StatusBadge tone={nextStep.tone}>{nextStep.label}</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/68">{nextStep.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/hub/uppgifter" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#111111]">
              Öppna uppgifter
            </Link>
            <Link href="/hub/fakturor" className="rounded-full border border-white/16 px-4 py-2 text-sm font-medium text-white">
              Öppna fakturor
            </Link>
          </div>
        </HubCard>
        <HubCard>
          <h2 className="text-lg font-semibold text-[var(--hub-text)]">Arbetsstöd för överlämning</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
            Bygger på information som redan finns på kundkortet. Punkterna sparas inte som en separat checklista.
          </p>
          <div className="mt-4 grid gap-2">
            {deliveryChecklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[var(--hub-card-soft)] px-4 py-3 text-sm">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${item.complete ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="flex-1 text-[var(--hub-text)]">{item.label}</span>
                <span className="text-xs font-medium text-[var(--hub-muted)]">
                  {item.complete ? "Klart" : "Återstår"}
                </span>
              </div>
            ))}
          </div>
        </HubCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <HubCard>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-[#0B0B0C]">Kundöversikt</h2>
                  <StatusBadge tone={customerSalesStageTone(salesStage)}>
                    {customerSalesStageLabel(salesStage)}
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

          <HubCard>
            <h2 className="text-lg font-semibold text-[var(--hub-text)]">Relationshistorik</h2>
            <div className="mt-5 space-y-3">
              {detail.activity.length ? (
                detail.activity.map((entry) => (
                  <div key={entry.id} className="rounded-[1.25rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
                    <p className="font-medium text-[var(--hub-text)]">{entry.description ?? entry.action}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--hub-subtle)]">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--hub-muted)]">Historiken fylls på när kundkortet skapas och uppdateras.</p>
              )}
            </div>
          </HubCard>
        </div>

        <div className="space-y-6">
          {detail.membership.role === "viewer" ? (
            <HubCard>
              <p className="font-semibold text-[var(--hub-text)]">Läsbehörighet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                Du kan läsa kundkortet men inte ändra kunden eller lägga till kontakter.
              </p>
            </HubCard>
          ) : (
            <>
              <SalesValidationActivityForm customer={detail.customer} />
              <CustomerForm customer={detail.customer} />
              <ContactForm customerId={detail.customer.id} />
            </>
          )}
        </div>
      </div>
    </HubShell>
  );
}
