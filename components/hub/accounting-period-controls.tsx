import { lockAccountingPeriodAction } from "@/app/hub/accounting-actions";
import { SubmitButton } from "./submit-button";
import { StatusBadge } from "./ui";

export function AccountingPeriodControls({
  periods,
  canConfigure,
}: {
  periods: Array<{ id: string; starts_on: string; ends_on: string; status: string }>;
  canConfigure: boolean;
}) {
  return (
    <div className="space-y-3">
      {periods.map((period) => (
        <div key={period.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--hub-card-soft)] p-4">
          <div>
            <p className="font-medium text-[var(--hub-text)]">{period.starts_on} – {period.ends_on}</p>
            <p className="mt-1 text-xs text-[var(--hub-muted)]">En låst period kan inte ta emot nya verifikationer.</p>
          </div>
          {period.status === "locked" ? <StatusBadge tone="success">Låst</StatusBadge> : canConfigure ? (
            <form action={lockAccountingPeriodAction}>
              <input type="hidden" name="period_id" value={period.id} />
              <SubmitButton>Lås period</SubmitButton>
            </form>
          ) : <StatusBadge>Öppen</StatusBadge>}
        </div>
      ))}
    </div>
  );
}
