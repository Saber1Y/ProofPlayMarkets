# ProofPlay World Cup

**Verifiable prediction rooms for World Cup matches** — stake on match outcomes, settle automatically with TxLINE data streams, and claim payouts on Solana.

Built for the **TxODDS World Cup Hackathon** on Superteam Earn.

## Problem

Sports betting and prediction markets face a trust problem: how do participants know the outcome is correct, that their stake is safe, and that the settlement is fair? Traditional platforms are opaque black boxes.

**ProofPlay solves this** by combining:
1. **TxLINE** — real-time, verifiable sports data via SSE streams
2. **Solana** — on-chain market accounts, participant PDAs, and programmatic settlement with no intermediaries
3. **Merklized proofs** — every settlement is anchored on-chain with a verifiable receipt

## How It Works

```
User creates a room → Users join (sign tx, stake SOL) → Lock at kickoff
→ Match ends → Anyone can settle → Solana program determines winner
→ Winner claims 2× payout from on-chain vault
```

**One fixture = one room.** Each market has a unique PDA derived from the admin + fixture ID. Duplicate creation returns the existing on-chain market.

### Room Lifecycle

| Status | What's Happening |
|--------|-----------------|
| `OPEN` | Room created, anyone can join before kickoff |
| `LOCKED` | Locked at kickoff — no more entries |
| `AWAITING_PROOF` | Match ended, fetching settlement data |
| `CLAIMABLE` | Settled — winner can claim 2× payout |
| `CANCELLED` | Room cancelled, all entries refundable |

## Features

- **Browse 81 World Cup fixtures** from TxLINE with live status (upcoming / live / finished)
- **Create prediction rooms** — Over/Under Total Goals or Match Winner markets via a 4-step wizard
- **Join rooms** — stake on a side with your Solana wallet (Phantom, Privy, any WalletConnect wallet)
- **Live score banners** — real-time SSE stream from TxLINE during matches
- **Permissionless settlement** — anyone can trigger settlement after a match ends
- **Verifiable settlement receipts** — final score, winner side, participant payouts, on-chain tx links
- **Activity log** — every event (join, lock, settle, claim, cancel) is recorded
- **Wallet disconnect** — switch wallets freely with dropdown disconnect
- **No external backend** — everything runs in Next.js API routes with file-based persistence

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Smart Contracts | Solana Anchor v0.32 (devnet) |
| Oracle | TxLINE Sports Data (SSE streams, score snapshots) |
| Wallet | Privy Auth (Phantom, embedded wallet, WalletConnect) |
| Persistence | File-based via `.rooms.json` |
| Settlement | On-chain via Anchor program (2× payout to winners) |

### On-Chain Architecture

**Program ID:** `D254EggCVsZ7jKtJJ29diEv3P4qqjn5APBAvcRwDNsyE` (devnet)

```
Instructions:
  initializeMarket → Creates market PDA (admin signs)
  joinMarket       → Creates participant PDA, transfers stake (user signs)
  lockMarket       → Locks market at kickoff (admin signs)
  settleMarket     → Sets winner side + merkle root (admin signs)
  claimPayout      → Transfers 2× stake from vault to winner (user signs)
```

**Admin Wallet:** `JE4HHzibqoAmMDsgkmE3mzAKedNB1fwWQUwPmftVnBjj` (devnet) — funds market PDA rent. Users need devnet SOL for participant rent (~0.002 SOL per join).

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

## Getting Devnet SOL

Participants need devnet SOL to join rooms (covers PDA rent + tx fees + stake).

Get free devnet SOL from the [Solana faucet](https://faucet.solana.com/). For the admin wallet, use the same faucet and send to `JE4HHzibqoAmMDsgkmE3mzAKedNB1fwWQUwPmftVnBjj`.

## Subscribe to TxLINE

```bash
npx tsx scripts/subscribe-txline.ts
```

Generates a Solana keypair, sends a 0.01 SOL tx to activate devnet access, and prints your JWT + API token.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── rooms/     → create, join, lock, settle, claim, cancel, receipt
│   │   └── txline/    → fixtures, scores, SSE stream, validation, init
│   ├── fixtures/      → fixture hub + match detail page
│   ├── rooms/         → create wizard, room detail, receipt, dashboard
│   └── docs/          → technical documentation with network info
├── components/
│   ├── fixtures/      → FixtureCard, LiveScoreBanner
│   ├── rooms/         → ThresholdMeter, StepIndicator
│   ├── layout/        → Navbar
│   └── ui/            → GlassCard, StatusPill, TxLineBadge, Skeleton
├── lib/
│   ├── rooms/         → types, store (file-backed), status helpers
│   ├── solana/        → server SDK, IDL, constants
│   └── txline/        → client, types, SSE hook, status, server init
solana/
└── programs/          → Anchor program (prediction-market)
```

## Docs

- [Settlement Architecture](docs/settlement-architecture.md)
- [TxLINE Integration](docs/txline-integration.md)
- [Demo Script](docs/demo-script.md)

## License

MIT
