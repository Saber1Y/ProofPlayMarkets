import { NextRequest, NextResponse } from "next/server";
import { getRoom, getPendingJoin, confirmPendingJoin } from "@/lib/rooms/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { participantId, txSig } = body;
    if (!participantId || !txSig) {
      return NextResponse.json({ error: "participantId and txSig required" }, { status: 400 });
    }

    const updated = confirmPendingJoin(id, participantId, txSig);
    if (!updated) {
      return NextResponse.json({ error: "Failed to confirm join" }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
