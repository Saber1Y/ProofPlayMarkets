import { NextRequest, NextResponse } from "next/server";
import { getRoom, addParticipant } from "@/lib/rooms/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "OPEN") {
    return NextResponse.json({ error: "Room is not open" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { wallet, side, amount } = body;
    if (!wallet || !side || !amount) {
      return NextResponse.json({ error: "wallet, side, and amount required" }, { status: 400 });
    }
    const participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      wallet,
      side,
      amount,
    };
    const updated = addParticipant(id, participant);
    if (!updated) {
      return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
