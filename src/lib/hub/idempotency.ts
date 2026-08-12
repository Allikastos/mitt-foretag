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

export type IdempotencyDecision =
  | { outcome: "start" | "retry" }
  | {
      outcome: "replay";
      resultEntityType: string | null;
      resultEntityId: string | null;
    };

export function normalizeIdempotencyKey(key: string) {
  const normalized = key.trim();

  if (normalized.length < 8 || normalized.length > 200) {
    throw new Error("Idempotensnyckeln måste vara mellan 8 och 200 tecken.");
  }

  return normalized;
}

export function decideIdempotentOperation(params: {
  existing: IdempotencyRecord | null;
  requestHash: string;
}): IdempotencyDecision {
  const { existing, requestHash } = params;

  if (!existing) return { outcome: "start" };

  if (existing.requestHash !== requestHash) {
    throw new Error("Idempotensnyckeln har redan använts för ett annat anrop.");
  }

  if (existing.status === "succeeded") {
    return {
      outcome: "replay",
      resultEntityType: existing.resultEntityType,
      resultEntityId: existing.resultEntityId,
    };
  }

  if (existing.status === "started") {
    throw new Error("Ett identiskt anrop behandlas redan.");
  }

  return { outcome: "retry" };
}

export function buildIdempotencyScope(input: {
  organizationId: string;
  operation: IdempotentOperation;
  key: string;
}) {
  return `${input.organizationId}:${input.operation}:${input.key}`;
}
