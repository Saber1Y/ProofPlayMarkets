type Status =
  | "open"
  | "locked"
  | "live"
  | "awaiting_proof"
  | "settled"
  | "claimable"
  | "cancelled"
  | "upcoming"
  | "final"
  | "active";

const statusConfig: Record<Status, { color: string; label: string }> = {
  open: { color: "bg-green-500", label: "Open" },
  locked: { color: "bg-amber-500", label: "Locked" },
  live: { color: "bg-red-500 animate-pulse", label: "Live" },
  awaiting_proof: { color: "bg-cyan-500 animate-pulse", label: "Awaiting Proof" },
  settled: { color: "bg-green-500", label: "Settled" },
  claimable: { color: "bg-gold", label: "Claimable" },
  cancelled: { color: "bg-red-500", label: "Cancelled" },
  upcoming: { color: "bg-zinc-500", label: "Upcoming" },
  final: { color: "bg-zinc-500", label: "Final" },
  active: { color: "bg-green-500", label: "Active" },
};

export function StatusPill({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? { color: "bg-zinc-500", label: status };
  return (
    <span className="status-pill border border-white/10 text-zinc-300">
      <span className={`${cfg.color} rounded-full`} />
      {cfg.label}
    </span>
  );
}
