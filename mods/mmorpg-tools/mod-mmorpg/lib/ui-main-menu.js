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

// The login screen, after the old MMO front doors: crest and title top-left, the herald's news under it, the
// one big door (Enter World / Create Hero) bottom-centre with the hero and realm it opens onto, the lesser doors
// stacked bottom-right. The centre stays clear for the realm gate behind it.
var CREST = '/cdn/value.215dae666ef9a1a74cb16082f46a9e117966c908d5beaee16b35d07c82bcaa3e.png';
var NEWS = [
  ['v0.33', 'Ashen Close', 'A ruined cathedral rises north-east of the Reach. Follow the cobbles east from the north-pass fork, and mind the graves.'],
  ['v0.32', 'Trades & the Lantern Exchange', 'Mining, Herblore, Blacksmithing and Alchemy are open. Sell what you make at the auction house beside the roost.'],
  ['v0.31', 'Songs of the March', 'Every region has its own theme now, and the war drums come in when steel is drawn.'],
];
var LOGIN_CSS = '<style>'
  + '@keyframes wl-sheen{0%{background-position:-160% 0}55%,100%{background-position:260% 0}}'
  + '@keyframes wl-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.95;transform:scale(1.04)}}'
  + '@keyframes wl-ember{0%{transform:translate(0,0);opacity:0}12%{opacity:.9}100%{transform:translate(var(--dx),-70vh);opacity:0}}'
  + '@keyframes wl-pulse{0%,100%{box-shadow:0 0 18px rgba(242,176,74,.25),0 10px 30px rgba(0,0,0,.55)}50%{box-shadow:0 0 34px rgba(242,176,74,.55),0 10px 30px rgba(0,0,0,.55)}}'
  + '@keyframes wl-spin{to{transform:rotate(360deg)}}'
  + '.wl-metal{font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;background:linear-gradient(180deg,#fff6dc 0%,#f2d38a 30%,#c99a48 52%,#8a5a22 70%,#e8c27a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 #1a0f08) drop-shadow(0 0 14px rgba(242,176,74,.35))}'
  + '.wl-cta{position:relative;overflow:hidden;animation:wl-pulse 3.2s ease-in-out infinite}'
  + '.wl-cta::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,236,190,.38) 48%,transparent 66%);background-size:60% 100%;background-repeat:no-repeat;animation:wl-sheen 4.5s ease-in-out infinite;pointer-events:none}'
  + '.wl-side .wm-btn:hover{transform:translateX(-4px)}'
  + '.wl-news-item{padding:7px 2px 8px;border-bottom:1px solid rgba(201,164,106,.18)}.wl-news-item:last-child{border-bottom:0}'
  + '.wl-mobile{display:none}'
  + '@media (max-width:820px),(max-height:560px){.wl-news{display:none!important}.wl-side{display:none!important}.wl-mobile{display:flex!important}.wl-logo{left:50%!important;transform:translateX(-50%)!important;top:14px!important;text-align:center}.wl-logo .wl-crest{width:84px!important;height:84px!important;margin:0 auto!important}}'
  + '</style>';
