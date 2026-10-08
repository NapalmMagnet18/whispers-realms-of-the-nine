// The Shield Table (Vanguard path VAN-01..07, beside the Reach training yard). params.kind:
// table | pell | register | plate | memorial | trialstone | lectern | banner
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const OAK = T("dark-oak-timber-beam-hand-painted"), IRON = T("rusted-black-iron-hammered"), STONE = T("rough-fieldstone-wall-mossy"), CLOTH = T("woven-wool-cloth-coarse");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const shield = (ctx, x, y, z, s, yaw, col, rim) => { // a kite-ish round shield standing on edge
  P(ctx, OAK, col, 0.8); cyl(ctx, x, y, z, 0.5 * s, 0.5 * s, 0.06, 12); 
  P(ctx, IRON, rim, 0.5, 0.8); cyl(ctx, x, y + 0.06, z, 0.12 * s, 0.1 * s, 0.05, 8);
};
const K = {
  table(ctx, q) { // a great round oak table, nine shields hung about its rim, one place left bare
    P(ctx, STONE, "oklch(0.6 0.02 80)"); cyl(ctx, 0, 0, 0, 2.8, 2.9, 0.15, 18);
    P(ctx, OAK, "oklch(0.5 0.05 55)"); cyl(ctx, 0, 0.82, 0, 2.2, 2.2, 0.12, 20); cyl(ctx, 0, 0.15, 0, 0.5, 0.7, 0.67, 10);
    P(ctx, null, "oklch(0.72 0.11 80)", 0.4, 0.8); cyl(ctx, 0, 0.94, 0, 0.6, 0.6, 0.01, 16, false);
    const cols = ["oklch(0.45 0.12 28)", "oklch(0.42 0.08 250)", "oklch(0.5 0.08 140)", "oklch(0.6 0.1 80)"];
    for (let i = 0; i < 9; i++) { if (i === 4) continue; const a = i / 9 * 6.283; const x = Math.sin(a) * 2.25, z = Math.cos(a) * 2.25;
      P(ctx, OAK, cols[i % 4], 0.8); boxR(ctx, [x, 0.45, z], [0.06, 0.7, 0.62], { yaw: a * 57.3 + 90 });
      P(ctx, IRON, "oklch(0.55 0.02 70)", 0.5, 0.8); boxR(ctx, [x * 1.02, 0.5, z * 1.02], [0.05, 0.18, 0.18], { yaw: a * 57.3 + 90 }); }
    P(ctx, OAK, "oklch(0.45 0.05 55)"); for (let i = 0; i < 9; i++) { const a = (i + 0.5) / 9 * 6.283; box(ctx, Math.sin(a) * 2.7 - 0.25, 0, Math.cos(a) * 2.7 - 0.25, Math.sin(a) * 2.7 + 0.25, 0.48, Math.cos(a) * 2.7 + 0.25); }
  },
  pell(ctx) { // a drill pell: a post with a padded swinging arm that strikes at a trainee's shield
    P(ctx, OAK, "oklch(0.52 0.05 55)"); cyl(ctx, 0, 0, 0, 0.16, 0.13, 2.1, 8); box(ctx, -0.5, 0, -0.5, 0.5, 0.15, 0.5);
    P(ctx, IRON, "oklch(0.4 0.01 60)", 0.5, 0.8); cyl(ctx, 0, 1.4, 0, 0.18, 0.18, 0.12, 8);
    P(ctx, OAK, "oklch(0.58 0.05 60)"); boxR(ctx, [0, 1.46, -0.6], [0.09, 0.09, 1.2], { pitch: -6 });
    P(ctx, CLOTH, "oklch(0.7 0.05 80)", 1); blob(ctx, 0, 1.4, -1.2, 0.18, 0.18, 0.22, 3, 0.15, 4, 6);
  },
  register(ctx) { // a charred battlefield register, wedged in a split boulder
    P(ctx, STONE, "oklch(0.5 0.02 80)"); blob(ctx, -0.35, 0.35, 0, 0.45, 0.4, 0.5, 2, 0.3); blob(ctx, 0.35, 0.3, 0, 0.4, 0.35, 0.5, 5, 0.3);
    P(ctx, null, "oklch(0.32 0.03 40)", 0.9); boxR(ctx, [0, 0.55, 0], [0.08, 0.45, 0.35], { roll: 6 });
    P(ctx, null, "oklch(0.82 0.04 85)", 0.95); boxR(ctx, [0.02, 0.58, 0], [0.06, 0.4, 0.31], { roll: 6 });
  },
  plate(ctx, q) { // a bronze shield-plate with a name cut in, half under rubble
    P(ctx, STONE, "oklch(0.55 0.02 80)"); for (let i = 0; i < 5; i++) blob(ctx, (q() - 0.5) * 1, 0.12, (q() - 0.5) * 0.8, 0.22, 0.14, 0.2, i, 0.3, 3, 5);
    P(ctx, null, "oklch(0.62 0.1 65)", 0.35, 0.9); boxR(ctx, [0, 0.22, 0], [0.42, 0.04, 0.3], { pitch: 25, yaw: q() * 60 });
  },
  memorial(ctx) { // a waist-high rampart stone, nine iron pegs waiting for shield-plates
    P(ctx, STONE, "oklch(0.62 0.02 80)"); box(ctx, -1.4, 0, -0.35, 1.4, 1.3, 0.35); box(ctx, -1.55, 1.3, -0.45, 1.55, 1.45, 0.45);
    P(ctx, IRON, "oklch(0.38 0.01 60)", 0.5, 0.8); for (let i = 0; i < 9; i++) box(ctx, -1.2 + i * 0.3 - 0.03, 0.75, -0.42, -1.2 + i * 0.3 + 0.03, 0.81, -0.35);
  },
  trialstone(ctx, q) { // one of the guardian-trial stones: tall, notched by a thousand strikes
    P(ctx, STONE, "oklch(0.55 0.02 90)"); boxR(ctx, [0, 0.95, 0], [0.55, 1.9, 0.4], { roll: (q() - 0.5) * 6 });
    P(ctx, null, "oklch(0.4 0.02 80)", 1); for (let i = 0; i < 6; i++) box(ctx, -0.29, 0.6 + i * 0.18, -0.08, -0.26, 0.64 + i * 0.18, 0.08);
  },
  lectern(ctx) { // the vow lectern: a slanted oak desk, an open book, an iron candle cup
    P(ctx, OAK, "oklch(0.5 0.05 55)"); cyl(ctx, 0, 0, 0, 0.12, 0.1, 1.0, 8); box(ctx, -0.35, 0, -0.35, 0.35, 0.08, 0.35); boxR(ctx, [0, 1.08, 0], [0.7, 0.06, 0.5], { pitch: -20 });
    P(ctx, null, "oklch(0.88 0.03 85)", 0.95); boxR(ctx, [0, 1.13, 0], [0.6, 0.03, 0.42], { pitch: -20 });
    P(ctx, IRON, "oklch(0.4 0.01 60)", 0.5, 0.8); cyl(ctx, 0.32, 1.12, 0.18, 0.05, 0.04, 0.08, 6);
  },
  banner(ctx) { // a tall pole and a hanging banner: a grey shield on deep red
    P(ctx, OAK, "oklch(0.45 0.05 55)"); cyl(ctx, 0, 0, 0, 0.07, 0.06, 4.2, 6); box(ctx, -0.7, 3.95, -0.04, 0.7, 4.03, 0.04);
    P(ctx, CLOTH, "oklch(0.42 0.13 28)", 1); box(ctx, -0.6, 2.1, -0.02, 0.6, 3.95, 0.02);
    P(ctx, null, "oklch(0.75 0.02 250)", 0.6, 0.5); cyl(ctx, 0, 3.0, -0.03, 0.32, 0.32, 0.01, 10, false);
  },
};
const HH = { table: 0.95, pell: 2.1, register: 0.8, plate: 0.3, memorial: 1.45, trialstone: 1.9, lectern: 1.15, banner: 4.1 };
const WW = { table: 2.4, memorial: 1.4 };
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat();
  if ((ctx.lod || 1) >= 4) { P(ctx, null, "oklch(0.5 0.03 60)"); const w = WW[p.kind] || 0.35; box(ctx, -w, 0, -w, w, HH[p.kind] || 0.5, w); return; }
  (K[p.kind] || K.plate)(ctx, rng((ctx.seed ?? 1) + 17)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind; if (k === "plate" || k === "register") return null; if (k === "pell" || k === "banner") { cyl(ctx, 0, 0, 0, 0.18, 0.18, 2.1, 6); return; } return undefined; }
