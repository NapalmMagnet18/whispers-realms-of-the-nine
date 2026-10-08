// Briarkin root-homes for Thornhollow (2026-10-08): a giant hollow stump you walk into. Door faces -Z.
// params: r (trunk radius, default 3), h (wall height, default 4.2), seed.
import { quadN, boxR, box, cyl, blob } from './shape.js';

const BARK = 'cdn/texture-deep-furrowed-old-oak-bark.png', MOSS = 'cdn/texture-thick-green-forest-moss.png', WOOD = 'cdn/texture-weathered-wood-planks-grey.png';
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

function build(ctx, col) {
  const p = ctx.params || {}, s = p.seed || 1, R = p.r || 3, H = p.h || 4.2, lod = ctx.lod || 1, far = lod >= 4;
  const N = far ? 10 : 18, T = 0.45, DW = 0.55 /* door half-angle in rad */, DH = 2.3;
  const paint = (tex, c, r = 0.95) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(0); ctx.emissive(null); };
  const rad = (i) => R * (1 + (h(i % N, s) - 0.5) * 0.14);
  const ang = (i) => -Math.PI / 2 + (i / N) * Math.PI * 2; // i=0 at -Z (door)
  const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
  // trunk wall: outer + inner skins, segment ring with the door gap below DH
  paint(BARK, 'oklch(0.62 0.04 60)');
  for (let i = 0; i < N; i++) {
    const a0 = ang(i), a1 = ang(i + 1), r0 = rad(i), r1 = rad(i + 1), am = (a0 + a1) / 2;
    const inDoor = Math.abs(Math.atan2(Math.sin(am + Math.PI / 2), Math.cos(am + Math.PI / 2))) < DW;
    const y0 = inDoor ? DH : 0, flare = 0.5;
    if (col) { const c = P(am, (r0 + r1) / 2, 0); boxR(ctx, [c[0], (y0 + H) / 2, c[2]], [2 * Math.PI * R / N + 0.1, H - y0, T], { yaw: -am * 180 / Math.PI + 90 }); continue; }
    const n = [Math.cos(am), 0, Math.sin(am)];
    // outer skin with a flared foot
    quadN(ctx, P(a0, r0 + (y0 ? 0 : flare), y0), P(a1, r1 + (y0 ? 0 : flare), y0), P(a1, r1, H * 0.35 > y0 ? H * 0.35 : y0 + 0.01), P(a0, r0, H * 0.35 > y0 ? H * 0.35 : y0 + 0.01), n);
    quadN(ctx, P(a0, r0, Math.max(H * 0.35, y0 + 0.01)), P(a1, r1, Math.max(H * 0.35, y0 + 0.01)), P(a1, r1 * 0.93, H), P(a0, r0 * 0.93, H), n);
    // inner skin
    quadN(ctx, P(a0, r0 - T, y0), P(a1, r1 - T, y0), P(a1, r1 * 0.93 - T, H), P(a0, r0 * 0.93 - T, H), [-n[0], 0, -n[2]]);
    // rim (the sawn top, broken unevenly)
    quadN(ctx, P(a0, r0 * 0.93, H), P(a1, r1 * 0.93, H), P(a1, r1 * 0.93 - T, H), P(a0, r0 * 0.93 - T, H), [0, 1, 0]);
    if (inDoor) quadN(ctx, P(a0, r0, DH), P(a1, r1, DH), P(a1, r1 - T, DH), P(a0, r0 - T, DH), [0, -1, 0]);
  }
  if (col) { box(ctx, -R, -0.1, -R, R, 0.08, R); box(ctx, -R, H + 0.4, -R, R, H + 0.6, R); return; }
  // roots: thick arms splaying out, bark
  const roots = far ? 4 : 8;
  for (let i = 0; i < roots; i++) {
    const a = ang(i + 0.5) * 1 + (i / roots) * 0.0 + (i ? 0 : 0.0), aa = -Math.PI / 2 + ((i + 0.5) / roots) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(aa + Math.PI / 2), Math.cos(aa + Math.PI / 2))) < DW + 0.2) continue;
    const L = 2.2 + h(i + 20, s) * 1.6, c = P(aa, R + L / 2 - 0.2, 0.25);
    boxR(ctx, c, [L, 0.7 - h(i, s) * 0.2, 0.7], { yaw: -aa * 180 / Math.PI, roll: -14 });
  }
  // floor: packed planks inside
  paint(WOOD, 'oklch(0.72 0.04 60)');
  ctx.poly ? 0 : 0;
  for (let k = 0; k < (far ? 1 : 6); k++) { const z0 = -R + 0.4 + k * ((2 * R - 0.8) / (far ? 1 : 6)), z1 = z0 + (2 * R - 0.8) / (far ? 1 : 6) - 0.03; const w = Math.sqrt(Math.max(0.3, R * R - Math.pow((z0 + z1) / 2, 2))) - T; box(ctx, -w, 0, z0, w, 0.07, z1); }
  // roof: a mossy domed cap of thatch-and-sod over the rim, a sapling crown growing out of it
  paint(MOSS, 'oklch(0.7 0.08 135)');
  blob(ctx, 0, H + 0.2, 0, R * 1.08, 1.4, R * 1.08, s, 0.18, far ? 3 : 6, far ? 6 : 12);
  if (!far) {
    paint(BARK, 'oklch(0.55 0.04 60)'); cyl(ctx, 0.4, H + 1.2, 0.3, 0.18, 0.1, 2.2, 6, true);
    paint(MOSS, 'oklch(0.62 0.12 140)'); blob(ctx, 0.4, H + 3.3, 0.3, 1.1, 0.8, 1.1, s + 4, 0.35, 4, 7); blob(ctx, 0.0, H + 2.9, 0.8, 0.7, 0.5, 0.7, s + 5, 0.35, 4, 6);
    // ivy drapes down the trunk
    paint(MOSS, 'oklch(0.55 0.11 140)');
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2 + 0.6, r = rad(i * 3) + 0.05; const c = P(a, r * 0.98, H - 1.1 - h(i, s)); boxR(ctx, c, [0.7, 2 + h(i + 2, s) * 1.4, 0.05], { yaw: -a * 180 / Math.PI + 90 }); }
  }
  // round door: a plank leaf hung open on its hinge, an iron ring, a lantern on a crook
  if (!far) {
    paint(WOOD, 'oklch(0.55 0.08 45)');
    const dx = Math.sin(DW) * R, dz = -Math.cos(DW) * R;
    boxR(ctx, [-dx - 0.45, DH / 2, dz - 0.5], [0.08, DH - 0.1, 1.1], { yaw: -30 });
    ctx.albedo(null); ctx.color('oklch(0.3 0.01 60)'); ctx.metalness(0.7); box(ctx, -dx - 0.85, 1.1, dz - 0.9, -dx - 0.77, 1.25, dz - 0.82); ctx.metalness(0);
    paint(WOOD, 'oklch(0.5 0.05 50)'); box(ctx, dx + 0.15, 0, dz - 0.25, dx + 0.27, 2.6, dz - 0.13); box(ctx, dx - 0.1, 2.5, dz - 0.25, dx + 0.27, 2.6, dz - 0.13);
    ctx.albedo(null); ctx.color('oklch(0.9 0.1 80)'); ctx.emissive(3, 1.9, 0.6); box(ctx, dx - 0.12, 2.1, dz - 0.26, dx + 0.06, 2.4, dz - 0.12); ctx.emissive(null);
    // round windows: warm light through the bark
    for (const a of [-Math.PI / 2 + 1.9, -Math.PI / 2 - 1.9, Math.PI / 2]) { const r = R + 0.02, c = P(a, r * (1 + 0.01), 2.3); ctx.color('oklch(0.88 0.12 75)'); ctx.emissive(2.4, 1.5, 0.5); boxR(ctx, c, [0.7, 0.7, 0.06], { yaw: -a * 180 / Math.PI + 90, roll: 45 }); ctx.emissive(null); }
    // inside: a hearth-stone and a hanging herb bundle, a cot
    paint(null, 'oklch(0.5 0.02 60)'); cyl(ctx, 0, 0.07, R * 0.35, 0.6, 0.55, 0.2, 8, true);
    ctx.color('oklch(0.85 0.12 60)'); ctx.emissive(2.6, 1.2, 0.3); cyl(ctx, 0, 0.27, R * 0.35, 0.3, 0.1, 0.25, 6, true); ctx.emissive(null);
    paint(WOOD, 'oklch(0.55 0.05 50)'); box(ctx, -R + T + 0.1, 0.07, -0.6, -R + T + 1.0, 0.5, 1.2);
    paint(null, 'oklch(0.7 0.06 100)'); box(ctx, -R + T + 0.15, 0.5, -0.55, -R + T + 0.95, 0.62, 1.15);
  }
}

export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
