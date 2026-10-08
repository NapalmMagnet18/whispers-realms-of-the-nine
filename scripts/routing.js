// The door: which realm (room) a joining player lands in. Realms are rows of scripts/lib/data/realms.yml.
// A realm link (invite, portal, the realm list's cross) wins; else the realm they last played; else "main".
import REALMS from "./lib/data/realms.yml";

const ROOMS = new Set((REALMS.realms || []).map((r) => r.room));

export async function pickRoom(ctx) {
  const asked = ctx.requestedRoomId;
  if (asked && ROOMS.has(asked) && !ctx.rejectedRooms.includes(asked)) return asked;
  const last = ctx.player && ctx.player.lastRoom && ctx.player.lastRoom.roomId;
  if (last && ROOMS.has(last) && !ctx.rejectedRooms.includes(last)) return last;
  if (!ctx.rejectedRooms.includes("main")) return "main";
  const open = (REALMS.realms || []).map((r) => r.room).find((r) => !ctx.rejectedRooms.includes(r));
  return open || "main";
}
