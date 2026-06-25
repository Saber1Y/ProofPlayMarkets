import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 gap-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        ProofPlay <span className="text-emerald-400">World Cup</span>
      </h1>
      <p className="text-zinc-400 max-w-lg text-lg">
        Create verifiable prediction rooms for World Cup matches.
        Settled transparently with TxLINE data and Solana proofs.
      </p>
      <div className="flex gap-4">
        <Link
          href="/fixtures"
          className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          View Fixtures
        </Link>
        <Link
          href="/rooms"
          className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          My Rooms
        </Link>
      </div>
    </div>
  );
}
