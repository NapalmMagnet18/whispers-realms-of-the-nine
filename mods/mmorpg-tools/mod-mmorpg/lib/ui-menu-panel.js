// Unified Gothic Menu Panel — MMORPG Tools Mod
// Always-visible side panel with tab navigation: Spellbook, Quests, Character, Inventory, Map
// Settings accessible via cogwheel. Lock/resize pattern from chat box.
// module.exports = { renderMenuPanel }

const { RACES, CLASSES } = require('./races.js');
const { ATTACK_SPELL, RACIAL_ABILITIES, CLASS_SPELLS, CLASS_EXTRA_SPELLS } = require('./racial-abilities.js');
const { TRACKS } = require('./music-tracks.js');
const { renderMusicTab: renderMusicTabNew } = require('./ui-music.js');
const { renderSettingsTab } = require('./ui-settings.js');
const { renderReputationTab } = require('./ui-reputation.js');
const { ITEM_LOOKUP } = require('./class-items.js');
const { QUEST_DATABASE } = require('./quest-data.js');
const { frame: _frame, rule: _rule } = require('./ui-art.js');
import { TREES, classKey, pointsFree, pointsEarned, fxText, talentFx, canPick, LEVEL_PER_POINT } from '../../../../scripts/lib/talents.js';
// brass kit pieces shared by every window in this panel
var _PLATE = 'position:absolute;top:-14px;left:50%;transform:translateX(-50%);padding:3px 18px;background:linear-gradient(#3a2a1c,#1a120c);border:1px solid #c9a46a;box-shadow:inset 0 0 0 1px #6b4a2f,0 2px 6px #000;color:#f2b04a;font:600 14px Cinzel,serif;letter-spacing:1px;white-space:nowrap;text-shadow:0 1px 2px #000;z-index:30;pointer-events:none;';
var _EMPTY_SLOT = 'border:1px solid rgba(201,164,106,.28);background:radial-gradient(rgba(42,30,22,.92),rgba(10,8,6,.95));';

var STAT_NAMES = ['Strength','Dexterity','Intelligence','Wisdom','Vitality','Endurance','Luck','Spirit'];
var STAT_KEYS  = ['strength','dexterity','intelligence','wisdom','vitality','endurance','luck','spirit'];
var RESIST_NAMES = ['Death Magic','Water Magic','Light Magic','Earth Magic','Arcane Magic','Cosmic Magic','Spirit Magic','Chaos Magic','Nature Magic','Dream Magic','Occult Magic','Shadow Magic','Blood Magic','Mind Magic','Air Magic','Fire Magic','Ancient Magic','Poison'];
var RESIST_KEYS  = ['death','water','light','earth','arcane','cosmic','spirit','chaos','nature','dream','occult','shadow','blood','mind','air','fire','ancient','poison'];
var RUNES = ['\u16A0','\u16A2','\u16A6','\u16A8','\u16B1','\u16B2','\u16B7','\u16B9','\u16BA','\u16BE','\u16C1','\u16C3','\u16C7','\u16C8','\u16C9','\u16CA','\u16CF','\u16D2','\u16D7','\u16DA','\u16DC','\u16DE','\u16DF','\u16E0','\u16E1','\u16E2','\u16E3','\u16E4','\u16E5','\u16E6'];

var TABS = [
  { id: 'inventory', key: 'B', icon: '/cdn/icon-painted-treasure-chest-overflowing-gold-no-border-dark-bg.png',   title: 'Inventory [B]' },
  { id: 'spellbook', key: 'P', icon: '/cdn/icon-painted-glowing-open-spellbook-runes-no-border-dark-bg.png', title: 'Spellbook [P]' },
  { id: 'quests',    key: 'L', icon: '/cdn/icon-painted-sealed-parchment-scroll-no-border-dark-bg.png',     title: 'Quests [L]' },
  { id: 'character', key: 'C', icon: '/cdn/icon-painted-steel-knight-helmet-front-no-border-dark-bg.png',     title: 'Character [C]' },
];

