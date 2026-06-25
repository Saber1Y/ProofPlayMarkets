import type { Metadata } from "next";
import { PrivyProvider } from "@/components/PrivyProvider";
import { WalletButton } from "@/components/WalletButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPlay World Cup",
  description: "Verifiable World Cup prediction rooms powered by TxLINE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        <PrivyProvider>
          <nav className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight">
              ProofPlay <span className="text-emerald-400">World Cup</span>
            </a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/fixtures" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                Fixtures
              </a>
              <a href="/rooms" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                My Rooms
              </a>
            </div>
            <WalletButton />
          </nav>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </PrivyProvider>
      </body>
    </html>
  );
}
