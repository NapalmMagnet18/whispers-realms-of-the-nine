// Farm pieces by params.kind: fence (len, posts every 2 m, two rails, a lean), plot (w, d, crop: wheat|cabbage|carrot),
// drywall (len: stacked fieldstones), hay (round bale), scarecrow. origin = ground centre; length runs along X.
import { box, boxR, cyl, blob } from "./shape.js";
const WOOD = "cdn/texture-weathered-grey-fence-wood.png", SOIL = "cdn/texture-tilled-dark-soil-furrows.png", STONE = "cdn/texture-rough-fieldstone-wall-mossy.png";
export function geometry(ctx) {
  const p = ctx.params, k = p.kind, L = ctx.lod ?? 1, R = () => ctx.random();
  ctx.flat();
  if (k === "fence") {
    const len = p.len ?? 8, n = Math.max(1, Math.round(len / 2));
    ctx.albedo(WOOD); ctx.color("oklch(0.92 0.02 70)"); ctx.roughness(0.95);
    for (let i = 0; i <= n; i++) { const x = -len / 2 + (i * len) / n; boxR(ctx, [x, 0.6, 0], [0.16, 1.3, 0.16], { roll: (R() - 0.5) * 6, pitch: (R() - 0.5) * 6 }); if (L <= 2) cyl(ctx, x, 1.25, 0, 0.09, 0.02, 0.1, 4); }
    for (const y of [0.45, 0.95]) boxR(ctx, [0, y, 0.1], [len + 0.2, 0.12, 0.06], { roll: (R() - 0.5) * 1.5 });
    return;
  }
  if (k === "plot") {
    const w = p.w ?? 6, d = p.d ?? 4, crop = p.crop ?? "wheat";
    ctx.albedo("cdn/texture-dark-oak-timber-beam-hand-painted.png"); ctx.color("oklch(0.85 0.03 60)");
    box(ctx, -w / 2, -0.1, -d / 2, w / 2, 0.25, -d / 2 + 0.15); box(ctx, -w / 2, -0.1, d / 2 - 0.15, w / 2, 0.25, d / 2);
    box(ctx, -w / 2, -0.1, -d / 2, -w / 2 + 0.15, 0.25, d / 2); box(ctx, w / 2 - 0.15, -0.1, -d / 2, w / 2, 0.25, d / 2);
    ctx.albedo(SOIL); ctx.color("oklch(0.9 0.03 60)"); box(ctx, -w / 2 + 0.15, -0.1, -d / 2 + 0.15, w / 2 - 0.15, 0.2, d / 2 - 0.15);
    if (L >= 4) return;
    const rows = Math.floor((d - 0.6) / 0.6), step = crop === "wheat" ? 0.45 : 0.6, cols = Math.floor((w - 0.6) / step);
    ctx.albedo(null); ctx.roughness(0.8);
    const blade = (x, z, h, lean, yaw, wd) => { // a crossed pair of tapered blades
      for (const o of [0, 90]) { const a = (yaw + o) * Math.PI / 180, ca = Math.cos(a) * wd, sa = Math.sin(a) * wd, tx = x + Math.cos(a + 1.2) * lean, tz = z + Math.sin(a + 1.2) * lean;
        ctx.quad(x - ca, 0.2, z - sa, x + ca, 0.2, z + sa, tx + ca * 0.3, 0.2 + h, tz + sa * 0.3, tx - ca * 0.3, 0.2 + h, tz - sa * 0.3); }
    };
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = -w / 2 + 0.45 + c * ((w - 0.9) / Math.max(1, cols - 1)) + (R() - 0.5) * 0.1, z = -d / 2 + 0.5 + r * 0.6 + (R() - 0.5) * 0.1;
      if (crop === "wheat") {
        for (let t = 0; t < (L <= 2 ? 4 : 2); t++) { const ox = (R() - 0.5) * 0.3, oz = (R() - 0.5) * 0.3, h = 0.85 + R() * 0.3;
          ctx.color(`oklch(${(0.72 + R() * 0.1).toFixed(3)} 0.11 ${(78 + R() * 12).toFixed(1)})`); blade(x + ox, z + oz, h, 0.08, R() * 180, 0.05);
          if (L <= 2) { ctx.color("oklch(0.82 0.13 80)"); boxR(ctx, [x + ox + 0.05, 0.25 + h, z + oz], [0.07, 0.2, 0.07], { roll: -10 }); } }
      } else if (crop === "cabbage") {
        ctx.color(`oklch(${(0.6 + R() * 0.1).toFixed(3)} 0.13 ${(128 + R() * 15).toFixed(1)})`);
        for (let f = 0; f < 5; f++) boxR(ctx, [x, 0.32, z], [0.42, 0.14, 0.32], { yaw: f * 36 + R() * 20, roll: (R() - 0.5) * 30, pitch: (R() - 0.5) * 30 });
        ctx.color("oklch(0.75 0.12 125)"); boxR(ctx, [x, 0.42, z], [0.22, 0.18, 0.22], { yaw: R() * 90 });
      } else {
        ctx.color(`oklch(${(0.6 + R() * 0.08).toFixed(3)} 0.15 140)`); for (let f = 0; f < 3; f++) blade(x, z, 0.35 + R() * 0.15, 0.1, f * 60 + R() * 30, 0.06);
        ctx.color("oklch(0.68 0.16 50)"); cyl(ctx, x, 0.18, z, 0.06, 0.07, 0.06, 6);
      }
    }
    return;
  }
  if (k === "drywall") {
    const len = p.len ?? 8; ctx.albedo(STONE); ctx.color("oklch(0.92 0.02 90)"); ctx.roughness(0.95);
    const n = Math.round(len / 0.55);
    for (let row = 0; row < 3; row++) for (let i = 0; i < n - row; i++) {
      const x = -len / 2 + 0.3 + i * 0.55 + row * 0.27, y = 0.18 + row * 0.32, s = 0.8 - row * 0.1;
      if (L >= 4) continue;
      blob(ctx, x, y, (R() - 0.5) * 0.1, 0.32 * s + R() * 0.06, 0.2 * s, 0.33 * s, row * 97 + i, 0.3, 3, 5);
    }
    if (L >= 4) boxR(ctx, [0, 0.5, 0], [len, 1, 0.7]);
    return;
  }
  if (k === "hay") {
    ctx.albedo("cdn/texture-golden-straw-hay-bale.png"); ctx.color("oklch(0.95 0.04 85)"); ctx.roughness(1); ctx.smooth();
    const r = 0.75; // on its side: cylinder along X
    const seg = L <= 2 ? 14 : 8;
    for (let i = 0; i < seg; i++) { const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const P = (a, x) => [x, r + Math.sin(a) * r, Math.cos(a) * r];
      ctx.quad(...P(a0, -0.8), ...P(a1, -0.8), ...P(a1, 0.8), ...P(a0, 0.8));
      ctx.tri(-0.8, r, 0, ...P(a1, -0.8), ...P(a0, -0.8)); ctx.tri(0.8, r, 0, ...P(a0, 0.8), ...P(a1, 0.8)); }
    return;
  }
  if (k === "scarecrow") {
    ctx.albedo("cdn/texture-dark-oak-timber-beam-hand-painted.png"); ctx.color("oklch(0.85 0.03 60)");
    box(ctx, -0.07, 0, -0.07, 0.07, 2.2, 0.07); boxR(ctx, [0, 1.65, 0], [1.6, 0.1, 0.1]);
    ctx.albedo("cdn/texture-patched-burlap-sackcloth.png"); ctx.color("oklch(0.85 0.05 70)");
    boxR(ctx, [0, 1.35, 0], [0.6, 0.8, 0.3], { roll: 4 }); blob(ctx, 0, 2.15, 0, 0.22, 0.25, 0.22, 7, 0.15);
    ctx.color("oklch(0.5 0.1 30)"); for (const s of [-1, 1]) boxR(ctx, [s * 0.55, 1.55, 0], [0.5, 0.25, 0.25]);
    ctx.albedo(null); ctx.color("oklch(0.45 0.06 60)"); cyl(ctx, 0, 2.32, 0, 0.45, 0.42, 0.04, 10); cyl(ctx, 0, 2.36, 0, 0.22, 0.16, 0.3, 10);
    ctx.color("oklch(0.75 0.13 85)"); for (let i = 0; i < 6; i++) boxR(ctx, [(R() - 0.5) * 1.5, 1.6, 0.06], [0.03, 0.25, 0.03], { roll: (R() - 0.5) * 60 });
    return;
  }
}
export function collider(ctx) {
  const p = ctx.params, k = p.kind;
  if (k === "fence") return { kind: "box", width: (p.len ?? 8) + 0.2, height: 1.3, depth: 0.3 };
  if (k === "drywall") return { kind: "box", width: p.len ?? 8, height: 1.0, depth: 0.7 };
  if (k === "hay") return { kind: "box", width: 1.6, height: 1.5, depth: 1.5 };
  if (k === "scarecrow") return { kind: "box", width: 0.3, height: 2.3, depth: 0.3 };
  return null;
}
