import Link from "next/link";
import { SectionContainer } from "./section-container";

type CTAButton = {
  href: string;
  label: string;
};

type CTABlockProps = {
  title: string;
  description: string;
  primary: CTAButton;
  secondary?: CTAButton;
};

export function CTABlock({
  title,
  description,
  primary,
  secondary,
}: CTABlockProps) {
  return (
    <section className="py-24 md:py-28">
      <SectionContainer>
        <div className="rounded-[2.5rem] bg-[#0B0B0C] px-8 py-12 text-white shadow-[0_34px_90px_-60px_rgba(0,0,0,0.42)] md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-[52rem]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Nästa steg
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] md:text-4xl lg:text-[2.9rem] lg:leading-[1.05]">
                {title}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Link
                href={primary.href}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:opacity-90"
              >
                {primary.label}
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/8"
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
