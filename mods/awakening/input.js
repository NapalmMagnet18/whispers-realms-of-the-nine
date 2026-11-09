// Awakening guide's hands: the handbook's taps (awOp) land here, on the editor's body or the god seat it drives.
// ops: open / close / page (the handbook's own state on the editor), set (an optional world switch, saved as a
// version), ask (one line handed to Savi). world.state.awakening mirrors the switches so the panel reads them.
import { SWITCHES } from './lib/guide.js'

function editor(ctx) {
  const d = ctx.self.controller && ctx.getObject(ctx.self.controller)
  if (d?.isEditor) return d
  return ctx.self.isEditor ? ctx.self : null
}
const lakes = (ctx) => ctx.query({ tags: ['awakening-water'], select: 'ids' }).map((id) => ctx.getObject(id)).filter((o) => o?.material?.params)
const look = (ctx) => (String(ctx.place.atmosphere?.look?.script ?? '').includes('awakening') ? ctx.place.atmosphere.look : null)

function read(ctx) {
  const L = lakes(ctx)[0]?.material?.params, k = look(ctx)
  const v = {}
  for (const s of SWITCHES) v[s.key] = s.on === 'look' ? (k ? Number(k.params?.storm ?? 0) > 0 : null) : L ? Number(L[s.key] ?? 0) > 0 : null
  return v
}
function mirror(ctx) { ctx.world.state.awakening = { ...read(ctx), at: ctx.now() } }

function set(ctx, p, key, on) {
  const sw = SWITCHES.find((s) => s.key === key); if (!sw) return
  const v = on ? 1 : 0
  ctx.commit(`Awakening: ${sw.label.toLowerCase()} ${on ? 'on' : 'off'}`, () => {
    if (sw.on === 'look') { const k = look(ctx); if (k) k.params = { ...(k.params ?? {}), storm: v }; for (const o of lakes(ctx)) o.material.params.stormy = v } // the lake reads the weather
    else for (const o of lakes(ctx)) o.material.params[key] = v
    if (key === 'squall' && !on) { // the switches that hang on squalls go quiet with them
      for (const o of lakes(ctx)) { o.material.params.stormWaves = 0; o.material.params.squallPush = 0; o.material.params.stormy = 0 }
      const k = look(ctx); if (k && Number(k.params?.storm) > 0) k.params = { ...k.params, storm: 0 }
    }
  })
  mirror(ctx)
  p.state.awFlash = { t: `${sw.label} ${on ? 'on' : 'off'} · saved as a version`, at: ctx.now() }
}

export function onInput(ctx, input) {
  const k = input.pressed?.awOp ? 'awOp' : input.pressed?.['awakening:awOp'] ? 'awakening:awOp' : null
  if (!k) return
  const p = editor(ctx); if (!p) return
  const d = input.actionData?.[k] ?? {}
  if (d.op === 'open') { p.state.awOpen = true; mirror(ctx) }
  else if (d.op === 'close') p.state.awOpen = false
  else if (d.op === 'page') p.state.awPage = String(d.page ?? 'overview').slice(0, 24)
  else if (d.op === 'set') set(ctx, p, d.key, !!d.on)
  else if (d.op === 'ask') {
    const t = String(d.text ?? '').slice(0, 400).trim(); if (!t) return
    try { ctx.notifyDm(`AWAKENING ask from ${p.displayName} (Ask Savi in the Awakening handbook, ${d.page ?? 'overview'} page): ${t}`, { wake: true }) } catch (e) {}
    p.state.awFlash = { t: 'Sent to Savi. She\u2019ll answer in chat.', at: ctx.now() }
  }
  const seat = p.controlling
  if (seat && seat.id !== p.id) for (const x of ['awOpen', 'awPage', 'awFlash']) seat.state[x] = p.state[x] ?? null
}

export function onSpawn(ctx) { if (editor(ctx)) try { mirror(ctx) } catch (e) {} }
