import type { OrganizationRole } from "../../supabase.ts";

export type DocumentCapability =
  | "view"
  | "upload"
  | "edit_facts"
  | "create_accounting_draft";

const capabilitiesByRole: Record<OrganizationRole, DocumentCapability[]> = {
  owner: ["view", "upload", "edit_facts", "create_accounting_draft"],
  admin: ["view", "upload", "edit_facts", "create_accounting_draft"],
  member: ["view", "upload", "edit_facts", "create_accounting_draft"],
  viewer: ["view"],
};

export function hasDocumentCapability(
  role: OrganizationRole,
  capability: DocumentCapability,
) {
  return capabilitiesByRole[role].includes(capability);
}

export function requireDocumentCapability(
  role: OrganizationRole,
  capability: DocumentCapability,
) {
  if (!hasDocumentCapability(role, capability)) {
    throw new Error("Du saknar behörighet för den här dokumentåtgärden.");
  }
}
