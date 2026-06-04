import Link from "next/link";
import { HubCard, HubShell, StatCard, StatusBadge } from "@/components/hub/ui";
import {
  formatCurrency,
  formatDate,
  invoiceStatusLabel,
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
  const { organization, stats, tasks, invoices, documents, activity } =
    await getHubDashboardData();

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
      <div className="grid gap-3 md:grid-cols-5">
        <StatCard label="Öppna uppgifter" value={stats.openTasks} />
        <StatCard label="Fakturautkast" value={stats.draftInvoices} />
        <StatCard label="Obetalda/skickade" value={stats.unpaidInvoices} />
        <StatCard label="Uppladdade dokument" value={stats.documents} />
        <StatCard label="Senaste aktivitet" value={stats.recentActivity} />
      </div>

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
    </HubShell>
  );
}
