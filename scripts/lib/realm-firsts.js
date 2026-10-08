// Realm firsts: the first hero on a realm to finish a story chain or reach a level band.
// One row per (realm, feat) in realm_firsts; INSERT OR IGNORE makes the claim race-safe across every machine in the room.
// The winner's machine writes world.state.herald; every HUD in the realm draws it once (lib/ui-hud.js).
const CHAINS = {
  'MAR-08': 'Marchfolk Origin', 'THR-08': 'Thren Origin', 'KHA-08': 'Kharic Origin', 'NAM-08': 'Namar Origin',
  'Q008': "Lantern's Reach", 'VAN-07': 'the Vanguard Path', 'ARC-07': 'the Arcanist Path', 'PAT-07': 'the Pathfinder Path', 'SHA-07': 'the Shade Path',
  'EQU-09': 'Voices in the Stone', 'DHC-04': 'The Candle Warden', 'SOR-09': 'The Drowned Names', 'TID-09': 'The Harbor That Never Was', 'BRD-09': 'Leaves for All Witnesses',
};
const BANDS = [10, 20, 30, 40, 50, 60];
function realmOf(ctx) { try { return (ctx.getRoomId && ctx.getRoomId()) || 'main'; } catch (e) { return 'main'; } }
function claim(ctx, feat, label, text) {
  if (typeof ctx.sql !== 'function') return;
  const st = ctx.self.state, name = st.charName || ctx.self.displayName || 'A hero', realm = realmOf(ctx);
  if (!st.charName) return; // only a real hero claims
  ctx.sql`INSERT OR IGNORE INTO realm_firsts (realm, feat, label, char_name, class, level, at) VALUES (${realm}, ${feat}, ${label}, ${name}, ${st.className || null}, ${st.level || 1}, CAST(strftime('%s','now') AS INTEGER))`
    .then((r) => {
      if (!r || !r.changes) return;
      const msg = text.replace('{name}', name);
      ctx.world.state.herald = { id: feat + ':' + ctx.now(), text: msg, by: name };
      ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-distant-herald-horn-fanfare.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: 'all' });
      ctx.emit('stat', { name: 'realm first' }, { audience: { player: ctx.self.id } });
    }, (e) => ctx.log('realm first failed', String(e && e.message || e)));
}
export function questFirst(ctx, questId) {
  const chain = CHAINS[questId];
  if (chain) claim(ctx, 'quest:' + questId, chain, '{name} is the first on this realm to complete ' + chain + '!');
}
export function levelFirst(ctx, level, was) {
  for (const b of BANDS) if (was < b && level >= b) claim(ctx, 'level:' + b, 'Level ' + b, '{name} is the first on this realm to reach level ' + b + '!');
}
