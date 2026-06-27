"use client";

import React, { Suspense, useEffect, useState } from "react";
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
    statKeys: "1 (Team A goals) + 2 (Team B goals)",
  },
  {
    id: "MATCH_WINNER",
    name: "Winner Pick",
    desc: "Who wins the match?",
    rule: "Pick the winning team. Draw counts as a third option.",
    statKeys: "Winner stat from TxLINE",
  },
];

const STEPS = [
  { num: 1, label: "Match" },
  { num: 2, label: "Type" },
  { num: 3, label: "Settings" },
  { num: 4, label: "Verify" },
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
  const [threshold, setThreshold] = useState<string>("3");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

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
      setThreshold("3");
    } else if (template === "Winner Pick") {
      setMarketType("MATCH_WINNER");
    }
  }, [template]);

  const selected = fixtures.find((f) => f.id === Number(selectedFixture));
  const homeCode = teamCode(selected?.homeTeam ?? "");
  const awayCode = teamCode(selected?.awayTeam ?? "");
  const marketDef = MARKET_TYPES.find((m) => m.id === marketType);

  async function handleCreate() {
    if (!selectedFixture || !wallet || !selected) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId: selected.id,
          homeTeam: selected.homeTeam,
          awayTeam: selected.awayTeam,
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

  function nextStep() {
    if (step === 1 && !selectedFixture) return;
    if (step < 4) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

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

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div
              className={`flex items-center gap-2 ${
                s.num === step ? "text-green-accent" : s.num < step ? "text-zinc-400" : "text-zinc-700"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  s.num === step
                    ? "bg-green-accent/20 text-green-accent"
                    : s.num < step
                    ? "bg-green-accent/10 text-green-accent"
                    : "bg-white/5 text-zinc-600"
                }`}
              >
                {s.num < step ? (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5L9.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s.num
                )}
              </span>
              <span className="hidden text-xs sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 ${s.num < step ? "bg-green-accent/30" : "bg-white/10"}`} />
            )}
            </React.Fragment>
          ))}
        </div>

      <div className="flex flex-col gap-5">
        {/* Step 1: Select Match */}
        {step === 1 && (
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
        )}

        {/* Step 2: Prediction Type */}
        {step === 2 && (
          <GlassCard className="p-5" hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
                2
              </span>
              <span className="text-sm font-medium text-white">Prediction Type</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {MARKET_TYPES.map((mt) => (
                <button
                  key={mt.id}
                  onClick={() => {
                    setMarketType(mt.id);
                    if (mt.id === "TOTAL_GOALS_OVER_UNDER") setThreshold("3");
                  }}
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
        )}

        {/* Step 3: Room Settings */}
        {step === 3 && (
          <GlassCard className="p-5" hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
                3
              </span>
              <span className="text-sm font-medium text-white">Room Settings</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Goal Threshold</label>
                <input
                  type="number"
                  step="1"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                  disabled={marketType !== "TOTAL_GOALS_OVER_UNDER"}
                />
                <p className="mt-1 text-[10px] text-zinc-600">
                  {marketType === "TOTAL_GOALS_OVER_UNDER"
                    ? `YES wins if total goals >= ${threshold}. NO wins if total goals < ${threshold}.`
                    : "Threshold only applies to Goal Rush."}
                </p>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-2">Room Rules</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-zinc-600">Entry</span>
                    <div className="font-mono text-zinc-400">1 entry</div>
                  </div>
                  <div>
                    <span className="text-zinc-600">Max participants</span>
                    <div className="font-mono text-zinc-400">Unlimited</div>
                  </div>
                  <div>
                    <span className="text-zinc-600">Closes at</span>
                    <div className="font-mono text-zinc-400">Kickoff</div>
                  </div>
                  <div>
                    <span className="text-zinc-600">Visibility</span>
                    <div className="font-mono text-zinc-400">Public</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 4: Verification Preview */}
        {step === 4 && selected && marketDef && (
          <GlassCard className="p-5" hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-accent/20 text-[10px] font-bold text-green-accent">
                4
              </span>
              <span className="text-sm font-medium text-white">Verification Preview</span>
            </div>

            <div className="glass mb-4 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white">{selected.homeTeam} vs {selected.awayTeam}</h3>
              <p className="mt-1 text-xs text-zinc-500">{marketDef.name}</p>
              <p className="mt-1 text-xs text-zinc-400">{marketDef.rule}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-zinc-600">Resolution Source</span>
                <div className="mt-0.5 font-medium text-cyan-accent">TxLINE Score Feed</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-zinc-600">Stat Keys Used</span>
                <div className="mt-0.5 font-mono text-zinc-300">{marketDef.statKeys}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-zinc-600">Settlement Rule</span>
                <div className="mt-0.5 font-mono text-zinc-300">
                  {marketType === "TOTAL_GOALS_OVER_UNDER"
                    ? `total_goals >= ${threshold}`
                    : "winner"}
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-zinc-600">Verification</span>
                <div className="mt-0.5 text-zinc-300">TxLINE + Solana</div>
              </div>
            </div>

            {/* Win condition examples */}
            {marketType === "TOTAL_GOALS_OVER_UNDER" && (
              <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-[10px] font-medium text-zinc-500">Win conditions</span>
                <div className="mt-2 flex flex-col gap-1 text-[10px]">
                  <span className="text-green-accent">
                    YES wins: {threshold}-0, 2-1, 3-0, 2-2, 4-1...
                  </span>
                  <span className="text-red-400">
                    NO wins: 0-0, 1-0, 1-1, 2-0...
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="rounded-xl border border-white/10 px-6 py-3 text-xs font-medium text-zinc-400 hover:border-white/20 transition-colors"
            >
              Back
            </button>
          ) : (
            <Link
              href="/fixtures"
              className="rounded-xl border border-white/10 px-6 py-3 text-xs font-medium text-zinc-400 hover:border-white/20 transition-colors"
            >
              Cancel
            </Link>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !selectedFixture}
              className="flex-1 rounded-xl bg-green-accent px-6 py-3 text-xs font-semibold text-pitch transition-all hover:bg-green-accent/90 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 rounded-xl bg-green-accent px-6 py-3 text-sm font-semibold text-pitch transition-all hover:bg-green-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          )}
        </div>
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
