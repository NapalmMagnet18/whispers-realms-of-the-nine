// Awakening handbook, the god-mode tab. The rail column is a launcher; the handbook opens as a half-screen sheet
// over the game (left half, clear of Spawn's rail): a sidebar of pages, each page a large title, a real
// before/after picture (plain Spawn vs Awakening, lib/shots.js), its features as an inset grouped list with an
// Ask Savi button per feature, and on Weather and Overview the optional world switches. Built to Apple's HIG:
// one system font, a clear hierarchy, 44 px targets, system colours, translucent material, plain words.
// Taps go to input.js (awOp). ctx may be null on the first render. Data: lib/guide.js; pictures: lib/shots.js.
import { PAGES, SWITCHES } from './lib/guide.js'
import { SHOTS } from './lib/shots.js'

const FONT = '-apple-system,BlinkMacSystemFont,&quot;SF Pro Text&quot;,&quot;SF Pro&quot;,&quot;Helvetica Neue&quot;,Inter,sans-serif'
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const A = (o) => esc(`sendAction('awOp',${JSON.stringify(o)})`)

const CSS = `<style>
.aw{--bg:rgba(28,28,30,.86);--bg2:rgba(44,44,46,.72);--sep:rgba(84,84,88,.55);--l1:rgba(255,255,255,.96);--l2:rgba(235,235,245,.62);--l3:rgba(235,235,245,.34);--blue:#0a84ff;--green:#30d158;font-family:${FONT};color:var(--l1);-webkit-font-smoothing:antialiased;letter-spacing:-.01em}
.aw *{box-sizing:border-box}
.aw button{font:inherit;color:inherit;border:0;background:none;cursor:pointer}
.aw-side a,.aw-side button{display:flex;align-items:center;gap:10px;width:100%;min-height:36px;padding:6px 10px;border-radius:8px;font-size:14px;text-align:left}
.aw-side button:hover{background:rgba(255,255,255,.06)}
.aw-side button.on{background:var(--blue);color:#fff}
.aw-tile{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;font-size:14px;flex:none}
.aw-group{background:var(--bg2);border-radius:12px;overflow:hidden}
.aw-row{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;position:relative}
.aw-row+.aw-row::before{content:'';position:absolute;top:0;left:52px;right:0;height:.5px;background:var(--sep)}
.aw-cap{font-size:12px;font-weight:400;text-transform:uppercase;letter-spacing:.02em;color:var(--l2);margin:22px 16px 7px}
.aw-foot{font-size:12px;color:var(--l2);margin:7px 16px 0;line-height:1.4}
.aw-ask{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:0 12px;border-radius:999px;background:rgba(10,132,255,.18);color:#409cff !important;font-size:13px;font-weight:600;white-space:nowrap}
.aw-ask:hover{background:rgba(10,132,255,.28)}
.aw-sw{width:51px;height:31px;border-radius:999px;background:rgba(120,120,128,.32);position:relative;flex:none;transition:background .2s}
.aw-sw::after{content:'';position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.15),0 3px 1px rgba(0,0,0,.06);transition:transform .2s}
.aw-sw.on{background:var(--green)}.aw-sw.on::after{transform:translateX(20px)}
.aw-sw[disabled]{opacity:.4;cursor:default}
.aw-seg{display:inline-flex;background:rgba(118,118,128,.24);border-radius:9px;padding:2px}
.aw-seg label{min-width:96px;height:28px;display:grid;place-items:center;font-size:13px;font-weight:500;border-radius:7px;cursor:pointer;color:var(--l1)}
.aw-cmp input{display:none}
.aw-cmp #awv-both:checked~.aw-seg label[for=awv-both],.aw-cmp #awv-base:checked~.aw-seg label[for=awv-base],.aw-cmp #awv-aw:checked~.aw-seg label[for=awv-aw]{background:#636366;box-shadow:0 3px 8px rgba(0,0,0,.12)}
.aw-cmp .aw-pics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.aw-cmp #awv-base:checked~.aw-pics{grid-template-columns:1fr}.aw-cmp #awv-base:checked~.aw-pics .aw-p-aw{display:none}
.aw-cmp #awv-aw:checked~.aw-pics{grid-template-columns:1fr}.aw-cmp #awv-aw:checked~.aw-pics .aw-p-base{display:none}
.aw-pic{position:relative;border-radius:12px;overflow:hidden;background:#000;aspect-ratio:16/9}
.aw-pic img{width:100%;height:100%;object-fit:cover;display:block}
.aw-pic span{position:absolute;left:8px;top:8px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);color:#fff}
.aw-pill{font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;flex:none}
.aw-scroll{overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent}
@keyframes awin{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
</style>`

