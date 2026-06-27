import { NextRequest, NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getFixtures } from "@/lib/txline/client";
import { getMatchStatus, type MatchStatus } from "@/lib/txline/status";

export async function GET(req: NextRequest) {
  try {
    ensureTxLINEInit();
    const competitionId = req.nextUrl.searchParams.get("competitionId");
    const fixtures = await getFixtures(competitionId ? Number(competitionId) : undefined);

    const enriched = fixtures.map((f) => ({
      ...f,
      status: getMatchStatus(f.startDate) as MatchStatus,
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch fixtures";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
