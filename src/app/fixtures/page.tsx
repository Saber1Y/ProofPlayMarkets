"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeamFlagUrl } from "@/lib/teams";

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  status: string;
  competition: string;
}

function FixtureFlag({ name, size }: { name: string; size?: number }) {
  const src = getTeamFlagUrl(name);
  const s = size ?? 24;
  if (!src) {
    return (
      <div
        className="rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0"
        style={{ width: s, height: s }}
      >
        {name[0]}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="rounded-sm object-cover shrink-0"
      style={{ width: s, height: s }}
    />
  );
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/txline/fixtures")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFixtures(data);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-zinc-500">Loading fixtures...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <p className="text-zinc-500 text-sm">
          Make sure TXLINE_JWT and TXLINE_API_TOKEN are set in your .env
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">World Cup Fixtures</h1>
      <div className="grid gap-3">
        {fixtures.map((f) => (
          <Link
            key={f.id}
            href={`/fixtures/${f.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FixtureFlag name={f.homeTeam} />
                <span className="font-medium text-right min-w-[6rem]">{f.homeTeam}</span>
                <span className="text-zinc-600 text-xs">vs</span>
                <span className="font-medium min-w-[6rem]">{f.awayTeam}</span>
                <FixtureFlag name={f.awayTeam} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {new Date(f.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    f.status === "live"
                      ? "bg-green-900/50 text-green-400"
                      : f.status === "finished"
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-zinc-800/50 text-zinc-500"
                  }`}
                >
                  {f.status || "scheduled"}
                </span>
              </div>
            </div>
            {f.competition && (
              <div className="text-xs text-zinc-600 mt-1 ml-12">{f.competition}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
