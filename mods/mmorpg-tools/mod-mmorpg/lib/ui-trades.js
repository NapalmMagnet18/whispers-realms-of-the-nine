// WHISPERS trades windows: the trade station (craft / learn) while player.state.tradeOpen is set, and the
// auction house while player.state.ahOpen is set. All logic lives in scripts/trades.js; this only draws and sends.
import T from '../../../../scripts/lib/data/trades.yml';
import * as cur from './currency.js';
import * as icons from './item-icons.js';
import { frame, rule } from './ui-art.js';

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function act(name, payload) { return "sendAction('" + name + "'," + esc(JSON.stringify(payload || {})) + ")"; }
function iconBox(src, size) { size = size || 36; return '<div style="width:' + size + 'px;height:' + size + 'px;flex:none;border:1px solid #6b4a2f;border-radius:4px;background:#1d1610 center/cover no-repeat' + (src ? ' url(' + src + ')' : '') + ';box-shadow:inset 0 0 6px #000"></div>'; }
var BAND = { red: '#8a7a66', orange: '#ff8a3d', yellow: '#ffd24a', green: '#5fd068', grey: '#9a9a9a' };
function band(cur, req) { var g = cur - req; return g < 0 ? 'red' : g < 25 ? 'orange' : g < 50 ? 'yellow' : g < 75 ? 'green' : 'grey'; }
function btn(label, onclick, hot, dim) {
  return '<button onclick="' + onclick + '" style="padding:5px 10px;font-family:Cinzel,serif;font-size:12px;letter-spacing:.5px;cursor:pointer;border:1px solid ' + (hot ? '#c9a46a' : '#6b4a2f') + ';background:' + (hot ? '#7a2e22' : 'rgba(30,22,15,.9)') + ';color:' + (hot ? '#f2b04a' : '#c9a46a') + ';border-radius:3px;' + (dim ? 'opacity:.45;' : '') + '">' + label + '</button>';
}
function tabs(list, current, action) {
  var h = '<div style="display:flex;gap:6px;margin:4px 0 6px">';
  for (var i = 0; i < list.length; i++) h += '<div style="flex:1;display:flex">' + btn(list[i][1], act(action, { tab: list[i][0] }), list[i][0] === current).replace('padding:5px 10px', 'flex:1;padding:6px 0') + '</div>';
  return h + '</div>';
}
function win(x, w, title, sub, onClose, body, footer) {
  return '<style>.wht-row:hover{background-color:rgba(90,62,34,.8)!important}</style>' +
    '<div style="position:fixed;left:' + x + ';top:96px;width:' + w + ';max-width:calc(100vw - 24px);max-height:calc(100vh - 200px);display:flex;flex-direction:column;pointer-events:auto;z-index:40;background:rgba(14,11,8,.94);' + frame('vendor', 14, 'rgba(14,11,8,.94)') + 'box-shadow:0 8px 30px #000a;font-family:Georgia,serif;color:#e8d9b5">' +
    '<div style="display:flex;align-items:center;gap:8px;padding:2px 4px 0"><div style="flex:1"><div style="font-family:Cinzel,serif;color:#f2b04a;font-size:17px;letter-spacing:1px">' + esc(title) + '</div><div style="font-size:11px;color:#a8977a">' + esc(sub) + '</div></div>' +
    '<button onclick="' + onClose + '" style="width:26px;height:26px;border:1px solid #c9a46a;background:#7a2e22;color:#f2b04a;border-radius:3px;cursor:pointer;font-weight:bold;font-family:Arial,sans-serif;font-size:14px;line-height:1">&times;</button></div>' +
    rule('title', '100%', 16) + body + (footer || '') + '</div>';
}
function msgLine(m) { return m ? '<div style="margin-top:6px;text-align:center;font-size:13px;color:' + (m.bad ? '#e0533d' : '#f2b04a') + '">' + esc(m.text) + '</div>' : ''; }
function countOf(inv, id) { var n = 0; for (var i = 0; i < inv.length; i++) { var it = inv[i]; if (it && it.id === id) n += it.stackable ? (it.count || 1) : 1; } return n; }
function nameOf(id) { var t = T.items[id]; if (t) return t.name; return id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }

