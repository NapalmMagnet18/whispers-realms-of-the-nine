// Fantasy flora for the March meadows: params.kind "blossom" | "wildflowers" | "lupine" | "rosebush" | "willow".
// Seeded shapes, feet at y = 0. Cheap to stream: geometry only, no textures. ctx.lod >= 3 thins petals and leaves.
import { blob, cyl } from "./shape.js";

const BLOSSOM = ["oklch(0.86 0.09 355)", "oklch(0.9 0.06 345)", "oklch(0.8 0.12 350)", "oklch(0.94 0.03 20)"];
const WILD = ["oklch(0.72 0.15 300)", "oklch(0.86 0.16 95)", "oklch(0.95 0.02 100)", "oklch(0.62 0.2 28)", "oklch(0.7 0.13 250)", "oklch(0.8 0.14 60)"];
const LUPINE = ["oklch(0.62 0.17 295)", "oklch(0.78 0.11 340)", "oklch(0.68 0.14 265)", "oklch(0.92 0.04 90)"];

function stem(ctx, x, z, h, lean, a) {
  const tx = x + Math.cos(a) * lean, tz = z + Math.sin(a) * lean;
  const w = 0.012;
  ctx.quad(x - w, 0, z, x + w, 0, z, tx + w, h, tz, tx - w, h, tz);
  ctx.quad(tx - w, h, tz, tx + w, h, tz, x + w, 0, z, x - w, 0, z);
  return [tx, h, tz];
}
function flowerHead(ctx, p, r, petals, a0) {
  for (let i = 0; i < petals; i++) {
    const a = a0 + i * (Math.PI * 2 / petals), b = a + Math.PI / petals;
    const A = [p[0], p[1], p[2]];
    const B = [p[0] + Math.cos(a - 0.35) * r * 0.7, p[1] + r * 0.25, p[2] + Math.sin(a - 0.35) * r * 0.7];
    const C = [p[0] + Math.cos(a) * r, p[1] + r * 0.35, p[2] + Math.sin(a) * r];
    const D = [p[0] + Math.cos(a + 0.35) * r * 0.7, p[1] + r * 0.25, p[2] + Math.sin(a + 0.35) * r * 0.7];
    ctx.quad(...A, ...B, ...C, ...D); ctx.quad(...D, ...C, ...B, ...A);
    void b;
  }
}
function grassTuft(ctx, x, z, h, n, seed) {
  for (let i = 0; i < n; i++) {
    const a = seed + i * 2.4, w = 0.03, lx = Math.cos(a) * h * 0.35, lz = Math.sin(a) * h * 0.35;
    const px = -Math.sin(a) * w, pz = Math.cos(a) * w;
    ctx.tri(x - px, 0, z - pz, x + px, 0, z + pz, x + lx, h * (0.7 + (i % 3) * 0.15), z + lz);
    ctx.tri(x + lx, h * (0.7 + (i % 3) * 0.15), z + lz, x + px, 0, z + pz, x - px, 0, z - pz);
  }
}

