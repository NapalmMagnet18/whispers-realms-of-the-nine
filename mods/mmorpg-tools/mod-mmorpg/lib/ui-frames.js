// WHISPERS frames: unit frames, action-bar dock (XP, micro menu, purse), Backpack window, Game Menu, tooltips.
// Layout after the classic MMO reference; art is the game's own: charcoal, aged brass, parchment, Cinzel.
// Windows open on this machine only: window.__wh flags -> classes on #fa-ui-root (wh-bag, wh-panel, wh-menu).
var ICONS = require('./item-icons.js');
var ART = require('./ui-art.js');
var CUR = require('./currency.js');
var RACES = require('./races.js').RACES;
var UI = ICONS.UI_ICONS, iconFor = ICONS.iconFor;
var BR = ART.BORDERS, FR = ART.frame, RULE = ART.rule;
var QUALITY = { poor: '#9d9d9d', common: '#f4efe4', uncommon: '#3fd23f', rare: '#3d8fe8', epic: '#b25cf0', legendary: '#ff9a2e', quest: '#f2b04a' };
function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function money(state) { return CUR.formatHtml(CUR.purse(state)); }

// one style block, every frame reads from it
var CSS = '<style>'
  + '.wh-pan{' + FR('window', 12, 'rgba(14,11,8,.92)') + 'box-shadow:0 6px 24px rgba(0,0,0,.7);color:#e8d9b5;font-family:Cinzel,Palatino,Georgia,serif}'
  + '.wh-brass{border:1px solid #c9a46a;box-shadow:inset 0 0 0 1px #6b4a2f,inset 0 2px 4px rgba(0,0,0,.8),0 1px 2px rgba(0,0,0,.8)}'
  + '.wh-ring{border-radius:50%;border:3px solid #c9a46a;box-shadow:0 0 0 2px #6b4a2f,0 0 0 3px #1a120c,0 3px 8px rgba(0,0,0,.8),inset 0 0 10px rgba(0,0,0,.6);background:#120d09;overflow:hidden}'
  + '.wh-bar{position:relative;height:13px;background:#0b0907;border:1px solid #6b4a2f;box-shadow:inset 0 1px 3px #000;overflow:hidden}'
  + '.wh-bar>i{position:absolute;left:0;top:0;bottom:0;transition:width .3s}'
  + '.wh-bar>b{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 4px;font:600 10px/1 Geist,Arial,sans-serif;color:#fff;text-shadow:0 0 2px #000,0 1px 1px #000;letter-spacing:.2px}'
  + '.wh-name{height:18px;box-sizing:border-box;' + FR('banner', 3, '#14100c') + 'color:#f2b04a;font-size:11px;line-height:15px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px;text-shadow:0 1px 2px #000}'
  + '.wh-x{width:20px;height:20px;background:linear-gradient(#a3402f,#7a2e22 55%,#4d1b13);border:1px solid #c9a46a;color:#f2d9a0;font:700 13px/18px Arial,sans-serif;text-align:center;cursor:pointer;pointer-events:auto;box-shadow:0 1px 3px #000}'
  + '.wh-x:hover{filter:brightness(1.25)}'
  + '.wh-btn{display:block;width:100%;height:26px;margin:0 0 5px;background:linear-gradient(#9a3527,#7a2e22 50%,#561d15);border:1px solid #c9a46a;box-shadow:inset 0 1px 0 rgba(255,200,150,.25),0 1px 3px #000;color:#f2b04a;font:600 13px/24px Cinzel,serif;text-shadow:0 1px 2px #000;cursor:pointer;pointer-events:auto;text-align:center}'
  + '.wh-btn:hover{filter:brightness(1.2);color:#ffd27a}'
  + '.wh-mb{width:28px;height:32px;box-sizing:border-box;padding:1px;' + FR('actionSlot', 4, '#100c09') + 'cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center}'
  + '.wh-mb:hover{filter:brightness(1.3)}.wh-mb img{width:100%;height:100%;object-fit:contain;pointer-events:none}'
  + '.wh-slot{width:40px;height:40px;box-sizing:border-box;position:relative;' + FR('slot', 4, '#0a0806') + 'box-shadow:inset 0 2px 6px #000}'
  + '.wh-slot.full{cursor:pointer;pointer-events:auto}.wh-slot.full:hover{filter:brightness(1.3)}'
  + '.wh-slot img{width:100%;height:100%;object-fit:contain;pointer-events:none}'
  + '.wh-cnt{position:absolute;right:2px;bottom:0;font:700 12px/1.1 Arial,sans-serif;color:#fff;-webkit-text-stroke:.6px #000;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;pointer-events:none}'
  + '.wh-tip{display:none;position:absolute;z-index:600;min-width:180px;max-width:260px;padding:7px 9px;' + FR('tooltip', 6, 'rgba(8,7,10,.96)') + 'box-shadow:0 4px 18px #000;pointer-events:none;text-align:left;font-family:Geist,Arial,sans-serif;white-space:normal}'
  + '.wh-slot:hover .wh-tip{display:block}'
  + '.wh-tip .n{font:600 14px/1.25 Cinzel,serif}.wh-tip .t{color:#9a958c;font-size:12px;margin-top:1px}.wh-tip .s{color:#fff;font-size:12px;line-height:1.45}.wh-tip .f{color:#f2b04a;font-size:12px;margin-top:5px;font-style:italic;line-height:1.35}.wh-tip .p{color:#e8d9b5;font-size:12px;margin-top:5px}'
  + '#fa-ui-root:not(.wh-panel) [data-menu-panel]{display:none!important}'
  + '#fa-ui-root.wh-panel [data-menu-panel]{right:62px!important;bottom:84px!important}'
  + '#fa-ui-root:not(.wh-bag) .wh-bagwin{display:none}'
  + '#fa-ui-root:not(.wh-menu) .wh-gmenu{display:none}'
  + '</style>';

