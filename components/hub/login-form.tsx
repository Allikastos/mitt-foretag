"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase";
import { inputClassName } from "./ui";

export function HubLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasSupabaseEnv()) {
      setErrorMessage(
        "Supabase är inte konfigurerat ännu. Lägg till miljövariablerna först."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace("/hub");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Inloggningen kunde inte genomföras just nu."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
          E-post
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="namn@foretag.se"
          className={inputClassName()}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
          Lösenord
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ditt lösenord"
          className={inputClassName()}
          required
        />
      </label>

      {errorMessage ? (
        <div className="rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Loggar in..." : "Logga in"}
      </button>
    </form>
  );
}
