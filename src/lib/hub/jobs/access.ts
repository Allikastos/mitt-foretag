import type { OrganizationRole } from "../../supabase.ts";

export type ProcessingJobCapability = "view" | "cancel" | "retry";

const capabilitiesByRole: Record<
  OrganizationRole,
  ProcessingJobCapability[]
> = {
  owner: ["view", "cancel", "retry"],
  admin: ["view", "cancel", "retry"],
  member: ["view"],
  viewer: ["view"],
};

export function hasProcessingJobCapability(
  role: OrganizationRole,
  capability: ProcessingJobCapability,
) {
  return capabilitiesByRole[role].includes(capability);
}

export function requireProcessingJobCapability(
  role: OrganizationRole,
  capability: ProcessingJobCapability,
) {
  if (!hasProcessingJobCapability(role, capability)) {
    throw new Error("Du saknar behörighet för den här processåtgärden.");
  }
}
