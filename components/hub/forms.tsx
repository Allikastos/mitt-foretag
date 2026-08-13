import { randomUUID } from "node:crypto";
import {
  canEditInvoice,
  customerFieldKeys,
  customerFieldLabel,
  customerStatusLabel,
  customerStatuses,
  documentCategoryLabel,
  documentCategories,
  employeeCustomerScopeLabel,
  employeeCustomerScopes,
  formatTags,
  getCustomerFieldPreferences,
  invoiceStatusLabel,
  invoiceStatuses,
  preferredContactMethodLabel,
  preferredContactMethods,
  priorityLabel,
  taskPriorities,
  taskStatusLabel,
  taskStatuses,
} from "@/src/lib/hub";
import type {
  Customer,
  Invoice,
  InvoiceLine,
  Organization,
  Task,
} from "@/src/lib/hub";
import {
  Field,
  FormGrid,
  HubCard,
  SecondaryLink,
  inputClassName,
  textareaClassName,
} from "./ui";
import { SubmitButton } from "./submit-button";
import { ThemePicker } from "./theme-picker";
import {
  finalizeInvoiceAction,
  saveContactAction,
  saveCustomerAction,
  saveInvoiceAction,
  saveInvoiceLineAction,
  saveTaskAction,
  updateInvoiceStatusAction,
  updateOrganizationSettingsAction,
  uploadDocumentAction,
} from "@/app/hub/actions";

