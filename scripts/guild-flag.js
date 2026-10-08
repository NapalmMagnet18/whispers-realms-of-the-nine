// The Hall of Banners flies YOUR guild's banner: each hero's own machine hangs a local banner (audience "local") on the
// hall's ridge pole, in colours drawn from the guild's name, so every guild sees its own flag over the same hall.
// No guild: the Reach's lantern-gold charter banner. Only in main, only near the hall; checked every 2 s.
export const updateSchedule = { every: { seconds: 2 } };
const HALL = { x: 5, z: 24 }, NEAR = 160;
const BAR = { x: 3.3, y: 16.75, z: 24 };  // under the crossbar of guild-flagpole, on the hall's ridge, reaching toward the square
const FIELDS = ["#7a2e22", "#24406e", "#2f5a34", "#4b2a5e", "#1d1a1c", "#8a5a1a", "#1f5c5c", "#6e2440"];
const TRIMS = ["#e3b04a", "#d8d8dc", "#e8d9b5", "#c98a3a"];
const CHARGES = ["chevron", "pale", "fess", "saltire", "bend", "plain"];
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function banner(name) {
  const guild = !!name, h = hash(name || "reach");
  const field = guild ? FIELDS[h % FIELDS.length] : "#6b4a2f", trim = guild ? TRIMS[(h >>> 4) % TRIMS.length] : "#f2b04a";
  const charge = guild ? CHARGES[(h >>> 8) % CHARGES.length] : "plain";
  const mark = guild ? esc(name.trim()[0].toUpperCase()) : "✦", label = guild ? esc(name.length > 16 ? name.slice(0, 15) + "…" : name) : "HALL OF BANNERS";
  const shapes = {
    chevron: `<path d='M10 120 L60 70 L110 120 L110 145 L60 95 L10 145Z' fill='${trim}' opacity='.9'/>`,
    pale: `<rect x='48' y='8' width='24' height='212' fill='${trim}' opacity='.85'/>`,
    fess: `<rect x='10' y='96' width='100' height='26' fill='${trim}' opacity='.85'/>`,
    saltire: `<path d='M10 8 L110 200 M110 8 L10 200' stroke='${trim}' stroke-width='16' opacity='.8'/>`,
    bend: `<path d='M10 20 L110 190' stroke='${trim}' stroke-width='22' opacity='.8'/>`,
    plain: "",
  };
  return `<svg viewBox='0 0 120 240' width='2.1m'>
<path d='M6 4 L114 4 L114 200 L60 236 L6 200Z' fill='${field}' stroke='${trim}' stroke-width='5'/>
${shapes[charge]}
<circle cx='60' cy='66' r='30' fill='${field}' stroke='${trim}' stroke-width='4'/>
<text x='60' y='80' text-anchor='middle' font-family='serif' font-size='40' font-weight='bold' fill='${trim}'>${mark}</text>
<text x='60' y='178' text-anchor='middle' font-family='serif' font-size='${guild ? 13 : 11}' font-weight='bold' fill='${trim}' filter='drop-shadow(0 0 2 #000)'>${label}</text>
</svg>`;
}
export function update(ctx) {
  const self = ctx.self; if (!self.isLocal) return;
  const S = ctx.session, p = self.feetPosition;
  const want = self.place === "main" && p && Math.hypot(p.x - HALL.x, p.z - HALL.z) < NEAR ? (self.state.guildName || "") : null;
  if (want === S.flagFor && (want === null || (S.flagId && ctx.getObject(S.flagId)))) return;
  if (S.flagId) { try { ctx.destroy(S.flagId); } catch (e) {} S.flagId = null; }
  S.flagFor = want;
  if (want === null) return;
  S.flagId = ctx.spawn({
    audience: "local", scope: "session", physics: "none", castShadow: false,
    feetPosition: { x: BAR.x, y: BAR.y - 2.4, z: BAR.z }, rotation: { yaw: 90 },
    vector: banner(want),
  });
}
