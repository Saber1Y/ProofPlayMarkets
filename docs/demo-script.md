# Demo Script

**Product:** ProofPlay World Cup — Verifiable Prediction Rooms  
**Environment:** Local dev server → `http://localhost:3000`  
**TxLINE Network:** Devnet (pre-loaded credentials in `.env`)

## Walkthrough (3–5 min)

### 1. Browse Fixtures (0:30)

- Open `/fixtures`
- See list of 81 World Cup 2026 fixtures
- Each shows teams, competition, start time

### 2. Fixture Detail (0:30)

- Click any fixture
- See home/away teams, score display (once live)
- "Create Room" button

### 3. Create Room (1:00)

- Click "Create Room" from fixture detail
- Select market type: **Total Goals Over/Under**
- Set threshold: e.g. `2.5`
- Enter your wallet address
- Click "Create Room"
- Redirected to room detail page
- Status: `OPEN`

### 4. Join Room (0:30)

- Select side: **OVER** or **UNDER**
- Enter wallet address
- Set stake amount
- Click "Join"
- Participant appears in list with side badge + stake

### 5. Lock Room (0:15)

- Creator clicks "Lock Room (Kickoff)"
- Status changes to `LOCKED`
- Join form disappears

### 6. Settle Room (1:00)

- Click "Settle Room"
- System fetches TxLINE score snapshot
- Determines winner based on total goals vs threshold
- Validates stat data via TxLINE stat-validation API
- Status changes to `SETTLED`
- Winner + score displayed

### 7. View Receipt (0:30)

- Click "View Settlement Receipt"
- Full proof document shown:
  - Final score
  - TxLINE sequence + timestamp
  - Validation endpoint used
  - Validation result (Verified ✓)
  - Merkle root PDA
  - Payout summary

## What to Highlight

- **Verifiable scores** — every settlement uses TxLINE's stat-validation endpoint to produce a Merkle-verifiable proof
- **Transparent receipts** — all data shown on a single page: score, validation, Merkle root, payouts
- **No backend needed** — everything runs in Next.js API routes
- **MVP in 2 days** — from zero to working prediction room flow

## Manual Test Commands

```bash
# Fetch fixtures
curl http://localhost:3000/api/txline/fixtures | jq '.fixtures | length'

# Create room
curl -X POST http://localhost:3000/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"fixtureId":123,"homeTeam":"Team A","awayTeam":"Team B","marketType":"TOTAL_GOALS_OVER_UNDER","threshold":2.5,"wallet":"0x..."}'

# Lock room
curl -X POST http://localhost:3000/api/rooms/room_1_xxx/lock

# Settle room
curl -X POST http://localhost:3000/api/rooms/room_1_xxx/settle

# Get receipt
curl http://localhost:3000/api/rooms/room_1_xxx/receipt | jq .
```
