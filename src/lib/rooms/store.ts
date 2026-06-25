import type { Room, SettlementReceipt, Side } from "./types";

// In-memory store (resets on server restart — fine for hackathon MVP)
const rooms = new Map<string, Room>();

let nextId = 1;

function generateId(): string {
  return `room_${nextId++}_${Date.now()}`;
}

export function createRoom(data: {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  marketType: string;
  threshold: number;
  wallet: string;
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
  };
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
  return room;
}

export function lockRoom(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "OPEN") return null;
  room.status = "LOCKED";
  return room;
}

export function settleRoom(
  roomId: string,
  winnerSide: Side,
  receipt: SettlementReceipt
): Room | null {
  const room = rooms.get(roomId);
  if (!room || room.status !== "LOCKED") return null;
  room.status = "SETTLED";
  room.winnerSide = winnerSide;
  room.settlementReceipt = receipt;
  return room;
}
