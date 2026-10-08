// Emberstone Quarry chapter set pieces (EQU-01..09): crystal vein, survey stake, lift brake, drill rig, shaft door.
// params.kind picks the piece. Origin at the foot, front = -Z. Lantern-gold palette: dark oak, hammered iron, bellglass violet.
const OAK = "oklch(0.36 0.05 55)", OAKD = "oklch(0.28 0.04 50)", IRON = "oklch(0.32 0.01 60)", ROCK = "oklch(0.5 0.07 40)";
const BELL = "oklch(0.72 0.14 300)", RUST = "oklch(0.45 0.09 45)", ROPE = "oklch(0.7 0.06 80)";

function box(ctx, cx, cy, cz, w, h, d, yaw = 0, bev = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (x, y, z) => [cx + x * c + z * s, cy + y, cz - x * s + z * c];
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, z0 = -d / 2, z1 = d / 2;
  const q = (a, b, e, f) => ctx.quad(...P(...a), ...P(...b), ...P(...e), ...P(...f));
  q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
  q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
  q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
  q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
  q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]);
  q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
}
// a beam between two points, square section t
function beam(ctx, a, b, t) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1;
  const f = [dx / L, dy / L, dz / L];
  let u = Math.abs(f[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const r = [f[1] * u[2] - f[2] * u[1], f[2] * u[0] - f[0] * u[2], f[0] * u[1] - f[1] * u[0]];
  const rl = Math.hypot(...r); r[0] /= rl; r[1] /= rl; r[2] /= rl;
  u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const h = t / 2, corner = (p, i) => { const sx = i === 0 || i === 3 ? -h : h, sy = i < 2 ? -h : h; return [p[0] + r[0] * sx + u[0] * sy, p[1] + r[1] * sx + u[1] * sy, p[2] + r[2] * sx + u[2] * sy]; };
  const A = [0, 1, 2, 3].map((i) => corner(a, i)), B = [0, 1, 2, 3].map((i) => corner(b, i));
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; ctx.quad(...A[i], ...A[j], ...B[j], ...B[i]); }
  ctx.quad(...A[3], ...A[2], ...A[1], ...A[0]); ctx.quad(...B[0], ...B[1], ...B[2], ...B[3]);
}
function cyl(ctx, cx, cy, cz, r0, r1, h, n = 10, axis = "y") {
  const P = (a, rr, y) => { const u = Math.cos(a) * rr, v = Math.sin(a) * rr; return axis === "y" ? [cx + u, cy + y, cz + v] : axis === "x" ? [cx + y, cy + v, cz + u] : [cx + u, cy + v, cz + y]; };
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    ctx.quad(...P(a, r0, 0), ...P(b, r0, 0), ...P(b, r1, h), ...P(a, r1, h));
    ctx.tri(...P(b, r1, h), ...P(a, r1, h), ...(axis === "y" ? [cx, cy + h, cz] : axis === "x" ? [cx + h, cy, cz] : [cx, cy, cz + h]));
    ctx.tri(...P(a, r0, 0), ...P(b, r0, 0), ...(axis === "y" ? [cx, cy, cz] : axis === "x" ? [cx, cy, cz] : [cx, cy, cz]));
  }
}
// a six-sided crystal: prism with a pointed tip, leaning by (lx, lz)
function crystal(ctx, x, y, z, r, h, lx, lz, n = 6) {
  const top = [x + lx * h, y + h, z + lz * h], tip = [x + lx * (h + r * 2.2), y + h + r * 2.2, z + lz * (h + r * 2.2)];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    const p0 = [x + Math.cos(a) * r, y - 0.1, z + Math.sin(a) * r], p1 = [x + Math.cos(b) * r, y - 0.1, z + Math.sin(b) * r];
    const t0 = [top[0] + Math.cos(a) * r * 0.85, top[1], top[2] + Math.sin(a) * r * 0.85], t1 = [top[0] + Math.cos(b) * r * 0.85, top[1], top[2] + Math.sin(b) * r * 0.85];
    ctx.quad(...p1, ...p0, ...t0, ...t1);
    ctx.tri(...t1, ...t0, ...tip);
  }
}
function rockLump(ctx, x, y, z, rx, ry, rz, seed, lod) {
  const n = lod >= 4 ? 5 : 9, m = lod >= 4 ? 3 : 6, V = [];
  for (let j = 0; j <= m; j++) {
    const row = [], ph = (j / m) * Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2, k = 0.82 + 0.18 * Math.sin(i * 2.7 + j * 1.9 + seed * 5.1);
      row.push([x + Math.cos(th) * Math.cos(ph) * rx * k, y + Math.sin(ph) * ry * (j === m ? 1 : k), z + Math.sin(th) * Math.cos(ph) * rz * k]);
    }
    V.push(row);
  }
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const a = V[j][i], b = V[j][(i + 1) % n], c = V[j + 1][(i + 1) % n], d = V[j + 1][i]; ctx.quad(...b, ...a, ...d, ...c); }
}

