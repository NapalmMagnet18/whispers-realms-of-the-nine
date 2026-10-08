// Shared emitters for Lantern's Reach geometry. Winding is derived from an outward normal, never eyeballed.
export function quadN(ctx, a, b, c, d, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) ctx.quad(...a, ...b, ...c, ...d);
  else ctx.quad(...d, ...c, ...b, ...a);
}
export function triN(ctx, a, b, c, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) ctx.tri(...a, ...b, ...c);
  else ctx.tri(...c, ...b, ...a);
}
const D = Math.PI / 180;
export function rot(p, r) {
  let [x, y, z] = p;
  if (r.roll) { const c = Math.cos(r.roll * D), s = Math.sin(r.roll * D); [x, y] = [x * c - y * s, x * s + y * c]; }
  if (r.pitch) { const c = Math.cos(r.pitch * D), s = Math.sin(r.pitch * D); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (r.yaw) { const c = Math.cos(r.yaw * D), s = Math.sin(r.yaw * D); [x, z] = [x * c + z * s, -x * s + z * c]; }
  return [x, y, z];
}
const FACES = [[1, 3, 7, 5], [0, 4, 6, 2], [2, 6, 7, 3], [0, 1, 5, 4], [4, 5, 7, 6], [0, 2, 3, 1]];
// centre c, size s, rotation r {yaw,pitch,roll} degrees
export function boxR(ctx, c, s, r = {}, skip = -1) {
  const P = [];
  for (let i = 0; i < 8; i++) {
    const l = [(i & 1 ? 0.5 : -0.5) * s[0], (i & 2 ? 0.5 : -0.5) * s[1], (i & 4 ? 0.5 : -0.5) * s[2]];
    const w = rot(l, r);
    P.push([c[0] + w[0], c[1] + w[1], c[2] + w[2]]);
  }
  FACES.forEach((f, k) => {
    if (k === skip) return;
    const m = [0, 0, 0];
    for (const i of f) for (let j = 0; j < 3; j++) m[j] += P[i][j] / 4;
    quadN(ctx, P[f[0]], P[f[1]], P[f[2]], P[f[3]], [m[0] - c[0], m[1] - c[1], m[2] - c[2]]);
  });
}
export function box(ctx, x0, y0, z0, x1, y1, z1) {
  if (x1 - x0 < 1e-4 || y1 - y0 < 1e-4 || z1 - z0 < 1e-4) return;
  boxR(ctx, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [x1 - x0, y1 - y0, z1 - z0]);
}
// a tapered cylinder standing on (x,y0,z)
export function cyl(ctx, x, y0, z, r0, r1, h, seg = 10, caps = true, jitter = null) {
  const ring = (y, r, k) => {
    const out = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2, rr = r * (jitter ? jitter(i, k) : 1);
      out.push([x + Math.cos(a) * rr, y, z + Math.sin(a) * rr]);
    }
    return out;
  };
  const A = ring(y0, r0, 0), B = ring(y0 + h, r1, 1);
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg, a = ((i + 0.5) / seg) * Math.PI * 2;
    quadN(ctx, A[i], A[j], B[j], B[i], [Math.cos(a), 0, Math.sin(a)]);
  }
  if (caps) for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    if (r1 > 0.001) triN(ctx, [x, y0 + h, z], B[i], B[j], [0, 1, 0]);
    triN(ctx, [x, y0, z], A[j], A[i], [0, -1, 0]);
  }
}
// a lumpy closed blob (rocks, foliage clumps): lat/long sphere with seeded radial noise
export function blob(ctx, cx, cy, cz, rx, ry, rz, seed = 1, rough = 0.25, lat = 6, lon = 9) {
  const h = (i, j) => { let n = Math.sin((i * 127.1 + j * 311.7 + seed * 74.7)) * 43758.5453; return n - Math.floor(n); };
  const V = [];
  for (let i = 0; i <= lat; i++) {
    const row = [], t = (i / lat) * Math.PI;
    for (let j = 0; j < lon; j++) {
      const p = (j / lon) * Math.PI * 2, k = (i === 0 || i === lat) ? 1 : 1 + (h(i, j) - 0.5) * 2 * rough;
      row.push([cx + Math.sin(t) * Math.cos(p) * rx * k, cy + Math.cos(t) * ry * k, cz + Math.sin(t) * Math.sin(p) * rz * k]);
    }
    V.push(row);
  }
  for (let i = 0; i < lat; i++) for (let j = 0; j < lon; j++) {
    const j2 = (j + 1) % lon, a = V[i][j], b = V[i][j2], c = V[i + 1][j2], d = V[i + 1][j];
    const m = [(a[0] + c[0]) / 2 - cx, (a[1] + c[1]) / 2 - cy, (a[2] + c[2]) / 2 - cz];
    if (i === 0) triN(ctx, a, c, d, m); else if (i === lat - 1) triN(ctx, a, b, c, m); else quadN(ctx, a, b, c, d, m);
  }
}
