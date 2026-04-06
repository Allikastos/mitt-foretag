"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ContactFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  website: string;
};

const initialFormState: ContactFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "Förfrågan kunde inte skickas just nu. Försök igen eller mejla direkt."
        );
        return;
      }

      setForm(initialFormState);
      setSuccessMessage(data.message || "Tack för din förfrågan.");
    } catch {
      setErrorMessage(
        "Förfrågan kunde inte skickas just nu. Försök igen eller mejla direkt."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Namn
          </span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="För- och efternamn"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Företag
          </span>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
            placeholder="Bolagsnamn"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            E-post
          </span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="namn@foretag.se"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Telefonnummer
          </span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="070-1234567"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
          Meddelande
        </span>
        <textarea
          name="message"
          rows={6}
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder="Beskriv kort er verksamhet, nuläget och vad ni vill få bättre kontroll på."
          className="w-full rounded-[1.5rem] border border-black/10 bg-[#F7F7F5] px-4 py-3.5 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          required
        />
      </label>

      <label className="hidden" aria-hidden="true">
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) =>
            setForm((current) => ({ ...current, website: event.target.value }))
          }
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-[#0B0B0C] px-6 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
      >
        {isSubmitting ? "Skickar..." : "Skicka och boka första samtal"}
      </button>

      <p className="text-sm leading-6 text-[#5F5F5F]">
        Det räcker med några meningar. Du får ett tydligt nästa steg utifrån din
        situation.
      </p>

      {errorMessage ? (
        <p
          aria-live="polite"
          className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p
          aria-live="polite"
          className="rounded-[1.4rem] border border-[#C6A15B]/30 bg-[#F7F3EA] px-4 py-3 text-sm font-medium text-[#0B0B0C]"
        >
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
