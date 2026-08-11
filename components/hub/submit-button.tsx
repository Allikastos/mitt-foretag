"use client";

import type { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  disabled = false,
}: PropsWithChildren<{ disabled?: boolean }>) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sparar..." : children}
    </button>
  );
}
