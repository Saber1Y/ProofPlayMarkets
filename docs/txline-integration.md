# TxLINE Integration

TxLINE is the real-time sports data oracle used to settle prediction markets. All data is served from a devnet endpoint and includes verifiable proofs (Merkle roots) for on-chain settlement.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `https://txline-dev.txodds.com/api/fixtures` | GET | All fixtures |
| `https://txline-dev.txodds.com/api/scores/snapshot/{fixtureId}` | GET | Latest score + stat snapshot |
| `https://txline-dev.txodds.com/api/scores/stat-validation` | POST | Validate stat data with Merkle proof |
| `https://txline-dev.txodds.com/api/scores/stream` | SSE | Real-time score stream |

## Auth

JWT in `Authorization: Bearer <token>` header. Generate via subscription + activation (see `scripts/subscribe-txline.ts`).

Tokens expire after 30 days. Reactivation with the same tx sig is rejected ("already used").

## Fixtures Response

PascalCase fields:

```json
{
  "FixtureId": 123,
  "Participant1": "Home Team",
  "Participant2": "Away Team",
  "Competition": "World Cup 2026",
  "StartTime": 1718000000000,
  "Status": "NOT_STARTED"
}
```

## Scores Response

Array of stat records (empty `[]` if fixture not yet played):

```json
[{
  "seq": 1,
  "home_score": 2,
  "away_score": 1,
  "timestamp": "2025-06-20T20:00:00Z",
  "period": "FULL_TIME"
}]
```

## Stat Validation

POST to validate a stat against the TxLINE Merkle tree:

```json
{
  "fixtureId": 123,
  "seq": 1,
  "statKey": 1,
  "statKey2": 2,
  "operator": "SUM"
}
```

Returns `{ result: true, merkle_root: "..." }`.

## Client Library

`src/lib/txline/client.ts` — wraps all endpoints with typed methods.
`src/lib/txline/types.ts` — TypeScript interfaces matching API responses.
`src/lib/txline/server-init.ts` — reads env vars and initializes the client server-side.
