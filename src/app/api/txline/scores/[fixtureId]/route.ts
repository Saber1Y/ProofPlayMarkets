import { NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getScoreSnapshot, getScoreUpdates } from "@/lib/txline/client";

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
    const [snapshot, updates] = await Promise.all([
      getScoreSnapshot(id),
      getScoreUpdates(id).catch(() => null),
    ]);
    return NextResponse.json({ snapshot, updates: updates ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch scores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
