"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PayoutSummary {
  participant: string;
  amount: number;
}

interface Receipt {
  fixtureId: number;
  roomId: string;
  marketType: string;
  threshold: number;
  finalScore: { home: number; away: number };
  statKeysUsed: number[];
  txlineSeq: number;
  txlineTimestamp: string;
  merkleRootPda: string;
  validationEndpoint: string;
  validationResult: boolean;
  settlementTx?: string;
  winnerSide: string;
  payoutSummary: PayoutSummary[];
}

export default function ReceiptPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/receipt`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReceipt(data);
      })
      .catch(() => setError("Failed to load receipt"))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return <div className="animate-pulse text-zinc-500 py-24 text-center">Loading receipt...</div>;
  }

  if (error || !receipt) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-400 mb-4">{error || "Receipt not found"}</p>
        <Link href="/rooms" className="text-emerald-400 hover:underline">Back to rooms</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/rooms/${roomId}`} className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block">
        &larr; Back to room
      </Link>

      <div className="rounded-lg border border-emerald-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📋</span>
          <h1 className="text-xl font-bold">TxLINE Resolution Receipt</h1>
        </div>

        {/* Outcome */}
        <section className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">Outcome</h2>
          <div className="text-2xl font-bold text-emerald-400">{receipt.winnerSide}</div>
          <div className="text-sm text-zinc-400 mt-1">
            Final Score: {receipt.finalScore.home} : {receipt.finalScore.away}
          </div>
        </section>

        {/* TxLINE Data Used */}
        <section className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">TxLINE Data Used</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-500">Fixture ID</div>
            <div className="text-zinc-200 font-mono">{receipt.fixtureId}</div>
            <div className="text-zinc-500">Market Type</div>
            <div className="text-zinc-200">{receipt.marketType}</div>
            <div className="text-zinc-500">Threshold</div>
            <div className="text-zinc-200">{receipt.threshold}</div>
            <div className="text-zinc-500">Stat Keys</div>
            <div className="text-zinc-200 font-mono">{receipt.statKeysUsed.join(", ")}</div>
            <div className="text-zinc-500">Sequence</div>
            <div className="text-zinc-200 font-mono">{receipt.txlineSeq}</div>
            <div className="text-zinc-500">Timestamp</div>
            <div className="text-zinc-200">{new Date(receipt.txlineTimestamp).toLocaleString()}</div>
          </div>
        </section>

        {/* Validation Proof */}
        <section className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">Validation Proof</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-500">Endpoint</div>
            <div className="text-zinc-200 font-mono text-xs break-all">{receipt.validationEndpoint}</div>
            <div className="text-zinc-500">Result</div>
            <div className={receipt.validationResult ? "text-emerald-400" : "text-red-400"}>
              {receipt.validationResult ? "Verified ✓" : "Failed ✗"}
            </div>
          </div>
        </section>

        {/* On-Chain Verification */}
        <section className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">On-Chain Verification</h2>
          <div className="text-sm">
            <div className="text-zinc-500 mb-1">Merkle Root PDA</div>
            <div className="text-zinc-200 font-mono text-xs break-all bg-zinc-900 rounded p-2">
              {receipt.merkleRootPda}
            </div>
          </div>
          {receipt.settlementTx && (
            <div className="mt-2 text-sm">
              <div className="text-zinc-500 mb-1">Settlement Transaction</div>
              <div className="text-zinc-200 font-mono text-xs break-all bg-zinc-900 rounded p-2">
                {receipt.settlementTx}
              </div>
            </div>
          )}
        </section>

        {/* Payouts */}
        <section className="mb-6 rounded-lg bg-zinc-800/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">Payouts</h2>
          {receipt.payoutSummary.length === 0 ? (
            <div className="text-sm text-zinc-500">No winners (no participants on winning side).</div>
          ) : (
            <div className="space-y-1">
              {receipt.payoutSummary.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm rounded bg-zinc-900/50 px-3 py-1.5">
                  <span className="font-mono text-xs text-zinc-300">
                    {p.participant.slice(0, 8)}...{p.participant.slice(-4)}
                  </span>
                  <span className="text-emerald-400 font-medium">{p.amount}x</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Raw JSON */}
        <section className="rounded-lg bg-zinc-800/30 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-2">Raw Receipt JSON</h2>
          <pre className="text-xs text-zinc-500 font-mono overflow-x-auto max-h-48 overflow-y-auto">
            {JSON.stringify(receipt, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
