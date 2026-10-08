// MMORPG Tools Mod UI
const { RACES, CLASSES, CLASS_LORE, CLASS_ICONS, CLASS_COLORS, RACE_DESCRIPTIONS, SKIN_TONES, HAIR_COLORS, FACE_OPTIONS, HAIR_STYLES, FACIAL_HAIR } = require('./lib/races.js');
const { RACIAL_ABILITIES } = require('./lib/racial-abilities.js');
// The game windows (146 KB) and the door panel are not needed to stand: they load on first draw in the world, and the HUD draws them the frame they land.
var _lazy = {};
var _LAZY_SRC = { menu: function () { return import('./lib/ui-menu-panel.js'); }, door: function () { return import('./lib/ui-door-panel.js'); },
  guild: function () { return import('./lib/ui-guild.js'); }, gnome: function () { return import('./lib/ui-gnome-tip.js'); },
  vamp: function () { return import('./lib/ui-vampire-dialog.js'); }, cursed: function () { return import('./lib/ui-cursed-item-dialog.js'); } };
var _LAZY_FN = { menu: 'renderMenuPanel', door: 'renderDoorPanel', guild: 'renderGuildPanel', gnome: 'renderGnomeTipJar', vamp: 'renderVampireDialog', cursed: 'renderCursedItemDialog' };
function _lazyMod(key, path) {
  var e = _lazy[key] || (_lazy[key] = { m: null, p: null });
  if (!e.m && !e.p) {
    e.p = _LAZY_SRC[key]().then(function (m) { e.m = (m && m.default && !m[_LAZY_FN[key]]) ? m.default : m; }, function () { e.p = null; });
  }
  return e.m;
}
// the in-world HUD set loads after the menu stands (kicked off on the first paint anywhere), ready long before Enter World
var _HUD_SRC = { hud: function () { return import('./lib/ui-hud.js'); }, quest: function () { return import('./lib/ui-quest.js'); },
  vendor: function () { return import('./lib/ui-vendor.js'); }, welcome: function () { return import('./lib/ui-welcome.js'); },
  splash: function () { return import('./lib/ui-zone-splash.js'); }, creation: function () { return import('./lib/ui-creation.js'); }, flight: function () { return import('./lib/ui-flight.js'); }, chat: function () { return import('./lib/ui-chat.js'); }, tips: function () { return import('./lib/ui-tip-reminder.js'); }, buffs: function () { return import('./lib/ui-buff-icons.js'); }, trades: function () { return import('./lib/ui-trades.js'); } };
var _hudMods = {};
function _hm(key) {
  var e = _hudMods[key] || (_hudMods[key] = { m: null, p: null });
  if (!e.m && !e.p) e.p = _HUD_SRC[key]().then(function (m) { e.m = m; }, function () { e.p = null; });
  return e.m;
}
function _hf(key, fn) { var m = _hm(key); if (!m) return null; return m[fn] || (m.default && m.default[fn]) || null; }
function renderChat(a, b, c) { var f = _hf('chat', 'renderChat'); return f ? f(a, b, c) : ''; }
function renderTipReminder(a) { var f = _hf('tips', 'renderTipReminder'); return f ? f(a) : ''; }
function renderBuffIcons(a, b) { var f = _hf('buffs', 'renderBuffIcons'); return f ? f(a, b) : ''; }
function renderHUD(a, b, c) { var f = _hf('hud', 'renderHUD'); return f ? f(a, b, c) : ''; }
function renderWelcomeWindow(a) { var f = _hf('welcome', 'renderWelcomeWindow'); return f ? f(a) : ''; }
function renderQuestDialog(a, b) { var f = _hf('quest', 'renderQuestDialog'); return f ? f(a, b) : ''; }
function renderTurnInDialog(a, b) { var f = _hf('quest', 'renderTurnInDialog'); return f ? f(a, b) : ''; }
function renderQuestTracker(a, b) { var f = _hf('quest', 'renderQuestTracker'); return f ? f(a, b) : ''; }
function renderFlightMap(a) { var f = _hf('flight', 'renderFlightMap'); return f ? f(a) : ''; }
function renderTradeWindow(a) { var f = _hf('trades', 'renderTradeWindow'); return f ? f(a) : ''; }
function renderAuction(a) { var f = _hf('trades', 'renderAuction'); return f ? f(a) : ''; }
function renderVendor(a, b) { var f = _hf('vendor', 'renderVendor'); return f ? f(a, b) : ''; }
function renderBank(a) { var f = _hf('vendor', 'renderBank'); return f ? f(a) : ''; }
function renderZoneSplash(a) { var f = _hf('splash', 'renderZoneSplash'); return f ? f(a) : ''; }
function zoneSplashActive() { var f = _hf('splash', 'zoneSplashActive'); return f ? f() : false; }
function resetZoneSplash() { var f = _hf('splash', 'resetZoneSplash'); if (f) f(); }
function _warmHud() { _hm('creation'); _hm('splash'); _hm('hud'); _hm('quest'); _hm('vendor'); _hm('trades'); _hm('welcome'); _hm('flight'); _hm('chat'); _hm('tips'); _hm('buffs'); }
function renderMenuPanel(a, b, c) { var m = _lazyMod('menu'); return m ? m.renderMenuPanel(a, b, c) : ''; }
function renderWorldMapOverlay(a, b, c) { var m = _lazyMod('menu'); return m ? m.renderWorldMapOverlay(a, b, c) : ''; }
function renderDoorPanel(a) { var m = _lazyMod('door'); return m ? m.renderDoorPanel(a) : ''; }
const WHF = require('./lib/ui-frames.js');
const { versionTag } = require('./lib/version.js');
const { renderHerald, renderRealmChip } = require('./lib/ui-herald.js');
function renderGnomeTipJar(a, b) { var m = _lazyMod('gnome'); return m ? m.renderGnomeTipJar(a, b) : ''; }
function renderGuildPanel(a, b) { var m = _lazyMod('guild'); return m ? m.renderGuildPanel(a, b) : ''; }
function renderGuildInvitePopup(a) { var m = _lazyMod('guild'); return m ? m.renderGuildInvitePopup(a) : ''; }
const { renderMainMenu } = require('./lib/ui-main-menu.js');
const { renderSettingsTab } = require('./lib/ui-settings.js');
const { renderCharacterRoster } = require('./lib/ui-character-roster.js');
function renderVampireDialog(a) { var m = _lazyMod('vamp'); return m ? m.renderVampireDialog(a) : ''; }
function renderCursedItemDialog(a) { var m = _lazyMod('cursed'); return m ? m.renderCursedItemDialog(a) : ''; }

