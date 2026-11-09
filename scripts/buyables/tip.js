// A coin in the tavern jar: a thank-you at the giver's feet, nothing more.
export function onPurchase(ctx, buyer) {
  const p = buyer.feetPosition
  ctx.emit('fx', { position: { ...p, y: p.y + 1.6 }, script: 'fx\npop coins burst=24 on=sphere(.3) life=.8..1.2 v=up(2..3.5)+sdir()*1 size=.06..0.1 acc=grav()*.8 col=hdr(3,2.2,.6) a=1>.6:1>0 sz=$size r=sprite(soft-disc,add)' })
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-gold-coins-dropping-into-wooden-jar-warm-chime.mp3', position: p, volume: 0.7 })
  ctx.emit('damageNumber', { position: { ...p, y: p.y + 2.4 }, text: 'The Reach thanks you, wayfarer', color: '#f2b04a', size: 0.9, lifetime: 2.5 }, { audience: { player: buyer.id } })
}
