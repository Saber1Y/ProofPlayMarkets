import type { Room, SettlementReceipt, Side, ActivityLogEntry } from "./types";
import fs from "fs";
import path from "path";

const STORE_PATH = path.resolve(process.cwd(), ".rooms.json");

function loadStore(): Map<string, Room> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const arr: Room[] = JSON.parse(raw);
      return new Map(arr.map((r) => [r.id, r]));
    }
  } catch {
    // corrupted file — start fresh
  }
  return new Map();
}

function saveStore(rooms: Map<string, Room>): void {
  try {
    const arr = Array.from(rooms.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(arr, null, 2), "utf-8");
  } catch {
    // silently fail — read-only filesystem
  }
}

const rooms = loadStore();

function nextNum(): number {
  let max = 0;
  for (const id of rooms.keys()) {
    const m = id.match(/^room_(\d+)_/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function generateId(): string {
  return `room_${nextNum()}_${Date.now()}`;
}

let logCounter = Date.now();

function generateLogId(): string {
  return `log_${++logCounter}`;
}

function mutate<T>(fn: () => T): T {
  const result = fn();
  saveStore(rooms);
  return result;
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
  overrideStatus?: Room["status"];
}): Room {
  return mutate(() => {
    const room: Room = {
      id: generateId(),
      fixtureId: data.fixtureId,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      marketType: data.marketType as Room["marketType"],
      threshold: data.threshold,
      status: data.overrideStatus ?? "OPEN",
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
  });
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
): { room: Room; duplicate: boolean } | null {
  return mutate(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "OPEN") return null;
    const duplicate = room.participants.some(
      (p) => p.wallet.toLowerCase() === participant.wallet.toLowerCase()
    );
    if (duplicate) return { room, duplicate: true };
    room.participants.push({ ...participant, claimed: false });
    addActivityLog(room, {
      type: "USER_JOINED",
      wallet: participant.wallet,
      message: `${participant.wallet.slice(0, 6)}... joined ${participant.side}`,
    });
    return { room, duplicate: false };
  });
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
  return mutate(() => {
    const room = rooms.get(roomId);
    if (!room) return null;
    const p = room.participants.find((p) => p.id === participantId);
    if (!p) return null;
    p.joinTx = txSig;
    return room;
  });
}

export function lockRoom(roomId: string, txSig?: string): Room | null {
  return mutate(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "OPEN") return null;
    room.status = "LOCKED";
    if (txSig) room.lockTx = txSig;
    addActivityLog(room, {
      type: "ROOM_LOCKED",
      message: "Rooms locked — predictions are closed",
    });
    return room;
  });
}

export function setAwaitingProof(roomId: string): Room | null {
  return mutate(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "LOCKED") return null;
    room.status = "AWAITING_PROOF";
    addActivityLog(room, {
      type: "PROOF_FETCHING",
      message: "Match ended. Fetching TxLINE validation proof...",
    });
    return room;
  });
}

export function settleRoom(
  roomId: string,
  winnerSide: Side,
  receipt: SettlementReceipt,
  settleTx?: string
): Room | null {
  return mutate(() => {
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
  });
}

export function markClaimed(roomId: string, wallet: string): Room | null {
  return mutate(() => {
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
  });
}

export function cancelRoom(
  roomId: string,
  reason: string
): Room | null {
  return mutate(() => {
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
  });
}
