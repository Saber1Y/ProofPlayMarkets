import { NextRequest, NextResponse } from "next/server";
import { createRoom, listRooms } from "@/lib/rooms/store";
import { getServerSDK } from "@/lib/solana/server";
import { Connection } from "@solana/web3.js";
import { DEVNET_RPC } from "@/lib/solana/constants";

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

    const sdk = getServerSDK();
    const [marketPda] = sdk.marketPda(fixtureId);

    // Check if market PDA already exists on-chain — if so, re-use it
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const accountInfo = await connection.getAccountInfo(marketPda);
    if (accountInfo) {
      const room = createRoom({
        fixtureId, homeTeam, awayTeam, marketType, threshold, wallet,
        marketPda: marketPda.toBase58(),
      });
      return NextResponse.json(room, { status: 201 });
    }

    const txSig = await sdk.initializeMarket(fixtureId, marketType, threshold);

    const room = createRoom({
      fixtureId, homeTeam, awayTeam, marketType, threshold, wallet,
      marketPda: marketPda.toBase58(),
      initializeTx: txSig,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";

    // Catch the common "already in use" simulation error and return a friendly message
    if (msg.includes("custom program error: 0x0") || msg.includes("already in use")) {
      return NextResponse.json({
        error: "A market for this fixture already exists on-chain. Each fixture can only have one room. Please pick a different fixture from the list.",
      }, { status: 409 });
    }

    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
