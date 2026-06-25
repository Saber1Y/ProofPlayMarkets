import type {
  TxLINEConfig,
  TxLINEFixture,
  TxLINEScoreSnapshot,
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
  const res = await fetch(`${baseUrl}${url}`, { ...init, headers: { ...headers(), ...init?.headers } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TxLINE ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getFixtures(competitionId?: number): Promise<TxLINEFixture[]> {
  const params = competitionId ? `?competition_id=${competitionId}` : "";
  return fetchJSON<TxLINEFixture[]>(`/api/fixtures/snapshot${params}`);
}

export async function getScoreSnapshot(fixtureId: number): Promise<TxLINEScoreSnapshot> {
  return fetchJSON<TxLINEScoreSnapshot>(`/api/scores/snapshot/${fixtureId}`);
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
