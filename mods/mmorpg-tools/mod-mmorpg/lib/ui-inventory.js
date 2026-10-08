// Unified Character & Inventory Panel — MMORPG Tools Mod
// Dark gothic floating window: equipment + stats + inventory grid
// module.exports = { renderInventory }

const { RACES, CLASSES } = require('./races.js');
const { ITEM_LOOKUP } = require('./class-items.js');

var STAT_NAMES = ['Strength','Dexterity','Intelligence','Wisdom','Vitality','Endurance','Luck','Spirit'];
var STAT_KEYS  = ['strength','dexterity','intelligence','wisdom','vitality','endurance','luck','spirit'];
var RESIST_NAMES = ['Fire','Ice','Lightning','Poison','Shadow'];
var RESIST_KEYS  = ['fire','ice','lightning','poison','shadow'];
var RESIST_ICON_URLS = [
  '/cdn/icon-dark-gothic-fire-orange.png',
  '/cdn/icon-dark-gothic-ice-blue.png',
  '/cdn/icon-dark-gothic-lightning-yellow.png',
  '/cdn/icon-dark-gothic-poison-green.png',
  '/cdn/icon-dark-gothic-shadow-purple.png'
];

var RESIST_ICONS = ['🔥','❄','⚡','☠','👁'];
var RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ','ᛠ','ᛡ','ᛢ','ᛣ','ᛤ','ᛥ','ᛦ'];

// ─── Tooltip builder: given an item (with optional stats), build stat lines ───
export function buildItemTooltip(item) {
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
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Armour: +' + itemStats.armour + '</div>';
    }
    var tierCol = item.tier === 'raid2' ? '#f2b04a' : item.tier === 'raid1' ? '#c38cff' : item.tier === 'dungeon' ? '#7fb2ff' : null;
    if (item.ilvl) statLines += '<div style="font-family:Cinzel,serif;font-size:16px;color:' + (tierCol || 'rgba(220,200,170,0.9)') + ';margin-top:2px;">Item Level ' + item.ilvl + '</div>';
    if (itemStats.power) statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(140,230,140,0.95);margin-top:4px;line-height:1.5;">+' + itemStats.power + '% Power</div>';
    if (itemStats.stamina) statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(140,230,140,0.95);line-height:1.5;">+' + itemStats.stamina + ' Stamina</div>';
    if (itemStats.attack !== undefined && !itemStats.damage) {
      statLines += '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(220,200,170,0.9);margin-top:4px;line-height:1.5;">Attack: +' + itemStats.attack + '</div>';
    }
  }

  var descLine = '';
  if (desc) {
    descLine = '<div style="font-family:Cinzel,serif;font-size:18px;color:rgba(180,165,130,0.75);margin-top:4px;line-height:1.4;letter-spacing:0.3px;font-style:italic;">' + desc + '</div>';
  }

  return ''
    + '<div class="inv-tooltip" style="'
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

// ─── Equipment slot renderer with tooltip & click-to-unequip ───
export function eqSlot(label, eqItem, slotKey) {
  var content = '';
  var tooltipHtml = '';
  var clickUnequip = '';
  if (eqItem && (eqItem.icon = require('./item-icons.js').iconFor(eqItem))) {
    content = '<img src="' + eqItem.icon + '" style="width:42px;height:42px;object-fit:contain;-webkit-user-drag:none;user-select:none;pointer-events:none;" />';
    tooltipHtml = buildItemTooltip(eqItem);
    clickUnequip = ' data-interactive onclick="sendAction(\'unequipItem\',{slot:\'' + slotKey + '\'})"';
  }
  return ''
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">'
    +   '<div style="'
    +     'width:58px;height:58px;'
    +     'background:rgba(12,10,8,0.9);'
    +     'border:2px solid rgba(55,45,35,0.55);'
    +     'border-radius:3px;'
    +     'display:flex;align-items:center;justify-content:center;'
    +     'position:relative;'
    +     'box-shadow:inset 0 1px 6px rgba(0,0,0,0.8),0 1px 3px rgba(0,0,0,0.5);'
    +     (eqItem ? 'cursor:pointer;' : '')
    +   '"' + clickUnequip
    +   ' onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.6)\';this.style.boxShadow=\'inset 0 1px 6px rgba(0,0,0,0.8),0 0 14px rgba(200,175,120,0.22)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'block\';"'
    +   ' onmouseleave="this.style.borderColor=\'rgba(55,45,35,0.55)\';this.style.boxShadow=\'inset 0 1px 6px rgba(0,0,0,0.8),0 1px 3px rgba(0,0,0,0.5)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'none\';">'
    +     '<div style="position:absolute;inset:2px;border:1px solid rgba(110,80,40,0.18);border-radius:1px;pointer-events:none;"></div>'
    +     content
    +     tooltipHtml
    +   '</div>'
    +   '<div style="font-size:8px;color:rgba(180,155,100,0.38);font-family:Cinzel,serif;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap;">' + label + '</div>'
    + '</div>';
}

