"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { CONTACT_LIMITS } from "@/src/lib/contact";

type FormState = { name: string; company: string; email: string; phone: string; websiteUrl: string; message: string; website: string; startedAt: number };
const newForm = (): FormState => ({ name: "", company: "", email: "", phone: "", websiteUrl: "", message: "", website: "", startedAt: Date.now() });
const inputClass = "min-h-12 w-full rounded-2xl border border-[#173f35]/12 bg-white/75 px-4 py-3 text-sm text-[#173f35] outline-none transition placeholder:text-[#8b9791] focus:border-[#e86f44] focus:ring-2 focus:ring-[#e86f44]/15";

export function ContactForm() {
  const [form, setForm] = useState<FormState>(newForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const field = (key: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsSubmitting(true); setStatus(null);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) { setStatus({ type: "error", message: data.error || "Förfrågan kunde inte skickas. Försök igen eller mejla direkt." }); return; }
      setForm(newForm()); setStatus({ type: "success", message: data.message || "Tack! Jag återkommer normalt inom en arbetsdag." });
    } catch { setStatus({ type: "error", message: "Förfrågan kunde inte skickas. Försök igen eller mejla direkt." }); }
    finally { setIsSubmitting(false); }
  }

  return <form className="space-y-5" onSubmit={handleSubmit}>
    <div className="grid gap-5 sm:grid-cols-2">
      <label><span className="mb-2 block text-sm font-semibold text-[#173f35]">Kontaktperson</span><input className={inputClass} name="name" autoComplete="name" maxLength={CONTACT_LIMITS.name} value={form.name} onChange={(e) => field("name")(e.target.value)} placeholder="För- och efternamn" required /></label>
      <label><span className="mb-2 block text-sm font-semibold text-[#173f35]">Företagsnamn</span><input className={inputClass} name="company" autoComplete="organization" maxLength={CONTACT_LIMITS.company} value={form.company} onChange={(e) => field("company")(e.target.value)} placeholder="Ditt företag" required /></label>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <label><span className="mb-2 block text-sm font-semibold text-[#173f35]">E-post</span><input className={inputClass} type="email" name="email" autoComplete="email" maxLength={CONTACT_LIMITS.email} value={form.email} onChange={(e) => field("email")(e.target.value)} placeholder="namn@foretag.se" required /></label>
      <label><span className="mb-2 block text-sm font-semibold text-[#173f35]">Telefon <span className="font-normal text-[#75827c]">(valfritt)</span></span><input className={inputClass} type="tel" name="phone" autoComplete="tel" maxLength={CONTACT_LIMITS.phone} value={form.phone} onChange={(e) => field("phone")(e.target.value)} placeholder="070-123 45 67" /></label>
    </div>
    <label className="block"><span className="mb-2 block text-sm font-semibold text-[#173f35]">Befintlig webbadress <span className="font-normal text-[#75827c]">(valfritt)</span></span><input className={inputClass} type="url" name="websiteUrl" autoComplete="url" maxLength={CONTACT_LIMITS.websiteUrl} value={form.websiteUrl} onChange={(e) => field("websiteUrl")(e.target.value)} placeholder="https://dittforetag.se" /></label>
    <label className="block"><span className="mb-2 block text-sm font-semibold text-[#173f35]">Vad behöver du hjälp med?</span><textarea className={`${inputClass} min-h-36 resize-y`} name="message" maxLength={CONTACT_LIMITS.message} value={form.message} onChange={(e) => field("message")(e.target.value)} placeholder="Beskriv kort företaget, nuläget och vad du vill att hemsidan ska hjälpa kunden att göra." required /></label>
    <label className="absolute -left-[10000px]" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => field("website")(e.target.value)} /></label>
    <input type="hidden" name="startedAt" value={form.startedAt} />
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><button type="submit" disabled={isSubmitting} className="rounded-full bg-[#e86f44] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d95f35] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Skickar..." : "Skicka förfrågan"}</button><p className="text-xs leading-6 text-[#75827c]">Genom att skicka godkänner du behandlingen enligt vår <Link href="/integritet" className="underline underline-offset-3">integritetspolicy</Link>.</p></div>
    {status ? <p role="status" aria-live="polite" className={`rounded-2xl border px-4 py-3 text-sm font-medium ${status.type === "success" ? "border-[#6f947f]/30 bg-[#e8f1e9] text-[#315c45]" : "border-red-200 bg-red-50 text-red-700"}`}>{status.message}</p> : null}
  </form>;
}
