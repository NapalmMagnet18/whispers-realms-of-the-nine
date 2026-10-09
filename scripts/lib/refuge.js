// Waters no beast will enter: a hero standing here is lost to wolves and raiders (wolves-core.js, scavengers-core.js).
export const REFUGES = [{ name: "Emberwell Spring", x: 820, z: -60, r: 3.2 }];
export function inRefuge(fp) {
  if (!fp) return false;
  for (const g of REFUGES) { const dx = fp.x - g.x, dz = fp.z - g.z; if (dx * dx + dz * dz < g.r * g.r) return true; }
  return false;
}
