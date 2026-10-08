// Lantern Waystones (2026-10-08): a rune-carved standing stone on a stepped plinth with a caged lantern on top,
// one in each hometown. Diablo-waypoint read: a ring of glowing rune-stones on the plinth around it.
// params: tint (rune glow colour, oklch string), seed.
import { quadN, boxR, box, cyl, blob } from './shape.js';

const STONE = 'cdn/texture-weathered-carved-sandstone-blocks.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png', MOSSY = 'cdn/texture-granite-boulder-rough-lichen.png';
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

function build(ctx, col) {
  const p = ctx.params || {}, s = p.seed || 1, lod = ctx.lod || 1, far = lod >= 4;
  const tint = p.tint || 'oklch(0.85 0.13 75)', emit = p.emit || [2.6, 1.7, 0.6];
  const paint = (tex, c, r = 0.9, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  const glow = () => { if (col) return; ctx.albedo(null); ctx.color(tint); ctx.emissive(...emit); };
  // stepped octagonal plinth, three courses
  paint(MOSSY, 'oklch(0.72 0.02 80)');
  cyl(ctx, 0, 0, 0, 2.9, 2.8, 0.3, 8, true);
  paint(STONE, 'oklch(0.8 0.03 75)');
  cyl(ctx, 0, 0.3, 0, 2.3, 2.2, 0.3, 8, true);
  cyl(ctx, 0, 0.6, 0, 1.4, 1.35, 0.3, 8, true);
  if (col) { box(ctx, -0.55, 0.9, -0.45, 0.55, 5.2, 0.45); return; }
  // the monolith: tapered four-sided stone with a slight lean and a chamfered cap
  const lean = (h(1, s) - 0.5) * 0.15, W0 = 0.55, D0 = 0.42, W1 = 0.4, D1 = 0.3, y0 = 0.9, y1 = 4.6;
  const c = (sx, sz, y, w, d) => [sx * w + lean * (y - y0) / (y1 - y0), y, sz * d];
  paint(STONE, 'oklch(0.7 0.03 70)');
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]], nrm = [[0, 0, -1], [1, 0, 0], [0, 0, 1], [-1, 0, 0]];
  for (let i = 0; i < 4; i++) { const a = corners[i], b = corners[(i + 1) % 4]; quadN(ctx, c(a[0], a[1], y0, W0, D0), c(b[0], b[1], y0, W0, D0), c(b[0], b[1], y1, W1, D1), c(a[0], a[1], y1, W1, D1), nrm[i]); }
  // pyramidal cap
  const tip = [lean, y1 + 0.55, 0];
  for (let i = 0; i < 4; i++) { const a = corners[i], b = corners[(i + 1) % 4]; quadN(ctx, c(a[0], a[1], y1, W1 + 0.04, D1 + 0.04), c(b[0], b[1], y1, W1 + 0.04, D1 + 0.04), tip, [tip[0] + 0.001, tip[1], tip[2]], [nrm[i][0], 0.7, nrm[i][2]]); }
  // carved runes down the front and back faces, glowing
  if (!far) {
    glow();
    for (const side of [-1, 1]) for (let k = 0; k < 6; k++) {
      const y = y0 + 0.45 + k * 0.52, t = (y - y0) / (y1 - y0), w = W0 + (W1 - W0) * t, d = D0 + (D1 - D0) * t, x = lean * t;
      const z = side * (d + 0.012), kind = Math.floor(h(k + side * 7, s) * 3);
      if (kind === 0) { boxR(ctx, [x, y, z], [0.05, 0.3, 0.02]); boxR(ctx, [x, y + 0.05, z], [0.22, 0.04, 0.02], { roll: 30 }); }
      else if (kind === 1) { boxR(ctx, [x - 0.07, y, z], [0.04, 0.28, 0.02], { roll: 15 }); boxR(ctx, [x + 0.07, y, z], [0.04, 0.28, 0.02], { roll: -15 }); }
      else { boxR(ctx, [x, y, z], [0.18, 0.18, 0.02], { roll: 45 }); }
      void w;
    }
    // ring of eight small rune-stones on the middle course, each with a glowing face
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8, r = 1.85, x = Math.sin(a) * r, z = Math.cos(a) * r;
      paint(STONE, 'oklch(0.66 0.03 70)'); boxR(ctx, [x, 0.6 + 0.3, z], [0.34, 0.6, 0.22], { yaw: a * 180 / Math.PI, roll: (h(i, s) - 0.5) * 8 });
      glow(); boxR(ctx, [x * 1.065, 0.98, z * 1.065], [0.14, 0.2, 0.02], { yaw: a * 180 / Math.PI });
    }
    // iron lantern cage on top: four bent bars and a hood, the flame inside
    paint(IRON, 'oklch(0.45 0.01 60)', 0.5, 0.8);
    const ty = tip[1] - 0.15;
    box(ctx, lean - 0.06, ty, -0.06, lean + 0.06, ty + 0.25, 0.06);
    for (const [sx, sz] of corners) boxR(ctx, [lean + sx * 0.17, ty + 0.55, sz * 0.17], [0.03, 0.55, 0.03]);
    cyl(ctx, lean, ty + 0.25, 0, 0.26, 0.26, 0.04, 8, true);
    cyl(ctx, lean, ty + 0.82, 0, 0.3, 0.06, 0.25, 8, true);
    box(ctx, lean - 0.02, ty + 1.07, -0.02, lean + 0.02, ty + 1.25, 0.02);
    if (!col) { ctx.albedo(null); ctx.color(tint); ctx.emissive(emit[0] * 1.4, emit[1] * 1.4, emit[2] * 1.4); blob(ctx, lean, ty + 0.52, 0, 0.11, 0.2, 0.11, s, 0.15, 4, 6); ctx.emissive(null); }
    // offerings: melted candles and a few coins on the plinth step
    for (let i = 0; i < 5; i++) { const a = h(i + 40, s) * 6.28, r = 1.0 + h(i + 50, s) * 0.25; paint(null, 'oklch(0.9 0.03 90)', 0.6); cyl(ctx, Math.sin(a) * r, 0.9, Math.cos(a) * r, 0.04, 0.045, 0.1 + h(i, s) * 0.15, 6, true); }
  }
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
