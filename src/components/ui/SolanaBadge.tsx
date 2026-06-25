export function SolanaBadge({
  status = "verified",
}: {
  status?: "verified" | "pending" | "confirmed";
}) {
  const variants: Record<string, string> = {
    verified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <span className={`solana-badge ${variants[status]}`}>
      <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="8" />
      </svg>
      Solana {status}
    </span>
  );
}
