// Every flying thing the class kits fire: its body, its trail, its cast flash and what it throws where it lands, per material.
// A new missile is one row here and a `missile:` name in a class yml.
const FIRE_TRAIL = `fx
pop core local n=1 size=.34 col=hdr(5,2.4,.7) a=.95 sz=$size*flick(16,.2) r=sprite(soft-disc,add)
pop flame rate=?mobile:40|75 on=sphere(.07) life=.18..0.35 v=sdir()*(.3..0.7) size=.16..0.28 acc=buoy(1.2)+drag(2) sz=$size*(1>.15) col=hdr(4.5,2.1,.5)>hdr(1.4,.35,.06) a=1>.8:.8>0 rot=spin(.4) r=sprite(flame-wisp,add)
pop embers rate=18 on=sphere(.08) life=.3..0.6 v=sdir()*(.6..1.4) size=.015..0.035 acc=grav()*.3+drag(.8) col=hdr(5,2.6,.6)>hdr(1.5,.4,.05) a=1>0 r=sprite(ember,add,velocity,.02)
pop smoke on=@flame?.15 life=.5..0.9 size=.12..0.2 acc=buoy(.6)+drag(1) sz=$size*(.8>2) col=<.2,.18,.17> a=0>.2:.25>0 r=sprite(smoke-puff,alpha)
pop glow local n=1 r=light(<1,.55,.2>,4,7)`
const FIRE_HIT = `fx
pop flash burst=1 life=.2 size=1.6 col=hdr(6,3.2,1) a=1>0 sz=$size*(.5>1.3) r=sprite(soft-disc,add)
pop flame burst=14..20 life=.3..0.6 v=sdir()*(1.5..3.5)+<%normal|0,1,0>*1.2 size=.25..0.45 acc=buoy(1.5)+drag(3) sz=$size*(.6>1.3:.5>.2) col=hdr(4.5,2,.5)>hdr(1.2,.3,.05) a=1>0 rot=spin(.3) r=sprite(flame-wisp,add)
pop embers burst=16..24 life=.4..0.9 v=sdir()*(2.5..5)+<%normal|0,1,0>*1.5 size=.02..0.04 acc=grav()*.6+drag(.8) col=hdr(5,2.6,.6)>hdr(1.4,.35,.05) a=1>0 r=sprite(ember,add,velocity,.025)
pop smoke on=@flame?.35 life=.8..1.4 size=.25..0.4 acc=buoy(.8)+drag(1) sz=$size*(.7>2.2) col=<.22,.2,.19> a=0>.3:.35>0 r=sprite(smoke-puff,alpha)
pop light burst=1 life=.35 gl=1>0 r=light(<1,.5,.18>,$gl*8,8)`
const FIRE_CAST = `fx
pop spark burst=8..12 life=.15..0.3 v=sdir()*(1..2.5) size=.02..0.035 col=hdr(5,2.4,.6) a=1>0 r=sprite(ember,add,velocity,.02)
pop puff burst=1 life=.2 size=.5 col=hdr(3,1.4,.4) a=.8>0 sz=$size*(.6>1.2) r=sprite(soft-disc,add)`
const FROST_TRAIL = `fx
pop core local n=1 size=.28 col=hdr(1.6,2.6,4) a=.8 sz=$size*flick(9,.15) r=sprite(soft-disc,add)
pop mist rate=?mobile:28|50 on=sphere(.07) life=.35..0.7 v=sdir()*(.15..0.4) size=.14..0.24 acc=drag(2) sz=$size*(.6>1.4) col=<.75,.88,1> a=0>.1:.45>0 rot=spin(.2) r=sprite(smoke-puff,alpha)
pop flakes rate=16 on=sphere(.1) life=.4..0.8 v=sdir()*(.4..1) size=.03..0.06 spin=-6..6 acc=grav()*.2+drag(1) col=hdr(1.8,2.4,3.2) a=1>0 rot=$age*$spin r=sprite(snowflake,add)
pop glow local n=1 r=light(<.55,.75,1>,3,6)`
const FROST_HIT = `fx
pop flash burst=1 life=.18 size=1.3 col=hdr(2,3,4.5) a=1>0 sz=$size*(.5>1.2) r=sprite(soft-disc,add)
pop shards burst=12..18 life=.4..0.8 v=<%normal|0,1,0>*(1.5..3)+sdir()*(1.5..3) size=.05..0.1 spin=-10..10 acc=grav()+drag(.6) col=<.78,.9,1> a=1>.7:1>0 sz=$size rot=$age*$spin floor=bounce(.3) r=sprite(shard,alpha,velocity,.02)
pop mist burst=5..7 life=.8..1.3 v=sdir()*(.3..0.7) size=.3..0.5 acc=drag(1.5) sz=$size*(.7>1.8) col=<.8,.9,1> a=0>.35:.4>0 r=sprite(smoke-puff,alpha)
pop light burst=1 life=.3 gl=1>0 r=light(<.6,.8,1>,$gl*6,7)`
const FROST_CAST = `fx
pop flakes burst=10..14 life=.3..0.5 v=sdir()*(.8..1.8) size=.03..0.05 acc=drag(2) col=hdr(1.8,2.4,3.2) a=1>0 r=sprite(snowflake,add)`
const ARROW_TRAIL = `fx
pop streak rate=?mobile:20|36 on=point() life=.1..0.18 size=.025 col=hdr(1.4,1.25,1) a=.5>0 r=sprite(soft-disc,add)`
const ARROW_WOOD = `fx
pop chips burst=8..12 life=.5..0.9 v=<%normal|0,1,0>*(2..3.5)+sdir()*(.6..1.2) size=.04..0.08 spin=-8..8 acc=grav()+drag(.8) col=<.62,.47,.3> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(chip,alpha,velocity,.02)
pop straw burst=6..10 life=.6..1.1 v=<%normal|0,1,0>*(1.5..3)+sdir()*(.5..1) size=.06..0.12 acc=grav()*.7+drag(1.4) col=<.86,.76,.45> a=1>.7:1>0 sz=$size floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=2..3 life=.5..0.8 v=up(.4)+sdir()*.3 size=.15..0.25 acc=drag(1.5) col=<.7,.62,.5> a=0>.3:.3>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)`
const ARROW_FUR = `fx
pop fur burst=10..16 life=.6..1.1 v=<%normal|0,1,0>*(1.5..3)+sdir()*(.5..1.2) size=.05..0.1 spin=-6..6 acc=grav()*.5+drag(1.8) col=<.42,.36,.3> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=2 life=.4..0.7 v=up(.3)+sdir()*.3 size=.15..0.22 acc=drag(1.5) col=<.55,.5,.45> a=0>.25:.3>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)`
const ARROW_EARTH = `fx
pop grit burst=8..12 life=.4..0.8 v=<%normal|0,1,0>*(1.5..3)+sdir()*(.5..1) size=.03..0.06 acc=grav()+drag(.6) col=<.45,.38,.3> a=1>0 sz=$size floor=stick r=sprite(grain,alpha)
pop dust burst=3..4 life=.6..1 v=up(.5)+sdir()*.4 size=.18..0.3 acc=buoy(.2)+drag(1.4) col=<.62,.55,.45> a=0>.3:.3>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)`
const BOW = '/cdn/moodboard-painterly-fantasy/'
export const MISSILES = {
  fire: { trail: FIRE_TRAIL, cast: FIRE_CAST, impact: { any: FIRE_HIT }, sound: { any: BOW + 'sfx-firebolt-impact-burst.mp3' } },
  frost: { trail: FROST_TRAIL, cast: FROST_CAST, primitive: { kind: 'scripted', script: 'scripts/gen/arrow.js', params: { shape: 'shard' } }, impact: { any: FROST_HIT }, sound: { any: BOW + 'sfx-ice-shard-shatter.mp3' } },
  arrow: { trail: ARROW_TRAIL, primitive: { kind: 'scripted', script: 'scripts/gen/arrow.js', params: { shape: 'arrow' } }, sticks: 4, nose: 0.42,
    impact: { wood: ARROW_WOOD, fur: ARROW_FUR, earth: ARROW_EARTH }, sound: { wood: BOW + 'sfx-arrow-thunk-wood.mp3', fur: BOW + 'sfx-arrow-hit-flesh-thud.mp3', earth: BOW + 'sfx-arrow-thud-dirt.mp3' } },
}
export function impactFx(ctx, M, mat, at, normal) {
  const near = { audience: { nearby: at, radius: 50 } }
  if (!M.impact[mat] && mat !== 'earth') mat = mat === 'bark' ? 'wood' : 'fur' // flesh, bone, armor… take the flesh arrow
  const prog = M.impact[mat] ?? M.impact.any ?? M.impact.earth, snd = M.sound[mat] ?? M.sound.any ?? M.sound.earth
  if (prog) ctx.emit('fx', { position: at, script: prog, params: { normal: normal || { x: 0, y: 1, z: 0 } } }, near)
  if (snd) ctx.emit('playSound', { clip: snd, position: at, volume: 0.55, pitch: 0.92 + ctx.random() * 0.16 }, near)
}
