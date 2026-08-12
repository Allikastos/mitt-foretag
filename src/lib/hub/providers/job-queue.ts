export type ProcessingJobStatus =
  | "queued"
  | "processing"
  | "needs_review"
  | "succeeded"
  | "failed"
  | "cancelled";

export type QueueJobInput = {
  organizationId: string;
  type:
    | "document_processing"
    | "invoice_generation"
    | "sie_export"
    | "report_generation"
    | "email_delivery"
    | "bank_import"
    | "follow_up_digest";
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

export type QueuedJob = {
  id: string;
  status: ProcessingJobStatus;
};

export interface JobQueueProvider {
  enqueue(input: QueueJobInput): Promise<QueuedJob>;
  getStatus(input: {
    organizationId: string;
    jobId: string;
  }): Promise<ProcessingJobStatus>;
  cancel(input: {
    organizationId: string;
    jobId: string;
    reason: string;
  }): Promise<void>;
}

export class DisabledJobQueueProvider implements JobQueueProvider {
  async enqueue(): Promise<QueuedJob> {
    throw new Error(
      "Background jobs are disabled until a durable queue provider is connected.",
    );
  }

  async getStatus(): Promise<ProcessingJobStatus> {
    throw new Error("Background jobs are disabled.");
  }

  async cancel(): Promise<void> {
    throw new Error("Background jobs are disabled.");
  }
}