var FONT_INJECTOR = '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="(function(){if(window._FFLA)return;window._FFLA=1;var f1=new FontFace(\'Cinzel\',\'url(/cdn/font-cinzel-regular.woff2)\',{weight:\'400\',display:\'swap\'});var f2=new FontFace(\'Cinzel\',\'url(/cdn/font-cinzel-bold.woff2)\',{weight:\'700\',display:\'swap\'});f1.load().then(function(l){document.fonts.add(l)}).catch(function(){});f2.load().then(function(l){document.fonts.add(l)}).catch(function(){})})()" style="display:none" />';

var NAME_SWEEP = '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="var e=document.getElementById(\'fa-name-persist\');if(e)e.remove();" style="display:none" />';
var FONT_STYLE = '<style>@font-face{font-family:"Cinzel";src:url("/cdn/font-cinzel-regular.woff2") format("woff2");font-weight:400;font-display:swap}@font-face{font-family:"Cinzel";src:url("/cdn/font-cinzel-bold.woff2") format("woff2");font-weight:700;font-display:swap}#fa-ui-root .fa-chat,#fa-ui-root .fa-chat *,#fa-ui-root [data-chat],#fa-ui-root [data-chat] *{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important}#questDragPanel,#turnInDragPanel{position:relative}[id^=spell-slot-]{position:relative}[id^=spell-slot-]::after{content:"";position:absolute;inset:-3px;pointer-events:none;border:8px solid transparent;border-image:url(/cdn/value.bdaf39a924dbd4121886cbc2a97d325e147674a5b952f68c4c1fa822612dd633.webp) 24 / 8px / 0 stretch;opacity:.95}.spell-tt-inner{position:relative}.spell-tt-inner::after{content:"";position:absolute;inset:-4px;pointer-events:none;border:14px solid transparent;border-image:url(/cdn/panel-border-011-u73umsgv7.webp) 24 / 14px / 0 stretch;filter:sepia(1) saturate(3) brightness(1.15)}#fa-ui-root .brass-plate{position:relative;isolation:isolate}#fa-ui-root .brass-plate::before{content:"";position:absolute;inset:-5px;z-index:-1;pointer-events:none;border:16px solid transparent;border-image:url(/cdn/panel-002-u0ebcgjt4.webp) 24 fill / 16px / 0 stretch;filter:sepia(1) saturate(2.2) brightness(.55) hue-rotate(-8deg);opacity:.9}#fa-ui-root [data-panel-frame]{position:relative}#fa-ui-root [data-panel-frame]::after{content:"";position:absolute;inset:-6px;pointer-events:none;border:22px solid transparent;border-image:url(/cdn/panel-transparent-border-003-u1fgujvgg.webp) 24 / 22px / 0 round;filter:sepia(1) saturate(3) brightness(1.15) hue-rotate(-8deg)}</style>';

