export type ExtractedMoney = {
  amountMinor: number;
  currency: "SEK" | string;
};

export type ExtractedVatLine = {
  vatRateBasisPoints: number;
  netMinor: number;
  vatMinor: number;
};

export type ExtractedDocumentLine = {
  description: string | null;
  quantity: number | null;
  unitPriceMinor: number | null;
  netMinor: number | null;
  vatMinor: number | null;
  totalMinor: number | null;
};

export type DocumentProcessingResult = {
  documentType:
    | "receipt"
    | "supplier_invoice"
    | "customer_invoice"
    | "bank_statement"
    | "unknown";
  counterpartyName: string | null;
  counterpartyOrgNumber: string | null;
  documentNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  currency: string | null;
  net: ExtractedMoney | null;
  vat: ExtractedMoney | null;
  total: ExtractedMoney | null;
  vatLines: ExtractedVatLine[];
  lines: ExtractedDocumentLine[];
  country: string | null;
  suggestedCategory: string | null;
  confidence: "high" | "medium" | "low";
  warnings: string[];
  requiredQuestions: string[];
};

export interface DocumentProcessor {
  process(input: {
    organizationId: string;
    documentId: string;
    storageKey: string;
  }): Promise<DocumentProcessingResult>;
}

export class DisabledDocumentProcessor implements DocumentProcessor {
  async process(): Promise<DocumentProcessingResult> {
    throw new Error(
      "Document processing is disabled until a reviewed provider is connected.",
    );
  }
}
