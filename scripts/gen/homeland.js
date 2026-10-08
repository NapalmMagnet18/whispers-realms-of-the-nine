// Homecoming boss landmarks drawn in code (2026-10-08). params.kind:
//   hollow   - Hollowsong's hollow: a vast dead warden-tree, split trunk you can step into, roots clawing the ground, grey rot-blooms
//   vault    - Gharn's bank: a squat stone vault mound in the quarry shelf, its iron door burst outward, snapped chains, magma cracks
//   reedcage - the Unbraided's post: a ring of black reed-woven posts around a dark pool, a cage of bent reeds, name-braids hanging
//   bloom    - one rot-bloom clump (scatter dressing)   ·   chain - a snapped chain run on the ground   ·   post - one black reed post
// Origin at the base centre, -Z is the side that faces the arena.
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';

const TAU = Math.PI * 2;
function hash(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

// a bent tube along points with per-point radius: roots, branches, chains of reed
function tube(ctx, pts, rad, seg = 7) {
  const rings = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const tl = Math.hypot(...t) || 1; t = t.map((v) => v / tl);
    let u = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let n = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]]; const nl = Math.hypot(...n) || 1; n = n.map((v) => v / nl);
    const bb = [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
    const r = rad[i], p = pts[i], ring = [];
    for (let k = 0; k < seg; k++) { const an = (k / seg) * TAU, c = Math.cos(an), s = Math.sin(an); ring.push({ p: [p[0] + (n[0] * c + bb[0] * s) * r, p[1] + (n[1] * c + bb[1] * s) * r, p[2] + (n[2] * c + bb[2] * s) * r], o: [n[0] * c + bb[0] * s, n[1] * c + bb[1] * s, n[2] * c + bb[2] * s] }); }
    rings.push(ring);
  }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) {
    const j = (k + 1) % seg, A = rings[i][k], B = rings[i][j], C = rings[i + 1][j], D = rings[i + 1][k];
    quadN(ctx, A.p, B.p, C.p, D.p, [(A.o[0] + C.o[0]) / 2, (A.o[1] + C.o[1]) / 2, (A.o[2] + C.o[2]) / 2]);
  }
  const e = pts[pts.length - 1], last = rings[rings.length - 1];
  if (rad[rad.length - 1] > 0.01) for (let k = 0; k < seg; k++) triN(ctx, e, last[k].p, last[(k + 1) % seg].p, [e[0] - pts[pts.length - 2][0], e[1] - pts[pts.length - 2][1], e[2] - pts[pts.length - 2][2]]);
}

function bloomClump(ctx, x, y, z, s, seed, lod) {
  ctx.albedo(null); ctx.color('oklch(0.62 0.03 140)'); ctx.roughness(0.6); ctx.emissive(null);
  const n = lod <= 2 ? 5 : 2;
  for (let i = 0; i < n; i++) {
    const a = hash(i, seed) * TAU, r = (0.15 + hash(i + 9, seed) * 0.35) * s, h = (0.25 + hash(i + 3, seed) * 0.5) * s;
    const bx = x + Math.cos(a) * r, bz = z + Math.sin(a) * r;
    cyl(ctx, bx, y, bz, 0.05 * s, 0.035 * s, h, 5, false);
    ctx.color('oklch(0.72 0.05 120)'); ctx.emissive(0.12, 0.2, 0.05);
    blob(ctx, bx, y + h + 0.08 * s, bz, 0.16 * s, 0.1 * s, 0.16 * s, seed + i, 0.35, 4, 6);
    ctx.emissive(null); ctx.color('oklch(0.62 0.03 140)');
  }
}

