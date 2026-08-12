import "server-only";

import { hasProcessingJobCapability } from "./hub/jobs/access.ts";
import { hubFeatureFlags } from "./hub/feature-flags.ts";
import type {
  ProcessingJobRow,
  ProcessingJobStatus,
} from "./supabase.ts";
import { requireHubContext } from "./hub-server.ts";

type QueryError = {
  code?: string;
  message?: string;
} | null;

const missingJobSchemaCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function isMissingJobSchema(error: QueryError) {
  return Boolean(error?.code && missingJobSchemaCodes.has(error.code));
}

function emptyStats() {
  return {
    queued: 0,
    processing: 0,
    needsReview: 0,
    failed: 0,
    succeeded: 0,
  };
}

export type ProcessingJobSummary = Pick<
  ProcessingJobRow,
  | "id"
  | "type"
  | "status"
  | "user_message"
  | "attempt_count"
  | "max_attempts"
  | "available_at"
  | "started_at"
  | "finished_at"
  | "cancel_requested_at"
  | "created_at"
  | "updated_at"
>;

export async function getProcessingJobOverview() {
  const { supabase, organization, membership } = await requireHubContext();
  const featureEnabled = hubFeatureFlags.backgroundJobs;
  const runtimeEnabled = featureEnabled && hubFeatureFlags.safeMutations;
  const permissions = {
    canCancel: hasProcessingJobCapability(membership.role, "cancel"),
    canRetry: hasProcessingJobCapability(membership.role, "retry"),
  };
  const preview = {
    organization,
    role: membership.role,
    featureEnabled,
    runtimeEnabled,
    databaseReady: false,
    permissions,
    stats: emptyStats(),
    jobs: [] as ProcessingJobSummary[],
  };

  if (!runtimeEnabled) return preview;

  const countStatus = (status: ProcessingJobStatus) =>
    supabase
      .from("processing_jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", status);

  const [
    jobsResult,
    queuedResult,
    processingResult,
    needsReviewResult,
    failedResult,
    succeededResult,
  ] = await Promise.all([
    supabase
      .from("processing_jobs")
      .select(
        "id, type, status, user_message, attempt_count, max_attempts, available_at, started_at, finished_at, cancel_requested_at, created_at, updated_at",
      )
      .eq("organization_id", organization.id)
      .order("updated_at", { ascending: false })
      .limit(50),
    countStatus("queued"),
    countStatus("processing"),
    countStatus("needs_review"),
    countStatus("failed"),
    countStatus("succeeded"),
  ]);

  const results = [
    jobsResult,
    queuedResult,
    processingResult,
    needsReviewResult,
    failedResult,
    succeededResult,
  ];
  const firstError = results.find((result) => result.error)?.error ?? null;

  if (firstError) {
    if (isMissingJobSchema(firstError)) return preview;
    throw firstError;
  }

  return {
    ...preview,
    databaseReady: true,
    stats: {
      queued: queuedResult.count ?? 0,
      processing: processingResult.count ?? 0,
      needsReview: needsReviewResult.count ?? 0,
      failed: failedResult.count ?? 0,
      succeeded: succeededResult.count ?? 0,
    },
    jobs: jobsResult.data ?? [],
  };
}
