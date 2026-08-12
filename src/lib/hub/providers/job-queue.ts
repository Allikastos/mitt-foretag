import type {
  ProcessingJobStatus,
  ProcessingJobType,
} from "../../supabase.ts";

export type QueueJobInput = {
  organizationId: string;
  createdBy: string | null;
  type: ProcessingJobType;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  requestHash: string;
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

type DevelopmentJobRecord = QueuedJob & {
  organizationId: string;
  idempotencyKey: string;
  requestHash: string;
};

/**
 * Process-local test adapter. Jobs disappear on restart and this must never be
 * used as production infrastructure.
 */
export class DevelopmentMemoryJobQueueProvider implements JobQueueProvider {
  private readonly jobs = new Map<string, DevelopmentJobRecord>();
  private nextId = 1;

  constructor(environment = process.env.NODE_ENV) {
    if (environment === "production") {
      throw new Error("Minneskön får inte användas i produktion.");
    }
  }

  async enqueue(input: QueueJobInput): Promise<QueuedJob> {
    const duplicate = [...this.jobs.values()].find(
      (job) =>
        job.organizationId === input.organizationId &&
        job.idempotencyKey === input.idempotencyKey,
    );

    if (duplicate) {
      if (duplicate.requestHash !== input.requestHash) {
        throw new Error("Samma idempotensnyckel har använts för ett annat anrop.");
      }
      return { id: duplicate.id, status: duplicate.status };
    }

    const job: DevelopmentJobRecord = {
      id: `development-job-${this.nextId++}`,
      status: "queued",
      organizationId: input.organizationId,
      idempotencyKey: input.idempotencyKey,
      requestHash: input.requestHash,
    };
    this.jobs.set(job.id, job);
    return { id: job.id, status: job.status };
  }

  async getStatus(input: {
    organizationId: string;
    jobId: string;
  }): Promise<ProcessingJobStatus> {
    return this.requireJob(input).status;
  }

  async cancel(input: {
    organizationId: string;
    jobId: string;
    reason: string;
  }): Promise<void> {
    const job = this.requireJob(input);
    if (job.status === "succeeded") {
      throw new Error("En färdig process kan inte avbrytas.");
    }
    job.status = "cancelled";
  }

  private requireJob(input: { organizationId: string; jobId: string }) {
    const job = this.jobs.get(input.jobId);
    if (!job || job.organizationId !== input.organizationId) {
      throw new Error("Processen kunde inte hittas.");
    }
    return job;
  }
}

export class DisabledJobQueueProvider implements JobQueueProvider {
  async enqueue(): Promise<QueuedJob> {
    throw new Error(
      "Bakgrundsprocesser är avstängda tills en hållbar kö är ansluten.",
    );
  }

  async getStatus(): Promise<ProcessingJobStatus> {
    throw new Error("Bakgrundsprocesser är avstängda.");
  }

  async cancel(): Promise<void> {
    throw new Error("Bakgrundsprocesser är avstängda.");
  }
}
