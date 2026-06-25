"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Fixture {
  id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
  competition_name?: string;
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
              <div className="flex items-center gap-4">
                <span className="font-medium w-36 text-right">{f.home_team}</span>
                <span className="text-zinc-600 text-sm">vs</span>
                <span className="font-medium w-36">{f.away_team}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {new Date(f.start_date).toLocaleDateString("en-US", {
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
            {f.competition_name && (
              <div className="text-xs text-zinc-600 mt-1 ml-40">{f.competition_name}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
