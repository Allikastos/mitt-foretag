import Link from "next/link";
import type { PropsWithChildren } from "react";

export function HubShell({
  children,
  title,
  description,
  actions,
}: PropsWithChildren<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}>) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.7rem] border border-black/8 bg-white p-6 shadow-[0_20px_52px_-44px_rgba(0,0,0,0.16)] md:flex-row md:items-end md:justify-between md:p-7">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#8A6A2F]">
            Altura Nova Hub
          </p>
          <h1 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#0B0B0C] md:text-[2.15rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5F5F]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function HubCard({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-[1.6rem] border border-black/8 bg-white p-5 shadow-[0_20px_44px_-48px_rgba(0,0,0,0.18)] md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <HubCard>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#C6A15B]">
        {label}
      </p>
      <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#0B0B0C]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-[#6B6B6B]">{hint}</p> : null}
    </HubCard>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-[#FBFBF9] px-5 py-8 text-center">
      <p className="text-base font-medium text-[#0B0B0C]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6B6B6B]">
        {description}
      </p>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: PropsWithChildren<{ tone?: "neutral" | "success" | "warning" | "danger" }>) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : tone === "danger"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-stone-100 text-stone-700 border-stone-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function FormGrid({
  children,
}: PropsWithChildren) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#0B0B0C]">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClassName =
  "min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]";

export const textareaClassName = `${inputClassName} min-h-28 resize-y`;

export function SecondaryLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:bg-[#F7F7F5]"
    >
      {children}
    </Link>
  );
}
