# ProofPlay World Cup

**Verifiable Prediction Rooms** — settle sports bets using TxLINE data streams with Solana Merkle proofs.

Built for the Superteam GenLayer hackathon. MVP in ~48 hours.

## Features

- **Browse World Cup fixtures** — 81 fixtures from TxLINE devnet
- **Create prediction rooms** — Over/Under Total Goals, Match Winner markets
- **Join rooms** — stake on a side, see all participants
- **Lock + Settle** — lock at kickoff, settle with TxLINE score snapshots
- **Verifiable receipts** — Merkle root, stat validation proof, payout summary
- **No backend server** — everything runs in Next.js API routes

## Architecture

```
Next.js 15 (App Router)
├── TxLINE Client          →  live sports data + verifiable proofs
├── Room Store (in-memory) →  rooms, participants, receipts
├── API Routes             →  create/join/lock/settle/receipt
└── UI Pages               →  fixtures, rooms, receipts
```

## Quick Start

```bash
# Install
npm install

# Set up env
cp .env.example .env
# Fill in TXLINE_JWT and TXLINE_API_TOKEN (see docs/)

# Run
npm run dev
# → http://localhost:3000
```

## Subscribe to TxLINE

```bash
npx tsx scripts/subscribe-txline.ts
```

This generates a Solana keypair, sends a 0.01 SOL tx to activate devnet access, and prints your JWT + API token.

## Docs

- `docs/txline-integration.md` — TxLINE API details
- `docs/settlement-architecture.md` — how settlement works
- `docs/demo-script.md` — 5-minute walkthrough

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- TxLINE Sports Data Oracle
- Solana (Anchor, web3.js)
- GenLayer (verification layer)
