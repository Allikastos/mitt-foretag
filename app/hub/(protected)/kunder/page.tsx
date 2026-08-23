import Link from "next/link";
import { CustomerForm } from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  customerStatusLabel,
  formatDate,
  preferredContactMethodLabel,
} from "@/src/lib/hub";
import { getCustomers, requireHubContext } from "@/src/lib/hub-server";
import {
  getCustomerSalesNextStep,
  parseCustomerFollowUpFilter,
  parseCustomerStatusFilter,
} from "@/src/lib/hub/sales";

function customerTone(status: string) {
  if (status === "active") return "success";
  if (status === "lead") return "warning";
  return "neutral";
}

export default async function HubCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; followUp?: string }>;
}) {
  const filters = await searchParams;
  const status = parseCustomerStatusFilter(filters.status);
  const followUp = parseCustomerFollowUpFilter(filters.followUp);
  const [customers, { membership }] = await Promise.all([
    getCustomers({ page: filters.page, status, followUp }),
    requireHubContext(),
  ]);
  const filterLinks = [
    { href: "/hub/kunder", label: "Alla", active: !status && !followUp },
    { href: "/hub/kunder?status=lead", label: "Prospekt", active: status === "lead" && !followUp },
    { href: "/hub/kunder?followUp=due", label: "Återkoppla nu", active: followUp === "due" },
    { href: "/hub/kunder?followUp=missing", label: "Saknar nästa steg", active: followUp === "missing" },
    { href: "/hub/kunder?status=active", label: "Vunna kunder", active: status === "active" && !followUp },
  ];

  return (
    <HubShell
      title="Kunder & prospekt"
      description="Prioritera nästa kontakt, följ affären och samla överlämningen till leverans på ett ställe."
    >
      <HubCard>
        <div className="flex flex-wrap gap-2" aria-label="Filtrera kunder och prospekt">
          {filterLinks.map((filter) => (
            <Link
              key={filter.href}
              href={filter.href}
              aria-current={filter.active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter.active
                  ? "border-[var(--hub-panel)] bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)]"
                  : "border-black/10 bg-[var(--hub-card-soft)] text-[var(--hub-text)] hover:border-black/20"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </HubCard>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--hub-text)]">Prospekt- och kundlista</h2>
            <p className="text-sm text-[var(--hub-muted)]">
              {customers.totalCount} poster
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {customers.items.length ? (
              customers.items.map((customer) => {
                const nextStep = getCustomerSalesNextStep(customer);

                return (
                <Link
                  key={customer.id}
                  href={`/hub/kunder/${customer.id}`}
                  className="block rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4 transition hover:border-black/14 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-[var(--hub-text)]">{customer.company_name}</p>
                      <p className="mt-1 text-sm text-[var(--hub-muted)]">
                        {customer.contact_name || "Ingen kontaktperson"} • {customer.email || "Ingen e-post"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={nextStep.tone}>
                        {nextStep.label}
                        {customer.status === "lead" && customer.follow_up_date
                          ? ` · ${formatDate(customer.follow_up_date)}`
                          : ""}
                      </StatusBadge>
                      <StatusBadge tone={customerTone(customer.status)}>
                        {customerStatusLabel(customer.status)}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                    <span>Tillagd {formatDate(customer.created_at)}</span>
                    <span>Kontakt via {preferredContactMethodLabel(customer.preferred_contact_method)}</span>
                    {customer.relationship_owner ? (
                      <span>Ansvarig {customer.relationship_owner}</span>
                    ) : null}
                  </div>
                  {customer.tags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white px-3 py-1 text-xs text-[#6B6B6B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
                );
              })
            ) : (
              <EmptyState
                title={status || followUp ? "Inga träffar i det här urvalet" : "Lägg till ditt första prospekt"}
                description={
                  status || followUp
                    ? "Byt filter för att se övriga kunder och prospekt."
                    : "Registrera en kontakt, sätt nästa återkoppling och bygg kundresan vidare därifrån."
                }
              />
            )}
          </div>
          <HubPagination
            basePath="/hub/kunder"
            query={{ status, followUp }}
            {...customers}
          />
        </HubCard>

        <div className="space-y-6">
          <HubCard className="bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent)]">
              Enkel kundresa
            </p>
            <h2 className="mt-3 text-xl font-semibold">Från första kontakt till leverans</h2>
            <ol className="mt-5 grid gap-3 text-sm text-white/72">
              {[
                "Prospekt och kontaktuppgifter",
                "Behov, offertläge och nästa återkoppling",
                "Vunnen kund och leveransuppgifter",
                "Material, dokument och fakturautkast",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs leading-5 text-white/52">
              Använd status, taggar, anteckningar och uppgifter för att hålla flödet tydligt utan att skapa parallella register.
            </p>
          </HubCard>
          {membership.role === "viewer" ? (
            <HubCard>
              <p className="font-semibold text-[var(--hub-text)]">Läsbehörighet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                Du kan se kunder men inte skapa eller ändra kunduppgifter.
              </p>
            </HubCard>
          ) : (
            <div id="nytt-prospekt" className="scroll-mt-6">
              <CustomerForm />
            </div>
          )}
        </div>
      </div>
    </HubShell>
  );
}
