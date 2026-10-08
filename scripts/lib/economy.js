// WHISPERS: the ONE coin writer. Every copper that moves goes through move(): purse never below zero,
// a ledger row per movement (scripts/db.js ledger), a clink and a floating "+25s" for the player who earned it.
// Call it from the player's own behavior (ctx.self is the player). Other machines ring the player's "coins" ear (scripts/vendor.js).
import E from './data/economy.yml';
import { purse, formatText } from '../../mods/mmorpg-tools/mod-mmorpg/lib/currency.js';

export function realmOf(ctx) {
  try { const w = ctx.world; const r = (w && w.state && w.state.realm) || (w && w.room && (w.room.name || w.room)); return typeof r === 'string' && r ? r : 'main'; } catch (e) { return 'main'; }
}

export function ledger(ctx, delta, reason, balance) {
  const st = ctx.self.state || {};
  const name = st.charName || st.characterName || null;
  try {
    const q = ctx.sql`INSERT INTO ledger (user_id, realm, char_name, delta, reason, balance, at) VALUES (@caller, ${realmOf(ctx)}, ${name}, ${delta}, ${reason}, ${balance}, ${ctx.now()})`;
    if (q && q.catch) q.catch((e) => ctx.log('ledger insert failed', { reason, delta, error: String(e && e.message || e) }));
  } catch (e) { ctx.log('ledger insert failed', { reason, delta, error: String(e && e.message || e) }); }
}

export function feedback(ctx, delta) {
  const me = ctx.self, f = me.feetPosition;
  const to = { audience: { player: me.id } };
  ctx.emit('playSound', { clip: E.clink, position: f, volume: 0.6 }, to);
  ctx.emit('damageNumber', { position: { x: f.x, y: f.y + 2.3, z: f.z }, text: (delta > 0 ? '+' : '-') + formatText(Math.abs(delta)), color: delta > 0 ? '#f2b04a' : '#c9a46a', size: 1.25, lifetime: 1.8 }, to);
}

// returns the new balance, or null when refused (the purse would go below zero)
export function move(ctx, delta, reason, opts) {
  const st = ctx.self.state;
  const bal = purse(st);
  delta = Math.trunc(Number(delta) || 0);
  if (!delta) return bal;
  if (bal + delta < 0) return null;
  const next = bal + delta;
  st.copper = next;
  if ('gold' in st) delete st.gold;
  st._questSave = true; // mod player.js saveCharacter persists the purse
  ledger(ctx, delta, reason, next);
  if (!opts || opts.feedback !== false) feedback(ctx, delta);
  return next;
}

export { purse, formatText };