// one-time helpers on this page: whT(flag[,on]) flips a window, whTab(tab) opens the menu panel on a tab
var HELPERS = '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" style="display:none" onload="'
  + "if(!window.whT){window.__wh=window.__wh||{};"
  + "window.whT=function(k,on){var w=window.__wh,v=on===undefined?!w[k]:!!on;w[k]=v;var r=document.getElementById('fa-ui-root');if(r)r.classList.toggle('wh-'+k,v);};"
  + "window.whTab=function(t){var w=window.__wh,open=!(w.panel&&w.tab===t);w.tab=t;whT('panel',open);if(open)sendAction('setMenuTab',{tab:t});};"
  + "document.addEventListener('keydown',function(e){if(e.key==='Escape'){var w=window.__wh;if(w.bag||w.panel){whT('bag',false);whT('panel',false);}else whT('menu');}});}"
  + '" />';

// classes for #fa-ui-root this frame; a menuTab change from a key (K, J, N...) opens the panel too
function rootClasses(s) {
  if (typeof window === 'undefined') return '';
  var w = window.__wh = window.__wh || {};
  if (w.lastTab !== undefined && s.menuTab !== w.lastTab) {
    if (s.menuTab === 'inventory' || !s.menuTab) w.panel = false; else { w.panel = true; w.tab = s.menuTab; }
  }
  w.lastTab = s.menuTab;
  return (w.bag ? 'wh-bag ' : '') + (w.panel ? 'wh-panel ' : '') + (w.menu ? 'wh-menu' : '');
}

function bars(hp, maxHp, res, maxRes, hostile, resKind, mirror) {
  var hpPct = maxHp > 0 ? Math.max(0, Math.min(100, Math.round(hp / maxHp * 100))) : 0;
  var rPct = maxRes > 0 ? Math.max(0, Math.min(100, Math.round(res / maxRes * 100))) : 0;
  var hpFill = hostile ? 'linear-gradient(#e0473a,#a3201a 60%,#6e130f)' : 'linear-gradient(#5fd35a,#2f9a2a 60%,#1c6a19)';
  var rFill = resKind === 'rage' ? 'linear-gradient(#ffbe55,#d98a1e 60%,#8a5410)' : 'linear-gradient(#5b8fff,#2a55c8 60%,#16337e)';
  return '<div class="wh-bar"><i style="width:' + hpPct + '%;background:' + hpFill + ';' + (mirror ? 'left:auto;right:0;' : '') + '"></i><b><span>' + hpPct + '%</span><span>' + Math.round(hp) + '</span></b></div>'
    + (maxRes > 0 ? '<div class="wh-bar" style="height:9px;margin-top:1px"><i style="width:' + rPct + '%;background:' + rFill + ';' + (mirror ? 'left:auto;right:0;' : '') + '"></i><b style="font-size:8px"><span></span><span>' + Math.round(res) + '</span></b></div>' : '');
}