var ART_HIDE_CSS = '<style>'
  + '#fa-ui-root.fa-hide-art img[src*="frame-gothic-circular-bronze-thorns"],'
  + '#fa-ui-root.fa-hide-art img[src*="ui-gothic-ornate-progress-artbar"],'
  + '#fa-ui-root.fa-hide-art img[src*="ui-gothic-thorned-circular-frame"],'
  + '#fa-ui-root.fa-hide-art img[src*="frame-gothic-ornate-skull-bronze"],'
  + '#fa-ui-root.fa-hide-art img[src*="ui-gothic-bronze-corner-frame-border"]'
  + '{display:none !important;}'
  + '#fa-ui-root.fa-hide-art [style*="ui-gothic-demon-skull-panel"],'
  + '#fa-ui-root.fa-hide-art [style*="texture-purple-demonic-swirl"]'
  + '{background-image:none !important;}'
  + '</style>';

var FONT_WRAP_OPEN_BASE = FONT_STYLE + ART_HIDE_CSS + '<div id="fa-ui-root" style="position:fixed;top:0;left:0;width:100vw;height:100vh;">';
var FONT_WRAP_OPEN = FONT_WRAP_OPEN_BASE;
var FONT_WRAP_CLOSE = '</div>';

export function renderMainMenuSettingsOverlay(localPlayer) {
  var s = localPlayer.state;
  if (s.menuTab !== 'settings') return '';

  return ''
    + '<div style="position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;pointer-events:none;">'
      + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(22,16,28,0.45),rgba(0,0,0,0.82));backdrop-filter:blur(7px);pointer-events:auto;"></div>'
      + '<div data-interactive style="position:relative;width:min(460px,calc(100vw - 40px));max-height:calc(100vh - 72px);padding:20px 22px 22px;overflow:auto;pointer-events:auto;'
        + 'background:linear-gradient(180deg,rgba(22,18,20,0.96),rgba(12,10,12,0.98));border:1px solid rgba(170,135,88,0.45);border-radius:10px;'
        + 'box-shadow:0 24px 80px rgba(0,0,0,0.68),0 0 36px rgba(120,80,32,0.16),inset 0 1px 0 rgba(255,235,205,0.05);">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;">'
          + '<div>'
            + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:28px;letter-spacing:3px;color:rgba(226,205,168,0.95);text-transform:uppercase;">Settings</div>'
            + '<div style="margin-top:4px;font-family:Cinzel,Palatino,Georgia,serif;font-size:11px;letter-spacing:3px;color:rgba(166,142,110,0.58);text-transform:uppercase;">Main Menu Configuration</div>'
          + '</div>'
          + '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'inventory\'})" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:999px;cursor:pointer;pointer-events:auto;'
            + 'border:1px solid rgba(170,135,88,0.42);background:rgba(30,22,18,0.9);color:rgba(220,196,155,0.78);font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;transition:all 0.2s ease;"'
            + ' onmouseenter="this.style.borderColor=\'rgba(220,186,132,0.75)\';this.style.color=\'rgba(245,225,190,0.95)\'"'
            + ' onmouseleave="this.style.borderColor=\'rgba(170,135,88,0.42)\';this.style.color=\'rgba(220,196,155,0.78)\'">×</div>'
        + '</div>'
        + '<div style="padding:16px;border:1px solid rgba(88,70,46,0.42);border-radius:8px;background:linear-gradient(180deg,rgba(28,22,18,0.78),rgba(18,14,12,0.88));box-shadow:inset 0 1px 0 rgba(255,245,220,0.03);">'
          + renderSettingsTab(s)
        + '</div>'
      + '</div>'
    + '</div>';
}

export function getRightHudLayout() {
  var viewportWidth = 1920;
  var viewportHeight = 1080;
  var doc = typeof globalThis !== 'undefined' ? globalThis.document : null;

  if (typeof window !== 'undefined') {
    viewportWidth = Math.max(
      0,
      window.innerWidth
        || (doc && doc.documentElement && doc.documentElement.clientWidth)
        || viewportWidth
    );
    viewportHeight = Math.max(
      0,
      window.innerHeight
        || (doc && doc.documentElement && doc.documentElement.clientHeight)
        || viewportHeight
    );
  }

  var rightHudScale = 1;
  var rightHudMode = 'full';

  if (viewportHeight < 900 || viewportWidth < 1440) {
    rightHudScale = 0.72;
    rightHudMode = 'compact-tight';
  } else if (viewportHeight < 1080 || viewportWidth < 1600) {
    rightHudScale = 0.78;
    rightHudMode = 'compact';
  }

  var minimapRight = 16;
  var minimapTop = 20;
  var menuRight = 8;
  var menuBottom = 28;
  var minimapSize = 220;
  var buffGap = 4;

  return {
    viewportWidth: viewportWidth,
    viewportHeight: viewportHeight,
    rightHudScale: rightHudScale,
    rightHudMode: rightHudMode,
    minimapTop: minimapTop,
    minimapRight: minimapRight,
    menuRight: menuRight,
    menuBottom: menuBottom,
    buffRight: Math.round(minimapRight + (minimapSize * rightHudScale) + buffGap),
  };
}

