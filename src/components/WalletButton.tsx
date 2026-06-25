"use client";

import { usePrivy, useConnectWallet } from "@privy-io/react-auth";
import { useCallback } from "react";

export function WalletButton() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { connectWallet } = useConnectWallet();

  const handleConnect = useCallback(() => {
    connectWallet({ walletChainType: "solana-only" });
  }, [connectWallet]);

  if (!ready) {
    return (
      <div className="h-8 w-24 rounded-lg bg-zinc-800 animate-pulse" />
    );
  }

  const solanaAddr =
    user?.wallet?.address ??
    (user?.linkedAccounts?.find(
      (a) =>
        a.type === "wallet" &&
        "chainType" in a &&
        (a as { chainType: string }).chainType === "solana"
    ) as { address: string } | undefined)?.address;

  if (authenticated && solanaAddr) {
    const addr = solanaAddr;
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
      onClick={handleConnect}
      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
