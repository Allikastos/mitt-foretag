export type HubMembershipIdentity = {
  organization_id: string;
  user_id: string;
};

export function assertMembership(params: {
  membership: HubMembershipIdentity | null | undefined;
  organizationId: string;
  userId: string;
}) {
  if (
    !params.membership ||
    params.membership.organization_id !== params.organizationId ||
    params.membership.user_id !== params.userId
  ) {
    throw new Error("Du saknar medlemskap i det här företaget.");
  }
}

export function assertTenantResource(params: {
  activeOrganizationId: string;
  resourceOrganizationId: string | null | undefined;
}) {
  if (
    !params.resourceOrganizationId ||
    params.resourceOrganizationId !== params.activeOrganizationId
  ) {
    throw new Error("Objektet tillhör inte det aktiva företaget.");
  }
}

type TenantScopedQuery<TQuery> = {
  eq(column: string, value: string): TQuery;
};

export function scopeTenantResourceQuery<
  TQuery extends TenantScopedQuery<TQuery>,
>(query: TQuery, params: { organizationId: string; resourceId: string }) {
  return query
    .eq("organization_id", params.organizationId)
    .eq("id", params.resourceId);
}
