// Every flying thing the class kits fire: its body, its trail, its cast flash and what it throws where it lands, per material.
// A new missile is one row here and a `missile:` name in a class yml.
const FIRE_TRAIL = `fx
pop core local n=1 size=.26 col=hdr(3.2,1.3,.3) a=.9 sz=$size*flick(18,.22) r=sprite(soft-disc,add)
pop heart local n=3 size=.16..0.22 col=hdr(3.6,1.9,.6) a=.7 sz=$size*flick(23,.3) rot=spin(1.5) r=sprite(flame-wisp,add)
pop flame rate=?mobile:45|90 on=sphere(.08) life=.18..0.4 v=sdir()*(.3..0.8) size=.16..0.3 acc=curl(.8)*1.4+buoy(1.4)+drag(2) sz=$size*(.6>1:.4>.12) col=hdr(5,2.6,.7)>.5:hdr(2.6,.9,.15)>hdr(.8,.18,.03) a=0>.1:1>.75:.8>0 rot=spin(.4) r=sprite(flame-wisp,add)
pop embers rate=?mobile:14|26 on=sphere(.1) life=.35..0.8 v=sdir()*(.6..1.6) size=.012..0.03 acc=curl(1)*.8+grav()*.3+drag(.8) col=hdr(5,2.6,.6)>hdr(1.5,.4,.05) a=(1>0)*flick(9,.4) r=sprite(ember,add,velocity,.02)
pop smoke on=@flame?.18 inh=p;v:$v*.3 life=.6..1.1 size=.12..0.2 acc=buoy(.7)+curl(.4)*.5+drag(1) sz=$size*(.8>2.6) col=<.2,.18,.17>><.12,.12,.13> a=0>.22:.25>0 rot=spin(.15) r=sprite(smoke-puff,alpha)
pop haze rate=?low:0|14 on=sphere(.06) life=.25..0.4 size=.4..0.6 sz=$size*(.6>1.3) col=<.004,.006,0> a=.8>0 r=sprite(soft-disc,distort)
pop glow local n=1 glo=flick(14,.25) r=light(<1,.55,.2>,$glo*6,8)`
const FIRE_HIT = `fx
pop flash burst=1 life=.18 size=1.8 col=hdr(4,1.8,.5) a=1>0 sz=$size*(.4>1.3) r=sprite(soft-disc,add)
pop ring burst=1 life=.35 size=.5 col=hdr(4,1.8,.4) a=.9>0 sz=$size*(1>4.5) r=sprite(soft-disc,add,axis,0,.4,axis=<0,1,0>)
pop flame burst=22..32 life=.35..0.8 v=sdir()*(1.5..4)+<%normal|0,1,0>*1.6 size=.3..0.55 acc=curl(.7)*1.5+buoy(2)+drag(3.2) sz=$size*(.6>1.4:.5>.2) col=hdr(5,2.4,.6)>.5:hdr(2.4,.8,.12)>hdr(.7,.15,.03) a=0>.08:1>.7:.8>0 rot=spin(.3) r=sprite(flame-wisp,add)
pop lick burst=6..9 on=disc(.6) life=.8..1.6 v=up(1.2..2) size=.18..0.32 acc=curl(.5)+buoy(1.5)+drag(2) sz=$size*(.5>1:1>.2) col=hdr(4,1.8,.4)>hdr(1,.25,.04) a=(0>.1:1>.7:.8>0)*flick(10,.3) rot=spin(.3) r=sprite(flame-wisp,add)
pop embers burst=26..40 life=.5..1.3 v=sdir()*(2.5..6)+<%normal|0,1,0>*2 size=.015..0.04 acc=curl(1)*.6+grav()*.6+drag(.7) col=hdr(5,2.6,.6)>hdr(1.4,.35,.05) a=(1>0)*flick(12,.4) floor=bounce(.2) r=sprite(ember,add,velocity,.025)
pop smoke on=@flame?.4 inh=p;v:$v*.3 life=1.2..2.4 size=.3..0.5 acc=buoy(.8)+curl(.35)*.6+drag(1) sz=$size*(.7>3) col=<.24,.21,.2>><.13,.13,.14> a=0>.32:.3>0 rot=spin(.12) r=sprite(smoke-puff,alpha)
pop haze burst=?low:0|6 life=.5..0.8 v=up(.8) size=.9..1.3 sz=$size*(.7>1.4) col=<.006,.008,0> a=.8>0 r=sprite(soft-disc,distort)
pop light burst=1 life=.6 gl=1>.2:.5>0 r=light(<1,.5,.18>,$gl*14,10)`
const FIRE_CAST = `fx
pop spark burst=8..12 life=.15..0.3 v=sdir()*(1..2.5) size=.02..0.035 col=hdr(5,2.4,.6) a=1>0 r=sprite(ember,add,velocity,.02)
pop puff burst=1 life=.2 size=.5 col=hdr(3,1.4,.4) a=.8>0 sz=$size*(.6>1.2) r=sprite(soft-disc,add)`
const FROST_TRAIL = `fx
pop core local n=1 size=.22 col=hdr(.7,1.4,2.6) a=.8 sz=$size*flick(9,.15) r=sprite(soft-disc,add)
pop glint local n=2 size=.14..0.2 col=hdr(.9,1.6,2.8) a=.55 rot=spin(.8) sz=$size*flick(6,.3) r=sprite(shard,add)
pop mist rate=?mobile:14|26 on=sphere(.08) life=.4..0.8 v=sdir()*(.15..0.4) size=.1..0.18 acc=curl(.4)*.4+grav()*.15+drag(2) sz=$size*(.6>1.5) col=<.6,.78,.95> a=0>.1:.22>0 rot=spin(.2) r=sprite(smoke-puff,alpha)
pop flakes rate=?mobile:12|24 on=sphere(.12) life=.5..1 v=sdir()*(.4..1) size=.025..0.055 spin=-6..6 acc=grav()*.25+drag(1) col=hdr(1.8,2.4,3.2) a=(1>0)*flick(7,.4) rot=$age*$spin r=sprite(snowflake,add)
pop glow local n=1 r=light(<.55,.75,1>,4,7)`
const FROST_HIT = `fx
pop flash burst=1 life=.2 size=1.5 col=hdr(1,1.8,3.2) a=1>0 sz=$size*(.4>1.3) r=sprite(soft-disc,add)
pop ring burst=1 life=.45 size=.4 col=hdr(1.6,2.4,3.6) a=.8>0 sz=$size*(1>4) r=sprite(soft-disc,add,axis,0,.4,axis=<0,1,0>)
pop shards burst=18..26 life=.5..1 v=<%normal|0,1,0>*(1.5..3.5)+sdir()*(1.5..3.2) size=.05..0.12 spin=-10..10 acc=grav()+drag(.6) col=<.82,.93,1> a=1>.7:1>0 sz=$size rot=$age*$spin floor=bounce(.3) r=sprite(shard,alpha,velocity,.02)
pop glints on=@shards?.5 life=.3..0.6 size=.04..0.08 col=hdr(2.4,3.2,4.8) a=(1>0)*flick(14,.6) r=sprite(mote,add)
pop mist burst=8..12 on=disc(.5) life=1.2..2.2 v=sdir()*(.2..0.6)+up(.1) size=.4..0.7 acc=curl(.3)*.4+grav()*.05+drag(1.4) sz=$size*(.6>2.2) col=<.82,.92,1> a=0>.38:.4>0 rot=spin(.1) r=sprite(smoke-puff,alpha)
pop flakes burst=20..30 on=sphere(.6) life=1..2 v=sdir()*(.2..0.6) size=.02..0.05 spin=-4..4 acc=grav()*.15+curl(.5)*.3+drag(1) col=hdr(1.8,2.4,3.2) a=(1>0)*flick(5,.4) rot=$age*$spin r=sprite(snowflake,add)
pop light burst=1 life=.5 gl=1>.2:.5>0 r=light(<.6,.8,1>,$gl*10,9)`
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
// what stays where a spell struck the ground: a smoulder for fire, a rime mist for frost (emitted for linger.life seconds)
const FIRE_LINGER = `fx
pop lick rate=?mobile:9|18 on=disc(.55) life=.5..1.1 v=up(.8..1.6) size=.14..0.28 acc=curl(.6)+buoy(1.4)+drag(2) sz=$size*(.5>1:1>.15) col=hdr(4.4,1.9,.42)>.5:hdr(2,.6,.09)>hdr(.5,.1,.02) a=(0>.12:1>.7:.8>0)*flick(9,.35) rot=spin(.35) r=sprite(flame-wisp,add)
pop coals n=?mobile:5|10 on=disc(.6) size=.05..0.11 tint=<2.6,.9,.22>..<1.2,.32,.07> col=$tint*flick(1.4,.45) sz=$size*flick(.7,.2) a=.9 r=sprite(soft-disc,add)
pop embers rate=?mobile:3|7 on=disc(.5) life=.8..1.6 v=up(1..2)+cone(25)*(.3..0.8) size=.012..0.03 acc=curl(.9)+drag(.6) col=hdr(5,2.4,.55)>hdr(1.3,.3,.04) a=(0>.1:1>.7:.9>0)*flick(11,.4) r=sprite(ember,add,velocity,.02)
pop smoke rate=?mobile:3|6 on=disc(.45) life=2..3.4 v=up(.5..1) size=.3..0.5 acc=buoy(.6)+curl(.35)*.6+wind()*.3+drag(.9) sz=$size*(.6>2.8) col=<.21,.19,.18>><.13,.13,.14> a=0>.25:.3>0 rot=spin(.1) r=sprite(smoke-puff,alpha)
pop glow n=1 at=point().c(.3) gl=fire()*(#lick/14)~ r=light(<1,.5,.18>,$gl*3.5,5)`
const FROST_LINGER = `fx
pop rime n=1 at=point().c(.03) size=1.6 col=hdr(.55,.85,1.4) a=.35*flick(.8,.2) r=sprite(soft-disc,add,axis,0,0,axis=<0,1,0>)
pop mist rate=?mobile:4|8 on=disc(.8) life=1.6..2.6 v=sdir()*(.1..0.25) size=.35..0.6 acc=grav()*.04+curl(.2)*.3+drag(1.2) sz=$size*(.6>2) col=<.82,.92,1> a=0>.3:.28>0 rot=spin(.08) r=sprite(smoke-puff,alpha)
pop glints rate=?mobile:6|12 on=disc(.7) life=.3..0.7 size=.025..0.05 col=hdr(2.4,3.2,4.8) a=(0>.5:1>0)*flick(13,.6) r=sprite(mote,add)
pop glow n=1 at=point().c(.3) r=light(<.55,.78,1>,1.4,4)`
const BOW = '/cdn/moodboard-painterly-fantasy/'
export { FIRE_LINGER }
export const MISSILES = {
  fire: { trail: FIRE_TRAIL, cast: FIRE_CAST, impact: { any: FIRE_HIT }, mark: { texture: '/cdn/value.ef4ee5e30d4a5eeb5e69ded461e8ca612b535ef6192f1e6b201f150316e8bce7.png', size: 1.8, life: 12 }, linger: { script: FIRE_LINGER, life: 3.5 }, sound: { any: BOW + 'sfx-firebolt-impact-burst.mp3' } },
  frost: { trail: FROST_TRAIL, cast: FROST_CAST, primitive: { kind: 'scripted', script: 'scripts/gen/arrow.js', params: { shape: 'shard' } }, impact: { any: FROST_HIT }, mark: { texture: '/cdn/value.1ff9e4aaaa88257d48fc6185ce88eb482840f27966be1bb2a90aa954e09cfd96.png', size: 2, life: 8 }, linger: { script: FROST_LINGER, life: 3 }, sound: { any: BOW + 'sfx-ice-shard-shatter.mp3' } },
  arrow: { trail: ARROW_TRAIL, primitive: { kind: 'scripted', script: 'scripts/gen/arrow.js', params: { shape: 'arrow' } }, sticks: 4, nose: 0.42,
    impact: { wood: ARROW_WOOD, fur: ARROW_FUR, earth: ARROW_EARTH }, sound: { wood: BOW + 'sfx-arrow-thunk-wood.mp3', fur: BOW + 'sfx-arrow-hit-flesh-thud.mp3', earth: BOW + 'sfx-arrow-thud-dirt.mp3' } },
}
export function impactFx(ctx, M, mat, at, normal) {
  const near = { audience: { nearby: at, radius: 50 } }
  if (!M.impact[mat] && mat !== 'earth') mat = mat === 'bark' ? 'wood' : 'fur' // flesh, bone, armor… take the flesh arrow
  const prog = M.impact[mat] ?? M.impact.any ?? M.impact.earth, snd = M.sound[mat] ?? M.sound.any ?? M.sound.earth
  if (prog) ctx.emit('fx', { position: at, script: prog, params: { normal: normal || { x: 0, y: 1, z: 0 } } }, near)
  const mark = M.mark && (!normal || normal.y > 0.6) ? M.mark : null // a ground strike leaves its mark
  if (mark && M.linger) ctx.emit('fx', { position: at, script: M.linger.script, lifetime: M.linger.life }, near)
  if (mark) ctx.emit('decal', { position: at, normal: normal || { x: 0, y: 1, z: 0 }, texture: mark.texture, size: mark.size * (0.85 + ctx.random() * 0.3), lifetime: mark.life, fade: 2 }, near)
  if (snd) ctx.emit('playSound', { clip: snd, position: at, volume: 0.55, pitch: 0.92 + ctx.random() * 0.16 }, near)
}