export function esc(str) { return String(str).replace(/'/g, '&#39;').replace(/</g, '&lt;'); }

// ─── EQUIPMENT SLOT (compact) ───
var SLOT_PLACEHOLDERS = {
  Armour:   '/cdn/icon-gothic-armor-chestplate-silhouette-dark.png',
  MainHand: '/cdn/icon-gothic-sword-silhouette-dark.png',
  OffHand:  '/cdn/icon-gothic-shield-silhouette-dark.png',
  Ring1:    '/cdn/icon-gothic-ring-silhouette-dark.png',
  Ring2:    '/cdn/icon-gothic-ring-silhouette-dark.png',
  Ring3:    '/cdn/icon-gothic-ring-silhouette-dark.png',
  Amulet:   '/cdn/icon-gothic-amulet-necklace-silhouette-dark.png',
  Head:     '/cdn/icon-gothic-helmet-silhouette-dark.png',
  Trinket1: '/cdn/icon-gothic-trinket-gem-silhouette-dark.png',
  Trinket2: '/cdn/icon-gothic-trinket-gem-silhouette-dark.png',
  Hands:    '/cdn/icon-gothic-gauntlet-silhouette-dark.png',
  Belt:     '/cdn/icon-gothic-belt-silhouette-dark.png',
  Feet:     '/cdn/icon-gothic-boots-silhouette-dark.png',
};

export function buildEqTooltip(item) {
  if (!item) return '';
  var name = (item.name || 'Item').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  var desc = (item.description || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');

  // Resolve stats: prefer item.stats, fall back to ITEM_LOOKUP
  var itemStats = item.stats || (ITEM_LOOKUP[item.id] ? ITEM_LOOKUP[item.id].stats : null);

  var statLines = '';
  if (itemStats) {
    if (itemStats.damage) {
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Damage: ' + itemStats.damage.min + ' - ' + itemStats.damage.max + '</div>';
    }
    if (itemStats.armour !== undefined) {
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Defence: +' + itemStats.armour + '</div>';
    }
    if (itemStats.defence !== undefined) {
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Defence: +' + itemStats.defence + '</div>';
    }
    if (itemStats.attack !== undefined && !itemStats.damage) {
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Attack: +' + itemStats.attack + '</div>';
    }
  }

  var descLine = '';
  if (desc) {
    descLine = '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(180,165,130,0.75);margin-top:4px;line-height:1.4;letter-spacing:0.3px;font-style:italic;">' + desc + '</div>';
  }

  return ''
    + '<div class="eq-tooltip" style="'
    + 'display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);z-index:500;'
    + 'background:rgba(8,6,12,0.96);'
    + 'border:2px solid rgba(180,150,70,0.6);'
    + 'border-radius:4px;'
    + 'padding:10px 14px;'
    + 'max-width:260px;min-width:160px;'
    + 'pointer-events:none;'
    + 'box-shadow:0 6px 24px rgba(0,0,0,0.9),0 0 12px rgba(180,150,70,0.15),inset 0 1px 0 rgba(180,150,70,0.08);'
    + '">'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:20px;color:rgba(220,190,100,0.95);letter-spacing:1px;text-shadow:0 1px 4px rgba(0,0,0,0.8);line-height:1.3;">' + name + '</div>'
    + statLines
    + descLine
    + '</div>';
}

export function eqSlot(label, eqItem, slotKey, size) {
  var sz = size || 44;
  var imgSz = sz - 14;
  var content = '';
  var clickAttr = '';
  var tooltipHtml = '';
  if (eqItem && eqItem.icon) {
    content = '<img src="' + eqItem.icon + '" style="width:' + imgSz + 'px;height:' + imgSz + 'px;object-fit:contain;-webkit-user-drag:none;user-select:none;pointer-events:none;" />';
    clickAttr = ' data-interactive onclick="sendAction(\'unequipItem\',{slot:\'' + slotKey + '\'})"';
    tooltipHtml = buildEqTooltip(eqItem);
  } else {
    var ph = SLOT_PLACEHOLDERS[slotKey] || '';
    if (ph) {
      content = '<img src="' + ph + '" style="width:' + imgSz + 'px;height:' + imgSz + 'px;object-fit:contain;-webkit-user-drag:none;user-select:none;pointer-events:none;opacity:0.15;filter:grayscale(1);" />';
    }
  }
  var hoverEnter = "this.style.filter='brightness(1.3)';var t=this.querySelector('.eq-tooltip');if(t)t.style.display='block';";
  var hoverLeave = "this.style.filter='';var t=this.querySelector('.eq-tooltip');if(t)t.style.display='none';";
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">'
    + '<div style="position:relative;width:' + sz + 'px;height:' + sz + 'px;box-sizing:border-box;' + _frame('equipSlot', 6, 'radial-gradient(rgba(42,30,22,.92),rgba(10,8,6,.95))') + 'display:flex;align-items:center;justify-content:center;transition:filter .15s;"'
    + clickAttr
    + ' onmouseenter="' + hoverEnter + '" onmouseleave="' + hoverLeave + '">'
    + tooltipHtml
    + content + '</div>'
    + '<div style="font-size:12px;color:rgba(201,164,106,0.75);font-family:Cinzel,serif;letter-spacing:0.5px;text-transform:uppercase;">' + label + '</div></div>';
}

// ─── TAB: CHARACTER ───
export function renderCharTab(s) {
  var eq = s.equipment || {};
  var stats = s.stats || {};
  var resistances = s.resistances || {};
  var raceIndex = s.raceIndex || 0;
  var classIndex = s.classIndex || 0;
  var race = RACES[raceIndex];
  var raceName = race ? race.name : 'Human';
  var raceClasses = race ? race.classes : CLASSES;
  var className = raceClasses[classIndex] || CLASSES[classIndex] || 'Blood Knight';
  var rawName = s.charName || 'Unknown';
  var charName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  var level = s.level ?? 1;
  var showStatsWindow = s.showStatsWindow || false;

  var html = '<div style="text-align:center;margin-bottom:12px;">'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:22px;color:rgba(220,190,100,0.95);letter-spacing:2px;text-shadow:0 0 8px rgba(200,170,80,0.2),0 2px 3px rgba(0,0,0,0.8);overflow:hidden;text-overflow:ellipsis;">' + esc(charName) + '</div>'
    + '<div style="font-size:14px;color:rgba(180,155,100,0.5);letter-spacing:1.5px;font-family:Cinzel,serif;">' + raceName + ' ' + className + ' \u2022 Level ' + level + '</div>'
    + '<div style="font-size:13px;color:rgba(180,155,100,0.4);letter-spacing:1px;font-family:Cinzel,serif;margin-top:4px;">PvP Rank: <span style="color:rgba(220,190,100,0.7);">Novice</span></div></div>';

  // Body silhouette + Equipment slots — three-column RPG paper-doll layout
  // LEFT: Trinkets+Rings | CENTER: Big silhouette | RIGHT: Armour 2×3 grid
  // BOTTOM CENTER: Main Hand + Off Hand weapons displayed below silhouette
  html += '<div style="width:100%;display:flex;flex-direction:column;align-items:center;margin-bottom:6px;">'
    + '<div style="display:flex;align-items:flex-start;gap:4px;width:370px;">'

    // ── LEFT COLUMN: 2 Trinkets + divider + 3 Rings (tight spacing) ──
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;padding-top:2px;">'
    + eqSlot('Trinket', eq.trinket1, 'Trinket1', 42)
    + eqSlot('Trinket', eq.trinket2, 'Trinket2', 42)
    + '<div style="width:28px;height:1px;background:rgba(160,140,80,0.15);margin:1px 0;"></div>'
    + eqSlot('Ring', eq.ring1, 'Ring1', 36)
    + eqSlot('Ring', eq.ring2, 'Ring2', 36)
    + eqSlot('Ring', eq.ring3, 'Ring3', 36)
    + '</div>'

    // ── CENTER: Body silhouette — MUCH BIGGER, dominates the panel ──
    + '<div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative;min-height:310px;padding-top:0px;">'
    + '<img src="/cdn/icon-gothic-dark-human-body-silhouette-front.png" style="width:170px;height:280px;object-fit:contain;opacity:0.8;filter:brightness(3.5) contrast(0.7);-webkit-user-drag:none;user-select:none;pointer-events:none;" />'
    + '</div>'

    // ── RIGHT COLUMN: Armour gear in 2×3 grid ──
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex-shrink:0;padding-top:2px;">'
    + eqSlot('Head', eq.head, 'Head', 44)
    + eqSlot('Amulet', eq.amulet, 'Amulet', 40)
    + eqSlot('Armour', eq.armour || eq.armor, 'Armour', 44)
    + eqSlot('Hands', eq.hands, 'Hands', 40)
    + eqSlot('Belt', eq.belt, 'Belt', 40)
    + eqSlot('Feet', eq.feet, 'Feet', 40)
    + '<div style="grid-column:span 2;height:10px;"></div>'
    + eqSlot('Main', eq.mainHand, 'MainHand', 44)
    + eqSlot('Off', eq.offHand, 'OffHand', 44)
    + '</div>'

    + '</div>'

    + '</div>';

  html += '<div style="text-align:center;margin-top:2px;font-family:Cinzel,serif;font-size:13px;color:rgba(180,155,100,0.35);letter-spacing:1px;">Left-click to unequip</div>';

  return html;
}

// ─── TAB: STATS ───

// Tooltip helper: wraps a stat row in a hoverable container with tooltip
export function statTooltip(innerHtml, tipText) {
  var tipStyle = 'display:none;position:fixed;left:0;top:0;'
    + 'z-index:99999;background:rgba(8,5,2,0.97);border:1px solid rgba(160,130,60,0.5);'
    + 'border-radius:4px;padding:6px 10px;max-width:220px;min-width:140px;pointer-events:none;'
    + 'box-shadow:0 4px 18px rgba(0,0,0,0.85),0 0 8px rgba(160,130,60,0.15);'
    + 'font-family:Cinzel,serif;font-size:12px;color:rgba(200,185,140,0.9);line-height:1.35;'
    + 'text-align:center;letter-spacing:0.3px;white-space:normal;';
  return '<div data-interactive style="position:relative;cursor:default;" '
    + 'onmouseenter="var t=this.querySelector(\'.stat-tip\');if(t){var r=this.getBoundingClientRect();var vh=window.innerHeight;var tipH=t.offsetHeight||80;var ty=r.top;if(ty+tipH>vh-8){ty=vh-8-tipH;}if(ty<8){ty=8;}t.style.left=(r.left-230)+\'px\';if(r.left-230<4){t.style.left=(r.right+8)+\'px\';}t.style.top=ty+\'px\';t.style.display=\'block\';}" '
    + 'onmouseleave="var t=this.querySelector(\'.stat-tip\');if(t){t.style.display=\'none\';}">'
    + innerHtml
    + '<div class="stat-tip" style="' + tipStyle + '">' + tipText + '</div></div>';
}

export function renderStatsTab(s) {
  var stats = s.stats || {};
  var resistances = s.resistances || {};

  var str = stats.strength ?? 10;
  var dex = stats.dexterity ?? 10;
  var intel = stats.intelligence ?? 10;
  var wis = stats.wisdom ?? 10;
  var vit = stats.vitality ?? 10;
  var end = stats.endurance ?? 10;
  var luck = stats.luck ?? 10;
  var spr = stats.spirit ?? 10;

  var html = '';
  var hdr = 'font-size:14px;color:rgba(180,155,100,0.45);letter-spacing:2px;text-transform:uppercase;margin:0 0 2px 0;font-family:Cinzel,serif;font-weight:bold;';
  var rw = 'display:flex;justify-content:space-between;padding:0;line-height:1.45;';
  var lbl = 'font-size:15px;color:rgba(200,175,120,0.8);font-family:Cinzel,serif;';
  var val = 'font-size:15px;color:rgba(220,195,140,0.95);font-weight:bold;font-family:Cinzel,serif;';
  var sep = '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(160,140,80,0.3),transparent);margin:4px 0;"></div>';

  // ── Attribute tooltip descriptions ──
  var STAT_TIPS = {
    strength: 'Increases physical damage. <span style="color:rgba(255,220,120,0.95);">+1 damage</span> per point above 10.' + (str > 10 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + (str - 10) + ' bonus dmg)</span>' : ''),
    dexterity: 'Increases ability in certain professions. Contributes to Crit Chance and Dodge.',
    intelligence: 'Increases total mana pool. <span style="color:rgba(120,180,255,0.95);">+10 mana</span> per point above 10.' + (intel > 10 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + ((intel - 10) * 10) + ' max mana)</span>' : ''),
    wisdom: 'High wisdom occasionally reveals hidden details about monsters, dungeons, and items. Contributes to Mana Regen.',
    vitality: 'Subtly increases movement speed. <span style="color:rgba(160,220,160,0.95);">+0.5% speed</span> per point above 10.' + (vit > 10 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + ((vit - 10) * 0.5).toFixed(1) + '% speed)</span>' : ''),
    endurance: 'Increases maximum health. <span style="color:rgba(255,120,120,0.95);">+10 HP</span> per point above 10.' + (end > 10 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + ((end - 10) * 10) + ' max HP)</span>' : ''),
    luck: 'Increases probability of finding better loot from creatures and chests. Contributes to Crit Chance and Dodge.',
    spirit: 'Increases mana regeneration. <span style="color:rgba(120,180,255,0.95);">+1 mana per point above 10</span> every 10 seconds.' + (spr > 10 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + (spr - 10) + ' mana/10s)</span>' : ''),
  };

  // ── Attributes — two columns ──
  html += '<div style="' + hdr + '">Attributes</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px;">';
  for (var si = 0; si < STAT_NAMES.length; si++) {
    var v = stats[STAT_KEYS[si]] ?? 10;
    var rowHtml = '<div style="' + rw + '"><span style="' + lbl + '">' + STAT_NAMES[si] + '</span><span style="' + val + '">' + v + '</span></div>';
    html += statTooltip(rowHtml, STAT_TIPS[STAT_KEYS[si]] || '');
  }
  html += '</div>';
  html += sep;

  // ── Resistances — three columns, 18 magic schools ──
  html += '<div style="' + hdr + '">Resistances</div>';
  var RC = {death:'rgba(120,90,140,0.95)',water:'rgba(50,150,220,0.95)',light:'rgba(255,235,120,0.95)',earth:'rgba(160,120,60,0.95)',arcane:'rgba(180,80,255,0.95)',cosmic:'rgba(80,100,200,0.95)',spirit:'rgba(210,230,255,0.95)',chaos:'rgba(230,40,40,0.95)',nature:'rgba(50,190,50,0.95)',dream:'rgba(200,160,255,0.95)',occult:'rgba(140,60,160,0.95)',shadow:'rgba(100,90,130,0.95)',blood:'rgba(180,30,30,0.95)',mind:'rgba(60,200,210,0.95)',air:'rgba(170,220,250,0.95)',fire:'rgba(255,130,30,0.95)',ancient:'rgba(210,180,100,0.95)',poison:'rgba(130,220,50,0.95)'};
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 6px;">';
  for (var ri = 0; ri < RESIST_NAMES.length; ri++) {
    var rv = resistances[RESIST_KEYS[ri]] ?? 0;
    var rc = RC[RESIST_KEYS[ri]] || 'rgba(200,175,120,0.8)';
    var resistRow = '<div style="display:flex;justify-content:space-between;padding:0;line-height:1.4;">'
      + '<span style="font-size:12px;color:' + rc + ';font-family:Cinzel,serif;white-space:nowrap;">' + RESIST_NAMES[ri] + '</span>'
      + '<span style="font-size:12px;color:rgba(220,195,140,0.9);font-weight:bold;font-family:Cinzel,serif;margin-left:2px;">' + rv + '</span></div>';
    var resistBonus = rv > 10 ? (rv - 10) : 0;
    var resistTip = 'Reduces damage from <span style="color:' + rc + ';">' + RESIST_NAMES[ri] + '</span>. <span style="color:rgba(255,220,120,0.95);">-1 damage</span> per point above 10.' + (resistBonus > 0 ? ' <span style="color:rgba(120,220,120,0.95);">(-' + resistBonus + ' dmg)</span>' : '');
    html += statTooltip(resistRow, resistTip);
  }
  html += '</div>';
  html += sep;

  // ── Combat Stats — two columns ──
  html += '<div style="' + hdr + '">Combat</div>';
  var attackPower = str * 2 + Math.floor(dex * 0.5);
  var spellPower = intel * 2 + Math.floor(spr * 0.5);
  var defence = end * 2 + Math.floor(vit * 0.5);
  // Add defence from equipped items
  var eq = s.equipment || {};
  var eqSlots = Object.keys(eq);
  for (var ei = 0; ei < eqSlots.length; ei++) {
    var eqItem = eq[eqSlots[ei]];
    if (eqItem && eqItem.stats) {
      if (eqItem.stats.defence) defence += eqItem.stats.defence;
      if (eqItem.stats.armour) defence += eqItem.stats.armour;
    }
  }
  var critChance = Math.min(50, 5 + Math.floor(luck * 0.5 + dex * 0.25));
  var maxHp = (s.maxHealth ?? 1000);
  var maxMp = (s.maxMana ?? 500);
  var dodge = Math.min(40, Math.floor(dex * 0.4 + luck * 0.2));
  var manaRegen = Math.floor(spr * 0.5 + wis * 0.3);
  var healthRegen = Math.floor(vit * 0.4 + end * 0.2);

  var apBonus = Math.max(0, attackPower - 25);
  var baseSpellPower = 10 * 2 + Math.floor(10 * 0.5);
  var spBonus = Math.max(0, spellPower - baseSpellPower);

  var CS_TIPS = {
    'Attack Power': 'Physical attack power. Only attack power above 25 contributes to bonus damage.' + (apBonus > 0 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + apBonus + ' bonus melee dmg)</span>' : ' <span style="color:rgba(180,160,120,0.6);">(no bonus yet)</span>'),
    'Spell Power': 'Magical spell power for projectile spells. Only spell power above ' + baseSpellPower + ' contributes to bonus damage.' + (spBonus > 0 ? ' <span style="color:rgba(120,220,120,0.95);">(+' + spBonus + ' bonus spell dmg)</span>' : ' <span style="color:rgba(180,160,120,0.6);">(no bonus yet)</span>'),
    'Defence': 'Reduces incoming physical damage. Damage reduced by Defence &divide; 3.' + (defence > 0 ? ' <span style="color:rgba(120,220,120,0.95);">(-' + Math.floor(defence / 3) + ' damage reduction)</span>' : ''),
    'Crit Chance': 'Chance to deal <span style="color:rgba(255,220,80,0.95);">double</span> or <span style="color:rgba(255,160,40,0.95);">triple</span> damage on hit. Currently <span style="color:rgba(255,220,120,0.95);">' + critChance + '%</span> chance per attack.',
    'Dodge': 'Chance to completely avoid damage from an incoming hit. Currently <span style="color:rgba(200,220,255,0.95);">' + dodge + '%</span> chance to dodge.',
    'Health Regen': 'Regenerates <span style="color:rgba(255,120,120,0.95);">' + Math.ceil(vit * 0.4 + end * 0.2) + ' HP</span> per second. Derived from Vitality and Endurance.',
    'Mana Regen': 'Regenerates <span style="color:rgba(120,180,255,0.95);">' + Math.ceil(spr * 0.5 + wis * 0.3) + ' MP</span> per second. Derived from Spirit and Wisdom.' + (spr > 10 ? ' Spirit also grants <span style="color:rgba(120,220,120,0.95);">+' + (spr - 10) + ' mana</span> every 10s.' : ''),
  };

  var CS = [
    ['Attack Power', attackPower], ['Spell Power', spellPower],
    ['Defence', defence], ['Crit Chance', critChance + '%'],
    ['Dodge', dodge + '%'], ['Health Regen', healthRegen],
    ['Mana Regen', manaRegen],
  ];

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px;">';
  for (var ci = 0; ci < CS.length; ci++) {
    var csRow = '<div style="' + rw + '"><span style="font-size:15px;color:rgba(200,175,120,0.6);font-family:Cinzel,serif;">' + CS[ci][0] + '</span><span style="' + val + '">' + CS[ci][1] + '</span></div>';
    html += statTooltip(csRow, CS_TIPS[CS[ci][0]] || '');
  }
  html += '</div>';

  return html;
}

// ─── TAB: INVENTORY ───
export function renderInvTab(s) {
  var inventory = s.inventory || [];
  var gridCells = '';
  for (var i = 0; i < 30; i++) {
    var item = inventory[i];
    var r = RUNES[i % RUNES.length];
    var cc = '';
    var tooltipHtml = '';
    var clickAttr = '';
    if (item && item.icon) {
      if (item.id === 'runestone') {
        clickAttr = ' data-interactive onclick="sendAction(\'useRunestone\')" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else if (item.id === 'war-banner') {
        clickAttr = ' data-interactive onclick="sendAction(\'plantBanner\')" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else if (item.id === 'health-potion') {
        clickAttr = ' data-interactive onclick="sendAction(\'useHealthPotion\')" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else if (item.id === 'mana-potion') {
        clickAttr = ' data-interactive onclick="sendAction(\'useManaPotion\')" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else if (item.stats && item.stats.healOverTime) {
        clickAttr = ' data-interactive onclick="sendAction(\'useFood\',{index:' + i + '})" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else if (item.stats && item.stats.manaOverTime) {
        clickAttr = ' data-interactive onclick="sendAction(\'useWater\',{index:' + i + '})" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      } else {
        clickAttr = ' data-interactive onclick="sendAction(\'equipItem\',{index:' + i + '})" style="cursor:pointer;"';
        cc = '<img src="' + item.icon + '" draggable="true" ondragstart="window._dragSpellId=\'' + esc(item.id || '') + '\';event.dataTransfer.setData(\'text/plain\',\'' + esc(item.id || '') + '\')" ondragend="window._dragSpellId=null;" style="width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none;-webkit-user-drag:none;" />';
      }
      if (item.count && item.count > 1)
        cc += '<div style="position:absolute;bottom:1px;right:2px;font-size:12px;color:rgba(220,190,100,0.9);font-family:Cinzel,serif;text-shadow:0 1px 3px rgba(0,0,0,0.95);pointer-events:none;font-weight:bold;">' + item.count + '</div>';
      var tooltipName = esc(item.name || 'Item');
      var tooltipDesc = (item.id === 'runestone' ? 'Left click to use. ' : item.id === 'war-banner' ? 'Left click to plant. ' : item.id === 'health-potion' ? 'Left click to consume. ' : item.id === 'mana-potion' ? 'Left click to consume. ' : (item.stats && (item.stats.healOverTime || item.stats.manaOverTime)) ? 'Left click to consume. ' : '') + esc(item.description || '');
      var questItemLine = item.questItem ? '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(160,100,220,0.95);margin-top:2px;letter-spacing:0.5px;text-shadow:0 0 6px rgba(120,60,180,0.3);">Quest Item</div>' : '';
      var sellLine = (item.sellable && item.sellPrice) ? '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(180,160,80,0.7);margin-top:3px;">Right click to sell (' + item.sellPrice + ' gold)</div>' : '';
      tooltipHtml = '<div class="inv-tooltip" style="display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:500;background:rgba(8,6,12,0.96);border:1px solid rgba(120,100,60,0.5);border-radius:4px;padding:6px 10px;max-width:200px;min-width:120px;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.8);">'
        + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;color:rgba(220,190,100,0.95);letter-spacing:0.5px;">' + tooltipName + '</div>'
        + questItemLine
        + '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(180,165,130,0.7);margin-top:3px;line-height:1.3;">' + tooltipDesc + '</div>'
        + sellLine + '</div>';
    } else {
      cc = '<span style="font-size:14px;color:rgba(200,175,120,0.04);pointer-events:none;">' + r + '</span>';
    }
    var rightClickAttr = (item && item.sellable && item.sellPrice) ? ' oncontextmenu="event.preventDefault();sendAction(\'sellItem\',{index:' + i + '});return false;"' : '';
    gridCells += '<div style="width:100%;aspect-ratio:1;box-sizing:border-box;' + (item ? _frame('slot', 5, 'radial-gradient(rgba(42,30,22,.92),rgba(10,8,6,.95))') : _EMPTY_SLOT + 'border-radius:2px;') + 'display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);transition:filter 0.15s;"' + clickAttr + rightClickAttr
      + ' onmouseenter="this.style.filter=\'brightness(1.3)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'block\';"'
      + ' onmouseleave="this.style.filter=\'\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'none\';">'
      + cc + tooltipHtml + '</div>';
  }
  var gold = s.gold ?? 0;
  var sigils = s.sigils ?? 0;
  return '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px;">' + gridCells + '</div>'
    + '<div style="text-align:center;margin-top:6px;font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.35);letter-spacing:1px;">Left-click to equip</div>'
    + '<div style="display:flex;justify-content:center;gap:24px;margin-top:10px;font-family:Cinzel,Palatino,Georgia,serif;font-size:20px;letter-spacing:1px;text-shadow:0 0 6px rgba(200,170,80,0.15),0 1px 2px rgba(0,0,0,0.8);">'
    + '<span style="color:rgba(220,190,100,0.95);position:relative;cursor:default;" onmouseenter="this.querySelector(\'.gp-tip\').style.opacity=\'1\'" onmouseleave="this.querySelector(\'.gp-tip\').style.opacity=\'0\'">' + gold + ' GP<span class="gp-tip" style="pointer-events:none;opacity:0;transition:opacity 0.15s;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:8px 14px;background:rgba(10,8,12,0.95);border:1px solid rgba(160,140,80,0.4);border-radius:4px;font-size:18px;line-height:1.4;color:rgba(200,185,160,0.9);text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.8);box-shadow:0 4px 16px rgba(0,0,0,0.7);z-index:9999;">Gold Pieces</span></span>'
    + '<span style="color:rgba(60,180,60,0.95);position:relative;cursor:default;" onmouseenter="this.querySelector(\'.sigil-tip\').style.opacity=\'1\'" onmouseleave="this.querySelector(\'.sigil-tip\').style.opacity=\'0\'">' + sigils + ' Sigils<span class="sigil-tip" style="pointer-events:none;opacity:0;transition:opacity 0.15s;position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:220px;padding:10px 12px;background:rgba(10,8,12,0.95);border:1px solid rgba(160,140,80,0.4);border-radius:4px;font-size:18px;line-height:1.4;color:rgba(200,185,160,0.9);text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.8);box-shadow:0 4px 16px rgba(0,0,0,0.7);z-index:9999;">Acquired by slaying other players. Exchange for rewards.</span></span>'
    + '</div>';
}

// ─── TAB: SPELLBOOK ───
export function formatCooldown(seconds) {
  if (seconds >= 3600) return Math.floor(seconds / 3600) + 'h';
  if (seconds >= 60) return Math.floor(seconds / 60) + 'm';
  return seconds + 's';
}

var SPELLS_PER_PAGE = 5;

export function renderSpellbookTab(s) {
  var raceIndex = s.raceIndex ?? 0;
  var classIndex = s.classIndex ?? 0;
  var race = RACES[raceIndex];
  var raceClasses = race ? race.classes : [];
  var className = raceClasses[classIndex] || '';

  // Collect all spells
  var allSpells = [];
  allSpells.push({ spell: ATTACK_SPELL, dragId: 'attack' });

  var ra = RACIAL_ABILITIES[raceIndex];
  if (ra) allSpells.push({ spell: ra, dragId: 'racial_' + raceIndex });

  var globalClassIndex = -1;
  if (className) {
    for (var ci = 0; ci < CLASSES.length; ci++) {
      if (CLASSES[ci] === className) { globalClassIndex = ci; break; }
    }
  }
  var cs = globalClassIndex >= 0 ? CLASS_SPELLS[globalClassIndex] : null;
  if (cs) allSpells.push({ spell: cs, dragId: cs.id });

  // Extra class spells (e.g. Crimson Flurry, Blood Siphon for Blood Knight)
  var extras = globalClassIndex >= 0 ? CLASS_EXTRA_SPELLS[globalClassIndex] : null;
  if (extras) {
    for (var ei = 0; ei < extras.length; ei++) {
      allSpells.push({ spell: extras[ei], dragId: extras[ei].id });
    }
  }

  var learned = s.learnedSpells || [];
  for (var li = 0; li < learned.length; li++) {
    allSpells.push({ spell: learned[li], dragId: learned[li].id || ('learned_' + li) });
  }

  var totalPages = Math.max(1, Math.ceil(allSpells.length / SPELLS_PER_PAGE));
  var page = Math.min(Math.max(0, s.spellbookPage ?? 0), totalPages - 1);
  var startIdx = page * SPELLS_PER_PAGE;
  var endIdx = Math.min(startIdx + SPELLS_PER_PAGE, allSpells.length);

  // Header — hint only (title handled by persistent label)
  var html = '<div style="display:flex;flex-direction:column;flex:1;min-height:0;">';
  html += '<div style="display:flex;align-items:baseline;justify-content:flex-start;margin-bottom:6px;">'
    + '<div style="font-family:Times New Roman,serif;font-size:18px;color:rgba(180,155,100,0.35);letter-spacing:0.5px;">Drag icon to spell bar</div>'
    + '</div>';

  // Divider
  html += '<div style="height:1px;background:linear-gradient(to right,rgba(200,170,80,0.4),rgba(200,170,80,0.08));margin-bottom:6px;"></div>';

  // Spell list — compact rows
  html += '<div style="display:flex;flex-direction:column;gap:3px;">';
  for (var si = startIdx; si < endIdx; si++) {
    var entry = allSpells[si];
    var sp = entry.spell;
    var dragId = entry.dragId;

    var accentColor = sp.type === 'racial' ? 'rgba(160,100,220,0.5)' : sp.type === 'attack' ? 'rgba(200,80,50,0.5)' : 'rgba(80,150,220,0.5)';
    var nameColor = sp.type === 'racial' ? 'rgba(210,175,245,0.95)' : sp.type === 'attack' ? 'rgba(245,195,170,0.95)' : 'rgba(175,210,245,0.95)';
    var tagLabel = sp.type === 'racial' ? 'RACIAL' : sp.type === 'attack' ? 'ATTACK' : 'CLASS';
    var tagBg = sp.type === 'racial' ? 'rgba(120,60,180,0.25)' : sp.type === 'attack' ? 'rgba(180,60,40,0.25)' : 'rgba(60,120,180,0.25)';
    var tagBorder = sp.type === 'racial' ? 'rgba(160,100,220,0.4)' : sp.type === 'attack' ? 'rgba(200,80,50,0.4)' : 'rgba(80,150,220,0.4)';

    // Compact row: icon | name + tag | cooldown/damage
    // Tooltip uses position:fixed so it escapes overflow:hidden on the scroll container.
    // onmouseenter computes the row's bounding rect and positions the tooltip to the left of the panel.
    html += '<div data-interactive style="position:relative;display:flex;align-items:center;gap:8px;padding:4px 6px;background:rgba(12,10,8,0.5);border:1px solid rgba(55,45,35,0.35);border-radius:4px;transition:border-color 0.15s,box-shadow 0.15s;cursor:default;" onmouseenter="this.style.borderColor=\'rgba(200,170,80,0.4)\';this.style.boxShadow=\'0 0 8px rgba(200,170,80,0.1)\';var t=this.querySelector(\'[data-tooltip]\');if(t){var r=this.getBoundingClientRect();var vw=window.innerWidth;var vh=window.innerHeight;var tipW=260;var tipH=t.offsetHeight||200;var lx=r.left-tipW-8;if(lx<4){lx=r.right+8;}var ty=r.top;if(ty+tipH>vh-8){ty=vh-8-tipH;}if(ty<8){ty=8;}t.style.left=lx+\'px\';t.style.top=ty+\'px\';t.style.opacity=\'1\';}" onmouseleave="this.style.borderColor=\'rgba(55,45,35,0.35)\';this.style.boxShadow=\'none\';var t=this.querySelector(\'[data-tooltip]\');if(t){t.style.opacity=\'0\';}">';

    // Icon — 36px draggable
    html += '<img draggable="true" ondragstart="window._dragSpellId=\'' + esc(dragId) + '\';event.dataTransfer.setData(\'text/plain\',\'' + esc(dragId) + '\')" ondragend="window._dragSpellId=null;" data-interactive src="' + esc(sp.icon) + '" style="width:36px;height:36px;min-width:36px;object-fit:contain;cursor:grab;border:1px solid ' + accentColor + ';border-radius:3px;background:rgba(8,6,4,0.7);" />';

    // Name + type tag
    html += '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;">'
      + '<div style="display:flex;align-items:center;gap:6px;">'
      + '<div style="font-family:Cinzel,serif;font-size:18px;color:' + nameColor + ';font-weight:bold;letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(sp.name || '') + '</div>'
      + '</div>';

    // Subtitle line — damage + mana + cooldown inline
    var subParts = [];
    if (sp.damage) subParts.push('<span style="color:rgba(255,180,140,0.8);">' + sp.damage + ' dmg</span>');
    if (sp.manaCost) subParts.push('<span style="color:rgba(120,160,255,0.8);">' + sp.manaCost + ' mana</span>');
    if (sp.cooldown) subParts.push('<span style="color:rgba(200,175,120,0.5);">' + formatCooldown(sp.cooldown) + ' cooldown</span>');
    if (subParts.length > 0) {
      html += '<div style="font-family:Cinzel,serif;font-size:18px;display:flex;gap:8px;">' + subParts.join('') + '</div>';
    }
    html += '</div>';

    // Tooltip (on hover, positioned right)
    // Build stat lines array
    var tipStats = '';
    if (sp.damage) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Damage</span><span style="color:rgba(255,180,140,0.95);font-weight:bold;">' + sp.damage + '</span></div>';
    if (sp.manaCost) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Mana Cost</span><span style="color:rgba(120,160,255,0.95);font-weight:bold;">' + sp.manaCost + '</span></div>';
    if (sp.healAmount) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Healing</span><span style="color:rgba(140,220,160,0.95);font-weight:bold;">+' + sp.healAmount + ' HP</span></div>';
    if (sp.chargeTime) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Charge Time</span><span style="color:rgba(180,200,230,0.9);">' + sp.chargeTime + 's</span></div>';
    if (sp.cooldown) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Cooldown</span><span style="color:rgba(200,175,120,0.9);">' + formatCooldown(sp.cooldown) + '</span></div>';
    if (sp.speed) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Speed</span><span style="color:rgba(180,200,230,0.9);">' + sp.speed + '</span></div>';
    if (sp.homing) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Homing</span><span style="color:rgba(200,170,255,0.9);">Yes</span></div>';
    if (sp.buffStat) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Buff</span><span style="color:rgba(200,170,255,0.95);">+' + (sp.buffAmount || 0) + ' ' + esc(sp.buffStat.charAt(0).toUpperCase() + sp.buffStat.slice(1)) + '</span></div>';
    if (sp.buffDuration) tipStats += '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span style="color:rgba(160,140,110,0.7);">Buff Duration</span><span style="color:rgba(180,200,230,0.9);">' + formatCooldown(sp.buffDuration) + '</span></div>';

    // Determine tooltip position — for items near the bottom of the page, show above instead
    var rowIndex = si - startIdx;

    html += '<div data-tooltip style="position:fixed;left:0;top:0;z-index:99999;width:240px;padding:10px 12px;'
      + 'background:linear-gradient(160deg,rgba(10,8,12,0.97),rgba(16,12,18,0.95),rgba(10,8,12,0.97));'
      + 'border:1px solid rgba(160,140,80,0.4);border-radius:4px;'
      + 'box-shadow:0 6px 24px rgba(0,0,0,0.95),0 0 12px rgba(160,140,80,0.06),inset 0 1px 0 rgba(200,180,100,0.04);'
      + 'opacity:0;pointer-events:none;transition:opacity 0.18s ease-out;">'
      // Gold top accent line
      + '<div style="position:absolute;top:0;left:8px;right:8px;height:1px;background:linear-gradient(to right,transparent,rgba(200,170,80,0.5),transparent);"></div>'
      // Spell name
      + '<div style="font-family:Cinzel,serif;font-size:18px;font-weight:bold;color:rgba(220,190,100,0.95);text-shadow:0 0 8px rgba(200,170,80,0.2);margin-bottom:2px;letter-spacing:0.5px;">' + esc(sp.name || '') + '</div>'
      // Type label removed
      // Stat block
      + (tipStats ? '<div style="font-family:Cinzel,serif;font-size:18px;padding:4px 0;margin-bottom:4px;border-top:1px solid rgba(160,140,80,0.15);border-bottom:1px solid rgba(160,140,80,0.15);">' + tipStats + '</div>' : '')
      // Description
      + (sp.description ? '<div style="font-family:Times New Roman,serif;font-size:14px;color:rgba(180,165,140,0.75);line-height:1.45;letter-spacing:0.2px;">' + esc(sp.description) + '</div>' : '')
      // Bottom accent line
      + '<div style="position:absolute;bottom:0;left:8px;right:8px;height:1px;background:linear-gradient(to right,transparent,rgba(200,170,80,0.3),transparent);"></div>'
      + '</div>';

    html += '</div>'; // end row
  }
  html += '</div>'; // end spell list

  // ── Pagination footer ──
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:auto;padding-top:6px;border-top:1px solid rgba(200,170,80,0.12);">';

  var prevDisabled = page <= 0;
  var nextDisabled = page >= totalPages - 1;

  // Left arrow
  html += '<div data-interactive onclick="' + (prevDisabled ? '' : "sendAction('spellbookPageLeft')") + '" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,0.85);border:1px solid ' + (prevDisabled ? 'rgba(100,80,45,0.15)' : 'rgba(160,140,80,0.4)') + ';border-radius:3px;font-family:Cinzel,serif;font-size:20px;cursor:' + (prevDisabled ? 'default' : 'pointer') + ';color:' + (prevDisabled ? 'rgba(200,175,120,0.15)' : 'rgba(200,175,120,0.7)') + ';user-select:none;transition:color 0.15s,border-color 0.15s,box-shadow 0.15s;' + (prevDisabled ? 'pointer-events:none;' : '') + '" onmouseenter="this.style.color=\'rgba(220,190,100,1)\';this.style.borderColor=\'rgba(200,170,80,0.7)\';this.style.boxShadow=\'0 0 8px rgba(200,170,80,0.15)\';" onmouseleave="this.style.color=\'rgba(200,175,120,0.7)\';this.style.borderColor=\'rgba(160,140,80,0.4)\';this.style.boxShadow=\'none\';">\u25C0</div>';

  // Page indicator
  html += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(200,175,120,0.55);letter-spacing:1px;">Page ' + (page + 1) + '/' + totalPages + '</div>';

  // Right arrow
  html += '<div data-interactive onclick="' + (nextDisabled ? '' : "sendAction('spellbookPageRight')") + '" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,0.85);border:1px solid ' + (nextDisabled ? 'rgba(100,80,45,0.15)' : 'rgba(160,140,80,0.4)') + ';border-radius:3px;font-family:Cinzel,serif;font-size:20px;cursor:' + (nextDisabled ? 'default' : 'pointer') + ';color:' + (nextDisabled ? 'rgba(200,175,120,0.15)' : 'rgba(200,175,120,0.7)') + ';user-select:none;transition:color 0.15s,border-color 0.15s,box-shadow 0.15s;' + (nextDisabled ? 'pointer-events:none;' : '') + '" onmouseenter="this.style.color=\'rgba(220,190,100,1)\';this.style.borderColor=\'rgba(200,170,80,0.7)\';this.style.boxShadow=\'0 0 8px rgba(200,170,80,0.15)\';" onmouseleave="this.style.color=\'rgba(200,175,120,0.7)\';this.style.borderColor=\'rgba(160,140,80,0.4)\';this.style.boxShadow=\'none\';">\u25B6</div>';

  html += '</div>'; // close pagination
  html += '</div>'; // close flex column wrapper

  return html;
}

// ─── QUEST TOOLTIP BUILDER ───
export function buildQuestTooltip(q) {
  // Look up full quest definition for complete reward data
  var questDef = null;
  var qid = q.questId || q.id;
  if (qid && QUEST_DATABASE && typeof QUEST_DATABASE === 'object') {
    var keys = Object.keys(QUEST_DATABASE);
    for (var k = 0; k < keys.length; k++) {
      var npcQuests = QUEST_DATABASE[keys[k]];
      if (!Array.isArray(npcQuests)) continue;
      for (var j = 0; j < npcQuests.length; j++) {
        if (npcQuests[j].id === qid) { questDef = npcQuests[j]; break; }
      }
      if (questDef) break;
    }
  }

  // Merge rewards: prefer active quest state, fall back to quest def
  var rewards = q.rewards || (questDef ? questDef.rewards : null) || {};
  var repReward = q.reputationReward || (questDef ? questDef.reputationReward : 0) || 0;

  // Build objectives section
  var objLines = '';
  var objectives = q.objectives || (questDef ? questDef.objectives : null) || [];
  // Determine if all objectives are complete
  var allObjComplete = objectives.length > 0;
  for (var oc = 0; oc < objectives.length; oc++) {
    var ocCur = objectives[oc].current !== undefined ? objectives[oc].current : (objectives[oc].progress !== undefined ? objectives[oc].progress : 0);
    if (ocCur < (objectives[oc].target || 1)) { allObjComplete = false; break; }
  }
  // Resolve requireTurnIn — check active quest state first, fall back to quest database definition
  var questRequiresTurnIn = q.requireTurnIn;
  if (questRequiresTurnIn === undefined && questDef) questRequiresTurnIn = questDef.requireTurnIn;
  var turnInGiverName = q.giverName || (questDef ? questDef.giverName : '') || '';
  if (objectives.length > 0) {
    objLines += '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(180,150,80,0.85);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:5px;">Objectives</div>';
    for (var o = 0; o < objectives.length; o++) {
      var obj = objectives[o];
      var cur = obj.current !== undefined ? obj.current : (obj.progress !== undefined ? obj.progress : 0);
      var tgt = obj.target || 1;
      var done = cur >= tgt;
      var objColor = done ? 'rgba(120,200,120,0.9)' : 'rgba(210,195,160,0.85)';
      var checkMark = done ? '<span style="color:rgba(120,200,120,0.9);margin-right:4px;">&#10003;</span>' : '<span style="color:rgba(120,100,60,0.5);margin-right:4px;">&#9702;</span>';
      objLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:' + objColor + ';line-height:1.5;padding-left:2px;">'
        + checkMark + esc(obj.desc) + ': <span style="color:rgba(220,190,100,0.95);font-weight:bold;">' + cur + '/' + tgt + '</span></div>';
    }
    // Show "Return to [giverName]" when all objectives done and quest requires turn-in
    if (allObjComplete && questRequiresTurnIn && turnInGiverName) {
      objLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(100,220,130,0.95);line-height:1.5;padding-left:2px;margin-top:6px;text-shadow:0 0 8px rgba(100,220,130,0.25);">'
        + '<span style="margin-right:4px;">&#9658;</span>Return to ' + esc(turnInGiverName) + '</div>';
    }
  }

  // Build rewards section
  var rewardLines = '';
  var hasRewards = rewards.gold || rewards.xp || (rewards.items && rewards.items.length > 0) || repReward > 0;
  if (hasRewards) {
    rewardLines += '<div style="margin-top:8px;padding-top:7px;border-top:1px solid rgba(120,100,60,0.25);">';
    rewardLines += '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(180,150,80,0.85);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:5px;">Rewards</div>';
    if (rewards.gold) {
      rewardLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(220,200,100,0.9);line-height:1.5;padding-left:2px;">'
        + '<span style="color:rgba(255,215,0,0.8);margin-right:4px;">&#9733;</span>' + rewards.gold + ' Gold</div>';
    }
    if (rewards.xp) {
      rewardLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(160,180,220,0.9);line-height:1.5;padding-left:2px;">'
        + '<span style="color:rgba(130,160,220,0.8);margin-right:4px;">&#9670;</span>' + rewards.xp + ' XP</div>';
    }
    if (repReward > 0) {
      rewardLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(180,160,210,0.9);line-height:1.5;padding-left:2px;">'
        + '<span style="color:rgba(160,130,200,0.8);margin-right:4px;">&#9830;</span>+' + repReward + ' Reputation</div>';
    }
    if (rewards.items && rewards.items.length > 0) {
      for (var ri = 0; ri < rewards.items.length; ri++) {
        var rItem = rewards.items[ri];
        var rarityColor = 'rgba(220,190,100,0.95)';
        if (rItem.rarity === 'rare') rarityColor = 'rgba(100,180,255,0.95)';
        else if (rItem.rarity === 'epic') rarityColor = 'rgba(180,100,255,0.95)';
        else if (rItem.rarity === 'legendary') rarityColor = 'rgba(255,165,0,0.95)';
        var itemIcon = rItem.icon ? '<img src="' + rItem.icon + '" style="width:16px;height:16px;vertical-align:middle;margin-right:5px;filter:drop-shadow(0 0 3px rgba(220,190,100,0.3));" />' : '<span style="color:rgba(220,190,100,0.7);margin-right:4px;">&#9679;</span>';
        rewardLines += '<div style="font-family:Cinzel,serif;font-size:14px;color:' + rarityColor + ';line-height:1.5;padding-left:2px;">'
          + itemIcon + esc(rItem.name || 'Item') + '</div>';
      }
    }
    rewardLines += '</div>';
  }

  // Giver name line
  var giverLine = '';
  var giverName = q.giverName || (questDef ? questDef.giverName : '');
  if (giverName) {
    giverLine = '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(150,130,90,0.6);margin-top:2px;font-style:italic;letter-spacing:0.3px;">From: ' + esc(giverName) + '</div>';
  }

  return '<div class="quest-tooltip" style="'
    + 'display:none;position:absolute;left:calc(100% + 10px);top:0;z-index:500;'
    + 'background:rgba(8,6,14,0.97);'
    + 'border:2px solid rgba(120,80,180,0.5);'
    + 'border-radius:4px;'
    + 'padding:12px 14px;'
    + 'min-width:220px;max-width:300px;'
    + 'pointer-events:none;'
    + 'box-shadow:0 8px 28px rgba(0,0,0,0.9),0 0 16px rgba(120,80,180,0.15),0 0 4px rgba(180,150,70,0.1),inset 0 1px 0 rgba(120,80,180,0.1);'
    + '">'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:16px;color:rgba(220,190,100,0.95);letter-spacing:1px;text-shadow:0 1px 4px rgba(0,0,0,0.8);line-height:1.3;font-weight:bold;border-bottom:1px solid rgba(120,100,60,0.25);padding-bottom:6px;margin-bottom:6px;">' + esc(q.name || q.title || 'Quest') + '</div>'
    + giverLine
    + objLines
    + rewardLines
    + '</div>';
}

// ─── TAB: QUESTS ───
export function renderQuestsTab(s) {
  var quests = s.quests || s.activeQuests || [];
  var html = '';
  if (!quests || quests.length === 0) {
    html += '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(180,155,100,0.5);text-align:center;padding:20px 0;letter-spacing:1px;">No active quests.<br>Speak to the denizens of the Abyss.</div>';
  } else {
    for (var i = 0; i < quests.length; i++) {
      var q = quests[i];
      var tooltip = buildQuestTooltip(q);
      var hoverEnter = "this.style.borderColor='rgba(120,80,180,0.6)';this.style.background='rgba(50,35,30,0.55)';var t=this.querySelector('.quest-tooltip');if(t){var r=this.getBoundingClientRect();var vw=window.innerWidth;var vh=window.innerHeight;var tipW=280;var tipH=t.offsetHeight||200;var lx=r.right+8;if(lx+tipW>vw-8){lx=r.left-tipW-8;}if(lx<4){lx=4;}var ty=r.top;if(ty+tipH>vh-8){ty=vh-8-tipH;}if(ty<8){ty=8;}t.style.left=lx+'px';t.style.top=ty+'px';t.style.opacity='1';}";
      var hoverLeave = "this.style.borderColor='rgba(80,65,40,0.3)';this.style.background='rgba(40,30,20,0.4)';var t=this.querySelector('.quest-tooltip');if(t){t.style.opacity='0';}";
      // Build a brief summary line from first objective
      var summaryText = q.description || q.objective || '';
      var summaryIsReturn = false;
      if (!summaryText && q.objectives && q.objectives.length > 0) {
        // Check if all objectives are complete
        var allSummaryDone = true;
        for (var si = 0; si < q.objectives.length; si++) {
          var sCur = q.objectives[si].current !== undefined ? q.objectives[si].current : (q.objectives[si].progress !== undefined ? q.objectives[si].progress : 0);
          if (sCur < (q.objectives[si].target || 1)) { allSummaryDone = false; break; }
        }
        // Resolve requireTurnIn — check quest state first, fall back to quest database
        var sqRequiresTurnIn = q.requireTurnIn;
        if (sqRequiresTurnIn === undefined) {
          var sqid = q.questId || q.id;
          if (sqid && QUEST_DATABASE && typeof QUEST_DATABASE === 'object') {
            var sqKeys = Object.keys(QUEST_DATABASE);
            for (var sk = 0; sk < sqKeys.length; sk++) {
              var sqQuests = QUEST_DATABASE[sqKeys[sk]];
              if (!Array.isArray(sqQuests)) continue;
              for (var sj = 0; sj < sqQuests.length; sj++) {
                if (sqQuests[sj].id === sqid) { sqRequiresTurnIn = sqQuests[sj].requireTurnIn; break; }
              }
              if (sqRequiresTurnIn !== undefined) break;
            }
          }
        }
        var sqGiverName = q.giverName || '';
        if (allSummaryDone && sqRequiresTurnIn && sqGiverName) {
          summaryText = '\u25B8 Return to ' + sqGiverName;
          summaryIsReturn = true;
        } else {
          var firstObj = q.objectives[0];
          var firstCur = firstObj.current !== undefined ? firstObj.current : (firstObj.progress !== undefined ? firstObj.progress : 0);
          summaryText = firstObj.desc + ' (' + firstCur + '/' + (firstObj.target || 1) + ')';
        }
      }
      var summaryStyle = summaryIsReturn
        ? 'font-family:Cinzel,serif;font-size:12px;color:rgba(100,220,130,0.95);margin-top:2px;line-height:1.3;text-shadow:0 0 6px rgba(100,220,130,0.2);'
        : 'font-family:Cinzel,serif;font-size:12px;color:rgba(180,165,130,0.65);margin-top:2px;line-height:1.3;';
      html += '<div style="position:relative;padding:6px 8px;margin-bottom:4px;background:rgba(40,30,20,0.4);border:1px solid rgba(80,65,40,0.3);border-radius:4px;cursor:default;transition:border-color 0.15s,background 0.15s;" data-interactive onmouseenter="' + hoverEnter + '" onmouseleave="' + hoverLeave + '">'
        + tooltip
        + '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(220,190,100,0.95);font-weight:bold;">' + esc(q.name || q.title || 'Quest') + '</div>'
        + '<div style="' + summaryStyle + '">' + esc(summaryText) + '</div></div>';
    }
  }
  // Hidden Places: the secret caches out in the March; a found one is named, the rest are a riddle
  var SECRETS = [
    { key: 'petalfall-hollow', name: 'Petalfall Hollow', hint: 'Blossoms fall in the pines west of the Reach' },
    { key: 'emberwell-spring', name: 'Emberwell Spring', hint: 'Steam rises off the road west of Cinderhold' },
    { key: 'starpool', name: 'The Star Pool', hint: 'Stars sleep on a mountain shelf east of Starfall' }
  ];
  var found = s.caches || {}, nf = 0;
  for (var hs = 0; hs < SECRETS.length; hs++) if (found[SECRETS[hs].key]) nf++;
  html += '<div style="margin-top:10px;padding:6px 8px;border-top:1px solid rgba(201,164,106,0.35)">'
    + '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(242,176,74,0.95);font-weight:bold;letter-spacing:1px">Hidden Places <span style="float:right;color:rgba(232,217,181,0.9)">' + nf + ' / ' + SECRETS.length + '</span></div>';
  for (var hs2 = 0; hs2 < SECRETS.length; hs2++) {
    var sc = SECRETS[hs2], got = !!found[sc.key];
    html += '<div style="font-family:Cinzel,serif;font-size:12px;line-height:1.4;margin-top:3px;color:' + (got ? 'rgba(140,215,150,0.95)' : 'rgba(180,165,130,0.6)') + '">'
      + (got ? '\u2713 ' + esc(sc.name) : '\u25C7 <i>' + esc(sc.hint) + '</i>') + '</div>';
  }
  html += '</div>';
  return html;
}

// ─── TAB: MAP ─── (now rendered as centered overlay, not in-panel)
var MAP_LANDMARKS = [
  { x: 0, z: 0, label: 'The Hollow', icon: '/cdn/icon-minimap-skull-marker-dark.png' },
  { x: -80, z: -50, label: 'Chapel Quarter', icon: '/cdn/icon-minimap-chapel-gothic-dark.png' },
  { x: -115, z: 131, label: 'Crypt Chapel', icon: '/cdn/icon-minimap-mushroom-glowing-dark.png' },
  { x: -197, z: 29, label: 'Abbey Ruins', icon: '/cdn/icon-minimap-ruins-archway-dark.png' },
  { x: 15, z: 140, label: "Elder's Village", icon: '/cdn/icon-minimap-village-houses-dark.png' },
  { x: -164, z: -50, label: 'Western Ruins', icon: '/cdn/icon-minimap-watchtower-dark.png' },
  { x: 116, z: -90, label: "Mage's Quarter", icon: '/cdn/icon-minimap-mage-tower-dark.png' },
  { x: 58, z: -189, label: 'Thornwood', icon: '/cdn/icon-minimap-thorny-tree-dark.png' },
  { x: -12, z: -57, label: 'Mausoleum', icon: '/cdn/icon-minimap-chapel-gothic-dark.png' },
  { x: -56, z: 44, label: 'Engineers Guild', icon: '/cdn/icon-minimap-watchtower-dark.png' },
  { x: -201, z: 95, label: 'Clocktower', icon: '/cdn/icon-minimap-watchtower-dark.png' },
  { x: -171, z: 32, label: 'Demonic Portal', icon: '/cdn/icon-minimap-skull-marker-dark.png' },
  { x: 21, z: -82, label: 'Apothecary', icon: '/cdn/icon-minimap-mushroom-glowing-dark.png' },
];

export function renderWorldMapOverlay(s, playerPos, currentPlace) {
  if (!s.showWorldMap) return '';

  // Dispatch to place-specific maps
  var place = currentPlace || 'main';
  if (place === 'dojo') return renderDojoMapOverlay(s, playerPos);
  if (place === 'sanctum') return renderSanctumMapOverlay(s, playerPos);

  // Default: Abyss (main) map
  return renderAbyssMapOverlay(s, playerPos);
}

// ─── OVERLAY SHELL — wraps any place map SVG ───
export function wrapMapOverlay(title, subtitle, svgContent) {
  return '<div data-interactive style="'
    + 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;'
    + 'background:rgba(0,0,0,0.6);pointer-events:auto;'
    + '">'
    + '<div style="'
    + 'width:540px;padding:18px 14px 10px;'
    + _frame('window', 16, 'rgba(14,11,8,.94)')
    + 'box-shadow:0 8px 40px rgba(0,0,0,0.8);'
    + 'position:relative;'
    + '">'
    // Close button
    + '<div data-interactive onclick="sendAction(\'toggleWorldMap\')" style="'
    + 'position:absolute;top:-6px;right:-6px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;font-weight:bold;'
    + 'background:#7a2e22;border:1px solid #c9a46a;color:#e8d9b5;box-shadow:0 2px 4px #000;transition:all 0.15s;z-index:31;'
    + '" onmouseenter="this.style.background=\'#9a3e2e\'" onmouseleave="this.style.background=\'#7a2e22\'">✕</div>'
    // Title
    + '<div style="' + _PLATE + 'font-size:16px;">' + title + '</div>'
    + _rule('fadeCross', '70%', 18)
    // SVG Map content
    + svgContent
    // Subtitle hint
    + '<div style="font-size:12px;color:rgba(232,217,181,0.6);font-family:Georgia,serif;margin-top:6px;text-align:center;">' + subtitle + '</div>'
    + '</div>'
    + '</div>';
}

// ─── ABYSS (MAIN) MAP ───
export function renderAbyssMapOverlay(s, playerPos) {
  var zones = s.discoveredZones || [];
  var mapW = 480, mapH = 360, scale = 0.95;
  var cx = mapW / 2, cy = mapH / 2;
  var playerX = playerPos ? playerPos.x : 0, playerZ = playerPos ? playerPos.z : 0;

  // Grid lines
  var gridSvg = '';
  for (var gx = -200; gx <= 200; gx += 50) {
    var sx = cx + gx * scale;
    gridSvg += '<line x1="' + sx + '" y1="0" x2="' + sx + '" y2="' + mapH + '" stroke="rgba(200,175,120,0.06)" stroke-width="0.5" />';
  }
  for (var gz = -200; gz <= 200; gz += 50) {
    var sy = cy + gz * scale;
    gridSvg += '<line x1="0" y1="' + sy + '" x2="' + mapW + '" y2="' + sy + '" stroke="rgba(200,175,120,0.06)" stroke-width="0.5" />';
  }

  // Landmark icons + labels (same style as minimap)
  var landmarkSvg = '';
  for (var li = 0; li < MAP_LANDMARKS.length; li++) {
    var lm = MAP_LANDMARKS[li];
    var lx = cx + lm.x * scale, ly = cy + lm.z * scale;
    if (lx < -20 || lx > mapW + 20 || ly < -20 || ly > mapH + 20) continue;
    var disc = zones.indexOf(lm.label) !== -1;
    var opacity = disc ? '1' : '0.3';
    // Icon via foreignObject (40x40)
    landmarkSvg += '<foreignObject x="' + (lx - 20) + '" y="' + (ly - 20) + '" width="40" height="40" style="overflow:visible;opacity:' + opacity + ';">'
      + '<img xmlns="http://www.w3.org/1999/xhtml" src="' + lm.icon + '" style="width:40px;height:40px;display:block;filter:drop-shadow(0 0 4px rgba(200,175,120,0.6));pointer-events:none;" />'
      + '</foreignObject>';
    // Zone label below icon
    landmarkSvg += '<text x="' + lx + '" y="' + (ly + 30) + '" fill="rgba(220,200,140,' + (disc ? '0.95' : '0.3') + ')" font-size="14" font-family="Cinzel,serif" text-anchor="middle" font-weight="bold" stroke="rgba(0,0,0,0.95)" stroke-width="3" paint-order="stroke fill">' + lm.label + '</text>';
  }

  // Player marker
  var px = cx + playerX * scale, py = cy + playerZ * scale;
  var playerSvg = '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="6" fill="rgba(120,255,60,0.95)" stroke="rgba(160,255,100,0.8)" stroke-width="2">'
    + '<animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />'
    + '</circle>';

  var svg = '<svg viewBox="0 0 ' + mapW + ' ' + mapH + '" width="100%" style="border:1px solid rgba(80,65,40,0.3);border-radius:4px;background:rgba(10,8,14,0.9);">'
    + '<defs><filter id="wm-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
    + gridSvg
    + '<g filter="url(#wm-glow)">' + landmarkSvg + '</g>'
    + playerSvg
    + '</svg>';

  return wrapMapOverlay('The Abyss — World Map', 'Discovered zones glow brighter. Press M to close.', svg);
}

// ─── DOJO MAP — Rectangular cathedral sparring hall, 40×60 ───
export function renderDojoMapOverlay(s, playerPos) {
  var mapW = 480, mapH = 400;
  var playerX = playerPos ? playerPos.x : 0, playerZ = playerPos ? playerPos.z : 0;

  // Dojo world: x: -20..20, z: -30..30 → SVG with padding
  var padX = 60, padY = 40;
  var innerW = mapW - padX * 2, innerH = mapH - padY * 2;
  function wx(x) { return padX + (x + 20) / 40 * innerW; }
  function wy(z) { return padY + (z + 30) / 60 * innerH; }

  var svg = '<svg viewBox="0 0 ' + mapW + ' ' + mapH + '" width="100%" style="border:1px solid rgba(80,65,40,0.3);border-radius:4px;background:rgba(10,8,14,0.9);">';
  // Defs
  svg += '<defs>'
    + '<filter id="dj-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="dj-fire"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '</defs>';

  // Background grid — subtle
  for (var gx = -20; gx <= 20; gx += 10) {
    svg += '<line x1="' + wx(gx) + '" y1="' + padY + '" x2="' + wx(gx) + '" y2="' + (mapH - padY) + '" stroke="rgba(100,80,160,0.06)" stroke-width="0.5" />';
  }
  for (var gz = -30; gz <= 30; gz += 10) {
    svg += '<line x1="' + padX + '" y1="' + wy(gz) + '" x2="' + (mapW - padX) + '" y2="' + wy(gz) + '" stroke="rgba(100,80,160,0.06)" stroke-width="0.5" />';
  }

  // Room outline (dark stone walls)
  svg += '<rect x="' + wx(-20) + '" y="' + wy(-30) + '" width="' + (wx(20) - wx(-20)) + '" height="' + (wy(30) - wy(-30)) + '" '
    + 'fill="rgba(25,18,35,0.6)" stroke="rgba(120,90,60,0.5)" stroke-width="2" rx="3" />';

  // Wall thickness effect (inner rectangle)
  var wt = 1.5;
  svg += '<rect x="' + wx(-20 + wt) + '" y="' + wy(-30 + wt) + '" width="' + (wx(20 - wt) - wx(-20 + wt)) + '" height="' + (wy(30 - wt) - wy(-30 + wt)) + '" '
    + 'fill="none" stroke="rgba(90,70,45,0.3)" stroke-width="1" stroke-dasharray="4,4" rx="2" />';

  // Columns — two rows at x=±8, six per row along Z
  var COL_X = 8;
  var COL_Z = [-20, -12, -4, 4, 12, 20];
  for (var ci = 0; ci < COL_Z.length; ci++) {
    // Left column
    svg += '<circle cx="' + wx(-COL_X) + '" cy="' + wy(COL_Z[ci]) + '" r="5" fill="rgba(60,45,30,0.7)" stroke="rgba(120,95,60,0.6)" stroke-width="1.5" />';
    // Right column
    svg += '<circle cx="' + wx(COL_X) + '" cy="' + wy(COL_Z[ci]) + '" r="5" fill="rgba(60,45,30,0.7)" stroke="rgba(120,95,60,0.6)" stroke-width="1.5" />';
  }

  // Chandeliers — 3 along centerline at z=-16, 0, 16
  var chandZ = [-16, 0, 16];
  for (var chi = 0; chi < chandZ.length; chi++) {
    svg += '<g filter="url(#dj-fire)">';
    svg += '<circle cx="' + wx(0) + '" cy="' + wy(chandZ[chi]) + '" r="8" fill="rgba(40,80,30,0.15)" stroke="rgba(80,200,60,0.35)" stroke-width="1" />';
    svg += '<circle cx="' + wx(0) + '" cy="' + wy(chandZ[chi]) + '" r="3" fill="rgba(100,220,70,0.6)">';
    svg += '<animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />';
    svg += '</circle></g>';
  }

  // Braziers — pairs near each column pair
  var brazierZ = [-25, -10, 10, 25];
  for (var bi = 0; bi < brazierZ.length; bi++) {
    for (var side = -1; side <= 1; side += 2) {
      var bx = side * 16;
      svg += '<g filter="url(#dj-fire)">';
      svg += '<rect x="' + (wx(bx) - 3) + '" y="' + (wy(brazierZ[bi]) - 3) + '" width="6" height="6" fill="rgba(50,35,25,0.8)" stroke="rgba(100,80,50,0.6)" stroke-width="1" rx="1" />';
      svg += '<circle cx="' + wx(bx) + '" cy="' + wy(brazierZ[bi]) + '" r="4" fill="rgba(80,180,50,0.4)">';
      svg += '<animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />';
      svg += '</circle></g>';
    }
  }

  // Entrance marker (south wall)
  svg += '<rect x="' + (wx(-3)) + '" y="' + (wy(30) - 2) + '" width="' + (wx(3) - wx(-3)) + '" height="6" fill="rgba(140,100,50,0.5)" stroke="rgba(200,160,80,0.6)" stroke-width="1" rx="2" />';
  svg += '<text x="' + wx(0) + '" y="' + (wy(30) + 20) + '" fill="rgba(200,170,100,0.7)" font-size="12" font-family="Cinzel,serif" text-anchor="middle" font-weight="bold" stroke="rgba(0,0,0,0.8)" stroke-width="2" paint-order="stroke fill">Entrance</text>';

  // Labels
  svg += '<text x="' + wx(0) + '" y="' + (wy(-30) - 10) + '" fill="rgba(80,200,60,0.6)" font-size="14" font-family="Cinzel,serif" text-anchor="middle" font-weight="bold" stroke="rgba(0,0,0,0.8)" stroke-width="2" paint-order="stroke fill">Sparring Hall</text>';
  svg += '<text x="' + wx(-COL_X) + '" y="' + (wy(-25)) + '" fill="rgba(180,155,100,0.4)" font-size="10" font-family="Cinzel,serif" text-anchor="middle">Columns</text>';
  svg += '<text x="' + wx(COL_X) + '" y="' + (wy(-25)) + '" fill="rgba(180,155,100,0.4)" font-size="10" font-family="Cinzel,serif" text-anchor="middle">Columns</text>';

  // Player marker
  var pmx = wx(playerX), pmy = wy(playerZ);
  pmx = Math.max(padX + 5, Math.min(mapW - padX - 5, pmx));
  pmy = Math.max(padY + 5, Math.min(mapH - padY - 5, pmy));
  svg += '<circle cx="' + pmx.toFixed(1) + '" cy="' + pmy.toFixed(1) + '" r="6" fill="rgba(120,255,60,0.95)" stroke="rgba(160,255,100,0.8)" stroke-width="2">'
    + '<animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />'
    + '</circle>';

  // Coordinate readout
  svg += '<text x="' + (mapW / 2) + '" y="' + (mapH - 8) + '" fill="rgba(180,155,100,0.35)" font-size="10" font-family="Cinzel,serif" text-anchor="middle">' + Math.round(playerX) + ' , ' + Math.round(playerZ) + '</text>';

  svg += '</svg>';

  return wrapMapOverlay('The Dojo', 'Gothic cathedral sparring hall. Press M to close.', svg);
}

// ─── SANCTUM MAP — Circular chamber with 16 pillars ───
export function renderSanctumMapOverlay(s, playerPos) {
  var mapW = 480, mapH = 480;
  var playerX = playerPos ? playerPos.x : 0, playerZ = playerPos ? playerPos.z : 0;

  // Sanctum world: circular, radius ~30. Center at 0,0
  var cx = mapW / 2, cy = mapH / 2;
  var mapScale = 6.5; // world units to SVG pixels

  function wx(x) { return cx + x * mapScale; }
  function wy(z) { return cy + z * mapScale; }

  var svg = '<svg viewBox="0 0 ' + mapW + ' ' + mapH + '" width="100%" style="border:1px solid rgba(80,65,40,0.3);border-radius:4px;background:rgba(10,8,14,0.9);">';
  // Defs
  svg += '<defs>'
    + '<filter id="sc-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="sc-fire"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<radialGradient id="sc-floor" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0%" stop-color="rgba(40,60,35,0.2)"/>'
    + '<stop offset="80%" stop-color="rgba(20,30,18,0.15)"/>'
    + '<stop offset="100%" stop-color="rgba(10,10,10,0)"/>'
    + '</radialGradient>'
    + '</defs>';

  // Subtle radial grid
  var gridR = [10, 20, 30];
  for (var gi = 0; gi < gridR.length; gi++) {
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (gridR[gi] * mapScale) + '" fill="none" stroke="rgba(80,160,60,0.05)" stroke-width="0.5" />';
  }
  // Cross lines
  svg += '<line x1="' + (cx - 30 * mapScale) + '" y1="' + cy + '" x2="' + (cx + 30 * mapScale) + '" y2="' + cy + '" stroke="rgba(80,160,60,0.04)" stroke-width="0.5" />';
  svg += '<line x1="' + cx + '" y1="' + (cy - 30 * mapScale) + '" x2="' + cx + '" y2="' + (cy + 30 * mapScale) + '" stroke="rgba(80,160,60,0.04)" stroke-width="0.5" />';

  // Floor circle (ritual floor)
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (30 * mapScale) + '" fill="url(#sc-floor)" stroke="rgba(80,160,60,0.2)" stroke-width="1.5" />';

  // Outer wall ring
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (30 * mapScale) + '" fill="none" stroke="rgba(100,80,50,0.6)" stroke-width="8" />';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (28 * mapScale) + '" fill="none" stroke="rgba(70,55,35,0.3)" stroke-width="1" stroke-dasharray="6,6" />';

  // 16 outer pillars at radius 28
  var NP = 16;
  var pillarR = 28;
  for (var pi = 0; pi < NP; pi++) {
    var angle = (pi / NP) * Math.PI * 2;
    var ppx = wx(Math.cos(angle) * pillarR);
    var ppy = wy(Math.sin(angle) * pillarR);
    svg += '<circle cx="' + ppx.toFixed(1) + '" cy="' + ppy.toFixed(1) + '" r="5" fill="rgba(55,45,30,0.8)" stroke="rgba(110,90,55,0.7)" stroke-width="1.5" />';
  }

  // 16 braziers between pillars (slightly outward)
  var brazierR = 26;
  for (var bi = 0; bi < NP; bi++) {
    var ba = ((bi + 0.5) / NP) * Math.PI * 2;
    var bbx = wx(Math.cos(ba) * brazierR);
    var bby = wy(Math.sin(ba) * brazierR);
    svg += '<g filter="url(#sc-fire)">';
    svg += '<circle cx="' + bbx.toFixed(1) + '" cy="' + bby.toFixed(1) + '" r="4" fill="rgba(60,160,40,0.4)">';
    svg += '<animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />';
    svg += '</circle></g>';
  }

  // 8 inner pillars at radius 12
  var innerR = 12;
  var NI = 8;
  for (var ii = 0; ii < NI; ii++) {
    var ia = (ii / NI) * Math.PI * 2;
    var ipx = wx(Math.cos(ia) * innerR);
    var ipy = wy(Math.sin(ia) * innerR);
    svg += '<circle cx="' + ipx.toFixed(1) + '" cy="' + ipy.toFixed(1) + '" r="4" fill="rgba(50,40,28,0.7)" stroke="rgba(90,75,50,0.5)" stroke-width="1" />';
    // Crystal glow
    svg += '<circle cx="' + ipx.toFixed(1) + '" cy="' + ipy.toFixed(1) + '" r="6" fill="rgba(60,180,50,0.15)">';
    svg += '<animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />';
    svg += '</circle>';
  }

  // Central ritual area — concentric rings
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (5 * mapScale) + '" fill="rgba(60,140,50,0.08)" stroke="rgba(80,180,60,0.2)" stroke-width="1" />';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (2 * mapScale) + '" fill="rgba(80,200,60,0.1)" stroke="rgba(100,220,70,0.3)" stroke-width="1" />';

  // Central fire
  svg += '<g filter="url(#sc-fire)">';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="rgba(80,200,60,0.5)">';
  svg += '<animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />';
  svg += '</circle></g>';

  // Labels
  svg += '<text x="' + cx + '" y="' + (cy - 32 * mapScale) + '" fill="rgba(100,220,70,0.5)" font-size="14" font-family="Cinzel,serif" text-anchor="middle" font-weight="bold" stroke="rgba(0,0,0,0.8)" stroke-width="2" paint-order="stroke fill">Ritual Chamber</text>';
  svg += '<text x="' + cx + '" y="' + (cy + 15) + '" fill="rgba(100,220,70,0.3)" font-size="10" font-family="Cinzel,serif" text-anchor="middle">Eternal Flame</text>';

  // Player marker
  var pmx = wx(playerX), pmy = wy(playerZ);
  // Clamp to within the chamber
  var distFromCenter = Math.sqrt(Math.pow(pmx - cx, 2) + Math.pow(pmy - cy, 2));
  var maxDist = 29 * mapScale;
  if (distFromCenter > maxDist) {
    var ratio = maxDist / distFromCenter;
    pmx = cx + (pmx - cx) * ratio;
    pmy = cy + (pmy - cy) * ratio;
  }
  svg += '<circle cx="' + pmx.toFixed(1) + '" cy="' + pmy.toFixed(1) + '" r="6" fill="rgba(120,255,60,0.95)" stroke="rgba(160,255,100,0.8)" stroke-width="2">'
    + '<animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />'
    + '</circle>';

  // Coordinate readout
  svg += '<text x="' + cx + '" y="' + (mapH - 8) + '" fill="rgba(180,155,100,0.35)" font-size="10" font-family="Cinzel,serif" text-anchor="middle">' + Math.round(playerX) + ' , ' + Math.round(playerZ) + '</text>';

  svg += '</svg>';

  return wrapMapOverlay('The Sanctum', 'Circular chamber of the eternal green flame. Press M to close.', svg);
}

// ─── TAB: MUSIC ───
export function renderMusicTab(s) {
  var html = '';
  for (var i = 0; i < TRACKS.length; i++) {
    var t = TRACKS[i];
    var isActive = (s.activeTrack === i);
    html += '<div data-interactive onclick="sendAction(\'playTrack\',{index:' + i + '})" style="'
      + 'padding:10px 12px;margin:3px 0;border-radius:5px;cursor:pointer;'
      + 'display:flex;align-items:center;gap:10px;'
      + 'background:' + (isActive ? 'linear-gradient(135deg,rgba(80,30,120,0.35),rgba(60,20,100,0.25))' : 'transparent') + ';'
      + 'border:1px solid ' + (isActive ? 'rgba(140,80,200,0.4)' : 'transparent') + ';'
      + 'transition:all 0.15s;'
      + '" onmouseenter="this.style.background=\'rgba(80,30,120,0.2)\';this.style.borderColor=\'rgba(140,80,200,0.3)\'"'
      + ' onmouseleave="this.style.background=\'' + (isActive ? 'linear-gradient(135deg,rgba(80,30,120,0.35),rgba(60,20,100,0.25))' : 'transparent') + '\';this.style.outlineColor=\'' + (isActive ? 'rgba(140,80,200,0.4)' : 'transparent') + '\'">'
      + '<div style="font-family:Cinzel,serif;font-size:14px;color:' + (isActive ? 'rgba(220,180,255,0.95)' : 'rgba(180,150,210,0.75)') + ';'
      + 'text-shadow:0 1px 2px rgba(0,0,0,0.8);letter-spacing:0.5px;">' + (i + 1) + '. ' + t.name + '</div>'
      + '</div>';
  }
  if (s.activeTrack !== null && s.activeTrack !== undefined) {
    html += '<div data-interactive onclick="sendAction(\'stopTrack\')" style="'
      + 'margin-top:12px;padding:10px;border-radius:6px;cursor:pointer;text-align:center;'
      + 'background:linear-gradient(135deg,rgba(60,20,90,0.6),rgba(40,10,70,0.5));'
      + 'border:2px solid rgba(140,80,200,0.4);'
      + 'font-family:Cinzel,Palatino,Georgia,serif;font-size:14px;color:rgba(220,180,255,0.9);'
      + 'letter-spacing:1px;transition:all 0.15s;'
      + '" onmouseenter="this.style.borderColor=\'rgba(180,120,240,0.6)\'"'
      + ' onmouseleave="this.style.borderColor=\'rgba(140,80,200,0.4)\'">■ Stop</div>';
  }
  return html;
}

// ─── TAB: PROFESSIONS ───
function _skillBar(v) { return '<div style="margin-top:6px;height:9px;background:#1d1610;border:1px solid #6b4a2f;border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.round(100 * v / 150) + '%;background:linear-gradient(90deg,#3f6a9a,#7ab4e8)"></div></div><div style="font-family:Cinzel,serif;font-size:11px;color:#7ab4e8;margin-top:2px">' + v + ' / 150</div>'; }
export function renderProfessionsTab(s) {
  var profs = s.professions || [];
  if (profs.length === 0) {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0 24px 80px;text-align:center;margin-top:-60px;">'
      + '<img src="/cdn/icon-dark-gothic-painted-anvil-hammer.png" style="width:64px;height:64px;opacity:0.5;margin-bottom:16px;-webkit-user-drag:none;user-select:none;" />'
      + '<div style="font-family:Cinzel,serif;font-size:20px;color:rgba(220,210,190,0.9);margin-bottom:8px;">No Professions Learned</div>'
      + '<div style="font-family:Cinzel,serif;font-size:16px;color:rgba(180,170,150,0.5);max-width:280px;line-height:1.4;">Visit the Trade Forge or the Alchemist\'s Bench beside the Lantern Exchange in the Reach to learn a trade.</div>'
      + '</div>';
  }

  var PROF_INFO = {
    'Blacksmithing': { icon: '/cdn/icon-dark-gothic-painted-anvil-hammer.png', desc: 'Forge weapons and armor from raw ore. Stronger metals yield mightier gear.' },
    'Alchemy': { icon: '/cdn/icon-dark-gothic-painted-bubbling-potion-flask.png', desc: 'Brew potions and elixirs from gathered reagents. Transmute the mundane into the miraculous.' },
    'Inscription': { icon: '/cdn/icon-dark-gothic-painted-quill-scroll-rune.png', desc: 'Capture magic within scrolls and tomes. Craft powerful glyphs and enchanted writings.' },
    'Merchant': { icon: '/cdn/icon-dark-gothic-painted-gold-coin-scales.png', desc: 'Master the art of trade. Better prices from vendors and access to rare goods.' },
    'Herblore': { icon: '/cdn/icon-dark-gothic-painted-herb-bundle-mortar.png', desc: "Identify and harvest nature's bounty. Craft salves, remedies, and botanical preparations." },
    'Mining': { icon: '/cdn/icon-dark-gothic-painted-pickaxe-ore-vein.png', desc: 'Extract ores and gems from the earth. Locate veins and strike with precision.' },
    'Enchanting': { icon: '/cdn/icon-dark-gothic-painted-glowing-enchantment-rune.png', desc: 'Imbue mundane items with magical properties. Disenchant artifacts to learn new effects.' },
  };

  var slotsUsed = profs.length;
  var maxSlots = 2;

  var html = '<div style="padding:16px 20px;height:100%;overflow-y:auto;">';
  html += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(180,170,150,0.6);margin-bottom:14px;text-align:center;">'
    + slotsUsed + ' / ' + maxSlots + ' Profession Slots Used</div>';

  for (var i = 0; i < profs.length; i++) {
    var pname = profs[i];
    var info = PROF_INFO[pname] || { icon: '/cdn/icon-dark-gothic-painted-anvil-hammer.png', desc: 'A learned trade.' };
    html += '<div style="display:flex;align-items:flex-start;gap:14px;padding:4px 6px;margin-bottom:10px;'
      + _frame('skillRow', 10, 'linear-gradient(135deg,rgba(42,30,22,.92),rgba(20,14,10,.9))') + '">'
      + '<img src="' + info.icon + '" style="width:48px;height:48px;flex-shrink:0;-webkit-user-drag:none;user-select:none;'
      + 'filter:drop-shadow(0 0 6px rgba(200,180,120,0.3));" />'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(230,215,180,0.95);margin-bottom:4px;'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.5);">' + pname + '</div>'
      + '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(180,170,150,0.6);line-height:1.45;">' + info.desc + '</div>'
      + _skillBar((s.tradeSkill || {})[pname] || 0)
      + '</div></div>';
  }

  if (slotsUsed < maxSlots) {
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 16px;margin-bottom:10px;'
      + 'border:1px dashed rgba(201,164,106,.28);background:radial-gradient(rgba(42,30,22,.6),rgba(10,8,6,.6));border-radius:4px;opacity:0.7;">'
      + '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(180,170,150,0.5);">Empty Slot — Visit a master crafter to learn</div>'
      + '</div>';
  }

  html += '</div>';
  return html;
}

// ─── TAB: HIGHSCORES ───
export function renderHighscoresTab(s) {
  var LEADERBOARD = s.leaderboardData;
  var hasData = LEADERBOARD && LEADERBOARD.length > 0;

  // Filter state
  var filterRace = s.highscoreFilterRace || 'All';
  var filterClass = s.highscoreFilterClass || 'All';

  // Race & class lists for filter buttons
  var ALL_RACES = ['All','High Elf','Human','Frogman','Wood Elf','Graven','Angel','Catpeople','Grey Elf','Crustacean','Satyr','Vampire','Dark Elf','Lych','Lycan','Imp','Demon'];
  var ALL_CLASSES = ['All','Blood Knight','Necromancer','Warlock','Cultist','Ravager','Assassin','Cleric','Witch','Inquisitor','Runemaster','Druid','Engineer','Wizard','Thief','Swashbuckler','Shaman'];

  // Shared dropdown styles
  var selectStyle = ''
    + 'appearance:none;-webkit-appearance:none;-moz-appearance:none;'
    + 'background:rgba(8,6,12,0.95);'
    + 'border:1px solid rgba(180,150,70,0.5);'
    + 'border-radius:3px;'
    + 'color:rgba(220,190,100,0.95);'
    + 'font-family:Cinzel,serif;'
    + 'font-size:13px;'
    + 'letter-spacing:0.4px;'
    + 'padding:4px 24px 4px 8px;'
    + 'cursor:pointer;pointer-events:auto;'
    + 'outline:none;'
    + 'flex:1;min-width:0;'
    + 'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'rgba(180,150,70,0.7)\'/%3E%3C/svg%3E");'
    + 'background-repeat:no-repeat;background-position:right 8px center;background-size:10px 6px;'
    + 'text-shadow:0 0 6px rgba(220,190,100,0.2);';

  // Build race <option> list
  var raceOptions = '';
  for (var ri = 0; ri < ALL_RACES.length; ri++) {
    var rn = ALL_RACES[ri];
    raceOptions += '<option value="' + rn + '"' + (filterRace === rn ? ' selected' : '') + '>' + rn + '</option>';
  }

  // Build class <option> list
  var classOptions = '';
  for (var ci = 0; ci < ALL_CLASSES.length; ci++) {
    var cn = ALL_CLASSES[ci];
    classOptions += '<option value="' + cn + '"' + (filterClass === cn ? ' selected' : '') + '>' + cn + '</option>';
  }

  var html = '';

  // ── Filter dropdowns row ──
  html += '<div style="display:flex;gap:8px;padding:8px 8px 6px;align-items:center;">';

  // Race dropdown
  html += '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;">'
    + '<div style="font-size:12px;color:rgba(180,155,100,0.35);font-family:Cinzel,serif;letter-spacing:1px;">RACE</div>'
    + '<select data-interactive onchange="sendAction(\'setHighscoreFilter\',{race:this.value})" '
    + 'style="' + selectStyle + '">'
    + raceOptions
    + '</select></div>';

  // Class dropdown
  html += '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;">'
    + '<div style="font-size:12px;color:rgba(180,155,100,0.35);font-family:Cinzel,serif;letter-spacing:1px;">CLASS</div>'
    + '<select data-interactive onchange="sendAction(\'setHighscoreFilter\',{class:this.value})" '
    + 'style="' + selectStyle + '">'
    + classOptions
    + '</select></div>';

  html += '</div>';

  // Divider below filters
  html += '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(100,80,45,0.35),transparent);margin:2px 8px 4px;"></div>';

  if (!hasData) {
    html += '<div style="text-align:center;padding:40px 16px;font-family:Cinzel,Palatino,Georgia,serif;font-size:15px;color:rgba(180,155,100,0.4);font-style:italic;letter-spacing:1px;">No adventurers yet...<br><span style="font-size:12px;color:rgba(140,120,80,0.3);">Be the first to carve your name into the abyss.</span></div>';
    return html;
  }

  // Sort by player kills descending
  LEADERBOARD = LEADERBOARD.slice().sort(function(a, b) { return (b.playerKills || 0) - (a.playerKills || 0); });

  // Apply filters (AND logic)
  var filtered = LEADERBOARD.filter(function(p) {
    if (filterRace !== 'All' && (p.raceName || 'Unknown') !== filterRace) return false;
    if (filterClass !== 'All' && (p.className || 'Unknown') !== filterClass) return false;
    return true;
  });

  if (filtered.length === 0) {
    html += '<div style="text-align:center;padding:30px 16px;font-family:Cinzel,Palatino,Georgia,serif;font-size:14px;color:rgba(180,155,100,0.35);font-style:italic;letter-spacing:0.5px;">No entries match these filters.</div>';
    return html;
  }

  // Column headers
  html += '<div style="display:flex;padding:4px 8px 6px;border-bottom:1px solid rgba(100,80,45,0.35);">'
    + '<div style="width:28px;font-size:12px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">#</div>'
    + '<div style="flex:1;font-size:12px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">Name</div>'
    + '<div style="width:100px;font-size:12px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">Race</div>'
    + '<div style="width:40px;text-align:right;font-size:12px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">Kills</div>'
    + '</div>';
  for (var i = 0; i < filtered.length; i++) {
    var p = filtered[i];
    var rank = i + 1;
    var rankColor = rank <= 3 ? 'rgba(220,190,100,0.95)' : 'rgba(180,155,100,0.5)';
    var nameColor = rank <= 3 ? 'rgba(220,190,100,0.95)' : 'rgba(200,175,120,0.85)';
    html += '<div style="display:flex;align-items:center;padding:6px 8px;border-bottom:1px solid rgba(50,42,32,0.2);'
      + (rank <= 3 ? 'background:linear-gradient(90deg,rgba(80,60,20,0.15),transparent);' : '')
      + '">'
      + '<div style="width:28px;font-size:14px;font-weight:bold;color:' + rankColor + ';font-family:Cinzel,serif;">' + rank + '</div>'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-size:15px;color:' + nameColor + ';font-family:Cinzel,Palatino,Georgia,serif;letter-spacing:0.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (p.charName || 'Unknown') + '</div>'
      + '<div style="font-size:12px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">' + (p.className || 'Unknown') + '</div>'
      + '</div>'
      + '<div style="width:100px;font-size:12px;color:rgba(180,155,100,0.55);font-family:Cinzel,serif;">' + (p.raceName || 'Unknown') + '</div>'
      + '<div style="width:40px;text-align:right;font-size:16px;font-weight:bold;color:rgba(220,195,140,0.95);font-family:Cinzel,serif;">' + (p.playerKills || 0) + '</div>'
      + '</div>';
  }
  return html;
}

// ─── TAB: FRIENDS ───
export function renderFriendsTab(s) {
  var friends = s.friendsList || [];
  var onlineMap = s.friendsOnline || {};
  var promptMode = s.friendPromptMode || null;
  var friendsError = s.friendsError || null;

  var ONLINE_COLOR = 'rgba(80,220,100,0.95)';
  var OFFLINE_COLOR = 'rgba(100,85,65,0.5)';

  // Header — wrap entire tab in flex column so buttons pin to bottom
  var html = '<div style="display:flex;flex-direction:column;min-height:100%;">';

  // Friends list
  if (friends.length === 0) {
    html += '<div style="text-align:center;padding:30px 16px;font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.35);font-style:italic;letter-spacing:0.5px;line-height:1.6;">No friends yet\u2026</div>';
  } else {
    // Sort online first, then alphabetical
    var sorted = friends.slice().sort(function(a, b) {
      var aOn = onlineMap[a.id] ? 1 : 0;
      var bOn = onlineMap[b.id] ? 1 : 0;
      if (aOn !== bOn) return bOn - aOn;
      return (a.charName || 'Unknown').toLowerCase().localeCompare((b.charName || 'Unknown').toLowerCase());
    });

    for (var i = 0; i < sorted.length; i++) {
      var f = sorted[i];
      var isOnline = !!onlineMap[f.id];
      var dotColor = isOnline ? ONLINE_COLOR : OFFLINE_COLOR;
      var nameOpacity = isOnline ? '0.95' : '0.55';
      var statusLabel = isOnline ? 'Online' : 'Offline';
      var statusColor = isOnline ? 'rgba(80,220,100,0.7)' : 'rgba(100,85,65,0.4)';

      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 8px;border-bottom:1px solid rgba(50,42,32,0.2);">'
        // Status dot
        + '<div style="width:10px;height:10px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;box-shadow:0 0 6px ' + dotColor + ';"></div>'
        // Name + details
        + '<div style="flex:1;min-width:0;">'
        + '<div style="display:flex;align-items:baseline;gap:8px;">'
        + '<span style="font-size:18px;color:rgba(220,190,100,' + nameOpacity + ');font-family:Cinzel,Palatino,Georgia,serif;letter-spacing:0.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(f.charName || 'Unknown') + '</span>'
        + '<span style="font-size:18px;color:rgba(180,155,100,0.45);font-family:Cinzel,serif;">Lv.' + (f.level || 1) + '</span>'
        + '</div>'
        + '<div style="font-size:18px;color:rgba(180,155,100,0.4);font-family:Cinzel,serif;">' + esc(f.raceName || '') + ' ' + esc(f.className || '') + '</div>'
        + '</div>'
        // Status label
        + '<div style="font-size:18px;color:' + statusColor + ';font-family:Cinzel,serif;white-space:nowrap;">' + statusLabel + '</div>'
        + '</div>';
    }

    html += '<div style="text-align:center;margin-top:8px;font-size:18px;color:rgba(180,155,100,0.3);font-family:Cinzel,serif;letter-spacing:1px;">' + friends.length + ' Friend' + (friends.length !== 1 ? 's' : '') + '</div>';
  }

  // Divider
  html += '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(100,80,45,0.35),transparent);margin:12px 0;"></div>';

  // Action buttons — pinned to bottom
  html += '<div style="flex:1;"></div>'
    + '<div style="display:flex;gap:8px;justify-content:center;padding:4px 0;margin-top:auto;">'
    + '<div data-interactive onclick="sendAction(\'showFriendPrompt\', { mode: \'add\' })" style="cursor:pointer;pointer-events:auto;padding:6px 14px;background:linear-gradient(180deg,rgba(40,65,35,0.6),rgba(25,45,20,0.7));border:1px solid rgba(80,160,70,0.4);border-radius:3px;font-family:Cinzel,serif;font-size:13px;color:rgba(120,200,100,0.85);letter-spacing:0.5px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.6);">+ Add Friend</div>'
    + '<div data-interactive onclick="sendAction(\'showFriendPrompt\', { mode: \'remove\' })" style="cursor:pointer;pointer-events:auto;padding:6px 14px;background:linear-gradient(180deg,rgba(75,30,90,0.6),rgba(50,18,65,0.7));border:1px solid rgba(140,70,180,0.4);border-radius:3px;font-family:Cinzel,serif;font-size:13px;color:rgba(180,120,220,0.85);letter-spacing:0.5px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.6);">- Remove</div>'
    + '</div>';

  // Modal overlay for add/remove
  if (promptMode === 'add' || promptMode === 'remove') {
    var isAdd = promptMode === 'add';
    var modalTitle = isAdd ? 'Add Friend' : 'Remove Friend';
    var actionName = isAdd ? 'addFriend' : 'removeFriend';
    var submitLabel = isAdd ? 'Add' : 'Remove';
    var submitBg = isAdd
      ? 'background:linear-gradient(180deg,rgba(40,65,35,0.8),rgba(25,45,20,0.9));border:1px solid rgba(80,160,70,0.5);color:rgba(120,200,100,0.95);'
      : 'background:linear-gradient(180deg,rgba(65,30,30,0.8),rgba(45,20,20,0.9));border:1px solid rgba(160,70,70,0.5);color:rgba(200,100,100,0.95);';

    html += '<div data-friend-modal style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(5,3,2,0.85);display:flex;align-items:center;justify-content:center;z-index:10;border-radius:inherit;">'
      + '<div style="width:85%;max-width:340px;background:linear-gradient(180deg,rgba(28,22,16,0.98),rgba(18,14,10,0.99));border:2px solid rgba(120,95,55,0.5);border-radius:6px;box-shadow:0 0 30px rgba(0,0,0,0.8),0 0 10px rgba(120,95,55,0.15);padding:20px;">'
      // Title
      + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:22px;color:rgba(220,190,100,0.95);text-shadow:0 0 8px rgba(200,170,80,0.25),0 2px 3px rgba(0,0,0,0.8);letter-spacing:2px;text-align:center;margin-bottom:16px;">' + modalTitle + '</div>'
      // Ornate divider
      + '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(120,95,55,0.5),transparent);margin-bottom:16px;"></div>'
      // Description
      + '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.5);text-align:center;margin-bottom:12px;font-style:italic;line-height:1.5;">'
      + (isAdd ? 'Speak the name of the soul you seek\u2026' : 'Name the one you wish to sever ties with\u2026')
      + '</div>'
      // Input field — persist value in window.__faFriendName so re-renders don't clear typed text
      + '<input type="text" id="fa-friend-input" data-interactive placeholder="Character name\u2026" '
      + 'value="' + ((typeof window !== 'undefined' && window.__faFriendName) ? String(window.__faFriendName).replace(/"/g, '&quot;').replace(/</g, '&lt;') : '') + '" '
      + 'oninput="window.__faFriendName=this.value" '
      + 'onkeydown="event.stopPropagation();if(event.key===\'Enter\'){var inp=this;sendAction(\'' + actionName + '\',{name:inp.value});window.__faFriendName=\'\';event.preventDefault()}" onkeyup="event.stopPropagation()" onkeypress="event.stopPropagation()" '
      + 'style="width:100%;box-sizing:border-box;padding:10px 14px;background:rgba(10,8,6,0.8);border:1px solid rgba(100,80,45,0.5);border-radius:3px;color:rgba(220,190,100,0.9);font-family:Cinzel,serif;font-size:18px;letter-spacing:1px;outline:none;text-shadow:0 1px 2px rgba(0,0,0,0.6);" '
      + 'onfocus="this.style.borderColor=\'rgba(180,150,80,0.7)\';this.style.boxShadow=\'0 0 8px rgba(120,95,55,0.3)\'" '
      + 'onblur="this.style.borderColor=\'rgba(100,80,45,0.5)\';this.style.boxShadow=\'none\'" />';

    // Error message (gothic styled)
    if (friendsError) {
      html += '<div style="margin-top:12px;padding:10px 14px;background:linear-gradient(180deg,rgba(60,15,15,0.5),rgba(40,10,10,0.6));border:1px solid rgba(160,50,50,0.45);border-radius:4px;box-shadow:0 0 12px rgba(120,20,20,0.15),inset 0 0 8px rgba(80,10,10,0.2);font-family:Cinzel,serif;font-size:18px;color:rgba(220,100,80,0.95);text-align:center;line-height:1.5;font-style:italic;text-shadow:0 1px 4px rgba(0,0,0,0.7),0 0 6px rgba(160,40,40,0.2);display:flex;align-items:center;justify-content:space-between;gap:8px;">'
        + '<span>\u2020 ' + esc(friendsError) + '</span>'
        + '<span data-interactive onclick="sendAction(\'clearFriendsError\')" style="cursor:pointer;pointer-events:auto;color:rgba(180,60,60,0.5);font-size:20px;margin-left:4px;line-height:1;font-style:normal;">\u00d7</span>'
        + '</div>';
    }

    // Searching indicator
    if (isAdd && s.friendsSearching) {
      html += '<div style="margin-top:10px;padding:8px 12px;text-align:center;font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.6);font-style:italic;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.5);">'
        + '<span style="display:inline-block;">Searching the annals of The Abyss\u2026</span>'
        + '</div>';
    }

    // Buttons
    html += '<div style="display:flex;gap:10px;margin-top:16px;">'
      // Submit button
      + '<div data-interactive onclick="var inp=this.closest(\'[data-friend-modal]\').querySelector(\'input\');sendAction(\'' + actionName + '\', { name: inp.value });window.__faFriendName=\'\'" '
      + 'style="flex:1;cursor:pointer;pointer-events:auto;padding:10px 16px;border-radius:3px;font-family:Cinzel,serif;font-size:18px;letter-spacing:1px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.6);' + submitBg + '">'
      + submitLabel + '</div>'
      // Cancel button
      + '<div data-interactive onclick="window.__faFriendName=\'\';sendAction(\'closeFriendPrompt\')" '
      + 'style="flex:1;cursor:pointer;pointer-events:auto;padding:10px 16px;background:linear-gradient(180deg,rgba(40,35,28,0.7),rgba(28,24,18,0.8));border:1px solid rgba(80,65,40,0.4);border-radius:3px;font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.7);letter-spacing:1px;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.6);">Cancel</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // Close the flex column wrapper
  html += '</div>';

  return html;
}

// ─── TAB: GUILD ───
export function renderGuildTab(s) {
  var guildName = s.guildName || '';
  var showJoinModal = s.showGuildJoinModal || false;
  var guildError = s.guildError || '';

  var html = '<div style="text-align:center;margin-bottom:10px;">'
    + '</div>';
  html += '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(100,80,45,0.35),transparent);margin:8px 0;"></div>';

  if (guildName) {
    html += '<div style="text-align:center;padding:24px 16px;">'
      + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:20px;color:rgba(220,190,100,0.95);text-shadow:0 0 6px rgba(200,170,80,0.2);letter-spacing:1px;margin-bottom:12px;">' + esc(guildName) + '</div>'
      + '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.55);margin-bottom:20px;">You are a member of this guild.</div>'
      + '<div data-interactive onclick="sendAction(\'leaveGuild\')" style="cursor:pointer;display:inline-block;padding:10px 28px;font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(180,60,60,0.9);border:1px solid rgba(180,60,60,0.35);background:rgba(80,20,20,0.3);letter-spacing:1px;">Leave Guild</div>'
      + '</div>';
  } else {
    html += '<div style="text-align:center;padding:30px 16px;">'
      + '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(180,155,100,0.4);letter-spacing:0.5px;margin-bottom:24px;">You are not a member of any guild.</div>'
      + '<div data-interactive onclick="sendAction(\'openGuildJoin\')" style="cursor:pointer;display:inline-block;padding:10px 28px;font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(220,190,100,0.9);border:1px solid rgba(160,140,80,0.4);background:rgba(60,50,30,0.3);letter-spacing:1px;">Join Guild</div>'
      + '</div>';
  }

  if (showJoinModal) {
    html += '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;" data-interactive onclick="if(event.target===this)sendAction(\'closeGuildJoin\')">'
      + '<div style="background:rgba(15,12,10,0.96);border:1px solid rgba(100,80,45,0.4);padding:28px 32px;min-width:320px;max-width:400px;box-shadow:0 0 30px rgba(0,0,0,0.8),0 0 8px rgba(100,80,45,0.15);">'
      + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:20px;color:rgba(220,190,100,0.95);text-align:center;margin-bottom:18px;letter-spacing:1px;text-shadow:0 0 6px rgba(200,170,80,0.2);">Join or Found a Guild</div>'
      + '<div style="margin-bottom:14px;">'
      + '<input data-interactive type="text" placeholder="Enter guild name..." id="guildNameInput" onkeydown="event.stopPropagation()" onkeyup="event.stopPropagation()" onkeypress="event.stopPropagation()" style="width:100%;box-sizing:border-box;padding:10px 14px;font-family:Cinzel,serif;font-size:18px;color:rgba(220,190,100,0.9);background:rgba(30,25,18,0.9);border:1px solid rgba(100,80,45,0.4);outline:none;letter-spacing:0.5px;" onfocus="this.style.borderColor=\'rgba(160,140,80,0.7)\'" onblur="this.style.borderColor=\'rgba(100,80,45,0.4)\'" />'
      + '</div>'
      + (guildError ? '<div style="font-family:Cinzel,serif;font-size:16px;color:rgba(200,70,70,0.9);text-align:center;margin-bottom:12px;">' + esc(guildError) + '</div>' : '')
      + '<div style="display:flex;gap:12px;justify-content:center;">'
      + '<div data-interactive onclick="var v=document.getElementById(\'guildNameInput\');sendAction(\'confirmJoinGuild\',{name:v?v.value:\'\'})" style="cursor:pointer;padding:10px 24px;font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(220,190,100,0.9);border:1px solid rgba(160,140,80,0.4);background:rgba(60,50,30,0.3);letter-spacing:1px;">Join</div>'
      + '<div data-interactive onclick="var v=document.getElementById(\'guildNameInput\');sendAction(\'createGuild\',{guildName:v?v.value:\'\'})" title="10 silver charter" style="cursor:pointer;padding:10px 18px;font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(242,176,74,0.95);border:1px solid rgba(201,164,106,0.5);background:rgba(122,46,34,0.55);">Found (10s)</div>'
      + '<div data-interactive onclick="sendAction(\'closeGuildJoin\')" style="cursor:pointer;padding:10px 24px;font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(180,155,100,0.55);border:1px solid rgba(100,80,45,0.25);background:rgba(40,35,25,0.3);letter-spacing:1px;">Cancel</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  return html;
}

// ─── CLASS TALENT DATA — keyed by class name ───
// Layout: 4 tiers — Tier 0 (3 choices), Tier 1 (2 choices), Tier 2 (3 choices), Tier 3 (2 choices) = 10 total
// Each talent: { name, icon, desc, stat, amount, stat2?, amount2? }
var CLASS_TALENTS = {
  'Blood Knight': [
    // Tier 0 (3)
    { name: 'Crimson Edge',       icon: '/cdn/icon-crimson-strike-skill-ability-snmkw6ol.webp',     desc: '+5% melee damage', stat: 'strength', amount: 2 },
    { name: 'Sanguine Vigor',     icon: '/cdn/icon-dark-gothic-blood-shield-dark.png',    desc: '+10 max health', stat: 'vitality', amount: 3 },
    { name: 'Iron Blood',         icon: '/cdn/icon-dark-gothic-blood-rage-dark.png',      desc: '+3% physical resistance', stat: 'endurance', amount: 2 },
    // Tier 1 (2)
    { name: 'Hemorrhage',         icon: '/cdn/icon-dark-gothic-blood-slash-dark.png',     desc: '+4% melee damage & +1% attack speed', stat: 'strength', amount: 2, stat2: 'dexterity', amount2: 1 },
    { name: 'Scarlet Aegis',      icon: '/cdn/icon-dark-gothic-red-aegis-dark.png',       desc: '+6 max health & +2% healing received', stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 1 },
    // Tier 2 (3)
    { name: 'Bloodletting',       icon: '/cdn/icon-dark-gothic-blood-drain-dark.png',     desc: '+2% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Crimson Fortitude',  icon: '/cdn/icon-dark-gothic-blood-armor-dark.png',     desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Gore Feast',         icon: '/cdn/icon-dark-gothic-blood-feast-dark.png',     desc: '+3% life steal', stat: 'wisdom', amount: 2 },
    // Tier 3 (2)
    { name: 'Sanguine Mastery',   icon: '/cdn/icon-dark-gothic-blood-crown-dark.png',     desc: '+6% melee damage & +8 max health', stat: 'strength', amount: 3, stat2: 'vitality', amount2: 2 },
    { name: 'Exsanguinate',       icon: '/cdn/icon-dark-gothic-blood-ritual-dark.png',    desc: '+3% healing received & +2% critical strike chance', stat: 'spirit', amount: 2, stat2: 'luck', amount2: 2 },
  ],
  'Necromancer': [
    { name: 'Bone Focus',         icon: '/cdn/icon-dark-gothic-bone-spear-dark.png',      desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Corpse Resilience',  icon: '/cdn/icon-dark-gothic-bone-shield-dark.png',     desc: '+10 max health', stat: 'vitality', amount: 3 },
    { name: 'Soul Siphon',        icon: '/cdn/icon-dark-gothic-soul-harvest-dark.png',    desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Death Attunement',   icon: '/cdn/icon-dark-gothic-death-grip-dark.png',      desc: '+4% spell power & +2% cooldown reduction', stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Undying Will',       icon: '/cdn/icon-dark-gothic-undead-will-dark.png',     desc: '+3% physical resistance & +5 max health', stat: 'endurance', amount: 2, stat2: 'vitality', amount2: 1 },
    { name: 'Grave Knowledge',    icon: '/cdn/icon-dark-gothic-grave-rot-dark.png',       desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Phylactery',         icon: '/cdn/icon-dark-gothic-phylactery-dark.png',      desc: '+5% mana regeneration', stat: 'spirit', amount: 3 },
    { name: 'Lich Pact',          icon: '/cdn/icon-dark-gothic-lich-pact-dark.png',       desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Deathlord\'s Might', icon: '/cdn/icon-dark-gothic-death-crown-dark.png',     desc: '+6% spell power & +4% mana regeneration', stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 },
    { name: 'Army of Bones',      icon: '/cdn/icon-dark-gothic-undead-army-dark.png',     desc: '+4% melee damage & +3% physical resistance', stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
  ],
  'Warlock': [
    { name: 'Shadow Affinity',    icon: '/cdn/icon-dark-gothic-shadow-bolt-dark.png',     desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Demon Skin',         icon: '/cdn/icon-dark-gothic-demon-skin-dark.png',      desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Life Tap',           icon: '/cdn/icon-dark-gothic-life-tap-dark.png',        desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Hellfire Pact',      icon: '/cdn/icon-dark-gothic-hellfire-pact-dark.png',   desc: '+4% spell power & +1% critical strike chance', stat: 'intelligence', amount: 2, stat2: 'luck', amount2: 1 },
    { name: 'Void Shield',        icon: '/cdn/icon-dark-gothic-void-shield-dark.png',     desc: '+6 max health & +2% physical resistance', stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Curse Mastery',      icon: '/cdn/icon-dark-gothic-curse-weave-dark.png',     desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Nether Surge',       icon: '/cdn/icon-dark-gothic-nether-surge-dark.png',    desc: '+7% spell power', stat: 'intelligence', amount: 3 },
    { name: 'Soul Shackle',       icon: '/cdn/icon-dark-gothic-soul-shackle-dark.png',    desc: '+2% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Archfiend\'s Power', icon: '/cdn/icon-dark-gothic-archfiend-dark.png',       desc: '+6% spell power & +4% mana regeneration', stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 },
    { name: 'Demonlord\'s Might', icon: '/cdn/icon-dark-gothic-demonlord-dark.png',       desc: '+4% melee damage & +6 max health', stat: 'strength', amount: 2, stat2: 'vitality', amount2: 2 },
  ],
  'Cultist': [
    { name: 'Dark Insight',       icon: '/cdn/icon-dark-gothic-dark-whisper-dark.png',    desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Ritual Scarring',    icon: '/cdn/icon-dark-gothic-ritual-scar-dark.png',     desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Eldritch Focus',     icon: '/cdn/icon-dark-gothic-eldritch-sigil-dark.png',  desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Blood Oath',         icon: '/cdn/icon-dark-gothic-blood-oath-dark.png',      desc: '+3% cooldown reduction & +2% mana regeneration', stat: 'wisdom', amount: 2, stat2: 'spirit', amount2: 1 },
    { name: 'Madness Veil',       icon: '/cdn/icon-dark-gothic-madness-veil-dark.png',    desc: '+6 max health & +1% critical strike chance', stat: 'vitality', amount: 2, stat2: 'luck', amount2: 1 },
    { name: 'Forbidden Rite',     icon: '/cdn/icon-dark-gothic-forbidden-rite-dark.png',  desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Abyssal Chant',      icon: '/cdn/icon-dark-gothic-abyssal-chant-dark.png',   desc: '+5% cooldown reduction', stat: 'wisdom', amount: 3 },
    { name: 'Occult Trance',      icon: '/cdn/icon-dark-gothic-occult-trance-dark.png',   desc: '+2% dodge chance', stat: 'dexterity', amount: 2 },
    { name: 'Herald of the Void', icon: '/cdn/icon-dark-gothic-void-herald-dark.png',     desc: '+5% cooldown reduction & +4% spell power', stat: 'wisdom', amount: 3, stat2: 'intelligence', amount2: 2 },
    { name: 'Dark Ascension',     icon: '/cdn/icon-dark-gothic-dark-ascension-dark.png',  desc: '+4% melee damage & +3% physical resistance', stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
  ],
  'Ravager': [
    { name: 'Brutal Force',       icon: '/cdn/icon-dark-gothic-brutal-cleave-dark.png',   desc: '+5% melee damage', stat: 'strength', amount: 2 },
    { name: 'War Hide',           icon: '/cdn/icon-dark-gothic-war-hide-dark.png',        desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Berserker Vitality', icon: '/cdn/icon-dark-gothic-berserker-howl-dark.png',  desc: '+8 max health', stat: 'vitality', amount: 2 },
    { name: 'Rending Blow',       icon: '/cdn/icon-dark-gothic-rending-blow-dark.png',    desc: '+4% melee damage & +1% attack speed', stat: 'strength', amount: 2, stat2: 'dexterity', amount2: 1 },
    { name: 'Iron Gut',           icon: '/cdn/icon-dark-gothic-iron-gut-dark.png',        desc: '+3% physical resistance & +5 max health', stat: 'endurance', amount: 2, stat2: 'vitality', amount2: 1 },
    { name: 'Savage Rush',        icon: '/cdn/icon-dark-gothic-savage-rush-dark.png',     desc: '+3% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Carnage',            icon: '/cdn/icon-dark-gothic-carnage-dark.png',         desc: '+7% melee damage', stat: 'strength', amount: 3 },
    { name: 'Bloodbath',          icon: '/cdn/icon-dark-gothic-bloodbath-dark.png',       desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Warlord\'s Might',   icon: '/cdn/icon-dark-gothic-warlord-dark.png',         desc: '+6% melee damage & +4% physical resistance', stat: 'strength', amount: 3, stat2: 'endurance', amount2: 2 },
    { name: 'Unstoppable Force',  icon: '/cdn/icon-dark-gothic-unstoppable-dark.png',     desc: '+6 max health & +3% cooldown reduction', stat: 'vitality', amount: 2, stat2: 'wisdom', amount2: 2 },
  ],
  'Assassin': [
    { name: 'Poison Affinity',    icon: '/cdn/icon-dark-gothic-poison-blade-dark.png',    desc: '+3% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Smoke Screen',       icon: '/cdn/icon-dark-gothic-smoke-screen-dark.png',    desc: '+5% dodge chance', stat: 'endurance', amount: 3 },
    { name: 'Eagle Eye',          icon: '/cdn/icon-dark-gothic-eagle-eye-dark.png',       desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Arterial Precision', icon: '/cdn/icon-dark-gothic-arterial-cut-dark.png',    desc: '+3% attack speed & +1% critical strike chance', stat: 'dexterity', amount: 2, stat2: 'luck', amount2: 1 },
    { name: 'Shadow Cloak',       icon: '/cdn/icon-dark-gothic-shadow-cloak-dark.png',    desc: '+3% dodge chance & +2% cooldown reduction', stat: 'endurance', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Marked for Death',   icon: '/cdn/icon-dark-gothic-death-mark-dark.png',      desc: '+4% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Lethality',          icon: '/cdn/icon-dark-gothic-lethality-dark.png',       desc: '+5% attack speed', stat: 'dexterity', amount: 3 },
    { name: 'Viper Strike',       icon: '/cdn/icon-dark-gothic-viper-strike-dark.png',    desc: '+4% melee damage', stat: 'strength', amount: 2 },
    { name: 'Deathbringer',       icon: '/cdn/icon-dark-gothic-deathbringer-dark.png',    desc: '+5% attack speed & +3% critical strike chance', stat: 'dexterity', amount: 3, stat2: 'luck', amount2: 2 },
    { name: 'Silent Kill',        icon: '/cdn/icon-dark-gothic-silent-kill-dark.png',     desc: '+4% melee damage & +2% cooldown reduction', stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
  ],
  'Cleric': [
    { name: 'Holy Devotion',      icon: '/cdn/icon-dark-gothic-holy-smite-dark.png',      desc: '+3% healing power', stat: 'spirit', amount: 2 },
    { name: 'Divine Resilience',  icon: '/cdn/icon-dark-gothic-divine-shield-dark.png',   desc: '+10 max health', stat: 'vitality', amount: 3 },
    { name: 'Sacred Wisdom',      icon: '/cdn/icon-dark-gothic-sacred-light-dark.png',    desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Righteous Fury',     icon: '/cdn/icon-dark-gothic-righteous-fury-dark.png',  desc: '+3% healing power & +2% melee damage', stat: 'spirit', amount: 2, stat2: 'strength', amount2: 1 },
    { name: 'Martyr\'s Grace',    icon: '/cdn/icon-dark-gothic-martyrs-grace-dark.png',   desc: '+6 max health & +2% physical resistance', stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Consecration',       icon: '/cdn/icon-dark-gothic-consecration-dark.png',    desc: '+4% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Absolution',         icon: '/cdn/icon-dark-gothic-absolution-dark.png',      desc: '+5% cooldown reduction', stat: 'wisdom', amount: 3 },
    { name: 'Hallowed Ground',    icon: '/cdn/icon-dark-gothic-hallowed-ground-dark.png', desc: '+3% physical resistance', stat: 'endurance', amount: 2 },
    { name: 'Archpriest',         icon: '/cdn/icon-dark-gothic-archpriest-dark.png',      desc: '+5% healing power & +4% cooldown reduction', stat: 'spirit', amount: 3, stat2: 'wisdom', amount2: 2 },
    { name: 'Divine Intervention',icon: '/cdn/icon-dark-gothic-divine-light-dark.png',    desc: '+6 max health & +2% critical strike chance', stat: 'vitality', amount: 2, stat2: 'luck', amount2: 2 },
  ],
  'Witch': [
    { name: 'Hex Proficiency',    icon: '/cdn/icon-dark-gothic-hex-bolt-dark.png',        desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Thorn Ward',         icon: '/cdn/icon-dark-gothic-thorn-ward-dark.png',      desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Brew Mastery',       icon: '/cdn/icon-dark-gothic-brew-mastery-dark.png',    desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Venomweave',         icon: '/cdn/icon-dark-gothic-venomweave-dark.png',      desc: '+4% spell power & +1% attack speed', stat: 'intelligence', amount: 2, stat2: 'dexterity', amount2: 1 },
    { name: 'Coven Pact',         icon: '/cdn/icon-dark-gothic-coven-pact-dark.png',      desc: '+3% mana regeneration & +5 max health', stat: 'spirit', amount: 2, stat2: 'vitality', amount2: 1 },
    { name: 'Moonblight',         icon: '/cdn/icon-dark-gothic-moonblight-dark.png',      desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Cauldron Surge',     icon: '/cdn/icon-dark-gothic-cauldron-surge-dark.png',  desc: '+7% spell power', stat: 'intelligence', amount: 3 },
    { name: 'Familiar Bond',      icon: '/cdn/icon-dark-gothic-familiar-bond-dark.png',   desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Grand Hexer',        icon: '/cdn/icon-dark-gothic-grand-hexer-dark.png',     desc: '+6% spell power & +4% cooldown reduction', stat: 'intelligence', amount: 3, stat2: 'wisdom', amount2: 2 },
    { name: 'Dark Sabbath',       icon: '/cdn/icon-dark-gothic-dark-sabbath-dark.png',    desc: '+3% physical resistance & +3% mana regeneration', stat: 'endurance', amount: 2, stat2: 'spirit', amount2: 2 },
  ],
  'Inquisitor': [
    { name: 'Judgement',          icon: '/cdn/icon-dark-gothic-judgement-dark.png',        desc: '+5% melee damage', stat: 'strength', amount: 2 },
    { name: 'Purging Flame',      icon: '/cdn/icon-dark-gothic-purging-flame-dark.png',   desc: '+10 max health', stat: 'vitality', amount: 3 },
    { name: 'Interrogation',      icon: '/cdn/icon-dark-gothic-interrogate-dark.png',     desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Holy Chains',        icon: '/cdn/icon-dark-gothic-holy-chains-dark.png',     desc: '+4% melee damage & +2% healing power', stat: 'strength', amount: 2, stat2: 'spirit', amount2: 1 },
    { name: 'Penance',            icon: '/cdn/icon-dark-gothic-penance-dark.png',         desc: '+3% physical resistance & +2% cooldown reduction', stat: 'endurance', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Righteous Wrath',    icon: '/cdn/icon-dark-gothic-righteous-wrath-dark.png', desc: '+3% healing power', stat: 'spirit', amount: 2 },
    { name: 'Iron Verdict',       icon: '/cdn/icon-dark-gothic-iron-verdict-dark.png',    desc: '+7% melee damage', stat: 'strength', amount: 3 },
    { name: 'Zealot\'s Focus',    icon: '/cdn/icon-dark-gothic-zealot-focus-dark.png',    desc: '+4% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Grand Inquisitor',   icon: '/cdn/icon-dark-gothic-grand-inquisitor-dark.png', desc: '+6% melee damage & +4% cooldown reduction', stat: 'strength', amount: 3, stat2: 'wisdom', amount2: 2 },
    { name: 'Heretic\'s End',     icon: '/cdn/icon-dark-gothic-heretics-end-dark.png',    desc: '+6 max health & +3% healing power', stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 2 },
  ],
  'Runemaster': [
    { name: 'Rune of Power',      icon: '/cdn/icon-dark-gothic-rune-power-dark.png',      desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Ward Glyph',         icon: '/cdn/icon-dark-gothic-ward-glyph-dark.png',      desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Sigil of Sight',     icon: '/cdn/icon-dark-gothic-sigil-sight-dark.png',     desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Rune Cascade',       icon: '/cdn/icon-dark-gothic-rune-cascade-dark.png',    desc: '+4% spell power & +2% mana regeneration', stat: 'intelligence', amount: 2, stat2: 'spirit', amount2: 1 },
    { name: 'Stone Rune',         icon: '/cdn/icon-dark-gothic-stone-rune-dark.png',      desc: '+6 max health & +2% physical resistance', stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Glyph Trap',         icon: '/cdn/icon-dark-gothic-glyph-trap-dark.png',      desc: '+2% dodge chance', stat: 'dexterity', amount: 2 },
    { name: 'Arcane Inscription', icon: '/cdn/icon-dark-gothic-arcane-rune-dark.png',     desc: '+7% spell power', stat: 'intelligence', amount: 3 },
    { name: 'Runic Shield',       icon: '/cdn/icon-dark-gothic-runic-shield-dark.png',    desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Runekeeper',         icon: '/cdn/icon-dark-gothic-runekeeper-dark.png',      desc: '+6% spell power & +4% cooldown reduction', stat: 'intelligence', amount: 3, stat2: 'wisdom', amount2: 2 },
    { name: 'Eternity Glyph',     icon: '/cdn/icon-dark-gothic-eternity-glyph-dark.png',  desc: '+3% mana regeneration & +2% critical strike chance', stat: 'spirit', amount: 2, stat2: 'luck', amount2: 2 },
  ],
  'Druid': [
    { name: 'Entangle',           icon: '/cdn/icon-dark-gothic-entangle-dark.png',        desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Bark Skin',          icon: '/cdn/icon-dark-gothic-bark-skin-dark.png',       desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Wild Growth',        icon: '/cdn/icon-dark-gothic-wild-growth-dark.png',     desc: '+3% healing power', stat: 'spirit', amount: 2 },
    { name: 'Feral Instinct',     icon: '/cdn/icon-dark-gothic-feral-instinct-dark.png',  desc: '+2% attack speed & +2% melee damage', stat: 'dexterity', amount: 2, stat2: 'strength', amount2: 1 },
    { name: 'Regrowth',           icon: '/cdn/icon-dark-gothic-regrowth-dark.png',        desc: '+3% healing power & +5 max health', stat: 'spirit', amount: 2, stat2: 'vitality', amount2: 1 },
    { name: 'Moonfire',           icon: '/cdn/icon-dark-gothic-moonfire-dark.png',        desc: '+4% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Nature\'s Wrath',    icon: '/cdn/icon-dark-gothic-natures-wrath-dark.png',   desc: '+5% cooldown reduction', stat: 'wisdom', amount: 3 },
    { name: 'Thornlash',          icon: '/cdn/icon-dark-gothic-thornlash-dark.png',       desc: '+6 max health', stat: 'vitality', amount: 2 },
    { name: 'Archdruid',          icon: '/cdn/icon-dark-gothic-archdruid-dark.png',       desc: '+5% cooldown reduction & +4% healing power', stat: 'wisdom', amount: 3, stat2: 'spirit', amount2: 2 },
    { name: 'Primal Avatar',      icon: '/cdn/icon-dark-gothic-primal-avatar-dark.png',   desc: '+4% melee damage & +3% physical resistance', stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
  ],
  'Engineer': [
    { name: 'Turret Efficiency',  icon: '/cdn/icon-dark-gothic-turret-shot-dark.png',     desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Plated Hull',        icon: '/cdn/icon-dark-gothic-plated-hull-dark.png',     desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Overclock',          icon: '/cdn/icon-dark-gothic-overclock-dark.png',       desc: '+3% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Gadget Mastery',     icon: '/cdn/icon-dark-gothic-gadget-mastery-dark.png',  desc: '+4% spell power & +2% cooldown reduction', stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Reinforced Frame',   icon: '/cdn/icon-dark-gothic-reinforced-frame-dark.png', desc: '+6 max health & +2% physical resistance', stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Chain Lightning',    icon: '/cdn/icon-dark-gothic-chain-lightning-dark.png', desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Siege Engine',       icon: '/cdn/icon-dark-gothic-siege-engine-dark.png',    desc: '+7% melee damage', stat: 'strength', amount: 3 },
    { name: 'Precision Gears',    icon: '/cdn/icon-dark-gothic-precision-gears-dark.png', desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Master Engineer',    icon: '/cdn/icon-dark-gothic-master-engineer-dark.png', desc: '+6% spell power & +3% attack speed', stat: 'intelligence', amount: 3, stat2: 'dexterity', amount2: 2 },
    { name: 'Doomsday Device',    icon: '/cdn/icon-dark-gothic-doomsday-device-dark.png', desc: '+4% melee damage & +3% cooldown reduction', stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
  ],
  'Wizard': [
    { name: 'Arcane Focus',       icon: '/cdn/icon-dark-gothic-arcane-bolt-dark.png',     desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Mana Reservoir',     icon: '/cdn/icon-dark-gothic-mana-shield-dark.png',     desc: '+5% mana regeneration', stat: 'spirit', amount: 3 },
    { name: 'Frost Clarity',      icon: '/cdn/icon-dark-gothic-frost-nova-dark.png',      desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Spell Surge',        icon: '/cdn/icon-dark-gothic-spell-surge-dark.png',     desc: '+4% spell power & +1% critical strike chance', stat: 'intelligence', amount: 2, stat2: 'luck', amount2: 1 },
    { name: 'Arcane Barrier',     icon: '/cdn/icon-dark-gothic-arcane-barrier-dark.png',  desc: '+6 max health & +2% mana regeneration', stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 1 },
    { name: 'Meteor Shard',       icon: '/cdn/icon-dark-gothic-meteor-shard-dark.png',    desc: '+4% melee damage', stat: 'strength', amount: 2 },
    { name: 'Time Warp',          icon: '/cdn/icon-dark-gothic-time-warp-dark.png',       desc: '+5% cooldown reduction', stat: 'wisdom', amount: 3 },
    { name: 'Elemental Fury',     icon: '/cdn/icon-dark-gothic-elemental-fury-dark.png',  desc: '+2% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Archmage',           icon: '/cdn/icon-dark-gothic-archmage-dark.png',        desc: '+6% spell power & +4% mana regeneration', stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 },
    { name: 'Reality Tear',       icon: '/cdn/icon-dark-gothic-reality-tear-dark.png',    desc: '+4% cooldown reduction & +2% critical strike chance', stat: 'wisdom', amount: 2, stat2: 'luck', amount2: 2 },
  ],
  'Thief': [
    { name: 'Backstab Mastery',   icon: '/cdn/icon-dark-gothic-backstab-dark.png',        desc: '+3% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Evasion',            icon: '/cdn/icon-dark-gothic-evasion-dark.png',         desc: '+5% dodge chance', stat: 'endurance', amount: 3 },
    { name: 'Lockpick',           icon: '/cdn/icon-dark-gothic-lockpick-dark.png',        desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Shadowstep',         icon: '/cdn/icon-dark-gothic-shadowstep-dark.png',      desc: '+3% attack speed & +2% cooldown reduction', stat: 'dexterity', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Pickpocket',         icon: '/cdn/icon-dark-gothic-pickpocket-dark.png',      desc: '+2% critical strike chance & +2% spell power', stat: 'luck', amount: 2, stat2: 'intelligence', amount2: 1 },
    { name: 'Ambush',             icon: '/cdn/icon-dark-gothic-ambush-dark.png',          desc: '+4% melee damage', stat: 'strength', amount: 2 },
    { name: 'Cutthroat',          icon: '/cdn/icon-dark-gothic-cutthroat-dark.png',       desc: '+5% attack speed', stat: 'dexterity', amount: 3 },
    { name: 'Poison Vial',        icon: '/cdn/icon-dark-gothic-poison-vial-dark.png',     desc: '+4% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Master Thief',       icon: '/cdn/icon-dark-gothic-master-thief-dark.png',    desc: '+5% attack speed & +3% critical strike chance', stat: 'dexterity', amount: 3, stat2: 'luck', amount2: 2 },
    { name: 'Shadow Lord',        icon: '/cdn/icon-dark-gothic-shadow-lord-dark.png',     desc: '+4% melee damage & +3% cooldown reduction', stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
  ],
  'Swashbuckler': [
    { name: 'Riposte',            icon: '/cdn/icon-dark-gothic-riposte-dark.png',         desc: '+3% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Parry Stance',       icon: '/cdn/icon-dark-gothic-parry-stance-dark.png',    desc: '+5% physical resistance', stat: 'endurance', amount: 3 },
    { name: 'Flourish',           icon: '/cdn/icon-dark-gothic-flourish-dark.png',        desc: '+4% melee damage', stat: 'strength', amount: 2 },
    { name: 'Dirty Trick',        icon: '/cdn/icon-dark-gothic-dirty-trick-dark.png',     desc: '+3% attack speed & +1% critical strike chance', stat: 'dexterity', amount: 2, stat2: 'luck', amount2: 1 },
    { name: 'Bravado',            icon: '/cdn/icon-dark-gothic-bravado-dark.png',         desc: '+4% melee damage & +2% physical resistance', stat: 'strength', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Feint',              icon: '/cdn/icon-dark-gothic-feint-dark.png',           desc: '+3% cooldown reduction', stat: 'wisdom', amount: 2 },
    { name: 'Duelist\'s Grace',   icon: '/cdn/icon-dark-gothic-duelist-grace-dark.png',   desc: '+5% attack speed', stat: 'dexterity', amount: 3 },
    { name: 'Lucky Strike',       icon: '/cdn/icon-dark-gothic-lucky-strike-dark.png',    desc: '+2% critical strike chance', stat: 'luck', amount: 2 },
    { name: 'Blade Master',       icon: '/cdn/icon-dark-gothic-blade-master-dark.png',    desc: '+5% attack speed & +4% melee damage', stat: 'dexterity', amount: 3, stat2: 'strength', amount2: 2 },
    { name: 'Pirate King',        icon: '/cdn/icon-dark-gothic-pirate-king-dark.png',     desc: '+3% physical resistance & +2% critical strike chance', stat: 'endurance', amount: 2, stat2: 'luck', amount2: 2 },
  ],
  'Shaman': [
    { name: 'Lightning Affinity', icon: '/cdn/icon-dark-gothic-lightning-bolt-dark.png',  desc: '+5% spell power', stat: 'intelligence', amount: 2 },
    { name: 'Earth Shield',       icon: '/cdn/icon-dark-gothic-earth-shield-dark.png',    desc: '+10 max health', stat: 'vitality', amount: 3 },
    { name: 'Spirit Walk',        icon: '/cdn/icon-dark-gothic-spirit-walk-dark.png',     desc: '+3% mana regeneration', stat: 'spirit', amount: 2 },
    { name: 'Storm Totem',        icon: '/cdn/icon-dark-gothic-storm-totem-dark.png',     desc: '+4% spell power & +2% cooldown reduction', stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 },
    { name: 'Ancestral Ward',     icon: '/cdn/icon-dark-gothic-ancestral-ward-dark.png',  desc: '+3% mana regeneration & +2% physical resistance', stat: 'spirit', amount: 2, stat2: 'endurance', amount2: 1 },
    { name: 'Lava Burst',         icon: '/cdn/icon-dark-gothic-lava-burst-dark.png',      desc: '+4% melee damage', stat: 'strength', amount: 2 },
    { name: 'Feral Spirit',       icon: '/cdn/icon-dark-gothic-feral-spirit-dark.png',    desc: '+5% mana regeneration', stat: 'spirit', amount: 3 },
    { name: 'Thunder Clap',       icon: '/cdn/icon-dark-gothic-thunder-clap-dark.png',    desc: '+2% attack speed', stat: 'dexterity', amount: 2 },
    { name: 'Elder Shaman',       icon: '/cdn/icon-dark-gothic-elder-shaman-dark.png',    desc: '+5% mana regeneration & +4% cooldown reduction', stat: 'spirit', amount: 3, stat2: 'wisdom', amount2: 2 },
    { name: 'Worldbreaker',       icon: '/cdn/icon-dark-gothic-worldbreaker-dark.png',    desc: '+4% melee damage & +6 max health', stat: 'strength', amount: 2, stat2: 'vitality', amount2: 2 },
  ],
};

// Fallback talent set for classes not in the map
var FALLBACK_TALENTS = CLASS_TALENTS['Blood Knight'];

// Tier layout: indices into the 10-talent array
// Tier 0 → [0,1,2], Tier 1 → [3,4], Tier 2 → [5,6,7], Tier 3 → [8,9]
var TIER_LAYOUT = [[0,1,2],[3,4],[5,6,7],[8,9]];
var TIER_LABELS = ['I','II','III','IV'];

// ─── VOID TALENT DATA — offensive/destruction themed ───
// Layout: 4 tiers — Tier 0 (3 choices), Tier 1 (2 choices), Tier 2 (3 choices), Tier 3 (2 choices) = 10 total
var VOID_TALENTS = [
  // Tier 0 (3) — foundational offense
  { name: 'Void Strike',      icon: '/cdn/sprite-void-dark-energy-purple.png',       desc: '+6% bonus damage to all attacks',        stat: 'strength', amount: 3 },
  { name: 'Abyssal Fury',     icon: '/cdn/sprite-void-purple-fury-claws.png',        desc: '+4% attack speed',                       stat: 'dexterity', amount: 2 },
  { name: 'Dark Resonance',   icon: '/cdn/sprite-void-purple-resonance-rune.png',    desc: '+5% spell power',                        stat: 'intelligence', amount: 2 },
  // Tier 1 (2) — mid-tier power
  { name: 'Soul Drain',       icon: '/cdn/sprite-void-skull-purple.png',             desc: '+3% life steal & +2% spell power',       stat: 'wisdom', amount: 2, stat2: 'intelligence', amount2: 1 },
  { name: 'Entropy',          icon: '/cdn/sprite-void-purple-entropy-spiral.png',    desc: '+4% critical strike chance & +2% damage', stat: 'luck', amount: 2, stat2: 'strength', amount2: 1 },
  // Tier 2 (3) — specialization
  { name: 'Void Eruption',    icon: '/cdn/sprite-void-purple-explosion-aoe.png',     desc: '+7% AOE damage',                         stat: 'intelligence', amount: 3 },
  { name: 'Shadow Pierce',    icon: '/cdn/sprite-void-purple-piercing-shard.png',    desc: '+5% armor penetration',                  stat: 'strength', amount: 2 },
  { name: 'Consuming Dark',   icon: '/cdn/sprite-void-purple-dark-vortex.png',       desc: '+3% life steal & +2% attack speed',      stat: 'wisdom', amount: 2, stat2: 'dexterity', amount2: 1 },
  // Tier 3 (2) — ultimate power
  { name: 'Nihil',            icon: '/cdn/sprite-void-black-hole-purple.png',        desc: '+8% damage & +4% spell power',           stat: 'strength', amount: 4, stat2: 'intelligence', amount2: 2 },
  { name: 'Oblivion',         icon: '/cdn/sprite-void-purple-oblivion-eye.png',      desc: '+5% crit chance & +3% armor penetration', stat: 'luck', amount: 3, stat2: 'strength', amount2: 2 },
];

export function renderTalentsTab(s) {
  // the discipline's three specializations (scripts/lib/talents.js); a point every LEVEL_PER_POINT levels
  var cls = classKey(s.className), specs = TREES[cls];
  var spec = specs.find(function (x) { return x.id === s.talentSpecTab; }) || specs[0];
  var ut = s.unlockedTalents || {}, free = pointsFree(s), earned = pointsEarned(s.level), lv = s.level || 1;
  var nextAt = earned >= 12 ? 0 : (earned + 1) * LEVEL_PER_POINT;
  var tot = talentFx(s);
  var html = '<div style="display:flex;gap:4px;padding:0 6px 8px;border-bottom:1px solid rgba(80,60,30,.25);margin-bottom:8px;">';
  for (var i = 0; i < specs.length; i++) {
    var sp = specs[i], on = sp.id === spec.id, n = 0;
    for (var t = 0; t < 4; t++) if (ut[sp.id + ':' + t] !== undefined) n++;
    html += '<div data-interactive onclick="sendAction(\'setTalentTab\',{tab:\'' + sp.id + '\'})" style="flex:1;display:flex;align-items:center;gap:6px;padding:4px 6px;cursor:pointer;'
      + _frame(on ? 'buttonHot' : 'button', 8, on ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
      + (on ? 'box-shadow:0 0 10px ' + sp.color + '55;' : '') + '">'
      + '<img src="' + sp.icon + '" style="width:28px;height:28px;border-radius:3px;border:1px solid ' + sp.color + (on ? '' : '66') + ';' + (on ? '' : 'filter:brightness(.6);') + 'pointer-events:none;"/>'
      + '<div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:1px;color:' + (on ? sp.color : 'rgba(190,170,130,.6)') + ';">' + sp.name + '<div style="font-size:11px;opacity:.7;">' + n + ' / 4</div></div></div>';
  }
  html += '</div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 8px 8px;font-family:Cinzel,serif;font-size:13px;color:rgba(232,217,181,.85);">'
    + '<span>Points: <b style="color:' + (free > 0 ? '#f2b04a' : 'rgba(190,170,130,.6)') + ';">' + free + '</b>' + (nextAt ? ' <span style="opacity:.55;font-size:11px;">· next at level ' + nextAt + '</span>' : '') + '</span>'
    + '<span data-interactive onclick="sendAction(\'resetTalents\',{})" style="cursor:pointer;font-size:11px;padding:2px 8px;' + _frame('button', 4, 'rgba(14,11,8,.9)') + 'color:rgba(201,164,106,.8);">Reset</span></div>';
  html += '<div style="padding:12px 4px 6px;background:radial-gradient(ellipse at 50% 30%,' + spec.color + '22,transparent 70%);">';
  for (var tier = 0; tier < spec.tiers.length; tier++) {
    var row = spec.tiers[tier], chosen = ut[spec.id + ':' + tier], open = tier === 0 || ut[spec.id + ':' + (tier - 1)] !== undefined;
    if (tier > 0) html += '<div style="width:2px;height:12px;margin:0 auto;background:' + (open ? spec.color : 'rgba(80,60,30,.4)') + ';"></div>';
    html += '<div style="display:flex;justify-content:center;gap:8px;padding:6px 4px;' + _frame('skillRow', 10, 'rgba(20,14,10,.85)') + '">';
    for (var k = 0; k < row.length; k++) {
      var tl = row[k], isOn = chosen === k, other = chosen !== undefined && !isOn, can = canPick(s, spec.id, tier, k);
      var bd = isOn ? spec.color : can ? spec.color + 'aa' : 'rgba(60,45,25,.5)';
      html += '<div' + (can ? ' data-interactive onclick="sendAction(\'spendTalent\',{spec:\'' + spec.id + '\',tier:' + tier + ',index:' + k + '})"' : '') + ' title="' + esc(tl.flavor) + '" style="width:' + (row.length === 2 ? 128 : 100) + 'px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 3px;border-radius:4px;'
        + 'border:2px solid ' + bd + ';background:' + (isOn ? 'linear-gradient(' + spec.color + '33,rgba(14,10,8,.95))' : 'rgba(14,10,8,.9)') + ';'
        + (isOn ? 'box-shadow:0 0 12px ' + spec.color + '88;' : can ? 'cursor:pointer;animation:talentPulse 2s ease-in-out infinite;--tc:' + spec.color + ';' : '')
        + (other || !open ? 'opacity:.45;filter:grayscale(.8);' : '') + '">'
        + '<img src="' + spec.icon + '" style="width:34px;height:34px;border-radius:3px;pointer-events:none;filter:hue-rotate(' + (k * 25 - 25) + 'deg)' + (tier === 3 ? ' saturate(1.4)' : '') + ';"/>'
        + '<div style="font-family:Cinzel,serif;font-size:12px;text-align:center;line-height:1.15;color:' + (isOn ? spec.color : '#e8d9b5') + ';">' + esc(tl.name) + '</div>'
        + '<div style="font-size:11px;text-align:center;line-height:1.2;color:rgba(190,200,160,.85);">' + fxText(tl.fx) + '</div></div>';
    }
    html += '</div>';
  }
  html += '</div>';
  html += '<div style="margin-top:8px;text-align:center;font-family:Cinzel,serif;font-size:12px;color:rgba(232,217,181,.75);">All talents: +' + tot.power + '% damage · +' + tot.haste + '% faster cooldowns · +' + tot.health + '% max health</div>';
  html += '<style>@keyframes talentPulse{0%,100%{box-shadow:0 0 6px var(--tc)}50%{box-shadow:0 0 16px var(--tc)}}</style>';
  return html;
}

// ─── MAIN RENDER ───
export function renderMenuPanel(localPlayer, world, rightHudLayout) {
  var s = localPlayer.state;
  var activeTab = s.menuTab || 'inventory';
  var TAB_TITLES = {inventory:'Inventory [B]',spellbook:'Spellbook [P]',quests:'Quests [L]',character:'Character [C]',stats:'Stats [J]',talents:'Talents [N]',music:'Music [V]',map:'World Map [M]',professions:'Professions',highscores:'Highscores [H]',friends:'Friends [F]',guild:'Guild [G]',settings:'Settings [K]',reputation:'Reputation'};
  var activeTabTitle = TAB_TITLES[activeTab] || '';
  var locked = s.menuPanelLocked !== false;

  // Tab row — build with hover label support
  var tabsHtml = '';
  for (var ti = 0; ti < TABS.length; ti++) {
    var tab = TABS[ti];
    var isActive = tab.id === activeTab;
    tabsHtml += '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'' + tab.id + '\'})" title="' + tab.title + ' (' + tab.key + ')" style="'
      + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
      + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
      + _frame(isActive ? 'buttonHot' : 'button', 5, isActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
      + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;'
      + (isActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
      + '" onmouseenter="this.style.outlineColor=\'' + (isActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + tab.title + '\';"'
      + ' onmouseleave="this.style.outlineColor=\'' + (isActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
      + '<img src="' + tab.icon + '" data-interactive style="width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;user-select:none;pointer-events:none;border-radius:2px;'
      + 'filter:' + (isActive ? 'brightness(1.2) sepia(0.1)' : 'brightness(0.8) saturate(0.7)') + ';" />'
      + '</div>';
  }

  // Talents button — same size as other tabs (48x48)
  var talentsActive = activeTab === 'talents';
  var talentsBtn = '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'talents\'})" title="Talents (T)" style="'
    + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + _frame(talentsActive ? 'buttonHot' : 'button', 5, talentsActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
    + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;'
    + (talentsActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
    + '" onmouseenter="this.style.outlineColor=\'' + (talentsActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'Talents [N]\';"'
    + ' onmouseleave="this.style.outlineColor=\'' + (talentsActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
    + '<img src="/cdn/icon-painted-glowing-talent-tree-no-border-dark-bg.png" data-interactive style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;filter:' + (talentsActive ? 'brightness(1.2) sepia(0.1)' : 'brightness(0.8) saturate(0.7)') + ';" />'
    + '</div>';

  // Stats button — 48x48, same style as other header tabs
  var statsActive = activeTab === 'stats';
  var statsBtn = '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'stats\'})" title="Stats [J]" style="'
    + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + _frame(statsActive ? 'buttonHot' : 'button', 5, statsActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
    + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;'
    + (statsActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
    + '" onmouseenter="this.style.outlineColor=\'' + (statsActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'Stats [J]\';"'
    + ' onmouseleave="this.style.outlineColor=\'' + (statsActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
    + '<img src="/cdn/icon-painted-gothic-quill-ink-stat-scroll-no-border-dark-bg.png" data-interactive style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;filter:' + (statsActive ? 'brightness(1.2) sepia(0.1)' : 'brightness(0.8) saturate(0.7)') + ';" />'
    + '</div>';

  // Map button (opens overlay, not a tab) — 48x48, pushed to far right
  var mapActive = s.showWorldMap === true;
  var mapBtn = '<div data-interactive onclick="sendAction(\'toggleWorldMap\')" title="World Map (M)" style="'
    + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + _frame(mapActive ? 'buttonHot' : 'button', 5, mapActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
    + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;'
    + (mapActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
    + '" onmouseenter="this.style.outlineColor=\'' + (mapActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'World Map\';"'
    + ' onmouseleave="this.style.outlineColor=\'' + (mapActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
    + '<img src="/cdn/icon-painted-folded-map-red-pin-no-border-dark-bg.png" data-interactive style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;filter:brightness(0.85);" />'
    + '</div>';

  // Music button (switches to music tab) — 48x48 to match main tabs
  var musicActive = activeTab === 'music';
  var musicBtn = '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'music\'})" title="Music" style="'
    + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + _frame(musicActive ? 'buttonHot' : 'button', 5, musicActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
    + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;'
    + (musicActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
    + '" onmouseenter="this.style.outlineColor=\'' + (musicActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'Music\';"'
    + ' onmouseleave="this.style.outlineColor=\'' + (musicActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
    + '<img src="/cdn/icon-painted-wooden-lute-strings-no-border-dark-bg.png" data-interactive style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;filter:sepia(0.3) brightness(0.9);" />'
    + '</div>';

  // Lock button
  var lockBtn = '<div data-interactive onclick="sendAction(\'toggleMenuLock\')" title="' + (locked ? 'Unlock panel' : 'Lock panel') + '" style="'
    + 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + 'border:2px solid ' + (locked ? 'rgba(200,175,120,0.5)' : 'rgba(60,45,25,0.4)') + ';'
    + 'border-radius:3px;cursor:pointer;pointer-events:auto;transition:all 0.15s;flex-shrink:0;">'
    + '<span style="font-size:14px;color:rgba(200,175,120,' + (locked ? '0.9' : '0.4') + ');pointer-events:none;">' + (locked ? '\uD83D\uDD12' : '\uD83D\uDD13') + '</span></div>';

  // Content
  var content = '';
  switch (activeTab) {
    case 'spellbook': content = renderSpellbookTab(s); break;
    case 'quests': content = renderQuestsTab(s); break;
    case 'character': content = renderCharTab(s); break;
    case 'stats': content = renderStatsTab(s); break;
    case 'inventory': content = renderInvTab(s); break;
    case 'music': content = renderMusicTabNew(s); break;
    case 'settings': content = renderSettingsTab(s); break;
    case 'professions': content = renderProfessionsTab(s); break;
    case 'highscores': content = renderHighscoresTab(s); break;
    case 'friends': content = renderFriendsTab(s); break;
    case 'guild': content = renderGuildTab(s); break;
    case 'talents': content = renderTalentsTab(s); break;
    case 'reputation': content = renderReputationTab(s); break;
    default: content = renderInvTab(s); break;
  }

  // ── Bottom icon bar: Highscores, Friends, Guild, Talents ──
  var BOTTOM_ICONS = [
    { id: 'professions', icon: '/cdn/icon-painted-blacksmith-anvil-hammer-no-border-dark-bg.png', title: 'Professions' },
    { id: 'highscores', icon: '/cdn/icon-painted-gold-trophy-cup-no-border-dark-bg.png', title: 'Highscores [H]' },
    { id: 'friends',    icon: '/cdn/icon-painted-two-people-silhouettes-standing-together-friends-no-border-dark-bg.png',    title: 'Friends [F]' },
    { id: 'guild',      icon: '/cdn/icon-painted-heraldic-banner-shield-no-border-dark-bg.png', title: 'Guild [G]' },
    { id: 'reputation', icon: '/cdn/icon-painted-green-star-emblem-no-border-dark-bg.png', title: 'Reputation' },
  ];
  var bottomBarHtml = '';
  for (var bi = 0; bi < BOTTOM_ICONS.length; bi++) {
    var bIcon = BOTTOM_ICONS[bi];
    var bActive = bIcon.id === activeTab;
    bottomBarHtml += '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'' + bIcon.id + '\'})" title="' + bIcon.title + '" style="'
      + 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;'
      + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
      + _frame(bActive ? 'buttonHot' : 'button', 5, bActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
      + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;'
      + (bActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
      + '" onmouseenter="this.style.outlineColor=\'' + (bActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + bIcon.title + '\';"'
      + ' onmouseleave="this.style.outlineColor=\'' + (bActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
      + '<img src="' + bIcon.icon + '" style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;'
      + 'filter:' + (bActive ? 'brightness(1.2) sepia(0.1)' : 'brightness(0.8) saturate(0.7)') + ';" />'
      + '</div>';
  }

  // Add map button to bottom bar (before settings)
  bottomBarHtml += mapBtn;

  // Add settings button to bottom bar
  var settingsActive = activeTab === 'settings';
  bottomBarHtml += '<div data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'settings\'})" title="Settings [K]" style="'
    + 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + _frame(settingsActive ? 'buttonHot' : 'button', 5, settingsActive ? 'linear-gradient(#3a2a1c,#1a120c)' : 'rgba(14,11,8,.9)')
    + 'box-sizing:border-box;border-radius:0;cursor:pointer;pointer-events:auto;transition:all 0.15s;'
    + (settingsActive ? 'box-shadow:0 0 12px rgba(140,80,200,0.5),0 0 24px rgba(120,60,180,0.2);' : 'box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);')
    + '" onmouseenter="this.style.outlineColor=\'' + (settingsActive ? 'rgba(170,110,230,1)' : 'rgba(200,175,120,0.6)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'Settings [K]\';"'
    + ' onmouseleave="this.style.outlineColor=\'' + (settingsActive ? 'rgba(140,80,200,0.8)' : 'rgba(60,45,25,0.5)') + '\';var lbl=this.closest(\'[data-menu-panel]\').querySelector(\'[data-tab-label]\');if(lbl)lbl.textContent=\'' + activeTabTitle + '\';">'
    + '<img src="/cdn/icon-painted-iron-gear-cog-no-border-dark-bg.png" style="width:100%;height:100%;object-fit:cover;border-radius:2px;-webkit-user-drag:none;user-select:none;pointer-events:none;'
    + 'filter:' + (settingsActive ? 'brightness(1.2) sepia(0.1)' : 'brightness(0.8) saturate(0.7)') + ';" />'
    + '</div>';

  var spikeSvg = '';

  var mpScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var mpScaleStyle = mpScale < 1 ? 'transform:scale(' + mpScale + ');transform-origin:bottom right;' : '';

  return '<div data-menu-panel style="'
    + 'position:fixed;bottom:28px;right:8px;z-index:200;'
    + 'width:425px;height:605px;'
    + 'min-width:340px;min-height:385px;'
    + 'font-family:Cinzel,serif;pointer-events:none;'
    + mpScaleStyle
    + '">'

    // Inner panel — holds all content, creates its own stacking context
    + '<div style="position:absolute;inset:0;'
    + _frame('window', 16, 'rgba(14,11,8,.94)')
    + 'box-shadow:0 4px 30px rgba(0,0,0,0.7),0 0 4px rgba(40,35,30,0.1),inset 0 1px 0 rgba(60,55,50,0.04);'
    + 'font-family:Cinzel,serif;display:flex;flex-direction:column;pointer-events:auto;'
    + (locked ? 'resize:none;overflow:visible;' : 'resize:both;overflow:visible;')
    + 'z-index:10;'
    + '">'

    // Subtle texture overlay (neutral)
    
    // Spike border
    + spikeSvg

    // Title plate, centred on the top edge
    + '<div data-tab-label style="' + _PLATE + '">' + activeTabTitle + '</div>'
    // Header: tabs + settings
    + '<div style="display:flex;align-items:center;justify-content:space-evenly;padding:12px 4px 2px;flex-shrink:0;position:relative;z-index:10;">'
    + tabsHtml + statsBtn + musicBtn + talentsBtn + '</div>'

    // Hover label for tab names
    + '<div style="flex-shrink:0;position:relative;z-index:10;">' + _rule('fadeCross', '86%', 18) + '</div>'

    // Content (scrollable)
    + '<div id="fa-menu-scroll" data-interactive onwheel="event.stopPropagation()" style="flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 12px;scrollbar-width:thin;scrollbar-color:rgba(80,60,40,0.4) transparent;position:relative;z-index:10;">'
    + content + '</div>'
    + '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="(function(){var el=document.getElementById(\'fa-menu-scroll\');if(!el)return;if(window._faMenuTab===\'' + activeTab + '\'&&window._faMenuScroll){el.scrollTop=window._faMenuScroll;}else{window._faMenuTab=\'' + activeTab + '\';window._faMenuScroll=0;}el.onscroll=function(){window._faMenuScroll=el.scrollTop;};})()" style="display:none" />'

    // Bottom icon bar
    + '<div style="display:flex;align-items:center;justify-content:space-evenly;padding:6px 4px 0;border-top:1px solid rgba(201,164,106,0.25);flex-shrink:0;position:relative;z-index:10;">'
    + bottomBarHtml + '</div>'

    + '</div>'

    // Gothic bronze corner frame overlay — OUTSIDE the inner panel, in the outer wrapper
    // This guarantees it paints above all panel content since it's a sibling with higher z-index

    + '</div>';
}

module.exports = { renderMenuPanel, renderWorldMapOverlay };
