// Manually crafted IDL — typed loosely to match anchor 0.32's actual runtime format
export const PREDICTION_MARKET_IDL: any = {
  version: "0.1.0",
  name: "prediction_market",
  instructions: [
    {
      name: "initializeMarket",
      discriminator: [35, 35, 189, 193, 155, 48, 170, 203],
      accounts: [
        { name: "creator", writable: true, signer: true },
        { name: "market", writable: true, signer: false },
        { name: "systemProgram", writable: false, signer: false },
      ],
      args: [
        { name: "params", type: { defined: { name: "InitializeMarketParams" } } },
      ],
    },
    {
      name: "lockMarket",
      discriminator: [107, 8, 184, 91, 223, 13, 180, 38],
      accounts: [
        { name: "creator", writable: true, signer: true },
        { name: "market", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "joinMarket",
      discriminator: [141, 113, 87, 152, 182, 213, 41, 202],
      accounts: [
        { name: "participantWallet", writable: true, signer: true },
        { name: "market", writable: true, signer: false },
        { name: "participant", writable: true, signer: false },
        { name: "systemProgram", writable: false, signer: false },
      ],
      args: [
        { name: "params", type: { defined: { name: "JoinMarketParams" } } },
      ],
    },
    {
      name: "settleMarket",
      discriminator: [193, 153, 95, 216, 166, 6, 144, 217],
      accounts: [
        { name: "creator", writable: true, signer: true },
        { name: "market", writable: true, signer: false },
      ],
      args: [
        { name: "params", type: { defined: { name: "SettleMarketParams" } } },
      ],
    },
    {
      name: "claimPayout",
      discriminator: [127, 240, 132, 62, 227, 198, 146, 133],
      accounts: [
        { name: "claimer", writable: true, signer: true },
        { name: "market", writable: true, signer: false },
        { name: "participant", writable: true, signer: false },
        { name: "systemProgram", writable: false, signer: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Market",
      discriminator: [219, 190, 213, 55, 0, 227, 198, 154],
    },
    {
      name: "Participant",
      discriminator: [32, 142, 108, 79, 247, 179, 54, 6],
    },
  ],
  types: [
    {
      name: "Market",
      type: {
        kind: "struct",
        fields: [
          { name: "creator", type: "pubkey" },
          { name: "fixtureId", type: "u64" },
          {
            name: "marketType",
            type: { defined: { name: "MarketType" } },
          },
          { name: "threshold", type: "u64" },
          {
            name: "status",
            type: { defined: { name: "MarketStatus" } },
          },
          {
            name: "winnerSide",
            type: { option: { defined: { name: "Side" } } },
          },
          { name: "merkleRoot", type: { array: ["u8", 32] } },
          { name: "totalOverStake", type: "u64" },
          { name: "totalUnderStake", type: "u64" },
          { name: "totalHomeStake", type: "u64" },
          { name: "totalAwayStake", type: "u64" },
          { name: "totalDrawStake", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Participant",
      type: {
        kind: "struct",
        fields: [
          { name: "market", type: "pubkey" },
          { name: "wallet", type: "pubkey" },
          { name: "side", type: { defined: { name: "Side" } } },
          { name: "amount", type: "u64" },
          { name: "claimed", type: "bool" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "InitializeMarketParams",
      type: {
        kind: "struct",
        fields: [
          { name: "fixtureId", type: "u64" },
          {
            name: "marketType",
            type: {
              defined: {
                name: "MarketType",
              },
            },
          },
          { name: "threshold", type: "u64" },
        ],
      },
    },
    {
      name: "JoinMarketParams",
      type: {
        kind: "struct",
        fields: [
          { name: "side", type: { defined: { name: "Side" } } },
          { name: "amount", type: "u64" },
        ],
      },
    },
    {
      name: "SettleMarketParams",
      type: {
        kind: "struct",
        fields: [
          { name: "winnerSide", type: { defined: { name: "Side" } } },
          { name: "merkleRoot", type: { array: ["u8", 32] } },
        ],
      },
    },
    {
      name: "MarketType",
      type: {
        kind: "enum",
        variants: [
          { name: "TotalGoalsOverUnder" },
          { name: "MatchWinner" },
        ],
      },
    },
    {
      name: "MarketStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Open" },
          { name: "Locked" },
          { name: "Settled" },
        ],
      },
    },
    {
      name: "Side",
      type: {
        kind: "enum",
        variants: [
          { name: "Over" },
          { name: "Under" },
          { name: "Home" },
          { name: "Away" },
          { name: "Draw" },
        ],
      },
    },
  ],
  address: "D254EggCVsZ7jKtJJ29diEv3P4qqjn5APBAvcRwDNsyE",
  metadata: {
    name: "prediction_market",
    version: "0.1.0",
    spec: "0.1.0",
  },
};
