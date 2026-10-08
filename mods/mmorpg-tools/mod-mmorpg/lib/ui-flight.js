// The flight map: drawn while player.state.flightMap is set (scripts/flight.js writes it at a roost).
// Each discovered roost is a button (flyTo { id }); unknown ones show as dim marks; × is flightClose.
import * as cur from './currency.js';
import { frame } from './ui-art.js';
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function act(name, payload) { return "sendAction('" + name + "'," + esc(JSON.stringify(payload || {})) + ")"; }
// the continent's box on the map: x -9600..9600, z -9200..3700
var X0 = -9800, X1 = 9800, Z0 = -9400, Z1 = 3900;
export function renderFlightMap(player) {
  var m = player && player.state && player.state.flightMap;
  if (!m) return '';
  var W = 520, H = Math.round(W * (Z1 - Z0) / (X1 - X0));
  var px = function (x) { return Math.round((x - X0) / (X1 - X0) * W); }, pz = function (z) { return Math.round((z - Z0) / (Z1 - Z0) * H); };
  var here = m.rows.filter(function (r) { return r.here; })[0];
  var lines = '', dots = '';
  m.rows.forEach(function (r) {
    if (r.known && !r.here && here) lines += '<line x1="' + px(here.x) + '" y1="' + pz(here.z) + '" x2="' + px(r.x) + '" y2="' + pz(r.z) + '" stroke="#f2b04a" stroke-opacity=".35" stroke-dasharray="4 5"/>';
    var c = r.here ? '#7fd36b' : r.known ? '#f2b04a' : '#5a4a38';
    dots += '<circle cx="' + px(r.x) + '" cy="' + pz(r.z) + '" r="' + (r.here ? 7 : 5) + '" fill="' + c + '" stroke="#2a1e16" stroke-width="2"/>';
    if (r.known) dots += '<text x="' + (px(r.x) + 9) + '" y="' + (pz(r.z) + 4) + '" fill="#e8d9b5" font-size="11" font-family="Georgia,serif">' + esc(r.name) + '</text>';
  });
  var list = m.rows.filter(function (r) { return !r.here; }).sort(function (a, b) { return (b.known - a.known) || (a.cost - b.cost); }).map(function (r) {
    if (!r.known) return '<div style="padding:5px 8px;margin:3px 0;color:#6b5a44;font-size:12px;border:1px dashed #4a3a2a;border-radius:3px">Undiscovered roost · ' + esc(r.region) + '</div>';
    var poor = r.cost > (m.purse || 0);
    return '<div onclick="' + act('flyTo', { id: r.id }) + '" style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin:3px 0;cursor:pointer;' + frame('vendorItem', 8, 'rgba(40,30,20,.6)') + (poor ? 'opacity:.5;' : '') + '">' +
      '<div><div style="color:#e8d9b5;font-size:14px">' + esc(r.name) + '</div><div style="color:#a8977a;font-size:11px">' + esc(r.region) + '</div></div>' +
      '<div style="color:#e8d9b5;font-size:13px">' + (r.cost > 0 ? cur.formatHtml(r.cost) : 'free') + '</div></div>';
  }).join('');
  return '<div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;display:flex;gap:14px;padding:16px;max-width:96vw;max-height:88vh;' + frame('vendor', 14, 'rgba(14,11,8,.94)') + 'font-family:Georgia,serif;pointer-events:auto">' +
    '<div style="flex:none"><div style="font-family:Cinzel,Georgia,serif;color:#f2b04a;font-size:18px;letter-spacing:2px;margin-bottom:6px">GRYPHON ROOSTS</div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:min(520px,52vw);height:auto;background:radial-gradient(ellipse at 50% 60%,#3f5a3a 0%,#2a3a28 55%,#16222a 72%);border:1px solid #6b4a2f;border-radius:4px">' + lines + dots + '</svg></div>' +
    '<div style="width:250px;display:flex;flex-direction:column;min-height:0"><div style="display:flex;justify-content:space-between;align-items:center"><div style="color:#c9a46a;font-size:12px">Flying from <b style="color:#e8d9b5">' + esc(m.fromName) + '</b></div>' +
    '<button onclick="' + act('flightClose') + '" style="width:26px;height:26px;border:1px solid #c9a46a;background:#7a2e22;color:#f2b04a;border-radius:3px;cursor:pointer;font-weight:bold;font-size:14px;line-height:1">&times;</button></div>' +
    (m.msg ? '<div style="color:#d65a46;font-size:12px;margin:6px 0">' + esc(m.msg) + '</div>' : '') +
    '<div style="overflow:auto;margin-top:6px;flex:1">' + list + '</div>' +
    '<div style="color:#8a7a60;font-size:11px;margin-top:6px">Walk near a roost to learn its path.</div></div></div>';
}