function unitFrame(o) {
  var portrait = '<div style="position:relative;width:58px;height:58px;flex:none">'
    + '<div class="wh-ring" style="width:58px;height:58px">' + (o.portrait ? '<img src="' + o.portrait + '" style="width:100%;height:100%;object-fit:cover" />' : '') + '</div>'
    + '<div style="position:absolute;' + (o.mirror ? 'left:-3px' : 'right:-3px') + ';bottom:-2px;width:20px;height:20px;border-radius:50%;background:radial-gradient(#3a2a1c,#120d09);border:2px solid #c9a46a;color:#f2b04a;font:700 10px/16px Cinzel,serif;text-align:center;box-shadow:0 1px 3px #000">' + esc(o.level) + '</div></div>';
  var body = '<div style="width:132px;' + (o.mirror ? 'margin-right:-6px;' : 'margin-left:-6px;') + 'padding:2px;' + FR('unitFrame', 8, 'rgba(14,11,8,.92)') + 'box-shadow:0 2px 8px rgba(0,0,0,.6)">'
    + '<div class="wh-name" style="' + (o.hostile ? 'color:#ff8a6a' : '') + '">' + esc(o.name) + '</div>'
    + '<div style="margin-top:2px">' + bars(o.hp, o.maxHp, o.res, o.maxRes, o.hostile, o.resKind, o.mirror) + '</div></div>';
  return '<div style="display:flex;align-items:center;pointer-events:none">' + (o.mirror ? body + portrait : portrait + body) + '</div>';
}

function targetPortrait(name) {
  var l = String(name).toLowerCase();
  return /wolf|hound|cat/.test(l) ? UI.wolf : /dragon|drake|wyrm/.test(l) ? UI.dragon : /orc|brute|scaveng/.test(l) ? UI.orc
    : /bird|crow|raven|harpy/.test(l) ? UI.bird : /warden|elite|boss|hollow/.test(l) ? UI.elite : /dummy/.test(l) ? UI.character : UI.character;
}

// top-left: player frame, target frame mirrored beside it
function renderUnitFrames(localPlayer) {
  var s = localPlayer.state || {};
  var race = RACES[s.raceIndex || 0];
  var portrait = race ? (s.genderIndex === 1 ? (race.femaleAnimatedPortrait || race.femalePortrait) : (race.maleAnimatedPortrait || race.malePortrait)) : '';
  var resKind = s.resourceType === 'rage' || s.resourceType === 'energy' ? 'rage' : 'mana';
  var html = '<div style="position:fixed;top:14px;left:14px;z-index:90;display:flex;gap:18px;align-items:center;pointer-events:none">'
    + unitFrame({ name: s.charName || localPlayer.displayName || 'Adventurer', level: s.level || 1, portrait: portrait, hp: s.health == null ? 1000 : s.health, maxHp: s.maxHealth || 1000, res: s.mana == null ? 500 : s.mana, maxRes: s.maxMana || 500, resKind: resKind });
  if (s.targetId) {
    var hasHp = s.targetHealth != null && s.targetMaxHealth > 0;
    html += unitFrame({ mirror: true, name: s.targetName || 'Unknown', level: s.targetLevel || (s.level || 1), portrait: targetPortrait(s.targetName || ''), hp: hasHp ? s.targetHealth : 0, maxHp: hasHp ? s.targetMaxHealth : 0, res: 0, maxRes: 0, hostile: s.targetFriendly !== true });
  }
  return html + '</div>';
}

// item tooltip, one look everywhere: quality-coloured name, grey type, white stats, gold flavour
function itemTooltip(item, pos) {
  if (!item) return '';
  var st = item.stats || {};
  var lines = '';
  if (st.damage) lines += '<div class="s">' + st.damage.min + ' - ' + st.damage.max + ' Damage</div>';
  if (st.armour != null) lines += '<div class="s">+' + st.armour + ' Armour</div>';
  if (st.attack != null && !st.damage) lines += '<div class="s">+' + st.attack + ' Attack</div>';
  if (st.healOverTime) lines += '<div class="s" style="color:#3fd23f">Use: restores health over time</div>';
  if (st.manaOverTime) lines += '<div class="s" style="color:#3fd23f">Use: restores mana over time</div>';
  var type = item.type || item.slot || (st.healOverTime ? 'Food' : st.manaOverTime ? 'Drink' : 'Item');
  type = String(type).charAt(0).toUpperCase() + String(type).slice(1);
  return '<div class="wh-tip" style="' + (pos || 'right:calc(100% + 6px);top:0') + '">'
    + '<div class="n" style="color:' + (QUALITY[item.quality || item.rarity] || QUALITY.common) + '">' + esc(item.name || 'Item') + '</div>'
    + '<div class="t">' + esc(type) + '</div>' + lines
    + (item.description ? RULE('tooltip', '100%', 8) + '<div class="f">"' + esc(item.description) + '"</div>' : '')
    + (item.sellable && item.sellPrice ? '<div class="p">Sell price: ' + CUR.formatHtml(item.sellPrice) + '</div>' : '')
    + '</div>';
}

