import { PublicKey } from "@solana/web3.js";

export interface MarketAccount {
  creator: PublicKey;
  fixtureId: number;
  marketType: object; // { totalGoalsOverUnder: {} } | { matchWinner: {} }
  threshold: number;
  status: object; // { open: {} } | { locked: {} } | { settled: {} }
  winnerSide: object | null;
  merkleRoot: number[];
  totalOverStake: number;
  totalUnderStake: number;
  totalHomeStake: number;
  totalAwayStake: number;
  totalDrawStake: number;
  bump: number;
}

export interface ParticipantAccount {
  market: PublicKey;
  wallet: PublicKey;
  side: object;
  amount: number;
  claimed: boolean;
  bump: number;
}

export function marketPda(
  programId: PublicKey,
  creator: PublicKey,
  fixtureId: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), creator.toBuffer(), Buffer.from(new Uint8Array(new BigUint64Array([BigInt(fixtureId)]).buffer))],
    programId
  );
}

export function participantPda(
  programId: PublicKey,
  market: PublicKey,
  wallet: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("participant"), market.toBuffer(), wallet.toBuffer()],
    programId
  );
}


