export const PROSPECT_BATCH_MAX_ROWS = 25;
export const PROSPECT_BATCH_MAX_CHARACTERS = 20_000;

export type ProspectBatchRow = {
  lineNumber: number;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  followUpDate: string;
  notes: string;
};

export type ProspectBatchParseResult = {
  rows: ProspectBatchRow[];
  errors: string[];
};

function optionalValue(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeProspectCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}

export function parseProspectBatch(input: string): ProspectBatchParseResult {
  if (input.length > PROSPECT_BATCH_MAX_CHARACTERS) {
    return {
      rows: [],
      errors: [
        `Underlaget får innehålla högst ${PROSPECT_BATCH_MAX_CHARACTERS.toLocaleString("sv-SE")} tecken.`,
      ],
    };
  }

  const sourceLines = input
    .split(/\r?\n/)
    .map((value, index) => ({ value, lineNumber: index + 1 }))
    .filter(({ value }) => value.trim());

  if (sourceLines.length > PROSPECT_BATCH_MAX_ROWS) {
    return {
      rows: [],
      errors: [`Lägg in högst ${PROSPECT_BATCH_MAX_ROWS} prospekt per omgång.`],
    };
  }

  const rows: ProspectBatchRow[] = [];
  const errors: string[] = [];
  const companyNames = new Set<string>();

  for (const { value, lineNumber } of sourceLines) {
    const columns = value.split("\t");

    if (columns.length > 6) {
      errors.push(`Rad ${lineNumber}: för många kolumner.`);
      continue;
    }

    const companyName = columns[0]?.trim().replace(/\s+/g, " ") ?? "";
    const contactName = optionalValue(columns[1]);
    const email = optionalValue(columns[2]);
    const phone = optionalValue(columns[3]);
    const followUpDate = columns[4]?.trim() ?? "";
    const notes = columns[5]?.trim() ?? "";
    const normalizedCompanyName = normalizeProspectCompanyName(companyName);
    const hasOversizedField =
      companyName.length > 160 ||
      Boolean(contactName && contactName.length > 160) ||
      Boolean(email && email.length > 254) ||
      Boolean(phone && phone.length > 50) ||
      notes.length > 500;

    if (!companyName) errors.push(`Rad ${lineNumber}: företagsnamn saknas.`);
    if (companyName.length > 160) {
      errors.push(`Rad ${lineNumber}: företagsnamnet är för långt.`);
    }
    if (contactName && contactName.length > 160) {
      errors.push(`Rad ${lineNumber}: kontaktpersonens namn är för långt.`);
    }
    if (email && email.length > 254) {
      errors.push(`Rad ${lineNumber}: e-postadressen är för lång.`);
    }
    if (phone && phone.length > 50) {
      errors.push(`Rad ${lineNumber}: telefonnumret är för långt.`);
    }
    if (!email && !phone) errors.push(`Rad ${lineNumber}: e-post eller telefon saknas.`);
    if (email && !isValidEmail(email)) errors.push(`Rad ${lineNumber}: e-postadressen är ogiltig.`);
    if (!isValidDate(followUpDate)) {
      errors.push(`Rad ${lineNumber}: återkopplingsdatum ska vara ÅÅÅÅ-MM-DD.`);
    }
    if (!notes) errors.push(`Rad ${lineNumber}: behovsanteckning saknas.`);
    if (notes.length > 500) {
      errors.push(`Rad ${lineNumber}: behovsanteckningen är för lång.`);
    }
    if (normalizedCompanyName && companyNames.has(normalizedCompanyName)) {
      errors.push(`Rad ${lineNumber}: företaget finns redan i den här omgången.`);
    }

    if (
      !companyName ||
      (!email && !phone) ||
      Boolean(email && !isValidEmail(email)) ||
      !isValidDate(followUpDate) ||
      !notes ||
      hasOversizedField ||
      companyNames.has(normalizedCompanyName)
    ) {
      continue;
    }

    companyNames.add(normalizedCompanyName);
    rows.push({
      lineNumber,
      companyName,
      contactName,
      email,
      phone,
      followUpDate,
      notes,
    });
  }

  return { rows: errors.length ? [] : rows, errors };
}
