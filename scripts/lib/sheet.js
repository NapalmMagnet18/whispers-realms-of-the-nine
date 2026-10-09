// The character sheet's real numbers: the same multipliers scripts/lib/kit.js power(), the class cores' haste and
// scripts/quest-player.js health use, read from state alone so ui.js can draw them.
import LV from './data/levels.yml'
import TR from './data/trainers.yml'
import { levelInfo } from './leveling.js'
import { talentFx, picks, classKey, TREES } from './talents.js'
export function sheetOf(s) {
  const lv = s?.level ?? 1, tf = talentFx(s)
  let gear = 0, stamina = 0, worn = 0
  for (const it of Object.values(s?.equipment || {})) { if (!it) continue; worn++; gear += Number(it?.stats?.power) || 0; stamina += Number(it?.stats?.stamina) || 0 }
  const lvM = 1 + (LV.damagePerLevel ?? 0.08) * Math.max(0, lv - 1), gearM = 1 + gear / 100, trM = 1 + (TR.bonus ?? 0.06) * (s?.trained ?? 0), talM = 1 + tf.power / 100
  const cls = classKey(s?.className), bySpec = {}
  for (const { key } of picks(s)) { const sp = key.split(':')[0]; bySpec[sp] = (bySpec[sp] || 0) + 1 }
  const specs = TREES[cls].map((sp) => ({ name: sp.name, color: sp.color, icon: sp.icon, n: bySpec[sp.id] || 0 }))
  const main = specs.slice().sort((a, b) => b.n - a.n)[0]
  return { level: lv, xp: levelInfo(s?.xp || 0), damage: lvM * gearM * trM * talM, parts: { level: lvM, gear: gearM, trained: trM, talents: talM }, gear, stamina, worn, trained: s?.trained ?? 0, haste: Math.min(50, tf.haste), healthPct: tf.health, specs, main: main && main.n ? main : null }
}