function hollow(ctx) {
  const lod = ctx.lod, seg = lod <= 2 ? 14 : lod <= 3 ? 10 : 7;
  ctx.albedo('cdn/texture-dead-grey-oak-bark-deep-furrows.png'); ctx.color('oklch(0.93 0.01 80)'); ctx.roughness(0.95);
  // the trunk: a ring of bark staves leaving a split on the -Z side you can walk into (1.4 m wide, 2.6 m tall)
  const R0 = 2.6, H = 7.5, gap = 0.34;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * TAU - Math.PI / 2, a1 = ((i + 1) / seg) * TAU - Math.PI / 2;
    const mid = (a0 + a1) / 2; const inGap = Math.abs(Math.atan2(Math.sin(mid + Math.PI / 2), Math.cos(mid + Math.PI / 2))) < gap * 2.2;
    const y0 = inGap ? 2.7 : 0;
    const r = (y) => R0 * (1 - (y / H) * 0.45) * (1 + 0.12 * Math.sin(i * 2.3 + y));
    const steps = lod <= 2 ? 5 : 3;
    for (let s = 0; s < steps; s++) {
      const ya = y0 + ((H - y0) * s) / steps, yb = y0 + ((H - y0) * (s + 1)) / steps;
      const top = (s === steps - 1) ? (hash(i, 4) * 1.6 - 0.8) : 0; // ragged broken crown
      const P = (a, y, rr) => [Math.cos(a) * rr, y, Math.sin(a) * rr];
      const o = [Math.cos(mid), 0, Math.sin(mid)];
      quadN(ctx, P(a0, ya, r(ya)), P(a1, ya, r(ya)), P(a1, yb + top, r(yb)), P(a0, yb + top, r(yb)), o);
      quadN(ctx, P(a0, ya, r(ya) - 0.35), P(a1, ya, r(ya) - 0.35), P(a1, yb + top, r(yb) - 0.35), P(a0, yb + top, r(yb) - 0.35), [-o[0], 0, -o[2]]);
      if (s === steps - 1) quadN(ctx, P(a0, yb + top, r(yb)), P(a1, yb + top, r(yb)), P(a1, yb + top, r(yb) - 0.35), P(a0, yb + top, r(yb) - 0.35), [0, 1, 0]);
    }
  }
  // roots clawing outward, some arching back into the ground
  const roots = lod <= 2 ? 9 : lod <= 3 ? 6 : 4;
  for (let i = 0; i < roots; i++) {
    const a = (i / roots) * TAU + 0.3, L = 4 + hash(i, 7) * 3.5;
    if (Math.abs(Math.sin(a + Math.PI / 2)) < 0.15 && Math.cos(a + Math.PI / 2) > 0) continue;
    const pts = [], rad = [];
    for (let k = 0; k <= 5; k++) { const t = k / 5, d = R0 * 0.8 + t * L; pts.push([Math.cos(a + t * 0.25) * d, 1.2 * (1 - t) + Math.sin(t * Math.PI) * 0.6 - 0.15, Math.sin(a + t * 0.25) * d]); rad.push(0.55 * (1 - t) + 0.06); }
    tube(ctx, pts, rad, lod <= 2 ? 7 : 5);
  }
  // dead branches reaching up and out, two snapped
  if (lod <= 4) for (let i = 0; i < (lod <= 2 ? 6 : 3); i++) {
    const a = (i / 6) * TAU + 1.1, y = 4.6 + hash(i, 2) * 2.2, L = 3 + hash(i, 5) * 3, pts = [], rad = [];
    for (let k = 0; k <= 4; k++) { const t = k / 4; pts.push([Math.cos(a) * (R0 * 0.7 + t * L), y + t * (1.8 + hash(i, 8) * 1.5) - t * t * 0.8, Math.sin(a) * (R0 * 0.7 + t * L)]); rad.push(0.4 * (1 - t) + 0.05); }
    tube(ctx, pts, rad, 5);
  }
  // the inside floor: rot-black loam and a glowing sick heart where the song used to live
  ctx.albedo(null); ctx.color('oklch(0.22 0.03 90)'); ctx.roughness(1);
  cyl(ctx, 0, 0, 0, R0 - 0.3, R0 - 0.3, 0.06, seg, true);
  if (lod <= 3) { ctx.color('oklch(0.5 0.12 130)'); ctx.emissive(0.25, 0.55, 0.08); blob(ctx, 0, 0.5, 0.6, 0.45, 0.6, 0.45, 3, 0.3, 5, 7); ctx.emissive(null); }
  if (lod <= 3) for (let i = 0; i < 7; i++) { const a = hash(i, 11) * TAU, d = R0 + 0.6 + hash(i, 12) * 4; bloomClump(ctx, Math.cos(a) * d, 0, Math.sin(a) * d, 1 + hash(i, 13), i + 20, lod); }
}

