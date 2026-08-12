import {
  cancelProcessingJobAction,
  retryProcessingJobAction,
} from "@/app/hub/job-actions";
import {
  processingJobStatusDescription,
  processingJobStatusLabel,
  processingJobStatusTone,
  processingJobTypeLabel,
} from "@/src/lib/hub/jobs";
import type { ProcessingJobSummary } from "@/src/lib/hub-jobs-server";
import { SubmitButton } from "./submit-button";
import { EmptyState, StatusBadge } from "./ui";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function JobActions({
  job,
  canCancel,
  canRetry,
}: {
  job: ProcessingJobSummary;
  canCancel: boolean;
  canRetry: boolean;
}) {
  const isCancellable = ["queued", "processing", "needs_review"].includes(
    job.status,
  );

  if (job.cancel_requested_at) {
    return (
      <span className="text-xs font-medium text-amber-700">Avbrott begärt</span>
    );
  }

  if (canRetry && job.status === "failed") {
    return (
      <form action={retryProcessingJobAction}>
        <input type="hidden" name="job_id" value={job.id} />
        <SubmitButton pendingLabel="Köar om...">
          Försök igen
        </SubmitButton>
      </form>
    );
  }

  if (canCancel && isCancellable) {
    return (
      <details className="group rounded-xl border border-black/10 bg-[var(--hub-card)] px-3 py-2">
        <summary className="cursor-pointer list-none text-xs font-medium text-[var(--hub-text)]">
          Hantera
        </summary>
        <form action={cancelProcessingJobAction} className="mt-3 max-w-48">
          <input type="hidden" name="job_id" value={job.id} />
          <p className="mb-3 text-xs leading-5 text-[var(--hub-muted)]">
            Bekräfta att processen ska stoppas säkert.
          </p>
          <SubmitButton pendingLabel="Avbryter...">Bekräfta avbrott</SubmitButton>
        </form>
      </details>
    );
  }

  return null;
}

export function ProcessingJobList({
  jobs,
  canCancel,
  canRetry,
}: {
  jobs: ProcessingJobSummary[];
  canCancel: boolean;
  canRetry: boolean;
}) {
  if (!jobs.length) {
    return (
      <EmptyState
        title="Inga processer ännu"
        description="När dokumenttolkning, rapporter eller utskick aktiveras visas deras framsteg här utan att du behöver vänta kvar på sidan."
      />
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <article
          key={job.id}
          className="rounded-[1.35rem] border border-black/8 bg-[var(--hub-card-soft)] p-4 md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-[var(--hub-text)]">
                  {processingJobTypeLabel(job.type)}
                </h3>
                <StatusBadge tone={processingJobStatusTone(job.status)}>
                  {processingJobStatusLabel(job.status)}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                {job.user_message || processingJobStatusDescription(job.status)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--hub-subtle)]">
                <span>Uppdaterad {formatTimestamp(job.updated_at)}</span>
                <span>
                  Försök {job.attempt_count} av {job.max_attempts}
                </span>
              </div>
            </div>
            <JobActions
              job={job}
              canCancel={canCancel}
              canRetry={canRetry}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
