import Link from "next/link";
import { DocumentUploadForm } from "@/components/hub/forms";
import { HubPagination } from "@/components/hub/pagination";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  documentReviewStatusLabel,
  documentReviewStatusTone,
} from "@/src/lib/hub/documents";
import {
  documentCategoryLabel,
  formatDate,
} from "@/src/lib/hub";
import { getDocumentReviewSummaries } from "@/src/lib/hub-documents-server";
import { getDocuments, getHubLists } from "@/src/lib/hub-server";

export default async function HubDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const filters = await searchParams;
  const [documents, lists] = await Promise.all([
    getDocuments({ page: filters.page }),
    getHubLists(),
  ]);
  const reviewData = await getDocumentReviewSummaries(
    documents.items.map((document) => document.id),
  );
  const reviewedCount = Object.values(reviewData.summaries).filter(
    (summary) => summary.reviewStatus === "ready_for_review",
  ).length;
  const linkedCount = Object.values(reviewData.summaries).filter(
    (summary) => summary.linked,
  ).length;

  return (
    <HubShell
      title="Dokument"
      description="Samla original, kontrollera uppgifter och förbered underlag utan att skicka filer till externa AI-tjänster."
    >
      <section className="overflow-hidden rounded-[1.8rem] bg-[var(--hub-panel)] p-6 text-[var(--hub-panel-contrast)] shadow-[0_32px_80px_-54px_rgba(0,0,0,0.65)] md:p-8">
        <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--hub-accent)]">
              Dokumentinkorg
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
              Originalet först. Manuellt granskat innan bokföring.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--hub-panel-muted)]">
              Varje fil behålls separat från uppgifterna du fyller i. Ett dokument blir aldrig bokfört bara för att det har laddats upp.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-2xl font-semibold">{documents.totalCount}</p>
              <p className="mt-1 text-xs text-[var(--hub-panel-muted)]">Original</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-2xl font-semibold">{reviewedCount}</p>
              <p className="mt-1 text-xs text-[var(--hub-panel-muted)]">Granskade här</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-2xl font-semibold">{linkedCount}</p>
              <p className="mt-1 text-xs text-[var(--hub-panel-muted)]">Kopplade här</p>
            </div>
          </div>
        </div>
      </section>

      {!reviewData.runtimeEnabled ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="font-semibold">Manuell dokumentgranskning visas i förhandsläge</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Öppna ett dokument för att prova flödet. Inga strukturerade uppgifter sparas förrän fas D-migreringen och säkerhetsflaggorna har aktiverats.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Arbetskö</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">Dokument att granska</h2>
            </div>
            <p className="text-sm text-[var(--hub-muted)]">{documents.totalCount} dokument</p>
          </div>
          <div className="mt-5 space-y-3">
            {documents.items.length ? (
              documents.items.map((document) => {
                const summary = reviewData.summaries[document.id];
                const reviewStatus = summary?.linked
                  ? "linked"
                  : summary?.reviewStatus ?? "incomplete";

                return (
                <article key={document.id} className="rounded-[1.25rem] border border-black/8 bg-[var(--hub-card-soft)] p-4 transition hover:border-black/14 hover:bg-[var(--hub-card)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Link href={`/hub/dokument/${document.id}`} className="font-medium text-[var(--hub-text)]">
                        {document.file_name}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--hub-muted)]">
                        {document.customers?.company_name ?? "Ej kopplad kund"} •{" "}
                        {document.invoices?.invoice_number ?? "Ej kopplad faktura"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={documentReviewStatusTone(reviewStatus)}>
                        {documentReviewStatusLabel(reviewStatus)}
                      </StatusBadge>
                      <StatusBadge>{documentCategoryLabel(document.category)}</StatusBadge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--hub-muted)]">
                    <span>Uppladdad {formatDate(document.created_at)}</span>
                    <Link href={`/hub/dokument/${document.id}`} className="font-medium text-[var(--hub-text)]">
                      Granska uppgifter
                    </Link>
                    {document.signedUrl ? (
                      <Link
                        href={document.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[var(--hub-text)]"
                      >
                        Öppna original
                      </Link>
                    ) : null}
                  </div>
                </article>
              );})
            ) : (
              <EmptyState
                title="Ladda upp första dokumentet"
                description="Här kan ni samla kvitton, avtal, fakturaunderlag och andra viktiga filer i en privat bucket."
              />
            )}
          </div>
          <HubPagination basePath="/hub/dokument" {...documents} />
        </HubCard>

        <DocumentUploadForm customers={lists.customers} invoices={lists.invoices} />
      </div>
    </HubShell>
  );
}
