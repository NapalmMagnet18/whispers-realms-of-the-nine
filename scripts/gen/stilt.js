// Saltborn stilt fish-houses at Breakwater Strand (2026-10-08). Origin = the shore end of the deck at deck height;
// the house stands over the water toward +Z, its door on the -Z (shore) side, a short gangway runs from the door to the land.
// params: kind "house" | "rack" (fish-drying rack) | "netpole"; seed varies the lean, the roof and the clutter.
import { quadN, boxR, box, cyl } from './shape.js';

function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

function house(ctx) {
  const lod = ctx.lod, s = ctx.params.seed || 1;
  const W = 4.6, D = 4.2, H = 2.6, z0 = 1.6, z1 = z0 + D, t = 0.14, lean = (h(1, s) - 0.5) * 3;
  // piles: driftwood posts down into the water, cross-braced
  ctx.albedo('cdn/texture-sea-bleached-driftwood-planks.png'); ctx.color('oklch(0.92 0.01 80)'); ctx.roughness(0.95);
  for (const x of [-W / 2, 0, W / 2]) for (const z of [0, z0, z0 + D / 2, z1]) cyl(ctx, x, -3.2, z, 0.13, 0.11, 3.2, lod <= 2 ? 7 : 5, false);
  if (lod <= 3) for (const x of [-W / 2, W / 2]) { boxR(ctx, [x, -1.2, z0 + D / 4], [0.08, 0.12, D / 2 * 1.4], { pitch: 35 }); boxR(ctx, [x, -1.2, z0 + D * 3 / 4], [0.08, 0.12, D / 2 * 1.4], { pitch: -35 }); }
  // deck: planks, a porch the shore side, rails
  const planks = lod <= 2 ? 22 : 6;
  for (let i = 0; i < planks; i++) { const za = (i / planks) * z1, zb = ((i + 1) / planks) * z1 - 0.02; boxR(ctx, [0, -0.06 + (h(i, s) - 0.5) * 0.03, (za + zb) / 2], [W + 0.4, 0.1, zb - za], { roll: (h(i + 3, s) - 0.5) * 1.5 }); }
  if (lod <= 3) for (const x of [-W / 2 - 0.15, W / 2 + 0.15]) { box(ctx, x - 0.05, 0, 0, x + 0.05, 0.95, 0.08); box(ctx, x - 0.04, 0.85, 0, x + 0.04, 0.95, z0); }
  // walls: tarred plank, door cut in the shore wall, one window each side, slight lean (salt and years)
  ctx.albedo('cdn/texture-tarred-dark-fishing-shack-planks.png'); ctx.color('oklch(0.93 0.01 60)');
  const g = (x, y, z) => [x + (y / H) * lean * 0.05, y, z];
  const wall = (ax, az, bx, bz, holes, n) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = n[0] * t / 2, nz = n[2] * t / 2;
    const cuts = [0, ...holes.flatMap((o) => [o.x - o.w / 2, o.x + o.w / 2]), L].sort((a, b) => a - b);
    const strip = (u0, u1, y0, y1) => { if (u1 - u0 < 0.01 || y1 - y0 < 0.01) return; for (const sgn of [1, -1]) { const P = (u, y) => { const q = g(ax + ux * u, y, az + uz * u); return [q[0] + nx * sgn, q[1], q[2] + nz * sgn]; }; quadN(ctx, P(u0, y0), P(u1, y0), P(u1, y1), P(u0, y1), [n[0] * sgn, 0, n[2] * sgn]); } };
    let u = 0;
    for (const o of holes) { strip(u, o.x - o.w / 2, 0, H); strip(o.x - o.w / 2, o.x + o.w / 2, 0, o.sill); strip(o.x - o.w / 2, o.x + o.w / 2, o.sill + o.h, H); u = o.x + o.w / 2; }
    strip(u, L, 0, H);
  };
  wall(-W / 2, z0, W / 2, z0, [{ x: W / 2 - 0.6 - 0.1, w: 1.15, sill: 0, h: 2.25 }], [0, 0, -1]);
  wall(W / 2, z1, -W / 2, z1, [{ x: W / 2, w: 0.8, sill: 1.1, h: 0.7 }], [0, 0, 1]);
  wall(-W / 2, z1, -W / 2, z0, [{ x: D / 2, w: 0.7, sill: 1.1, h: 0.6 }], [-1, 0, 0]);
  wall(W / 2, z0, W / 2, z1, [], [1, 0, 0]);
  // gables
  const R = 1.5;
  for (const [z, n] of [[z0, -1], [z1, 1]]) quadN(ctx, g(-W / 2, H, z), g(W / 2, H, z), g(0.001, H + R, z), g(0, H + R, z), [0, 0, n]);
  // roof: two slopes of salt-grey shingle overhanging, a crooked ridge pole
  ctx.albedo('cdn/texture-weathered-grey-cedar-shingles.png'); ctx.color('oklch(0.92 0.01 230)');
  const ov = 0.45, ri = h(4, s) * 0.2;
  for (const sx of [-1, 1]) {
    const e = [sx * (W / 2 + ov), H - 0.3, z0 - ov], f = [sx * (W / 2 + ov), H - 0.3, z1 + ov], r0 = [0, H + R + ri, z0 - ov], r1 = [0, H + R + ri, z1 + ov];
    quadN(ctx, e.map((v, i) => v), f, r1, r0, [sx, 1.5, 0]);
    quadN(ctx, [e[0], e[1] - 0.08, e[2]], [f[0], f[1] - 0.08, f[2]], [0, r1[1] - 0.08, r1[2]], [0, r0[1] - 0.08, r0[2]], [-sx, -1.5, 0]);
  }
  ctx.albedo('cdn/texture-sea-bleached-driftwood-planks.png'); ctx.color('oklch(0.85 0.01 80)');
  boxR(ctx, [0, H + R + ri + 0.05, (z0 + z1) / 2], [0.16, 0.16, D + ov * 2 + 0.3], { roll: 3 });
  // stovepipe with a little cap
  ctx.albedo(null); ctx.color('oklch(0.28 0.01 40)'); ctx.metalness(0.6); ctx.roughness(0.6);
  cyl(ctx, W / 4, H + 0.6, z1 - 1, 0.11, 0.11, 1.6, 7, true);
  ctx.metalness(0); ctx.roughness(0.9);
  // inside: a floor mat, a cot, a barrel, a hanging lamp
  if (lod <= 2) {
    ctx.color('oklch(0.42 0.06 50)'); box(ctx, -1.9, 0, z1 - 1.0, -0.5, 0.45, z1 - 0.2);
    ctx.color('oklch(0.75 0.03 90)'); box(ctx, -1.85, 0.45, z1 - 0.95, -0.55, 0.55, z1 - 0.25);
    ctx.color('oklch(0.45 0.07 55)'); cyl(ctx, 1.6, 0, z0 + 1.6, 0.32, 0.3, 0.85, 9, true);
    ctx.color('oklch(0.85 0.1 75)'); ctx.emissive(2.2, 1.4, 0.5); box(ctx, -0.1, H - 0.7, z0 + D / 2 - 0.1, 0.1, H - 0.45, z0 + D / 2 + 0.1); ctx.emissive(null);
  }
  // outside: hanging nets and a lantern by the door, floats on the rail
  if (lod <= 3) {
    ctx.color('oklch(0.6 0.04 120)', 0.85); boxR(ctx, [W / 2 + 0.09, H * 0.6, z0 + D / 2], [0.02, 1.4, 2.4], { roll: 4 });
    ctx.color('oklch(0.55 0.17 40)'); for (let i = 0; i < 4; i++) cyl(ctx, -W / 2 - 0.15, 0.62 - i * 0.12, 0.3 + i * 0.35, 0.09, 0.09, 0.14, 6, true);
    ctx.color('oklch(0.85 0.1 75)'); ctx.emissive(2.4, 1.5, 0.55); box(ctx, W / 2 - 0.08, 2.0, z0 - 0.35, W / 2 + 0.12, 2.3, z0 - 0.15); ctx.emissive(null);
  }
}

