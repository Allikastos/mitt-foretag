export const CONTACT_LIMITS = {
  name: 100,
  company: 120,
  email: 254,
  phone: 40,
  websiteUrl: 300,
  message: 3000,
} as const;

export type ContactPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  websiteUrl?: unknown;
  message?: unknown;
  website?: unknown;
  startedAt?: unknown;
};

export type ValidContact = {
  name: string;
  company: string;
  email: string;
  phone: string;
  websiteUrl: string;
  message: string;
};

type ValidationResult =
  | { ok: true; data: ValidContact; isSpam: boolean }
  | { ok: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactPayload(payload: ContactPayload, now = Date.now()): ValidationResult {
  const data: ValidContact = {
    name: safeString(payload.name),
    company: safeString(payload.company),
    email: safeString(payload.email),
    phone: safeString(payload.phone),
    websiteUrl: safeString(payload.websiteUrl),
    message: safeString(payload.message),
  };
  const honeypot = safeString(payload.website);
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : Number(payload.startedAt);

  if (honeypot || !Number.isFinite(startedAt) || now - startedAt < 2_000) {
    return { ok: true, data, isSpam: true };
  }

  if (!data.name || !data.company || !data.email || !data.message) {
    return { ok: false, error: "Namn, företag, e-post och beskrivning behöver fyllas i." };
  }

  if (!EMAIL_REGEX.test(data.email)) {
    return { ok: false, error: "Ange en giltig e-postadress." };
  }

  for (const [field, limit] of Object.entries(CONTACT_LIMITS)) {
    if (data[field as keyof ValidContact].length > limit) {
      return { ok: false, error: "Ett eller flera fält är för långa. Korta ned texten och försök igen." };
    }
  }

  return { ok: true, data, isSpam: false };
}
