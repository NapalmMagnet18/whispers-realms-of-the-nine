// A Briar Wolf, dark-fantasy cut: one rigged scripted body. Origin between the paws, nose to −Z. ~1.4 m nose to rump,
// 0.85 m at the shoulder ruff. Lofted tubes (torso, head, jaw, legs, tail) Catmull-Rom densified, each riding one bone;
// soot-black saddle streaked with fur jitter, ash-umber flanks, bone-grey muzzle; a ridge of thorn-bone spines from
// nape to tail, bared fangs, black claws and ember-red eyes that burn.
import { quadN, triN } from "./shape.js";

export function skeleton() {
  return {
    body: { pivot: [0, 0.62, 0] },
    head: { parent: "body", pivot: [0, 0.82, -0.5] },
    jaw: { parent: "head", pivot: [0, 0.83, -0.64] },
    legFL: { parent: "body", pivot: [-0.11, 0.58, -0.3] },
    legFR: { parent: "body", pivot: [0.11, 0.58, -0.3] },
    legBL: { parent: "body", pivot: [-0.11, 0.6, 0.34] },
    legBR: { parent: "body", pivot: [0.11, 0.6, 0.34] },
    tail: { parent: "body", pivot: [0, 0.68, 0.47] },
  };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// tones: 0 fur by facing, 1 pale (ash muzzle), 2 dark, 3 nose, 4 leg
function paint(ctx, out, tone) {
  const ny = norm(out)[1], j = (ctx.random() - 0.5) * 0.09;
  let L, C = 0.03, H = 42;
  if (tone === 1) { L = 0.52; H = 60; C = 0.018; }
  else if (tone === 2) { L = 0.14; }
  else if (tone === 3) { L = 0.09; C = 0.008; }
  else if (tone === 4) { L = ny < -0.2 ? 0.32 : 0.22; H = 38; }
  else if (tone === 5) { L = 0.2 + j * 0.5; C = 0.05; H = 128; } // briar vine
  else if (tone === 6) { L = ny > 0 ? 0.74 : 0.6; C = 0.025; H = 80; } // bare rib bone
  else L = ny > 0.62 ? 0.13 : ny > 0.25 ? 0.2 : ny > -0.35 ? 0.3 : 0.42;
  ctx.color(`oklch(${Math.max(0.05, L + j).toFixed(3)} ${C} ${H})`);
}

// Catmull-Rom between stations: k extra rings per span, radii and tone carried along
function dense(st, k) {
  if (k <= 0) return st;
  const out = [];
  for (let i = 0; i < st.length - 1; i++) {
    const a = st[Math.max(0, i - 1)], b = st[i], c = st[i + 1], d = st[Math.min(st.length - 1, i + 2)];
    out.push(b);
    for (let j = 1; j <= k; j++) {
      const t = j / (k + 1), t2 = t * t, t3 = t2 * t, r = [];
      for (let q = 0; q < 5; q++) r.push(0.5 * (2 * b[q] + (-a[q] + c[q]) * t + (2 * a[q] - 5 * b[q] + 4 * c[q] - d[q]) * t2 + (-a[q] + 3 * b[q] - 3 * c[q] + d[q]) * t3));
      r[3] = Math.max(0.01, r[3]); r[4] = Math.max(0.01, r[4]); r.push(t < 0.5 ? b[5] : c[5]);
      out.push(r);
    }
  }
  out.push(st[st.length - 1]);
  return out;
}

// a four-sided spike from base point b along dir u: thorn-bone, dark at the root, pale at the tip
function spike(ctx, b, u, len, w) {
  const up = norm(u), side = norm(cross(up, Math.abs(up[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])), fwd = cross(side, up);
  const tip = add(b, mul(up, len)), ring = [add(b, mul(side, w)), add(b, mul(fwd, w)), add(b, mul(side, -w)), add(b, mul(fwd, -w))];
  for (let i = 0; i < 4; i++) {
    const a = ring[i], c = ring[(i + 1) % 4], m = mul(add(add(a, c), tip), 1 / 3);
    ctx.color(`oklch(${(0.62 + ctx.random() * 0.08).toFixed(3)} 0.04 70)`);
    triN(ctx, a, c, tip, sub(m, b));
  }
}

function fang(ctx, x, y, z, down, len) {
  ctx.color("oklch(0.88 0.03 85)");
  const tip = [x, y + (down ? -len : len), z - 0.004];
  triN(ctx, [x - 0.008, y, z], [x + 0.008, y, z], tip, [0, 0, -1]);
  triN(ctx, [x + 0.008, y, z], [x, y, z + 0.008], tip, [Math.sign(x) || 1, 0, 0.3]);
  triN(ctx, [x, y, z + 0.008], [x - 0.008, y, z], tip, [-(Math.sign(x) || 1), 0, 0.3]);
}

// st: [x, y, z, rx, ry, tone]; rings perpendicular to the path, quads wound outward, caps at both ends
function tube(ctx, st0, n, k = 0) {
  const st = dense(st0, k);
  const P = st.map((s) => [s[0], s[1], s[2]]);
  const rings = st.map((s, i) => {
    const d = norm(sub(P[Math.min(P.length - 1, i + 1)], P[Math.max(0, i - 1)]));
    const a = norm(cross([1, 0, 0], d)), b = cross(d, a), r = [];
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2;
      r.push(add(P[i], add(mul(b, Math.cos(t) * s[3]), mul(a, Math.sin(t) * s[4]))));
    }
    return r;
  });
  for (let i = 0; i < st.length - 1; i++) {
    const axis = mul(add(P[i], P[i + 1]), 0.5);
    for (let k = 0; k < n; k++) {
      const k1 = (k + 1) % n, q = [rings[i][k], rings[i][k1], rings[i + 1][k1], rings[i + 1][k]];
      const m = mul(add(add(q[0], q[1]), add(q[2], q[3])), 0.25), out = sub(m, axis);
      paint(ctx, out, st[i][5] ?? 0);
      quadN(ctx, q[0], q[1], q[2], q[3], out);
    }
  }
  for (const [ri, nb] of [[0, 1], [st.length - 1, st.length - 2]]) {
    const out = norm(sub(P[ri], P[nb]));
    for (let k = 0; k < n; k++) {
      paint(ctx, [out[0], out[1] + 0.001, out[2]], st[ri][5] ?? 0);
      triN(ctx, P[ri], rings[ri][k], rings[ri][(k + 1) % n], out);
    }
  }
}

function ear(ctx, x) {
  const s = Math.sign(x), b1 = [x - 0.04, 0.97, -0.6], b2 = [x + 0.04, 0.97, -0.6], b3 = [x, 0.965, -0.535], tip = [x + s * 0.025, 1.1, -0.565];
  const c = [(b1[0] + b2[0] + b3[0] + tip[0]) / 4, (b1[1] + b2[1] + b3[1] + tip[1]) / 4, (b1[2] + b2[2] + b3[2] + tip[2]) / 4];
  for (const f of [[b1, b2, tip], [b2, b3, tip], [b3, b1, tip]]) {
    const m = mul(add(add(f[0], f[1]), f[2]), 1 / 3);
    paint(ctx, [0, 1, 0], f[0] === b1 && f[1] === b2 ? 1 : 2);
    triN(ctx, f[0], f[1], f[2], sub(m, c));
  }
}

function eye(ctx, s) {
  const x = 0.112 * s, n = [s, 0.1, -0.35];
  ctx.color("oklch(0.72 0.2 35)");
  ctx.emissive("oklch(0.7 0.22 32)");
  quadN(ctx, [x, 0.935, -0.675], [x + 0.004 * s, 0.918, -0.712], [x, 0.903, -0.678], [x - 0.006 * s, 0.918, -0.645], n);
  ctx.emissive(null);
  ctx.color("oklch(0.12 0.01 60)");
  quadN(ctx, [x + 0.003 * s, 0.928, -0.68], [x + 0.005 * s, 0.918, -0.692], [x + 0.003 * s, 0.908, -0.682], [x + 0.002 * s, 0.918, -0.668], n);
}

// the torso's surface at z: [centre y, half-width, half-height], read off the body stations
const TORSO = [[0.5, 0.66, 0.05, 0.05], [0.46, 0.66, 0.13, 0.15], [0.36, 0.65, 0.165, 0.19], [0.2, 0.65, 0.15, 0.17], [0.04, 0.67, 0.14, 0.15], [-0.14, 0.65, 0.17, 0.21], [-0.28, 0.64, 0.195, 0.235], [-0.4, 0.69, 0.18, 0.21], [-0.48, 0.77, 0.14, 0.15], [-0.54, 0.84, 0.115, 0.12]];
function torsoAt(z) {
  for (let i = 0; i < TORSO.length - 1; i++) { const a = TORSO[i], b = TORSO[i + 1]; if (z <= a[0] && z >= b[0]) { const t = (a[0] - z) / (a[0] - b[0]); return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]; } }
  const e = z > 0 ? TORSO[0] : TORSO[TORSO.length - 1]; return [e[1], e[2], e[3]];
}
// one fur tuft: two crossed blades from the hide, raked back (+Z) and out, dark at the root
function tuft(ctx, base, out, len, w, L) {
  const dir = norm(add(out, [0, 0.25, 0.9])), side = norm(cross(dir, out)), tip = add(add(base, mul(dir, len)), mul(out, len * 0.35));
  const n1 = out, w2 = norm(cross(dir, side));
  ctx.color(`oklch(${(L + (ctx.random() - 0.5) * 0.05).toFixed(3)} 0.025 45)`);
  triN(ctx, add(base, mul(side, -w)), add(base, mul(side, w)), tip, n1);
  triN(ctx, add(base, mul(w2, -w * 0.7)), add(base, mul(w2, w * 0.7)), tip, side);
}
// fur over the hide: z span, angle span from straight up (radians), count, length range, tone
function pelt(ctx, z0, z1, ang, count, l0, l1, L) {
  for (let i = 0; i < count; i++) {
    const z = z0 + (z1 - z0) * ctx.random(), a = (ctx.random() * 2 - 1) * ang, [cy, rx, ry] = torsoAt(z);
    const out = norm([Math.sin(a) / rx, Math.cos(a) / ry, 0]), base = [Math.sin(a) * rx * 0.94, cy + Math.cos(a) * ry * 0.94, z];
    tuft(ctx, base, out, l0 + (l1 - l0) * ctx.random(), 0.018 + ctx.random() * 0.012, L);
  }
}
// a briar strand: a thin tube spiralling a path, little thorns along it
function briar(ctx, center, radius, turns, steps, rs, thorns) {
  const st = [];
  for (let i = 0; i <= steps; i++) { const t = i / steps, a = t * turns * Math.PI * 2, [c, rx, ry] = center(t); st.push([c[0] + Math.cos(a) * rx * radius, c[1] + Math.sin(a) * ry * radius, c[2], rs, rs, 5]); if (thorns && i % 2 === 1) spikeDark(ctx, [st[i][0], st[i][1], st[i][2]], [Math.cos(a), Math.sin(a), 0.4], 0.035, 0.007); }
  tube(ctx, st, 5, 0);
}
function spikeDark(ctx, b, u, len, w) {
  const up = norm(u), side = norm(cross(up, Math.abs(up[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])), fwd = cross(side, up), tip = add(b, mul(up, len));
  const ring = [add(b, mul(side, w)), add(b, mul(fwd, w)), add(b, mul(side, -w)), add(b, mul(fwd, -w))];
  for (let i = 0; i < 4; i++) { const a = ring[i], c = ring[(i + 1) % 4], m = mul(add(add(a, c), tip), 1 / 3); ctx.color("oklch(0.3 0.06 60)"); triN(ctx, a, c, tip, sub(m, b)); }
}

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = lod <= 1 ? 22 : lod <= 2 ? 14 : lod <= 3 ? 9 : lod <= 4 ? 6 : 4, ln = lod >= 5 ? 4 : Math.max(6, n - 6), k = lod <= 1 ? 2 : lod <= 2 ? 1 : 0;
  ctx.smooth();
  ctx.roughness(0.92);
  ctx.bone("body");
  tube(ctx, [
    [0, 0.66, 0.5, 0.05, 0.05, 2], [0, 0.66, 0.46, 0.13, 0.15], [0, 0.65, 0.36, 0.165, 0.19], [0, 0.65, 0.2, 0.15, 0.17],
    [0, 0.67, 0.04, 0.14, 0.15], [0, 0.65, -0.14, 0.17, 0.21], [0, 0.64, -0.28, 0.195, 0.235], [0, 0.69, -0.4, 0.18, 0.21],
    [0, 0.77, -0.48, 0.14, 0.15], [0, 0.84, -0.54, 0.115, 0.12],
  ], n, k);
  if (lod <= 3) { // the thorn ridge: nape to rump, longest over the shoulders, raked back
    const ridge = [[-0.5, 0.93, 0.07], [-0.42, 0.9, 0.11], [-0.33, 0.86, 0.15], [-0.24, 0.85, 0.16], [-0.14, 0.85, 0.15], [-0.04, 0.83, 0.12], [0.06, 0.82, 0.1], [0.16, 0.82, 0.09], [0.26, 0.83, 0.08], [0.36, 0.83, 0.06], [0.44, 0.8, 0.045]];
    for (const [z, y, len] of ridge) {
      spike(ctx, [0, y - 0.03, z], [0, 1, 0.6], len * 1.7, len * 0.3);
      if (lod <= 2 && len > 0.09) for (const sx of [-1, 1]) spike(ctx, [sx * 0.09, y - 0.06, z + 0.02], [sx * 0.7, 1, 0.5], len * 0.95, len * 0.22);
    }
  }
  if (lod <= 2) { // the hide: a shaggy mane, a ragged back, a hanging belly fringe; ribs showing through a starved flank; briar choking the trunk
    const f = lod <= 1 ? 1 : 0.45
    pelt(ctx, -0.56, -0.26, 1.9, Math.round(150 * f), 0.08, 0.15, 0.1)
    pelt(ctx, -0.26, 0.42, 1.0, Math.round(110 * f), 0.04, 0.075, 0.12)
    pelt(ctx, -0.32, 0.18, 0.5, Math.round(30 * f), 0.04, 0.07, 0.24)
    for (const sx of [-1, 1]) for (let r = 0; r < 4; r++) {
      const z = -0.08 + r * 0.075, [cy, rx, ry] = torsoAt(z), arc = []
      for (let q = 0; q <= 5; q++) { const a = sx * (1.35 + q * 0.22); arc.push([Math.sin(a) * rx * 1.02, cy + Math.cos(a) * ry * 1.02, z + q * 0.008, 0.011, 0.011, 6]) }
      tube(ctx, arc, 5, 0)
    }
    briar(ctx, (t) => { const z = -0.34 + t * 0.7, [cy, rx, ry] = torsoAt(z); return [[0, cy, z], rx, ry] }, 1.05, 2.25, lod <= 1 ? 44 : 24, 0.013, true)
  }
  ctx.bone("tail");
  tube(ctx, [[0, 0.7, 0.45, 0.05, 0.05], [0, 0.64, 0.58, 0.075, 0.075], [0, 0.54, 0.7, 0.085, 0.085], [0, 0.42, 0.78, 0.07, 0.07, 2], [0, 0.31, 0.82, 0.03, 0.03, 2]], n, k);
  if (lod <= 2) for (const [y, z, l] of [[0.66, 0.57, 0.06], [0.57, 0.68, 0.05], [0.46, 0.76, 0.04]]) spike(ctx, [0, y + 0.06, z], [0, 1, 0.9], l, l * 0.25);
  ctx.bone("head");
  tube(ctx, [
    [0, 0.88, -0.5, 0.1, 0.1], [0, 0.9, -0.56, 0.13, 0.13], [0, 0.9, -0.65, 0.125, 0.115], [0, 0.875, -0.73, 0.085, 0.07, 1],
    [0, 0.86, -0.81, 0.06, 0.045, 1], [0, 0.855, -0.875, 0.04, 0.032, 3], [0, 0.855, -0.9, 0.02, 0.018, 3],
  ], n, k);
  if (lod <= 2) { fang(ctx, -0.03, 0.835, -0.845, true, 0.045); fang(ctx, 0.03, 0.835, -0.845, true, 0.045); fang(ctx, -0.045, 0.83, -0.8, true, 0.025); fang(ctx, 0.045, 0.83, -0.8, true, 0.025); }
  ear(ctx, -0.075); ear(ctx, 0.075);
  if (lod <= 3) { eye(ctx, -1); eye(ctx, 1); }
  ctx.bone("jaw");
  tube(ctx, [[0, 0.815, -0.64, 0.07, 0.045, 1], [0, 0.81, -0.76, 0.05, 0.03, 1], [0, 0.815, -0.85, 0.028, 0.018, 1]], ln, k ? 1 : 0);
  if (lod <= 2) { fang(ctx, -0.022, 0.83, -0.83, false, 0.035); fang(ctx, 0.022, 0.83, -0.83, false, 0.035); }
  for (const s of [-1, 1]) {
    const x = 0.11 * s;
    ctx.bone(s < 0 ? "legFL" : "legFR");
    tube(ctx, [[x, 0.6, -0.3, 0.065, 0.08], [x, 0.4, -0.31, 0.055, 0.06, 4], [x, 0.2, -0.3, 0.04, 0.045, 4], [x, 0.07, -0.31, 0.04, 0.045, 4], [x, 0.03, -0.35, 0.05, 0.06, 4], [x, 0.005, -0.37, 0.04, 0.045, 3]], ln, k ? 1 : 0);
    if (lod <= 2) for (const cx of [-0.025, 0, 0.025]) spike(ctx, [x + cx, 0.02, -0.4], [0, -0.3, -1], 0.035, 0.008)
    if (lod <= 2) { const st = []; for (let i = 0; i <= 16; i++) { const t = i / 16, y = 0.52 - t * 0.42, a = t * 2.6 * Math.PI * 2 + s, r = 0.07 - t * 0.02; st.push([x + Math.cos(a) * r, y, -0.305 + Math.sin(a) * r, 0.011, 0.011, 5]); if (i % 3 === 1) spikeDark(ctx, [st[i][0], y, st[i][2]], [Math.cos(a), 0.2, Math.sin(a)], 0.03, 0.006) } tube(ctx, st, 5, 0) };
    ctx.bone(s < 0 ? "legBL" : "legBR");
    tube(ctx, [[x, 0.62, 0.34, 0.08, 0.1], [x, 0.42, 0.28, 0.07, 0.08], [x, 0.22, 0.38, 0.04, 0.045, 4], [x, 0.07, 0.36, 0.035, 0.04, 4], [x, 0.03, 0.33, 0.045, 0.06, 4], [x, 0.005, 0.31, 0.04, 0.045, 3]], ln, k ? 1 : 0);
  }
}
