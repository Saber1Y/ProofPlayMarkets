"use client";

import { useEffect, useRef, useState } from "react";

interface LiveScoreState {
  homeScore: number;
  awayScore: number;
  seq: number;
  status: string;
  period?: string;
  timestamp: string;
  stats: Record<string, number>;
}

export function useLiveScore(fixtureId: number | null) {
  const [score, setScore] = useState<LiveScoreState | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!fixtureId) return;

    const es = new EventSource(`/api/txline/stream?fixtureId=${fixtureId}`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "score" && msg.data) {
          setScore({
            homeScore: msg.data.home_score,
            awayScore: msg.data.away_score,
            seq: msg.data.seq,
            status: msg.data.status,
            period: msg.data.period,
            timestamp: msg.data.timestamp,
            stats: msg.data.stats ?? {},
          });
        }
      } catch {
        // skip malformed
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  }, [fixtureId]);

  return { score, connected };
}
