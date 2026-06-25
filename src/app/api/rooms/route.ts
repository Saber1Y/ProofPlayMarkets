import { NextRequest, NextResponse } from "next/server";
import { createRoom, listRooms } from "@/lib/rooms/store";

export async function GET() {
  const rooms = listRooms();
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fixtureId, homeTeam, awayTeam, marketType, threshold, wallet } = body;
    if (!fixtureId || !homeTeam || !awayTeam || !marketType || threshold === undefined || !wallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const room = createRoom({ fixtureId, homeTeam, awayTeam, marketType, threshold, wallet });
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
