"use server";

import { revalidatePath } from "next/cache";
import { hubFeatureFlags } from "@/src/lib/hub/feature-flags";
import { requireProcessingJobCapability } from "@/src/lib/hub/jobs";
import { logHubActivity, requireHubContext } from "@/src/lib/hub-server";

function requireJobRuntime() {
  if (!hubFeatureFlags.backgroundJobs || !hubFeatureFlags.safeMutations) {
    throw new Error("Bakgrundsprocesser är fortfarande i förhandsläge.");
  }
}

function requireUuid(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error("Process-ID:t är ogiltigt.");
  }
  return value;
}

export async function cancelProcessingJobAction(formData: FormData) {
  requireJobRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireProcessingJobCapability(membership.role, "cancel");
  const jobId = requireUuid(formData.get("job_id"));
  const { error } = await supabase.rpc("cancel_processing_job", {
    target_organization_id: organization.id,
    target_job_id: jobId,
    target_reason: "Avbruten från aktivitetscentret.",
  });

  if (error) throw new Error("Processen kunde inte avbrytas.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "processing_job_cancelled",
    entityType: "processing_job",
    entityId: jobId,
    description: "En bakgrundsprocess avbröts från aktivitetscentret.",
  });
  revalidatePath("/hub/processer");
}

export async function retryProcessingJobAction(formData: FormData) {
  requireJobRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireProcessingJobCapability(membership.role, "retry");
  const jobId = requireUuid(formData.get("job_id"));
  const { error } = await supabase.rpc("retry_processing_job", {
    target_organization_id: organization.id,
    target_job_id: jobId,
  });

  if (error) throw new Error("Processen kunde inte startas om.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "processing_job_retried",
    entityType: "processing_job",
    entityId: jobId,
    description: "En misslyckad bakgrundsprocess lades tillbaka i kön.",
  });
  revalidatePath("/hub/processer");
}
