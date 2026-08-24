import Link from "next/link";
import { CustomerForm } from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import {
  EmptyState,
  HubCard,
  HubShell,
  StatusBadge,
  inputClassName,
} from "@/components/hub/ui";
import {
  formatDate,
  preferredContactMethodLabel,
} from "@/src/lib/hub";
import { getCustomers, requireHubContext } from "@/src/lib/hub-server";
import {
  customerReadinessGapLabel,
  customerSalesStageLabel,
  customerSalesStageTone,
  getCustomerReadinessGaps,
  getCustomerSalesNextStep,
  getCustomerSalesStage,
  normalizeCustomerRegistrySearch,
  parseCustomerFollowUpFilter,
  parseCustomerReadinessFilter,
  parseCustomerSalesStage,
  parseCustomerStatusFilter,
} from "@/src/lib/hub/sales";

type CustomerListFilters = {
  q?: string | null;
  status?: string | null;
  followUp?: string | null;
  stage?: string | null;
  readiness?: string | null;
};

function customerListHref(filters: CustomerListFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `/hub/kunder?${query}` : "/hub/kunder";
}

export default async function HubCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    followUp?: string;
    stage?: string;
    readiness?: string;
    q?: string;
  }>;
}) {
  const filters = await searchParams;
  const status = parseCustomerStatusFilter(filters.status);
  const followUp = parseCustomerFollowUpFilter(filters.followUp);
  const stage = parseCustomerSalesStage(filters.stage);
  const readiness = parseCustomerReadinessFilter(filters.readiness);
  const search = normalizeCustomerRegistrySearch(filters.q);
  const [customers, { membership }] = await Promise.all([
    getCustomers({
      page: filters.page,
      status,
      followUp,
      stage,
      readiness,
      search,
    }),
    requireHubContext(),
  ]);
  const workFilters = [
    {
      href: customerListHref({ q: search }),
      label: "Alla",
      active: !status && !followUp && !stage && !readiness,
    },
    {
      href: customerListHref({ q: search, status: "lead" }),
      label: "Alla prospekt",
      active: status === "lead" && !followUp && !stage && !readiness,
    },
    {
      href: customerListHref({ q: search, followUp: "due" }),
      label: "Återkoppla nu",
      active: followUp === "due",
    },
    {
      href: customerListHref({ q: search, followUp: "missing" }),
      label: "Saknar nästa steg",
      active: followUp === "missing",
    },
  ];
  const stageFilters = [
    { href: customerListHref({ q: search, stage: "new" }), label: "Nya", active: stage === "new" },
    { href: customerListHref({ q: search, stage: "contacted" }), label: "Kontaktade", active: stage === "contacted" },
    { href: customerListHref({ q: search, stage: "meeting" }), label: "Möten", active: stage === "meeting" },
    { href: customerListHref({ q: search, stage: "offer" }), label: "Offerter", active: stage === "offer" },
    { href: customerListHref({ q: search, stage: "won" }), label: "Vunna", active: stage === "won" },
    { href: customerListHref({ q: search, stage: "paused" }), label: "Pausade", active: stage === "paused" },
  ];
  const readinessFilters = [
    {
      href: customerListHref({ q: search, readiness: "missing_contact" }),
      label: "Kontaktväg",
      active: readiness === "missing_contact",
    },
    {
      href: customerListHref({ q: search, readiness: "missing_owner" }),
      label: "Ansvarig",
      active: readiness === "missing_owner",
    },
    {
      href: customerListHref({ q: search, readiness: "missing_notes" }),
      label: "Behovsanteckning",
      active: readiness === "missing_notes",
    },
    {
      href: customerListHref({ q: search, readiness: "missing_follow_up" }),
      label: "Nästa återkoppling",
      active: readiness === "missing_follow_up",
    },
  ];

  return (
    <HubShell
      title="Kunder & prospekt"
      description="Prioritera nästa kontakt, följ affären och samla överlämningen till leverans på ett ställe."
    >
      <HubCard>
        <form
          action="/hub/kunder"
          method="get"
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1" htmlFor="customer-search">
            <span className="mb-2 block text-sm font-medium text-[var(--hub-text)]">
              Sök kund eller prospekt
            </span>
            <input
              id="customer-search"
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Sök på företagsnamn"
              className={inputClassName}
            />
          </label>
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {followUp ? <input type="hidden" name="followUp" value={followUp} /> : null}
          {stage ? <input type="hidden" name="stage" value={stage} /> : null}
          {readiness ? (
            <input type="hidden" name="readiness" value={readiness} />
          ) : null}
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-6 py-3 text-sm font-semibold text-[var(--hub-panel-contrast)] transition hover:opacity-90"
          >
            Sök
          </button>
          {search ? (
            <Link
              href={customerListHref({ status, followUp, stage, readiness })}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[var(--hub-text)]"
            >
              Rensa sökning
            </Link>
          ) : null}
        </form>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { label: "Arbetskö", filters: workFilters },
            { label: "Säljläge", filters: stageFilters },
            { label: "Komplettera", filters: readinessFilters },
          ].map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--hub-subtle)]">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2" aria-label={`Filtrera efter ${group.label.toLocaleLowerCase("sv-SE")}`}>
                {group.filters.map((filter) => (
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
            </div>
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
                const salesStage = getCustomerSalesStage(customer);
                const readinessGaps = getCustomerReadinessGaps(customer);

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
                        {customer.contact_name || "Ingen kontaktperson"} • {customer.email || customer.phone || "Ingen kontaktväg"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={nextStep.tone}>
                        {nextStep.label}
                        {customer.status === "lead" && customer.follow_up_date
                          ? ` · ${formatDate(customer.follow_up_date)}`
                          : ""}
                      </StatusBadge>
                      <StatusBadge tone={customerSalesStageTone(salesStage)}>
                        {customerSalesStageLabel(salesStage)}
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
                  {readinessGaps.length ? (
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      aria-label="Saknade prospektuppgifter"
                    >
                      {readinessGaps.map((gap) => (
                        <span
                          key={gap}
                          className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                        >
                          {customerReadinessGapLabel(gap)}
                        </span>
                      ))}
                    </div>
                  ) : customer.status === "lead" ? (
                    <p className="mt-3 text-xs font-medium text-emerald-700">
                      Minimikrav för prospekt uppfyllda
                    </p>
                  ) : null}
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
                title={
                  status || followUp || stage || readiness || search
                    ? "Inga träffar i det här urvalet"
                    : "Lägg till ditt första prospekt"
                }
                description={
                  status || followUp || stage || readiness || search
                    ? "Ändra sökningen eller byt filter för att se övriga kunder och prospekt."
                    : "Registrera en kontakt, sätt nästa återkoppling och bygg kundresan vidare därifrån."
                }
              />
            )}
          </div>
          <HubPagination
            basePath="/hub/kunder"
            query={{ q: search, status, followUp, stage, readiness }}
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
