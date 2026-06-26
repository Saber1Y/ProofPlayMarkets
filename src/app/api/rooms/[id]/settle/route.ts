import { NextResponse } from "next/server";
import { getRoom, setAwaitingProof, settleRoom } from "@/lib/rooms/store";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getScoreSnapshot, getStatValidation } from "@/lib/txline/client";
import { getServerSDK } from "@/lib/solana/server";
import type { Side, SettlementReceipt } from "@/lib/rooms/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  // Anyone can settle — permissionless
  if (room.status !== "LOCKED" && room.status !== "AWAITING_PROOF") {
    return NextResponse.json({ error: "Room must be LOCKED before settling" }, { status: 400 });
  }

  try {
    ensureTxLINEInit();

    // If first time, mark as awaiting proof
    if (room.status === "LOCKED") {
      setAwaitingProof(id);
    }

    // 1. Fetch latest score from TxLINE
    const snapshot = await getScoreSnapshot(room.fixtureId);
    const homeScore = Number(snapshot.home_score ?? 0);
    const awayScore = Number(snapshot.away_score ?? 0);
    const total = homeScore + awayScore;

    // Check if match is truly finished
    const matchFinished = snapshot.status?.toLowerCase() === "finished" || snapshot.status?.toLowerCase() === "final";
    if (!matchFinished && room.status === "AWAITING_PROOF") {
      return NextResponse.json({
        error: "Match not yet finished. Current status: " + snapshot.status,
        awaitingProof: true,
      }, { status: 400 });
    }

    // 2. Determine winner
    let winnerSide: Side;
    if (room.marketType === "TOTAL_GOALS_OVER_UNDER") {
      winnerSide = total > room.threshold ? "OVER" : "UNDER";
    } else {
      if (homeScore > awayScore) winnerSide = "HOME";
      else if (awayScore > homeScore) winnerSide = "AWAY";
      else winnerSide = "DRAW";
    }

    // 3. Get stat validation proof from TxLINE
    const statKeys = room.marketType === "TOTAL_GOALS_OVER_UNDER" ? [1, 2] : [1];
    const validation = await getStatValidation({
      fixtureId: room.fixtureId,
      seq: snapshot.seq ?? 1,
      statKey: statKeys[0],
      statKey2: statKeys.length > 1 ? statKeys[1] : undefined,
      operator: "SUM",
    });

    // 4. Settle on-chain via server admin keypair
    const sdk = getServerSDK();
    const merkleRoot = Array.from(
      Buffer.from(validation.merkle_root?.slice(0, 64).padEnd(64, "0") ?? "0".repeat(64), "hex")
    );
    const settleTx = await sdk.settleMarket(room.fixtureId, winnerSide, merkleRoot);

    // 5. Build settlement receipt
    const receipt: SettlementReceipt = {
      fixtureId: room.fixtureId,
      roomId: room.id,
      marketType: room.marketType,
      threshold: room.threshold,
      finalScore: { home: homeScore, away: awayScore },
      statKeysUsed: statKeys,
      txlineSeq: snapshot.seq ?? 1,
      txlineTimestamp: snapshot.timestamp ?? new Date().toISOString(),
      merkleRootPda: validation.merkle_root ?? "pending",
      validationEndpoint: "https://txline-dev.txodds.com/api/scores/stat-validation",
      validationResult: validation.result,
      settlementTx: settleTx,
      winnerSide,
      payoutSummary: room.participants
        .filter((p) => p.side === winnerSide)
        .map((p) => ({ participant: p.wallet, amount: p.amount * 2 })),
    };

    const settled = settleRoom(id, winnerSide, receipt, settleTx);
    if (!settled) {
      return NextResponse.json({ error: "Failed to settle room" }, { status: 500 });
    }

    return NextResponse.json(settled);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Settlement failed";
    return NextResponse.json({ error: msg, awaitingProof: true }, { status: 500 });
  }
}
