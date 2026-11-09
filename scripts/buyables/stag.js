// The Lantern Stag is bought: the moment at the buyer's feet; the record is the platform's.
export function onPurchase(ctx, buyer) {
  const p = buyer.feetPosition
  ctx.emit('fx', { position: p, script: 'fx\npop ring burst=60 on=disc(1.2) life=.8..1.4 v=up(1.5..3)+sdir()*.5 size=.05..0.12 acc=drag(2) col=hdr(.8,3,2.4)>hdr(.3,1,.9) a=1>0 sz=$size r=sprite(soft-disc,add)' })
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-spectral-stag-summon-soft-bell-chime-and-deer-snort.mp3', position: p, volume: 0.7 })
  ctx.emit('damageNumber', { position: { ...p, y: p.y + 2.4 }, text: 'Lantern Stag is yours · press Z to ride', color: '#7ff0d8', size: 0.9, lifetime: 3 }, { audience: { player: buyer.id } })
}
