"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
}

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
    return <div className="animate-pulse text-zinc-500 py-24 text-center">Loading fixture...</div>;
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const snap = score?.snapshot;
  const isLive = snap?.status === "live" || snap?.status === "in_progress";
  const isFinished = snap?.status === "finished" || snap?.status === "closed";

  return (
    <div>
      <Link href="/fixtures" className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block">
        &larr; Back to fixtures
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">
              {fixture?.home_team ?? "Home"} vs {fixture?.away_team ?? "Away"}
            </h1>
            {fixture && (
              <p className="text-sm text-zinc-500 mt-1">
                {new Date(fixture.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isLive
                ? "bg-green-900/50 text-green-400 animate-pulse"
                : isFinished
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-800/50 text-zinc-500"
            }`}
          >
            {isLive ? "LIVE" : isFinished ? "FINISHED" : "SCHEDULED"}
          </span>
        </div>

        {snap && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <div className="text-lg font-medium text-zinc-300">{fixture?.home_team ?? "Home"}</div>
                <div className="text-4xl font-bold mt-2">{snap.home_score}</div>
              </div>
              <div className="text-2xl text-zinc-600">:</div>
              <div className="text-center">
                <div className="text-lg font-medium text-zinc-300">{fixture?.away_team ?? "Away"}</div>
                <div className="text-4xl font-bold mt-2">{snap.away_score}</div>
              </div>
            </div>
            <div className="text-center text-sm text-zinc-500">
              seq {snap.seq} &middot; {snap.period ?? "full"}
            </div>
          </div>
        )}

        {snap?.stats && Object.keys(snap.stats).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(snap.stats).map(([key, val]) => (
                <div key={key} className="rounded bg-zinc-800/50 px-3 py-1.5 text-sm">
                  <span className="text-zinc-500">key {key}:</span> {val}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Link
            href={`/rooms/create?fixtureId=${fixtureId}`}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Create Room
          </Link>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-600">
        Fixture ID: {fixtureId} &middot;
        {snap && (
          <>
            Last updated: {new Date(snap.timestamp).toLocaleTimeString()} &middot;
            Sequence: {snap.seq}
          </>
        )}
      </div>
    </div>
  );
}
