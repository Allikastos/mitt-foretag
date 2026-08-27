import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertSafeHubEnvironment } from "./hub/runtime-environment";

export type PostStatus = "draft" | "scheduled" | "published";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: PostStatus;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationRole = "owner" | "admin" | "member" | "viewer";
export type CustomerStatus = "lead" | "active" | "inactive";
export type HubTheme = "nova" | "forest" | "coast" | "graphite";
export type EmployeeCustomerScope = "all_customers" | "assigned_only";
export type BillingPlan = "starter" | "team" | "agency";
export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "unpaid";
export type CustomerVisibility = "organization" | "owners_only";
export type PreferredContactMethod = "email" | "phone" | "meeting" | "none";
export type TaskStatus = "todo" | "in_progress" | "waiting" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type GoalStatus = "active" | "paused" | "completed";
export type DocumentCategory =
  | "receipt"
  | "supplier_invoice"
  | "contract"
  | "bank_statement"
  | "other";
export type DocumentType = "original" | "invoice_pdf" | "generated";
export type DocumentProcessingStatus =
  | "pending"
  | "ready"
  | "failed"
  | "not_required";
export type SourceDocumentProcessingStatus =
  | "uploaded"
  | "processing"
  | "needs_information"
  | "ready"
  | "linked"
  | "failed";
export type DocumentReviewStatus = "incomplete" | "ready_for_review" | "linked";
export type DocumentOcrStatus =
  | "not_requested"
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type DocumentExtractionMethod = "manual" | "ocr";
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";
export type InvoicePdfStatus =
  | "not_started"
  | "processing"
  | "ready"
  | "failed";
export type EmailProvider = "gmail" | "outlook" | "imap";
export type EmailConnectionStatus = "not_connected" | "connected" | "error";
export type ProcessingJobType =
  | "document_processing"
  | "invoice_generation"
  | "sie_export"
  | "report_generation"
  | "email_delivery"
  | "bank_import"
  | "follow_up_digest";
export type ProcessingJobStatus =
  | "queued"
  | "processing"
  | "needs_review"
  | "succeeded"
  | "failed"
  | "cancelled";
export type IntegrationCategory =
  | "database"
  | "private_storage"
  | "document_ai"
  | "background_queue"
  | "hub_email"
  | "bank_import"
  | "subscription_billing"
  | "rate_limiting"
  | "observability"
  | "backup_restore";
export type IntegrationConnectionStatus =
  | "pending"
  | "connected"
  | "degraded"
  | "error"
  | "disconnected";
export type IntegrationHealthStatus =
  | "unknown"
  | "healthy"
  | "degraded"
  | "error";
export type ExternalEventStatus =
  | "processing"
  | "succeeded"
  | "failed"
  | "ignored";
export type AccountingWorkflowStatus =
  | "incomplete"
  | "needs_review"
  | "ready_to_post"
  | "posted"
  | "rejected";
export type AccountingPeriodStatus = "open" | "review" | "locked";

export type OrganizationRow = {
  id: string;
  name: string;
  org_number: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  logo_url: string | null;
  default_vat_rate: number | string;
  payment_terms_days: number;
  invoice_prefix: string;
  next_invoice_number: number;
  bankgiro: string | null;
  plusgiro: string | null;
  bank_account: string | null;
  iban: string | null;
  swift_bic: string | null;
  swish_number: string | null;
  invoice_footer: string | null;
  payment_instructions: string | null;
  late_fee_terms: string | null;
  company_reference: string | null;
  hub_theme: HubTheme;
  employee_customer_scope: EmployeeCustomerScope;
  billing_plan: BillingPlan;
  billing_status: BillingStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  customer_field_preferences: unknown;
  follow_up_email_alerts_enabled: boolean;
  follow_up_alert_email: string | null;
  follow_up_digest_weekday: number;
  created_at: string;
  updated_at: string;
};

export type OrganizationMemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
};

export type CustomerRow = {
  id: string;
  organization_id: string;
  created_by: string | null;
  owner_user_id: string | null;
  visibility: CustomerVisibility;
  company_name: string;
  org_number: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  preferred_contact_method: PreferredContactMethod;
  last_contacted_at: string | null;
  follow_up_date: string | null;
  relationship_owner: string | null;
  tags: string[];
  notes: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
};

