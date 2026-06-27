export type MatchStatus = "upcoming" | "live" | "finished";

const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;

export function getMatchStatus(
  startDate: string | number | Date,
  scoreStatus?: string,
): MatchStatus {
  if (scoreStatus === "finished") return "finished";
  if (scoreStatus === "in_progress") return "live";

  const start = new Date(startDate).getTime();
  const elapsed = Date.now() - start;

  if (elapsed < 0) return "upcoming";

  if (elapsed < LIVE_WINDOW_MS) return "live";

  return "finished";
}

export function isMatchUpcoming(
  startDate: string | number | Date,
  scoreStatus?: string,
): boolean {
  return getMatchStatus(startDate, scoreStatus) === "upcoming";
}

export function canCreateRoom(
  startDate: string | number | Date,
  scoreStatus?: string,
): boolean {
  return getMatchStatus(startDate, scoreStatus) === "upcoming";
}

export function canJoinRoom(
  startDate: string | number | Date,
  scoreStatus?: string,
): boolean {
  return getMatchStatus(startDate, scoreStatus) === "upcoming";
}
