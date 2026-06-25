"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function DemoPage() {
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);
  const [minute, setMinute] = useState(64);
  const [log, setLog] = useState<string[]>([]);

  function addEvent(msg: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev]);
  }

  function goal(side: "home" | "away") {
    if (side === "home") {
      setHomeScore((s) => s + 1);
      addEvent(`Goal: Home team scores! (${homeScore + 1}-${awayScore})`);
    } else {
      setAwayScore((s) => s + 1);
      addEvent(`Goal: Away team scores! (${homeScore}-${awayScore + 1})`);
    }
    setMinute((m) => Math.min(m + 10, 90));
  }

  function endMatch() {
    setMinute(90);
    addEvent(`Full time: ${homeScore}-${awayScore}`);
    addEvent(`Total goals: ${homeScore + awayScore}`);
  }

  function getOutcome() {
    const total = homeScore + awayScore;
    if (total >= 3) {
      return { side: "YES", text: `${total} goals — YES wins (3+)` };
    }
    return { side: "NO", text: `${total} goals — NO wins (2 or fewer)` };
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <span className="section-header">Demo</span>
        <h1 className="text-2xl font-bold">Match Replay Panel</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Simulate TxLINE-style match events for testing settlement
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Match simulation */}
        <GlassCard className="p-5" hover={false}>
          <span className="section-header mb-4 block">Match Status</span>

          <div className="mb-6 flex items-center justify-between">
            <div className="text-center">
              <div className="mb-1 text-xs text-zinc-500">Home</div>
              <div className="text-4xl font-bold">{homeScore}</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl text-zinc-600">:</div>
              <div className="text-xs font-mono text-zinc-500">{minute}&rsquo;</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-xs text-zinc-500">Away</div>
              <div className="text-4xl font-bold">{awayScore}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => goal("home")}
              className="w-full rounded-xl bg-green-accent/10 border border-green-accent/30 px-4 py-2.5 text-sm font-medium text-green-accent hover:bg-green-accent/20 transition-colors"
            >
              Push Goal — Home
            </button>
            <button
              onClick={() => goal("away")}
              className="w-full rounded-xl bg-cyan-accent/10 border border-cyan-accent/30 px-4 py-2.5 text-sm font-medium text-cyan-accent hover:bg-cyan-accent/20 transition-colors"
            >
              Push Goal — Away
            </button>
            <button
              onClick={endMatch}
              className="w-full rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              End Match (Final Whistle)
            </button>
          </div>
        </GlassCard>

        {/* Outcome */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5" hover={false}>
            <span className="section-header mb-3 block">Expected Room Outcome</span>
            <div
              className={`rounded-xl border p-4 text-center ${
                getOutcome().side === "YES"
                  ? "border-green-accent/30 bg-green-accent/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div
                className={`text-lg font-bold ${
                  getOutcome().side === "YES" ? "text-green-accent" : "text-red-400"
                }`}
              >
                {getOutcome().side}
              </div>
              <div className="mt-1 text-xs text-zinc-500">{getOutcome().text}</div>
            </div>
            <div className="mt-3 text-xs text-zinc-600">
              Rule: Will total goals reach 3+?<br />
              Current: {homeScore + awayScore} total goals
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <span className="section-header mb-3 block">Event Log</span>
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
              {log.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-xs text-zinc-600">
                  No events yet. Push a goal to start.
                </div>
              ) : (
                log.map((entry, i) => (
                  <div
                    key={i}
                    className="rounded bg-white/[0.02] px-3 py-1.5 text-[10px] font-mono text-zinc-500"
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400/80">
        Demo replay mode mirrors the TxLINE event structure so judges can test
        settlement when no live match is active.
      </div>
    </div>
  );
}