// the same click an item had in the bag tab
function itemClick(item, i) {
  var a = item.id === 'runestone' ? "sendAction('useRunestone')" : item.id === 'war-banner' ? "sendAction('plantBanner')"
    : item.id === 'health-potion' ? "sendAction('useHealthPotion')" : item.id === 'mana-potion' ? "sendAction('useManaPotion')"
    : item.stats && item.stats.healOverTime ? "sendAction('useFood',{index:" + i + "})" : item.stats && item.stats.manaOverTime ? "sendAction('useWater',{index:" + i + "})"
    : "sendAction('equipItem',{index:" + i + "})";
  return ' data-interactive onclick="' + a + '"';
}

function renderBackpack(localPlayer) {
  var s = localPlayer.state || {};
  var inv = s.inventory || [];
  var n = Math.min(32, Math.max(16, Math.ceil(inv.length / 4) * 4));
  var cells = '';
  for (var i = 0; i < n; i++) {
    var it = inv[i], ic = it && iconFor(it);
    if (it && ic) {
      var cnt = it.count || it.quantity || it.qty;
      cells += '<div class="wh-slot full"' + itemClick(it, i) + ' style="border-color:' + (QUALITY[it.quality || it.rarity] && (it.quality || it.rarity) !== 'common' ? QUALITY[it.quality || it.rarity] : '#8a6a40') + '"><img src="' + ic + '" />'
        + (cnt > 1 ? '<span class="wh-cnt">' + cnt + '</span>' : '') + itemTooltip(it, i % 4 < 2 ? 'right:calc(100% + 6px);top:0' : 'right:calc(100% + 6px);top:0') + '</div>';
    } else cells += '<div class="wh-slot"></div>';
  }
  return '<div class="wh-bagwin wh-pan" data-interactive style="position:fixed;right:62px;bottom:84px;z-index:210;width:196px;padding:2px 4px 4px;pointer-events:auto">'
    + '<div style="display:flex;align-items:center;gap:6px;height:28px;margin:-2px -2px 4px;padding:0 2px;background:linear-gradient(#2a1e16,#15100c);border-bottom:1px solid #6b4a2f">'
    + '<div class="wh-ring" style="width:30px;height:30px;margin:-6px 0 0 -10px;flex:none;border-width:2px"><img src="' + UI.bag + '" style="width:100%;height:100%;object-fit:contain" /></div>'
    + '<div style="flex:1;text-align:center;color:#f2b04a;font-size:13px;text-shadow:0 1px 2px #000">Backpack</div>'
    + '<div class="wh-x" onclick="whT(\'bag\',false)">&#10005;</div></div>'
    + '<div style="display:flex;gap:4px;margin-bottom:6px"><div style="flex:1;height:16px;' + FR('input', 4, '#070605') + 'box-sizing:content-box;color:#6b5f4a;font:11px/15px Geist,Arial,sans-serif;padding-left:16px;position:relative">'
    + '<span style="position:absolute;left:4px;top:0;color:#6b5f4a">&#9906;</span>Search</div></div>'
    + RULE('list', '100%', 8) + '<div style="display:grid;grid-template-columns:repeat(4,40px);gap:4px;justify-content:center">' + cells + '</div>'
    + '<div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:6px;padding:1px 4px;' + FR('loot', 5, '#0a0806') + 'font:600 12px Geist,Arial,sans-serif;color:#fff">'
    + '<img src="' + UI.gold + '" style="width:16px;height:16px;object-fit:contain;margin-right:auto" />' + money(s) + '</div></div>';
}