function rack(ctx) {
  const s = ctx.params.seed || 1, lod = ctx.lod;
  ctx.albedo('cdn/texture-sea-bleached-driftwood-planks.png'); ctx.color('oklch(0.9 0.01 80)'); ctx.roughness(0.95);
  for (const x of [-1.3, 1.3]) { boxR(ctx, [x, 0.9, -0.35], [0.1, 1.9, 0.1], { pitch: -10 }); boxR(ctx, [x, 0.9, 0.35], [0.1, 1.9, 0.1], { pitch: 10 }); }
  box(ctx, -1.45, 1.75, -0.05, 1.45, 1.85, 0.05); box(ctx, -1.45, 1.15, -0.05, 1.45, 1.22, 0.05);
  if (lod <= 3) { ctx.albedo(null); for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const x = -1.2 + i * 0.3; ctx.color(h(i, s + r) > 0.5 ? 'oklch(0.62 0.05 70)' : 'oklch(0.7 0.04 60)'); boxR(ctx, [x, (r ? 1.22 : 1.75) - 0.25, 0], [0.09, 0.42, 0.03], { roll: (h(i + 9, s) - 0.5) * 12 }); } }
}

function netpole(ctx) {
  ctx.albedo('cdn/texture-sea-bleached-driftwood-planks.png'); ctx.color('oklch(0.9 0.01 80)');
  cyl(ctx, -1.2, -0.3, 0, 0.08, 0.06, 2.6, 6, true); cyl(ctx, 1.2, -0.3, 0, 0.08, 0.06, 2.6, 6, true);
  ctx.albedo(null); ctx.color('oklch(0.58 0.04 120)', 0.8);
  quadN(ctx, [-1.2, 2.2, 0], [1.2, 2.2, 0], [1.2, 0.5, 0.15], [-1.2, 0.6, 0.15], [0, 0, -1]);
  ctx.color('oklch(0.55 0.17 40)'); for (let i = 0; i < 5; i++) cyl(ctx, -1 + i * 0.5, 2.15, 0, 0.07, 0.07, 0.12, 6, true);
}

