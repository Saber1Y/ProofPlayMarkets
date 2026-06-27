"use client";

import { usePrivy } from "@privy-io/react-auth";

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return <div className="h-8 w-24 rounded-lg bg-zinc-800 animate-pulse" />;
  }

  const solanaAddr =
    user?.wallet?.address ??
    (
      user?.linkedAccounts?.find(
        (a) =>
          a.type === "wallet" &&
          "chainType" in a &&
          (a as { chainType: string }).chainType === "solana",
      ) as { address: string } | undefined
    )?.address;

  if (authenticated && solanaAddr) {
    const addr = solanaAddr;
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    // console.log("Authenticated user:", user, addr);
    return (
      <button
        onClick={logout}
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-700 transition-colors"
        title={addr}
      >
        {short}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