function blossom(ctx, r, far) {
  const h = 3.2 + r() * 1.6, lean = (r() - 0.5) * 0.6, la = r() * 6.28;
  ctx.color("oklch(0.36 0.04 40)"); ctx.roughness(0.9);
  const segs = 4; let px = 0, pz = 0, py = 0;
  for (let i = 0; i < segs; i++) {
    const t = (i + 1) / segs, nx = Math.cos(la) * lean * t * t, nz = Math.sin(la) * lean * t * t, ny = h * 0.62 * t;
    cyl(ctx, px, py, pz, 0.24 - i * 0.04, 0.2 - i * 0.04, ny - py + 0.05, far ? 5 : 7, false);
    px = nx; pz = nz; py = ny;
  }
  const crown = [px, py, pz];
  const limbs = far ? 3 : 5;
  for (let i = 0; i < limbs; i++) {
    const a = i * 2.39 + r(), L = 1.1 + r() * 0.8;
    const ex = crown[0] + Math.cos(a) * L, ez = crown[2] + Math.sin(a) * L, ey = crown[1] + 0.6 + r() * 0.7;
    ctx.color("oklch(0.34 0.04 40)");
    const w = 0.07; ctx.quad(crown[0] - w, crown[1], crown[2], crown[0] + w, crown[1], crown[2], ex + w * 0.4, ey, ez, ex - w * 0.4, ey, ez);
    ctx.quad(ex - w * 0.4, ey, ez, ex + w * 0.4, ey, ez, crown[0] + w, crown[1], crown[2], crown[0] - w, crown[1], crown[2]);
    ctx.color(BLOSSOM[Math.floor(r() * BLOSSOM.length)]); ctx.roughness(0.7);
    blob(ctx, ex, ey + 0.3, ez, 1.0 + r() * 0.4, 0.75 + r() * 0.3, 1.0 + r() * 0.4, i * 7 + 1, 0.3, far ? 4 : 6, far ? 6 : 9);
  }
  // a fluffy crown: many small clusters around the top, lighter on top, deeper pink beneath
  const tufts = far ? 5 : 14;
  for (let i = 0; i < tufts; i++) {
    const a = i * 2.39 + r(), d = 0.4 + r() * 1.5, up = 0.9 + r() * 1.3;
    ctx.color(up > 1.7 ? BLOSSOM[3] : BLOSSOM[Math.floor(r() * 3)]);
    const s = 0.55 + r() * 0.4;
    blob(ctx, crown[0] + Math.cos(a) * d, crown[1] + up, crown[2] + Math.sin(a) * d, s, s * 0.8, s, i * 11 + 5, 0.35, far ? 3 : 5, far ? 5 : 7);
  }
  if (!far) {
    // fallen petals ringing the trunk
    ctx.color("oklch(0.88 0.07 355)"); ctx.emissive(null);
    for (let i = 0; i < 26; i++) {
      const a = r() * 6.28, d = 0.6 + r() * 2.4, x = Math.cos(a) * d, z = Math.sin(a) * d, s = 0.06 + r() * 0.05, y = 0.02;
      ctx.quad(x - s, y, z, x, y, z - s, x + s, y, z, x, y, z + s);
    }
  }
}

function wildflowers(ctx, r, far) {
  const n = far ? 10 : 26, R = 1.6;
  ctx.roughness(0.85);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * R, x = Math.cos(a) * d, z = Math.sin(a) * d;
    ctx.color("oklch(0.55 0.12 135)");
    if (i % 2 === 0) grassTuft(ctx, x, z, 0.35 + r() * 0.2, far ? 2 : 4, r() * 6);
    ctx.color("oklch(0.5 0.1 140)");
    const top = stem(ctx, x, z, 0.3 + r() * 0.35, 0.05, r() * 6.28);
    const col = WILD[Math.floor(r() * WILD.length)];
    ctx.color(col); ctx.emissive(null);
    flowerHead(ctx, top, 0.07 + r() * 0.05, far ? 4 : 5, r() * 6.28);
    if (!far) { ctx.color("oklch(0.85 0.17 90)"); blob(ctx, top[0], top[1] + 0.02, top[2], 0.018, 0.015, 0.018, i, 0.1, 3, 4); }
  }
}

function lupine(ctx, r, far) {
  const spikes = far ? 3 : 6;
  ctx.roughness(0.8);
  for (let k = 0; k < spikes; k++) {
    const a = k * 2.39 + r(), d = 0.15 + r() * 0.45, x = Math.cos(a) * d, z = Math.sin(a) * d, h = 0.7 + r() * 0.5;
    ctx.color("oklch(0.5 0.11 140)");
    grassTuft(ctx, x, z, 0.3, far ? 2 : 4, a);
    const top = stem(ctx, x, z, h, 0.06, a);
    const col = LUPINE[Math.floor(r() * LUPINE.length)];
    const buds = far ? 4 : 9;
    for (let b = 0; b < buds; b++) {
      const t = b / buds, y = h * 0.45 + (h * 0.55) * t, rr = 0.07 * (1 - t * 0.7);
      const bx = x + (top[0] - x) * (y / h), bz = z + (top[2] - z) * (y / h);
      ctx.color(col); ctx.emissive(b === buds - 1 ? null : null);
      blob(ctx, bx, y, bz, rr, rr * 0.9, rr, k * 13 + b, 0.2, 3, 5);
    }
  }
}

