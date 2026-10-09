// WHISPERS live save + realm roster. The characters table (scripts/db.js) is the source of truth:
// one row per (user, realm, slot); `data` holds the whole hero (buildCharData) so a load is one SELECT.
// Realm = the room this body stands in (scripts/lib/data/realms.yml lists them).
var { RACES } = require('./races.js');
var REALMS = [ // mirrors scripts/lib/data/realms.yml (room ids must match)
  { room: 'main', name: "Lantern's Rest", type: 'Normal', note: 'The first realm. Steady, friendly, busiest in the evenings.' },
  { room: 'realm-emberfall', name: 'Emberfall', type: 'Normal', note: 'A quieter realm. Good for a fresh start.' },
  { room: 'realm-greyspine', name: 'Greyspine Watch', type: 'Normal', note: 'For heroes who like the long road north.' },
  { room: 'realm-hollowmere', name: 'Hollowmere', type: 'PvP', note: 'Player combat is open outside towns. Towns and roosts stay safe.' },
  { room: 'realm-saltwind', name: 'Saltwind', type: 'RP', note: 'Roleplay realm: speak as your hero, keep names in the world.' },
  { room: 'realm-nine-veils', name: 'The Nine Veils', type: 'Normal', note: 'The newest realm, far shores and fresh ledgers.' },
];
var MAX_PER_REALM = 120, CHARS_PER_REALM = 6;

