"use client";

import type { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({
  children,
  message,
}: PropsWithChildren<{ message: string }>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Tar bort..." : children}
    </button>
  );
}
