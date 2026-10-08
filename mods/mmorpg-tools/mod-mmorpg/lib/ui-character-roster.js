// Realm list window and the delete-hero confirm: the modal layer of the front door (ui-main-menu.js draws the rest).
var ART = require('./ui-art.js');
var GOLD = '#f2b04a', INK = '#e8d9b5', DIM = 'rgba(232,217,181,.6)';
var TYPE = { Normal: '#9fd0ff', PvP: '#ff6a55', RP: '#7fe08a' };
var POP = { Low: '#7fd36b', Medium: '#f2d34a', High: '#f08a3a', Full: '#e0473a' };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function b(label, onclick, hot, w) {
  return '<div class="wm-btn" data-interactive onclick="' + onclick + '" style="' + ART.frame(hot ? 'buttonHot' : 'button', 12, hot ? 'rgba(122,46,34,.96)' : 'rgba(80,30,22,.94)') + 'width:' + (w || 150) + 'px;height:32px;font-size:14px">' + label + '</div>';
}
function modal(inner, width) {
  return '<div data-modal style="position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;pointer-events:auto;background:radial-gradient(ellipse at 50% 50%,rgba(8,5,3,.55) 30%,rgba(8,5,3,.78) 100%);backdrop-filter:blur(2px)">'
    + '<div style="width:min(' + width + 'px,calc(100vw - 2 * (var(--spawn-chrome-reservation-right-inset,50px) + 24px)));max-height:calc(100vh - 60px);overflow:auto;' + ART.frame('window', 18, 'rgba(14,11,8,.95)') + 'padding:12px 16px;color:' + INK + ';box-shadow:0 18px 60px rgba(0,0,0,.6),0 0 40px rgba(242,176,74,.12)">' + inner + '</div></div>';
}
var SIGIL = { Normal: '\u26e8', PvP: '\u2694', RP: '\u2767' };
function popBar(pop) {
  var n = { Low: 1, Medium: 2, High: 3, Full: 4 }[pop] || 1, c = POP[pop] || POP.Low, out = '';
  for (var i = 0; i < 4; i++) out += '<span style="display:inline-block;width:12px;height:8px;margin-right:2px;transform:skewX(-18deg);border:1px solid rgba(201,164,106,.45);background:' + (i < n ? 'linear-gradient(180deg,' + c + ',rgba(0,0,0,.35))' : 'rgba(0,0,0,.45)') + ';' + (i < n ? 'box-shadow:0 0 5px ' + c : '') + '"></span>';
  return '<span style="display:inline-flex;align-items:center;gap:6px">' + out + '<span style="font-size:12px;color:' + c + '">' + esc(pop || 'Low') + '</span></span>';
}
function emblem(name, type, on) {
  var c = TYPE[type] || INK;
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;flex:none;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a3622,#120d09);border:1.5px solid ' + (on ? GOLD : 'rgba(201,164,106,.55)') + ';box-shadow:0 0 ' + (on ? 10 : 4) + 'px ' + (on ? 'rgba(242,176,74,.6)' : 'rgba(0,0,0,.6)') + ';font:700 12px Cinzel,Georgia,serif;color:' + c + '">' + esc((name || '?').charAt(0)) + '</span>';
}
function realmDetail(s, list, pick) {
  var r = list.find(function (x) { return x.room === pick; }) || {};
  var d = s.realmDetail && s.realmDetail.room === pick ? s.realmDetail : { loading: true, top: [], firsts: [] };
  var top = (d.top || []).map(function (h, i) {
    return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;border-bottom:1px solid rgba(201,164,106,.15)"><span><span style="color:' + DIM + '">' + (i + 1) + '.</span> ' + esc(h.name) + ' <span style="color:' + DIM + ';font-size:11px">' + esc(h.class) + '</span></span><span style="color:' + GOLD + '">' + (h.level || 1) + '</span></div>';
  }).join('') || '<div style="font-size:12px;font-style:italic;color:' + DIM + '">' + (d.loading ? 'Reading the ledger\u2026' : 'No heroes yet. Be the first.') + '</div>';
  var firsts = (d.firsts || []).map(function (f) {
    return '<div style="font-size:12px;padding:2px 0"><span style="color:' + GOLD + '">\u2726</span> ' + esc(f.label) + ' <span style="color:' + DIM + '">\u2014</span> ' + esc(f.char_name) + '</div>';
  }).join('') || '<div style="font-size:12px;font-style:italic;color:' + DIM + '">' + (d.loading ? '' : 'Every first is still unclaimed.') + '</div>';
  return '<div style="' + ART.frame('realmRow', 10, 'rgba(20,15,10,.92)') + 'padding:8px 10px;min-height:100%;box-sizing:border-box">'
    + '<div style="font-family:Cinzel,Georgia,serif;font-size:17px;font-weight:700;color:' + GOLD + '">' + esc(r.name || '') + '</div>'
    + '<div style="font-size:12px;color:' + (TYPE[r.type] || INK) + ';letter-spacing:1px;margin-bottom:4px">' + esc(r.type || '') + ' realm \u00b7 ' + (r.awake ? '<span style="color:#7fd36b">\u25cf awake</span>' : '<span style="color:' + DIM + '">\u25cb quiet</span>') + ' \u00b7 ' + (r.heroes || 0) + ' heroes</div>'
    + '<div style="font-size:12px;line-height:1.4;margin-bottom:8px">' + esc(r.note || '') + '</div>'
    + '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + DIM + ';margin-bottom:2px">Greatest heroes</div>' + top
    + '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + DIM + ';margin:8px 0 2px">Realm firsts</div>' + firsts
    + '</div>';
}
function realmList(s) {
  var list = s.realmList || [], cur = s.realmCurrent || 'main', pick = s.realmPick || cur;
  var head = '<div style="display:grid;grid-template-columns:2.2fr 1fr 1.3fr .8fr;gap:6px;padding:0 12px 6px 46px;border-bottom:1px solid rgba(201,164,106,.25);margin-bottom:6px;font-family:Cinzel,Georgia,serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:' + DIM + '"><div>Realm</div><div>Type</div><div>Population</div><div style="text-align:right">Yours</div></div>';
  var rows = list.map(function (r) {
    var on = r.room === pick, here = r.room === cur, full = r.population === 'Full';
    return '<div class="wm-row" data-interactive onclick="sendAction(\'pickRealm\',{room:\'' + r.room + '\'})" style="display:grid;grid-template-columns:2.2fr 1fr 1.3fr .8fr;gap:6px;align-items:center;margin-bottom:5px;min-height:38px;' + ART.frame('realmRow', 10, on ? 'rgba(110,78,26,.92)' : 'rgba(24,18,12,.9)') + 'padding:4px 6px;' + (here ? 'box-shadow:0 0 0 2px ' + GOLD + ';' : '') + (full ? 'opacity:.6;' : '') + '">'
      + '<div style="display:flex;align-items:center;gap:8px;font-family:Cinzel,Georgia,serif;font-weight:700;color:' + (on || here ? GOLD : INK) + '">' + emblem(r.name, r.type, on) + '<span>' + (r.awake ? '<span style="color:#7fd36b;font-size:10px">\u25cf</span> ' : '') + esc(r.name) + (r.recommended ? ' <span style="font-size:10px;padding:1px 5px;background:#3f5a3a;color:#d8f0c0;letter-spacing:1px">RECOMMENDED</span>' : '') + (here ? ' <span style="font-size:10px;color:' + DIM + '">(current)</span>' : '') + '</span></div>'
      + '<div style="color:' + (TYPE[r.type] || INK) + ';font-size:13px"><span style="font-size:15px;margin-right:4px">' + (SIGIL[r.type] || '') + '</span>' + esc(r.type) + '</div>'
      + '<div>' + popBar(r.population) + '</div>'
      + '<div style="text-align:right;font-family:Cinzel,Georgia,serif;font-weight:700;color:' + ((r.chars || 0) ? GOLD : DIM) + '">' + (r.chars || 0) + ' <span style="font-size:10px;color:' + DIM + ';font-weight:400">/ 6</span></div></div>';
  }).join('');
  var err = s.realmError ? '<div style="color:#ff8a70;font-size:13px;text-align:center;margin-top:4px">' + esc(s.realmError) + '</div>' : '';
  var body = '<div style="display:flex;gap:12px;flex-wrap:wrap"><div style="flex:1.5 1 360px">' + head + rows + '</div><div style="flex:1 1 220px">' + realmDetail(s, list, pick) + '</div></div>';
  return modal('<div class="wm-title" style="text-align:center;font-size:22px;letter-spacing:3px">Realm Selection</div>' + ART.rule('title', '100%', 16) + body + err
    + '<div style="font-size:11px;color:' + DIM + ';text-align:center;margin-top:6px">A hero lives on one realm. Each realm keeps its own world, its own heroes and its own firsts.</div>' + ART.rule('crossEnd', '100%', 14)
    + '<div style="display:flex;justify-content:center;gap:12px;margin-top:6px">' + b(pick === cur ? 'Stay Here' : 'Travel There', "sendAction('joinRealm')", true, 190) + b('Cancel', "sendAction('closeRealmList')") + '</div>', 900);
}
function deleteConfirm(s) {
  var name = s._deleteConfirmName || '';
  return modal('<div class="wm-title" style="text-align:center;font-size:20px;color:#ff8a70">Delete ' + esc(name) + '?</div>' + ART.rule('danger', '100%', 16)
    + '<div style="text-align:center;font-size:13px;margin-bottom:8px">This hero, their bags and their coin are gone for good.<br>Type <b style="color:' + GOLD + '">' + esc(name) + '</b> to confirm.</div>'
    + '<input id="wm-del-name" autocomplete="off" style="display:block;width:100%;box-sizing:border-box;' + ART.frame('input', 10, 'rgba(8,6,4,.95)') + 'color:' + INK + ';font-size:16px;padding:4px 8px;outline:none;pointer-events:auto">'
    + (s._deleteError ? '<div style="color:#ff8a70;font-size:12px;text-align:center;margin-top:4px">' + esc(s._deleteError) + '</div>' : '')
    + '<div style="display:flex;justify-content:center;gap:12px;margin-top:10px">' + b('Delete', "sendAction('confirmDeleteCharacter',{typed:(document.getElementById('wm-del-name')||{}).value||''})", true) + b('Cancel', "sendAction('cancelDeleteCharacter')") + '</div>', 420);
}
export function renderCharacterRoster(localPlayer) {
  var s = localPlayer.state;
  if (!s.inMainMenu) return '';
  if (typeof s._deleteConfirmIdx === 'number' && s._deleteConfirmIdx >= 0) return deleteConfirm(s);
  if (s.realmListOpen) return realmList(s);
  return '';
}
module.exports = { renderCharacterRoster: renderCharacterRoster };
