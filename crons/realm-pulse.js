// Once a minute each realm room writes how many players stand in it; the realm list reads realm_pulse.
// at = SQLite's own clock (unix seconds), the one clock every room shares: a row older than 3 minutes is a realm asleep.
import REALMS from "../scripts/lib/data/realms.yml";
const ROOMS = new Set((REALMS.realms || []).map((r) => r.room));
export async function cron(ctx) {
  const realm = ctx.getRoomId ? ctx.getRoomId() : "main";
  if (!ROOMS.has(realm)) return;
  await ctx.sql`INSERT OR REPLACE INTO realm_pulse (realm, players, at) VALUES (${realm}, ${ctx.world.playerCount ?? 0}, CAST(strftime('%s','now') AS INTEGER))`;
}
