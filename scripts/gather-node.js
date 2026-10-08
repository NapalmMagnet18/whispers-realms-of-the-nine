// On every gathering node (tag gather-node, state.node = a trades.yml nodes key): the gatherer's own scripts/trades.js
// writes state.depletedUntil when it takes the last of it; this hides the node until then and brings it back.
// Asleep the whole time it stands full: the gatherer's write wakes it.
export function onSpawn(ctx) { const d = ctx.self.state.depletedUntil || 0; ctx.self.visible = !(d > ctx.now()); }
export function update(ctx) {
  const d = ctx.self.state.depletedUntil || 0, now = ctx.now();
  if (d > now) { if (ctx.self.visible !== false) ctx.self.visible = false; ctx.sleep(Math.max(0.5, (d - now) / 1000)); return; }
  if (ctx.self.visible === false) {
    ctx.self.visible = true;
    ctx.emit('fx', { position: ctx.self.feetPosition, script: REGROW }, { audience: { nearby: ctx.self.feetPosition, radius: 40 } });
  }
  ctx.sleep(600);
}
const REGROW = `fx
pop rise burst=14 on=disc(.35) life=.6..1.1 v=up(.8..1.6) size=.04..0.08 acc=drag(.8) col=hdr(2.2,2,1)>hdr(.8,.6,.2) a=1>0 r=sprite(ember,add)`;
