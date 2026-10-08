// WHISPERS vendor window: drawn by ui.js while player.state.vendorOpen is set. Buy / Sell tabs, coin prices in copper.
// Actions: vendorBuy { itemId }, vendorSell { slot }, vendorTab { tab }, vendorClose (scripts/vendor.js).
import * as shop from './shop-data.js';
import * as cur from './currency.js';
import * as icons from './item-icons.js';
import { frame, rule } from './ui-art.js'; // the creator's borders: vendor (window), vendorItem (goods rows); dividers: title

var FRAME = frame('vendor', 14, 'rgba(14,11,8,.92)');
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function act(name, payload) { return "sendAction('" + name + "'," + esc(JSON.stringify(payload || {})) + ")"; }
function icon(item) {
  var src = icons.iconFor(item);
  return '<div style="width:38px;height:38px;flex:none;border:1px solid #6b4a2f;border-radius:4px;background:#1d1610 center/cover no-repeat' + (src ? ' url(' + src + ')' : '') + ';box-shadow:inset 0 0 6px #000"></div>';
}
function row(item, priceHtml, sub, onclick, dim) {
  return '<div onclick="' + onclick + '" class="whv-row" style="display:flex;align-items:center;gap:10px;padding:2px 4px;margin:3px 0;' + frame('vendorItem', 8, 'rgba(40,30,20,.55)') + 'cursor:pointer;' + (dim ? 'opacity:.55;' : '') + '">' +
    icon(item) +
    '<div style="flex:1;min-width:0"><div style="color:#e8d9b5;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(item.name || item.id) + (item.count > 1 ? ' <span style="color:#c9a46a">×' + item.count + '</span>' : '') + '</div>' +
    '<div style="color:#a8977a;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(sub || '') + '</div></div>' +
    '<div style="color:#e8d9b5;font-size:13px;text-align:right">' + priceHtml + '</div></div>';
}

export function renderVendor(player) {
  var st = (player && player.state) || {};
  var vo = st.vendorOpen;
  if (!vo) return '';
  var wallet = cur.purse(st);
  var tab = vo.tab === 'sell' ? 'sell' : 'buy';
  var body = '';
  if (tab === 'buy') {
    var items = shop.getShopItems(vo.shop);
    for (var i = 0; i < items.length; i++) {
      var it = items[i], poor = wallet < it.price;
      body += row(it, '<span style="' + (poor ? 'color:#d65a46' : '') + '">' + cur.formatHtml(it.price) + '</span>', it.description, act('vendorBuy', { itemId: it.id }), poor);
    }
  } else {
    var inv = st.inventory || [], any = false;
    for (var j = 0; j < inv.length; j++) {
      var b = inv[j]; if (!b) continue; any = true;
      var each = shop.sellPrice(b), n = b.stackable ? (b.count || 1) : 1;
      body += row(b, each ? cur.formatHtml(each * n) : '<span style="color:#7d6d55">no offer</span>', each && n > 1 ? cur.formatText(each) + ' each' : (b.description || ''), act('vendorSell', { slot: j }), !each);
    }
    if (!any) body = '<div style="color:#a8977a;text-align:center;padding:24px 0;font-style:italic">Your bag is empty.</div>';
  }
  function tabBtn(id, label) {
    var on = tab === id;
    return '<button onclick="' + act('vendorTab', { tab: id }) + '" style="flex:1;padding:6px 0;font-family:Cinzel,serif;font-size:13px;letter-spacing:1px;cursor:pointer;border:1px solid ' + (on ? '#c9a46a' : '#6b4a2f') + ';background:' + (on ? '#7a2e22' : 'rgba(30,22,15,.9)') + ';color:' + (on ? '#f2b04a' : '#c9a46a') + ';border-radius:3px">' + label + '</button>';
  }
  var msg = st.vendorMsg ? '<div style="margin-top:6px;text-align:center;font-size:13px;color:' + (st.vendorMsg.bad ? '#e0533d' : '#f2b04a') + '">' + esc(st.vendorMsg.text) + '</div>' : '';
  return '<style>.whv-row:hover{background-color:rgba(90,62,34,.8)!important;filter:brightness(1.15)}</style>' +
    '<div style="position:fixed;left:24px;top:110px;width:340px;max-height:calc(100vh - 220px);display:flex;flex-direction:column;pointer-events:auto;z-index:40;background:rgba(14,11,8,.92);' + FRAME + 'box-shadow:0 8px 30px #000a;font-family:Georgia,serif;color:#e8d9b5">' +
      '<div style="display:flex;align-items:center;gap:8px;padding:2px 4px 0">' +
        '<img src="' + icons.UI_ICONS.bag + '" style="width:28px;height:28px;filter:sepia(.3)">' +
        '<div style="flex:1"><div style="font-family:Cinzel,serif;color:#f2b04a;font-size:17px;letter-spacing:1px">' + esc(vo.name) + '</div><div style="font-size:11px;color:#a8977a">Merchant stall · Lantern\'s Reach</div></div>' +
        '<button onclick="' + act('vendorClose') + '" style="width:26px;height:26px;border:1px solid #c9a46a;background:#7a2e22;color:#f2b04a;border-radius:3px;cursor:pointer;font-weight:bold;font-family:Arial,sans-serif;font-size:14px;line-height:1">&times;</button></div>' +
      rule('title', '100%', 16) + '<div style="display:flex;gap:6px;margin:4px 0 4px">' + tabBtn('buy', 'BUY') + tabBtn('sell', 'SELL') + '</div>' +
      '<div style="flex:1;overflow-y:auto;padding-right:2px">' + body + '</div>' + msg +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:6px;border-top:1px solid #6b4a2f;font-size:13px"><span style="color:#a8977a">' + (tab === 'sell' ? 'Click a stack to sell it' : 'Click to buy') + '</span><span>' + cur.formatHtml(wallet) + '</span></div>' +
    '</div>';
}
