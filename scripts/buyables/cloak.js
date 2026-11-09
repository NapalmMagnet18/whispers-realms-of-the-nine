// The Runed Cloak is bought: scripts/mount.js dresses it from the record within half a second.
export function onPurchase(ctx, buyer) {
  const p = buyer.feetPosition
  ctx.emit('fx', { position: { ...p, y: p.y + 1.2 }, script: 'fx\npop runes burst=30 on=sphere(.6) life=.7..1.2 v=up(.6..1.4) size=.04..0.08 acc=drag(2) col=hdr(2.6,1.8,.6)>hdr(.4,1.6,1.4) a=1>0 sz=$size r=sprite(soft-disc,add)' })
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-cloak-swirl-cloth-whoosh-with-rune-shimmer.mp3', position: p, volume: 0.6 })
  ctx.emit('damageNumber', { position: { ...p, y: p.y + 2.4 }, text: 'Runed Cloak worn', color: '#f2b04a', size: 0.9, lifetime: 2.5 }, { audience: { player: buyer.id } })
}
