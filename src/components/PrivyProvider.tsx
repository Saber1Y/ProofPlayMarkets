"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { ReactNode } from "react";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function PrivyProvider({ children }: { children: ReactNode }) {
  if (!privyAppId) {
    return <>{children}</>;
  }

  return (
    <Privy
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#10b981",
          walletChainType: "solana-only",
        },
        solana: {},
      }}
    >
      {children}
    </Privy>
  );
}
