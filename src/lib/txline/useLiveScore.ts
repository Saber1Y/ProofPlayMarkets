"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface LiveScoreState {
  homeScore: number;
  awayScore: number;
  seq: number;
  status: string;
  period?: string;
}

interface TxLINEStreamEvent {
  FixtureId: number;
  Seq: number;
  Action: string;
  StatusId?: number;
  GameState?: string;
  Score?: {
    Participant1: { Total: { Goals: number } };
    Participant2: { Total: { Goals: number } };
  };
  Clock?: {
    Running: boolean;
    Seconds: number;
  };
  Ts: number;
}

function parseTxLINEEvent(e: TxLINEStreamEvent): LiveScoreState | null {
  if (e.Score?.Participant1?.Total?.Goals == null || e.Score?.Participant2?.Total?.Goals == null) return null;
  const seconds = e.Clock?.Seconds ?? 0;
  const minutes = Math.floor(seconds / 60);
  const statusId = e.StatusId ?? 0;
  const status = statusId === 4 || statusId === 2 ? "in_progress"
    : statusId === 3 ? "finished"
    : e.GameState === "finished" || e.GameState === "closed" ? "finished"
    : "scheduled";
  return {
    homeScore: e.Score.Participant1.Total.Goals,
    awayScore: e.Score.Participant2.Total.Goals,
    seq: e.Seq,
    status,
    period: `${minutes}'`,
  };
}

export function useLiveScore(fixtureId: number, initial?: { homeScore: number; awayScore: number }) {
  const [score, setScore] = useState<LiveScoreState | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connectSSE = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    const es = new EventSource(`/api/txline/stream?fixtureId=${fixtureId}`);
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const items = Array.isArray(raw) ? raw : [raw];
        for (const item of items) {
          const parsed = parseTxLINEEvent(item as TxLINEStreamEvent);
          if (parsed) {
            setScore((prev) => (prev && prev.seq >= parsed.seq ? prev : parsed));
          }
        }
      } catch {
        // skip malformed
      }
    };
    es.onerror = () => setConnected(false);
  }, [fixtureId]);

  useEffect(() => {
    setScore(null);
    setConnected(false);
    fetch(`/api/txline/scores/${fixtureId}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.snapshot;
        if (s?.home_score != null) {
          setScore({
            homeScore: s.home_score,
            awayScore: s.away_score,
            seq: s.seq,
            status: s.status,
            period: s.period,
          });
        }
      })
      .catch(() => {});
    connectSSE();
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setConnected(false);
    };
  }, [fixtureId, connectSSE]);

  const refresh = useCallback(() => {
    setScore(null);
    setConnected(false);
    fetch(`/api/txline/scores/${fixtureId}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.snapshot;
        if (s?.home_score != null) {
          setScore({
            homeScore: s.home_score,
            awayScore: s.away_score,
            seq: s.seq,
            status: s.status,
            period: s.period,
          });
        }
      })
      .catch(() => {});
    connectSSE();
  }, [fixtureId, connectSSE]);

  const homeScore = score?.homeScore ?? initial?.homeScore;
  const awayScore = score?.awayScore ?? initial?.awayScore;

  return { score, connected, refresh, homeScore, awayScore };
}