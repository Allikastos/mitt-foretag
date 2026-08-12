import Link from "next/link";
import { DocumentFactsForm } from "@/components/hub/document-facts-form";
import { CreateDocumentAccountingDraftForm } from "@/components/hub/document-workflow-forms";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  accountingEventLabel,
  accountingStatusLabel,
  accountingStatusTone,
} from "@/src/lib/hub/accounting";
import {
  documentReviewStatusLabel,
  documentReviewStatusTone,
  manualDocumentKindLabel,
} from "@/src/lib/hub/documents";
import { formatDate } from "@/src/lib/hub";
import { getDocumentWorkspace } from "@/src/lib/hub-documents-server";

function formatBytes(size: number | null) {
  if (!size) return "Okänd storlek";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} kB`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export default async function HubDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await getDocumentWorkspace(id);
  const { document, facts, sourceDocument, linkedDraft, linkedEvent } = workspace;
  const isLinked = Boolean(sourceDocument?.business_event_id);
  const canPersistFacts =
    workspace.documentRuntimeEnabled &&
    workspace.databaseReady &&
    workspace.permissions.canEditFacts &&
    !isLinked;
  const canCreateDraft =
    canPersistFacts &&
    Boolean(facts) &&
    workspace.accountingRuntimeEnabled &&
    workspace.accountingConfigured &&
    workspace.permissions.canCreateAccountingDraft;
  const defaultKind =
    document.category === "supplier_invoice" ? "supplier_invoice" : "receipt";

  return (
    <HubShell
      title={document.file_name}
      description="Granska originalfilen, komplettera uppgifterna och skapa därefter ett separat konteringsutkast."
      actions={
        <Link
          href="/hub/dokument"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-[var(--hub-card)] px-5 py-3 text-sm font-medium text-[var(--hub-text)]"
        >
          Till dokumentinkorgen
        </Link>
      }
    >
      {!workspace.documentRuntimeEnabled ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="font-semibold">Förhandsläge, inga uppgifter sparas</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Du kan kontrollera hela formuläret och konteringsförslaget lokalt. Manuell lagring och bokföringskoppling är avstängda tills dokumentmigreringen har granskats.
          </p>
        </div>
      ) : !workspace.databaseReady ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-950">
          <p className="font-semibold">Dokumentdatabasen är inte installerad</p>
          <p className="mt-1 text-sm leading-6 text-red-800">
            Funktionsflaggorna är aktiva men fas D-tabellerna saknas. Sparande förblir blockerat.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <HubCard className="overflow-hidden">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
              Originalfil
            </p>
            <div className="mt-4 rounded-[1.3rem] bg-[var(--hub-panel)] p-5 text-[var(--hub-panel-contrast)]">
              <p className="break-words text-lg font-semibold">{document.file_name}</p>
              <p className="mt-2 text-sm text-[var(--hub-panel-muted)]">
                {formatBytes(document.size_bytes)} · {document.mime_type || "Okänd filtyp"}
              </p>
              <p className="mt-1 text-sm text-[var(--hub-panel-muted)]">
                Uppladdad {formatDate(document.created_at)}
              </p>
              {document.signedUrl ? (
                <a
                  href={document.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-[#111111]"
                >
                  Öppna originalet
                </a>
              ) : (
                <p className="mt-5 text-sm text-[var(--hub-panel-muted)]">
                  En säker visningslänk kunde inte skapas.
                </p>
              )}
            </div>
            {document.notes ? (
              <p className="mt-4 text-sm leading-6 text-[var(--hub-muted)]">{document.notes}</p>
            ) : null}
          </HubCard>

          <HubCard>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
              Arbetsflöde
            </p>
            <div className="mt-5 space-y-4">
              {[
                ["01", "Original uppladdat", true],
                ["02", "Uppgifter kontrollerade", Boolean(facts)],
                ["03", "Kopplad till konteringsutkast", isLinked],
              ].map(([number, label, complete]) => (
                <div key={String(number)} className="flex items-center gap-3">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)]" : "bg-[var(--hub-card-soft)] text-[var(--hub-muted)]"}`}>
                    {number}
                  </span>
                  <p className="text-sm font-medium text-[var(--hub-text)]">{label}</p>
                </div>
              ))}
            </div>
          </HubCard>

          <HubCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                  OCR och AI
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--hub-text)]">Inte aktiverat</h2>
              </div>
              <StatusBadge>Manuellt</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">
              Ingen fil eller dokumenttext skickas till en extern AI- eller OCR-tjänst. Statusfältet finns för en senare, uttryckligen godkänd integration.
            </p>
          </HubCard>
        </div>

        <div className="space-y-6">
          <DocumentFactsForm
            documentId={document.id}
            organizationId={workspace.organization.id}
            defaultKind={defaultKind}
            initialFacts={facts}
            canPersist={canPersistFacts}
            isLocked={isLinked}
          />

          {facts ? (
            <HubCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                    Nästa steg
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">
                    {isLinked ? "Underlaget är kopplat" : "Skapa ett granskningsutkast"}
                  </h2>
                </div>
                <StatusBadge tone={documentReviewStatusTone(facts.review_status)}>
                  {documentReviewStatusLabel(facts.review_status)}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">
                {manualDocumentKindLabel(facts.document_kind)} från {facts.supplier_name}. Det manuella underlaget är revision {facts.revision}.
              </p>

              {linkedDraft && linkedEvent ? (
                <div className="mt-5 rounded-[1.3rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[var(--hub-text)]">
                      {accountingEventLabel(linkedEvent.event_type)}
                    </p>
                    <StatusBadge tone={accountingStatusTone(linkedDraft.status)}>
                      {accountingStatusLabel(linkedDraft.status)}
                    </StatusBadge>
                  </div>
                  <Link href="/hub/bokforing" className="mt-3 inline-flex text-sm font-medium text-[var(--hub-text)]">
                    Öppna bokföringskön
                  </Link>
                </div>
              ) : canCreateDraft ? (
                <CreateDocumentAccountingDraftForm documentId={document.id} />
              ) : !workspace.accountingRuntimeEnabled ? (
                <p className="mt-4 rounded-2xl bg-[var(--hub-card-soft)] p-4 text-sm leading-6 text-[var(--hub-muted)]">
                  Bokföringskopplingen förblir avstängd tills både dokument- och bokföringsflaggorna är granskade och aktiverade.
                </p>
              ) : !workspace.accountingConfigured ? (
                <p className="mt-4 rounded-2xl bg-[var(--hub-card-soft)] p-4 text-sm leading-6 text-[var(--hub-muted)]">
                  En ägare eller administratör behöver först skapa bokföringsgrunden under Bokföring.
                </p>
              ) : null}
            </HubCard>
          ) : null}
        </div>
      </div>
    </HubShell>
  );
}
