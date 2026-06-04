import Link from "next/link";
import { TaskForm } from "@/components/hub/forms";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  formatDate,
  priorityLabel,
  taskStatusLabel,
} from "@/src/lib/hub";
import { getHubLists, getTasks } from "@/src/lib/hub-server";

export default async function HubTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; due?: string }>;
}) {
  const filters = await searchParams;
  const [tasks, lists] = await Promise.all([
    getTasks({
      status: filters.status ?? null,
      due: filters.due ?? null,
    }),
    getHubLists(),
  ]);

  return (
    <HubShell
      title="Uppgifter"
      description="Följ upp arbete, deadlines och prioriteringar för varje kund och intern aktivitet."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Uppgiftslista</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/hub/uppgifter" className="rounded-full bg-[#F1EFE8] px-3 py-2">
                Alla
              </Link>
              <Link
                href="/hub/uppgifter?status=todo"
                className="rounded-full bg-[#F1EFE8] px-3 py-2"
              >
                Att göra
              </Link>
              <Link
                href="/hub/uppgifter?due=overdue"
                className="rounded-full bg-[#F1EFE8] px-3 py-2"
              >
                Förfallna
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {tasks.length ? (
              tasks.map((task) => (
                <div key={task.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-[#0B0B0C]">{task.title}</p>
                    <StatusBadge>{taskStatusLabel(task.status)}</StatusBadge>
                    <StatusBadge tone={task.priority === "high" ? "danger" : "neutral"}>
                      {priorityLabel(task.priority)}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    Förfallodatum {formatDate(task.due_date)}
                  </p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Kund: {task.customers?.company_name ?? "Ingen kund kopplad"}
                  </p>
                  {task.description ? (
                    <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">{task.description}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState
                title="Lägg till din första uppgift"
                description="Skapa en uppgift för att börja följa upp vad som ska göras och när det behöver vara klart."
              />
            )}
          </div>
        </HubCard>

        <TaskForm customers={lists.customers} />
      </div>
    </HubShell>
  );
}