function realmOf(api) {
  var r = null;
  try { r = typeof api.getRoomId === 'function' ? api.getRoomId() : null; } catch (e) {}
  return REALMS.some(function (x) { return x.room === r; }) ? r : 'main';
}
function hasSql(api) { return api && typeof api.sql === 'function'; }
function raceOf(ch) { var r = RACES[ch.raceIndex ?? 0] || RACES[0]; return r; }
function classOf(ch) { var r = raceOf(ch); return (r.classes && r.classes[ch.classIndex ?? 0]) || 'Vanguard'; }
// a cheap fingerprint of what the save cares about between quest saves
function signature(s) {
  var inv = s.inventory || [], eq = s.equipment || {}, n = 0;
  for (var i = 0; i < inv.length; i++) { var it = inv[i]; if (it) n = (n * 31 + (it.id || '').length * 7 + (it.count || 1) + i) % 1000003; }
  var ek = Object.keys(eq).map(function (k) { return k + ':' + (eq[k] && eq[k].id || ''); }).join(',');
  return [s.level ?? 1, s.copper ?? 0, s.xp ?? 0, n, inv.filter(Boolean).length, ek].join('|');
}
function upsert(api, slot, data, cb) {
  if (!hasSql(api) || !data || typeof slot !== 'number') { if (cb) cb(false); return; }
  var realm = realmOf(api), now = api.now ? api.now() : 0, r = raceOf(data);
  var extra = JSON.stringify(data);
  try {
    api.sql`INSERT INTO characters (user_id, realm, slot, name, race, class, level, copper, inventory, equipment, data, created_at, updated_at)
      VALUES (@caller, ${realm}, ${slot}, ${data.charName || ('Unnamed ' + (data.activeCharId || (realm + ':' + slot + ':' + now)))}, ${r.id || r.name}, ${classOf(data)}, ${data.level ?? 1}, ${data.copper ?? 0},
              ${JSON.stringify(data.inventory || [])}, ${JSON.stringify(data.equipment || {})}, ${extra}, ${now}, ${now})
      ON CONFLICT (user_id, realm, slot) DO UPDATE SET name = excluded.name, race = excluded.race, class = excluded.class, level = excluded.level,
        copper = excluded.copper, inventory = excluded.inventory, equipment = excluded.equipment, data = excluded.data, updated_at = excluded.updated_at`
      .then(function () { if (cb) cb(true); }, function (e) { try { api.log('save failed', String(e && e.message || e)); } catch (x) {} if (cb) cb(false, e); });
  } catch (e) { if (cb) cb(false, e); }
}
// remove a slot and close the gap (slots stay 0..n-1 = the roster order)
function removeSlot(api, slot, count, cb) {
  if (!hasSql(api)) { if (cb) cb(); return; }
  var realm = realmOf(api);
  api.sql`DELETE FROM characters WHERE user_id = @caller AND realm = ${realm} AND slot = ${slot};
          UPDATE characters SET slot = slot - 1 WHERE user_id = @caller AND realm = ${realm} AND slot > ${slot}`
    .then(function () { if (cb) cb(); }, function (e) { try { api.log('delete failed', String(e)); } catch (x) {} if (cb) cb(); });
}
// load this realm's heroes; null = no table (caller falls back to storage)
function loadRoster(api, cb) {
  if (!hasSql(api)) { cb(null); return; }
  var realm = realmOf(api);
  api.sql`SELECT slot, data FROM characters WHERE user_id = @caller AND realm = ${realm} ORDER BY slot`.then(function (res) {
    var rows = (res && res.rows) || [];
    cb(rows.map(function (row) { try { return JSON.parse(row.data); } catch (e) { return null; } }).filter(Boolean));
  }, function () { cb(null); });
}
// one-time import: the old storage roster lands in realm main when this player has no rows anywhere
function importLegacy(api, roster, cb) {
  if (!hasSql(api) || !Array.isArray(roster) || !roster.length) { if (cb) cb(); return; }
  api.sql`SELECT COUNT(*) AS n FROM characters WHERE user_id = @caller`.then(function (res) {
    var n = res && res.rows && res.rows[0] ? res.rows[0].n : 0;
    if (n > 0 || realmOf(api) !== 'main') { if (cb) cb(); return; }
    var left = roster.length;
    roster.forEach(function (ch, i) { upsert(api, i, ch, function () { if (--left === 0 && cb) cb(); }); });
  }, function () { if (cb) cb(); });
}
function population(players) {
  var f = (players || 0) / MAX_PER_REALM;
  return f >= 1 ? 'Full' : f >= 0.6 ? 'High' : f >= 0.25 ? 'Medium' : 'Low';
}
// the realm that new heroes are pointed at: the emptiest Normal realm awake or asleep; ties go to the first in the roster
function pickRecommended(rows) {
  var best = null;
  rows.forEach(function (r) { if (r.type !== 'Normal' || r.population === 'Full') return; if (!best || r.players < best.players) best = r; });
  return best ? best.room : 'main';
}
// realm list rows into player.state.realmList for the UI. A pulse older than 180 s (SQLite clock) is a realm asleep: 0 players.
function refreshRealmList(api) {
  var cur = realmOf(api);
  var base = REALMS.map(function (r) { return { room: r.room, name: r.name, type: r.type, note: r.note || '', recommended: r.room === 'main', population: 'Low', players: 0, awake: false, chars: 0, current: r.room === cur }; });
  api.patchState({ realmList: base, realmCurrent: cur });
  if (!hasSql(api)) return;
  Promise.all([
    api.sql`SELECT realm, players, (at > CAST(strftime('%s','now') AS INTEGER) - 180) AS fresh FROM realm_pulse`,
    api.sql`SELECT realm, COUNT(*) AS n FROM characters WHERE user_id = @caller GROUP BY realm`,
    api.sql`SELECT realm, COUNT(*) AS n FROM characters GROUP BY realm`,
  ]).then(function (out) {
    var pulse = {}, awake = {}, mine = {}, heroes = {};
    (out[0].rows || []).forEach(function (r) { var f = !!r.fresh; pulse[r.realm] = f ? r.players : 0; awake[r.realm] = f && r.players > 0; });
    (out[1].rows || []).forEach(function (r) { mine[r.realm] = r.n; });
    (out[2].rows || []).forEach(function (r) { heroes[r.realm] = r.n; });
    if (pulse[cur] == null || pulse[cur] < 1) { pulse[cur] = Math.max(1, pulse[cur] || 0); awake[cur] = true; } // you are standing in it
    var rows = base.map(function (r) { return Object.assign({}, r, { players: pulse[r.room] || 0, awake: !!awake[r.room], population: population(pulse[r.room]), chars: mine[r.room] || 0, heroes: heroes[r.room] || 0 }); });
    var rec = pickRecommended(rows);
    api.patchState({ realmList: rows.map(function (r) { return Object.assign(r, { recommended: r.room === rec }); }) });
  }, function (e) { try { api.log('realm list read failed', String(e)); } catch (x) {} });
}
// the picked realm's ledger: its five highest heroes and its realm firsts, into player.state.realmDetail
function refreshRealmDetail(api, room) {
  if (!REALMS.some(function (r) { return r.room === room; })) return;
  api.patchState({ realmDetail: { room: room, loading: true, top: [], firsts: [] } });
  if (!hasSql(api)) { api.patchState({ realmDetail: { room: room, loading: false, top: [], firsts: [] } }); return; }
  var firsts = api.sql`SELECT feat, label, char_name, class FROM realm_firsts WHERE realm = ${room} ORDER BY at DESC LIMIT 6`.then(function (r) { return r.rows || []; }, function () { return []; });
  var top = api.sql`SELECT name, race, class, level FROM characters WHERE realm = ${room} ORDER BY level DESC, updated_at ASC LIMIT 5`.then(function (r) { return r.rows || []; }, function () { return []; });
  Promise.all([top, firsts]).then(function (out) {
    var s = api.getState();
    if ((s.realmPick || realmOf(api)) !== room) return; // a later pick won
    api.patchState({ realmDetail: { room: room, loading: false, top: out[0], firsts: out[1] } });
  });
}
module.exports = { REALMS: REALMS, MAX_PER_REALM: MAX_PER_REALM, CHARS_PER_REALM: CHARS_PER_REALM, realmOf: realmOf, signature: signature, upsert: upsert, removeSlot: removeSlot, loadRoster: loadRoster, importLegacy: importLegacy, refreshRealmList: refreshRealmList, refreshRealmDetail: refreshRealmDetail, population: population, classOf: classOf };
