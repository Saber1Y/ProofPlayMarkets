"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Rooms</h1>
        <Link
          href="/fixtures"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          + New Room
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse text-zinc-500 py-12 text-center">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">
          <p className="mb-2">No rooms yet.</p>
          <p className="text-sm">Pick a fixture and create your first prediction room.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {room.homeTeam} vs {room.awayTeam}
                  </div>
                  <div className="text-sm text-zinc-500 mt-0.5">
                    {room.marketType} &middot; {room.threshold}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500">{room.participantCount} joined</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      room.status === "OPEN"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : room.status === "LOCKED"
                          ? "bg-yellow-900/50 text-yellow-400"
                          : room.status === "SETTLED"
                            ? "bg-blue-900/50 text-blue-400"
                            : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