function vault(ctx) {
  const lod = ctx.lod;
  ctx.albedo('cdn/texture-rough-red-sandstone-blocks-sooty.png'); ctx.color('oklch(0.92 0.02 50)'); ctx.roughness(0.9);
  // the mound of fitted stone: stepped courses rising to a domed cap, a deep arched doorway on -Z
  const courses = lod <= 2 ? 7 : 4;
  for (let c = 0; c < courses; c++) {
    const t = c / courses, w = 9 * (1 - t * 0.55), d = 7 * (1 - t * 0.55), h = 4.2 / courses, y = c * h;
    if (y < 3.2) { // leave the door: two side blocks and a back block per course
      box(ctx, -w / 2, y, -d / 2, -1.5, y + h, d / 2); box(ctx, 1.5, y, -d / 2, w / 2, y + h, d / 2); box(ctx, -1.5, y, -d / 2 + 2.4, 1.5, y + h, d / 2);
    } else box(ctx, -w / 2, y, -d / 2, w / 2, y + h, d / 2);
  }
  // the lintel and its iron bands
  boxR(ctx, [0, 3.35, -3.3], [3.6, 0.6, 0.9], { roll: 2 });
  ctx.albedo(null); ctx.color('oklch(0.3 0.01 60)'); ctx.metalness(0.7); ctx.roughness(0.5);
  box(ctx, -1.5, 0, -3.5, -1.3, 3.2, -3.2); box(ctx, 1.3, 0, -3.5, 1.5, 3.2, -3.2);
  // the door, burst outward: a thick riveted iron slab lying tilted on the ground in front, bent
  boxR(ctx, [0.4, 0.45, -5.6], [2.8, 0.22, 3.0], { pitch: 18, yaw: 14, roll: 6 });
  if (lod <= 2) for (let i = 0; i < 12; i++) { const u = (i % 4) / 3 - 0.5, v = Math.floor(i / 4) / 2 - 0.5; boxR(ctx, [0.4 + u * 2.2, 0.6 + v * 0.3, -5.6 + v * 2.3], [0.12, 0.12, 0.12], { pitch: 18, yaw: 14 }); }
  // snapped chains from wall rings toward the door
  if (lod <= 3) for (const sx of [-1, 1]) {
    cyl(ctx, sx * 1.9, 2.2, -3.3, 0.18, 0.18, 0.12, 8, true);
    for (let k = 0; k < (lod <= 2 ? 9 : 5); k++) { const t = k / 8; boxR(ctx, [sx * (1.9 + t * 1.5), 2.2 - Math.sin(t * 2.2) * 2 , -3.4 - t * 2.6], [0.3, 0.1, 0.18], { yaw: 40 * sx, roll: k % 2 ? 90 : 0 }); }
  }
  // magma breathing out of the cracks and the black doorway
  ctx.metalness(0); ctx.color('oklch(0.6 0.2 45)'); ctx.emissive(2.4, 0.7, 0.12); ctx.roughness(0.4);
  box(ctx, -1.25, 0, -1.0, 1.25, 0.05, -0.2);
  if (lod <= 3) for (let i = 0; i < 6; i++) { const x = -4 + hash(i, 3) * 8, y = 0.4 + hash(i, 4) * 2.5; boxR(ctx, [x, y, -3.3 * (1 - y / 6) - 0.02], [0.08, 0.9 + hash(i, 5), 0.05], { roll: hash(i, 6) * 50 - 25 }); }
  ctx.emissive(null); ctx.color('oklch(0.08 0.01 40)'); box(ctx, -1.3, 0.02, -0.9, 1.3, 3.0, -0.85);
  // spilled slag and rubble
  ctx.albedo('cdn/texture-rough-red-sandstone-blocks-sooty.png'); ctx.color('oklch(0.85 0.02 50)');
  if (lod <= 3) for (let i = 0; i < 10; i++) { const a = hash(i, 21) * Math.PI - Math.PI, d = 4.5 + hash(i, 22) * 3; blob(ctx, Math.cos(a) * d, 0.1, Math.sin(a) * d * 0.8, 0.4 + hash(i, 23) * 0.5, 0.3, 0.45, i, 0.3, 4, 6); }
}

