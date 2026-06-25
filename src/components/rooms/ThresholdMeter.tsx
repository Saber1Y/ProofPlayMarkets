export function ThresholdMeter({
  current,
  threshold,
  label = "Total Goals",
  unit = "goals",
}: {
  current: number;
  threshold: number;
  label?: string;
  unit?: string;
}) {
  const max = Math.max(threshold + 2, current + 2);
  const segments = Array.from({ length: max + 1 }, (_, i) => i);
  const isResolved = current >= threshold;

  return (
    <div className="glass-strong rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="section-header">{label}</span>
        <span className="text-sm text-zinc-400">
          Target: <span className="font-mono font-bold text-white">{threshold}</span> {unit}
        </span>
      </div>

      <div className="relative mb-3 flex items-end gap-1">
        {segments.map((i) => {
          const isAtThreshold = i === threshold;
          const isActive = i <= current;
          const isPast = i < current;

          let barColor = "bg-zinc-800";
          if (isPast && isResolved) barColor = "bg-green-accent";
          else if (isPast) barColor = "bg-cyan-accent";
          else if (isActive && isAtThreshold) barColor = "bg-gold";
          else if (isActive) barColor = "bg-cyan-accent/60";

          const barHeight = i === 0 ? 8 : Math.min(8 + i * 8, 48);

          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${barColor}`}
                style={{ height: `${barHeight}px` }}
              />
              <span
                className={`text-[10px] font-mono ${
                  isActive ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {i}
              </span>
            </div>
          );
        })}

        {isResolved && (
          <div
            className="absolute -top-2 text-xs font-bold text-green-accent"
            style={{
              left: `${((threshold + 0.5) / (max + 1)) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            ✓ Threshold met
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Current: <span className="font-mono text-white">{current}</span>
        </span>
        {isResolved ? (
          <span className="font-medium text-green-accent">Resolved — {current} {unit}</span>
        ) : (
          <span className="text-amber-400">
            {threshold - current} more {unit} needed
          </span>
        )}
      </div>
    </div>
  );
}
