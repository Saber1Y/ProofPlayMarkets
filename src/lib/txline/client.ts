import type {
  TxLINEConfig,
  TxLINEFixtureRaw,
  TxLINEFixture,
  TxLINEScoreSnapshot,
  TxLINERawEvent,
  TxLINEStatValidationRequest,
  TxLINEStatValidationResponse,
  TxLINEStreamMessage,
} from "./types";

let config: TxLINEConfig | null = null;

export function initTxLINE(cfg: TxLINEConfig) {
  config = cfg;
}

function getConfig(): TxLINEConfig {
  if (!config) {
    throw new Error("TxLINE not initialized. Call initTxLINE() first.");
  }
  return config;
}

function headers(): HeadersInit {
  const { jwt, apiToken } = getConfig();
  return {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    "Content-Type": "application/json",
  };
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const { baseUrl } = getConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${baseUrl}${url}`, {
      ...init,
      headers: { ...headers(), ...init?.headers },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TxLINE ${res.status}: ${text}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeFixture(raw: TxLINEFixtureRaw): TxLINEFixture {
  return {
    id: raw.FixtureId,
    competitionId: raw.CompetitionId,
    competition: raw.Competition,
    homeTeam: raw.Participant1,
    awayTeam: raw.Participant2,
    startDate: new Date(raw.StartTime).toISOString(),
    status: raw.StartTime > Date.now() ? "scheduled" : "finished",
  };
}

export async function getFixtures(competitionId?: number): Promise<TxLINEFixture[]> {
  const params = new URLSearchParams();
  if (competitionId) params.set("competitionId", String(competitionId));
  const qs = params.toString();
  const raw = await fetchJSON<TxLINEFixtureRaw[]>(`/api/fixtures/snapshot${qs ? `?${qs}` : ""}`);
  return raw.map(normalizeFixture);
}

export async function getFixtureById(fixtureId: number): Promise<TxLINEFixture | null> {
  const fixtures = await getFixtures();
  return fixtures.find((f) => f.id === fixtureId) ?? null;
}

export function parseLatestScore(raw: TxLINERawEvent[]): TxLINEScoreSnapshot | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const sorted = [...raw].sort((a, b) => b.Seq - a.Seq);

  const finishedEvent = sorted.find((e) => e.StatusId === 5);
  const status = finishedEvent
    ? "finished"
    : snapshotStatus(sorted[0].StatusId, sorted[0].GameState);
  const statusSeq = finishedEvent?.Seq ?? sorted[0].Seq;

  const scoreEvent = sorted.find((event) => {
    const score = event.Score;
    const g1 = score?.Participant1?.Total?.Goals;
    const g2 = score?.Participant2?.Total?.Goals;
    return g1 !== undefined || g2 !== undefined;
  });

  if (scoreEvent) {
    const score = scoreEvent.Score!;
    const clock = scoreEvent.Clock;
    const seconds = clock?.Seconds ?? 0;
    return {
      fixture_id: scoreEvent.FixtureId,
      seq: statusSeq,
      status,
      home_score: score.Participant1?.Total?.Goals ?? 0,
      away_score: score.Participant2?.Total?.Goals ?? 0,
      period: `${Math.floor(seconds / 60)}'`,
    };
  }

  return {
    fixture_id: sorted[0].FixtureId,
    seq: statusSeq,
    status,
    home_score: 0,
    away_score: 0,
    period: "0'",
  };
}

export function snapshotStatus(
  statusId?: number,
  gameState?: string
): string {
  if (statusId === 5) return "finished";
  if (statusId === 4) return "in_progress";
  if (statusId === 3) return "in_progress";
  if (statusId === 2) return "in_progress";
  if (statusId === 1) return "scheduled";
  if (gameState === "finished" || gameState === "closed") return "finished";
  if (gameState === "started" || gameState === "in_progress") return "in_progress";
  return "scheduled";
}

export async function getScoreSnapshot(fixtureId: number): Promise<TxLINEScoreSnapshot | null> {
  const raw = await fetchJSON<TxLINERawEvent[]>(`/api/scores/snapshot/${fixtureId}`);
  return parseLatestScore(raw);
}

export async function getScoreUpdates(fixtureId: number): Promise<TxLINEScoreSnapshot[]> {
  return fetchJSON<TxLINEScoreSnapshot[]>(`/api/scores/stream?fixture_id=${fixtureId}`);
}

export async function getStatValidation(
  req: TxLINEStatValidationRequest
): Promise<TxLINEStatValidationResponse> {
  return fetchJSON<TxLINEStatValidationResponse>("/api/scores/stat-validation", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function streamScores(onEvent: (msg: TxLINEStreamMessage) => void): EventSource {
  const { baseUrl, jwt, apiToken } = getConfig();
  const url = `${baseUrl}/api/scores/stream?Authorization=Bearer%20${jwt}&X-Api-Token=${apiToken}`;
  const es = new EventSource(url);
  es.onmessage = (event) => {
    try {
      const msg: TxLINEStreamMessage = JSON.parse(event.data);
      onEvent(msg);
    } catch {
      // skip malformed messages
    }
  };
  es.onerror = () => {
    es.close();
  };
  return es;
}
