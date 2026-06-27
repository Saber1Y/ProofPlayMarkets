import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getRoom, addParticipant } from "@/lib/rooms/store";
import { getServerSDK } from "@/lib/solana/server";
import { getFixtureById } from "@/lib/txline/client";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { canJoinRoom } from "@/lib/txline/status";

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

  // Verify the match is still joinable (upcoming only for MVP)
  ensureTxLINEInit();
  const fixture = await getFixtureById(room.fixtureId);
  if (!fixture || !canJoinRoom(fixture.startDate)) {
    return NextResponse.json({
      error: "This match has already started. Joining is only allowed before kickoff.",
    }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { wallet, side, amount } = body;
    if (!wallet || !side || !amount) {
      return NextResponse.json({ error: "wallet, side, and amount required" }, { status: 400 });
    }

    // Build unsigned transaction for the user to sign
    const sdk = getServerSDK();
    const tx = await sdk.buildJoinTransaction(
      room.fixtureId,
      new PublicKey(wallet),
      side,
      amount,
    );

    // Create pending participant record
    const participantId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const participant = { id: participantId, wallet, side, amount };
    const updated = addParticipant(id, participant);
    if (!updated) {
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 });
    }

    return NextResponse.json({
      tx: Buffer.from(tx.serialize({ verifySignatures: false })).toString("base64"),
      participantId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
