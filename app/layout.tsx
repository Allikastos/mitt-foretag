import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redovisning & ekonomisk rådgivning för småföretag | Mitt Företag",
  description:
    "Jag hjälper småföretag med bokföring, rapportering och ekonomisk analys. Få bättre kontroll på lönsamhet och kassaflöde.",
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
