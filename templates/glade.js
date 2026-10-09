// The old magic of the woods: forest wisps that drift between the trunks, fireflies that blink low over
// the ferns, pollen motes hanging in the light, and one soft glow from the wisps themselves.
// A placement sets params.hue (an [r,g,b] in hdr) for the region's colour and params.spread (metres).
const GLADE = `fx
pop wisp n=?low:3|6 on=disc(%spread|10).c(1.2) life=7..12 v=sdir()*(.15..0.3) size=.16..0.26 acc=curl(.12)*.9+noise(.3)*.25+drag(.6)+attract(.02)
  sz=$size*flick(1.6,.35) col=<%r|0.55,%g|1.6,%b|2.4>*(.8>1.3:.5>.8) a=0>.15:1>.8:1>0 r=sprite(soft-disc,add)
pop halo on=@wisp?.35 inh=p life=.5..0.9 size=.5..0.8 col=<%r|0.55,%g|1.6,%b|2.4>*.25 a=.5>0 sz=$size*(.7>1.2) r=sprite(soft-disc,add)
pop trail on=@wisp?.9 inh=p life=.6..1.2 v=sdir()*.05 size=.03..0.06 acc=grav()*.03+drag(1) col=<%r|0.55,%g|1.6,%b|2.4>*.8 a=.8>0 r=sprite(mote,add)
pop firefly n=?low:8|18 on=disc(%spread|10).c(.6) life=4..8 v=sdir()*(.2..0.4) size=.035..0.06 acc=curl(.35)*1.2+drag(.9)
  col=hdr(2.2,2.6,.6) a=(0>.1:1>.9:1>0)*(flick(.7,1)~) r=sprite(soft-disc,add)
pop pollen n=?low:14|40 on=box(%spread|10,2.2,%spread|10).c(1.6) life=8..14 v=sdir()*.05 size=.012..0.025 acc=curl(.08)*.25+wind()*.1+drag(.4)
  col=<1,.92,.7> a=0>.2:.55>.8:.55>0 r=sprite(mote,add)
pop glow n=1 at=point().c(1.4) gl=(#wisp/6)~*flick(.4,.25) r=light(<%lr|0.5,%lg|0.85,%lb|1>,$gl*2.4,%spread|10)`;
export const wisps = { fx: { script: GLADE, params: { spread: 10 } }, tags: ["glade-magic"], visibleRange: { max: 90 } };