// ─── Large equipment slot (for Armour) with click-to-unequip ───
export function eqSlotLarge(label, eqItem, slotKey) {
  var content = '';
  var tooltipHtml = '';
  var clickUnequip = '';
  if (eqItem && (eqItem.icon = require('./item-icons.js').iconFor(eqItem))) {
    content = '<img src="' + eqItem.icon + '" style="width:74px;height:74px;object-fit:contain;-webkit-user-drag:none;user-select:none;pointer-events:none;" />';
    tooltipHtml = buildItemTooltip(eqItem);
    clickUnequip = ' data-interactive onclick="sendAction(\'unequipItem\',{slot:\'' + slotKey + '\'})"';
  }
  return ''
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">'
    +   '<div style="'
    +     'width:88px;height:88px;'
    +     'background:rgba(12,10,8,0.9);'
    +     'border:2px solid rgba(55,45,35,0.55);'
    +     'border-radius:3px;'
    +     'display:flex;align-items:center;justify-content:center;'
    +     'position:relative;'
    +     'box-shadow:inset 0 2px 8px rgba(0,0,0,0.8),0 1px 4px rgba(0,0,0,0.5);'
    +     (eqItem ? 'cursor:pointer;' : '')
    +   '"' + clickUnequip
    +   ' onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.6)\';this.style.boxShadow=\'inset 0 2px 8px rgba(0,0,0,0.8),0 0 16px rgba(200,175,120,0.22)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'block\';"'
    +   ' onmouseleave="this.style.borderColor=\'rgba(55,45,35,0.55)\';this.style.boxShadow=\'inset 0 2px 8px rgba(0,0,0,0.8),0 1px 4px rgba(0,0,0,0.5)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'none\';">'
    +     '<div style="position:absolute;inset:2px;border:1px solid rgba(110,80,40,0.18);border-radius:1px;pointer-events:none;"></div>'
    +     content
    +     tooltipHtml
    +   '</div>'
    +   '<div style="font-size:9px;color:rgba(180,155,100,0.45);font-family:Cinzel,serif;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;">' + label + '</div>'
    + '</div>';
}

