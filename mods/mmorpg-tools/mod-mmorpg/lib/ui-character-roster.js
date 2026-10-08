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
  return '<div data-modal style="position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;pointer-events:auto;background:rgba(0,0,0,.55)">'
    + '<div style="width:min(' + width + 'px,calc(100vw - 2 * (var(--spawn-chrome-reservation-right-inset,50px) + 24px)));max-height:calc(100vh - 60px);overflow:auto;' + ART.frame('window', 18, 'rgba(14,11,8,.95)') + 'padding:12px 16px;color:' + INK + '">' + inner + '</div></div>';
}
function realmList(s) {
  var list = s.realmList || [], cur = s.realmCurrent || 'main', pick = s.realmPick || cur;
  var head = '<div style="display:grid;grid-template-columns:2.2fr 1fr 1.1fr .9fr;gap:6px;padding:0 12px 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:' + DIM + '"><div>Realm</div><div>Type</div><div>Population</div><div style="text-align:right">Characters</div></div>';
  var rows = list.map(function (r) {
    var on = r.room === pick, here = r.room === cur;
    return '<div class="wm-row" data-interactive onclick="sendAction(\'pickRealm\',{room:\'' + r.room + '\'})" style="display:grid;grid-template-columns:2.2fr 1fr 1.1fr .9fr;gap:6px;align-items:center;margin-bottom:4px;' + ART.frame('realmRow', 10, on ? 'rgba(110,78,26,.92)' : 'rgba(24,18,12,.9)') + 'padding:4px 6px;' + (here ? 'box-shadow:0 0 0 2px ' + GOLD + ';' : '') + '">'
      + '<div style="font-family:Cinzel,Georgia,serif;font-weight:700;color:' + (on || here ? GOLD : INK) + '">' + esc(r.name) + (r.recommended ? ' <span style="font-size:10px;padding:1px 5px;background:#3f5a3a;color:#d8f0c0;letter-spacing:1px">RECOMMENDED</span>' : '') + (here ? ' <span style="font-size:10px;color:' + DIM + '">(current)</span>' : '') + '</div>'
      + '<div style="color:' + (TYPE[r.type] || INK) + '">' + esc(r.type) + '</div>'
      + '<div style="color:' + (POP[r.population] || POP.Low) + '">' + esc(r.population || 'Low') + '</div>'
      + '<div style="text-align:right">' + (r.chars || 0) + '</div></div>';
  }).join('');
  return modal('<div class="wm-title" style="text-align:center;font-size:22px;letter-spacing:3px">Realm Selection</div>' + ART.rule('title', '100%', 16) + head + rows + ART.rule('crossEnd', '100%', 14)
    + '<div style="display:flex;justify-content:center;gap:12px;margin-top:6px">' + b('Okay', "sendAction('joinRealm')", true) + b('Cancel', "sendAction('closeRealmList')") + '</div>', 640);
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
