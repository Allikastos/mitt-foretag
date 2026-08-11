import type { ReactNode } from "react";

export default function HubLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--hub-page-bg)] text-[#161616]">
      {children}
    </div>
  );
}
