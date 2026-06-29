"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    const short = `${solanaAddr.slice(0, 4)}...${solanaAddr.slice(-4)}`;

    // console.log("WalletButton: authenticated, solanaAddr:", solanaAddr);

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-700 transition-colors"
          title={solanaAddr}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {short}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl z-50">
            <div className="px-3 py-1.5 text-[10px] text-zinc-600 font-mono border-b border-zinc-800">
              {solanaAddr}
            </div>
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L2 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 2l4 6-4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Disconnect
            </button>
          </div>
        )}
      </div>
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
