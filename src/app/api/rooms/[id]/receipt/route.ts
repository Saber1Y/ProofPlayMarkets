import { NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "SETTLED" || !room.settlementReceipt) {
    return NextResponse.json({ error: "Room not yet settled" }, { status: 400 });
  }
  return NextResponse.json({
    ...room.settlementReceipt,
    homeTeam: room.homeTeam,
    awayTeam: room.awayTeam,
  });
}
