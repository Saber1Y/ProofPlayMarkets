# ProofPlay World Cup

Verifiable World Cup prediction rooms powered by TxLINE.

## What It Does

ProofPlay lets fans create World Cup prediction rooms for match winners, totals, and prop outcomes, then settles them using TxLINE's real-time data streams and Solana-verifiable Merkle proofs.

## Why TxLINE

TxLINE provides cryptographically verifiable sports data through Solana anchoring. Every score, stat, and validation proof is backed by on-chain Merkle roots, making settlement fully transparent.

## Supported Markets

- Total Goals Over/Under
- Match Winner (1X2)
- Corners / Cards Props (coming soon)

## TxLINE Endpoints Used

- `/api/fixtures/snapshot` - Match schedule and metadata
- `/api/scores/snapshot/{fixtureId}` - Current score snapshot
- `/api/scores/stream` - Live score updates
- `/api/scores/stat-validation` - Merkle proof validation

## Settlement Architecture

Match data streams through TxLINE → ProofPlay locks rooms at kickoff → when match reaches final state, ProofPlay fetches stat validation proof → settlement engine verifies outcome → winners are shown with a verifiable receipt.

## Verifiable Resolution Receipts

Every settled room generates a receipt showing: fixture ID, final score, stat keys used, TxLINE sequence number, Merkle root PDA, validation endpoint response, and settlement transaction.

## Local Development

```bash
cp .env.example .env
# Fill in TXLINE_JWT and TXLINE_API_TOKEN
npm install
npm run dev
```

## Compliance Note

Prediction rooms use play tokens for demo purposes. No real-money wagering is supported or implied.
