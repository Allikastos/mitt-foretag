import { NextRequest } from "next/server";
import { normalizeCustomerSearch } from "@/src/lib/hub/customer-search";
import { requireHubContext } from "@/src/lib/hub-server";

export async function GET(request: NextRequest) {
  const { supabase, organization, membership, user } = await requireHubContext();
  const query = normalizeCustomerSearch(request.nextUrl.searchParams.get("q") ?? "");
  const selectedId = request.nextUrl.searchParams.get("selected_id")?.trim();
  const isOwnerLevel = ["owner", "admin"].includes(membership.role);

  let customersQuery = supabase
    .from("customers")
    .select("id, company_name")
    .eq("organization_id", organization.id)
    .order("company_name", { ascending: true })
    .limit(30);

  if (selectedId && !query) {
    customersQuery = customersQuery.eq("id", selectedId);
  } else if (query.length >= 2) {
    customersQuery = customersQuery.ilike("company_name", `%${query}%`);
  } else {
    return Response.json({ customers: [] });
  }

  if (!isOwnerLevel) {
    customersQuery = customersQuery.eq("visibility", "organization");

    if (organization.employee_customer_scope === "assigned_only") {
      customersQuery = customersQuery.or(
        `created_by.eq.${user.id},owner_user_id.eq.${user.id}`,
      );
    }
  }

  const { data, error } = await customersQuery;

  if (error) {
    return Response.json(
      { customers: [], error: "Kundsökningen kunde inte genomföras just nu." },
      { status: 500 },
    );
  }

  return Response.json({ customers: data ?? [] });
}
