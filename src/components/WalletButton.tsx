"use client";

import { usePrivy } from "@privy-io/react-auth";

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="h-8 w-24 rounded-lg bg-zinc-800 animate-pulse" />
    );
  }

  if (authenticated && user?.wallet) {
    const addr = user.wallet.address;
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
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
