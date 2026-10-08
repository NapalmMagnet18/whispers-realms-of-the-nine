// WHISPERS front door: title (logo + brass button stack, left) and character select (hero list, right).
// The centre stays clear for the realm gate / the hero preview. Art: lib/ui-art.js roles.
var { RACES, CLASS_COLORS } = require('./races.js');
var ART = require('./ui-art.js');
var { UI_ICONS } = require('./item-icons.js');

var GOLD = '#f2b04a', INK = '#e8d9b5', DIM = 'rgba(232,217,181,.6)';
var CSS = '<style>'
  + '.wm-btn{display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;pointer-events:auto;font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:' + GOLD + ';text-shadow:2px 2px 0 #1a0f08;transition:transform .12s,filter .12s;user-select:none}'
  + '.wm-btn:hover{transform:translateX(4px);filter:brightness(1.35) drop-shadow(0 0 8px rgba(242,176,74,.55))}'
  + '.wm-hot:hover{transform:scale(1.05)}'
  + '.wm-row{cursor:pointer;pointer-events:auto;transition:filter .12s}.wm-row:hover{filter:brightness(1.25)}'
  + '.wm-title{font-family:Cinzel,Palatino,Georgia,serif;color:' + GOLD + ';text-shadow:2px 2px 0 #1a0f08,0 0 18px rgba(242,176,74,.35)}'
  + '@keyframes wm-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
  + '</style>';

