# Settlement Architecture

## Flow

```
Room Created (OPEN) → Locked (LOCKED) → Settled (SETTLED)
                                         ↕
                              TxLINE Score Snapshot
                              TxLINE Stat Validation
                              Receipt Generated
```

1. **Create** — User picks fixture + market type (Over/Under Total Goals or Match Winner) + threshold. Room is `OPEN`.
2. **Join** — Participants choose a side and stake amount. Room stays `OPEN`.
3. **Lock** — Creator locks the room at kickoff (prevents new joins). Status → `LOCKED`.
4. **Settle** — System fetches final score from TxLINE, determines winner, calls TxLINE stat-validation for a Merkle-verifiable proof. Status → `SETTLED`.
5. **Receipt** — A full proof document is generated containing score, validation result, Merkle root PDA, and payout summary.

## Data Sources

- **Score** — `TxLINE /api/scores/snapshot/{fixtureId}` (source of truth for on-chain verification)
- **Validation** — `TxLINE /api/scores/stat-validation` returns `{ result, merkle_root }`

## Receipt Schema

See `src/lib/rooms/types.ts` → `SettlementReceipt`:

- `fixtureId`, `roomId`, `marketType`, `threshold`
- `finalScore` — { home, away }
- `statKeysUsed` — which stat keys were validated
- `txlineSeq` — sequence number of the snapshot used
- `txlineTimestamp` — when the snapshot was recorded
- `merkleRootPda` — Merkle root from the validation endpoint
- `validationEndpoint` — the TxLINE URL used for validation
- `validationResult` — boolean pass/fail
- `winnerSide` — OVER/UNDER/HOME/AWAY/DRAW
- `payoutSummary` — per-wallet payout multipliers

## Storage

In-memory store (`src/lib/rooms/store.ts`) using a `Map<string, Room>`. Resets on server restart — adequate for hackathon MVP. Replace with PostgreSQL or Solana PDA storage for production.

## API Routes

All under `src/app/api/rooms/[id]/`:

| Route | Method | Action |
|---|---|---|
| `/api/rooms` | POST | Create room |
| `/api/rooms` | GET | List rooms |
| `/api/rooms/[id]` | GET | Get room |
| `/api/rooms/[id]/join` | POST | Join room |
| `/api/rooms/[id]/lock` | POST | Lock room |
| `/api/rooms/[id]/settle` | POST | Settle room |
| `/api/rooms/[id]/receipt` | GET | Get receipt |
