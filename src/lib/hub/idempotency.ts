export type IdempotentOperation =
  | "create_invoice"
  | "finalize_invoice"
  | "record_payment"
  | "post_journal_entry"
  | "upload_document"
  | "start_document_processing"
  | "send_email";

export type IdempotencyRecord = {
  organizationId: string;
  operation: IdempotentOperation;
  key: string;
  requestHash: string;
  status: "started" | "succeeded" | "failed";
  resultEntityType: string | null;
  resultEntityId: string | null;
};

export function buildIdempotencyScope(input: {
  organizationId: string;
  operation: IdempotentOperation;
  key: string;
}) {
  return `${input.organizationId}:${input.operation}:${input.key}`;
}