function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function realmInfo(s) {
  var cur = s.realmCurrent || 'main', list = s.realmList || [];
  var r = list.find(function (x) { return x.room === cur; }) || { name: s.realmName || "Lantern's Rest", population: 'Low', type: 'Normal' };
  return r;
}
var POP = { Low: '#7fd36b', Medium: '#f2d34a', High: '#f08a3a', Full: '#e0473a' };
function heroLine(ch) {
  var race = RACES[ch.raceIndex ?? 0] || RACES[0];
  var ci = ch.classIndex ?? 0; if (ci >= race.classes.length) ci = 0;
  var cls = race.classes[ci];
  return { race: race, cls: cls, color: (CLASS_COLORS && CLASS_COLORS[cls]) || INK, zone: ch.zone || race.zone || "Lantern's Reach", portrait: (ch.genderIndex ?? 0) === 0 ? race.malePortrait : (race.femalePortrait || race.malePortrait) };
}
function btn(label, action, payload, w, role, size) {
  var data = payload ? ',' + JSON.stringify(payload).replace(/"/g, "'") : '';
  return '<div class="wm-btn' + (role === 'buttonHot' ? ' wm-hot' : '') + '" data-interactive onclick="sendAction(\'' + action + '\'' + data + ')" style="' + ART.frame(role || 'button', 12, role === 'buttonHot' ? 'rgba(122,46,34,.96)' : 'rgba(80,30,22,.94)') + 'width:' + (w || 220) + 'px;height:' + (size ? size + 24 : 42) + 'px;font-size:' + (size || 16) + 'px">' + label + '</div>';
}
function realmBadge(s) {
  var r = realmInfo(s);
  return '<div style="position:fixed;top:24px;right:calc(var(--spawn-chrome-reservation-right-inset,50px) + 24px);width:300px;z-index:60;text-align:center;pointer-events:none;' + ART.frame('realmRow', 12, 'rgba(14,11,8,.92)') + 'padding:6px 10px">'
    + '<div class="wm-title" style="font-size:22px;letter-spacing:2px">' + esc(r.name) + '</div>'
    + '<div style="font-size:14px;color:' + DIM + ';letter-spacing:1px">' + esc(r.type || 'Normal') + ' realm · <span style="color:' + (POP[r.population] || POP.Low) + '">' + esc(r.population || 'Low') + '</span> population</div>'
    + '<div style="display:flex;justify-content:center;margin-top:6px">' + btn('Change Realm', 'openRealmList', null, 200, 'button', 14) + '</div>'
    + '</div>';
}

function titleView(s, hasChar, loading) {
  var items = [
    [hasChar ? 'Enter World' : 'Create Hero', hasChar ? 'continueGame' : 'startCharacterCreation', null],
    ['Characters', 'setMenuView', { view: 'select' }],
    ['Realms', 'openRealmList', null],
    ['Settings', 'setMenuTab', { tab: 'settings' }],
    ['Credits', 'setMenuView', { view: 'credits' }],
  ];
  var stack = loading
    ? '<div style="color:' + DIM + ';font-style:italic;letter-spacing:2px">Reading the realm\u2019s ledger\u2026</div>'
    : items.map(function (it, i) { return '<div>' + btn(it[0], it[1], it[2], 280, i === 0 ? 'buttonHot' : 'button', i === 0 ? 20 : 16) + '</div>'; }).join('<div style="height:8px"></div>');
  return '<div style="position:fixed;left:48px;top:50%;transform:translateY(-30%);z-index:60;pointer-events:none;' + ART.frame('menu', 16, 'rgba(14,11,8,.86)') + 'padding:18px 18px">'
    + ART.rule('fadeCross', '280px', 16) + stack + ART.rule('capEnd', '280px', 16) + '</div>';
}
function creditsView() {
  return '<div style="position:fixed;left:48px;top:50%;transform:translateY(-40%);width:320px;z-index:60;pointer-events:none;' + ART.frame('dialog', 16, 'rgba(14,11,8,.92)') + 'padding:16px 18px;color:' + INK + '">'
    + '<div class="wm-title" style="font-size:22px;text-align:center;letter-spacing:3px">Credits</div>' + ART.rule('dialog', '100%', 16)
    + '<div style="font-size:13px;line-height:1.7;text-align:center">A world by <b style="color:' + GOLD + '">@whispers</b><br>Frames, dividers and icons: the creator\u2019s own art<br>Built on Spawn<br><span style="color:' + DIM + '">Thank you for walking the March.</span></div>'
    + ART.rule('fadeCorner', '100%', 14)
    + '<div style="display:flex;justify-content:center;margin-top:6px">' + btn('Back', 'setMenuView', { view: 'title' }, 160) + '</div></div>';
}
function selectView(s, chars, sel) {
  var max = 6;
  var rows = chars.map(function (ch, i) {
    var h = heroLine(ch), on = i === sel;
    return '<div class="wm-row" data-interactive onclick="sendAction(\'selectCharacter\',{index:' + i + '})" style="display:flex;gap:10px;align-items:center;margin-bottom:6px;' + ART.frame(on ? 'charRowActive' : 'charRow', 10, on ? 'rgba(90,62,24,.9)' : 'rgba(22,16,11,.9)') + 'padding:5px 8px">'
      + '<div style="width:42px;height:42px;flex:none;' + ART.frame('portrait', 6, '#120d09') + 'overflow:hidden">' + (h.portrait ? '<img src="' + h.portrait + '" style="width:100%;height:100%;object-fit:cover">' : '<img src="' + UI_ICONS.character + '" style="width:100%;height:100%">') + '</div>'
      + '<div style="min-width:0;line-height:1.25">'
      + '<div style="font-family:Cinzel,Georgia,serif;font-weight:700;font-size:15px;color:' + (on ? GOLD : INK) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(ch.charName || 'Unnamed') + '</div>'
      + '<div style="font-size:12px;color:' + INK + '">Level ' + (ch.level ?? 1) + ' ' + esc(h.race.name) + ' <span style="color:' + h.color + '">' + esc(h.cls) + '</span></div>'
      + '<div style="font-size:11px;color:' + DIM + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(h.zone) + '</div>'
      + '</div></div>';
  }).join('');
  if (!chars.length) rows = '<div style="text-align:center;color:' + DIM + ';font-style:italic;padding:18px 4px">No heroes on this realm yet.</div>';
  var panel = '<div style="position:fixed;right:calc(var(--spawn-chrome-reservation-right-inset,50px) + 24px);top:150px;bottom:96px;width:300px;z-index:60;display:flex;flex-direction:column;pointer-events:auto;' + ART.frame('window', 16, 'rgba(14,11,8,.92)') + 'padding:10px 10px">'
    + '<div class="wm-title" style="text-align:center;font-size:17px;letter-spacing:3px">Characters <span style="font-size:12px;color:' + DIM + '">' + chars.length + '/' + max + '</span></div>' + ART.rule('title', '100%', 16)
    + '<div style="flex:1;overflow-y:auto;padding-right:2px">' + rows + '</div>' + ART.rule('fadeLeft', '100%', 12)
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">'
    + (chars.length < max ? btn('Create New Character', 'startCharacterCreation', null, 250, 'button', 13) : '<div style="font-size:12px;color:' + DIM + '">Realm roster full (' + max + ')</div>')
    + (chars[sel] ? btn('Delete Character', 'deleteCharacter', { index: sel, name: chars[sel].charName || 'Unnamed' }, 250, 'button', 13) : '')
    + '</div></div>';
  var name = chars[sel] ? '<div class="wm-title" style="font-size:26px;letter-spacing:2px;margin-bottom:8px">' + esc(chars[sel].charName || '') + '</div>' : '';
  var enter = chars[sel]
    ? '<div style="position:fixed;left:50%;bottom:40px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;align-items:center;pointer-events:none">' + name + btn('Enter World', 'continueGame', null, 280, 'buttonHot', 22) + '</div>'
    : '';
  var corners = '<div style="position:fixed;left:24px;bottom:24px;z-index:60;pointer-events:none">' + btn('Menu', 'setMenuTab', { tab: 'settings' }, 140) + '</div>'
    + '<div style="position:fixed;right:calc(var(--spawn-chrome-reservation-right-inset,50px) + 24px);bottom:24px;z-index:60;pointer-events:none;display:flex;justify-content:flex-end;width:300px">' + btn('Back', 'setMenuView', { view: 'title' }, 140) + '</div>';
  return panel + enter + corners;
}

export function renderMainMenu(localPlayer) {
  var s = localPlayer.state;
  var chars = s.characters || [];
  var loading = s._dataLoaded !== true;
  var sel = Math.min(s.selectedCharIdx ?? 0, Math.max(0, chars.length - 1));
  var hasChar = chars.length > 0 && !loading;
  var view = s.menuView || 'title';
  var logo = view === 'title' || view === 'credits'
    ? '<div style="position:fixed;top:34px;left:50%;transform:translateX(-50%);z-index:60;text-align:center;pointer-events:none;width:min(560px,calc(100vw - 2 * (var(--spawn-chrome-reservation-right-inset,50px) + 24px)))">'
      + '<div class="wm-title" style="font-size:clamp(34px,6vw,64px);font-weight:700;letter-spacing:.14em;line-height:1">WHISPERS</div>'
      + ART.rule('title', '80%', 18)
      + '<div style="font-family:Cinzel,Georgia,serif;color:' + INK + ';font-size:clamp(13px,1.6vw,18px);letter-spacing:.4em;text-transform:uppercase;text-shadow:2px 2px 0 #1a0f08">Realm of the Nine</div></div>'
    : '';
  var shade = '<div style="position:fixed;inset:0;z-index:49;pointer-events:none;background:linear-gradient(90deg,rgba(8,5,3,.55) 0,rgba(8,5,3,.18) 30%,rgba(0,0,0,0) 55%),radial-gradient(ellipse at 60% 45%,rgba(0,0,0,0) 45%,rgba(0,0,0,.35) 100%)"></div>';
  var body = view === 'select' ? selectView(s, chars, sel) : view === 'credits' ? creditsView() : titleView(s, hasChar, loading);
  var err = s.realmError ? '<div style="position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:70;' + ART.frame('notice', 10, 'rgba(60,20,14,.95)') + 'padding:6px 14px;color:' + INK + '">' + esc(s.realmError) + '</div>' : '';
  return CSS + shade + logo + realmBadge(s) + body + err;
}
module.exports = { renderMainMenu: renderMainMenu };
