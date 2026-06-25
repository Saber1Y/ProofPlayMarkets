import { NextRequest, NextResponse } from "next/server";
import { getRoom, lockRoom } from "@/lib/rooms/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const updated = lockRoom(id);
  if (!updated) return NextResponse.json({ error: "Room cannot be locked (not OPEN)" }, { status: 400 });

  return NextResponse.json(updated);
}
