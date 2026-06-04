import Link from "next/link";
import { CustomerForm } from "@/components/hub/forms";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import { customerStatusLabel, formatDate } from "@/src/lib/hub";
import { getCustomers } from "@/src/lib/hub-server";

function customerTone(status: string) {
  if (status === "active") return "success";
  if (status === "lead") return "warning";
  return "neutral";
}

export default async function HubCustomersPage() {
  const customers = await getCustomers();

  return (
    <HubShell
      title="Kunder"
      description="Hantera kundregister, kontaktuppgifter och kundstatus på ett ställe."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kundlista</h2>
            <p className="text-sm text-[#6B6B6B]">{customers.length} kunder</p>
          </div>
          <div className="mt-5 space-y-3">
            {customers.length ? (
              customers.map((customer) => (
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
                    <StatusBadge tone={customerTone(customer.status)}>
                      {customerStatusLabel(customer.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                    Tillagd {formatDate(customer.created_at)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Lägg till din första kund"
                description="När ni registrerar kunder här kan uppgifter, dokument och fakturor kopplas till rätt bolag."
              />
            )}
          </div>
        </HubCard>

        <div className="space-y-6">
          <CustomerForm />
        </div>
      </div>
    </HubShell>
  );
}
