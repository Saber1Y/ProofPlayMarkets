"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Participant {
  id: string;
  wallet: string;
  side: string;
  amount: number;
  claimed: boolean;
}

interface SettlementReceipt {
  fixtureId: number;
  finalScore: { home: number; away: number };
  winnerSide: string;
  merkleRootPda: string;
  validationResult: boolean;
  payoutSummary: { participant: string; amount: number }[];
}

interface Room {
  id: string;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  threshold: number;
  status: string;
  participants: Participant[];
  createdBy: string;
  createdAt: string;
  winnerSide?: string;
  settlementReceipt?: SettlementReceipt;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState("");
  const [selectedSide, setSelectedSide] = useState<string>("");
  const [amount, setAmount] = useState("1");
  const [joining, setJoining] = useState(false);
  const [settling, setSettling] = useState(false);

  function loadRoom() {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRoom(data);
      })
      .catch(() => setError("Failed to load room"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  async function handleJoin() {
    if (!wallet || !selectedSide) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, side: selectedSide, amount: Number(amount) }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRoom(data);
      }
    } catch {
      setError("Failed to join");
    } finally {
      setJoining(false);
    }
  }

  async function handleSettle() {
    setSettling(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/settle`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRoom(data);
      }
    } catch {
      setError("Failed to settle");
    } finally {
      setSettling(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse text-zinc-500 py-24 text-center">Loading room...</div>;
  }

  if (error || !room) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-400 mb-4">{error || "Room not found"}</p>
        <Link href="/rooms" className="text-emerald-400 hover:underline">Back to rooms</Link>
      </div>
    );
  }

  const overCount = room.participants.filter((p) => p.side === "OVER").reduce((s, p) => s + p.amount, 0);
  const underCount = room.participants.filter((p) => p.side === "UNDER").reduce((s, p) => s + p.amount, 0);
  const homeCount = room.participants.filter((p) => p.side === "HOME").reduce((s, p) => s + p.amount, 0);
  const awayCount = room.participants.filter((p) => p.side === "AWAY").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <Link href="/rooms" className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 inline-block">
        &larr; Back to rooms
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">
              {room.homeTeam} vs {room.awayTeam}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {room.marketType.replace(/_/g, " ")} &middot; Threshold: {room.threshold}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              room.status === "OPEN"
                ? "bg-emerald-900/50 text-emerald-400"
                : room.status === "LOCKED"
                  ? "bg-yellow-900/50 text-yellow-400"
                  : "bg-blue-900/50 text-blue-400"
            }`}
          >
            {room.status}
          </span>
        </div>

        {/* Score display if settled */}
        {room.status === "SETTLED" && room.settlementReceipt && (
          <div className="mb-6 rounded-lg bg-zinc-800/50 p-4 text-center">
            <div className="text-3xl font-bold mb-1">
              {room.settlementReceipt.finalScore.home} : {room.settlementReceipt.finalScore.away}
            </div>
            <div className="text-sm">
              Winner: <span className="font-semibold text-emerald-400">{room.winnerSide}</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Validation: {room.settlementReceipt.validationResult ? "Passed ✓" : "Failed ✗"}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Participants ({room.participants.length})</h3>
          {room.participants.length === 0 ? (
            <p className="text-sm text-zinc-600">No participants yet.</p>
          ) : (
            <div className="space-y-1">
              {room.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm rounded bg-zinc-800/30 px-3 py-1.5">
                  <span className="text-zinc-300">
                    {p.wallet.slice(0, 6)}...{p.wallet.slice(-4)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      p.side === "OVER" || p.side === "HOME"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-red-900/50 text-red-400"
                    }`}>
                      {p.side}
                    </span>
                    <span className="text-zinc-400">{p.amount}x</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {room.participants.length > 0 && (
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              {room.marketType === "TOTAL_GOALS_OVER_UNDER" ? (
                <>
                  <span>OVER: {overCount}x</span>
                  <span>UNDER: {underCount}x</span>
                </>
              ) : (
                <>
                  <span>HOME: {homeCount}x</span>
                  <span>AWAY: {awayCount}x</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Join form (only when OPEN) */}
        {room.status === "OPEN" && (
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">Join this room</h3>
            <div className="flex gap-2">
              {room.marketType === "TOTAL_GOALS_OVER_UNDER" ? (
                <>
                  <button
                    onClick={() => setSelectedSide("OVER")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSide === "OVER"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    OVER {room.threshold}
                  </button>
                  <button
                    onClick={() => setSelectedSide("UNDER")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSide === "UNDER"
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    UNDER {room.threshold}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectedSide("HOME")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                      selectedSide === "HOME" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-zinc-700 text-zinc-400"
                    }`}>HOME</button>
                  <button onClick={() => setSelectedSide("DRAW")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                      selectedSide === "DRAW" ? "border-yellow-500 bg-yellow-500/20 text-yellow-400" : "border-zinc-700 text-zinc-400"
                    }`}>DRAW</button>
                  <button onClick={() => setSelectedSide("AWAY")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                      selectedSide === "AWAY" ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-zinc-700 text-zinc-400"
                    }`}>AWAY</button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="Your wallet address"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-center"
              />
              <button
                onClick={handleJoin}
                disabled={joining || !wallet || !selectedSide}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {joining ? "..." : "Join"}
              </button>
            </div>
          </div>
        )}

        {/* Admin actions */}
        {room.status === "OPEN" && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={async () => {
                const res = await fetch(`/api/rooms/${roomId}/lock`, { method: "POST" });
                if (res.ok) {
                  const updated = await res.json();
                  setRoom(updated);
                } else {
                  const err = await res.json();
                  setError(err.error);
                }
              }}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500"
            >
              Lock Room (Kickoff)
            </button>
          </div>
        )}

        {room.status === "LOCKED" && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={handleSettle}
              disabled={settling}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {settling ? "Processing..." : "Settle Room"}
            </button>
          </div>
        )}

        {/* Settled: show receipt link */}
        {room.status === "SETTLED" && room.settlementReceipt && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <Link
              href={`/rooms/${room.id}/receipt`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium inline-block hover:bg-blue-500"
            >
              View Settlement Receipt
            </Link>
          </div>
        )}

        {error && (
          <div className="mt-3 text-sm text-red-400">{error}</div>
        )}
      </div>

      <div className="mt-4 text-xs text-zinc-600">
        Room ID: {room.id} &middot; Created: {new Date(room.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
