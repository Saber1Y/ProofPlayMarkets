"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { teamCode } from "@/lib/teams";
import { TxLineBadge } from "@/components/ui/TxLineBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { GlassCard } from "@/components/ui/GlassCard";

interface FixtureScore {
  snapshot: {
    fixture_id: number;
    seq: number;
    status: string;
    home_score: number;
    away_score: number;
    stats: Record<string, number>;
    timestamp: string;
    period?: string;
  };
  updates: unknown[];
}

interface FixtureInfo {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  status: string;
  competition?: string;
}

const ROOM_TEMPLATES = [
  {
    name: "Goal Rush",
    prompt: "Will this match have 3+ goals?",
    rule: "YES wins if total goals are 3 or more. NO wins if 2 or fewer.",
    statKeys: "1 + 2",
  },
  {
    name: "Winner Pick",
    prompt: "Who wins the match?",
    rule: "Pick the winning team. Draw counts as a third option.",
    statKeys: "winner",
  },
  {
    name: "Super Cup",
    prompt: "Will the number of corners exceed 9.5?",
    rule: "YES wins if total corners are 10 or more. NO wins if 9 or fewer.",
    statKeys: "corners",
  },
  {
    name: "Discipline Meter",
    prompt: "Will cards cross the target?",
    rule: "Predict whether total cards (yellow + red) will exceed 3.5.",
    statKeys: "cards",
  },
];

export default function FixtureDetailPage() {
  const params = useParams();
  const fixtureId = params.fixtureId as string;
  const [fixture, setFixture] = useState<FixtureInfo | null>(null);
  const [score, setScore] = useState<FixtureScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fRes, sRes] = await Promise.all([
          fetch("/api/txline/fixtures"),
          fetch(`/api/txline/scores/${fixtureId}`),
        ]);
        const fixtures: FixtureInfo[] = await fRes.json();
        const scoreData: FixtureScore = await sRes.json();
        const match = fixtures.find((f) => f.id === Number(fixtureId));
        if (match) setFixture(match);
        setScore(scoreData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fixtureId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-accent border-t-transparent" />
          <span className="text-sm text-zinc-500">Loading fixture...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="glass-strong rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const snap = score?.snapshot;
  const isLive = snap?.status === "live" || snap?.status === "in_progress";
  const isFinished = snap?.status === "finished" || snap?.status === "closed";
  const hasScore = snap && (isLive || isFinished);

  const homeCode = teamCode(fixture?.homeTeam ?? "");
  const awayCode = teamCode(fixture?.awayTeam ?? "");

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/fixtures"
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to fixtures
      </Link>

      {/* Match header */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              {fixture?.competition ?? "World Cup"}
            </span>
            {fixture && (
              <span className="text-[10px] text-zinc-600">
                {new Date(fixture.startDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLive && <TxLineBadge status="active" />}
            {isFinished && <TxLineBadge status="verified" />}
            <StatusPill status={isLive ? "live" : isFinished ? "final" : "upcoming"} />
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              {homeCode ? (
                <img
                  src={`https://flagcdn.com/${homeCode.toLowerCase()}.svg`}
                  alt={fixture?.homeTeam ?? ""}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-zinc-400">
                  {fixture?.homeTeam?.charAt(0) ?? "?"}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {fixture?.homeTeam ?? "Home"}
            </span>
            {snap && (
              <span className="text-4xl font-bold tracking-tight">
                {snap.home_score}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 px-6">
            {hasScore ? (
              <>
                <span className="text-xs font-mono text-zinc-600">
                  {snap.period ?? "Full Time"}
                </span>
                {snap.status && (
                  <span className="text-[10px] text-zinc-600">
                    seq {snap.seq}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-zinc-600">vs</span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              {awayCode ? (
                <img
                  src={`https://flagcdn.com/${awayCode.toLowerCase()}.svg`}
                  alt={fixture?.awayTeam ?? ""}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-zinc-400">
                  {fixture?.awayTeam?.charAt(0) ?? "?"}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {fixture?.awayTeam ?? "Away"}
            </span>
            {snap && (
              <span className="text-4xl font-bold tracking-tight">
                {snap.away_score}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Match board */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Stats panel */}
          {snap?.stats && Object.keys(snap.stats).length > 0 && (
            <GlassCard className="p-4" hover={false}>
              <span className="section-header mb-3 block">Match Stats</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(snap.stats).map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-white/5 px-3 py-2"
                  >
                    <div className="text-[10px] font-mono text-zinc-600">
                      key {key}
                    </div>
                    <div className="text-sm font-mono font-medium text-zinc-200">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Data panel */}
          <GlassCard className="p-4" hover={false}>
            <span className="section-header mb-3 block">TxLINE Data</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-600">Fixture ID</span>
                <div className="font-mono text-zinc-300">{fixtureId}</div>
              </div>
              {snap && (
                <>
                  <div>
                    <span className="text-zinc-600">Sequence</span>
                    <div className="font-mono text-zinc-300">{snap.seq}</div>
                  </div>
                  <div>
                    <span className="text-zinc-600">Status</span>
                    <div className="font-mono text-zinc-300">{snap.status}</div>
                  </div>
                  <div>
                    <span className="text-zinc-600">Last Update</span>
                    <div className="font-mono text-zinc-300">
                      {new Date(snap.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Create prediction panel */}
        <div className="flex flex-col gap-3">
          <span className="section-header">Start a Room</span>
          {ROOM_TEMPLATES.map((tpl) => (
            <Link
              key={tpl.name}
              href={`/rooms/create?fixtureId=${fixtureId}&template=${tpl.name}`}
              className="glass-card group p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">{tpl.prompt}</p>
                  <p className="mt-1 text-[10px] text-zinc-600">
                    TxLINE: {tpl.statKeys}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-cyan-accent"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
