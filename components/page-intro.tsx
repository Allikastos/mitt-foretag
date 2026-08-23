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
    <section className="pb-10 pt-10 md:pb-16 md:pt-20">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,23rem)] lg:items-end lg:gap-12">
          <div className="max-w-[52rem]">
            <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] text-[#173f35] text-balance md:text-6xl lg:text-[4.2rem] lg:leading-[0.98]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#617169] md:text-xl">
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
