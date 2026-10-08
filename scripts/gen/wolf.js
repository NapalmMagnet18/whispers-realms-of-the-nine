// A Briar Wolf: one rigged scripted body. Origin between the paws, nose to −Z. ~1.4 m nose to rump, 0.85 m at the
// shoulder ruff. Lofted tubes (torso, head, jaw, legs, tail) each riding one bone; fur painted by facing: dark
// saddle on the back, grey-brown flanks, pale belly and muzzle; amber eyes glow faintly.
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

// tones: 0 fur by facing, 1 pale, 2 dark, 3 nose, 4 leg
function paint(ctx, out, tone) {
  const ny = norm(out)[1], j = (ctx.random() - 0.5) * 0.05;
  let L, C = 0.032, H = 64;
  if (tone === 1) { L = 0.76; H = 78; C = 0.028; }
  else if (tone === 2) { L = 0.3; }
  else if (tone === 3) { L = 0.16; C = 0.01; }
  else if (tone === 4) { L = ny < -0.2 ? 0.66 : 0.56; H = 70; }
  else L = ny > 0.62 ? 0.31 : ny > 0.25 ? 0.43 : ny > -0.35 ? 0.54 : 0.75;
  ctx.color(`oklch(${(L + j).toFixed(3)} ${C} ${H})`);
}

// st: [x, y, z, rx, ry, tone]; rings perpendicular to the path, quads wound outward, caps at both ends
function tube(ctx, st, n) {
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
  ctx.color("oklch(0.8 0.16 72)");
  ctx.emissive("oklch(0.62 0.17 62)");
  quadN(ctx, [x, 0.935, -0.675], [x + 0.004 * s, 0.918, -0.712], [x, 0.903, -0.678], [x - 0.006 * s, 0.918, -0.645], n);
  ctx.emissive(null);
  ctx.color("oklch(0.12 0.01 60)");
  quadN(ctx, [x + 0.003 * s, 0.928, -0.68], [x + 0.005 * s, 0.918, -0.692], [x + 0.003 * s, 0.908, -0.682], [x + 0.002 * s, 0.918, -0.668], n);
}

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = lod <= 1 ? 14 : lod <= 2 ? 10 : lod <= 3 ? 8 : lod <= 4 ? 6 : 4, ln = lod >= 5 ? 4 : ln;
  ctx.smooth();
  ctx.roughness(0.92);
  ctx.bone("body");
  tube(ctx, [
    [0, 0.66, 0.5, 0.05, 0.05, 2], [0, 0.66, 0.46, 0.13, 0.15], [0, 0.65, 0.36, 0.165, 0.19], [0, 0.65, 0.2, 0.15, 0.17],
    [0, 0.67, 0.04, 0.14, 0.15], [0, 0.65, -0.14, 0.17, 0.21], [0, 0.64, -0.28, 0.195, 0.235], [0, 0.69, -0.4, 0.18, 0.21],
    [0, 0.77, -0.48, 0.14, 0.15], [0, 0.84, -0.54, 0.115, 0.12],
  ], n);
  ctx.bone("tail");
  tube(ctx, [[0, 0.7, 0.45, 0.05, 0.05], [0, 0.64, 0.58, 0.075, 0.075], [0, 0.54, 0.7, 0.085, 0.085], [0, 0.42, 0.78, 0.07, 0.07, 2], [0, 0.31, 0.82, 0.03, 0.03, 2]], n);
  ctx.bone("head");
  tube(ctx, [
    [0, 0.88, -0.5, 0.1, 0.1], [0, 0.9, -0.56, 0.13, 0.13], [0, 0.9, -0.65, 0.125, 0.115], [0, 0.875, -0.73, 0.085, 0.07, 1],
    [0, 0.86, -0.81, 0.06, 0.045, 1], [0, 0.855, -0.875, 0.04, 0.032, 3], [0, 0.855, -0.9, 0.02, 0.018, 3],
  ], n);
  ear(ctx, -0.075); ear(ctx, 0.075);
  if (lod <= 3) { eye(ctx, -1); eye(ctx, 1); }
  ctx.bone("jaw");
  tube(ctx, [[0, 0.815, -0.64, 0.07, 0.045, 1], [0, 0.81, -0.76, 0.05, 0.03, 1], [0, 0.815, -0.85, 0.028, 0.018, 1]], ln);
  for (const s of [-1, 1]) {
    const x = 0.11 * s;
    ctx.bone(s < 0 ? "legFL" : "legFR");
    tube(ctx, [[x, 0.6, -0.3, 0.065, 0.08], [x, 0.4, -0.31, 0.055, 0.06, 4], [x, 0.2, -0.3, 0.04, 0.045, 4], [x, 0.07, -0.31, 0.04, 0.045, 4], [x, 0.03, -0.35, 0.05, 0.06, 4], [x, 0.005, -0.37, 0.04, 0.045, 3]], ln);
    ctx.bone(s < 0 ? "legBL" : "legBR");
    tube(ctx, [[x, 0.62, 0.34, 0.08, 0.1], [x, 0.42, 0.28, 0.07, 0.08], [x, 0.22, 0.38, 0.04, 0.045, 4], [x, 0.07, 0.36, 0.035, 0.04, 4], [x, 0.03, 0.33, 0.045, 0.06, 4], [x, 0.005, 0.31, 0.04, 0.045, 3]], ln);
  }
}
