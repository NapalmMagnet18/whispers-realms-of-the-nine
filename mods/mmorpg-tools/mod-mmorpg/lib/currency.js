// WHISPERS money: one integer, copper. 100 copper = 1 silver, 100 silver = 1 gold (10,000 copper).
// player.state.copper is the purse. Older saves held player.state.gold as whole coins: migrateCopper folds them in once.
var COPPER_PER_SILVER = 100, COPPER_PER_GOLD = 10000;
var COIN_ICONS = {
  gold: '/cdn/icon-goldcoins-u5s6b5n1n.webp',
};
function split(copper) {
  var c = Math.max(0, Math.floor(copper || 0));
  return { gold: Math.floor(c / COPPER_PER_GOLD), silver: Math.floor((c % COPPER_PER_GOLD) / COPPER_PER_SILVER), copper: c % COPPER_PER_SILVER };
}
function toCopper(g, s, c) { return (g || 0) * COPPER_PER_GOLD + (s || 0) * COPPER_PER_SILVER + (c || 0); }
// plain text: "1g 20s 5c", zero denominations dropped, "0c" when empty
function formatText(copper) {
  var p = split(copper), out = [];
  if (p.gold) out.push(p.gold + 'g');
  if (p.silver) out.push(p.silver + 's');
  if (p.copper || !out.length) out.push(p.copper + 'c');
  return out.join(' ');
}
// HUD html: number then a coloured coin disc per denomination, like a classic MMO purse
function coin(color, rim) { return '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;margin:0 4px 0 2px;vertical-align:-1px;background:radial-gradient(circle at 35% 30%,#fff8,' + color + ' 45%,' + rim + ');box-shadow:0 0 0 1px #0008"></span>'; }
function formatHtml(copper) {
  var p = split(copper), out = '';
  if (p.gold) out += p.gold + coin('#f2c14a', '#8a5a10');
  if (p.gold || p.silver) out += p.silver + coin('#d8dde2', '#6d747c');
  out += p.copper + coin('#d7894a', '#7a3e18');
  return '<span style="white-space:nowrap;font-variant-numeric:tabular-nums">' + out + '</span>';
}
function purse(state) {
  if (!state) return 0;
  if (typeof state.copper === 'number') return state.copper;
  return Math.max(0, Math.floor((state.gold || 0) * COPPER_PER_SILVER)); // legacy "gold" coins read as silver until migrated
}
// call where the player's own behavior writes state: returns the patch, or null when nothing to do
function migrateCopper(state) {
  if (!state || typeof state.copper === 'number') return null;
  return { copper: purse(state) };
}
module.exports = { COPPER_PER_SILVER: COPPER_PER_SILVER, COPPER_PER_GOLD: COPPER_PER_GOLD, COIN_ICONS: COIN_ICONS, split: split, toCopper: toCopper, formatText: formatText, formatHtml: formatHtml, purse: purse, migrateCopper: migrateCopper };
