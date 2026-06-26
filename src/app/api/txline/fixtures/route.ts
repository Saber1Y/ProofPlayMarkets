import { NextRequest, NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getFixtures } from "@/lib/txline/client";

const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const MATCH_DURATION_BUFFER = 3 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    ensureTxLINEInit();
    const competitionId = req.nextUrl.searchParams.get("competitionId");
    const fixtures = await getFixtures(competitionId ? Number(competitionId) : undefined);

    const enriched = fixtures.map((f) => {
      const startDate = new Date(f.startDate).getTime();
      const elapsed = Date.now() - startDate;

      if (elapsed < 0) return { ...f, status: "scheduled" as const };

      if (elapsed < LIVE_WINDOW_MS) {
        return elapsed < MATCH_DURATION_BUFFER
          ? { ...f, status: "live" as const, homeScore: 0, awayScore: 0 }
          : { ...f, status: "finished" as const };
      }

      return { ...f, status: "finished" as const };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch fixtures";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
