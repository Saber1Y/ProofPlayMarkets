export type MarketType = "TOTAL_GOALS_OVER_UNDER" | "MATCH_WINNER";

export type RoomStatus = "OPEN" | "LOCKED" | "SETTLED";

export type Side = "OVER" | "UNDER" | "HOME" | "AWAY" | "DRAW";

export interface Participant {
  id: string;
  wallet: string;
  side: Side;
  amount: number;
  claimed: boolean;
}

export interface SettlementReceipt {
  fixtureId: number;
  roomId: string;
  marketType: MarketType;
  threshold: number;
  finalScore: { home: number; away: number };
  statKeysUsed: number[];
  txlineSeq: number;
  txlineTimestamp: string;
  merkleRootPda: string;
  validationEndpoint: string;
  validationResult: boolean;
  settlementTx?: string;
  winnerSide: Side;
  payoutSummary: { participant: string; amount: number }[];
}

export interface Room {
  id: string;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: MarketType;
  threshold: number;
  status: RoomStatus;
  participants: Participant[];
  createdBy: string;
  createdAt: string;
  winnerSide?: Side;
  settlementReceipt?: SettlementReceipt;
}

export interface CreateRoomRequest {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: MarketType;
  threshold: number;
  wallet: string;
}

export interface JoinRoomRequest {
  wallet: string;
  side: Side;
  amount: number;
}
