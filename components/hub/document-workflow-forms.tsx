import { createDocumentAccountingDraftAction } from "@/app/hub/document-actions";
import { SubmitButton } from "./submit-button";

export function CreateDocumentAccountingDraftForm({
  documentId,
}: {
  documentId: string;
}) {
  return (
    <form action={createDocumentAccountingDraftAction} className="mt-4">
      <input type="hidden" name="document_id" value={documentId} />
      <SubmitButton>Skapa konteringsutkast</SubmitButton>
    </form>
  );
}
