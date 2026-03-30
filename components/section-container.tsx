import type { ReactNode } from "react";

type SectionContainerProps = {
  children: ReactNode;
  className?: string;
};

export function SectionContainer({
  children,
  className = "",
}: SectionContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1180px] px-6 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
