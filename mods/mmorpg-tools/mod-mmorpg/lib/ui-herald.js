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
module.exports = { renderHerald: renderHerald };
