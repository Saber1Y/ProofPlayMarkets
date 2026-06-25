export interface TxLINEConfig {
  baseUrl: string;
  jwt: string;
  apiToken: string;
}

export interface TxLINEFixture {
  id: number;
  competition_id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
  competition_name?: string;
  sport_id?: number;
}

export interface TxLINEScoreSnapshot {
  fixture_id: number;
  seq: number;
  status: string;
  home_score: number;
  away_score: number;
  stats: Record<string, number>;
  timestamp: string;
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
