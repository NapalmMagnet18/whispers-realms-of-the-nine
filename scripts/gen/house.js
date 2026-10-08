// Lantern's Reach buildings: half-timbered plaster or grey ashlar, gable roof with shingle courses,
// real door and window openings, board floor, tie beams, a chimney. Door in the −Z face at x = doorX.
// params: w d h rise wall("timber"|"stone") roof(texture words) open(bool: front left open, posts)
//         win (windows per long side) chimney(+1|-1|0) doorX
import { box, boxR, quadN, triN } from "./shape.js";

function wallAlongX(ctx, z0, z1, x0, x1, y0, y1, holes) {
  let cur = x0;
  for (const o of [...holes].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    box(ctx, cur, y0, z0, a, y1, z1);
    if (o.sill > 0) box(ctx, a, y0, z0, b, y0 + o.sill, z1);
    box(ctx, a, y0 + o.sill + o.h, z0, b, y1, z1);
    cur = b;
  }
  box(ctx, cur, y0, z0, x1, y1, z1);
}
function wallAlongZ(ctx, x0, x1, z0, z1, y0, y1, holes) {
  let cur = z0;
  for (const o of [...holes].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    box(ctx, x0, y0, cur, x1, y1, a);
    if (o.sill > 0) box(ctx, x0, y0, a, x1, y0 + o.sill, b);
    box(ctx, x0, y0 + o.sill + o.h, a, x1, y1, b);
    cur = b;
  }
  box(ctx, x0, y0, cur, x1, y1, z1);
}