export function geometry(ctx) {
  const k = ctx.params.kind || 'house';
  if (k === 'house') house(ctx); else if (k === 'rack') rack(ctx); else if (k === 'netpole') netpole(ctx);
}

export function collider(ctx) {
  const k = ctx.params.kind || 'house';
  if (k === 'house') {
    const W = 4.6, D = 4.2, H = 2.6, z0 = 1.6, z1 = z0 + D;
    box(ctx, -W / 2 - 0.2, -0.12, 0, W / 2 + 0.2, 0, z1); // deck
    box(ctx, -W / 2, 0, z0 - 0.07, W / 2 - 1.3, H, z0 + 0.07); box(ctx, W / 2 - 0.12, 0, z0 - 0.07, W / 2, H, z0 + 0.07); box(ctx, W / 2 - 1.3, 2.25, z0 - 0.07, W / 2 - 0.12, H, z0 + 0.07);
    box(ctx, -W / 2, 0, z1 - 0.07, W / 2, H, z1 + 0.07); box(ctx, -W / 2 - 0.07, 0, z0, -W / 2 + 0.07, H, z1); box(ctx, W / 2 - 0.07, 0, z0, W / 2 + 0.07, H, z1);
    box(ctx, -W / 2, H, z0, W / 2, H + 0.1, z1);
  } else if (k === 'rack') box(ctx, -1.4, 0, -0.4, 1.4, 1.9, 0.4);
  else return null;
}