export function geometry(ctx) {
  const k = ctx.params.kind || "crystal", lod = ctx.lod || 1;
  ctx.flat();
  if (k === "crystal") {
    ctx.color(ROCK); ctx.roughness(0.95);
    rockLump(ctx, 0, -0.15, 0, 1.1, 0.9, 0.9, 1, lod);
    ctx.color(BELL); ctx.emissive(lod <= 3 ? "oklch(0.55 0.2 300)" : null); ctx.roughness(0.15); ctx.metalness(0.1);
    const C = [[0, 0.5, 0, 0.16, 0.9, 0.1, -0.15], [0.35, 0.4, 0.2, 0.12, 0.6, 0.4, 0.1], [-0.4, 0.35, -0.1, 0.13, 0.7, -0.35, -0.2], [0.1, 0.45, -0.4, 0.1, 0.5, 0.1, -0.5], [-0.2, 0.3, 0.4, 0.09, 0.45, -0.2, 0.45]];
    for (let i = 0; i < (lod >= 4 ? 2 : C.length); i++) { const c = C[i]; crystal(ctx, c[0], c[1], c[2], c[3], c[4], c[5], c[6], lod >= 4 ? 4 : 6); }
    ctx.emissive(null); ctx.metalness(0);
  } else if (k === "stake") {
    ctx.color(OAK); ctx.roughness(0.9);
    // split stake: the lower half driven in, the top snapped and leaning
    box(ctx, 0, 0.35, 0, 0.09, 0.7, 0.09);
    beam(ctx, [0.02, 0.68, 0], [0.32, 1.05, 0.08], 0.08);
    if (lod <= 3) {
      ctx.color(RUST); box(ctx, 0, 0.62, -0.05, 0.11, 0.04, 0.01); // iron band
      ctx.color("oklch(0.62 0.18 30)"); box(ctx, 0.3, 0.98, 0.06, 0.03, 0.22, 0.12, 0.4); // torn red survey ribbon
      ctx.color(ROPE); for (let i = 0; i < 3; i++) box(ctx, -0.35 + i * 0.05, 0.02, 0.3 + i * 0.12, 0.05, 0.04, 0.05, i); // scattered pegs
    }
  } else if (k === "brake") {
    ctx.color(OAKD); ctx.roughness(0.9);
    box(ctx, 0, 0.08, 0, 1.2, 0.16, 0.8); // sill
    box(ctx, -0.45, 0.75, 0, 0.18, 1.3, 0.18); box(ctx, 0.45, 0.75, 0, 0.18, 1.3, 0.18);
    box(ctx, 0, 1.45, 0, 1.2, 0.14, 0.2);
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.5);
    cyl(ctx, -0.36, 0.95, 0, 0.42, 0.42, 0.08, lod >= 4 ? 8 : 16, "x"); // brake drum
    cyl(ctx, -0.36, 0.95, 0, 0.08, 0.08, 0.72, 8, "x"); // axle
    if (lod <= 3) for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; beam(ctx, [-0.32, 0.95, 0], [-0.32, 0.95 + Math.sin(a) * 0.4, Math.cos(a) * 0.4], 0.035); }
    ctx.color(RUST); beam(ctx, [0.2, 0.3, -0.25], [0.32, 1.25, -0.42], 0.06); // lever
    ctx.color(OAK); box(ctx, 0.33, 1.3, -0.44, 0.1, 0.16, 0.1); // grip
    ctx.metalness(0);
    if (lod <= 2) { ctx.color("oklch(0.75 0.13 85)"); box(ctx, 0.45, 1.1, -0.1, 0.02, 0.18, 0.18); } // brass tag
  } else if (k === "rig") {
    // an unlicensed drill derrick: three legs, a crown block, a hanging bit over a boiler box
    ctx.color(OAKD); ctx.roughness(0.9);
    const H = 5.2, L = [[-1.6, 0, -1.2], [1.6, 0, -1.2], [0, 0, 1.7]];
    for (const l of L) beam(ctx, l, [0, H, 0], 0.2);
    if (lod <= 3) for (let i = 0; i < 3; i++) { const a = L[i], b = L[(i + 1) % 3], t = 0.42; beam(ctx, [a[0] * (1 - t), H * t, a[2] * (1 - t)], [b[0] * (1 - t), H * t, b[2] * (1 - t)], 0.12); }
    box(ctx, 0, H + 0.15, 0, 0.6, 0.3, 0.6);
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.45);
    box(ctx, 1.6, 0.6, 0.6, 1.3, 1.2, 1.1); // boiler box
    cyl(ctx, 1.9, 1.2, 0.6, 0.16, 0.14, 1.4, 8); // stack
    cyl(ctx, 0, 0.9, 0, 0.12, 0.12, 2.8, 8); // drill shaft
    cyl(ctx, 0, 0.1, 0, 0.02, 0.22, 0.8, 8); // bit (point down)
    ctx.color(ROPE); ctx.metalness(0); beam(ctx, [0, H, 0], [0, 3.7, 0], 0.04);
    if (lod <= 3) { ctx.color(BELL); ctx.emissive("oklch(0.55 0.22 300)"); crystal(ctx, 0.15, 0.05, 0.3, 0.08, 0.25, 0.3, 0.2, 5); crystal(ctx, -0.25, 0.05, -0.2, 0.07, 0.2, -0.3, -0.1, 5); ctx.emissive(null); }
    if (lod <= 2) { ctx.color(RUST); box(ctx, 1.6, 1.25, 0.03, 0.5, 0.05, 0.02); }
  } else if (k === "hammer") {
    // a tuning hammer resting in an iron cradle on a cut stone block
    ctx.color("oklch(0.55 0.04 50)"); ctx.roughness(0.95);
    box(ctx, 0, 0.4, 0, 0.7, 0.8, 0.5);
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.45);
    box(ctx, -0.25, 0.9, 0, 0.05, 0.2, 0.3); box(ctx, 0.25, 0.9, 0, 0.05, 0.2, 0.3);
    box(ctx, 0.1, 1.02, 0, 0.32, 0.16, 0.16); // head
    if (lod <= 3) { ctx.color("oklch(0.75 0.13 85)"); box(ctx, -0.07, 1.02, 0, 0.03, 0.17, 0.17); } // brass ring
    ctx.metalness(0); ctx.color(OAK); beam(ctx, [0.1, 1.02, 0], [-0.55, 0.98, 0.05], 0.05); // haft
    if (lod <= 3) { ctx.color(BELL); ctx.emissive("oklch(0.5 0.18 300)"); crystal(ctx, 0.2, 0.8, 0.18, 0.05, 0.15, 0.2, 0.1, 5); ctx.emissive(null); }
  } else if (k === "door") {
    // an iron shaft door set in a dressed-stone frame (doorway faces -Z)
    ctx.color("oklch(0.55 0.04 50)"); ctx.roughness(0.95);
    box(ctx, -1.15, 1.45, 0, 0.6, 2.9, 0.8); box(ctx, 1.15, 1.45, 0, 0.6, 2.9, 0.8);
    box(ctx, 0, 3.15, 0, 2.9, 0.5, 0.9); // lintel
    if (lod <= 3) { box(ctx, 0, 3.5, 0.05, 2.2, 0.2, 0.7); for (let i = 0; i < 4; i++) { box(ctx, -1.15, 0.4 + i * 0.75, -0.42, 0.66, 0.05, 0.03); box(ctx, 1.15, 0.4 + i * 0.75, -0.42, 0.66, 0.05, 0.03); } }
    ctx.color(IRON); ctx.metalness(0.65); ctx.roughness(0.5);
    box(ctx, 0, 1.3, 0.05, 1.7, 2.6, 0.12); // leaf
    if (lod <= 3) {
      ctx.color(RUST);
      for (let i = 0; i < 3; i++) box(ctx, 0, 0.45 + i * 0.85, -0.04, 1.74, 0.12, 0.05); // straps
      for (let i = 0; i < 9; i++) cyl(ctx, -0.7 + (i % 3) * 0.7, 0.45 + Math.floor(i / 3) * 0.85, -0.07, 0.035, 0.03, 0.04, 6, "z");
      ctx.color(IRON); cyl(ctx, 0.55, 1.3, -0.06, 0.14, 0.14, 0.05, 12, "z"); // wheel lock
      ctx.color("oklch(0.7 0.14 300)"); ctx.emissive("oklch(0.45 0.18 300)"); box(ctx, 0, 2.95, -0.47, 0.5, 0.08, 0.02); ctx.emissive(null); // faint Accord seal
    }
    ctx.metalness(0);
  }
}
export function collider(ctx) {
  const k = ctx.params.kind || "crystal";
  if (k === "crystal") return { kind: "box", width: 1.8, height: 1.2, depth: 1.6 };
  if (k === "stake") return null;
  if (k === "hammer") return { kind: "box", width: 0.7, height: 0.8, depth: 0.5 };
  if (k === "brake") return { kind: "box", width: 1.2, height: 1.5, depth: 0.8 };
  if (k === "rig") { box(ctx, 1.6, 0.6, 0.6, 1.3, 1.2, 1.1); box(ctx, 0, 1.2, 0, 0.5, 2.4, 0.5); return; }
  if (k === "door") { box(ctx, -1.15, 1.45, 0, 0.6, 2.9, 0.8); box(ctx, 1.15, 1.45, 0, 0.6, 2.9, 0.8); box(ctx, 0, 1.3, 0.05, 1.7, 2.6, 0.12); box(ctx, 0, 3.15, 0, 2.9, 0.5, 0.9); return; }
}
