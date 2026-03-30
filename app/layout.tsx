import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mitt Företag | Redovisning och finansiell rådgivning",
  description:
    "Modern redovisning, finansiell rapportering och rådgivning för små och medelstora företag.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
