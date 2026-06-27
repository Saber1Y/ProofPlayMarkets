"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const FILES = [
  { name: "Settlement Architecture", file: "settlement-architecture.md" },
  { name: "TxLINE Integration", file: "txline-integration.md" },
  { name: "Demo Script", file: "demo-script.md" },
];

export default function DocsPage() {
  const [content, setContent] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  async function loadDoc(file: string) {
    setSelected(file);
    try {
      const res = await fetch(`/docs/${file}`);
      const text = await res.text();
      setContent(text);
    } catch {
      setContent("Failed to load document.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <span className="section-header">Docs</span>
        <h1 className="text-2xl font-bold">Technical Documentation</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Architecture overview and integration guides
        </p>
      </div>

      <div className="grid gap-4">
        <GlassCard className="p-5" hover={false}>
          <span className="section-header mb-3 block">Network</span>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Network</span>
              <span className="text-zinc-300">Solana Devnet</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Program ID</span>
              <code className="text-cyan-accent">D254EggCVsZ7jKtJJ29diEv3P4qqjn5APBAvcRwDNsyE</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Admin Wallet</span>
              <code className="text-zinc-300">JE4HHzibqoAmMDsgkmE3mzAKedNB1fwWQUwPmftVnBjj</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Faucet</span>
              <a
                href="https://faucet.solana.com/"
                target="_blank"
                className="text-cyan-accent hover:underline"
              >
                faucet.solana.com
              </a>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-zinc-600">
            Devnet SOL needed to create rooms (free from faucet). The admin wallet funds market creation. Users need ~0.002 SOL per join for rent + fees.
          </p>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <span className="section-header mb-3 block">Documents</span>
          <div className="flex flex-col gap-1">
            {FILES.map((f) => (
              <button
                key={f.file}
                onClick={() => loadDoc(f.file)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected === f.file
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <svg className="h-4 w-4 shrink-0 text-zinc-600" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h6l4 4v8H3V2z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {f.name}
              </button>
            ))}
          </div>
        </GlassCard>

        {content && (
          <GlassCard className="p-5" hover={false}>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 font-mono">
                {content}
              </pre>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
