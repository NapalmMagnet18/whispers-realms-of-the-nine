// Weaponsmith's yard pieces for Lantern's Reach (2026-10-08). All face -Z.
// kinds: armorstand {tier: iron|gilded|warden, tabard}, weaponrack, shieldwall, smithshed, grindstone
import { quadN, boxR, box, cyl, blob } from './shape.js';

const OAK = 'cdn/texture-dark-oak-timber-beam-hand-painted.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png', STEEL = 'cdn/texture-polished-worn-steel-plate-armor.png';
const SHINGLE = 'cdn/texture-red-clay-roof-shingles.png', STONE = 'cdn/texture-granite-boulder-rough-lichen.png', CLOTH = 'cdn/texture-patched-burlap-sackcloth.png';
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

const TIERS = {
  iron: { plate: 'oklch(0.62 0.01 250)', trim: 'oklch(0.45 0.02 60)', m: 0.75, r: 0.45 },
  gilded: { plate: 'oklch(0.72 0.02 250)', trim: 'oklch(0.78 0.13 85)', m: 0.85, r: 0.3 },
  warden: { plate: 'oklch(0.4 0.02 260)', trim: 'oklch(0.62 0.08 30)', m: 0.7, r: 0.5 },
};

function armorstand(ctx, P, far, p) {
  const t = TIERS[p.tier] || TIERS.iron, tab = p.tabard || 'oklch(0.45 0.14 30)';
  // stand: cross base, post, shoulder bar
  P(OAK, 'oklch(0.6 0.05 55)'); box(ctx, -0.45, 0, -0.08, 0.45, 0.12, 0.08); box(ctx, -0.08, 0, -0.45, 0.08, 0.12, 0.45);
  box(ctx, -0.05, 0.12, -0.05, 0.05, 1.95, 0.05); box(ctx, -0.42, 1.48, -0.04, 0.42, 1.56, 0.04);
  const plate = () => P(STEEL, t.plate, t.r, t.m), trim = () => P(null, t.trim, 0.35, 0.9);
  // cuirass: stacked tapered rings, a ridge down the breast
  plate();
  const ring = [[0.95, 0.2, 0.15], [1.1, 0.22, 0.16], [1.25, 0.26, 0.17], [1.4, 0.3, 0.18], [1.5, 0.27, 0.16]];
  for (let i = 0; i < ring.length - 1; i++) {
    const [y0, w0, d0] = ring[i], [y1, w1, d1] = ring[i + 1], n = far ? 6 : 10;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
      const q = (a, y, w, d) => [Math.sin(a) * w, y, -Math.cos(a) * d * (Math.cos(a) > 0 ? 1.15 : 0.9)];
      quadN(ctx, q(a0, y0, w0, d0), q(a1, y0, w1 * 0 + w0, d0), q(a1, y1, w1, d1), q(a0, y1, w1, d1), [Math.sin(am), 0, -Math.cos(am)]);
    }
  }
  if (!far) { trim(); boxR(ctx, [0, 1.25, -0.205], [0.03, 0.5, 0.03], { pitch: -4 }); box(ctx, -0.23, 0.93, -0.18, 0.23, 0.99, 0.18); }
  // tauces (hip lames) and a tabard hanging below
  plate(); for (let i = 0; i < (far ? 1 : 3); i++) boxR(ctx, [0, 0.9 - i * 0.09, -0.02], [0.44 - i * 0.02, 0.08, 0.36], { pitch: 0 });
  P(CLOTH, tab, 0.95); boxR(ctx, [0, 0.55, -0.19], [0.26, 0.6, 0.015], { pitch: 4 }); boxR(ctx, [0, 0.55, 0.17], [0.26, 0.6, 0.015], { pitch: -4 });
  // pauldrons: layered half domes
  for (const sx of [-1, 1]) {
    plate(); blob(ctx, sx * 0.34, 1.5, 0, 0.17, 0.12, 0.17, 3 + sx, 0.04, far ? 3 : 4, far ? 5 : 8);
    if (!far) { boxR(ctx, [sx * 0.39, 1.4, 0], [0.16, 0.06, 0.3], { roll: sx * -30 }); boxR(ctx, [sx * 0.42, 1.33, 0], [0.14, 0.06, 0.28], { roll: sx * -38 }); trim(); boxR(ctx, [sx * 0.34, 1.6, 0], [0.04, 0.04, 0.3], { roll: sx * -20 }); }
  }
  // gorget + helm: great helm with a visor slit and a crest
  plate(); cyl(ctx, 0, 1.55, 0, 0.13, 0.12, 0.1, far ? 6 : 10, true);
  cyl(ctx, 0, 1.65, 0, 0.14, 0.15, 0.25, far ? 6 : 10, false); blob(ctx, 0, 1.9, 0, 0.15, 0.1, 0.15, 7, 0.02, far ? 3 : 4, far ? 6 : 10);
  if (!far) {
    P(null, 'oklch(0.08 0 0)', 1, 0); box(ctx, -0.1, 1.8, -0.155, 0.1, 1.83, -0.14);
    trim(); box(ctx, -0.012, 1.66, -0.16, 0.012, 1.95, -0.145);
    if (p.tier === 'gilded') { P(null, 'oklch(0.55 0.18 25)', 0.9); for (let i = 0; i < 5; i++) boxR(ctx, [0, 2.02 + i * 0.01, -0.08 + i * 0.05], [0.04, 0.1, 0.05], { pitch: -20 + i * 12 }); }
    if (p.tier === 'warden') { trim(); for (const sx of [-1, 1]) boxR(ctx, [sx * 0.16, 1.98, 0], [0.03, 0.22, 0.03], { roll: sx * -30 }); }
  }
}

