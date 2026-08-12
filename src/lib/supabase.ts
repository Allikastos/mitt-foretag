import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
    };
    Views: Record<string, never>;
    Functions: {
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
