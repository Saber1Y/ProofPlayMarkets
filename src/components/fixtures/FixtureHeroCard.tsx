export function FixtureHeroCard() {
  return (
    <div className="glass-strong mx-auto max-w-sm rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Live Match
        </span>
        <span className="txline-badge bg-cyan-500/20 text-cyan-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          TxLINE Stream Active
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-lg font-bold">
            MEX
          </div>
          <span className="text-xs text-zinc-400">Mexico</span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-3xl font-bold tracking-tight">1 - 1</span>
          <span className="text-xs font-mono text-zinc-500">64&rsquo;</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-lg font-bold">
            RSA
          </div>
          <span className="text-xs text-zinc-400">S. Africa</span>
        </div>
      </div>

      <div className="mb-4 flex gap-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-green-accent/30">
          <div className="h-full w-1/3 rounded-full bg-green-accent" />
        </div>
        <div className="h-1.5 flex-1 rounded-full bg-green-accent/30">
          <div className="h-full w-1/2 rounded-full bg-green-accent" />
        </div>
        <div className="h-1.5 flex-1 rounded-full bg-green-accent/30">
          <div className="h-full w-2/3 rounded-full bg-green-accent" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Group A</span>
        <span>8 prediction rooms</span>
      </div>
    </div>
  );
}
