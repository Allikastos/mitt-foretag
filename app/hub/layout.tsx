import type { ReactNode } from "react";

export default function HubLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f4eb_0%,#f0ede4_42%,#ebe7dc_100%)] text-[#161616]">
      {children}
    </div>
  );
}
