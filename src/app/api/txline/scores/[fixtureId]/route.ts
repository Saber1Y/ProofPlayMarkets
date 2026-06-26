import { NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getScoreSnapshot } from "@/lib/txline/client";

function parseLatestScore(raw: unknown): {
  home_score: number;
  away_score: number;
  status: string;
  period?: string;
  seq: number;
} | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const scoreEvent = raw.reduceRight<unknown | null>((found, event: Record<string, unknown>) => {
    if (found) return found;
    const score = event.Score as Record<string, Record<string, Record<string, number>>> | undefined;
    if (score?.Participant1?.Total?.Goals !== undefined && score?.Participant2?.Total?.Goals !== undefined) {
      return event;
    }
    return null;
  }, null);

  if (!scoreEvent) return null;

  const e = scoreEvent as Record<string, unknown>;
  const score = e.Score as Record<string, Record<string, Record<string, number>>>;
  const clock = e.Clock as { Running?: boolean; Seconds?: number } | undefined;
  const statusId = e.StatusId as number | undefined;
  const gameState = e.GameState as string | undefined;

  const home = score.Participant1.Total.Goals;
  const away = score.Participant2.Total.Goals;
  const seconds = clock?.Seconds ?? 0;
  const minutes = Math.floor(seconds / 60);

  const status =
    statusId === 4 || statusId === 2
      ? "in_progress"
      : statusId === 3
        ? "finished"
        : statusId === 1
          ? "scheduled"
          : gameState === "finished" || gameState === "closed"
            ? "finished"
            : "scheduled";

  return {
    home_score: home,
    away_score: away,
    status,
    period: seconds > 2700 ? `${minutes}'` : `${minutes}'`,
    seq: (e.Seq as number) ?? 0,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    ensureTxLINEInit();
    const { fixtureId } = await params;
    const id = Number(fixtureId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid fixture ID" }, { status: 400 });
    }
    const raw = await getScoreSnapshot(id);
    const snapshot = parseLatestScore(raw);
    return NextResponse.json({ snapshot, updates: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch scores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
