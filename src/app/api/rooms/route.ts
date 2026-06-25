import { NextRequest, NextResponse } from "next/server";
import { createRoom, listRooms } from "@/lib/rooms/store";
import { getServerSDK } from "@/lib/solana/server";

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

    // Initialize market on-chain via server admin keypair
    const sdk = getServerSDK();
    const txSig = await sdk.initializeMarket(fixtureId, marketType, threshold);

    const room = createRoom({
      fixtureId, homeTeam, awayTeam, marketType, threshold, wallet,
      marketPda: sdk.marketPda(fixtureId)[0].toBase58(),
      initializeTx: txSig,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
