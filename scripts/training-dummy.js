// A straw-and-plank training dummy wearing the creator's mannequin: takes Vanguard hits, reels, falls, stands again.
import V from './lib/data/vanguard.yml'
const REEL = 'cdn/clip-vanguard-knockback-ad0aee61.glb'
const DOWN = 'cdn/clip-die.glb'
export function onSpawn(ctx) { if (ctx.self.state.hp == null) ctx.self.state.hp = V.dummyHp; ctx.self.state.maxHp = V.dummyHp }
export function update(ctx) {
  const s = ctx.self.state
  if (s.lastHitAt && s.lastHitAt !== s.seenHit) {
    s.seenHit = s.lastHitAt
    if (s.hp <= 0 && !s.down) {
      s.down = true
      ctx.self.anim.react = { clip: DOWN, weight: 1, loop: 'once', blendIn: 0.1 }
      ctx.after(V.dummyReset, 'standUp')
    } else if (!s.down) {
      ctx.self.anim.react = { clip: REEL, weight: 1, loop: 'once', speed: 1.4, blendIn: 0.05 }
      ctx.after(0.7, 'settle')
    }
  }
  ctx.sleep()
}
export function settle(ctx) { if (!ctx.self.state.down) ctx.self.anim.react = null }
export function standUp(ctx) { const s = ctx.self.state; s.hp = V.dummyHp; s.down = false; ctx.self.anim.react = null }
