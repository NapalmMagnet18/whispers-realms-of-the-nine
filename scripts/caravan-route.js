// Mott's travelling caravan: the wagon carries its goods, lamp, bells and Mott along the Reedhaven road.
// Position is a pure function of the room clock (ctx.now()), so a caravan nobody watched is simply where it should be on wake.
// Route: Reach west edge → fen camp → Reedhaven → fen camp → back. Dwell at each stop, then walk the road at WALK m/s.
import { rotate } from "builtin/vec3";
const ROAD = [[-30, 26], [-50, 50], [-110, 120], [-190, 220], [-280, 340], [-360, 460], [-400, 530]];
const SIDE = 4.5;            // metres right of the road's centre line, so the road stays clear
const WALK = 1.6;            // m/s, a mule's patient pace
const DWELL = 240;           // seconds parked at each stop
const STOPS = [6, 326, 600]; // arc metres along ROAD: Reach edge, fen camp, Reedhaven gate
const SHOPS = ["mott-reach", "mott-fen", "mott-reed"]; // his stock follows the stop he last stood at
const RIDERS = ["march-caravan-goods", "march-caravan-lamp", "march-caravan-bells", "march-npc-mott"];

const SEG = ROAD.slice(0, -1).map(([ax, az], i) => { const [bx, bz] = ROAD[i + 1], l = Math.hypot(bx - ax, bz - az); return { ax, az, dx: (bx - ax) / l, dz: (bz - az) / l, l }; });
SEG.forEach((g, i) => { g.s = i ? SEG[i - 1].s + SEG[i - 1].l : 0; }); // a pure constant of ROAD, the same on every machine
const LEN = SEG[SEG.length - 1].s + SEG[SEG.length - 1].l;
function at(s) {
  s = Math.max(0, Math.min(LEN - 0.01, s));
  const g = SEG.find((q) => s < q.s + q.l) || SEG[SEG.length - 1], t = s - g.s;
  return { x: g.ax + g.dx * t - g.dz * SIDE, z: g.az + g.dz * t + g.dx * SIDE, dx: g.dx, dz: g.dz };
}
const LEGS = [[0, 1], [1, 2], [2, 1], [1, 0]].map(([a, b]) => ({ a, from: STOPS[a], to: STOPS[b], time: Math.abs(STOPS[b] - STOPS[a]) / WALK }));
const CYCLE = LEGS.reduce((n, l) => n + DWELL + l.time, 0);

function where(now) {
  let t = (now / 1000) % CYCLE;
  for (const l of LEGS) {
    if (t < DWELL) { const p = at(l.from), dir = Math.sign(l.to - l.from); return { ...p, dx: p.dx * dir, dz: p.dz * dir, moving: false, left: DWELL - t, stop: l.a }; }
    t -= DWELL;
    if (t < l.time) { const dir = Math.sign(l.to - l.from), p = at(l.from + dir * WALK * t); return { ...p, dx: p.dx * dir, dz: p.dz * dir, moving: true, stop: l.a }; }
    t -= l.time;
  }
  return { ...at(STOPS[0]), moving: false, left: 1, stop: 0 };
}

// Where each rider sits on the wagon, from the camp as laid out by hand in places/main/cells/x-2z2.scene (wagon at
// -241.4, 11, 275.2, yaw -37). Constants in code, never a learned row, so a stray rider can never teach the wagon a wrong seat.
const HOME = { x: -241.4, y: 11, z: 275.2, yaw: -37 };
const LAID = { "march-caravan-goods": [-239.5, 10.6, 277], "march-caravan-lamp": [-242.6, 13.28, 276.8], "march-caravan-bells": [-241.4, 12.5, 275.2], "march-npc-mott": [-239.5, 10.52, 275.5] };
const OFFSETS = Object.fromEntries(Object.entries(LAID).map(([id, [x, y, z]]) => [id, rotate(-HOME.yaw, { x: x - HOME.x, y: y - HOME.y, z: z - HOME.z })]));
export function onSpawn(ctx) { if (ctx.self.state.offsets) delete ctx.self.state.offsets; }
export const updateSchedule = { every: { seconds: 0.1 } };
// A storm parks the caravan where the rain catches it: the route clock freezes (s.parkClock) and resumes after,
// carrying the lost time as s.delay, so the walk picks up exactly where it stopped. Mott sells hot tea meanwhile.
const STEAM = `fx
pop steam rate=6 on=disc(.12) life=1.2..2 v=up(.5..0.9)+sdir()*.08 size=.12..0.2 acc=buoy(.4)+curl(.4)*.4+drag(.9) col=<.85,.84,.82> a=0>.35:.3>.7:.12>0 sz=$size*(.6>2.4) rot=spin(.2) r=sprite(smoke-puff,alpha)
pop glow n=1 at=point().c(.1) r=light(<1,.6,.3>,1.6*flick(1.3,.15),4)`;
export function update(ctx) {
  const s = ctx.self.state, terr = ctx.place.terrain, now = ctx.now();
  const storm = !!(ctx.place.state.storm && ctx.place.state.storm.on);
  if (storm && s.parkClock == null) s.parkClock = now - (s.delay || 0);
  if (!storm && s.parkClock != null) { s.delay = now - s.parkClock; s.parkClock = null; }
  const parked = s.parkClock != null;
  const here = parked ? { ...where(s.parkClock), moving: false, left: 5 } : where(now - (s.delay || 0));
  const yaw = Math.atan2(-here.dx, -here.dz) * 180 / Math.PI;
  const gy = terr.heightAt(here.x, here.z) ?? ctx.self.feetPosition.y;
  ctx.self.feetPosition = { x: here.x, y: gy, z: here.z };
  ctx.self.rotation = { yaw };
  for (const id of RIDERS) {
    const o = ctx.place.objects[id], off = OFFSETS[id]; if (!o || !off) continue;
    const r = rotate(yaw, off), px = here.x + r.x, pz = here.z + r.z, oy = id === "march-npc-mott" ? (terr.heightAt(px, pz) ?? gy) : gy + off.y;
    o.feetPosition = { x: px, y: oy, z: pz };
    if (id === "march-npc-mott") {
      const shop = parked ? "mott-storm" : SHOPS[here.stop ?? 1]; if (o.state.shop !== shop) o.state.shop = shop;
      if (parked !== !!o.state.stormTea) {
        o.state.stormTea = parked;
        const goods = ctx.place.objects["march-caravan-goods"]; if (goods) goods.fx = parked ? { script: STEAM } : null;
        if (parked) ctx.emit("playSound", { clip: "/cdn/moodboard-painterly-fantasy/sfx-iron-kettle-set-on-coals-hiss-and-clink.mp3", position: o.feetPosition, volume: 0.7, maxDistance: 30 }, { audience: { nearby: o.feetPosition, radius: 40 } });
      }
      if (here.moving !== !!o.state.traveling) {
        o.state.traveling = here.moving;
        o.anim.base = { clip: here.moving ? "Walk" : (o.state.idle || "idle"), weight: 1, loop: "loop" };
        o.state.homeYaw = yaw - 90;
      }
      if (here.moving) { o.rotation = { yaw }; o.state.yaw = yaw; }
    } else o.rotation = { yaw };
  }
  if (!here.moving) { ctx.sleep(Math.max(0.5, Math.min(5, here.left))); } // short naps, so a storm finds him within seconds
}
