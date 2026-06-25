"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { teamCode } from "@/lib/teams";
import { GlassCard } from "@/components/ui/GlassCard";

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  competition: string;
}

const MARKET_TYPES = [
  {
    id: "TOTAL_GOALS_OVER_UNDER",
    name: "Goal Rush",
    desc: "Will the match have 3+ goals?",
    rule: "YES wins if total goals are 3 or more. NO wins if 2 or fewer.",
  },
  {
    id: "MATCH_WINNER",
    name: "Winner Pick",
    desc: "Who wins the match?",
    rule: "Pick the winning team. Draw counts as a third option.",
  },
];

function CreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fixtureId = searchParams.get("fixtureId");
  const template = searchParams.get("template");
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

  useEffect(() => {
    if (template === "Goal Rush") {
      setMarketType("TOTAL_GOALS_OVER_UNDER");
      setThreshold("2.5");
    } else if (template === "Winner Pick") {
      setMarketType("MATCH_WINNER");
    }
  }, [template]);

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
  const homeCode = teamCode(selected?.homeTeam ?? "");
  const awayCode = teamCode(selected?.awayTeam ?? "");

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-accent border-t-transparent" />
      </div>
    );
  }

  if (!authenticated || !wallet) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="glass-strong rounded-xl p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-accent/10">
            <svg className="h-6 w-6 text-green-accent" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15l-5 3 1-5.5-4-4 5.5-1L10 2z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Connect Your Wallet</h1>
          <p className="mt-2 text-sm text-zinc-500">
            You need to connect a wallet to create a prediction room.
          </p>
          <button
            onClick={login}
            className="mt-6 rounded-lg bg-green-accent px-6 py-2.5 text-sm font-semibold text-pitch transition-colors hover:bg-green-accent/90"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/fixtures"
        className="mb-6 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to fixtures
      </Link>

      <div className="mb-6">
        <span className="section-header">Create</span>
        <h1 className="text-2xl font-bold">Prediction Room</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Set up a room for friends. All predictions settle via TxLINE on-chain.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Step 1: Match */}
        <GlassCard className="p-5" hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
              1
            </span>
            <span className="text-sm font-medium text-white">Select Match</span>
          </div>

          <select
            value={selectedFixture}
            onChange={(e) => setSelectedFixture(e.target.value)}
            className="glass-input w-full px-3 py-2 text-sm"
          >
            <option value="" className="bg-pitch">Choose a World Cup fixture...</option>
            {fixtures.map((f) => (
              <option key={f.id} value={f.id} className="bg-pitch">
                {f.homeTeam} vs {f.awayTeam}
              </option>
            ))}
          </select>

          {selected && (
            <div className="glass mt-3 flex items-center gap-3 rounded-lg px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                {homeCode ? (
                  <img src={`https://flagcdn.com/${homeCode.toLowerCase()}.svg`} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : selected.homeTeam.charAt(0)}
              </div>
              <div className="flex-1 text-sm">
                <span className="font-medium text-zinc-200">{selected.homeTeam}</span>
                <span className="mx-2 text-zinc-600">vs</span>
                <span className="font-medium text-zinc-200">{selected.awayTeam}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                {awayCode ? (
                  <img src={`https://flagcdn.com/${awayCode.toLowerCase()}.svg`} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : selected.awayTeam.charAt(0)}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Step 2: Prediction Type */}
        <GlassCard className="p-5" hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
              2
            </span>
            <span className="text-sm font-medium text-white">Prediction Type</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {MARKET_TYPES.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setMarketType(mt.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  marketType === mt.id
                    ? "border-green-accent/40 bg-green-accent/5"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <h3 className="text-sm font-semibold text-white">{mt.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{mt.desc}</p>
                {marketType === mt.id && (
                  <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
                    {mt.rule}
                  </p>
                )}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Step 3: Room Rules */}
        <GlassCard className="p-5" hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
              3
            </span>
            <span className="text-sm font-medium text-white">Room Rules</span>
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Goal Threshold
            </label>
            <input
              type="number"
              step="0.5"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm"
              disabled={marketType !== "TOTAL_GOALS_OVER_UNDER"}
            />
          </div>
        </GlassCard>

        {/* Step 4: Verification */}
        <GlassCard className="p-5" hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
              4
            </span>
            <span className="text-sm font-medium text-white">Verification</span>
          </div>

          <div className="glass rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-600">Data Source</span>
                <div className="font-medium text-cyan-accent">TxLINE</div>
              </div>
              <div>
                <span className="text-zinc-600">Stat Keys</span>
                <div className="font-mono text-zinc-300">
                  {marketType === "TOTAL_GOALS_OVER_UNDER" ? "1 + 2" : "winner"}
                </div>
              </div>
              <div>
                <span className="text-zinc-600">Rule</span>
                <div className="font-mono text-zinc-300">
                  {marketType === "TOTAL_GOALS_OVER_UNDER"
                    ? `total_goals > ${threshold}`
                    : "winner"}
                </div>
              </div>
              <div>
                <span className="text-zinc-600">Settlement</span>
                <div className="text-zinc-300">Automatic</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating || !selectedFixture}
          className="w-full rounded-xl bg-green-accent px-6 py-3 text-sm font-semibold text-pitch transition-all hover:bg-green-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-pitch border-t-transparent" />
              Creating Room...
            </span>
          ) : (
            "Create Room"
          )}
        </button>
      </div>
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-accent border-t-transparent" />
        </div>
      }
    >
      <CreateRoomForm />
    </Suspense>
  );
}
