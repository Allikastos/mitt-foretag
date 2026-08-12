import {
  approveBookkeepingDraftAction,
  initializeAccountingMvpAction,
  postBookkeepingDraftAction,
} from "@/app/hub/accounting-actions";
import type { AccountingWorkflowStatus } from "@/src/lib/supabase";
import { SubmitButton } from "./submit-button";
import { Field, inputClassName } from "./ui";

export function AccountingSetupForm({ fiscalYear }: { fiscalYear: number }) {
  return (
    <form action={initializeAccountingMvpAction} className="mt-5 space-y-4">
      <Field label="Första räkenskapsår">
        <input
          type="number"
          name="fiscal_year"
          min="2000"
          max="2100"
          defaultValue={fiscalYear}
          className={inputClassName}
          required
        />
      </Field>
      <p className="text-xs leading-5 text-[var(--hub-muted)]">
        Skapar ett kalenderår med tolv öppna perioder och en begränsad
        startkontoplan. Kontona måste granskas innan skarp användning.
      </p>
      <SubmitButton>Skapa bokföringsgrund</SubmitButton>
    </form>
  );
}

export function DraftWorkflowActions({
  draftId,
  status,
  canApprove,
  canPost,
}: {
  draftId: string;
  status: AccountingWorkflowStatus;
  canApprove: boolean;
  canPost: boolean;
}) {
  if (status === "needs_review" && canApprove) {
    return (
      <form action={approveBookkeepingDraftAction}>
        <input type="hidden" name="draft_id" value={draftId} />
        <SubmitButton>Godkänn utkast</SubmitButton>
      </form>
    );
  }

  if (status === "ready_to_post" && canPost) {
    return (
      <form action={postBookkeepingDraftAction}>
        <input type="hidden" name="draft_id" value={draftId} />
        <SubmitButton>Bokför i serie A</SubmitButton>
      </form>
    );
  }

  return null;
}
