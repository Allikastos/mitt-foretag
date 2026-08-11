import type { ReactNode } from "react";

export default function HubLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="hub-theme-surface min-h-screen text-[#161616]">
      {children}
    </div>
  );
}