// Client-side latch: once we've EVER shown the HUD, never show loading/menu again in this session.
// This survives transient state flickers that momentarily clear characterCreated/phase.
// the race's home zone, painted (creator art, 2026-10-08)
var RACE_ART = { marchborn: '/cdn/chatgpt-image-oct-7-2026-09-54-03-pm-1-u5u429bhl.webp', briarkin: '/cdn/chatgpt-image-oct-7-2026-09-54-04-pm-2-u6195ot7r.webp',
  emberforged: '/cdn/chatgpt-image-oct-7-2026-09-54-06-pm-5-u50038dxi.webp', saltborn: '/cdn/chatgpt-image-oct-7-2026-09-54-07-pm-7-u6hx0nqke.webp' };
var __faEverPlayed = false;

export default function(world, localPlayer) {
  _warmHud();
  var characterCreated = localPlayer.state.characterCreated === true;
  var phase = localPlayer.state.phase;
  var isCreating = phase === 'creating';
  var rightHudLayout = getRightHudLayout();

  // ABSOLUTE: returning players with a created character should NEVER see
  // the loading screen on CMD-R. Lock the latch immediately.
  if (characterCreated && !isCreating) {
    __faEverPlayed = true;
  }

  // Character creation must always win over the gameplay HUD latch.
  // Existing roster data (_hasCharacter/_dataLoaded) is allowed during creation,
  // but it must not force the session back into HUD mode.
  if (isCreating) {
    __faEverPlayed = false;
  } else if (characterCreated || phase === 'playing' || localPlayer.state._hasCharacter || localPlayer.state._dataLoaded) {
    __faEverPlayed = true;
  }

  // Unlatch: if the player explicitly returned to main menu, allow menu to show again
  if (localPlayer.state.inMainMenu && !characterCreated && (phase === 'mainMenu' || !phase)) {
    __faEverPlayed = false;
  }

  // Main menu — show only the title screen + character roster
  if (localPlayer.state.inMainMenu && !characterCreated && !__faEverPlayed) {
    try { resetZoneSplash(); } catch (eZ) {}
    return FONT_INJECTOR + FONT_WRAP_OPEN + '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="var e=document.getElementById(\'fa-name-persist\');if(e)e.remove();" style="display:none" />' + renderMainMenu(localPlayer) + renderCharacterRoster(localPlayer) + renderGnomeTipJar(localPlayer) + versionTag() + FONT_WRAP_CLOSE;
  }
  var hideArt = localPlayer.state.hideUiArt === true;
  var wrapOpen = hideArt
    ? (FONT_STYLE + ART_HIDE_CSS + '<div id="fa-ui-root" class="fa-hide-art" style="position:fixed;top:0;left:0;width:100vw;height:100vh;">')
    : FONT_WRAP_OPEN;
  
  // Show HUD: if we've EVER played this session, always show HUD no matter what
  var isGameplay = __faEverPlayed || characterCreated || phase === 'playing';
  if (!isGameplay && !localPlayer.state.inMainMenu && (localPlayer.state._hasCharacter || localPlayer.state._dataLoaded)) {
    isGameplay = true;
  }
  // Never show HUD during character creation — fall through to creation UI
  if (isCreating) {
    isGameplay = false;
  }
  if (isGameplay) {
    var hideControls = localPlayer.state.controlsHidden === true || (localPlayer.state.level || 1) >= 2 || !!((localPlayer.state.activeQuests || []).length || (localPlayer.state.completedQuests || []).length);
    try {
      var _hudParts = [];
      _hudParts.push('<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="var e=document.getElementById(\'fa-name-persist\');if(e)e.remove();window.__faCharName=undefined;" style="display:none" />');
      try { _hudParts.push(renderHUD(localPlayer, world, rightHudLayout)); } catch(e1) { _hudParts.push(''); }
      try { _hudParts.push(renderHerald(world)); } catch(eH) { _hudParts.push(''); }
      try { _hudParts.push(renderRealmChip(localPlayer)); } catch(eR) { _hudParts.push(''); }
      if (!hideControls) { try { _hudParts.push(renderWASD(localPlayer, rightHudLayout)); } catch(e2) { _hudParts.push(''); } }
      try { _hudParts.push(renderChat(localPlayer, world, rightHudLayout)); } catch(e3) { _hudParts.push(''); }
      try { _hudParts.push(renderMenuPanel(localPlayer, world, rightHudLayout)); } catch(e4) { _hudParts.push(''); }
      try { _hudParts.push(renderWorldMapOverlay(localPlayer.state, localPlayer.feetPosition, localPlayer.state._lastAnnouncedPlace)); } catch(e5) { _hudParts.push(''); }
      if (localPlayer.state.showWelcome) { try { _hudParts.push(renderWelcomeWindow()); } catch(e6) { _hudParts.push(''); } }
      try { if (phase === 'playing' && !localPlayer.state.inMainMenu) _hudParts.push(renderZoneSplash(localPlayer)); else resetZoneSplash(); } catch(e7z) { _hudParts.push(''); }
      try { if (!zoneSplashActive()) _hudParts.push(renderZoneBanner(localPlayer)); } catch(e7) { _hudParts.push(''); }
      try { _hudParts.push(renderQuestTracker(localPlayer, world)); } catch(e7b) { _hudParts.push(''); }
      if (localPlayer.state.showQuestDialog) { try { _hudParts.push(localPlayer.state.questDialogData && localPlayer.state.questDialogData.turnIn ? renderTurnInDialog(localPlayer) : renderQuestDialog(localPlayer)); } catch(e8) { _hudParts.push(''); } }
      try { _hudParts.push(renderDoorPanel(localPlayer)); } catch(e9) { _hudParts.push(''); }
      try { if (localPlayer.state && localPlayer.state.vendorOpen) _hudParts.push(renderVendor(localPlayer)); } catch(e9v) { _hudParts.push(''); }
      try { if (localPlayer.state && localPlayer.state.bankOpen) _hudParts.push(renderBank(localPlayer)); } catch(e9b) { _hudParts.push(''); }
      try { if (localPlayer.state && localPlayer.state.tradeOpen) _hudParts.push(renderTradeWindow(localPlayer)); } catch(e9t) { _hudParts.push(''); }
      try { if (localPlayer.state && localPlayer.state.ahOpen) _hudParts.push(renderAuction(localPlayer)); } catch(e9a) { _hudParts.push(''); }
      try { if (localPlayer.state && localPlayer.state.flightMap) _hudParts.push(renderFlightMap(localPlayer)); } catch(e9f) { _hudParts.push(''); }
      try { _hudParts.push(renderBuffIcons(localPlayer, rightHudLayout)); } catch(e10) { _hudParts.push(''); }
      try { _hudParts.push(renderGuildPanel(localPlayer, world)); } catch(e11) { _hudParts.push(''); }
      try { _hudParts.push(renderGuildInvitePopup(localPlayer)); } catch(e12) { _hudParts.push(''); }
      try { _hudParts.push(renderGnomeTipJar(localPlayer, rightHudLayout)); } catch(e13) { _hudParts.push(''); }
      try { _hudParts.push(renderTipReminder(localPlayer)); } catch(e14) { _hudParts.push(''); }
      try { _hudParts.push(renderVampireDialog(localPlayer)); } catch(e15) { _hudParts.push(''); }
      try { _hudParts.push(renderCursedItemDialog(localPlayer)); } catch(e16) { _hudParts.push(''); }
      try { _hudParts.push(WHF.CSS + WHF.renderUnitFrames(localPlayer) + WHF.renderDock(localPlayer) + WHF.renderBackpack(localPlayer) + WHF.renderGameMenu()); } catch(e17) { _hudParts.push(''); }
      var _whCls = ''; try { _whCls = WHF.rootClasses(localPlayer.state || {}); } catch(e18) {}
      var _wrap = _whCls ? wrapOpen.replace('<div id="fa-ui-root"', '<div id="fa-ui-root" data-wh="1"').replace(/<div id="fa-ui-root"([^>]*?)( class="([^"]*)")?/, function(m, a, b, c) { return '<div id="fa-ui-root"' + a.replace(/ class="[^"]*"/, '') + ' class="' + ((c || '') + ' ' + _whCls).trim() + '"'; }) : wrapOpen;
      return FONT_INJECTOR + _wrap + _hudParts.join('') + FONT_WRAP_CLOSE;
    } catch(e) {
      return FONT_INJECTOR + wrapOpen + '<div class="fixed top-24 left-4" style="color:red;font-size:14px;background:rgba(0,0,0,0.85);padding:12px;border-radius:8px;max-width:600px;z-index:99999;">HUD error: ' + e.message + ' STACK: ' + (e.stack || '').substring(0, 300) + '</div>' + FONT_WRAP_CLOSE;
    }
  }
  
  // Loading phase — GIF background + loading bar
  // ABSOLUTE GUARD: if we've ever played this session, NEVER show loading screen
  // unless the player is explicitly in character creation.
  if (__faEverPlayed && !isCreating) {
    // State is flickering — force HUD display with error recovery
    var hideControls2 = localPlayer.state.controlsHidden === true || (localPlayer.state.level || 1) >= 2 || !!((localPlayer.state.activeQuests || []).length || (localPlayer.state.completedQuests || []).length);
    try {
      return FONT_INJECTOR + NAME_SWEEP + wrapOpen + renderHUD(localPlayer, world, rightHudLayout)
        + (hideControls2 ? '' : renderWASD(localPlayer, rightHudLayout))
        + renderChat(localPlayer, world, rightHudLayout)
        + renderMenuPanel(localPlayer, world, rightHudLayout)
        + FONT_WRAP_CLOSE;
    } catch(e) {
      return FONT_INJECTOR + wrapOpen + '<div class="fixed inset-0" style="background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">Reconnecting...</div>' + FONT_WRAP_CLOSE;
    }
  }
  // ONLY show loading screen for brand new characters who have never played
  if ((phase === 'loading' || !phase) && !localPlayer.state._hasCharacter && !localPlayer.state._dataLoaded) {
    var loadTimer = localPlayer.state.loadingTimer ?? 0;
    var pct = Math.min(loadTimer / 5, 1) * 100;
    return FONT_INJECTOR + FONT_WRAP_OPEN
      + '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="var e=document.getElementById(\'fa-name-persist\');if(e)e.remove();" style="display:none" />'
      + '<div class="fixed inset-0" style="background:#000;">'
      // Background art
      + '<img src="/cdn/chatgpt-image-oct-7-2026-09-54-07-pm-7-u6hx0nqke.webp" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />'
      // Dark overlay for readability
      + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);pointer-events:none;"></div>'
      // Bottom vignette
      + '<div style="position:absolute;bottom:0;left:0;width:100%;height:40%;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);pointer-events:none;"></div>'
      // Loading bar container — centered at bottom
      + '<div style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);width:360px;">'
        // Track background
        + '<div style="width:100%;height:8px;background:rgba(20,15,10,0.9);border:1px solid rgba(120,100,60,0.4);border-radius:4px;overflow:hidden;">'
          // Fill bar
          + '<div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,oklch(0.4 0.22 300),oklch(0.55 0.25 290));border-radius:3px;transition:width 0.3s ease;box-shadow:0 0 8px rgba(140,60,220,0.5);"></div>'
        + '</div>'
        // Loading text
        + '<div data-font="title" style="text-align:center;margin-top:10px;font-size:14px;color:rgba(200,180,120,0.7);letter-spacing:3px;text-transform:uppercase;">Loading</div>'
      + '</div>'
      // Logo pulse animation
      + '<style>@keyframes logoPulse { 0%,100% { filter:drop-shadow(0 0 30px rgba(120,60,200,0.4)); } 50% { filter:drop-shadow(0 0 50px rgba(120,60,200,0.7)); } }</style>'
      + '</div>'
      + FONT_WRAP_CLOSE;
  }
  
  // Creation-to-Sanctum loading screen
  if (localPlayer.state.loadingScreen) {
    var lPct = Math.min(localPlayer.state.loadingProgress ?? 0, 100);
    return FONT_INJECTOR + FONT_WRAP_OPEN
      + '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="var e=document.getElementById(\'fa-name-persist\');if(e)e.remove();window.__faCharName=undefined;" style="display:none" />'
      + '<div class="fixed inset-0" style="background:#000;">'
      + '<img src="' + (RACE_ART[(RACES[localPlayer.state.raceIndex || 0] || {}).id] || RACE_ART.marchborn) + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />'
      + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);pointer-events:none;"></div>'
      + '<div style="position:absolute;bottom:0;left:0;width:100%;height:40%;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);pointer-events:none;"></div>'
      + '<div style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);width:360px;">'
        + '<div style="width:100%;height:8px;background:rgba(20,15,10,0.9);border:1px solid rgba(120,100,60,0.4);border-radius:4px;overflow:hidden;">'
          + '<div style="width:' + lPct + '%;height:100%;background:linear-gradient(90deg,oklch(0.5 0.2 145),oklch(0.65 0.22 145));border-radius:3px;transition:width 0.3s ease;box-shadow:0 0 8px rgba(60,200,80,0.5);"></div>'
        + '</div>'
        + '<div data-font="title" style="text-align:center;margin-top:10px;font-size:14px;color:rgba(200,180,120,0.7);letter-spacing:3px;text-transform:uppercase;">Entering the World</div>'
      + '</div>'
      + '<style>@keyframes logoPulse { 0%,100% { filter:drop-shadow(0 0 30px rgba(120,60,200,0.4)); } 50% { filter:drop-shadow(0 0 50px rgba(120,60,200,0.7)); } }</style>'
      + '</div>'
      + FONT_WRAP_CLOSE;
  }

  // Only show creation if explicitly in creating phase
  if (isCreating) {
    return FONT_INJECTOR + wrapOpen + renderCharacterCreation(localPlayer) + FONT_WRAP_CLOSE;
  }

  // Fallback — force HUD instead of loading screen for returning players
  // If persistence has restored characterCreated or phase === 'playing', show HUD
  if (characterCreated || phase === 'playing' || localPlayer.state._hasCharacter || localPlayer.state._dataLoaded) {
    __faEverPlayed = true;
    try {
      return FONT_INJECTOR + NAME_SWEEP + wrapOpen + renderHUD(localPlayer, world, rightHudLayout) + FONT_WRAP_CLOSE;
    } catch(e) {
      return FONT_INJECTOR + wrapOpen + '<div class="fixed inset-0" style="background:#0a0a0f;"></div>' + FONT_WRAP_CLOSE;
    }
  }
  // True unknown state — black screen, no loading art
  return FONT_INJECTOR + FONT_WRAP_OPEN
    + '<div class="fixed inset-0" style="background:#0a0a0f;"></div>'
    + FONT_WRAP_CLOSE;
}