function reedPost(ctx, x, z, h, seed, lod) {
  ctx.albedo('cdn/texture-woven-black-reed-wicker.png'); ctx.color('oklch(0.9 0.01 140)'); ctx.roughness(0.9);
  cyl(ctx, x, -0.3, z, 0.22, 0.12, h + 0.3, lod <= 2 ? 8 : 5, true, (i, k) => 1 + 0.1 * Math.sin(i * 3 + seed));
  // the woven head: a lantern cage, teal light inside
  if (lod <= 3) {
    ctx.albedo(null); ctx.color('oklch(0.2 0.02 160)');
    for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU; boxR(ctx, [x + Math.cos(a) * 0.2, h + 0.3, z + Math.sin(a) * 0.2], [0.05, 0.6, 0.05], { yaw: -a * 57.3 }); }
    ctx.color('oklch(0.75 0.12 190)'); ctx.emissive(0.25, 1.2, 1.1); blob(ctx, x, h + 0.3, z, 0.12, 0.16, 0.12, seed, 0.1, 4, 6); ctx.emissive(null);
    // a hanging name-braid
    ctx.color('oklch(0.6 0.06 80)'); boxR(ctx, [x + 0.2, h - 0.4, z], [0.05, 0.9, 0.04], { roll: 6 });
  }
}
function reedcage(ctx) {
  const lod = ctx.lod;
  // black still pool, faintly teal at its heart
  ctx.albedo(null); ctx.color('oklch(0.16 0.03 200)'); ctx.roughness(0.08); ctx.metalness(0.2);
  cyl(ctx, 0, 0.02, 0, 3.6, 3.6, 0.03, lod <= 2 ? 24 : 12, true, (i) => 1 + 0.08 * Math.sin(i * 2.7));
  ctx.metalness(0); ctx.color('oklch(0.32 0.04 110)'); ctx.roughness(1);
  cyl(ctx, 0, -0.1, 0, 4.4, 3.7, 0.16, lod <= 2 ? 24 : 12, false); // muddy lip
  // seven posts in a broken ring (one fallen) around the pool
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.2, d = 5;
    if (i === 3) { ctx.albedo('cdn/texture-woven-black-reed-wicker.png'); ctx.color('oklch(0.9 0.01 140)'); boxR(ctx, [Math.cos(a) * (d + 1.2), 0.2, Math.sin(a) * (d + 1.2)], [0.36, 0.36, 3.2], { yaw: -a * 57.3 + 20 }); continue; }
    reedPost(ctx, Math.cos(a) * d, Math.sin(a) * d, 2.6 + hash(i, 4) * 0.8, i, lod);
  }
  // the cage the Unbraided wove for itself: bent reed hoops leaning over the pool's north side
  if (lod <= 4) {
    ctx.albedo('cdn/texture-woven-black-reed-wicker.png'); ctx.color('oklch(0.85 0.01 140)');
    for (let k = 0; k < (lod <= 2 ? 6 : 3); k++) {
      const x = -1.8 + k * 0.72, pts = [], rad = [];
      for (let s = 0; s <= 8; s++) { const t = s / 8; pts.push([x, Math.sin(t * Math.PI) * 3.4 + hash(k, s) * 0.1, 3.4 - t * 3.4 + hash(k, 2) * 0.3]); rad.push(0.06); }
      tube(ctx, pts, rad, 5);
    }
  }
  if (lod <= 3) for (let i = 0; i < 14; i++) { const a = hash(i, 31) * TAU, d = 4 + hash(i, 32) * 3; ctx.albedo(null); ctx.color('oklch(0.45 0.07 120)'); cyl(ctx, Math.cos(a) * d, 0, Math.sin(a) * d, 0.03, 0.005, 1 + hash(i, 33) * 1.2, 4, false); }
}

export function geometry(ctx) {
  const k = ctx.params.kind;
  if (k === 'hollow') hollow(ctx);
  else if (k === 'vault') vault(ctx);
  else if (k === 'reedcage') reedcage(ctx);
  else if (k === 'bloom') bloomClump(ctx, 0, 0, 0, ctx.params.s || 1, ctx.params.seed || 1, ctx.lod);
  else if (k === 'post') reedPost(ctx, 0, 0, ctx.params.h || 2.8, ctx.params.seed || 1, ctx.lod);
}

// only what a body touches: the trunk's staves (split left open), the vault walls (door open), the posts
export function collider(ctx) {
  const k = ctx.params.kind;
  if (k === 'hollow') {
    const seg = 10, R = 2.5;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * TAU - Math.PI / 2, a1 = ((i + 1) / seg) * TAU - Math.PI / 2, mid = (a0 + a1) / 2;
      if (Math.abs(Math.atan2(Math.sin(mid + Math.PI / 2), Math.cos(mid + Math.PI / 2))) < 0.75) continue;
      const P = (a, y) => [Math.cos(a) * R, y, Math.sin(a) * R];
      quadN(ctx, P(a0, 0), P(a1, 0), P(a1, 6), P(a0, 6), [Math.cos(mid), 0, Math.sin(mid)]);
    }
  } else if (k === 'vault') {
    box(ctx, -4.5, 0, -3.5, -1.5, 4, 3.5); box(ctx, 1.5, 0, -3.5, 4.5, 4, 3.5); box(ctx, -1.5, 0, -1.1, 1.5, 4, 3.5); box(ctx, -1.5, 3.2, -3.5, 1.5, 4.2, -1.1);
  } else if (k === 'reedcage') {
    for (let i = 0; i < 7; i++) { if (i === 3) continue; const a = (i / 7) * TAU + 0.2; box(ctx, Math.cos(a) * 5 - 0.2, 0, Math.sin(a) * 5 - 0.2, Math.cos(a) * 5 + 0.2, 3, Math.sin(a) * 5 + 0.2); }
  } else if (k === 'post') { box(ctx, -0.2, 0, -0.2, 0.2, 3, 0.2); }
  else return null;
}
