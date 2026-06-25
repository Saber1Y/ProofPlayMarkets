import { NextResponse } from "next/server";
import { getRoom, settleRoom } from "@/lib/rooms/store";
import { ensureTxLINEInit } from "@/lib/txline/server-init";
import { getScoreSnapshot, getStatValidation } from "@/lib/txline/client";
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
  if (room.status !== "LOCKED") {
    return NextResponse.json({ error: "Room must be LOCKED before settling" }, { status: 400 });
  }

  try {
    ensureTxLINEInit();

    // 1. Fetch latest score from TxLINE
    const snapshot = await getScoreSnapshot(room.fixtureId);
    const homeScore = Number(snapshot.home_score ?? 0);
    const awayScore = Number(snapshot.away_score ?? 0);
    const total = homeScore + awayScore;

    // 2. Determine winner
    let winnerSide: Side;
    if (room.marketType === "TOTAL_GOALS_OVER_UNDER") {
      winnerSide = total > room.threshold ? "OVER" : "UNDER";
    } else {
      // MATCH_WINNER
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

    // 4. Build settlement receipt (partial — full on-chain verification later)
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
      winnerSide,
      payoutSummary: room.participants
        .filter((p) => p.side === winnerSide)
        .map((p) => ({ participant: p.wallet, amount: p.amount * 2 })),
    };

    const settled = settleRoom(id, winnerSide, receipt);
    if (!settled) {
      return NextResponse.json({ error: "Failed to settle room" }, { status: 500 });
    }

    return NextResponse.json(settled);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Settlement failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