function rosebush(ctx, r, far) {
  ctx.color("oklch(0.4 0.09 145)"); ctx.roughness(0.85);
  const lobes = far ? 2 : 4;
  for (let i = 0; i < lobes; i++) {
    const a = i * 1.7 + r();
    blob(ctx, Math.cos(a) * 0.35, 0.45 + r() * 0.2, Math.sin(a) * 0.35, 0.55, 0.45, 0.55, i + 3, 0.35, far ? 4 : 5, far ? 6 : 8);
  }
  const roses = far ? 5 : 14, col = r() < 0.5 ? "oklch(0.55 0.2 20)" : (r() < 0.5 ? "oklch(0.88 0.06 350)" : "oklch(0.9 0.12 90)");
  ctx.color(col); ctx.roughness(0.6);
  for (let i = 0; i < roses; i++) {
    const a = r() * 6.28, el = r() * 1.2, R = 0.75;
    const x = Math.cos(a) * Math.cos(el) * R, z = Math.sin(a) * Math.cos(el) * R, y = 0.45 + Math.sin(el) * 0.55;
    blob(ctx, x, y, z, 0.07, 0.06, 0.07, i * 5, 0.25, 3, 5);
  }
}

function willow(ctx, r, far) {
  const h = 4.2 + r() * 1.2;
  ctx.color("oklch(0.34 0.03 60)"); ctx.roughness(0.95);
  cyl(ctx, 0, 0, 0, 0.42, 0.28, h, far ? 6 : 9, false);
  const fronds = far ? 10 : 26;
  for (let i = 0; i < fronds; i++) {
    const a = i * 2.39 + r() * 0.3, d = 1.2 + r() * 1.6, ox = Math.cos(a) * d, oz = Math.sin(a) * d, top = h + 0.4 + r() * 0.8;
    const low = 0.9 + r() * 1.2, w = 0.32;
    const px = -Math.sin(a) * w, pz = Math.cos(a) * w;
    ctx.color(i % 3 === 0 ? "oklch(0.66 0.13 125)" : "oklch(0.56 0.12 135)");
    ctx.quad(ox * 0.5 - px, top + 0.3, oz * 0.5 - pz, ox * 0.5 + px, top + 0.3, oz * 0.5 + pz, ox + px * 0.6, low, oz + pz * 0.6, ox - px * 0.6, low, oz - pz * 0.6);
    ctx.quad(ox - px * 0.6, low, oz - pz * 0.6, ox + px * 0.6, low, oz + pz * 0.6, ox * 0.5 + px, top + 0.3, oz * 0.5 + pz, ox * 0.5 - px, top + 0.3, oz * 0.5 - pz);
  }
  ctx.color("oklch(0.58 0.12 130)");
  blob(ctx, 0, h + 0.6, 0, 2.0, 0.9, 2.0, 7, 0.3, far ? 4 : 5, far ? 6 : 9);
}

const KINDS = { blossom, wildflowers, lupine, rosebush, willow };
export function geometry(ctx) {
  const kind = ctx.params?.kind || "wildflowers";
  const far = (ctx.lod ?? 1) >= 3;
  const r = () => ctx.random();
  ctx.metalness(0);
  (KINDS[kind] || wildflowers)(ctx, r, far);
  ctx.emissive(null);
}
export function collider(ctx) {
  const kind = ctx.params?.kind;
  if (kind === "blossom") cyl(ctx, 0, 0, 0, 0.25, 0.25, 2.5, 6);
  else if (kind === "willow") cyl(ctx, 0, 0, 0, 0.4, 0.4, 3, 6);
  else return null;
}
