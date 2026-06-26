import type { Room, SettlementReceipt, Side, ActivityLogEntry } from "./types";

// In-memory store (resets on server restart — fine for hackathon MVP)
const rooms = new Map<string, Room>();

let nextId = 1;

function generateId(): string {
  return `room_${nextId++}_${Date.now()}`;
}

let nextLogId = 1;

function generateLogId(): string {
  return `log_${nextLogId++}_${Date.now()}`;
}

function addActivityLog(
  room: Room,
  entry: Omit<ActivityLogEntry, "id" | "timestamp">
): void {
  room.activityLog.push({
    id: generateLogId(),
    ...entry,
    timestamp: new Date().toISOString(),
  });
}

export function createRoom(data: {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  threshold: number;
  wallet: string;
  marketPda?: string;
  initializeTx?: string;
}): Room {
  const room: Room = {
    id: generateId(),
    fixtureId: data.fixtureId,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    marketType: data.marketType as Room["marketType"],
    threshold: data.threshold,
    status: "OPEN",
    participants: [],
    createdBy: data.wallet,
    createdAt: new Date().toISOString(),
    activityLog: [],
    marketPda: data.marketPda,
    initializeTx: data.initializeTx,
  };
  addActivityLog(room, {
    type: "ROOM_CREATED",
    wallet: data.wallet,
    message: `Room created by ${data.wallet.slice(0, 6)}...`,
  });
  rooms.set(room.id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function listRooms(): Room[] {
  return Array.from(rooms.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addParticipant(
  roomId: string,
  participant: { id: string; wallet: string; side: Side; amount: number }
): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "OPEN") return null;
  room.participants.push({ ...participant, claimed: false });
  addActivityLog(room, {
    type: "USER_JOINED",
    wallet: participant.wallet,
    message: `${participant.wallet.slice(0, 6)}... joined ${participant.side}`,
  });
  return room;
}

export function getPendingJoin(
  roomId: string,
  participantId: string,
): { wallet: string; side: Side; amount: number } | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  const p = room.participants.find((p) => p.id === participantId);
  if (!p) return null;
  return { wallet: p.wallet, side: p.side, amount: p.amount };
}

export function confirmPendingJoin(
  roomId: string,
  participantId: string,
  txSig: string,
): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  const p = room.participants.find((p) => p.id === participantId);
  if (!p) return null;
  p.joinTx = txSig;
  return room;
}

export function lockRoom(roomId: string, txSig?: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "OPEN") return null;
  room.status = "LOCKED";
  if (txSig) room.lockTx = txSig;
  addActivityLog(room, {
    type: "ROOM_LOCKED",
    message: "Room locked — predictions are closed",
  });
  return room;
}

export function setAwaitingProof(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "LOCKED") return null;
  room.status = "AWAITING_PROOF";
  addActivityLog(room, {
    type: "PROOF_FETCHING",
    message: "Match ended. Fetching TxLINE validation proof...",
  });
  return room;
}

export function settleRoom(
  roomId: string,
  winnerSide: Side,
  receipt: SettlementReceipt,
  settleTx?: string
): Room | null {
  const room = rooms.get(roomId);
  if (!room || (room.status !== "LOCKED" && room.status !== "AWAITING_PROOF")) return null;
  room.status = "CLAIMABLE";
  room.winnerSide = winnerSide;
  room.settlementReceipt = receipt;
  if (settleTx) room.settleTx = settleTx;
  addActivityLog(room, {
    type: "ROOM_SETTLED",
    message: `Room settled — ${winnerSide} wins`,
  });
  return room;
}

export function markClaimed(roomId: string, wallet: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "CLAIMABLE") return null;
  const participant = room.participants.find(
    (p) => p.wallet.toLowerCase() === wallet.toLowerCase() && p.side === room.winnerSide
  );
  if (!participant || participant.claimed) return null;
  participant.claimed = true;
  addActivityLog(room, {
    type: "WINNER_CLAIMED",
    wallet,
    message: `${wallet.slice(0, 6)}... claimed reward`,
  });
  return room;
}

export function cancelRoom(
  roomId: string,
  reason: string
): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status === "SETTLED" || room.status === "CLAIMABLE" || room.status === "CANCELLED") return null;
  room.status = "CANCELLED";
  room.cancelledAt = new Date().toISOString();
  room.cancelReason = reason;
  addActivityLog(room, {
    type: "ROOM_CANCELLED",
    message: `Room cancelled — ${reason}`,
  });
  return room;
}