export function renderInventory(localPlayer) {
  var s = localPlayer.state;
  var inventory = s.inventory || [];
  var equipment = s.equipment || {};
  var raceIndex = s.raceIndex || 0;
  var classIndex = s.classIndex || 0;
  var charName = s.charName || 'Unknown';
  var level = s.level ?? 1;
  var stats = s.stats || {};
  var resistances = s.resistances || {};

  var race = RACES[raceIndex];
  var raceName = race ? race.name : 'Human';
  var raceClasses = race ? race.classes : CLASSES;
  var className = raceClasses[classIndex] || CLASSES[classIndex] || 'Blood Knight';

  var eq = equipment;

  // ─── LEFT COLUMN: Character Info + Equipment ───
  var charInfoHtml = ''
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;margin-bottom:6px;">'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:20px;color:rgba(220,190,100,0.95);letter-spacing:2px;'
    + 'text-shadow:0 0 10px rgba(200,170,80,0.2),0 2px 3px rgba(0,0,0,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">'
    + charName + '</div>'
    + '<div style="font-size:11px;color:rgba(180,155,100,0.5);letter-spacing:1.5px;font-family:Cinzel,serif;">' + raceName + '</div>'
    + '<div style="font-size:11px;color:rgba(200,175,120,0.7);letter-spacing:1.5px;font-family:Cinzel,serif;font-weight:bold;">' + className + '</div>'
    + '<div style="font-size:10px;color:rgba(160,140,100,0.45);letter-spacing:2px;font-family:Cinzel,serif;margin-top:1px;">LEVEL ' + level + '</div>'
    + '</div>';

  // Equipment layout: Armour (single merged slot), weapons, rings, amulet
  var eqPanel = ''
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">'
    // Armour (single large slot replacing head/chest/hands/legs/feet)
    + '<div style="display:flex;justify-content:center;">'
    + eqSlotLarge('Armour', eq.armor, 'armor')
    + '</div>'
    // MainHand - OffHand
    + '<div style="display:flex;gap:4px;align-items:flex-start;">'
    + eqSlot('Main', eq.mainHand, 'mainHand')
    + eqSlot('Off', eq.offHand, 'offHand')
    + '</div>'
    // Ring1 - Amulet - Ring2 - Ring3
    + '<div style="display:flex;gap:4px;align-items:flex-start;">'
    + eqSlot('Ring', eq.ring1, 'ring1')
    + eqSlot('Amulet', eq.amulet, 'amulet')
    + eqSlot('Ring', eq.ring2, 'ring2')
    + '</div>'
    + '<div style="display:flex;justify-content:center;">'
    + eqSlot('Ring', eq.ring3, 'ring3')
    + '</div>'
    + '</div>';

  var leftCol = ''
    + '<div style="display:flex;flex-direction:column;align-items:center;width:230px;flex-shrink:0;">'
    + charInfoHtml
    + eqPanel
    + '</div>';

  // ─── RIGHT COLUMN: Stats + Resistances + Inventory Grid ───

  // Stats
  var statsHtml = ''
    + '<div style="font-size:9px;color:rgba(180,155,100,0.45);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;font-family:Cinzel,serif;font-weight:bold;">Attributes</div>';
  for (var si = 0; si < STAT_NAMES.length; si++) {
    var val = stats[STAT_KEYS[si]] ?? 10;
    statsHtml += ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid rgba(50,42,32,0.3);">'
      + '<span style="font-size:12px;color:rgba(200,175,120,0.8);letter-spacing:0.5px;font-family:Cinzel,serif;">' + STAT_NAMES[si] + '</span>'
      + '<span style="font-size:12px;color:rgba(220,195,140,0.95);font-weight:bold;font-family:Cinzel,serif;min-width:24px;text-align:right;">' + val + '</span>'
      + '</div>';
  }

  // Armour — sum from all equipped items
  var totalArmour = 0;
  var armourSlots = ['armor','head','legs','feet','hands','offHand'];
  for (var ai = 0; ai < armourSlots.length; ai++) {
    var eqItm = eq[armourSlots[ai]];
    if (eqItm) {
      var eqSt = eqItm.stats || (ITEM_LOOKUP[eqItm.id] ? ITEM_LOOKUP[eqItm.id].stats : null);
      if (eqSt && eqSt.armour !== undefined) totalArmour += eqSt.armour;
    }
  }
  statsHtml += ''
    + '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0 2px;margin-top:4px;border-top:1px solid rgba(80,65,40,0.25);border-bottom:1px solid rgba(50,42,32,0.3);">'
    + '<span style="display:flex;align-items:center;gap:4px;font-size:12px;color:rgba(200,175,120,0.8);letter-spacing:0.5px;font-family:Cinzel,serif;">'
    + '<img src="/cdn/icon-dark-gothic-shield-silver.png" style="width:14px;height:14px;opacity:0.7;filter:drop-shadow(0 0 2px rgba(180,150,70,0.3));" />'
    + 'Armour</span>'
    + '<span style="font-size:12px;color:rgba(220,195,140,0.95);font-weight:bold;font-family:Cinzel,serif;min-width:24px;text-align:right;">' + totalArmour + '</span>'
    + '</div>';

  // Resistances
  var resHtml = ''
    + '<div style="font-size:9px;color:rgba(180,155,100,0.45);letter-spacing:2px;text-transform:uppercase;margin-top:8px;margin-bottom:4px;font-family:Cinzel,serif;font-weight:bold;">Resistances</div>';
  for (var ri = 0; ri < RESIST_NAMES.length; ri++) {
    var rval = resistances[RESIST_KEYS[ri]] ?? 0;
    resHtml += ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid rgba(50,42,32,0.25);">'
      + '<span style="font-size:12px;color:rgba(200,175,120,0.8);font-family:Cinzel,serif;">'
      + '<span style="font-size:11px;margin-right:4px;opacity:0.5;">' + RESIST_ICONS[ri] + '</span>'
      + RESIST_NAMES[ri] + '</span>'
      + '<span style="font-size:12px;color:rgba(220,195,140,0.95);font-weight:bold;font-family:Cinzel,serif;min-width:24px;text-align:right;">' + rval + '</span>'
      + '</div>';
  }

  // Inventory grid (6×5 = 30)
  var now = Date.now();
  var runestoneLastUsed = s.runestoneLastUsed || 0;
  var gridCells = '';
  for (var i = 0; i < 30; i++) {
    var item = inventory[i];
    var r = RUNES[i % RUNES.length];
    var cc = '';
    var tooltipHtml = '';
    var clickAttr = '';
    var isOnCooldown = false;
    var cooldownText = '';

    if (item && (item.icon = require('./item-icons.js').iconFor(item))) {
      // Runestone — always usable, no cooldown
      if (item.id === 'runestone') {
        clickAttr = ' data-interactive onclick="sendAction(\'setMenuTab\',{tab:\'__runestone__\'})"';
      }

      cc = '<img src="' + item.icon + '" style="width:40px;height:40px;object-fit:contain;-webkit-user-drag:none;user-select:none;pointer-events:none;" />';
      if (item.count && item.count > 1) {
        cc += '<div style="position:absolute;bottom:1px;right:3px;font-size:10px;color:rgba(220,190,100,0.9);font-family:Cinzel,serif;text-shadow:0 1px 3px rgba(0,0,0,0.95);pointer-events:none;font-weight:bold;">' + item.count + '</div>';
      }

      // Build tooltip using shared builder
      tooltipHtml = buildItemTooltip(item);
    } else {
      cc = '<span style="font-size:16px;color:rgba(200,175,120,0.05);pointer-events:none;">' + r + '</span>';
    }
    gridCells += ''
      + '<div style="'
      + 'width:56px;height:56px;'
      + 'background:rgba(12,10,8,0.95);'
      + 'border:2px solid rgba(55,45,35,0.5);'
      + 'border-radius:2px;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'position:relative;'
      + 'box-shadow:inset 0 1px 5px rgba(0,0,0,0.8),0 1px 2px rgba(0,0,0,0.4);'
      + 'transition:border-color 0.15s,box-shadow 0.15s;'
      + (item && (item.id === 'runestone' || item.id === 'war-banner') ? 'cursor:pointer;' : '')
      + '"'
      + (item && item.id === 'runestone'
        ? ' data-interactive onclick="sendAction(\'useRunestone\')"'
        : item && item.id === 'war-banner'
        ? ' data-interactive onclick="sendAction(\'plantBanner\')"'
        : clickAttr)
      + ' onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.55)\';this.style.boxShadow=\'inset 0 1px 5px rgba(0,0,0,0.8),0 0 10px rgba(200,175,120,0.18)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'block\';"'
      + ' onmouseleave="this.style.borderColor=\'rgba(55,45,35,0.5)\';this.style.boxShadow=\'inset 0 1px 5px rgba(0,0,0,0.8),0 1px 2px rgba(0,0,0,0.4)\';var tt=this.querySelector(\'.inv-tooltip\');if(tt)tt.style.display=\'none\';">'
      + '<div style="position:absolute;inset:2px;border:1px solid rgba(110,80,40,0.12);border-radius:1px;pointer-events:none;"></div>'
      + cc
      + tooltipHtml
      + '</div>';
  }

  var invGridHtml = ''
    + '<div style="font-size:9px;color:rgba(180,155,100,0.45);letter-spacing:2px;text-transform:uppercase;margin-top:8px;margin-bottom:4px;font-family:Cinzel,serif;font-weight:bold;">Inventory</div>'
    + '<div style="display:grid;grid-template-columns:repeat(6,56px);gap:3px;">'
    + gridCells
    + '</div>';

  var rightCol = ''
    + '<div style="display:flex;flex-direction:column;width:370px;flex-shrink:0;">'
    + '<div style="display:flex;gap:20px;">'
    // Stats column
    + '<div style="flex:1;min-width:0;">' + statsHtml + '</div>'
    // Resistances column
    + '<div style="width:140px;flex-shrink:0;">' + resHtml + '</div>'
    + '</div>'
    + invGridHtml
    + '</div>';

  // ─── Ornamental divider (vertical) ───
  var vDivider = ''
    + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:0 4px;">'
    + '<div style="width:1px;flex:1;background:linear-gradient(180deg,transparent,rgba(100,80,45,0.35),transparent);"></div>'
    + '<div style="width:5px;height:5px;transform:rotate(45deg);border:1px solid rgba(100,80,45,0.35);background:rgba(80,65,40,0.12);flex-shrink:0;"></div>'
    + '<div style="width:1px;flex:1;background:linear-gradient(180deg,transparent,rgba(100,80,45,0.35),transparent);"></div>'
    + '</div>';

  // ─── Horizontal ornamental divider ───
  var hDivider = ''
    + '<div style="display:flex;align-items:center;gap:8px;width:100%;">'
    + '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(100,80,45,0.35));"></div>'
    + '<div style="width:5px;height:5px;transform:rotate(45deg);border:1px solid rgba(100,80,45,0.35);background:rgba(80,65,40,0.1);"></div>'
    + '<div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,rgba(100,80,45,0.35));"></div>'
    + '</div>';

  // ─── ASSEMBLE PANEL ───
  var html = ''
    + '<style>'
    + "@font-face {"
    + "  font-family:'Cinzel';"
    + "  src: url('/cdn/font-cinzel-regular.woff2') format('woff2');"
    + "  font-weight: 400; font-display: swap;"
    + "}"
    + "@font-face {"
    + "  font-family: 'Cinzel';"
    + "  src: url('/cdn/font-cinzel-bold.woff2') format('woff2');"
    + "  font-weight: 700; font-display: swap;"
    + "}"
    + '</style>'

    // Floating panel — centered, NOT fullscreen
    + '<div style="'
    + 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:300;'
    + 'font-family:Cinzel,serif;'
    + 'pointer-events:auto;'
    + 'width:850px;'
    + 'background:linear-gradient(160deg,rgba(14,12,10,0.97),rgba(8,7,5,0.97));'
    + 'border:2px solid rgba(80,70,55,0.5);'
    + 'border-radius:8px;'
    + 'box-shadow:0 0 60px rgba(0,0,0,0.85),0 0 4px rgba(120,90,40,0.15),inset 0 1px 0 rgba(120,90,40,0.08);'
    + 'padding:16px 22px 12px;'
    + '">'

    // Wrought-iron inner border accent
    + '<div style="position:absolute;inset:4px;border:1px solid rgba(80,65,40,0.15);border-radius:6px;pointer-events:none;"></div>'

    // Close button
    + '<div data-interactive onclick="sendAction(\'toggleInventory\')" style="'
    + 'position:absolute;top:-13px;right:-13px;z-index:310;'
    + 'width:38px;height:38px;display:flex;align-items:center;justify-content:center;'
    + 'background:rgba(12,10,8,0.97);'
    + 'border:2px solid rgba(100,80,50,0.45);border-radius:4px;'
    + 'color:rgba(200,175,120,0.7);font-size:18px;cursor:pointer;'
    + 'transition:all 0.15s;box-shadow:0 2px 10px rgba(0,0,0,0.6);'
    + '" onmouseenter="this.style.borderColor=\'rgba(220,190,100,0.7)\';this.style.color=\'rgba(220,190,100,1)\';this.style.boxShadow=\'0 0 16px rgba(200,175,120,0.25)\';"'
    + ' onmouseleave="this.style.borderColor=\'rgba(100,80,50,0.45)\';this.style.color=\'rgba(200,175,120,0.7)\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.6)\';">'
    + '\u2715'
    + '</div>'

    // Title
    + '<div style="text-align:center;margin-bottom:4px;">'
    + '<div style="'
    + 'font-family:Cinzel,Palatino,Georgia,serif;'
    + 'font-size:28px;'
    + 'color:rgba(220,190,100,0.95);'
    + 'letter-spacing:6px;'
    + 'text-shadow:0 0 16px rgba(200,170,80,0.2),0 0 35px rgba(180,140,60,0.08),0 2px 4px rgba(0,0,0,0.85);'
    + '">CHARACTER &amp; INVENTORY</div>'
    + '</div>'

    + hDivider

    // Two-column layout
    + '<div style="display:flex;align-items:stretch;gap:0;margin-top:8px;">'
    + leftCol
    + vDivider
    + rightCol
    + '</div>'

    // Bottom hints
    + '<div style="text-align:center;margin-top:6px;display:flex;flex-direction:column;align-items:center;gap:2px;">'
    + '<div style="'
    + 'font-size:10px;'
    + 'color:rgba(180,155,100,0.25);'
    + 'letter-spacing:3px;'
    + 'text-transform:uppercase;'
    + 'font-family:Cinzel,serif;'
    + '">Press I to close</div>'
    + '<div style="'
    + 'font-size:18px;'
    + 'color:rgba(180,155,100,0.3);'
    + 'letter-spacing:1px;'
    + 'font-family:Cinzel,serif;'
    + 'font-style:italic;'
    + '">Right-click equipped items to unequip</div>'
    + '</div>'

    + '</div>'; // end panel

  return html;
}

module.exports = { renderInventory };
