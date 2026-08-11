import Link from "next/link";
import { DashboardSectionOrder } from "@/components/hub/dashboard-layout";
import { HubCard, HubShell, StatCard, StatusBadge } from "@/components/hub/ui";
import {
  customerStatusLabel,
  formatCurrency,
  formatDate,
  followUpTone,
  invoiceStatusLabel,
  preferredContactMethodLabel,
  taskStatusLabel,
} from "@/src/lib/hub";
import { getHubDashboardData } from "@/src/lib/hub-server";

function taskTone(status: string) {
  if (status === "done") return "success";
  if (status === "waiting") return "warning";
  return "neutral";
}

function invoiceTone(status: string) {
  if (status === "paid") return "success";
  if (status === "overdue") return "danger";
  if (status === "sent") return "warning";
  return "neutral";
}

export default async function HubDashboardPage() {
  const { organization, stats, tasks, invoices, documents, activity, followUpCustomers } =
    await getHubDashboardData();
  const dashboardSections = [
    {
      id: "stats",
      title: "Nyckeltal",
      children: (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Öppna" value={stats.openTasks} hint="uppgifter" />
          <StatCard label="Utkast" value={stats.draftInvoices} hint="fakturor" />
          <StatCard label="Obetalda" value={stats.unpaidInvoices} hint="fakturor" />
          <StatCard label="Återkoppla" value={stats.dueFollowUps} hint="kunder" />
          <StatCard label="Dokument" value={stats.documents} hint="uppladdade" />
        </div>
      ),
    },
    {
      id: "follow-ups",
      title: "Relationsradar",
      children: (
        <HubCard className="overflow-hidden bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--hub-accent)]">
                Relationsradar
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Kunder att återkoppla till
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                Här samlas kunder där nästa återkoppling är idag eller redan
                passerad, så du slipper leta i kundlistan.
              </p>
            </div>
            <Link
              href="/hub/kunder"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-[#111111]"
            >
              Öppna kunder
            </Link>
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {followUpCustomers.length ? (
              followUpCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/hub/kunder/${customer.id}`}
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{customer.company_name}</p>
                    <StatusBadge tone={followUpTone(customer)}>
                      {formatDate(customer.follow_up_date)}
                    </StatusBadge>
                    <StatusBadge>{customerStatusLabel(customer.status)}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-white/62">
                    {customer.contact_name || "Ingen kontaktperson"} •{" "}
                    {preferredContactMethodLabel(customer.preferred_contact_method)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/62">
                Inga kunder behöver återkoppling just nu. Lägg in datum på
                kundkortet för att börja använda relationsradarn.
              </p>
            )}
          </div>
        </HubCard>
      ),
    },
    {
      id: "work",
      title: "Arbete och dokument",
      children: (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <HubCard>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Kommande uppgifter</h2>
              <Link href="/hub/uppgifter" className="text-sm font-medium text-[#0B0B0C]">
                Visa alla
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {tasks.length ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#0B0B0C]">{task.title}</p>
                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        Förfallodatum: {formatDate(task.due_date)}
                      </p>
                    </div>
                    <StatusBadge tone={taskTone(task.status)}>
                      {taskStatusLabel(task.status)}
                    </StatusBadge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Lägg till din första uppgift för att börja planera arbetet.
                </p>
              )}
            </div>
          </HubCard>

          <HubCard>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Senaste dokument</h2>
              <Link href="/hub/dokument" className="text-sm font-medium text-[#0B0B0C]">
                Öppna arkivet
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {documents.length ? (
                documents.map((document) => (
                  <div key={document.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <p className="font-medium text-[#0B0B0C]">{document.file_name}</p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      Uppladdad {formatDate(document.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Ladda upp det första dokumentet för att samla underlag på ett ställe.
                </p>
              )}
            </div>
          </HubCard>
        </div>
      ),
    },
    {
      id: "money",
      title: "Fakturor och aktivitet",
      children: (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <HubCard>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Fakturor</h2>
              <Link href="/hub/fakturor" className="text-sm font-medium text-[#0B0B0C]">
                Hantera fakturor
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {invoices.length ? (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#0B0B0C]">
                        {invoice.invoice_number ?? "Utan nummer"}
                      </p>
                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        Totalt {formatCurrency(invoice.total)}
                      </p>
                    </div>
                    <StatusBadge tone={invoiceTone(invoice.status)}>
                      {invoiceStatusLabel(invoice.status)}
                    </StatusBadge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Skapa ert första fakturautkast för att komma i gång.
                </p>
              )}
            </div>
          </HubCard>

          <HubCard>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Senaste aktivitet</h2>
            </div>
            <div className="mt-5 space-y-3">
              {activity.length ? (
                activity.map((entry) => (
                  <div key={entry.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <p className="font-medium text-[#0B0B0C]">{entry.action}</p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      {entry.description ?? "Aktivitet registrerad"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Aktivitetshistorik visas här när ni börjar arbeta i hubben.
                </p>
              )}
            </div>
          </HubCard>
        </div>
      ),
    },
  ];

  return (
    <HubShell
      title="Översikt"
      description={`En snabb bild av vad som händer just nu i ${organization.name}.`}
      actions={
        <Link
          href="/hub/fakturor"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
        >
          Nytt fakturautkast
        </Link>
      }
    >
      <DashboardSectionOrder sections={dashboardSections} />
    </HubShell>
  );
}
