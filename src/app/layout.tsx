import type { Metadata } from "next";
import { PrivyProvider } from "@/components/PrivyProvider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPlay World Cup",
  description: "Verifiable World Cup prediction rooms powered by TxLINE",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProvider>
          <AppShell>{children}</AppShell>
        </PrivyProvider>
      </body>
    </html>
  );
}