// renderWelcomeWindow is now in lib/ui-welcome.js

export function renderZoneBanner(localPlayer) {
  var name = localPlayer.state._zoneBanner;
  var tick = localPlayer.state._zoneBannerTick;
  if (!name || !tick) return '';
  // Never render meta place IDs as banners
  if (name.indexOf('menu') !== -1 || name.indexOf('creation') !== -1) return '';
  // Show for ~4 seconds (240 ticks at 60fps)
  var elapsed = (window._faTick || 0) - tick;
  // Use frame counter to track time
  if (!window._faZoneTick || tick !== window._faZoneTickId) {
    window._faZoneTickId = tick;
    window._faZoneTick = Date.now();
  }
  var ms = Date.now() - window._faZoneTick;
  if (ms > 4000) return '';
  var opacity = ms < 600 ? (ms / 600) : ms > 3200 ? (1 - (ms - 3200) / 800) : 1;
  return '<div style="'
    + 'position:fixed;top:80px;left:0;right:0;'
    + 'display:flex;justify-content:center;align-items:center;'
    + 'pointer-events:none;z-index:200;'
    + 'opacity:' + opacity.toFixed(3) + ';'
    + 'transition:opacity 0.3s ease;'
    + '">'
    + '<div style="'
    + 'font-family:Cinzel,serif;font-size:32px;font-weight:700;'
    + 'color:oklch(0.88 0.06 60);'
    + 'text-shadow:0 0 20px rgba(180,140,60,0.4),0 0 40px rgba(0,0,0,0.8),0 2px 8px rgba(0,0,0,0.9);'
    + 'letter-spacing:4px;text-transform:uppercase;'
    + '">' + name + '</div>'
    + '</div>';
}


