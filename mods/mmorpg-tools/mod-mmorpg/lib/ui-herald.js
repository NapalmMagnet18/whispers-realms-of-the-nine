// The realm herald: world.state.herald (written by scripts/lib/realm-firsts.js) shown once per id for 7 s under the top edge.
// The first herald seen on a page load is the realm's old news: remembered, not shown.
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
export function renderHerald(world) {
  var ws = (world && world.world && world.world.state) || (world && world.state) || {};
  var h = ws.herald;
  var g = globalThis.__herald || (globalThis.__herald = { id: undefined, at: 0 });
  if (g.id === undefined) { g.id = h ? h.id : null; return ''; }
  if (h && h.id !== g.id) { g.id = h.id; g.at = Date.now(); g.text = h.text; }
  if (!g.text || Date.now() - g.at > 7000) return '';
  return '<style>@keyframes heraldIn{0%{opacity:0;transform:translate(-50%,-10px)}8%{opacity:1;transform:translate(-50%,0)}85%{opacity:1}100%{opacity:0}}</style>'
    + '<div style="position:fixed;top:9vh;left:50%;transform:translateX(-50%);z-index:55;pointer-events:none;animation:heraldIn 7s ease-out forwards;'
    + 'padding:8px 26px;background:linear-gradient(90deg,rgba(20,14,8,0),rgba(20,14,8,.92) 18%,rgba(20,14,8,.92) 82%,rgba(20,14,8,0));text-align:center;white-space:nowrap">'
    + '<div style="font-family:Cinzel,Georgia,serif;font-size:12px;letter-spacing:4px;color:#c9a46a;text-transform:uppercase">Realm First</div>'
    + '<div style="font-family:Cinzel,Georgia,serif;font-size:22px;font-weight:700;color:#f2d38a;text-shadow:0 0 12px rgba(242,176,74,.45)">' + esc(g.text) + '</div></div>';
}
// the realm chip: which realm you play on and what its rules mean right now. Top centre, small.
var REALM = { main: ["Lantern's Rest", 'Normal'], 'realm-emberfall': ['Emberfall', 'Normal'], 'realm-greyspine': ['Greyspine Watch', 'Normal'],
  'realm-hollowmere': ['Hollowmere', 'PvP'], 'realm-saltwind': ['Saltwind', 'RP'], 'realm-nine-veils': ['The Nine Veils', 'Normal'] };
var TC = { Normal: '#9fd0ff', PvP: '#ff6a55', RP: '#7fe08a' };
export function renderRealmChip(localPlayer) {
  var s = localPlayer.state || {}, r = REALM[s.realmCurrent || 'main'] || REALM.main;
  var rule = '';
  if (r[1] === 'PvP') {
    rule = s.pvpZone === 'sanctuary' ? '<span style="color:#9fe08a">\u26e8 Sanctuary' + (s.pvpSanctuary ? ' \u00b7 ' + esc(s.pvpSanctuary) : '') + '</span>'
      : s.pvpZone === 'contested' ? ((s.level || 1) < 5 ? '<span style="color:#f2d34a">Contested \u00b7 protected below level 5</span>' : '<span style="color:#ff6a55">\u2694 Contested ground</span>') : '';
    if (s.pvpKills || s.pvpDeaths) rule += ' <span style="color:#c9a46a">\u00b7 ' + (s.pvpKills || 0) + ' felled / ' + (s.pvpDeaths || 0) + ' falls</span>';
  } else if (r[1] === 'RP') rule = '<span style="color:#7fe08a">Roleplay realm \u00b7 speak as your hero</span>';
  return '<div style="position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:45;pointer-events:none;white-space:nowrap;padding:2px 12px;background:rgba(10,8,6,.72);border:1px solid rgba(201,164,106,.35);border-radius:3px;font-family:Cinzel,Georgia,serif;font-size:12px;letter-spacing:1px;color:#e8d9b5">'
    + esc(r[0]) + ' <span style="color:' + TC[r[1]] + '">' + r[1] + '</span>' + (rule ? ' \u00b7 ' + rule : '') + '</div>';
}
module.exports = { renderHerald: renderHerald, renderRealmChip: renderRealmChip };
