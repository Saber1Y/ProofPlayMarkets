"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";

const links = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/rooms", label: "My Rooms" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-pitch/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-green-accent/30 bg-green-accent/10">
            <span className="text-xs font-bold text-green-accent">PP</span>
          </div>
          <span className="text-sm font-bold tracking-tight">
            ProofPlay <span className="text-gradient">World Cup</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="ml-2">
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