function status(ctx) {
  const w = ctx?.world; if (!w) return {}
  const places = Object.values(w.places ?? {})
  const has = (s) => String(s ?? '').includes('awakening')
  const marks = places.flatMap((p) => Object.values(p?.terrain?.marks ?? {}))
  const sw = w.state?.awakening ?? {}
  const lake = marks.some((m) => m?.kind === 'lake') || sw.squall != null
  const river = marks.some((m) => m?.kind === 'river')
  return {
    lighting: has(w.lighting), look: places.some((p) => has(p?.atmosphere?.look?.script)),
    lake: lake || null, river: river || null, meet: (lake && river) || null,
    squall: sw.squall ?? null, stormWaves: sw.stormWaves ?? null, storm: sw.storm ?? null,
    weather: places.map((p) => p?.state?.weather).find(Boolean),
  }
}
const pill = (v) => v === true ? '<span class="aw-pill" style="background:rgba(48,209,88,.16);color:#30d158">In use</span>'
  : v === false ? '<span class="aw-pill" style="background:rgba(118,118,128,.2);color:var(--l2)">Off</span>' : ''

function switches(ctx, st, page) {
  const live = ctx?.world?.state?.awakening
  if (!live || Object.values(live).every((v) => v == null)) return `<div class="aw-cap">World settings</div><div class="aw-group"><div class="aw-row" style="color:var(--l2);font-size:14px">Add an Awakening lake to this world to use its weather switches.</div></div>`
  return `<div class="aw-cap">World settings</div><div class="aw-group">${SWITCHES.map((s) => {
    const on = live[s.key] === true, dis = (s.needs && live[s.needs] !== true) || live[s.key] == null
    return `<div class="aw-row" style="align-items:center"><div style="flex:1;min-width:0"><div style="font-size:15px">${esc(s.label)}</div><div style="font-size:12.5px;color:var(--l2);margin-top:1px">${esc(s.sub)}</div></div>
      <button role="switch" aria-checked="${on}" aria-label="${esc(s.label)}" class="aw-sw${on ? ' on' : ''}" ${dis ? 'disabled' : `onclick="${A({ op: 'set', key: s.key, on: !on })}"`}></button></div>`
  }).join('')}</div><div class="aw-foot">Each change is saved as a version, so “undo that” to Savi puts it back. Storm waves, pushing and thunderstorms need squalls on.</div>`
}

function compare(id) {
  const s = SHOTS[id] ?? (id === 'overview' ? SHOTS.water : null) // the overview leads with the lake
  if (!s?.base || !s?.awakening) return `<div class="aw-pic" style="display:grid;place-items:center;color:var(--l3);font-size:13px;margin-top:16px">Comparison pictures are being taken</div>`
  return `<div class="aw-cmp" style="margin-top:18px">
    <input type="radio" name="awv-${id}" id="awv-both" checked><input type="radio" name="awv-${id}" id="awv-base"><input type="radio" name="awv-${id}" id="awv-aw">
    <div class="aw-seg" role="radiogroup" aria-label="Compare"><label for="awv-both">Side by side</label><label for="awv-base">Base Spawn</label><label for="awv-aw">Awakening</label></div>
    <div class="aw-pics"><div class="aw-pic aw-p-base"><img src="${esc(s.base)}" alt="Base Spawn"><span>Base Spawn</span></div><div class="aw-pic aw-p-aw"><img src="${esc(s.awakening)}" alt="Awakening"><span>Awakening</span></div></div>
    ${s.note ? `<div class="aw-foot" style="margin-left:4px">${esc(s.note)}</div>` : ''}
  </div>`
}

