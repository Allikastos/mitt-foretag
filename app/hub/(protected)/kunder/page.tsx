import Link from "next/link";
import { CustomerForm } from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  customerStatusLabel,
  followUpTone,
  formatDate,
  preferredContactMethodLabel,
} from "@/src/lib/hub";
import { getCustomers, requireHubContext } from "@/src/lib/hub-server";

function customerTone(status: string) {
  if (status === "active") return "success";
  if (status === "lead") return "warning";
  return "neutral";
}

export default async function HubCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const filters = await searchParams;
  const [customers, { membership }] = await Promise.all([
    getCustomers({ page: filters.page }),
    requireHubContext(),
  ]);

  return (
    <HubShell
      title="Kunder"
      description="Hantera kundregister, kontaktuppgifter och kundstatus på ett ställe."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kundlista</h2>
            <p className="text-sm text-[#6B6B6B]">
              {customers.totalCount} kunder
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {customers.items.length ? (
              customers.items.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/hub/kunder/${customer.id}`}
                  className="block rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4 transition hover:border-black/14 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-[#0B0B0C]">{customer.company_name}</p>
                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        {customer.contact_name || "Ingen kontaktperson"} • {customer.email || "Ingen e-post"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customer.follow_up_date ? (
                        <StatusBadge tone={followUpTone(customer)}>
                          Återkoppla {formatDate(customer.follow_up_date)}
                        </StatusBadge>
                      ) : null}
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
              ))
            ) : (
              <EmptyState
                title="Lägg till din första kund"
                description="När ni registrerar kunder här kan uppgifter, dokument och fakturor kopplas till rätt bolag."
              />
            )}
          </div>
          <HubPagination basePath="/hub/kunder" {...customers} />
        </HubCard>

        <div className="space-y-6">
          {membership.role === "viewer" ? (
            <HubCard>
              <p className="font-semibold text-[var(--hub-text)]">Läsbehörighet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                Du kan se kunder men inte skapa eller ändra kunduppgifter.
              </p>
            </HubCard>
          ) : (
            <CustomerForm />
          )}
        </div>
      </div>
    </HubShell>
  );
}