// ── trade station ──
export function renderTradeWindow(player) {
  var st = (player && player.state) || {}, to = st.tradeOpen;
  if (!to) return '';
  var known = st.professions || [], skills = st.tradeSkill || {}, inv = st.inventory || [];
  var body = tabs([['craft', 'CRAFT'], ['trades', 'TRADES']], to.tab, 'tradeTab');
  var list = '';
  if (to.tab === 'trades') {
    var names = Object.keys(T.trades);
    list += '<div style="font-size:12px;color:#a8977a;text-align:center;margin-bottom:6px">' + known.length + ' / ' + T.maxTrades + ' trades known · learning costs ' + cur.formatHtml(T.learnCost) + '</div>';
    for (var i = 0; i < names.length; i++) {
      var n = names[i], info = T.trades[n], has = known.indexOf(n) >= 0, sk = skills[n] || 0;
      var here = info.station === to.station;
      list += '<div style="display:flex;gap:10px;align-items:center;padding:6px;margin:4px 0;' + frame('skillRow', 8, 'rgba(40,30,20,.55)') + '">' +
        '<div style="flex:1;min-width:0"><div style="font-family:Cinzel,serif;font-size:15px;color:' + (has ? '#f2b04a' : '#e8d9b5') + '">' + esc(n) + ' <span style="font-size:11px;color:#a8977a">' + (info.kind === 'gather' ? 'gathering' : 'crafting') + '</span></div>' +
        '<div style="font-size:11px;color:#a8977a;line-height:1.35">' + esc(info.blurb) + '</div>' +
        (has ? '<div style="margin-top:4px;height:8px;background:#1d1610;border:1px solid #6b4a2f;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.round(100 * sk / T.maxSkill) + '%;background:linear-gradient(90deg,#3f6a9a,#7ab4e8)"></div></div><div style="font-size:10px;color:#7ab4e8;margin-top:1px">' + sk + ' / ' + T.maxSkill + '</div>' : '') +
        '</div>' +
        (has ? btn('Unlearn', act('tradeUnlearn', { trade: n })) : btn('Learn', act('tradeLearn', { trade: n }), true, known.length >= T.maxTrades)) + '</div>';
      if (!here && false) list += '';
    }
  } else {
    var any = false;
    for (var r = 0; r < T.recipes.length; r++) {
      var rc = T.recipes[r];
      if (rc.station !== to.station || known.indexOf(rc.trade) < 0) continue;
      any = true;
      var sk2 = skills[rc.trade] || 0, b = band(sk2, rc.req), locked = b === 'red';
      var outId = rc.gear ? rc.gear.id : rc.out.id, outName = rc.gear ? rc.gear.name : nameOf(outId);
      var can = 99, mats = '';
      for (var id in rc.in) {
        var have = countOf(inv, id); can = Math.min(can, Math.floor(have / rc.in[id]));
        mats += '<span style="margin-right:8px;color:' + (have >= rc.in[id] ? '#c9e8a8' : '#d65a46') + '">' + have + '/' + rc.in[id] + ' ' + esc(nameOf(id)) + '</span>';
      }
      if (locked) can = 0;
      var stat = rc.gear && rc.gear.stats ? (rc.gear.stats.damage ? ' · ' + rc.gear.stats.damage.min + '–' + rc.gear.stats.damage.max + ' dmg' : rc.gear.stats.defence ? ' · ' + rc.gear.stats.defence + ' armor' : '') : '';
      list += '<div class="wht-row" style="display:flex;gap:10px;align-items:center;padding:4px 6px;margin:3px 0;' + frame('vendorItem', 8, 'rgba(40,30,20,.55)') + '">' +
        iconBox(icons.iconFor(rc.gear || { id: outId })) +
        '<div style="flex:1;min-width:0"><div style="font-size:14px;color:' + BAND[b] + '">' + esc(rc.name) + (rc.out && rc.out.count > 1 ? ' ×' + rc.out.count : '') + '<span style="font-size:11px;color:#a8977a">' + stat + '</span></div>' +
        '<div style="font-size:11px">' + mats + '</div>' + (locked ? '<div style="font-size:10px;color:#a8977a">Requires ' + esc(rc.trade) + ' ' + rc.req + '</div>' : '') + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:3px">' + btn('Make', act('tradeCraft', { recipe: rc.id, times: 1 }), can > 0, can < 1) + (can > 1 ? btn('All ' + Math.min(can, 20), act('tradeCraft', { recipe: rc.id, times: Math.min(can, 20) })) : '') + '</div></div>';
    }
    if (!any) list = '<div style="color:#a8977a;text-align:center;padding:22px 8px;font-style:italic;line-height:1.5">You know no trade that works here.<br>Open TRADES to learn one.</div>';
  }
  body += '<div style="flex:1;overflow-y:auto;padding-right:2px">' + list + '</div>' + msgLine(to.msg);
  var foot = '<div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:6px;border-top:1px solid #6b4a2f;font-size:12px;color:#a8977a"><span>orange: skill-ups · grey: mastered</span><span>' + cur.formatHtml(cur.purse(st)) + '</span></div>';
  return win('24px', '400px', to.title, to.station === 'forge' ? 'Smelting & Blacksmithing · Lantern\'s Reach' : 'Alchemy · Lantern\'s Reach', act('tradeClose'), body, foot);
}

// ── auction house ──
function left(ms) { if (ms <= 0) return 'ended'; var h = Math.floor(ms / 3600000); return h >= 24 ? Math.floor(h / 24) + 'd ' + (h % 24) + 'h' : h >= 1 ? h + 'h' : Math.max(1, Math.floor(ms / 60000)) + 'm'; }
export function renderAuction(player) {
  var st = (player && player.state) || {}, ao = st.ahOpen;
  if (!ao) return '';
  var A = T.auction, body = tabs([['browse', 'BROWSE'], ['sell', 'SELL'], ['mine', 'MY AUCTIONS' + (ao.owed ? ' •' : '')]], ao.tab, 'ahTab');
  var list = '';
  if (ao.tab === 'browse') {
    var cats = [['all', 'All'], ['metal', 'Ore & Bars'], ['herbs', 'Herbs'], ['potions', 'Potions'], ['gear', 'Gear'], ['goods', 'Goods']];
    list += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">';
    for (var c = 0; c < cats.length; c++) list += btn(cats[c][1], act('ahCat', { cat: cats[c][0] }), (ao.cat || 'all') === cats[c][0]).replace('padding:5px 10px', 'padding:3px 8px');
    list += btn('↻', act('ahRefresh')).replace('padding:5px 10px', 'padding:3px 8px') + '</div>';
    var rows = ao.rows || [];
    if (ao.loading && !rows.length) list += '<div style="color:#a8977a;text-align:center;padding:20px">Reading the ledger…</div>';
    else if (!rows.length) list += '<div style="color:#a8977a;text-align:center;padding:20px;font-style:italic;line-height:1.5">Nothing listed here yet.<br>Be the first: open SELL.</div>';
    var wallet = cur.purse(st);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], poor = wallet < r.price;
      var stat = r.stats ? (r.stats.damage ? r.stats.damage.min + '–' + r.stats.damage.max + ' dmg · ' : r.stats.defence ? r.stats.defence + ' armor · ' : '') : '';
      list += '<div class="wht-row" onclick="' + (r.mine ? '' : act('ahBuy', { id: r.id })) + '" style="display:flex;gap:10px;align-items:center;padding:3px 6px;margin:3px 0;cursor:' + (r.mine ? 'default' : 'pointer') + ';' + frame('vendorItem', 8, 'rgba(40,30,20,.55)') + (poor && !r.mine ? 'opacity:.6;' : '') + '">' +
        iconBox(r.icon) +
        '<div style="flex:1;min-width:0"><div style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(r.name) + (r.count > 1 ? ' <span style="color:#c9a46a">×' + r.count + '</span>' : '') + '</div>' +
        '<div style="font-size:11px;color:#a8977a">' + stat + (r.mine ? 'your listing' : 'by ' + esc(r.seller || '?')) + ' · ' + left(r.left) + (r.count > 1 ? ' · ' + cur.formatText(Math.ceil(r.price / r.count)) + ' each' : '') + '</div></div>' +
        '<div style="text-align:right;font-size:13px"><div style="' + (poor && !r.mine ? 'color:#d65a46' : '') + '">' + cur.formatHtml(r.price) + '</div>' + (r.mine ? '' : '<div style="font-size:10px;color:#f2b04a;letter-spacing:1px">BUYOUT</div>') + '</div></div>';
    }
  } else if (ao.tab === 'sell') {
    var inv = st.inventory || [];
    if (ao.pick) {
      var p = ao.pick, dep = Math.max(1, Math.floor((ao.price || 0) * A.depositPct / 100));
      list += '<div style="display:flex;gap:10px;align-items:center;padding:8px;' + frame('skillRow', 8, 'rgba(40,30,20,.7)') + '">' + iconBox(p.icon, 44) +
        '<div style="flex:1"><div style="font-size:15px;color:#f2b04a">' + esc(p.name) + (p.count > 1 ? ' ×' + p.count : '') + '</div><div style="font-size:11px;color:#a8977a">' + (ao.market ? 'cheapest on the house: ' + cur.formatText(ao.market) : 'no one else is selling this') + '</div></div>' +
        btn('Change', act('ahPick', { slot: -1 })) + '</div>' +
        '<div style="text-align:center;margin:12px 0 4px;font-size:12px;color:#a8977a">BUYOUT PRICE' + (p.count > 1 ? ' (whole stack)' : '') + '</div>' +
        '<div style="text-align:center;font-size:22px;margin-bottom:8px">' + cur.formatHtml(ao.price || 0) + '</div>' +
        '<div style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap">';
      var steps = A.steps, labels = function (v) { return v >= 10000 ? (v / 10000) + 'g' : v >= 100 ? (v / 100) + 's' : v + 'c'; };
      for (var s = steps.length - 1; s >= 0; s--) list += btn('−' + labels(steps[s]), act('ahPrice', { delta: -steps[s] })).replace('padding:5px 10px', 'padding:4px 7px');
      list += '</div><div style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin-top:4px">';
      for (var s2 = 0; s2 < steps.length; s2++) list += btn('+' + labels(steps[s2]), act('ahPrice', { delta: steps[s2] })).replace('padding:5px 10px', 'padding:4px 7px');
      list += '</div><div style="text-align:center;font-size:11px;color:#a8977a;margin:10px 0 6px">Deposit ' + cur.formatText(dep) + ' (kept if it doesn\'t sell) · the house takes ' + A.cutPct + '% of a sale · ' + A.hours + 'h</div>' +
        '<div style="display:flex;justify-content:center">' + btn('CREATE AUCTION', act('ahList'), true).replace('padding:5px 10px', 'padding:8px 22px') + '</div>';
    } else {
      list += '<div style="font-size:12px;color:#a8977a;text-align:center;margin-bottom:6px">Pick something from your bag to list.</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px">';
      var anyB = false;
      for (var j = 0; j < inv.length; j++) {
        var it = inv[j]; if (!it) continue; anyB = true;
        list += '<div onclick="' + act('ahPick', { slot: j }) + '" title="' + esc(it.name || it.id) + '" style="position:relative;cursor:pointer;aspect-ratio:1;border:1px solid #6b4a2f;border-radius:4px;background:#1d1610 center/cover no-repeat url(' + (icons.iconFor(it) || '') + ');box-shadow:inset 0 0 6px #000">' +
          (it.count > 1 ? '<span style="position:absolute;right:2px;bottom:0;font-size:11px;color:#fff;text-shadow:0 0 3px #000">' + it.count + '</span>' : '') + '</div>';
      }
      list += '</div>' + (anyB ? '' : '<div style="color:#a8977a;text-align:center;padding:20px;font-style:italic">Your bag is empty.</div>');
    }
  } else {
    var mine = ao.mine || [];
    list += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:12px;color:#a8977a">' + mine.filter(function (m) { return m.status === 'active'; }).length + ' / ' + A.maxListings + ' listings up</span>' + btn('Collect' + (ao.owed ? ' (' + ao.owed + ')' : ''), act('ahCollect'), !!ao.owed) + '</div>';
    if (!mine.length) list += '<div style="color:#a8977a;text-align:center;padding:20px;font-style:italic">No auctions yet.</div>';
    for (var k = 0; k < mine.length; k++) {
      var m = mine[k], col = m.status === 'sold' ? '#5fd068' : m.status === 'expired' ? '#d6a046' : '#e8d9b5';
      list += '<div style="display:flex;gap:10px;align-items:center;padding:3px 6px;margin:3px 0;' + frame('vendorItem', 8, 'rgba(40,30,20,.55)') + '">' + iconBox(m.icon) +
        '<div style="flex:1;min-width:0"><div style="font-size:14px">' + esc(m.name) + (m.count > 1 ? ' ×' + m.count : '') + '</div><div style="font-size:11px;color:' + col + '">' + (m.status === 'sold' ? 'SOLD · collect your coin' : m.status === 'expired' ? 'expired · collect to take it back' : left(m.left) + ' left') + '</div></div>' +
        '<div style="text-align:right;font-size:13px">' + cur.formatHtml(m.price) + '</div>' + (m.status === 'active' ? btn('Cancel', act('ahCancel', { id: m.id })) : '') + '</div>';
    }
  }
  body += '<div style="flex:1;overflow-y:auto;padding-right:2px">' + list + '</div>' + msgLine(ao.msg);
  var foot = '<div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:6px;border-top:1px solid #6b4a2f;font-size:12px;color:#a8977a"><span>' + (ao.tab === 'browse' ? 'Click a listing to buy it out' : 'Every realm keeps its own house') + '</span><span>' + cur.formatHtml(cur.purse(st)) + '</span></div>';
  return win('24px', '460px', 'The Lantern Exchange', 'Auction House · Lantern\'s Reach', act('ahClose'), body, foot);
}