export function CustomerForm({ customer }: { customer?: Customer | null }) {
  return (
    <HubCard>
      <form action={saveCustomerAction} className="space-y-4">
        <input type="hidden" name="customer_id" defaultValue={customer?.id ?? ""} />
        <FormGrid>
          <Field label="Företagsnamn">
            <input
              name="company_name"
              defaultValue={customer?.company_name ?? ""}
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Organisationsnummer">
            <input
              name="org_number"
              defaultValue={customer?.org_number ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Kontaktperson">
            <input
              name="contact_name"
              defaultValue={customer?.contact_name ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="E-post">
            <input
              type="email"
              name="email"
              defaultValue={customer?.email ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Telefon">
            <input
              name="phone"
              defaultValue={customer?.phone ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Föredragen kontaktkanal">
            <select
              name="preferred_contact_method"
              defaultValue={customer?.preferred_contact_method ?? "email"}
              className={inputClassName}
            >
              {preferredContactMethods.map((method) => (
                <option key={method} value={method}>
                  {preferredContactMethodLabel(method)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={customer?.status ?? "active"}
              className={inputClassName}
            >
              {customerStatuses.map((status) => (
                <option key={status} value={status}>
                  {customerStatusLabel(status)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Synlighet">
            <select
              name="visibility"
              defaultValue={customer?.visibility ?? "organization"}
              className={inputClassName}
            >
              <option value="organization">Hela företaget</option>
              <option value="owners_only">Endast ägare/admin</option>
            </select>
          </Field>
          <Field label="Senast kontaktad">
            <input
              type="date"
              name="last_contacted_at"
              defaultValue={customer?.last_contacted_at ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Nästa återkoppling">
            <input
              type="date"
              name="follow_up_date"
              defaultValue={customer?.follow_up_date ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Relationsansvarig">
            <input
              name="relationship_owner"
              defaultValue={customer?.relationship_owner ?? ""}
              className={inputClassName}
              placeholder="Ex. Albin"
            />
          </Field>
          <Field label="Taggar">
            <input
              name="tags"
              defaultValue={formatTags(customer?.tags).replace("Ej angivet", "")}
              className={inputClassName}
              placeholder="månadsrapport, prioritet, Q3"
            />
          </Field>
        </FormGrid>
        <Field label="Adress">
          <input
            name="address"
            defaultValue={customer?.address ?? ""}
            className={inputClassName}
          />
        </Field>
        <Field label="Anteckningar">
          <textarea
            name="notes"
            defaultValue={customer?.notes ?? ""}
            className={textareaClassName}
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <SubmitButton>{customer ? "Uppdatera kund" : "Skapa kund"}</SubmitButton>
          {customer ? <SecondaryLink href="/hub/kunder">Tillbaka</SecondaryLink> : null}
        </div>
      </form>
    </HubCard>
  );
}

export function ContactForm({ customerId }: { customerId: string }) {
  return (
    <HubCard>
      <form action={saveContactAction} className="space-y-4">
        <input type="hidden" name="customer_id" value={customerId} />
        <FormGrid>
          <Field label="Namn">
            <input name="name" className={inputClassName} required />
          </Field>
          <Field label="Roll">
            <input name="role_title" className={inputClassName} />
          </Field>
          <Field label="E-post">
            <input type="email" name="email" className={inputClassName} />
          </Field>
          <Field label="Telefon">
            <input name="phone" className={inputClassName} />
          </Field>
        </FormGrid>
        <Field label="Anteckningar">
          <textarea name="notes" className={textareaClassName} />
        </Field>
        <SubmitButton>Lägg till kontakt</SubmitButton>
      </form>
    </HubCard>
  );
}

export function TaskForm({
  task,
  customers,
}: {
  task?: Task | null;
  customers: Array<{ id: string; company_name: string }>;
}) {
  return (
    <HubCard>
      <form action={saveTaskAction} className="space-y-4">
        <input type="hidden" name="task_id" defaultValue={task?.id ?? ""} />
        <FormGrid>
          <Field label="Titel">
            <input
              name="title"
              defaultValue={task?.title ?? ""}
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Kund">
            <select
              name="customer_id"
              defaultValue={task?.customer_id ?? ""}
              className={inputClassName}
            >
              <option value="">Ingen kund kopplad</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={task?.status ?? "todo"}
              className={inputClassName}
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {taskStatusLabel(status)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioritet">
            <select
              name="priority"
              defaultValue={task?.priority ?? "medium"}
              className={inputClassName}
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabel(priority)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Förfallodatum">
            <input
              type="date"
              name="due_date"
              defaultValue={task?.due_date ?? ""}
              className={inputClassName}
            />
          </Field>
        </FormGrid>
        <Field label="Beskrivning">
          <textarea
            name="description"
            defaultValue={task?.description ?? ""}
            className={textareaClassName}
          />
        </Field>
        <SubmitButton>{task ? "Uppdatera uppgift" : "Skapa uppgift"}</SubmitButton>
      </form>
    </HubCard>
  );
}

export function InvoiceForm({
  invoice,
  customers,
  organization,
}: {
  invoice?: Invoice | null;
  customers: Array<{ id: string; company_name: string }>;
  organization: Organization;
}) {
  const isLocked = invoice ? !canEditInvoice(invoice) : false;

  return (
    <HubCard>
      <form action={saveInvoiceAction} className="space-y-4">
        <input type="hidden" name="invoice_id" defaultValue={invoice?.id ?? ""} />
        <FormGrid>
          <Field label="Kund">
            <select
              name="customer_id"
              defaultValue={invoice?.customer_id ?? ""}
              className={inputClassName}
              disabled={isLocked}
            >
              <option value="">Välj kund</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <input
              value={invoiceStatusLabel(invoice?.status ?? "draft")}
              className={inputClassName}
              disabled
            />
          </Field>
          <Field label="Fakturadatum">
            <input
              type="date"
              name="issue_date"
              defaultValue={invoice?.issue_date ?? new Date().toISOString().slice(0, 10)}
              className={inputClassName}
              disabled={isLocked}
            />
          </Field>
          <Field label="Förfallodatum">
            <input
              type="date"
              name="due_date"
              defaultValue={invoice?.due_date ?? ""}
              className={inputClassName}
              disabled={isLocked}
            />
          </Field>
          <Field label="Valuta">
            <input
              name="currency"
              defaultValue={invoice?.currency ?? "SEK"}
              className={inputClassName}
              disabled={isLocked}
            />
          </Field>
          <Field label="Standardmoms">
            <input
              value={`${organization.default_vat_rate}`}
              className={inputClassName}
              disabled
            />
          </Field>
        </FormGrid>
        <Field label="Anteckningar">
          <textarea
            name="notes"
            defaultValue={invoice?.notes ?? ""}
            className={textareaClassName}
            disabled={isLocked}
          />
        </Field>
        <SubmitButton disabled={isLocked}>
          {invoice ? "Uppdatera faktura" : "Skapa fakturautkast"}
        </SubmitButton>
        {isLocked ? (
          <p className="text-sm text-[#6B6B6B]">
            Fakturan är låst efter slutförande och kan inte längre redigeras.
          </p>
        ) : null}
      </form>
    </HubCard>
  );
}

export function InvoiceLineForm({
  invoiceId,
  line,
  locked = false,
}: {
  invoiceId: string;
  line?: InvoiceLine | null;
  locked?: boolean;
}) {
  return (
    <HubCard>
      <form action={saveInvoiceLineAction} className="space-y-4">
        <input type="hidden" name="invoice_id" value={invoiceId} />
        <input type="hidden" name="line_id" defaultValue={line?.id ?? ""} />
        <FormGrid>
          <Field label="Beskrivning">
            <input
              name="description"
              defaultValue={line?.description ?? ""}
              className={inputClassName}
              required
              disabled={locked}
            />
          </Field>
          <Field label="Sortering">
            <input
              type="number"
              step="1"
              name="sort_order"
              defaultValue={line?.sort_order ?? 0}
              className={inputClassName}
              disabled={locked}
            />
          </Field>
          <Field label="Antal">
            <input
              type="number"
              step="0.01"
              name="quantity"
              defaultValue={line?.quantity ?? 1}
              className={inputClassName}
              disabled={locked}
            />
          </Field>
          <Field label="Pris per enhet">
            <input
              type="number"
              step="0.01"
              name="unit_price"
              defaultValue={line?.unit_price ?? 0}
              className={inputClassName}
              disabled={locked}
            />
          </Field>
          <Field label="Moms %">
            <input
              type="number"
              step="0.01"
              name="vat_rate"
              defaultValue={line?.vat_rate ?? 25}
              className={inputClassName}
              disabled={locked}
            />
          </Field>
        </FormGrid>
        <SubmitButton disabled={locked}>
          {line ? "Uppdatera rad" : "Lägg till rad"}
        </SubmitButton>
      </form>
    </HubCard>
  );
}

export function InvoiceStatusForm({
  invoiceId,
  invoiceNumber,
  currentStatus,
  locked,
  pdfHref,
  pdfStatus,
  pdfError,
  finalizationBlockedMessage,
}: {
  invoiceId: string;
  invoiceNumber: string | null;
  currentStatus: Invoice["status"];
  locked: boolean;
  pdfHref: string;
  pdfStatus?: Invoice["pdf_status"];
  pdfError?: string | null;
  finalizationBlockedMessage?: string | null;
}) {
  const pdfStatusLabel =
    pdfStatus === "processing"
      ? "PDF skapas"
      : pdfStatus === "ready"
        ? "PDF färdig"
        : pdfStatus === "failed"
          ? "PDF misslyckades"
          : null;

  return (
    <HubCard>
      {pdfStatusLabel ? (
        <div className="mb-5 rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
          <p className="text-sm font-medium text-[#0B0B0C]">{pdfStatusLabel}</p>
          {pdfStatus === "failed" ? (
            <p className="mt-1 text-sm text-[#8B3A32]">
              {pdfError || "Försök slutföra fakturan igen."}
            </p>
          ) : null}
        </div>
      ) : null}
      {locked ? (
        <form action={updateInvoiceStatusAction} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="invoice_id" value={invoiceId} />
          <Field label="Ändra status">
            <select name="status" defaultValue={currentStatus} className={inputClassName}>
              {invoiceStatuses
                .filter((status) => status !== "draft")
                .map((status) => (
                  <option key={status} value={status}>
                    {invoiceStatusLabel(status)}
                  </option>
                ))}
            </select>
          </Field>
          <SubmitButton>Uppdatera status</SubmitButton>
        </form>
      ) : (
        <form action={finalizeInvoiceAction} className="space-y-4">
          <input type="hidden" name="invoice_id" value={invoiceId} />
          <input
            type="hidden"
            name="idempotency_key"
            value={`invoice-finalize:${invoiceId}`}
          />
          <div>
            <p className="text-sm font-medium text-[#0B0B0C]">Slutför faktura</p>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              När fakturan slutförs får den ett skarpt nummer, låses för redigering
              och en PDF sparas i dokumentarkivet.
            </p>
          </div>
          {finalizationBlockedMessage ? (
            <p className="rounded-[1.15rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {finalizationBlockedMessage}
            </p>
          ) : null}
          <SubmitButton disabled={Boolean(finalizationBlockedMessage)}>
            Slutför faktura
          </SubmitButton>
        </form>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={pdfHref}
          target="_blank"
          className={`inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[#0B0B0C] ${
            !invoiceNumber ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {invoiceNumber ? "Öppna PDF" : "PDF skapas vid slutförande"}
        </a>
      </div>
    </HubCard>
  );
}

export function DocumentUploadForm({
  customers,
  invoices,
}: {
  customers: Array<{ id: string; company_name: string }>;
  invoices: Array<{ id: string; invoice_number: string | null }>;
}) {
  return (
    <HubCard>
      <form action={uploadDocumentAction} className="space-y-4">
        <input type="hidden" name="idempotency_key" value={randomUUID()} />
        <FormGrid>
          <Field label="Fil">
            <input type="file" name="file" className={inputClassName} required />
          </Field>
          <Field label="Kategori">
            <select name="category" defaultValue="other" className={inputClassName}>
              {documentCategories.map((category) => (
                <option key={category} value={category}>
                  {documentCategoryLabel(category)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Koppla till kund">
            <select name="customer_id" defaultValue="" className={inputClassName}>
              <option value="">Ingen kund</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Koppla till faktura">
            <select name="invoice_id" defaultValue="" className={inputClassName}>
              <option value="">Ingen faktura</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number ?? "Utan nummer"}
                </option>
              ))}
            </select>
          </Field>
        </FormGrid>
        <Field label="Anteckningar">
          <textarea name="notes" className={textareaClassName} />
        </Field>
        <SubmitButton>Ladda upp dokument</SubmitButton>
      </form>
    </HubCard>
  );
}

export function SettingsForm({
  organization,
}: {
  organization: Organization;
}) {
  const selectedCustomerFields = getCustomerFieldPreferences(organization);

  return (
    <HubCard>
      <form action={updateOrganizationSettingsAction} className="space-y-4">
        <FormGrid>
          <Field label="Företagsnamn">
            <input name="name" defaultValue={organization.name} className={inputClassName} />
          </Field>
          <Field label="Organisationsnummer">
            <input
              name="org_number"
              defaultValue={organization.org_number ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="VAT-nummer">
            <input
              name="vat_number"
              defaultValue={organization.vat_number ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="E-post">
            <input
              type="email"
              name="email"
              defaultValue={organization.email ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Telefon">
            <input
              name="phone"
              defaultValue={organization.phone ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Webbplats">
            <input
              name="website"
              defaultValue={organization.website ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Logotyp-URL">
            <input
              name="logo_url"
              defaultValue={organization.logo_url ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Kundåtkomst för anställda">
            <select
              name="employee_customer_scope"
              defaultValue={organization.employee_customer_scope}
              className={inputClassName}
            >
              {employeeCustomerScopes.map((scope) => (
                <option key={scope} value={scope}>
                  {employeeCustomerScopeLabel(scope)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Adress">
            <input
              name="address"
              defaultValue={organization.address ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Adressrad 1">
            <input
              name="address_line_1"
              defaultValue={organization.address_line_1 ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Adressrad 2">
            <input
              name="address_line_2"
              defaultValue={organization.address_line_2 ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Postnummer">
            <input
              name="postal_code"
              defaultValue={organization.postal_code ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Ort">
            <input
              name="city"
              defaultValue={organization.city ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Land">
            <input
              name="country"
              defaultValue={organization.country ?? "Sverige"}
              className={inputClassName}
            />
          </Field>
          <Field label="Standardmoms %">
            <input
              type="number"
              step="0.01"
              name="default_vat_rate"
              defaultValue={organization.default_vat_rate}
              className={inputClassName}
            />
          </Field>
          <Field label="Betalningsvillkor (dagar)">
            <input
              type="number"
              step="1"
              name="payment_terms_days"
              defaultValue={organization.payment_terms_days}
              className={inputClassName}
            />
          </Field>
          <Field label="Fakturaprefix">
            <input
              name="invoice_prefix"
              defaultValue={organization.invoice_prefix}
              className={inputClassName}
            />
          </Field>
          <Field label="Nästa fakturanummer">
            <input
              type="number"
              step="1"
              name="next_invoice_number"
              defaultValue={organization.next_invoice_number}
              className={inputClassName}
            />
          </Field>
          <Field label="Bankgiro">
            <input
              name="bankgiro"
              defaultValue={organization.bankgiro ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Plusgiro">
            <input
              name="plusgiro"
              defaultValue={organization.plusgiro ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Bankkonto">
            <input
              name="bank_account"
              defaultValue={organization.bank_account ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="IBAN">
            <input
              name="iban"
              defaultValue={organization.iban ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="SWIFT/BIC">
            <input
              name="swift_bic"
              defaultValue={organization.swift_bic ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Swish">
            <input
              name="swish_number"
              defaultValue={organization.swish_number ?? ""}
              className={inputClassName}
            />
          </Field>
          <Field label="Företagsreferens">
            <input
              name="company_reference"
              defaultValue={organization.company_reference ?? ""}
              className={inputClassName}
            />
          </Field>
        </FormGrid>
        <Field label="Betalningsinstruktioner">
          <textarea
            name="payment_instructions"
            defaultValue={organization.payment_instructions ?? ""}
            className={textareaClassName}
          />
        </Field>
        <Field label="Fakturafot">
          <textarea
            name="invoice_footer"
            defaultValue={organization.invoice_footer ?? ""}
            className={textareaClassName}
          />
        </Field>
        <Field label="Dröjsmålsränta / villkor">
          <textarea
            name="late_fee_terms"
            defaultValue={organization.late_fee_terms ?? ""}
            className={textareaClassName}
          />
        </Field>
        <div className="rounded-[1.4rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
          <h3 className="text-base font-semibold text-[var(--hub-text)]">
            Designanpassning
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
            Välj ett stilrent tema för hubbens bakgrund, sidomeny, kort och
            knappar. Temat gäller för hela företagets hubb.
          </p>
          <ThemePicker currentTheme={organization.hub_theme} />
        </div>
        <div className="rounded-[1.4rem] border border-black/8 bg-[#FBFBF9] p-4">
          <h3 className="text-base font-semibold text-[#0B0B0C]">
            Kundkort och uppföljning
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
            Välj vilka kunduppgifter som ska lyftas fram i kundkortet och om
            hubben ska förbereda e-postpåminnelser för kommande återkopplingar.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {customerFieldKeys.map((field) => (
              <label
                key={field}
                className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[#0B0B0C]"
              >
                <input
                  type="checkbox"
                  name="customer_field_preferences"
                  value={field}
                  defaultChecked={selectedCustomerFields.includes(field)}
                  className="size-4 accent-[#0B0B0C]"
                />
                <span>{customerFieldLabel(field)}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Skicka uppföljningsdigest till">
              <input
                type="email"
                name="follow_up_alert_email"
                defaultValue={organization.follow_up_alert_email ?? ""}
                className={inputClassName}
                placeholder={organization.email ?? "namn@foretag.se"}
              />
            </Field>
            <Field label="Veckodag för digest">
              <select
                name="follow_up_digest_weekday"
                defaultValue={organization.follow_up_digest_weekday}
                className={inputClassName}
              >
                <option value="1">Måndag</option>
                <option value="2">Tisdag</option>
                <option value="3">Onsdag</option>
                <option value="4">Torsdag</option>
                <option value="5">Fredag</option>
                <option value="6">Lördag</option>
                <option value="7">Söndag</option>
              </select>
            </Field>
          </div>
          <label className="mt-3 flex items-start gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[#0B0B0C]">
            <input
              type="checkbox"
              name="follow_up_email_alerts_enabled"
              defaultChecked={organization.follow_up_email_alerts_enabled}
              className="mt-1 size-4 accent-[#0B0B0C]"
            />
            <span>
              Aktivera e-postpåminnelser när utskicksmotor är kopplad.
              <span className="mt-1 block text-xs leading-5 text-[#6B6B6B]">
                Just nu sparas inställningen och visas i hubben, men inget mejl
                skickas automatiskt förrän integrationen aktiveras.
              </span>
            </span>
          </label>
        </div>
        <SubmitButton>Spara inställningar</SubmitButton>
      </form>
    </HubCard>
  );
}
