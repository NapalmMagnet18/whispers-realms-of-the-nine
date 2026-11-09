// The Lantern Stall in Lantern's Reach: its plate names the three offers; a press opens the platform's checkout
// for the presser (owners and editors pay nothing, so the creator can try each).
export function onSpawn(ctx) {
  ctx.on('ui:stag', (ctx, { by }) => { if (by) ctx.proposePurchase(by, 'lantern-stag') })
  ctx.on('ui:cloak', (ctx, { by }) => { if (by) ctx.proposePurchase(by, 'runed-cloak') })
  ctx.on('ui:tip', (ctx, { by }) => { if (by) ctx.proposePurchase(by, 'lantern-tip') })
}
