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
        <div className="marketing-grid rounded-[2.5rem] bg-[#173f35] px-8 py-12 text-white shadow-[0_34px_90px_-60px_rgba(23,63,53,0.7)] md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-[52rem]">
              <p className="text-xs font-bold tracking-[0.2em] text-[#f3b89f] uppercase">
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
                className="inline-flex items-center justify-center rounded-full bg-[#e86f44] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95f35]"
              >
                {primary.label}
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex items-center justify-center rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
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
