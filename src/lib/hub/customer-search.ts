export type CustomerSearchOption = {
  id: string;
  company_name: string;
};

export function normalizeCustomerSearch(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function filterCustomerOptions(
  customers: CustomerSearchOption[],
  query: string,
  limit = 30,
) {
  const normalizedQuery = normalizeCustomerSearch(query).toLocaleLowerCase("sv");
  const matches = normalizedQuery
    ? customers.filter((customer) =>
        customer.company_name.toLocaleLowerCase("sv").includes(normalizedQuery),
      )
    : customers;

  return matches.slice(0, limit);
}

export function mergeCustomerOptions(
  primary: CustomerSearchOption[],
  fallback: CustomerSearchOption[],
  limit = 30,
) {
  const seen = new Set<string>();

  return [...primary, ...fallback]
    .filter((customer) => {
      if (seen.has(customer.id)) return false;
      seen.add(customer.id);
      return true;
    })
    .slice(0, limit);
}
