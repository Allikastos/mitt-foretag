import Link from "next/link";
import { DocumentUploadForm } from "@/components/hub/forms";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  documentCategoryLabel,
  formatDate,
} from "@/src/lib/hub";
import { getDocuments, getHubLists } from "@/src/lib/hub-server";

export default async function HubDocumentsPage() {
  const [documents, lists] = await Promise.all([getDocuments(), getHubLists()]);

  return (
    <HubShell
      title="Dokument"
      description="Ladda upp och organisera privata företagsdokument i en säker dokumentyta."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HubCard>
          <h2 className="text-lg font-semibold text-[#0B0B0C]">Dokumentarkiv</h2>
          <div className="mt-5 space-y-3">
            {documents.length ? (
              documents.map((document) => (
                <div key={document.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-[#0B0B0C]">{document.file_name}</p>
                      <p className="mt-1 text-sm text-[#6B6B6B]">
                        {document.customers?.company_name ?? "Ej kopplad kund"} •{" "}
                        {document.invoices?.invoice_number ?? "Ej kopplad faktura"}
                      </p>
                    </div>
                    <StatusBadge>{documentCategoryLabel(document.category)}</StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#6B6B6B]">
                    <span>Uppladdad {formatDate(document.created_at)}</span>
                    {document.signedUrl ? (
                      <Link
                        href={document.signedUrl}
                        target="_blank"
                        className="font-medium text-[#0B0B0C]"
                      >
                        Öppna dokument
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Ladda upp första dokumentet"
                description="Här kan ni samla kvitton, avtal, fakturaunderlag och andra viktiga filer i en privat bucket."
              />
            )}
          </div>
        </HubCard>

        <DocumentUploadForm customers={lists.customers} invoices={lists.invoices} />
      </div>
    </HubShell>
  );
}