export function renderWASD(localPlayer, rightHudLayout) {
  var wasdScale = ((rightHudLayout && rightHudLayout.rightHudScale) || 1) * 0.72;
  var wasdScaleStyle = wasdScale < 1 ? "transform:translateY(-50%) scale(" + wasdScale + ");transform-origin:top left;" : "transform:translateY(-50%);";
  const keyStyle = `
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(30,15,20,0.85), rgba(50,25,35,0.75));
    border: 2px solid rgba(140,90,120,0.5);
    border-radius: 4px;
    color: rgba(200,170,190,0.8);
    font-family: Cinzel, 'Palatino', Georgia, serif;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 6px rgba(160,100,200,0.4);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(120,60,160,0.15);
  `;

  const wideKeyStyle = `
    height: 40px; padding: 0 14px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(30,15,20,0.85), rgba(50,25,35,0.75));
    border: 2px solid rgba(140,90,120,0.5);
    border-radius: 4px;
    color: rgba(200,170,190,0.8);
    font-family: Cinzel, 'Palatino', Georgia, serif;
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 6px rgba(160,100,200,0.4);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(120,60,160,0.15);
  `;

  const key = (label) => `<div style="${keyStyle}">${label}</div>`;

  const hintStyle = `
    font-family: Cinzel, 'Palatino', Georgia, serif;
    font-size: 14px;
    color: rgba(200,170,190,0.55);
    letter-spacing: 0.5px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  `;

  return `
    <div style="
      position:fixed; top:50%; left:-58px; z-index:40; ${wasdScaleStyle}
      pointer-events:none;
      opacity: 0.72;
      width: 370px;
      height: 528px;
    ">
      <!-- Bronze skull frame background -->
      <img src="/cdn/frame-gothic-ornate-skull-bronze-zv8258tp.webp" style="
        position:absolute;top:-16px;bottom:-16px;left:10px;right:-42px;width:calc(100% + 32px);height:calc(100% + 32px);
        object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none;
        filter:drop-shadow(0 4px 14px rgba(0,0,0,0.8));
      " />
      <!-- Close button on top of frame -->
      <div data-interactive onclick="sendAction('hideControls')" style="
        position:absolute; top:50px; right:80px; z-index:10;
        width:28px; height:28px; border-radius:50%; cursor:pointer; pointer-events:auto;
        display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,0.9);
        border:1px solid rgba(80,60,90,0.6);
        font-family:Cinzel,serif; font-size:15px; font-weight:bold;
        color:rgba(160,100,220,0.9); text-shadow:0 0 6px rgba(160,100,220,0.4);
        box-shadow:0 2px 8px rgba(0,0,0,0.7);
        transition:all 0.15s;
      " onmouseenter="this.style.color='rgba(200,140,255,1)';this.style.textShadow='0 0 10px rgba(160,100,220,0.7)';this.style.background='rgba(20,10,25,0.95)';"
         onmouseleave="this.style.color='rgba(160,100,220,0.9)';this.style.textShadow='0 0 6px rgba(160,100,220,0.4)';this.style.background='rgba(0,0,0,0.9)';">✕</div>
      <!-- Controls overlay -->
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:10px 20px 30px 20px;margin-left:10px;margin-top:0px;transform:scale(0.9);">
        <!-- WASD keys -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:12px;">
          <div style="display:flex;justify-content:center;">
            ${key('W')}
          </div>
          <div style="display:flex;gap:3px;">
            ${key('A')}
            ${key('S')}
            ${key('D')}
          </div>
        </div>

        <!-- Hints -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="${wideKeyStyle}">SHIFT</div>
            <span style="${hintStyle}">Hold to run</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            ${key('E')}
            <span style="${hintStyle}">Interact</span>
          </div>

          <div style="display:flex;align-items:center;gap:10px;">
            ${key('Q')}
            <span style="${hintStyle}">Toggle targets</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" style="opacity:0.6;">
              <rect x="6" y="2" width="12" height="20" rx="6" fill="none" stroke="rgba(200,170,190,0.7)" stroke-width="1.5"/>
              <line x1="12" y1="6" x2="12" y2="3" stroke="rgba(200,170,190,0.7)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="6" x2="12" y2="9" stroke="rgba(200,170,190,0.7)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M9 4.5 L12 2.5 L15 4.5" fill="none" stroke="rgba(200,170,190,0.7)" stroke-width="1" stroke-linecap="round"/>
              <path d="M9 7.5 L12 9.5 L15 7.5" fill="none" stroke="rgba(200,170,190,0.7)" stroke-width="1" stroke-linecap="round"/>
            </svg>
            <span style="${hintStyle}">Scroll to zoom</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" style="opacity:0.6;">
              <rect x="6" y="2" width="12" height="20" rx="6" fill="none" stroke="rgba(200,170,190,0.7)" stroke-width="1.5"/>
              <rect x="6" y="2" width="6" height="9" rx="2" fill="rgba(200,170,190,0.35)" stroke="none"/>
              <rect x="12" y="2" width="6" height="9" rx="2" fill="rgba(200,170,190,0.35)" stroke="none"/>
              <line x1="12" y1="2" x2="12" y2="11" stroke="rgba(200,170,190,0.7)" stroke-width="1"/>
            </svg>
            <span style="${hintStyle}">L+R click to move</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" style="opacity:0.6;">
              <rect x="6" y="2" width="12" height="20" rx="6" fill="none" stroke="rgba(200,170,190,0.7)" stroke-width="1.5"/>
              <rect x="10" y="3" width="4" height="6" rx="2" fill="rgba(200,170,190,0.35)" stroke="none"/>
              <line x1="12" y1="2" x2="12" y2="11" stroke="rgba(200,170,190,0.7)" stroke-width="1"/>
            </svg>
            <span style="${hintStyle}">Middle click to orbit</span>
          </div>
        </div>
        <!-- Recommendation -->
        <div style="margin-top:26px;max-width:160px;font-family:Cinzel,'Palatino',Georgia,serif;font-size:15px;color:rgba(220,195,140,0.65);letter-spacing:0.5px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.8);line-height:1.4;">
          Recommended: WASD + LMB + RMB + 18 button mouse
        </div>
      </div>
    </div>
  `;
}

function renderCharacterCreation(a) { var f = _hf('creation', 'renderCharacterCreation'); return f ? f(a) : ''; }