function sword(ctx, P, x, y, z, len, tint, lean = 0) {
  P(STEEL, 'oklch(0.8 0.01 250)', 0.25, 0.9);
  boxR(ctx, [x, y + len / 2, z], [0.06, len, 0.012], { roll: lean });
  quadN(ctx, [x - 0.03, y + len, z], [x + 0.03, y + len, z], [x, y + len + 0.1, z], [x + 0.0001, y + len + 0.1, z], [0, 0, -1]);
  P(null, tint, 0.4, 0.8); boxR(ctx, [x, y, z], [0.26, 0.035, 0.04], { roll: lean });
  P(null, 'oklch(0.35 0.05 40)', 0.9); boxR(ctx, [x, y - 0.11, z], [0.03, 0.2, 0.03]);
  P(null, tint, 0.4, 0.8); blob(ctx, x, y - 0.23, z, 0.035, 0.035, 0.035, 2, 0, 3, 5);
}

function weaponrack(ctx, P, far) {
  P(OAK, 'oklch(0.58 0.05 55)');
  for (const x of [-1.1, 1.1]) { box(ctx, x - 0.06, 0, -0.06, x + 0.06, 1.8, 0.06); boxR(ctx, [x, 0.4, 0.25], [0.08, 0.9, 0.08], { pitch: 35 }); }
  box(ctx, -1.2, 1.55, -0.07, 1.2, 1.63, 0.07); box(ctx, -1.2, 0.3, -0.07, 1.2, 0.38, 0.07);
  if (far) return;
  P(OAK, 'oklch(0.5 0.05 50)'); for (let i = 0; i < 7; i++) box(ctx, -0.95 + i * 0.32 - 0.02, 1.55, -0.12, -0.95 + i * 0.32 + 0.02, 1.68, -0.07);
  sword(ctx, P, -0.95, 0.4, -0.1, 1.0, 'oklch(0.55 0.02 60)');
  sword(ctx, P, -0.63, 0.4, -0.1, 0.85, 'oklch(0.75 0.12 85)');
  sword(ctx, P, -0.31, 0.4, -0.1, 1.1, 'oklch(0.5 0.1 25)');
  // war axe
  P(OAK, 'oklch(0.5 0.05 50)'); box(ctx, 0.0, 0.35, -0.12, 0.04, 1.6, -0.08);
  P(STEEL, 'oklch(0.7 0.01 250)', 0.3, 0.9);
  quadN(ctx, [0.04, 1.35, -0.1], [0.3, 1.25, -0.1], [0.3, 1.6, -0.1], [0.04, 1.5, -0.1], [0, 0, -1]);
  quadN(ctx, [0.04, 1.35, -0.1], [0.3, 1.25, -0.1], [0.3, 1.6, -0.1], [0.04, 1.5, -0.1], [0, 0, 1]);
  // spear
  P(OAK, 'oklch(0.55 0.05 55)'); box(ctx, 0.33, 0.35, -0.11, 0.36, 2.0, -0.08);
  P(STEEL, 'oklch(0.78 0.01 250)', 0.3, 0.9); quadN(ctx, [0.31, 2.0, -0.095], [0.38, 2.0, -0.095], [0.345, 2.3, -0.095], [0.3451, 2.3, -0.095], [0, 0, -1]); quadN(ctx, [0.31, 2.0, -0.095], [0.38, 2.0, -0.095], [0.345, 2.3, -0.095], [0.3451, 2.3, -0.095], [0, 0, 1]);
  // two staves, one with a glowing crystal, one gnarled with a bound rune-stone
  P(OAK, 'oklch(0.45 0.06 50)'); boxR(ctx, [0.66, 1.15, -0.1], [0.045, 1.7, 0.045], { roll: 2 });
  P(null, 'oklch(0.8 0.12 220)', 0.2); ctx.emissive(0.6, 1.4, 2.6); blob(ctx, 0.63, 2.08, -0.1, 0.06, 0.12, 0.06, 4, 0.2, 3, 5); ctx.emissive(null);
  P(OAK, 'oklch(0.38 0.05 60)'); boxR(ctx, [0.97, 1.1, -0.1], [0.05, 1.6, 0.05], { roll: -3 }); boxR(ctx, [1.0, 1.95, -0.1], [0.05, 0.2, 0.05], { roll: 30 });
  P(null, 'oklch(0.5 0.12 140)'); ctx.emissive(0.6, 1.8, 0.5); boxR(ctx, [0.99, 1.9, -0.13], [0.08, 0.1, 0.03], { roll: 45 }); ctx.emissive(null);
}

