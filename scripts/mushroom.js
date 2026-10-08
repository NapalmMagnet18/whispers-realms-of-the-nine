// A forest-floor mushroom: a pale stem and a domed cap that wears one painted cap from the creator's
// mushroom sheet (/cdn/mushrooms-u566plguh.webp, sampled by scripts/mushroom-look.js). params.cap picks the cap:
// "orange" | "purple" | "speckle" | "gills". A dozen triangles; the forest layer and the Elderveil bed scatter it.
const CAPS = { orange: [0.115, 0.64, 0.075], purple: [0.47, 0.2, 0.12], speckle: [0.125, 0.85, 0.06], gills: [0.5, 0.5, 0.12] };
const STEM = [0.12, 0.22, 0.06];
export function geometry(ctx) {
  const { cap = "orange", h = 0.16, r = 0.09 } = ctx.params || {};
  const C = CAPS[cap] || CAPS.orange, n = ctx.lod > 2 ? 5 : 7, uvs = [];
  const sr = r * 0.28, top = h, ring = (i, rr) => [Math.cos((i / n) * 6.2832) * rr, Math.sin((i / n) * 6.2832) * rr];
  ctx.smooth();
  for (let i = 0; i < n; i++) { // stem
    const a = ring(i, sr), b = ring(i + 1, sr);
    ctx.quad(a[0], 0, a[1], b[0], 0, b[1], b[0] * 0.8, top, b[1] * 0.8, a[0] * 0.8, top, a[1] * 0.8);
    uvs.push(STEM[0] - 0.03, STEM[1], STEM[0] + 0.03, STEM[1], STEM[0] + 0.03, STEM[1] + 0.08, STEM[0] - 0.03, STEM[1] + 0.08);
  }
  const rimY = top - r * 0.15, midY = top + r * 0.35, peakY = top + r * 0.6;
  for (let i = 0; i < n; i++) { // cap: rim ring → mid ring → peak, uv a disc on the sheet
    const a = ring(i, r), b = ring(i + 1, r), am = ring(i, r * 0.62), bm = ring(i + 1, r * 0.62);
    const ua = ring(i, C[2]), ub = ring(i + 1, C[2]), uam = ring(i, C[2] * 0.6), ubm = ring(i + 1, C[2] * 0.6);
    ctx.quad(a[0], rimY, a[1], am[0], midY, am[1], bm[0], midY, bm[1], b[0], rimY, b[1]);
    uvs.push(C[0] + ua[0], C[1] + ua[1], C[0] + uam[0], C[1] + uam[1], C[0] + ubm[0], C[1] + ubm[1], C[0] + ub[0], C[1] + ub[1]);
    ctx.tri(am[0], midY, am[1], 0, peakY, 0, bm[0], midY, bm[1]);
    uvs.push(C[0] + uam[0], C[1] + uam[1], C[0], C[1], C[0] + ubm[0], C[1] + ubm[1]);
  }
  return { uvs };
}