function embers() {
  var out = '';
  for (var i = 0; i < 16; i++) {
    var x = (i * 61 + 7) % 100, d = 9 + (i * 37 % 8), delay = -(i * 1.9 % 14), dx = ((i * 29 % 13) - 6) * 6, sz = 2 + (i % 3);
    out += '<div style="position:absolute;left:' + x + '%;bottom:-2%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:#ffcf7a;box-shadow:0 0 6px 2px rgba(255,170,70,.7);--dx:' + dx + 'px;animation:wl-ember ' + d + 's linear ' + delay + 's infinite"></div>';
  }
  return '<div style="position:fixed;inset:0;z-index:50;pointer-events:none;overflow:hidden">' + out + '</div>';
}
function loginLogo() {
  return '<div class="wl-logo" style="position:fixed;left:56px;top:34px;z-index:60;pointer-events:none;animation:wm-in .6s ease-out">'
    + '<div style="display:flex;align-items:center;gap:18px">'
    + '<div class="wl-crest" style="position:relative;width:132px;height:132px;flex:none">'
    + '<div style="position:absolute;inset:-14%;border-radius:50%;background:radial-gradient(circle,rgba(170,110,255,.45) 0,rgba(170,110,255,0) 62%);animation:wl-glow 4s ease-in-out infinite"></div>'
    + '<img src="' + CREST + '" style="position:relative;width:100%;height:100%;object-fit:contain;-webkit-mask-image:radial-gradient(circle,#000 52%,transparent 71%);mask-image:radial-gradient(circle,#000 52%,transparent 71%)"></div>'
    + '<div><div class="wl-metal" style="font-size:clamp(38px,4.6vw,66px);letter-spacing:.12em;line-height:1">WHISPERS</div>'
    + '<div style="display:flex;align-items:center;gap:10px;margin-top:6px"><div style="height:1px;width:34px;background:linear-gradient(90deg,transparent,#c9a46a)"></div>'
    + '<div style="font-family:Cinzel,Georgia,serif;color:' + INK + ';font-size:clamp(12px,1.25vw,16px);letter-spacing:.42em;text-transform:uppercase;text-shadow:0 2px 0 #1a0f08">Realm of the Nine</div>'
    + '<div style="height:1px;width:34px;background:linear-gradient(90deg,#c9a46a,transparent)"></div></div></div></div></div>';
}
function newsBoard() {
  var items = NEWS.map(function (n, i) {
    return '<div class="wl-news-item"><div style="display:flex;align-items:baseline;gap:8px"><span style="font:700 10px/1 Cinzel,Georgia,serif;letter-spacing:1px;color:#1a0f08;background:' + (i === 0 ? GOLD : '#a8916a') + ';padding:3px 5px;border-radius:2px">' + n[0] + '</span>'
      + '<span style="font-family:Cinzel,Georgia,serif;font-weight:700;font-size:14px;color:' + (i === 0 ? GOLD : INK) + '">' + esc(n[1]) + '</span></div>'
      + '<div style="font-size:12.5px;line-height:1.5;color:rgba(232,217,181,.78);margin-top:4px">' + esc(n[2]) + '</div></div>';
  }).join('');
  return '<div class="wl-news" style="position:fixed;left:56px;top:210px;width:330px;z-index:60;pointer-events:none;' + ART.frame('dialog', 14, 'linear-gradient(180deg,rgba(20,14,9,.86),rgba(12,9,6,.9))') + 'padding:10px 16px 6px;box-shadow:0 14px 40px rgba(0,0,0,.5);animation:wm-in .8s ease-out">'
    + '<div style="display:flex;align-items:center;justify-content:space-between"><div class="wm-title" style="font-size:15px;letter-spacing:3px">Herald of the Realm</div><img src="' + UI_ICONS.journal + '" style="width:22px;height:22px;opacity:.9"></div>'
    + ART.rule('fadeBoth', '100%', 12) + items + '</div>';
}
function heroCard(s, hasChar) {
  var chars = s.characters || [], sel = Math.min(s.selectedCharIdx ?? 0, Math.max(0, chars.length - 1)), ch = chars[sel];
  if (!hasChar || !ch) return '<div style="font-family:Cinzel,Georgia,serif;color:' + INK + ';font-size:14px;letter-spacing:2px;text-shadow:0 2px 3px #000;margin-bottom:10px">Your legend begins at the Lantern Gate</div>';
  var h = heroLine(ch);
  return '<div class="wm-row" data-interactive onclick="sendAction(\'setMenuView\',{view:\'select\'})" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;pointer-events:auto;' + ART.frame('charRowActive', 10, 'rgba(18,13,9,.88)') + 'padding:6px 16px 6px 8px">'
    + '<div style="width:50px;height:50px;flex:none;' + ART.frame('portrait', 6, '#120d09') + 'overflow:hidden">' + (h.portrait ? '<img src="' + h.portrait + '" style="width:100%;height:100%;object-fit:cover">' : '<img src="' + UI_ICONS.character + '" style="width:100%;height:100%">') + '</div>'
    + '<div style="text-align:left;line-height:1.3"><div style="font-family:Cinzel,Georgia,serif;font-weight:700;font-size:18px;color:' + GOLD + '">' + esc(ch.charName || 'Unnamed') + '</div>'
    + '<div style="font-size:13px;color:' + INK + '">Level ' + (ch.level ?? 1) + ' ' + esc(h.race.name) + ' <span style="color:' + h.color + '">' + esc(h.cls) + '</span> <span style="color:' + DIM + '">· ' + esc(h.zone) + '</span></div></div></div>';
}
function realmLine(s) {
  var r = realmInfo(s);
  return '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:12px;font-size:13px;color:' + DIM + ';letter-spacing:1px;text-shadow:0 1px 3px #000;pointer-events:auto">'
    + '<span style="width:9px;height:9px;border-radius:50%;background:' + (POP[r.population] || POP.Low) + ';box-shadow:0 0 8px ' + (POP[r.population] || POP.Low) + '"></span>'
    + '<span>Realm: <b style="color:' + INK + ';font-family:Cinzel,Georgia,serif">' + esc(r.name) + '</b> · ' + esc(r.type || 'Normal') + ' · ' + esc(r.population || 'Low') + '</span>'
    + '<span class="wm-row" data-interactive onclick="sendAction(\'openRealmList\')" style="color:' + GOLD + ';font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:1px;border-bottom:1px solid rgba(242,176,74,.5);cursor:pointer">Change</span></div>';
}
function titleView(s, hasChar, loading) {
  var side = [
    ['Characters', 'setMenuView', { view: 'select' }],
    ['Realms', 'openRealmList', null],
    ['Settings', 'setMenuTab', { tab: 'settings' }],
    ['Credits', 'setMenuView', { view: 'credits' }],
  ];
  var main = loading
    ? '<div style="display:flex;align-items:center;gap:12px;color:' + INK + ';font-family:Cinzel,Georgia,serif;letter-spacing:2px;text-shadow:0 2px 3px #000"><div style="width:22px;height:22px;border:2px solid rgba(242,176,74,.25);border-top-color:' + GOLD + ';border-radius:50%;animation:wl-spin 1s linear infinite"></div>Reading the realm\u2019s ledger\u2026</div>'
    : heroCard(s, hasChar)
      + '<div class="wl-cta" style="border-radius:6px">' + btn(hasChar ? 'Enter World' : 'Create Hero', hasChar ? 'continueGame' : 'startCharacterCreation', null, 340, 'buttonHot', 28) + '</div>'
      + realmLine(s)
      + '<div class="wl-mobile" style="gap:8px;margin-top:12px;flex-wrap:wrap;justify-content:center;pointer-events:auto">' + side.map(function (it) { return btn(it[0], it[1], it[2], 150, 'button', 12); }).join('') + '</div>';
  var center = '<div style="position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;align-items:center;pointer-events:none;animation:wm-in .7s ease-out">' + main + '</div>';
  var sideStack = '<div class="wl-side" style="position:fixed;right:calc(var(--spawn-chrome-reservation-right-inset,50px) + 28px);bottom:44px;z-index:60;display:flex;flex-direction:column;gap:9px;pointer-events:none;animation:wm-in .9s ease-out">'
    + side.map(function (it) { return btn(it[0], it[1], it[2], 210, 'button', 15); }).join('') + '</div>';
  var copy = '<div class="wl-side" style="position:fixed;left:56px;bottom:14px;z-index:60;pointer-events:none;font:500 11px/1.5 Georgia,serif;color:rgba(232,217,181,.45);letter-spacing:1px;text-shadow:0 1px 2px #000">A world by @whispers · Built on Spawn</div>';
  return LOGIN_CSS + embers() + loginLogo() + newsBoard() + center + sideStack + copy;
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
  var logo = view === 'credits' ? loginLogo() : '';
  var shade = '<div style="position:fixed;inset:0;z-index:49;pointer-events:none;background:linear-gradient(90deg,rgba(8,5,3,.62) 0,rgba(8,5,3,.2) 28%,rgba(0,0,0,0) 50%),linear-gradient(0deg,rgba(6,4,2,.72) 0,rgba(6,4,2,0) 32%),linear-gradient(180deg,rgba(6,4,2,.45) 0,rgba(6,4,2,0) 22%),radial-gradient(ellipse at 55% 45%,rgba(0,0,0,0) 45%,rgba(0,0,0,.4) 100%)"></div>';
  var body = view === 'select' ? selectView(s, chars, sel) : view === 'credits' ? creditsView() : titleView(s, hasChar, loading);
  var err = s.realmError ? '<div style="position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:70;' + ART.frame('notice', 10, 'rgba(60,20,14,.95)') + 'padding:6px 14px;color:' + INK + '">' + esc(s.realmError) + '</div>' : '';
  return CSS + shade + logo + (view === 'select' ? realmBadge(s) : '') + body + err;
}
module.exports = { renderMainMenu: renderMainMenu };