function shieldwall(ctx, P, far) {
  // a plank wall section with three hung shields, heater, round and kite
  P(OAK, 'oklch(0.62 0.05 55)'); box(ctx, -1.5, 0, -0.06, 1.5, 2.0, 0.06);
  if (far) return;
  P(OAK, 'oklch(0.5 0.05 50)'); box(ctx, -1.55, 1.95, -0.1, 1.55, 2.05, 0.08);
  const cols = ['oklch(0.45 0.15 30)', 'oklch(0.42 0.1 250)', 'oklch(0.5 0.1 145)'];
  [[-1, 'heater'], [0, 'round'], [1, 'kite']].forEach(([x, k], i) => {
    const cx = x * 0.95, cy = 1.15;
    P(OAK, cols[i], 0.8);
    if (k === 'round') { cyl(ctx, cx, -0.08, cy, 0.38, 0.38, 0.05, 14, true); }
    else {
      const top = k === 'kite' ? 0.45 : 0.35, bot = k === 'kite' ? -0.55 : -0.4, w = k === 'kite' ? 0.3 : 0.36;
      for (const zz of [-0.1, -0.07]) { quadN(ctx, [cx - w, cy + top, zz], [cx + w, cy + top, zz], [cx + w * 0.85, cy - 0.05, zz], [cx - w * 0.85, cy - 0.05, zz], [0, 0, zz < -0.08 ? -1 : 1]); quadN(ctx, [cx - w * 0.85, cy - 0.05, zz], [cx + w * 0.85, cy - 0.05, zz], [cx, cy + bot, zz], [cx + 0.001, cy + bot, zz], [0, 0, zz < -0.08 ? -1 : 1]); }
    }
    P(null, 'oklch(0.78 0.12 85)', 0.35, 0.9);
    if (k === 'round') blob(ctx, cx, cy, -0.13, 0.09, 0.09, 0.05, 3, 0, 3, 7);
    else { box(ctx, cx - 0.025, cy - 0.35, -0.115, cx + 0.025, cy + 0.33, -0.1); box(ctx, cx - 0.22, cy + 0.08, -0.115, cx + 0.22, cy + 0.13, -0.1); }
  });
}