// bottom centre: XP strip under the action bar, micro menu and purse to its right
function renderDock(localPlayer) {
  var s = localPlayer.state || {};
  var xp = s.xp || 0, need = s.xpToLevel || 1000, pct = Math.max(0, Math.min(100, xp / need * 100));
  var ticks = '';
  for (var t = 1; t < 20; t++) ticks += '<i style="position:absolute;top:0;bottom:0;left:' + t * 5 + '%;width:1px;background:rgba(0,0,0,.6)"></i>';
  var mb = function (icon, title, click) { return '<div class="wh-mb" title="' + title + '" data-interactive onclick="' + click + '"><img src="' + icon + '" /></div>'; };
  var mapSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z" fill="#c9a46a" stroke="#2a1e16"/><path d="M9 3v16M15 5v16" stroke="#6b4a2f"/></svg>');
  var gearSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#7a2e22" stroke="#c9a46a" stroke-width="2"/><text x="12" y="17" font-size="13" text-anchor="middle" fill="#f2b04a" font-family="serif" font-weight="bold">?</text></svg>');
  return HELPERS
    + '<div style="position:fixed;bottom:6px;left:50%;transform:translateX(-50%);width:540px;z-index:92;pointer-events:none">'
    + '<div class="wh-bar" style="height:12px;' + FR('castBar', 3, '#0b0907') + '"><i style="width:' + pct.toFixed(1) + '%;background:linear-gradient(#a874e8,#6a36b8 60%,#3f1d75)"></i>' + ticks
    + '<b style="justify-content:center;font-size:9px">XP: ' + xp + ' / ' + need + '</b></div></div>'
    + '<div style="position:fixed;bottom:6px;left:calc(50% + 282px);z-index:95;display:flex;align-items:flex-end;gap:3px;pointer-events:auto">'
    + mb(UI.character, 'Character', "whTab('character')")
    + mb(UI.spellbook, 'Spellbook', "whTab('spellbook')")
    + mb(UI.journal, 'Quest Journal', "whTab('quests')")
    + mb(mapSvg, 'World Map', "sendAction('toggleWorldMap')")
    + mb(gearSvg, 'Game Menu', "whT('menu')")
    + '<div style="display:flex;align-items:center;gap:4px;margin-left:5px">'
    + '<div class="wh-mb wh-ring" title="Backpack" data-interactive onclick="whT(\'bag\')" style="width:36px;height:36px;padding:3px"><img src="' + UI.bag + '" /></div>'
    + '<div style="font:600 12px Geist,Arial,sans-serif;color:#fff;text-shadow:0 1px 2px #000;padding:1px 4px;' + FR('notice', 5, 'rgba(14,11,8,.85)') + '">' + money(s) + '</div></div></div>';
}

// centred narrow Game Menu
function renderGameMenu() {
  var b = function (label, click) { return '<div class="wh-btn" data-interactive onclick="' + click + '">' + label + '</div>'; };
  return '<div class="wh-gmenu" style="position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;pointer-events:none">'
    + '<div class="wh-pan" data-interactive style="width:210px;padding:26px 16px 12px;position:relative;pointer-events:auto;' + FR('menu', 12, 'rgba(14,11,8,.94)') + '">'
    + '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);padding:3px 18px;background:linear-gradient(#3a2a1c,#1a120c);border:1px solid #c9a46a;box-shadow:inset 0 0 0 1px #6b4a2f,0 2px 6px #000;color:#f2b04a;font:600 13px Cinzel,serif;white-space:nowrap;text-shadow:0 1px 2px #000">Game Menu</div>'
    + RULE('menu', '100%', 10) + b('Options', "whT('menu',false);window.__wh.tab='settings';whT('panel',true);sendAction('setMenuTab',{tab:'settings'})")
    + b('Realm List', "whT('menu',false);sendAction('openRealmList')")
    + RULE('fadeBoth', '100%', 8)
    + b('Character Select', "whT('menu',false);sendAction('goToMainMenu')")
    + b('Log Out', "whT('menu',false);sendAction('logout')")
    + RULE('fadeDouble', '100%', 8)
    + b('Return to Game', "whT('menu',false)")
    + '</div></div>';
}

module.exports = { CSS: CSS, rootClasses: rootClasses, renderUnitFrames: renderUnitFrames, renderDock: renderDock, renderBackpack: renderBackpack, renderGameMenu: renderGameMenu, itemTooltip: itemTooltip, QUALITY: QUALITY };
