"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  competition: string;
}

function CreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fixtureId = searchParams.get("fixtureId");
  const { ready, authenticated, user, login } = usePrivy();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<string>(fixtureId || "");
  const [marketType, setMarketType] = useState<string>("TOTAL_GOALS_OVER_UNDER");
  const [threshold, setThreshold] = useState<string>("2.5");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = user?.wallet?.address ?? "";

  useEffect(() => {
    fetch("/api/txline/fixtures")
      .then((r) => r.json())
      .then(setFixtures)
      .catch(() => {});
  }, []);

  async function handleCreate() {
    if (!selectedFixture || !wallet) return;
    setCreating(true);
    setError(null);

    const fixture = fixtures.find((f) => f.id === Number(selectedFixture));
    if (!fixture) {
      setError("Fixture not found");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId: fixture.id,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          marketType,
          threshold: Number(threshold),
          wallet,
        }),
      });
      const room = await res.json();
      if (room.error) {
        setError(room.error);
      } else {
        router.push(`/rooms/${room.id}`);
      }
    } catch {
      setError("Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  const selected = fixtures.find((f) => f.id === Number(selectedFixture));

  if (!ready) {
    return <div className="animate-pulse text-zinc-500 py-24 text-center">Loading...</div>;
  }

  if (!authenticated || !wallet) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-400 mb-6">You need to connect a wallet to create a room.</p>
        <button
          onClick={login}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/fixtures" className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block">
        &larr; Back to fixtures
      </Link>

      <h1 className="text-2xl font-bold mb-6">Create Prediction Room</h1>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
        {/* Fixture selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Fixture</label>
          <select
            value={selectedFixture}
            onChange={(e) => setSelectedFixture(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
          >
            <option value="">Select a fixture...</option>
            {fixtures.map((f) => (
              <option key={f.id} value={f.id}>
                {f.homeTeam} vs {f.awayTeam} — {new Date(f.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="rounded bg-zinc-800/50 px-4 py-3 text-sm text-zinc-300">
            {selected.homeTeam} vs {selected.awayTeam} &middot;{" "}
            {new Date(selected.startDate).toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric", hour: "2-digit",
            })}
          </div>
        )}

        {/* Market type */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Market Type</label>
          <select
            value={marketType}
            onChange={(e) => setMarketType(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
          >
            <option value="TOTAL_GOALS_OVER_UNDER">Total Goals — Over/Under</option>
            <option value="MATCH_WINNER">Match Winner — 1X2</option>
          </select>
        </div>

        {/* Threshold (for Over/Under) */}
        {marketType === "TOTAL_GOALS_OVER_UNDER" && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Goal Threshold</label>
            <input
              type="number"
              step="0.5"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Wallet (read-only from Privy) */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Your Wallet</label>
          <div className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm font-mono text-zinc-400">
            {wallet.slice(0, 8)}...{wallet.slice(-6)}
          </div>
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          onClick={handleCreate}
          disabled={creating || !selectedFixture}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {creating ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-zinc-500 py-24 text-center">Loading...</div>}>
      <CreateRoomForm />
    </Suspense>
  );
}
