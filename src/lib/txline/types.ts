export interface TxLINEConfig {
  baseUrl: string;
  jwt: string;
  apiToken: string;
}

/** Raw fixture from TxLINE API (PascalCase) */
export interface TxLINEFixtureRaw {
  FixtureId: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Participant1: string;
  Participant1Id: number;
  Participant1IsHome: boolean;
  Participant2: string;
  Participant2Id: number;
  StartTime: number;
  Ts: number;
}

/** Normalized fixture used within ProofPlay */
export interface TxLINEFixture {
  id: number;
  competitionId: number;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  status: string;
}

export interface TxLINEScoreSnapshot {
  fixture_id: number;
  seq: number;
  status: string;
  home_score: number;
  away_score: number;
  period?: string;
}

export interface TxLINEStatValidationRequest {
  fixtureId: number;
  seq: number;
  statKey: number;
  statKey2?: number;
  operator?: string;
}

export interface TxLINEStatValidationResponse {
  fixture_id: number;
  seq: number;
  stat_key: number;
  stat_value: number;
  stat_key2?: number;
  stat_value2?: number;
  operator?: string;
  result: boolean;
  merkle_root: string;
  proof: string[];
  timestamp: string;
}

/** Raw event from TxLINE score snapshot/stream (PascalCase) */
export interface TxLINERawEvent {
  FixtureId: number;
  Seq: number;
  StatusId?: number;
  GameState?: string;
  Clock?: { Running?: boolean; Seconds?: number };
  Score?: {
    Participant1?: { Total?: Record<string, number> };
    Participant2?: { Total?: Record<string, number> };
  };
  Stats?: Record<string, number>;
  Action?: string;
}

export interface TxLINEStreamMessage {
  type: "score" | "odds" | "status";
  data: TxLINEScoreEvent;
}

export interface TxLINEScoreEvent {
  fixture_id: number;
  seq: number;
  status: string;
  home_score: number;
  away_score: number;
  stats: Record<string, number>;
  timestamp: string;
}

export interface TxLINEStreamMessage {
  type: "score" | "odds" | "status";
  data: TxLINEScoreEvent;
}
