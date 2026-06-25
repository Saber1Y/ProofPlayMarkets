import { NextRequest, NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getFixtures } from "@/lib/txline/client";

export async function GET(req: NextRequest) {
  try {
    ensureTxLINEInit();
    const competitionId = req.nextUrl.searchParams.get("competitionId");
    const fixtures = await getFixtures(competitionId ? Number(competitionId) : undefined);
    return NextResponse.json(fixtures);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch fixtures";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
