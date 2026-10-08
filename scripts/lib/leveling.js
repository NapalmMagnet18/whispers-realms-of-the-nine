// Total XP → level. One table, built once from scripts/lib/data/levels.yml.
import L from './data/levels.yml';
const TOTAL = [0, 0]; // TOTAL[n] = xp needed to stand at level n
(() => {
  const a = Object.entries(L.anchors).map(([k, v]) => [Number(k), v]).sort((x, y) => x[0] - y[0]);
  for (let i = 0; i < a.length - 1; i++) {
    const [l0, x0] = a[i], [l1, x1] = a[i + 1];
    for (let n = l0; n <= l1; n++) TOTAL[n] = Math.round(x0 + (x1 - x0) * (n - l0) / (l1 - l0));
  }
  let last = a[a.length - 1][0], step = TOTAL[last] - TOTAL[last - 1];
  for (let n = last + 1; n <= L.cap; n++) { step = Math.round(step * L.growth); TOTAL[n] = TOTAL[n - 1] + step; }
})();
export function levelInfo(xp) {
  xp = Math.max(0, xp | 0);
  let lv = 1; while (lv < L.cap && xp >= TOTAL[lv + 1]) lv++;
  if (lv >= L.cap) return { level: L.cap, into: 0, need: 0, capped: true };
  return { level: lv, into: xp - TOTAL[lv], need: TOTAL[lv + 1] - TOTAL[lv] };
}
export function statsFor(level) {
  return { maxHealth: L.base.health + (level - 1) * L.perLevel.health, maxMana: L.base.mana + (level - 1) * L.perLevel.mana };
}
export const LEVEL_TOTALS = TOTAL;
