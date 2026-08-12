import type {
  ProcessingJobStatus,
  ProcessingJobType,
} from "../../supabase.ts";

export const processingJobStatuses: ProcessingJobStatus[] = [
  "queued",
  "processing",
  "needs_review",
  "succeeded",
  "failed",
  "cancelled",
];

const allowedTransitions: Record<
  ProcessingJobStatus,
  ProcessingJobStatus[]
> = {
  queued: ["processing", "cancelled"],
  processing: ["queued", "needs_review", "succeeded", "failed", "cancelled"],
  needs_review: ["queued", "cancelled"],
  succeeded: [],
  failed: ["queued", "cancelled"],
  cancelled: [],
};

export function canTransitionProcessingJob(
  from: ProcessingJobStatus,
  to: ProcessingJobStatus,
) {
  return allowedTransitions[from].includes(to);
}

export function retryDelaySeconds(attemptCount: number) {
  if (!Number.isInteger(attemptCount) || attemptCount < 1) {
    throw new Error("Antalet försök måste vara ett positivt heltal.");
  }

  return Math.min(3600, 30 * 2 ** Math.min(attemptCount - 1, 7));
}

export function processingJobStatusLabel(status: ProcessingJobStatus) {
  const labels: Record<ProcessingJobStatus, string> = {
    queued: "Väntar",
    processing: "Bearbetas",
    needs_review: "Behöver granskas",
    succeeded: "Klar",
    failed: "Misslyckades",
    cancelled: "Avbruten",
  };

  return labels[status];
}

export function processingJobStatusTone(
  status: ProcessingJobStatus,
): "neutral" | "success" | "warning" | "danger" {
  if (status === "succeeded") return "success";
  if (status === "failed") return "danger";
  if (status === "processing" || status === "needs_review") return "warning";
  return "neutral";
}

export function processingJobTypeLabel(type: ProcessingJobType) {
  const labels: Record<ProcessingJobType, string> = {
    document_processing: "Dokumenttolkning",
    invoice_generation: "Fakturagenerering",
    sie_export: "SIE-export",
    report_generation: "Rapportgenerering",
    email_delivery: "E-postutskick",
    bank_import: "Bankimport",
    follow_up_digest: "Uppföljningssammanställning",
  };

  return labels[type];
}

export function processingJobStatusDescription(status: ProcessingJobStatus) {
  const descriptions: Record<ProcessingJobStatus, string> = {
    queued: "Processen är sparad och väntar på en ledig arbetare.",
    processing: "Processen körs med ett tidsbegränsat arbetslås och kan återupptas.",
    needs_review: "Resultatet behöver granskas av en person innan nästa steg.",
    succeeded: "Processen är färdig och resultatet har sparats.",
    failed: "Processen stoppades säkert och kan återförsökas av en administratör.",
    cancelled: "Processen avbröts och kommer inte att fortsätta.",
  };

  return descriptions[status];
}