function build(ctx, P, solid) {
  const { w = 8, d = 6, h = 3.2, rise = 2.2, wall = "timber", open = false, win = 2, chimney = 1, doorX = 0, roof = "weathered red clay roof shingles", stories = 1 } = P;
  const t = 0.3, hw = w / 2, hd = d / 2, lod = ctx.lod || 1;
  const paint = (tex, col, rough = 0.9, metal = 0) => { if (solid) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(rough); ctx.metalness(metal); };
  const PLASTER = () => paint(wall === "stone" ? "cdn/texture-grey-ashlar-stone-blocks-weathered.png" : "cdn/texture-warm-limewash-plaster-hand-painted.png", wall === "stone" ? "oklch(0.93 0.01 80)" : "oklch(0.97 0.03 85)");
  const WOOD = () => paint("cdn/texture-dark-oak-timber-beam-hand-painted.png", "oklch(0.92 0.02 60)", 0.85);
  const STONE = () => paint("cdn/texture-rough-fieldstone-wall-mossy.png", "oklch(0.95 0.01 90)");
  const BOARDS = () => paint("cdn/texture-worn-oak-floor-boards.png", "oklch(0.95 0.02 70)", 0.8);
  const ROOF = () => paint("cdn/texture-" + roof.replace(/\s+/g, "-") + ".png", "oklch(0.95 0.02 50)", 0.85);

  const doorW = wall === "stone" ? 1.6 : 1.3, doorH = wall === "stone" ? 2.6 : 2.3;
  const winW = 1.0, winH = 1.15, sill = 1.0;
  const spots = (len, n, avoid) => { const out = []; for (let i = 0; i < n; i++) { const u = -len / 2 + (len * (i + 1)) / (n + 1); if (avoid == null || Math.abs(u - avoid) > 1.6) out.push(u); } return out; };
  const frontWins = spots(w - 1, win + 1, doorX).map((u) => ({ u, sill, w: winW, h: winH }));
  const backWins = spots(w - 1, win, null).map((u) => ({ u, sill, w: winW, h: winH }));
  const sideWins = d > 5 ? [{ u: 0, sill, w: winW, h: winH }] : [];
  const upper = [];
  if (stories > 1) { for (const o of frontWins) upper.push({ ...o, sill: h / 2 + 0.9 }); }

  // footing and floor
  STONE();
  if (open) box(ctx, -hw - 0.1, -0.6, -hd - 0.1, hw + 0.1, 0.12, hd + 0.1);
  else {
    box(ctx, -hw - 0.1, -0.6, hd - t - 0.1, hw + 0.1, 0.45, hd + 0.1);
    box(ctx, -hw - 0.1, -0.6, -hd - 0.1, -hw + t + 0.1, 0.45, hd + 0.1);
    box(ctx, hw - t - 0.1, -0.6, -hd - 0.1, hw + 0.1, 0.45, hd + 0.1);
    box(ctx, -hw - 0.1, -0.6, -hd - 0.1, doorX - doorW / 2, 0.45, -hd + t + 0.1);
    box(ctx, doorX + doorW / 2, -0.6, -hd - 0.1, hw + 0.1, 0.45, -hd + t + 0.1);
    box(ctx, doorX - doorW / 2 - 0.2, -0.6, -hd - 0.6, doorX + doorW / 2 + 0.2, 0.06, -hd + t); // doorstep
    BOARDS();
    box(ctx, -hw + t, -0.6, -hd + t, hw - t, 0.12, hd - t);
  }

  // walls
  PLASTER();
  const fh = (o) => (stories > 1 ? [...o] : o);
  if (!open) {
    const fullFront = [{ u: doorX, sill: 0, w: doorW, h: doorH }, ...frontWins];
    if (stories > 1) {
      wallAlongX(ctx, -hd, -hd + t, -hw, hw, 0.45, h / 2, fullFront.filter((o) => o.sill + o.h < h / 2));
      wallAlongX(ctx, -hd, -hd + t, -hw, hw, h / 2, h, upper.map((o) => ({ ...o, sill: o.sill - h / 2 })));
    } else wallAlongX(ctx, -hd, -hd + t, -hw, hw, 0.45, h, fullFront.map((o) => (o.sill === 0 ? { ...o, h: o.h - 0.45 } : { ...o, sill: o.sill - 0.45 })));
  }
  wallAlongX(ctx, hd - t, hd, -hw, hw, 0.45, h, fh(backWins).map((o) => ({ ...o, sill: o.sill - 0.45 })));
  wallAlongZ(ctx, -hw, -hw + t, -hd + t, hd - t, 0.45, h, sideWins.map((o) => ({ ...o, sill: o.sill - 0.45 })));
  wallAlongZ(ctx, hw - t, hw, -hd + t, hd - t, 0.45, h, sideWins.map((o) => ({ ...o, sill: o.sill - 0.45 })));
  // gables
  for (const sx of [-1, 1]) for (const xx of [sx * hw, sx * (hw - t)])
    triN(ctx, [xx, h, -hd], [xx, h, hd], [xx, h + rise, 0], [sx, 0, 0]);

  // roof: courses of shingles on two slopes
  const th = Math.atan(rise / hd), deg = (th * 180) / Math.PI, ov = 0.7, go = 0.45;
  const slope = Math.hypot(hd + ov, (ov * rise) / hd + rise);
  ROOF();
  for (const side of [-1, 1]) {
    const down = [0, -Math.sin(th), side * Math.cos(th)], out = [0, Math.cos(th), side * Math.sin(th)];
    const n = solid || lod > 2 ? 1 : Math.max(4, Math.round(slope / 0.42));
    const seg = slope / n;
    for (let i = 0; i < n; i++) {
      const sd = seg * (i + 0.5), lift = solid || n === 1 ? 0.1 : 0.12 + i * 0.004;
      const c = [down[0] * sd + out[0] * lift, h + rise + down[1] * sd + out[1] * lift, down[2] * sd + out[2] * lift];
      boxR(ctx, c, [w + go * 2, solid ? 0.2 : 0.07, seg + (n > 1 ? 0.12 : 0)], { pitch: side < 0 ? -(deg + (n > 1 ? 2.5 : 0)) : deg + (n > 1 ? 2.5 : 0) });
    }
  }
  if (!solid) { WOOD(); boxR(ctx, [0, h + rise + 0.18, 0], [w + go * 2 + 0.1, 0.22, 0.32], {}); } // ridge cap

  // chimney
  if (chimney) {
    STONE();
    const cx = chimney * (hw + 0.45);
    box(ctx, cx - 0.5, -0.4, 0.6, cx + 0.5, h + rise * 0.45, 1.6);
    box(ctx, cx - 0.4, h + rise * 0.45, 0.7, cx + 0.4, h + rise + 1.1, 1.5);
    if (!solid) { box(ctx, cx - 0.48, h + rise + 1.1, 0.62, cx + 0.48, h + rise + 1.25, 1.58); }
  }
  if (solid) {
    if (open) { for (const x of [-hw + 0.15, 0, hw - 0.15]) box(ctx, x - 0.15, 0, -hd, x + 0.15, h, -hd + 0.3); }
    return;
  }

  // timber frame (half-timbered houses), door and window frames everywhere
  WOOD();
  const pr = 0.05;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * hw - 0.14 - (sx > 0 ? 0 : pr), 0.45, sz * hd - 0.14 - (sz > 0 ? 0 : pr), sx * hw + 0.14 + (sx > 0 ? pr : 0), h, sz * hd + 0.14 + (sz > 0 ? pr : 0));
  if (open) for (const x of [-hw + 0.15, 0, hw - 0.15]) box(ctx, x - 0.15, 0, -hd, x + 0.15, h, -hd + 0.3);
  if (wall === "timber") {
    for (const sz of [-1, 1]) {
      const z0 = sz < 0 ? -hd - pr : hd - 0.02, z1 = sz < 0 ? -hd + 0.02 : hd + pr;
      box(ctx, -hw, h - 0.22, z0, hw, h, z1);
      box(ctx, -hw, 0.45, z0, hw, 0.62, z1);
      if (stories > 1) box(ctx, -hw, h / 2 - 0.1, z0, hw, h / 2 + 0.12, z1);
      if (lod < 3 && !(open && sz < 0)) {
        const holes = sz < 0 ? [{ u: doorX, w: doorW }, ...frontWins] : backWins;
        for (let u = -hw + 1.4; u < hw - 1; u += 1.5) {
          if (holes.some((o) => Math.abs(o.u - u) < o.w / 2 + 0.2)) continue;
          box(ctx, u - 0.09, 0.62, z0, u + 0.09, h - 0.22, z1);
        }
        // corner braces
        for (const sx of [-1, 1]) {
          const len = Math.hypot(1.1, (stories > 1 ? h / 2 : h) - 0.84), ang = Math.atan2((stories > 1 ? h / 2 : h) - 0.84, 1.1) * 57.3;
          const cx = sx * (hw - 0.75), cy = 0.62 + ((stories > 1 ? h / 2 : h) - 0.84) / 2;
          if (!holes.some((o) => Math.abs(o.u - cx) < o.w / 2 + 0.7)) boxR(ctx, [cx, cy, (z0 + z1) / 2], [len, 0.16, z1 - z0], { roll: sx * ang });
        }
      }
    }
    for (const sx of [-1, 1]) { const x0 = sx < 0 ? -hw - pr : hw - 0.02, x1 = sx < 0 ? -hw + 0.02 : hw + pr; box(ctx, x0, h - 0.22, -hd, x1, h, hd); box(ctx, x0, 0.45, -hd, x1, 0.62, hd); }
  }
  // tie beams inside
  for (let z = -hd + 1.2; z < hd - 0.6; z += 2) box(ctx, -hw + t, h - 0.3, z - 0.12, hw - t, h - 0.05, z + 0.12);
  box(ctx, -0.12, h - 0.05, -hd + t, 0.12, h + rise - 0.2, -hd + t + 0.24);
  // door frame
  if (!open) {
    box(ctx, doorX - doorW / 2 - 0.16, 0.06, -hd - 0.08, doorX - doorW / 2, doorH + 0.2, -hd + t + 0.02);
    box(ctx, doorX + doorW / 2, 0.06, -hd - 0.08, doorX + doorW / 2 + 0.16, doorH + 0.2, -hd + t + 0.02);
    box(ctx, doorX - doorW / 2 - 0.25, doorH + 0.05, -hd - 0.1, doorX + doorW / 2 + 0.25, doorH + 0.3, -hd + t + 0.02);
    // the door itself, swung open against the inner wall
    box(ctx, doorX + doorW / 2 + 0.02, 0.12, -hd + t, doorX + doorW / 2 + 0.1, doorH, -hd + t + doorW - 0.05);
  }
  // window frames, shutters, glass
  const winSet = (holes, zf, zIn, dir) => {
    for (const o of holes) {
      WOOD();
      box(ctx, o.u - o.w / 2 - 0.1, o.sill - 0.12, Math.min(zf, zf + dir * 0.18), o.u + o.w / 2 + 0.1, o.sill, Math.max(zf, zf + dir * 0.18));
      box(ctx, o.u - o.w / 2 - 0.12, o.sill + o.h, Math.min(zf, zf + dir * 0.08), o.u + o.w / 2 + 0.12, o.sill + o.h + 0.14, Math.max(zf, zf + dir * 0.08));
      box(ctx, o.u - 0.04, o.sill, Math.min(zIn, zIn + 0.06), o.u + 0.04, o.sill + o.h, Math.max(zIn, zIn + 0.06));
      box(ctx, o.u - o.w / 2, o.sill + o.h / 2 - 0.04, Math.min(zIn, zIn + 0.06), o.u + o.w / 2, o.sill + o.h / 2 + 0.04, Math.max(zIn, zIn + 0.06));
      paint("cdn/texture-green-painted-wooden-shutter-planks.png", "oklch(0.9 0.04 150)", 0.8);
      for (const sx of [-1, 1]) box(ctx, o.u + sx * (o.w / 2 + 0.06) + (sx > 0 ? 0 : -0.5), o.sill, Math.min(zf, zf + dir * 0.06), o.u + sx * (o.w / 2 + 0.06) + (sx > 0 ? 0.5 : 0), o.sill + o.h, Math.max(zf, zf + dir * 0.06));
      ctx.albedo(null); ctx.color("oklch(0.85 0.09 75)", 0.55); ctx.emissive(1.4, 0.75, 0.3); ctx.roughness(0.1);
      quadN(ctx, [o.u - o.w / 2, o.sill, zIn + 0.03], [o.u + o.w / 2, o.sill, zIn + 0.03], [o.u + o.w / 2, o.sill + o.h, zIn + 0.03], [o.u - o.w / 2, o.sill, zIn + 0.03].map((v, i) => (i === 1 ? o.sill + o.h : v)), [0, 0, dir]);
      ctx.emissive(null);
    }
  };
  if (!open) winSet(stories > 1 ? [...frontWins, ...upper] : frontWins, -hd, -hd + t / 2, -1);
  winSet(backWins, hd, hd - t / 2, 1);
}

export function geometry(ctx) { ctx.flat(); build(ctx, ctx.params || {}, false); }
export function collider(ctx) { build(ctx, ctx.params || {}, true); }
