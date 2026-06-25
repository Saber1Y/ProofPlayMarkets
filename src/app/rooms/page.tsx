"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { teamCode } from "@/lib/teams";
import { StatusPill } from "@/components/ui/StatusPill";
import { GlassCard } from "@/components/ui/GlassCard";

interface Room {
  id: string;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  threshold: number;
  status: string;
  participantCount: number;
}

const TABS = ["Active", "Awaiting Settlement", "Settled"] as const;
type Tab = (typeof TABS)[number];

const marketLabels: Record<string, string> = {
  TOTAL_GOALS_OVER_UNDER: "Goal Rush",
  MATCH_WINNER: "Winner Pick",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Active");

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = {
    active: rooms.filter((r) => r.status === "OPEN" || r.status === "LOCKED" || r.status === "LIVE"),
    awaiting: rooms.filter((r) => r.status === "AWAITING_PROOF"),
    settled: rooms.filter((r) => r.status === "SETTLED" || r.status === "CLAIMABLE"),
  };

  const tabRooms =
    tab === "Active"
      ? grouped.active
      : tab === "Awaiting Settlement"
        ? grouped.awaiting
        : grouped.settled;

  const stats = [
    { label: "Active", value: grouped.active.length },
    { label: "Settled", value: grouped.settled.length },
    { label: "Claimable", value: rooms.filter((r) => r.status === "CLAIMABLE").length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="section-header">Dashboard</span>
          <h1 className="text-2xl font-bold">My Rooms</h1>
        </div>
        <Link
          href="/fixtures"
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-accent px-4 py-2 text-sm font-semibold text-pitch transition-all hover:bg-green-accent/90"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Room
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-4 text-center" hover={false}>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="mt-0.5 text-xs text-zinc-500">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-white/5 pb-3">
        {TABS.map((t) => {
          const count =
            t === "Active"
              ? grouped.active.length
              : t === "Awaiting Settlement"
                ? grouped.awaiting.length
                : grouped.settled.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    tab === t
                      ? "bg-white/15 text-zinc-300"
                      : "bg-white/5 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Room list */}
      {tabRooms.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <div className="text-center">
            <p className="text-sm text-zinc-500">No rooms in this category</p>
            <Link
              href="/fixtures"
              className="mt-3 inline-block text-xs font-medium text-cyan-accent hover:text-cyan-300"
            >
              Browse fixtures →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {tabRooms.map((room) => {
            const homeCode = teamCode(room.homeTeam);
            const awayCode = teamCode(room.awayTeam);
            const label = marketLabels[room.marketType] ?? room.marketType;

            return (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="glass-card group flex items-center gap-4 p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                    {homeCode ? (
                      <img
                        src={`https://flagcdn.com/${homeCode.toLowerCase()}.svg`}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      room.homeTeam.charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-zinc-600">vs</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                    {awayCode ? (
                      <img
                        src={`https://flagcdn.com/${awayCode.toLowerCase()}.svg`}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      room.awayTeam.charAt(0)
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {label}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {room.homeTeam} vs {room.awayTeam}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-600">
                    {room.participantCount} participants
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill status={room.status.toLowerCase() as any} />
                  <svg
                    className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
