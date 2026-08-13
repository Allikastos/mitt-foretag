import type { OrganizationRole } from "../../supabase.ts";

export type IntegrationCapability = "view" | "manage";

const capabilitiesByRole: Record<OrganizationRole, IntegrationCapability[]> = {
  owner: ["view", "manage"],
  admin: ["view", "manage"],
  member: ["view"],
  viewer: ["view"],
};

export function hasIntegrationCapability(
  role: OrganizationRole,
  capability: IntegrationCapability,
) {
  return capabilitiesByRole[role].includes(capability);
}

export function requireIntegrationCapability(
  role: OrganizationRole,
  capability: IntegrationCapability,
) {
  if (!hasIntegrationCapability(role, capability)) {
    throw new Error("Du saknar behörighet för den här integrationsåtgärden.");
  }
}
