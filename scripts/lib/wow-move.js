// The WoW camera's movement half (mods/wow-camera-controls/lib/motion.js) for this game's hero.
// wowMotion keeps its own memo (autorun, free-look course); each script that reads it keeps its own memo:
// the same input gives every memo the same answer, so the gait and the stride never disagree.
import { wowMotion } from '../../mods/wow-camera-controls/lib/motion.js'

// A modal open: no walking, no look. Bags and the map stay free, like the classic game.
export function modalOpen(s) {
  if (!s) return false
  if (s.phase && s.phase !== 'playing') return true
  return !!(s.showQuestDialog || s.showDoorPanel || s.vendorOpen || s.gameMenuOpen || s.realmListOpen || s.vampireDialog || s.cursedItemDialog || s.flightMap)
}

// The mod's actions arrive under its name; a world binding of the same name also counts.
function mapped(input) {
  const pick = (bag) => {
    const b = bag ?? {}
    return {
      ...b,
      orbit: b.orbit || b['wow-camera-controls:orbit'],
      steer: b.steer || b['wow-camera-controls:steer'],
      autoRun: b.autoRun || b['wow-camera-controls:autoRun'],
      autoRunStop: b.autoRunStop || b['wow-camera-controls:autoRunStop'],
      release: b.release || b['wow-camera-controls:release'],
    }
  }
  return { axes: input.axes, held: pick(input.held), pressed: pick(input.pressed) }
}

export function wowMove(ctx, input, key) {
  const all = (ctx.session.wowMove ??= {})
  const memo = (all[key + ':' + ctx.self.id] ??= {})
  return wowMotion(mapped(input), memo, modalOpen(ctx.self.state))
}