function features(pg, st) {
  return `<div class="aw-cap">Features</div><div class="aw-group">${pg.features.map(([icon, name, what, ask, key]) => `
    <div class="aw-row"><div class="aw-tile" style="background:${pg.tint}33">${icon}</div>
      <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px"><div style="font-size:15px;font-weight:600">${esc(name)}</div>${pill(key ? st[key] : null)}</div>
        <div style="font-size:13.5px;color:var(--l2);line-height:1.4;margin-top:2px">${esc(what)}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:9px"><button class="aw-ask" onclick="${A({ op: 'ask', page: pg.id, text: ask })}">✦ Ask Savi</button><span style="font-size:12.5px;color:var(--l3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">“${esc(ask)}”</span></div></div></div>`).join('')}</div>`
}

function overview(ctx, st) {
  const all = PAGES.flatMap((p) => p.features ?? [])
  const used = all.filter((f) => f[4] && st[f[4]] === true).length
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px">
      ${[[used, 'features in use here'], [all.length, 'features in the mod'], [st.weather ? esc(st.weather) : '—', 'weather right now']].map(([n, l]) => `<div class="aw-group" style="padding:12px 14px"><div style="font-size:22px;font-weight:700">${n}</div><div style="font-size:12px;color:var(--l2)">${l}</div></div>`).join('')}
    </div>
    <div class="aw-cap">Pages</div><div class="aw-group">${PAGES.slice(1).map((p) => `<button class="aw-row" style="width:100%;text-align:left;align-items:center" onclick="${A({ op: 'page', page: p.id })}"><div class="aw-tile" style="background:${p.tint}33">${p.icon}</div><div style="flex:1;min-width:0"><div style="font-size:15px">${esc(p.title)}</div><div style="font-size:12.5px;color:var(--l2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.blurb)}</div></div><span style="color:var(--l3);font-size:17px">›</span></button>`).join('')}</div>
    ${switches(ctx, st)}
    <div class="aw-cap">How to use it</div><div class="aw-group"><div class="aw-row" style="font-size:13.5px;color:var(--l2);line-height:1.45">Open a page, look at the difference, then press <b style="color:var(--l1)">Ask Savi</b> on any feature: the line goes straight to her and she wires and tunes it for your world. Slower machines get lighter grass, painted clouds and simpler water; resolution is never lowered.</div></div>`
}

function sheet(ctx, player) {
  const st = status(ctx), id = player.state?.awPage ?? 'overview', pg = PAGES.find((p) => p.id === id) ?? PAGES[0]
  const fl = player.state?.awFlash, flash = fl && ctx && ctx.now() - fl.at < 4000 ? fl.t : ''
  return `<div class="aw" data-modal style="position:fixed;left:16px;top:16px;bottom:16px;width:min(calc(50vw - 16px),calc(100vw - var(--spawn-chrome-reservation-right-inset,50px) - 48px));min-width:min(620px,calc(100vw - 32px));z-index:60;display:flex;border-radius:16px;overflow:hidden;background:var(--bg);backdrop-filter:blur(40px) saturate(1.6);-webkit-backdrop-filter:blur(40px) saturate(1.6);box-shadow:0 24px 60px rgba(0,0,0,.5),inset 0 0 0 .5px rgba(255,255,255,.12);pointer-events:auto">
    <nav class="aw-side aw-scroll" aria-label="Awakening pages" style="width:200px;flex:none;padding:14px 10px;background:rgba(0,0,0,.18);border-right:.5px solid var(--sep)">
      <div style="display:flex;align-items:center;gap:8px;padding:2px 8px 12px"><span style="font-size:20px">🌅</span><div><div style="font-size:15px;font-weight:700">Awakening</div><div style="font-size:11.5px;color:var(--l2)">Handbook</div></div></div>
      ${PAGES.map((p) => `<button class="${p.id === pg.id ? 'on' : ''}" aria-current="${p.id === pg.id}" onclick="${A({ op: 'page', page: p.id })}"><span class="aw-tile" style="background:${p.id === pg.id ? 'rgba(255,255,255,.22)' : p.tint + '33'}">${p.icon}</span>${esc(p.title)}</button>`).join('')}
    </nav>
    <main class="aw-scroll" style="flex:1;min-width:0;padding:16px 24px 28px">
      <div style="display:flex;justify-content:flex-end;position:sticky;top:0;z-index:2"><button aria-label="Close" onclick="${A({ op: 'close' })}" style="width:30px;height:30px;border-radius:50%;background:rgba(118,118,128,.28);display:grid;place-items:center;font-size:14px;color:var(--l2)">✕</button></div>
      <div id="awpg-${pg.id}" style="animation:awin .18s ease-out">
        <h1 style="font-size:34px;font-weight:700;letter-spacing:.01em;margin:-6px 0 6px">${esc(pg.title)}</h1>
        <p style="font-size:15px;color:var(--l2);line-height:1.45;margin:0;max-width:62ch">${esc(pg.blurb)}</p>
        ${compare(pg.id)}
        ${pg.id === 'overview' ? overview(ctx, st) : features(pg, st) + (pg.id === 'weather' ? switches(ctx, st) : '')}
      </div>
    </main>
    ${flash ? `<div id="awfl-${fl.at}" role="status" style="position:absolute;left:50%;bottom:20px;transform:translateX(-50%);padding:10px 16px;border-radius:999px;background:rgba(58,58,60,.95);font-size:13.5px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:awin .2s ease-out">${esc(flash)}</div>` : ''}
  </div>`
}

export default function panel(ctx, player) {
  if (player && !player.isEditor) return ''
  const st = status(ctx), open = !!player?.state?.awOpen
  const used = PAGES.flatMap((p) => p.features ?? []).filter((f) => f[4] && st[f[4]] === true).length
  const launcher = `<div class="aw" style="padding:14px">
    <div style="display:flex;align-items:center;gap:10px"><span class="aw-tile" style="background:#ff9f0a33;width:34px;height:34px;font-size:18px;border-radius:9px">🌅</span>
      <div style="flex:1"><div style="font-size:15px;font-weight:700">Awakening</div><div style="font-size:12px;color:var(--l2)">${ctx ? `${used} features in use here` : 'High-fidelity worlds'}</div></div></div>
    <p style="font-size:13px;color:var(--l2);line-height:1.4;margin:10px 0 12px">Every feature with a real before-and-after, its settings, and one press to ask Savi for it.</p>
    <button onclick="${A({ op: open ? 'close' : 'open' })}" style="width:100%;height:36px;border-radius:9px;background:var(--blue);color:#fff;font-size:14px;font-weight:600">${open ? 'Close handbook' : 'Open handbook'}</button>
  </div>`
  return CSS + launcher + (open && player ? sheet(ctx, player) : '')
}
