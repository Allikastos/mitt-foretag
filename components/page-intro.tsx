import type { ReactNode } from "react";
import { SectionContainer } from "./section-container";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: PageIntroProps) {
  return (
    <section className="pb-12 pt-16 md:pb-16 md:pt-24">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,23rem)] lg:items-end lg:gap-12">
          <div className="max-w-[52rem]">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-5xl lg:text-[3.8rem] lg:leading-[1.02]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#5F5F5F] md:text-[1.125rem]">
              {description}
            </p>
          </div>

          {aside ? (
            <div className="max-w-md lg:justify-self-end">{aside}</div>
          ) : null}
        </div>
      </SectionContainer>
    </section>
  );
}
