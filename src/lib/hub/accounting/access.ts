import type { OrganizationRole } from "../../supabase.ts";

export type AccountingCapability =
  | "view"
  | "create_draft"
  | "approve_draft"
  | "post_journal"
  | "configure";

const capabilitiesByRole: Record<OrganizationRole, AccountingCapability[]> = {
  owner: ["view", "create_draft", "approve_draft", "post_journal", "configure"],
  admin: ["view", "create_draft", "approve_draft", "post_journal", "configure"],
  member: ["view", "create_draft"],
  viewer: ["view"],
};

export function hasAccountingCapability(
  role: OrganizationRole,
  capability: AccountingCapability,
) {
  return capabilitiesByRole[role].includes(capability);
}

export function requireAccountingCapability(
  role: OrganizationRole,
  capability: AccountingCapability,
) {
  if (!hasAccountingCapability(role, capability)) {
    throw new Error("Du saknar behörighet för den här bokföringsåtgärden.");
  }
}