function smithshed(ctx, P, far) {
  // open-fronted timber lean-to: 6 x 4 m, back wall stone, roof slopes back
  const W = 3, D = 4, Hf = 3.1, Hb = 2.4;
  P(STONE, 'oklch(0.7 0.02 70)'); box(ctx, -W, 0, D - 0.35, W, Hb, D);
  P(OAK, 'oklch(0.55 0.05 50)');
  for (const x of [-W, 0, W]) { box(ctx, x - 0.12, 0, -0.12, x + 0.12, Hf, 0.12); }
  for (const x of [-W, W]) box(ctx, x - 0.1, 0, 0, x + 0.1, 0.25, D);
  box(ctx, -W - 0.2, Hf - 0.25, -0.15, W + 0.2, Hf, 0.15);
  if (!far) for (const x of [-W, 0, W]) boxR(ctx, [x, (Hf + Hb) / 2 + 0.05, D / 2], [0.14, 0.18, Math.hypot(D, Hf - Hb) + 0.2], { pitch: -Math.atan2(Hf - Hb, D) * 180 / Math.PI });
  P(SHINGLE, 'oklch(0.75 0.06 40)');
  const a = [-W - 0.5, Hf + 0.15, -0.7], b = [W + 0.5, Hf + 0.15, -0.7], c = [W + 0.5, Hb + 0.12, D + 0.3], d = [-W - 0.5, Hb + 0.12, D + 0.3];
  quadN(ctx, a, b, c, d, [0, 1, -0.2]); quadN(ctx, [a[0], a[1] - 0.08, a[2]], [b[0], b[1] - 0.08, b[2]], [c[0], c[1] - 0.08, c[2]], [d[0], d[1] - 0.08, d[2]], [0, -1, 0.2]);
  // hanging tools along the front beam
  if (!far) {
    P(IRON, 'oklch(0.4 0.01 60)', 0.5, 0.8);
    for (let i = 0; i < 6; i++) { const x = -2.4 + i * 0.95; box(ctx, x - 0.01, Hf - 0.65, -0.02, x + 0.01, Hf - 0.25, 0.02); box(ctx, x - 0.08, Hf - 0.75, -0.03, x + 0.08, Hf - 0.65, 0.03); }
    // a glowing chimney-hood forge in the back corner
    P(STONE, 'oklch(0.55 0.02 60)'); box(ctx, 1.4, 0, D - 1.6, W - 0.2, 0.9, D - 0.35);
    P(null, 'oklch(0.75 0.17 50)'); ctx.emissive(3.2, 1.2, 0.25); box(ctx, 1.6, 0.9, D - 1.4, W - 0.4, 0.98, D - 0.55); ctx.emissive(null);
    P(STONE, 'oklch(0.5 0.02 60)'); quadN(ctx, [1.3, 1.8, D - 1.7], [W - 0.1, 1.8, D - 1.7], [W - 0.6, Hb + 1.4, D - 0.7], [1.8, Hb + 1.4, D - 0.7], [0, 0.3, -1]);
    box(ctx, 1.8, 1.8, D - 0.7, W - 0.6, Hb + 1.4, D - 0.35); box(ctx, 1.3, 0.9, D - 1.7, 1.42, 1.8, D - 0.35); box(ctx, W - 0.22, 0.9, D - 1.7, W - 0.1, 1.8, D - 0.35);
    // bellows
    P(CLOTH, 'oklch(0.45 0.06 50)'); boxR(ctx, [0.7, 0.7, D - 1.0], [0.6, 0.25, 0.9], { roll: 10 });
  }
}

function grindstone(ctx, P, far) {
  P(OAK, 'oklch(0.55 0.05 55)'); for (const z of [-0.3, 0.3]) { boxR(ctx, [-0.25, 0.4, z], [0.08, 0.85, 0.08], { roll: 15 }); boxR(ctx, [0.25, 0.4, z], [0.08, 0.85, 0.08], { roll: -15 }); }
  box(ctx, -0.4, 0.15, -0.35, 0.4, 0.22, 0.35);
  P(STONE, 'oklch(0.72 0.03 70)'); boxR(ctx, [0, 0.95, 0], [0.12, 0.7, 0.7], {}); // the wheel, as a thick disk read edge-on
  if (!far) { P(null, 'oklch(0.75 0.03 70)'); cyl(ctx, 0, 0.6, 0, 0.35, 0.35, 0.7, 12, true); P(IRON, 'oklch(0.4 0.01 60)', 0.5, 0.8); box(ctx, -0.02, 0.93, -0.5, 0.02, 0.97, 0.5); box(ctx, -0.02, 0.93, 0.48, 0.25, 0.97, 0.52); }
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5;
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  const k = p.kind || 'armorstand';
  if (col) {
    if (k === 'smithshed') { box(ctx, -3, 0, 3.65, 3, 2.4, 4); for (const x of [-3, 0, 3]) box(ctx, x - 0.12, 0, -0.12, x + 0.12, 3.1, 0.12); box(ctx, 1.4, 0, 2.4, 2.8, 0.9, 3.65); }
    else if (k === 'weaponrack') box(ctx, -1.2, 0, -0.15, 1.2, 1.7, 0.6);
    else if (k === 'shieldwall') box(ctx, -1.5, 0, -0.06, 1.5, 2.0, 0.06);
    else if (k === 'grindstone') box(ctx, -0.4, 0, -0.4, 0.4, 1.3, 0.4);
    else box(ctx, -0.4, 0, -0.3, 0.4, 2.0, 0.3);
    return;
  }
  if (k === 'armorstand') armorstand(ctx, P, far, p);
  else if (k === 'weaponrack') weaponrack(ctx, P, far);
  else if (k === 'shieldwall') shieldwall(ctx, P, far);
  else if (k === 'smithshed') smithshed(ctx, P, far);
  else if (k === 'grindstone') grindstone(ctx, P, far);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
