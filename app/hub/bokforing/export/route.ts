import { buildAccountingCsv, buildPreliminarySie4i } from "@/src/lib/hub/accounting";
import { getAccountingOverview } from "@/src/lib/hub-accounting-server";

function date(value: string | null) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? value : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (format !== "csv" && format !== "sie") return new Response("Ogiltigt exportformat.", { status: 400 });

  const overview = await getAccountingOverview();
  if (!overview.runtimeEnabled || !overview.databaseReady || !overview.permissions.canView) {
    return new Response("Bokföringsexport är inte tillgänglig.", { status: 403 });
  }
  const entries = new Map(overview.reportEntries.map((entry) => [entry.id, entry]));
  const input = {
    organizationName: overview.organization.name,
    accounts: overview.accounts.map((account) => ({ number: account.account_number, name: account.name, kind: account.kind })),
    lines: overview.journalLines.flatMap((line) => {
      const entry = entries.get(line.journal_entry_id);
      return entry ? [{
        journalEntryId: line.journal_entry_id,
        journalLabel: `${entry.journal_series}${entry.journal_number}`,
        description: entry.description,
        postedOn: entry.posted_on,
        accountNumber: line.account_number,
        debitMinor: line.debit_minor,
        creditMinor: line.credit_minor,
      }] : [];
    }),
    from: date(url.searchParams.get("from")),
    to: date(url.searchParams.get("to")),
  };
  const body = format === "csv" ? buildAccountingCsv(input) : buildPreliminarySie4i(input);
  const extension = format === "csv" ? "csv" : "se";
  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="bokforing.${extension}"`,
      "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
