import { NextRequest, NextResponse } from "next/server";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getStatValidation } from "@/lib/txline/client";

export async function POST(req: NextRequest) {
  try {
    ensureTxLINEInit();
    const body = await req.json();
    const { fixtureId, seq, statKey, statKey2, operator } = body;
    if (!fixtureId || seq === undefined || !statKey) {
      return NextResponse.json(
        { error: "fixtureId, seq, and statKey are required" },
        { status: 400 }
      );
    }
    const result = await getStatValidation({ fixtureId, seq, statKey, statKey2, operator });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
