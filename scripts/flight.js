// On every player's body: the gryphon roosts (lib/data/flights.yml). Walking near a roost learns it (state.roosts,
// saved with the character); E at a roost opens the flight map (state.flightMap, drawn by lib/ui-flight.js);
// flyTo { id } pays the fare through lib/economy.js, spawns a gryphon (scripts/gryphon-flight.js) and seats you on it.
import F from './lib/data/flights.yml';
import { move, purse } from './lib/economy.js';
import { at } from './gryphon-flight.js';

const MNS = 'mmorpg-tools:';
const on1 = (input, n) => !!((input.pressed && input.pressed[n]) || (input.actions && input.actions[n]));
const on = (input, name) => on1(input, name) || on1(input, MNS + name);
const dataOf = (input, name) => (input.actionData && (input.actionData[name] || input.actionData[MNS + name])) || {};
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
const GRYPHON = '/cdn/model-gryphon-mount-eagle-head-lion-body-wings-spread-gliding-leather-saddle.glb';
const UI_SND = '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3';

export const updateSchedule = { every: { seconds: 0.5 } };

function nearest(p) {
  let best = null, bd = Infinity;
  for (const r of F.roosts) { const d = Math.hypot(p.x - r.x, p.z - r.z); if (d < bd) { bd = d; best = r; } }
  return { roost: best, d: bd };
}
function fare(a, b) { return Math.round(Math.hypot(a.x - b.x, a.z - b.z) / 100 * F.copperPer100m); }

function discover(ctx, r) {
  const st = ctx.self.state, known = st.roosts || [];
  if (known.includes(r.id)) return;
  st.roosts = [...known, r.id];
  st.flightDiscovered = { name: r.name, at: ctx.now() };
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-discovery-chime-new-flight-path.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: { player: ctx.self.id } });
  ctx.emit('damageNumber', { position: { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.4, z: ctx.self.feetPosition.z }, text: 'New flight path: ' + r.name, color: '#f2b04a', size: 1.1, lifetime: 3 }, { audience: { player: ctx.self.id } });
}

function openMap(ctx, from) {
  const st = ctx.self.state, known = st.roosts || [];
  st.flightMap = {
    from: from.id, fromName: from.name, purse: purse(st),
    rows: F.roosts.map((r) => ({ id: r.id, name: r.name, region: r.region, x: r.x, z: r.z, known: known.includes(r.id), here: r.id === from.id, cost: fare(from, r) })),
  };
  try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {}
  ctx.emit('playSound', { clip: UI_SND, position: ctx.self.feetPosition, volume: 0.35 }, { audience: { player: ctx.self.id } });
}

function fly(ctx, toId) {
  const st = ctx.self.state, m = st.flightMap;
  if (!m) return;
  const from = F.roosts.find((r) => r.id === m.from), to = F.roosts.find((r) => r.id === toId);
  if (!from || !to || to.id === from.id || !(st.roosts || []).includes(to.id)) return;
  const cost = fare(from, to);
  if (cost > 0 && move(ctx, -cost, 'flight:' + to.id) === null) { st.flightMap = { ...m, msg: 'Not enough coin for that flight.' }; return; }
  const L = Math.hypot(to.x - from.x, to.z - from.z);
  let hi = Math.max(from.y, to.y);
  const T = ctx.place.terrain, n = Math.max(4, Math.ceil(L / 150));
  for (let i = 0; i <= n; i++) { const h = T.heightAt(from.x + (to.x - from.x) * i / n, from.z + (to.z - from.z) * i / n); if (h != null && h > hi) hi = h; }
  const dur = Math.min(F.maxSeconds, Math.max(F.minSeconds, L / F.speed));
  const route = { ax: from.x, az: from.z, ay: from.y + 6, bx: to.x, bz: to.z, by: to.y, cruise: hi + F.clearance + Math.min(120, L * 0.02), climb: F.climb, side: ctx.random() < 0.5 ? -1 : 1 };
  const first = at(route, 0);
  const id = ctx.spawn({
    tags: ['gryphon', 'flight'], feetPosition: first, model: GRYPHON, physics: 'none',
    layout: { minExtents: { x: -2.2, y: 0, z: -2.4 }, maxExtents: { x: 2.2, y: 2.2, z: 2.4 } },
    behavior: 'scripts/gryphon-flight.js', audience: 'near',
    state: { ...route, t0: ctx.now(), dur, rider: ctx.self.id, destName: to.name },
  });
  st.flightMap = null;
  st.flying = { mount: id, to: to.id, until: ctx.now() + dur * 1000 };
  ctx.self.velocity = { x: 0, y: 0, z: 0 };
  ctx.self.parent = id;
  ctx.self.feetPosition = { x: 0, y: 1.25, z: 0.3 };
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-gryphon-screech-takeoff-wingbeats.mp3', position: first, volume: 0.6 }, { audience: { player: ctx.self.id } });
}

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'flightClose')) { st.flightMap = null; return; }
  if (on(input, 'flyTo')) { fly(ctx, dataOf(input, 'flyTo').id); return; }
  if (st.flying || st.showQuestDialog || st.vendorOpen) return;
  if (on(input, 'interact')) {
    const { roost, d } = nearest(ctx.self.feetPosition);
    if (roost && d < F.useRadius) { discover(ctx, roost); openMap(ctx, roost); }
  }
}

export function update(ctx) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  // a flight whose gryphon never landed us (it slept, or its room lost it): set down at the destination
  if (st.flying && ctx.now() > st.flying.until + 6000) {
    const to = F.roosts.find((r) => r.id === st.flying.to);
    if (ctx.self.parent) ctx.self.parent = null;
    if (to) ctx.self.feetPosition = { x: to.x, y: to.y + 1.5, z: to.z };
    if (st.flying.mount && ctx.getObject(st.flying.mount)) ctx.destroy(st.flying.mount);
    st.flying = null;
    return;
  }
  if (st.flying) return;
  const { roost, d } = nearest(ctx.self.feetPosition);
  if (roost && d < F.discoverRadius) discover(ctx, roost);
  if (st.flightMap && (!roost || d > F.useRadius + 3)) st.flightMap = null;
  const hint = roost && d < F.useRadius && !st.flightMap ? 'Press E to fly from ' + roost.name : null;
  if (hint) { if (!st.interactHint) { st.interactHint = hint; ctx.session.flyHint = hint; } }
  else if (typeof st.interactHint === 'string' && st.interactHint.startsWith('Press E to fly from ')) { st.interactHint = null; ctx.session.flyHint = null; } // a reload forgets the session mark; the text itself says it is ours
}
