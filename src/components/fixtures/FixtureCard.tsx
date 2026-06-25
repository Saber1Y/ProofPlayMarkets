import Link from "next/link";
import { TxLineBadge } from "@/components/ui/TxLineBadge";
import { teamCode } from "@/lib/teams";

type Fixture = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  competition: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  roomCount?: number;
};

export function FixtureCard({
  fixture,
  variant = "default",
}: {
  fixture: Fixture;
  variant?: "hero" | "default";
}) {
  const homeCode = teamCode(fixture.homeTeam);
  const awayCode = teamCode(fixture.awayTeam);

  const isLive = fixture.minute && fixture.status === "live";
  const isFinal = fixture.status === "finished" || fixture.status === "final";
  const isUpcoming = !isLive && !isFinal;

  const statusBadge = isLive ? (
    <span className="status-pill border border-white/10 text-zinc-300">
      <span className="bg-red-500 animate-pulse rounded-full" />
      {fixture.minute}&rsquo;
    </span>
  ) : isFinal ? (
    <span className="status-pill border border-white/10 text-zinc-500">
      <span className="bg-zinc-500 rounded-full" />
      Final
    </span>
  ) : (
    <span className="text-[10px] font-mono text-zinc-600">
      {new Date(fixture.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );

  const showScore = isLive || isFinal;

  if (variant === "hero") {
    return (
      <Link href={`/fixtures/${fixture.id}`}>
        <div className="glass-card group p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              {fixture.competition}
            </span>
            {isLive && (
              <TxLineBadge status="active" />
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-xl font-bold">
                {homeCode ? (
                  <img
                    src={`https://flagcdn.com/${homeCode.toLowerCase()}.svg`}
                    alt={fixture.homeTeam}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  fixture.homeTeam.charAt(0)
                )}
              </div>
              <span className="text-xs text-zinc-400">{fixture.homeTeam}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              {showScore ? (
                <span className="text-3xl font-bold tracking-tight">
                  {fixture.homeScore} - {fixture.awayScore}
                </span>
              ) : (
                <span className="text-sm text-zinc-500">vs</span>
              )}
              {statusBadge}
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-xl font-bold">
                {awayCode ? (
                  <img
                    src={`https://flagcdn.com/${awayCode.toLowerCase()}.svg`}
                    alt={fixture.awayTeam}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  fixture.awayTeam.charAt(0)
                )}
              </div>
              <span className="text-xs text-zinc-400">{fixture.awayTeam}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              {fixture.roomCount ?? 0} prediction rooms
            </span>
            <span className="text-cyan-accent opacity-0 transition-opacity group-hover:opacity-100">
              Open match →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/fixtures/${fixture.id}`}>
      <div className="glass-card group flex items-center gap-4 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold shrink-0">
            {homeCode ? (
              <img
                src={`https://flagcdn.com/${homeCode.toLowerCase()}.svg`}
                alt={fixture.homeTeam}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              fixture.homeTeam.charAt(0)
            )}
          </div>
          <span className="truncate text-sm text-zinc-200">{fixture.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {showScore ? (
            <span className="font-mono text-sm font-bold">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <span className="text-xs text-zinc-500">vs</span>
          )}
          {statusBadge}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <span className="truncate text-sm text-zinc-200">{fixture.awayTeam}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold shrink-0">
            {awayCode ? (
              <img
                src={`https://flagcdn.com/${awayCode.toLowerCase()}.svg`}
                alt={fixture.awayTeam}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              fixture.awayTeam.charAt(0)
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
