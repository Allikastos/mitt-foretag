import {
  buildOrganizationAddressLines,
  formatCurrency,
  formatDate,
  type Organization,
} from "@/src/lib/hub";

type InvoiceTemplate = {
  id: string;
  name: string;
  tagline: string;
  bestFor: string;
  accentClassName: string;
  surfaceClassName: string;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

const templates: InvoiceTemplate[] = [
  {
    id: "classic",
    name: "Klassisk",
    tagline: "Tydlig, trygg och lätt att läsa.",
    bestFor: "Löpande bokföring, konsultarbete och standardfakturor.",
    accentClassName: "bg-[#C59B4A]",
    surfaceClassName: "bg-white",
    lines: [
      { description: "Konsultarbete", quantity: 8, unitPrice: 950 },
      { description: "Avstämning och rapport", quantity: 1, unitPrice: 1800 },
    ],
  },
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Mer premium, mer luft, mer varumärkeskänsla.",
    bestFor: "Projekt, rådgivning och fakturor där presentationen ska kännas vass.",
    accentClassName: "bg-[#101010]",
    surfaceClassName: "bg-[#FBF8F0]",
    lines: [
      { description: "Projektledning", quantity: 12, unitPrice: 1100 },
      { description: "Strategiskt underlag", quantity: 1, unitPrice: 4500 },
    ],
  },
  {
    id: "compact",
    name: "Kompakt",
    tagline: "Snabb, saklig och platsbesparande.",
    bestFor: "Många rader, återkommande tjänster och enklare utskick.",
    accentClassName: "bg-[#3E5F4A]",
    surfaceClassName: "bg-[#F7FAF4]",
    lines: [
      { description: "Månadsabonnemang", quantity: 1, unitPrice: 3500 },
      { description: "Extra support", quantity: 3, unitPrice: 850 },
    ],
  },
];

function buildPreviewNumber(organization: Organization) {
  return `${organization.invoice_prefix}-${String(organization.next_invoice_number).padStart(
    5,
    "0",
  )}`;
}

function buildPaymentLines(organization: Organization) {
  return [
    organization.bankgiro ? `Bankgiro ${organization.bankgiro}` : null,
    organization.plusgiro ? `Plusgiro ${organization.plusgiro}` : null,
    organization.bank_account ? `Bankkonto ${organization.bank_account}` : null,
    organization.swish_number ? `Swish ${organization.swish_number}` : null,
    organization.payment_instructions,
  ].filter((line): line is string => Boolean(line));
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function InvoicePaper({
  organization,
  template,
}: {
  organization: Organization;
  template: InvoiceTemplate;
}) {
  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  const paymentTermsDays = toNumber(organization.payment_terms_days, 30);
  const defaultVatRate = toNumber(organization.default_vat_rate, 25);

  dueDate.setDate(issueDate.getDate() + paymentTermsDays);

  const subtotal = template.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  );
  const vatTotal = subtotal * (defaultVatRate / 100);
  const total = subtotal + vatTotal;
  const addressLines = buildOrganizationAddressLines(organization);
  const paymentLines = buildPaymentLines(organization);

  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border border-black/10 shadow-[0_24px_48px_-42px_rgba(0,0,0,0.35)] ${template.surfaceClassName}`}
    >
      <div className={`h-2 ${template.accentClassName}`} />
      <div className="space-y-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#8A6A2F]">
              Faktura
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#0B0B0C]">
              {buildPreviewNumber(organization)}
            </h3>
          </div>
          <div className="text-right text-xs leading-5 text-[#626262]">
            <p>{formatDate(issueDate.toISOString())}</p>
            <p>Förfaller {formatDate(dueDate.toISOString())}</p>
          </div>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
              Från
            </p>
            <p className="mt-2 font-semibold text-[#0B0B0C]">{organization.name}</p>
            {organization.org_number ? (
              <p className="text-[#626262]">Org.nr {organization.org_number}</p>
            ) : null}
            {addressLines.map((line) => (
              <p key={line} className="text-[#626262]">
                {line}
              </p>
            ))}
            {organization.email ? (
              <p className="text-[#626262]">{organization.email}</p>
            ) : null}
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8A8A8A]">
              Till
            </p>
            <p className="mt-2 font-semibold text-[#0B0B0C]">Exempelkund AB</p>
            <p className="text-[#626262]">556000-0000</p>
            <p className="text-[#626262]">Kundgatan 12</p>
            <p className="text-[#626262]">111 22 Stockholm</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white/70">
          <div className="grid grid-cols-[1fr_4rem_6rem] gap-3 border-b border-black/8 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8A8A8A]">
            <span>Rad</span>
            <span className="text-right">Antal</span>
            <span className="text-right">Summa</span>
          </div>
          {template.lines.map((line) => (
            <div
              key={line.description}
              className="grid grid-cols-[1fr_4rem_6rem] gap-3 px-4 py-3 text-sm text-[#0B0B0C]"
            >
              <span>{line.description}</span>
              <span className="text-right text-[#626262]">{line.quantity}</span>
              <span className="text-right font-medium">
                {formatCurrency(line.quantity * line.unitPrice)}
              </span>
            </div>
          ))}
        </div>

        <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-[#626262]">
            <span>Belopp exkl. moms</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#626262]">
            <span>Moms {defaultVatRate}%</span>
            <span>{formatCurrency(vatTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-[#0B0B0C]">
            <span>Att betala</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-black/[0.04] p-4 text-xs leading-5 text-[#626262]">
          <p className="font-semibold text-[#0B0B0C]">Betalning</p>
          {paymentLines.length ? (
            paymentLines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p>Lägg till betalningsuppgifter i inställningar för att visa dem här.</p>
          )}
          {organization.invoice_footer ? (
            <p className="mt-3">{organization.invoice_footer}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InvoiceTemplateGallery({
  organization,
}: {
  organization: Organization;
}) {
  return (
    <section className="rounded-[1.7rem] border border-black/8 bg-[#111111] p-5 text-white shadow-[0_24px_60px_-46px_rgba(0,0,0,0.45)] md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C59B4A]">
            Fakturamallar
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            Förhandsvisa fakturans uttryck
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
            Mallarna använder redan företagets inställningar som avsändare,
            fakturanummer, moms, betalningsvillkor och betalningsuppgifter.
          </p>
        </div>
        <p className="rounded-full border border-white/12 px-4 py-2 text-xs text-white/65">
          PDF-koppling kommer senare
        </p>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-3">
        {templates.map((template, index) => (
          <details
            key={template.id}
            open={index === 0}
            className="group rounded-[1.45rem] border border-white/10 bg-white/[0.06] p-4"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <span>
                <span className="block text-lg font-semibold">{template.name}</span>
                <span className="mt-1 block text-sm leading-6 text-white/62">
                  {template.tagline}
                </span>
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#111111] transition group-open:bg-[#C59B4A]">
                Förhandsvisa
              </span>
            </summary>
            <p className="mt-3 text-xs leading-5 text-white/52">{template.bestFor}</p>
            <div className="mt-4 text-[#0B0B0C]">
              <InvoicePaper organization={organization} template={template} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