export type ContactRow = {
  id: string;
  organization_id: string;
  customer_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role_title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskRow = {
  id: string;
  organization_id: string;
  customer_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessGoalRow = {
  id: string;
  organization_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  target_value: number | string;
  current_value: number | string;
  unit: string;
  due_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  organization_id: string;
  customer_id: string | null;
  invoice_id: string | null;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  category: DocumentCategory;
  notes: string | null;
  uploaded_by: string | null;
  sha256?: string | null;
  document_type?: DocumentType;
  processing_status?: DocumentProcessingStatus;
  original_storage_key?: string | null;
  retention_locked?: boolean;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
};

export type SourceDocumentRow = {
  id: string;
  organization_id: string;
  document_id: string;
  business_event_id: string | null;
  processing_status: SourceDocumentProcessingStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentFactsRow = {
  id: string;
  organization_id: string;
  source_document_id: string;
  document_kind: "receipt" | "supplier_invoice";
  review_status: DocumentReviewStatus;
  extraction_method: DocumentExtractionMethod;
  ocr_status: DocumentOcrStatus;
  ocr_provider: string | null;
  supplier_name: string;
  supplier_org_number: string | null;
  document_number: string | null;
  document_date: string;
  payment_date: string;
  total_minor: number;
  vat_minor: number;
  currency: string;
  description: string;
  suggested_event_type:
    | "paid_domestic_purchase_25_vat"
    | "purchase_without_deductible_vat";
  payment_account: string;
  revision: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceRow = {
  id: string;
  organization_id: string;
  customer_id: string | null;
  invoice_number: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  currency: string;
  customer_name_snapshot: string | null;
  customer_address_snapshot: string | null;
  customer_email_snapshot: string | null;
  notes: string | null;
  subtotal: number | string;
  vat_total: number | string;
  total: number | string;
  finalized_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  locked_at: string | null;
  pdf_document_id: string | null;
  pdf_status?: InvoicePdfStatus;
  pdf_error?: string | null;
  pdf_storage_key?: string | null;
  finalization_idempotency_key?: string | null;
  finalization_started_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceLineRow = {
  id: string;
  organization_id: string;
  invoice_id: string;
  description: string;
  quantity: number | string;
  unit_price: number | string;
  vat_rate: number | string;
  line_subtotal: number | string;
  line_vat: number | string;
  line_total: number | string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ActivityLogRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  action: string;
  description: string | null;
  created_at: string;
};

export type EmailConnectionRow = {
  id: string;
  organization_id: string;
  provider: EmailProvider;
  email_address: string | null;
  status: EmailConnectionStatus;
  created_at: string;
  updated_at: string;
};

export type AiEventRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  feature: string | null;
  input_summary: string | null;
  output_summary: string | null;
  status: string | null;
  created_at: string;
};

export type ProcessingJobRow = {
  id: string;
  organization_id: string;
  type: ProcessingJobType;
  status: ProcessingJobStatus;
  entity_type: string | null;
  entity_id: string | null;
  payload: unknown;
  result: unknown;
  error_message: string | null;
  user_message: string | null;
  last_error_code: string | null;
  idempotency_key_id: string | null;
  deduplication_key: string | null;
  request_hash: string | null;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  available_at: string;
  started_at: string | null;
  finished_at: string | null;
  lease_owner: string | null;
  lease_expires_at: string | null;
  heartbeat_at: string | null;
  cancel_requested_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationConnectionRow = {
  id: string;
  organization_id: string;
  category: IntegrationCategory;
  provider: string;
  status: IntegrationConnectionStatus;
  display_name: string | null;
  configuration_version: number;
  health_status: IntegrationHealthStatus;
  connected_by: string | null;
  connected_at: string | null;
  last_health_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExternalEventReceiptRow = {
  id: string;
  organization_id: string;
  integration_connection_id: string | null;
  provider: string;
  external_event_id: string;
  event_type: string;
  payload_sha256: string;
  status: ExternalEventStatus;
  attempt_count: number;
  failure_code: string | null;
  received_at: string;
  processed_at: string | null;
  updated_at: string;
};

export type CompanyAccountingSettingsRow = {
  organization_id: string;
  company_form: "sole_trader" | "limited_company";
  accounting_method: "cash_basis" | "accrual";
  reporting_currency: string;
  vat_registered: boolean;
  vat_period: "monthly" | "quarterly" | "yearly";
  fiscal_year_start_month: number;
  accounting_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type AccountingAccountRow = {
  id: string;
  organization_id: string;
  account_number: string;
  name: string;
  kind: "asset" | "liability" | "equity" | "income" | "expense";
  is_active: boolean;
  source: string;
  review_required: boolean;
  created_at: string;
  updated_at: string;
};

export type FiscalYearRow = {
  id: string;
  organization_id: string;
  starts_on: string;
  ends_on: string;
  status: AccountingPeriodStatus;
  created_at: string;
  updated_at: string;
};

export type AccountingPeriodRow = {
  id: string;
  organization_id: string;
  fiscal_year_id: string;
  starts_on: string;
  ends_on: string;
  status: AccountingPeriodStatus;
  created_at: string;
  updated_at: string;
};

export type BusinessEventRow = {
  id: string;
  organization_id: string;
  event_type: string;
  status: AccountingWorkflowStatus;
  happened_on: string | null;
  amount_minor: number | null;
  currency: string;
  facts: unknown;
  source_entity_type: string | null;
  source_entity_id: string | null;
  created_by: string | null;
  posted_journal_entry_id: string | null;
  client_request_key?: string | null;
  request_hash?: string | null;
  created_at: string;
  updated_at: string;
};

export type BookkeepingDraftRow = {
  id: string;
  organization_id: string;
  business_event_id: string;
  status: AccountingWorkflowStatus;
  posting_rule_id: string | null;
  posting_rule_version: number | null;
  explanation: string | null;
  lines_json: unknown;
  warnings: string[];
  created_by: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalEntryRow = {
  id: string;
  organization_id: string;
  fiscal_year_id: string;
  accounting_period_id: string;
  business_event_id: string;
  source_document_id: string | null;
  idempotency_key_id: string;
  journal_series: string;
  journal_number: number;
  posted_on: string;
  description: string;
  posting_rule_id: string;
  posting_rule_version: number;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
};

export type JournalLineRow = {
  id: string;
  organization_id: string;
  journal_entry_id: string;
  account_id: string | null;
  account_number: string;
  debit_minor: number;
  credit_minor: number;
  vat_code_id: string | null;
  description: string | null;
  customer_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: PostRow;
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string;
          image_url?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: PostStatus;
          publish_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PostRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: {
          id?: string;
          name: string;
          org_number?: string | null;
          vat_number?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          website?: string | null;
          logo_url?: string | null;
          default_vat_rate?: number;
          payment_terms_days?: number;
          invoice_prefix?: string;
          next_invoice_number?: number;
          bankgiro?: string | null;
          plusgiro?: string | null;
          bank_account?: string | null;
          iban?: string | null;
          swift_bic?: string | null;
          swish_number?: string | null;
          invoice_footer?: string | null;
          payment_instructions?: string | null;
          late_fee_terms?: string | null;
          company_reference?: string | null;
          hub_theme?: HubTheme;
          employee_customer_scope?: EmployeeCustomerScope;
          billing_plan?: BillingPlan;
          billing_status?: BillingStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          customer_field_preferences?: unknown;
          follow_up_email_alerts_enabled?: boolean;
          follow_up_alert_email?: string | null;
          follow_up_digest_weekday?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<OrganizationRow>;
        Relationships: [];
      };
      organization_members: {
        Row: OrganizationMemberRow;
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at?: string;
        };
        Update: Partial<OrganizationMemberRow>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          owner_user_id?: string | null;
          visibility?: CustomerVisibility;
          company_name: string;
          org_number?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          preferred_contact_method?: PreferredContactMethod;
          last_contacted_at?: string | null;
          follow_up_date?: string | null;
          relationship_owner?: string | null;
          tags?: string[];
          notes?: string | null;
          status?: CustomerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CustomerRow>;
        Relationships: [];
      };
      contacts: {
        Row: ContactRow;
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role_title?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ContactRow>;
        Relationships: [];
      };
      tasks: {
        Row: TaskRow;
        Insert: {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<TaskRow>;
        Relationships: [];
      };
      business_goals: {
        Row: BusinessGoalRow;
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          title: string;
          description?: string | null;
          target_value: number | string;
          current_value?: number | string;
          unit?: string;
          due_date?: string | null;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BusinessGoalRow>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRow;
        Insert: {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          invoice_id?: string | null;
          file_name: string;
          file_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          category?: DocumentCategory;
          notes?: string | null;
          uploaded_by?: string | null;
          sha256?: string | null;
          document_type?: DocumentType;
          processing_status?: DocumentProcessingStatus;
          original_storage_key?: string | null;
          retention_locked?: boolean;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<DocumentRow>;
        Relationships: [];
      };
      source_documents: {
        Row: SourceDocumentRow;
        Insert: {
          id?: string;
          organization_id: string;
          document_id: string;
          business_event_id?: string | null;
          processing_status?: SourceDocumentProcessingStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SourceDocumentRow>;
        Relationships: [];
      };
      document_facts: {
        Row: DocumentFactsRow;
        Insert: {
          id?: string;
          organization_id: string;
          source_document_id: string;
          document_kind: "receipt" | "supplier_invoice";
          review_status?: DocumentReviewStatus;
          extraction_method?: DocumentExtractionMethod;
          ocr_status?: DocumentOcrStatus;
          ocr_provider?: string | null;
          supplier_name: string;
          supplier_org_number?: string | null;
          document_number?: string | null;
          document_date: string;
          payment_date: string;
          total_minor: number;
          vat_minor: number;
          currency?: string;
          description: string;
          suggested_event_type:
            | "paid_domestic_purchase_25_vat"
            | "purchase_without_deductible_vat";
          payment_account?: string;
          revision?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<DocumentFactsRow>;
        Relationships: [];
      };
      invoices: {
        Row: InvoiceRow;
        Insert: {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          invoice_number?: string | null;
          status?: InvoiceStatus;
          issue_date?: string;
          due_date?: string | null;
          currency?: string;
          customer_name_snapshot?: string | null;
          customer_address_snapshot?: string | null;
          customer_email_snapshot?: string | null;
          notes?: string | null;
          subtotal?: number;
          vat_total?: number;
          total?: number;
          finalized_at?: string | null;
          sent_at?: string | null;
          paid_at?: string | null;
          locked_at?: string | null;
          pdf_document_id?: string | null;
          pdf_status?: InvoicePdfStatus;
          pdf_error?: string | null;
          pdf_storage_key?: string | null;
          finalization_idempotency_key?: string | null;
          finalization_started_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<InvoiceRow>;
        Relationships: [];
      };
      invoice_lines: {
        Row: InvoiceLineRow;
        Insert: {
          id?: string;
          organization_id: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          vat_rate?: number;
          line_subtotal?: number;
          line_vat?: number;
          line_total?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<InvoiceLineRow>;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLogRow;
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          action: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<ActivityLogRow>;
        Relationships: [];
      };
      email_connections: {
        Row: EmailConnectionRow;
        Insert: {
          id?: string;
          organization_id: string;
          provider: EmailProvider;
          email_address?: string | null;
          status?: EmailConnectionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<EmailConnectionRow>;
        Relationships: [];
      };
      ai_events: {
        Row: AiEventRow;
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          feature?: string | null;
          input_summary?: string | null;
          output_summary?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: Partial<AiEventRow>;
        Relationships: [];
      };
      processing_jobs: {
        Row: ProcessingJobRow;
        Insert: {
          id?: string;
          organization_id: string;
          type: ProcessingJobType;
          status?: ProcessingJobStatus;
          entity_type?: string | null;
          entity_id?: string | null;
          payload?: unknown;
          result?: unknown;
          error_message?: string | null;
          user_message?: string | null;
          last_error_code?: string | null;
          idempotency_key_id?: string | null;
          deduplication_key?: string | null;
          request_hash?: string | null;
          priority?: number;
          attempt_count?: number;
          max_attempts?: number;
          available_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          lease_owner?: string | null;
          lease_expires_at?: string | null;
          heartbeat_at?: string | null;
          cancel_requested_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProcessingJobRow>;
        Relationships: [];
      };
      integration_connections: {
        Row: IntegrationConnectionRow;
        Insert: {
          id?: string;
          organization_id: string;
          category: IntegrationCategory;
          provider: string;
          status?: IntegrationConnectionStatus;
          display_name?: string | null;
          configuration_version?: number;
          health_status?: IntegrationHealthStatus;
          connected_by?: string | null;
          connected_at?: string | null;
          last_health_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<IntegrationConnectionRow>;
        Relationships: [];
      };
      external_event_receipts: {
        Row: ExternalEventReceiptRow;
        Insert: {
          id?: string;
          organization_id: string;
          integration_connection_id?: string | null;
          provider: string;
          external_event_id: string;
          event_type: string;
          payload_sha256: string;
          status?: ExternalEventStatus;
          attempt_count?: number;
          failure_code?: string | null;
          received_at?: string;
          processed_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<ExternalEventReceiptRow>;
        Relationships: [];
      };
      company_accounting_settings: {
        Row: CompanyAccountingSettingsRow;
        Insert: {
          organization_id: string;
          company_form?: "sole_trader" | "limited_company";
          accounting_method?: "cash_basis" | "accrual";
          reporting_currency?: string;
          vat_registered?: boolean;
          vat_period?: "monthly" | "quarterly" | "yearly";
          fiscal_year_start_month?: number;
          accounting_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CompanyAccountingSettingsRow>;
        Relationships: [];
      };
      accounting_accounts: {
        Row: AccountingAccountRow;
        Insert: {
          id?: string;
          organization_id: string;
          account_number: string;
          name: string;
          kind: AccountingAccountRow["kind"];
          is_active?: boolean;
          source?: string;
          review_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<AccountingAccountRow>;
        Relationships: [];
      };
      fiscal_years: {
        Row: FiscalYearRow;
        Insert: {
          id?: string;
          organization_id: string;
          starts_on: string;
          ends_on: string;
          status?: AccountingPeriodStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<FiscalYearRow>;
        Relationships: [];
      };
      accounting_periods: {
        Row: AccountingPeriodRow;
        Insert: {
          id?: string;
          organization_id: string;
          fiscal_year_id: string;
          starts_on: string;
          ends_on: string;
          status?: AccountingPeriodStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<AccountingPeriodRow>;
        Relationships: [];
      };
      business_events: {
        Row: BusinessEventRow;
        Insert: {
          id?: string;
          organization_id: string;
          event_type: string;
          status?: AccountingWorkflowStatus;
          happened_on?: string | null;
          amount_minor?: number | null;
          currency?: string;
          facts?: unknown;
          source_entity_type?: string | null;
          source_entity_id?: string | null;
          created_by?: string | null;
          posted_journal_entry_id?: string | null;
          client_request_key?: string | null;
          request_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BusinessEventRow>;
        Relationships: [];
      };
      bookkeeping_drafts: {
        Row: BookkeepingDraftRow;
        Insert: {
          id?: string;
          organization_id: string;
          business_event_id: string;
          status?: AccountingWorkflowStatus;
          posting_rule_id?: string | null;
          posting_rule_version?: number | null;
          explanation?: string | null;
          lines_json?: unknown;
          warnings?: string[];
          created_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BookkeepingDraftRow>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: {
          id?: string;
          organization_id: string;
          fiscal_year_id: string;
          accounting_period_id: string;
          business_event_id: string;
          source_document_id?: string | null;
          idempotency_key_id: string;
          journal_series?: string;
          journal_number: number;
          posted_on: string;
          description: string;
          posting_rule_id: string;
          posting_rule_version: number;
          created_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: Partial<JournalEntryRow>;
        Relationships: [];
      };
      journal_lines: {
        Row: JournalLineRow;
        Insert: {
          id?: string;
          organization_id: string;
          journal_entry_id: string;
          account_id?: string | null;
          account_number: string;
          debit_minor?: number;
          credit_minor?: number;
          vat_code_id?: string | null;
          description?: string | null;
          customer_id?: string | null;
          created_at?: string;
        };
        Update: Partial<JournalLineRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_hub_organization: {
        Args: {
          target_name: string;
          target_org_number?: string | null;
          target_email?: string | null;
        };
        Returns: string;
      };
      begin_hub_idempotent_operation: {
        Args: {
          target_organization_id: string;
          target_operation: string;
          target_key: string;
          target_request_hash: string;
        };
        Returns: unknown;
      };
      complete_hub_idempotent_operation: {
        Args: {
          target_organization_id: string;
          target_operation: string;
          target_key: string;
          target_result_entity_type: string;
          target_result_entity_id: string;
        };
        Returns: undefined;
      };
      fail_hub_idempotent_operation: {
        Args: {
          target_organization_id: string;
          target_operation: string;
          target_key: string;
          target_error_message: string;
        };
        Returns: undefined;
      };
      begin_invoice_finalization: {
        Args: {
          target_organization_id: string;
          target_invoice_id: string;
          target_idempotency_key: string;
        };
        Returns: unknown;
      };
      complete_invoice_finalization: {
        Args: {
          target_organization_id: string;
          target_invoice_id: string;
          target_idempotency_key: string;
          target_document_id: string;
        };
        Returns: undefined;
      };
      fail_invoice_finalization: {
        Args: {
          target_organization_id: string;
          target_invoice_id: string;
          target_idempotency_key: string;
          target_error_message: string;
        };
        Returns: undefined;
      };
      post_bookkeeping_draft: {
        Args: {
          target_organization_id: string;
          target_draft_id: string;
          target_idempotency_key: string;
          target_journal_series?: string;
        };
        Returns: string;
      };
      initialize_accounting_mvp: {
        Args: {
          target_organization_id: string;
          target_fiscal_year_start: string;
          target_fiscal_year_end: string;
        };
        Returns: string;
      };
      save_bookkeeping_draft: {
        Args: {
          target_organization_id: string;
          target_client_request_key: string;
          target_event_type: string;
          target_happened_on: string;
          target_amount_minor: number;
          target_description: string;
          target_facts: unknown;
          target_posting_rule_id: string;
          target_posting_rule_version: number;
          target_lines: unknown;
          target_warnings: string[];
        };
        Returns: string;
      };
      approve_bookkeeping_draft: {
        Args: {
          target_organization_id: string;
          target_draft_id: string;
        };
        Returns: undefined;
      };
      save_document_facts: {
        Args: {
          target_organization_id: string;
          target_document_id: string;
          target_document_kind: "receipt" | "supplier_invoice";
          target_supplier_name: string;
          target_supplier_org_number: string | null;
          target_document_number: string | null;
          target_document_date: string;
          target_payment_date: string;
          target_total_minor: number;
          target_vat_minor: number;
          target_description: string;
          target_suggested_event_type:
            | "paid_domestic_purchase_25_vat"
            | "purchase_without_deductible_vat";
          target_payment_account: string;
        };
        Returns: string;
      };
      link_source_document_to_draft: {
        Args: {
          target_organization_id: string;
          target_document_id: string;
          target_draft_id: string;
        };
        Returns: undefined;
      };
      enqueue_processing_job: {
        Args: {
          target_organization_id: string;
          target_created_by: string | null;
          target_type: ProcessingJobType;
          target_entity_type: string | null;
          target_entity_id: string | null;
          target_payload: unknown;
          target_deduplication_key: string;
          target_request_hash: string;
          target_priority?: number;
          target_max_attempts?: number;
        };
        Returns: string;
      };
      cancel_processing_job: {
        Args: {
          target_organization_id: string;
          target_job_id: string;
          target_reason: string;
        };
        Returns: ProcessingJobStatus;
      };
      retry_processing_job: {
        Args: {
          target_organization_id: string;
          target_job_id: string;
        };
        Returns: undefined;
      };
      claim_next_invoice_number: {
        Args: {
          target_organization_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | null = null;
export const BLOG_IMAGES_BUCKET = "blog-images";

function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: getSupabasePublicKey(),
  };
}

export function hasSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}

function requireSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a public Supabase key."
    );
  }

  return { url, anonKey };
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = requireSupabaseEnv();

  assertSafeHubEnvironment({
    NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT:
      process.env.NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT,
    NEXT_PUBLIC_HUB_DATA_ENVIRONMENT:
      process.env.NEXT_PUBLIC_HUB_DATA_ENVIRONMENT,
    NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF:
      process.env.NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF,
    NEXT_PUBLIC_SUPABASE_URL: url,
  });

  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}

export function createPublicSupabaseClient() {
  const { url, anonKey } = requireSupabaseEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
