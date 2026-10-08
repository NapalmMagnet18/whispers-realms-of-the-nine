// Building panel UI — MMORPG Tools Mod
// All content driven by player state — any building door can populate these fields:
//   buildingName  — title (fallback: 'The Keep')
//   buildingGif   — animated background gif URL (fallback: castle.gif)
//   npcPortrait   — NPC portrait image URL (fallback: guard portrait)
//   npcName       — NPC name label (fallback: 'Guard')
//   npcDialogue   — dialogue text shown when Greet is clicked (fallback: 'Looking for trouble?')
//   interactingBuildingId — object ID of the building being interacted with
// Draggable as a single unified window. Positions locked.

var { QUEST_DATABASE, getAvailableQuests } = require('mod-mmorpg/lib/quest-data.js');
var { hasShop, getShopItems } = require('mod-mmorpg/lib/shop-data.js');
var { getProfession } = require('mod-mmorpg/lib/profession-data.js');

// Default heavy assets — preloaded automatically via hidden imgs
var DEFAULT_GIF = 'https://github.com/rooibosteadrinker/gifs/blob/main/buildings/castle.gif?raw=true';
var DEFAULT_STONE_BG = '/cdn/background-dark-stone-wall-interior-tuo5plzu.webp';
var DEFAULT_PORTRAIT = '/cdn/portrait-weathered-medieval-knight-armor-dusik9wg.webp';

// Collect all unique image URLs that the panel will need, given current player state.
// Always includes defaults; also includes any per-building overrides from state so
// custom doors get their assets preloaded too.
export function _collectPreloadUrls(localPlayer) {
  var urls = {};
  urls[DEFAULT_GIF] = 1;
  urls[DEFAULT_STONE_BG] = 1;
  urls[DEFAULT_PORTRAIT] = 1;
  if (localPlayer && localPlayer.state) {
    var s = localPlayer.state;
    if (s.buildingGif) urls[s.buildingGif] = 1;
    if (s.npcPortrait) urls[s.npcPortrait] = 1;
  }
  return Object.keys(urls);
}

// Returns hidden preloader imgs for every image the panel uses.
// Rendered whenever the panel is NOT showing so the browser cache
// is warm before the player ever presses E.
export function _renderPreloader(localPlayer) {
  var srcs = _collectPreloadUrls(localPlayer);
  var tags = '';
  for (var i = 0; i < srcs.length; i++) {
    tags += '<img src="' + srcs[i] + '" decoding="async" style="width:1px;height:1px;" />';
  }
  return '<div style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;" aria-hidden="true">'
    + tags + '</div>';
}

// Check if this building has an available quest for the player
export function _renderQuestButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (!buildingId) return '';

  // Check if this building has quests in the database
  var quests = QUEST_DATABASE[buildingId];
  if (!quests || quests.length === 0) return '';

  // Check availability (not accepted, not completed)
  var available = getAvailableQuests(buildingId, s);
  if (available.length === 0) return '';

  var fs = fontSize || 28;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'openCottageQuest\',{buildingId:\'' + buildingId + '\'})" style="'
    + 'margin-top:4px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:rgba(220,180,60,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
    + '>Quest</div>';
}

// Check if this is the Magic Shop and player doesn't have a runestone yet
export function _renderRunestoneButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (buildingId !== 'magic-shop') return '';

  // Check if player already has a runestone in inventory
  var inventory = s.inventory || [];
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i] && inventory[i].id === 'runestone') return '';
  }

  var fs = fontSize || 28;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'requestRunestone\')" style="'
    + 'margin-top:4px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:rgba(220,180,60,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
    + '>Runestone</div>';
}

// Check if this is the Magic Shop and player doesn't have a war banner yet
export function _renderWarBannerButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (buildingId !== 'magic-shop') return '';

  // Check if player already has a war banner in inventory
  var inventory = s.inventory || [];
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i] && inventory[i].id === 'war-banner') return '';
  }

  var fs = fontSize || 28;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'requestWarBanner\')" style="'
    + 'margin-top:4px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:rgba(220,180,60,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
    + '>War Banner</div>';
}

// Check if the player has a delivery quest targeting this building
export function _renderCompleteQuestButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (!buildingId) return '';

  var activeQuests = s.activeQuests || [];
  var inventory = s.inventory || [];
  var fs = fontSize || 28;

  for (var i = 0; i < activeQuests.length; i++) {
    var q = activeQuests[i];
    // Find the quest in the database to check deliveryTarget
    var dbQuests = QUEST_DATABASE[q.giverNpcId] || [];
    for (var j = 0; j < dbQuests.length; j++) {
      if (dbQuests[j].id === q.questId && dbQuests[j].deliveryTarget === buildingId) {
        // Check if player has the delivery item
        var deliveryItem = dbQuests[j].deliveryItem;
        if (!deliveryItem) continue;
        var hasItem = false;
        for (var k = 0; k < inventory.length; k++) {
          if (inventory[k] && inventory[k].id === deliveryItem.id) {
            hasItem = true;
            break;
          }
        }
        if (hasItem) {
          return '<div data-interactive onclick="event.stopPropagation();sendAction(\'completeCottageQuest\',{questId:\'' + q.questId + '\'})" style="'
            + 'margin-top:4px;'
            + 'pointer-events:auto;cursor:pointer;'
            + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
            + 'color:rgba(80,255,120,0.95);'
            + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(80,255,120,0.3);'
            + 'letter-spacing:1px;'
            + 'transition:color 0.15s;'
            + '" onmouseenter="this.style.color=\'rgba(120,255,160,1)\';"'
            + ' onmouseleave="this.style.color=\'rgba(80,255,120,0.95)\';"'
            + '>Complete Quest</div>';
        }
      }
    }
  }
  return '';
}

// Wizard delivery quest completion button — only at apothecary for urgent-correspondence
export function _renderWizardQuestCompleteButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (buildingId !== 'apothecary') return '';

  var activeQuests = s.activeQuests || [];
  var questId = null;
  for (var i = 0; i < activeQuests.length; i++) {
    if (activeQuests[i].questId === 'urgent-correspondence') {
      questId = 'urgent-correspondence';
      break;
    }
  }
  if (!questId) return '';

  var fs = fontSize || 28;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'completeWizardDelivery\',{questId:\'' + questId + '\'})" style="'
    + 'margin-top:4px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:rgba(180,140,255,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(180,140,255,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(210,180,255,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(180,140,255,0.95)\';"'
    + '>\u270E Deliver Letter</div>';
}

// Profession button — only for buildings that offer a profession
export function _renderProfessionButton(s) {
  var buildingId = s.interactingBuildingId;
  if (!buildingId) return '';

  var prof = getProfession(buildingId);
  if (!prof) return '';

  // Hide if player already has this profession
  var professions = s.professions || [];
  for (var i = 0; i < professions.length; i++) {
    if (professions[i] === prof.professionName) return '';
  }

  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'learnProfession\',{buildingId:\'' + buildingId + '\'})" style="'
    + 'margin-top:8px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:28px;font-style:italic;'
    + 'color:rgba(220,180,60,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
    + '>' + prof.professionName + '</div>';
}

// Profession dialogue overlay — shows when learnProfession is triggered
export function _renderProfessionDialogue(s) {
  if (!s.showProfessionDialogue) return '';

  var profName = s.profDialogueName || 'Unknown';
  var profCost = s.profDialogueCost || 50;
  var profText = s.profDialogueText || '';
  var professions = s.professions || [];
  var gold = s.gold ?? 0;

  var actionContent = '';
  if (professions.length >= 2) {
    actionContent = '<div style="'
      + 'font-family:Times New Roman,serif;font-size:20px;font-style:italic;'
      + 'color:rgba(200,120,120,0.9);'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
      + 'text-align:center;line-height:1.5;margin-top:16px;'
      + '">You have already mastered enough trades.<br/>One must know their limits.</div>';
  } else if (gold < profCost) {
    actionContent = '<div style="'
      + 'font-family:Times New Roman,serif;font-size:20px;font-style:italic;'
      + 'color:rgba(200,120,120,0.9);'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
      + 'text-align:center;line-height:1.5;margin-top:16px;'
      + '">You lack the coin. Return when you have ' + profCost + ' gold.</div>';
  } else {
    actionContent = '<div data-interactive onclick="event.stopPropagation();sendAction(\'confirmLearnProfession\')" style="'
      + 'margin-top:16px;'
      + 'display:inline-block;'
      + 'padding:10px 30px;'
      + 'background:linear-gradient(160deg,rgba(100,40,160,0.9),rgba(70,20,120,0.95));'
      + 'border:2px solid rgba(160,100,220,0.5);'
      + 'border-radius:4px;'
      + 'cursor:pointer;pointer-events:auto;'
      + 'font-family:Cinzel,serif;font-size:18px;font-weight:700;'
      + 'color:rgba(255,255,255,0.95);'
      + 'letter-spacing:1px;'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.7);'
      + 'box-shadow:0 2px 12px rgba(100,40,160,0.4),0 0 20px rgba(80,30,140,0.2);'
      + 'transition:box-shadow 0.15s,background 0.15s;'
      + '" onmouseenter="this.style.boxShadow=\'0 2px 18px rgba(140,60,200,0.6),0 0 30px rgba(100,40,160,0.3)\';"'
      + ' onmouseleave="this.style.boxShadow=\'0 2px 12px rgba(100,40,160,0.4),0 0 20px rgba(80,30,140,0.2)\';"'
      + '>Learn ' + profName + ' &mdash; ' + profCost + 'gp</div>';
  }

  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'closeProfessionDialogue\')" style="'
    + 'position:absolute;'
    + 'top:63.5%;left:0.5%;'
    + 'width:71%;height:30%;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'z-index:15;'
    + 'display:flex;align-items:center;justify-content:center;'
    + '">'

    + '<div style="'
      + 'width:100%;height:100%;'
      + 'background:linear-gradient(160deg, rgba(8,6,12,0.96) 0%, rgba(14,10,22,0.97) 40%, rgba(6,4,10,0.98) 100%);'
      + 'border:2px solid rgba(80,55,100,0.35);'
      + 'border-radius:4px;'
      + 'box-shadow:'
        + '0 0 40px rgba(0,0,0,0.8),'
        + 'inset 0 0 60px rgba(0,0,0,0.5),'
        + 'inset 0 1px 0 rgba(120,80,160,0.12),'
        + '0 0 15px rgba(80,40,120,0.15);'
      + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      + 'padding:24px 30px;'
      + 'position:relative;overflow:hidden;'
      + '">'

      // Top ornamental line
      + '<div style="'
        + 'position:absolute;top:16px;left:50%;transform:translateX(-50%);'
        + 'width:60%;height:1px;'
        + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
        + '"></div>'

      // Corner accents
      + '<div style="position:absolute;top:10px;left:10px;width:20px;height:20px;border-top:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;top:10px;right:10px;width:20px;height:20px;border-top:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;bottom:10px;left:10px;width:20px;height:20px;border-bottom:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;bottom:10px;right:10px;width:20px;height:20px;border-bottom:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'

      // Dialogue text
      + '<div style="'
        + 'font-family:Times New Roman,serif;font-size:22px;font-weight:400;font-style:italic;'
        + 'color:rgba(255,255,255,0.92);'
        + 'text-shadow:0 1px 8px rgba(0,0,0,0.9),0 0 20px rgba(80,40,120,0.15);'
        + 'text-align:center;line-height:1.5;'
        + 'letter-spacing:0.5px;'
        + 'max-width:85%;'
        + '">' + profText + '</div>'

      // Action button or message
      + '<div style="text-align:center;">' + actionContent + '</div>'

      // Bottom ornamental line
      + '<div style="'
        + 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);'
        + 'width:60%;height:1px;'
        + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
        + '"></div>'

    + '</div>'
  + '</div>';
}

// Sigilara button — only at Blanheim Tavern
export function _renderSigilaraButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (buildingId !== 'blanheim-tavern') return '';
  if (s.sigilaraMode) return ''; // hide when already in sigilara mode

  var fs = fontSize || 28;
  return '<div data-interactive onclick="event.stopPropagation();window.open(\'https://www.spawn.co/cal/final-abyss-sigilara/play\',\'_blank\');" style="'
    + 'margin-top:8px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:rgba(220,180,60,0.95);'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
    + '>Play Sigilara</div>';
}

// Guild button — only at the Tavern, only if player has no guild
export function _renderGuildButton(s, fontSize) {
  var buildingId = s.interactingBuildingId;
  if (buildingId !== 'tavern') return '';
  if (s.guildName) return ''; // already in a guild

  var fs = fontSize || 28;
  var isActive = !!s.showGuildCreation;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleGuildCreation\')" style="'
    + 'margin-top:8px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
    + 'color:' + (isActive ? 'rgba(220,180,60,1)' : 'rgba(220,180,60,0.95)') + ';'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'' + (isActive ? 'rgba(220,180,60,1)' : 'rgba(220,180,60,0.95)') + '\';"'
    + '>Guild</div>';
}

// Guild creation overlay — shows when Guild button is clicked at Tavern
export function _renderGuildCreationOverlay(s) {
  if (!s.showGuildCreation) return '';
  if (s.interactingBuildingId !== 'tavern') return '';

  var gold = s.gold ?? 0;
  var actionContent = '';

  if (gold < 1000) {
    actionContent = '<div style="'
      + 'font-family:Times New Roman,serif;font-size:20px;font-style:italic;'
      + 'color:rgba(200,120,120,0.9);'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
      + 'text-align:center;line-height:1.5;margin-top:16px;'
      + '">You lack the coin. Return when you have 1000 gold.</div>';
  } else {
    actionContent = '<div style="margin-top:8px;text-align:center;">'
      + '<input data-interactive id="fa-guild-name-input" type="text" maxlength="24" value="' + ((typeof window !== 'undefined' && window.__faGuildName) ? window.__faGuildName.replace(/"/g, '&quot;') : '') + '" style="'
        + 'width:75%;background:rgba(10,8,14,0.9);border:2px solid rgba(160,100,220,0.4);border-radius:4px;'
        + 'padding:8px 12px;color:rgba(255,255,255,0.95);font-family:Cinzel,serif;font-size:16px;'
        + 'letter-spacing:0.5px;text-align:center;margin-bottom:10px;'
        + '" onfocus="this.style.borderColor=\'rgba(200,140,255,0.6)\'" onblur="this.style.borderColor=\'rgba(160,100,220,0.4)\'"'
        + ' oninput="window.__faGuildName=this.value"'
        + ' onkeydown="event.stopPropagation()" onkeyup="event.stopPropagation()" onkeypress="event.stopPropagation()" />'
      + '<br/>'
      + '<div data-interactive onclick="event.stopPropagation();var el=document.getElementById(\'fa-guild-name-input\');var n=el?el.value.trim():\'\';if(n){sendAction(\'createGuild\',{guildName:n});window.__faGuildName=\'\';if(el)el.value=\'\';}" style="'
        + 'display:inline-block;'
        + 'padding:6px 16px;'
        + 'background:linear-gradient(160deg,rgba(100,40,160,0.9),rgba(70,20,120,0.95));'
        + 'border:2px solid rgba(160,100,220,0.5);'
        + 'border-radius:4px;'
        + 'cursor:pointer;pointer-events:auto;'
        + 'font-family:Cinzel,serif;font-size:13px;font-weight:700;'
        + 'color:rgba(255,255,255,0.95);'
        + 'letter-spacing:1px;'
        + 'text-shadow:0 1px 4px rgba(0,0,0,0.7);'
        + 'box-shadow:0 2px 12px rgba(100,40,160,0.4),0 0 20px rgba(80,30,140,0.2);'
        + 'transition:box-shadow 0.15s,background 0.15s;'
        + '" onmouseenter="this.style.boxShadow=\'0 2px 18px rgba(140,60,200,0.6),0 0 30px rgba(100,40,160,0.3)\';"'
        + ' onmouseleave="this.style.boxShadow=\'0 2px 12px rgba(100,40,160,0.4),0 0 20px rgba(80,30,140,0.2)\';"'
        + '>Create Guild &mdash; 1000g</div>'
    + '</div>';
  }

  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleGuildCreation\')" style="'
    + 'position:absolute;'
    + 'top:63.5%;left:0.5%;'
    + 'width:71%;height:30%;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'z-index:15;'
    + 'display:flex;align-items:center;justify-content:center;'
    + '">'

    + '<div onclick="event.stopPropagation()" style="'
      + 'width:100%;height:100%;'
      + 'background:linear-gradient(160deg, rgba(8,6,12,0.96) 0%, rgba(14,10,22,0.97) 40%, rgba(6,4,10,0.98) 100%);'
      + 'border:2px solid rgba(80,55,100,0.35);'
      + 'border-radius:4px;'
      + 'box-shadow:'
        + '0 0 40px rgba(0,0,0,0.8),'
        + 'inset 0 0 60px rgba(0,0,0,0.5),'
        + 'inset 0 1px 0 rgba(120,80,160,0.12),'
        + '0 0 15px rgba(80,40,120,0.15);'
      + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      + 'padding:20px 30px;'
      + 'position:relative;overflow:hidden;'
      + '">'

      // Top ornamental line
      + '<div style="'
        + 'position:absolute;top:16px;left:50%;transform:translateX(-50%);'
        + 'width:60%;height:1px;'
        + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
        + '"></div>'

      // Corner accents
      + '<div style="position:absolute;top:10px;left:10px;width:20px;height:20px;border-top:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;top:10px;right:10px;width:20px;height:20px;border-top:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;bottom:10px;left:10px;width:20px;height:20px;border-bottom:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
      + '<div style="position:absolute;bottom:10px;right:10px;width:20px;height:20px;border-bottom:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'

      // Dialogue text
      + '<div style="'
        + 'font-family:Times New Roman,serif;font-size:20px;font-weight:400;font-style:italic;'
        + 'color:rgba(255,255,255,0.92);'
        + 'text-shadow:0 1px 8px rgba(0,0,0,0.9),0 0 20px rgba(80,40,120,0.15);'
        + 'text-align:center;line-height:1.5;'
        + 'letter-spacing:0.5px;'
        + 'max-width:85%;'
        + '">For <span style="color:rgba(220,180,60,0.95);font-family:Cinzel,serif;font-style:normal;font-weight:700;">1000 gold</span>, you may establish your own guild. Name it wisely &mdash; your banner shall fly across the realm.</div>'

      // Action content (input + button, or "not enough gold" message)
      + actionContent

      // Bottom ornamental line
      + '<div style="'
        + 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);'
        + 'width:60%;height:1px;'
        + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
        + '"></div>'

    + '</div>'
  + '</div>';
}

// Shop button — only for buildings that have shop inventories
export function _renderShopButton(s) {
  var buildingId = s.interactingBuildingId;
  if (!buildingId || !hasShop(buildingId)) return '';

  var isActive = !!s.showShop;
  return '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleShop\')" style="'
    + 'margin-top:8px;'
    + 'pointer-events:auto;cursor:pointer;'
    + 'font-family:Times New Roman,serif;font-size:28px;font-style:italic;'
    + 'color:' + (isActive ? 'rgba(220,180,60,1)' : 'rgba(220,180,60,0.95)') + ';'
    + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
    + 'letter-spacing:1px;'
    + 'transition:color 0.15s;'
    + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
    + ' onmouseleave="this.style.color=\'' + (isActive ? 'rgba(220,180,60,1)' : 'rgba(220,180,60,0.95)') + '\';"'
    + '>Shop</div>';
}

// Shop overlay — replaces NPC portrait area when showShop is true
export function _renderShopOverlay(s) {
  if (!s.showShop) return '';
  var buildingId = s.interactingBuildingId;
  if (!buildingId || !hasShop(buildingId)) return '';

  var items = getShopItems(buildingId);
  var selectedIdx = s.shopSelectedItem;
  var selectedItem = (selectedIdx != null && items[selectedIdx]) ? items[selectedIdx] : null;
  var gold = s.gold ?? 0;

  // Grid of items
  var gridCells = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var isSel = (selectedIdx === i);
    var cellBorder = isSel
      ? 'border:2px solid rgba(220,180,60,0.9);box-shadow:0 0 12px rgba(160,100,220,0.5),inset 0 0 8px rgba(220,180,60,0.15);'
      : 'border:1px solid rgba(80,60,100,0.4);';
    var cellBg = isSel
      ? 'background:linear-gradient(160deg,rgba(60,30,80,0.7),rgba(30,15,45,0.8));'
      : 'background:linear-gradient(160deg,rgba(18,14,24,0.85),rgba(10,8,16,0.9));';

    gridCells += '<div data-interactive onclick="event.stopPropagation();sendAction(\'shopSelectItem\',{index:' + i + '})" style="'
      + 'width:110px;height:130px;'
      + 'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;'
      + 'padding:6px 4px;'
      + cellBg
      + cellBorder
      + 'border-radius:4px;'
      + 'cursor:pointer;'
      + 'pointer-events:auto;'
      + 'transition:border-color 0.15s,box-shadow 0.15s;'
      + 'overflow:hidden;'
      + '" onmouseenter="this.style.borderColor=\'rgba(220,180,60,0.7)\';" '
      + 'onmouseleave="this.style.borderColor=\'' + (isSel ? 'rgba(220,180,60,0.9)' : 'rgba(80,60,100,0.4)') + '\';">'
      + '<div style="width:56px;height:56px;background:rgba(10,8,16,0.9);border-radius:3px;overflow:hidden;flex-shrink:0;margin-bottom:4px;">'
        + '<img src="' + it.icon + '" style="width:56px;height:56px;object-fit:cover;display:block;pointer-events:none;'
          + 'filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7));" />'
      + '</div>'
      + '<div style="font-family:Times New Roman,serif;font-size:12px;color:rgba(255,255,255,0.85);'
        + 'text-align:center;line-height:1.2;max-width:102px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'
        + 'text-shadow:0 1px 2px rgba(0,0,0,0.8);word-break:break-word;">' + it.name + '</div>'
      + '<div style="font-family:Times New Roman,serif;font-size:12px;color:rgba(220,180,60,0.9);'
        + 'text-shadow:0 0 4px rgba(220,180,60,0.3);margin-top:2px;">' + it.price + 'g</div>'
      + '</div>';
  }

  // Detail panel for selected item
  var detailHtml = '';
  if (selectedItem) {
    var statsHtml = '';
    if (selectedItem.stats) {
      if (selectedItem.stats.damage) {
        statsHtml += '<div style="font-size:13px;color:rgba(255,120,80,0.95);">Damage: ' + selectedItem.stats.damage.min + ' - ' + selectedItem.stats.damage.max + '</div>';
      }
      if (selectedItem.stats.defence != null) {
        statsHtml += '<div style="font-size:13px;color:rgba(100,180,255,0.95);">Defence: +' + selectedItem.stats.defence + '</div>';
      }
      if (selectedItem.stats.healAmount) {
        statsHtml += '<div style="font-size:13px;color:rgba(80,255,120,0.95);">Heals: ' + selectedItem.stats.healAmount + ' HP</div>';
      }
      if (selectedItem.stats.manaAmount) {
        statsHtml += '<div style="font-size:13px;color:rgba(80,160,255,0.95);">Restores: ' + selectedItem.stats.manaAmount + ' MP</div>';
      }
      if (selectedItem.stats.buffType) {
        statsHtml += '<div style="font-size:13px;color:rgba(200,160,255,0.95);">Buff: +' + selectedItem.stats.buffAmount + ' ' + selectedItem.stats.buffType + '</div>';
      }
    }
    var canAfford = gold >= selectedItem.price;
    var buyBtnBg = canAfford
      ? 'background:linear-gradient(160deg,rgba(100,40,160,0.9),rgba(70,20,120,0.95));border:1px solid rgba(160,100,220,0.5);'
      : 'background:linear-gradient(160deg,rgba(60,50,60,0.7),rgba(40,35,45,0.8));border:1px solid rgba(80,70,80,0.4);';
    var buyBtnColor = canAfford ? 'color:rgba(255,255,255,0.95);' : 'color:rgba(120,110,120,0.7);';

    detailHtml = '<div style="'
      + 'margin-top:6px;padding:8px 10px;'
      + 'background:linear-gradient(160deg,rgba(14,10,20,0.9),rgba(8,6,14,0.95));'
      + 'border:1px solid rgba(80,55,100,0.3);border-radius:4px;'
      + 'width:100%;'
      + '">'
      + '<div style="font-family:Cinzel,serif;font-size:15px;font-weight:700;color:rgba(220,180,60,0.95);'
        + 'text-shadow:0 0 6px rgba(220,180,60,0.3);margin-bottom:3px;">' + selectedItem.name + '</div>'
      + '<div style="font-family:Times New Roman,serif;font-size:12px;font-style:italic;color:rgba(200,190,210,0.75);'
        + 'line-height:1.3;margin-bottom:4px;">' + (selectedItem.description || '') + '</div>'
      + statsHtml
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">'
        + '<div style="font-family:Times New Roman,serif;font-size:15px;color:rgba(220,180,60,0.95);'
          + 'text-shadow:0 0 4px rgba(220,180,60,0.3);">Price: ' + selectedItem.price + 'g</div>'
        + '<div data-interactive onclick="event.stopPropagation();sendAction(\'buyShopItem\')" style="'
          + 'padding:4px 16px;border-radius:3px;cursor:' + (canAfford ? 'pointer' : 'not-allowed') + ';'
          + buyBtnBg + buyBtnColor
          + 'font-family:Cinzel,serif;font-size:14px;font-weight:700;letter-spacing:1px;'
          + 'text-shadow:0 1px 3px rgba(0,0,0,0.7);'
          + 'box-shadow:0 2px 8px rgba(0,0,0,0.4);'
          + 'transition:background 0.15s,box-shadow 0.15s;pointer-events:auto;'
          + '"'
          + (canAfford ? ' onmouseenter="this.style.boxShadow=\'0 2px 14px rgba(120,60,180,0.5)\';" onmouseleave="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.4)\';"' : '')
          + '>Buy</div>'
      + '</div>'
    + '</div>';
  }

  // Full overlay
  return '<div style="'
    + 'position:absolute;'
    + 'top:2%;left:1%;'
    + 'width:70%;height:92%;'
    + 'z-index:12;'
    + 'pointer-events:auto;'
    + 'display:flex;flex-direction:column;'
    + 'padding:14px;'
    + 'background:linear-gradient(160deg,rgba(8,6,12,0.97),rgba(14,10,22,0.98),rgba(6,4,10,0.99));'
    + 'border:2px solid rgba(80,55,100,0.35);'
    + 'border-radius:4px;'
    + 'box-shadow:0 0 40px rgba(0,0,0,0.8),inset 0 0 60px rgba(0,0,0,0.5),'
      + 'inset 0 1px 0 rgba(120,80,160,0.12),0 0 15px rgba(80,40,120,0.15);'
    + 'overflow:hidden;'
    + '">'

    // Top ornamental line
    + '<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);width:60%;height:1px;'
      + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

    // Corner accents
    + '<div style="position:absolute;top:6px;left:6px;width:14px;height:14px;border-top:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
    + '<div style="position:absolute;top:6px;right:6px;width:14px;height:14px;border-top:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'
    + '<div style="position:absolute;bottom:6px;left:6px;width:14px;height:14px;border-bottom:1px solid rgba(160,100,220,0.25);border-left:1px solid rgba(160,100,220,0.25);"></div>'
    + '<div style="position:absolute;bottom:6px;right:6px;width:14px;height:14px;border-bottom:1px solid rgba(160,100,220,0.25);border-right:1px solid rgba(160,100,220,0.25);"></div>'

    // Header: title + gold + close
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 4px;">'
      + '<div style="font-family:Cinzel,serif;font-size:18px;font-weight:700;color:rgba(220,180,60,0.95);'
        + 'text-shadow:0 0 8px rgba(220,180,60,0.3),0 1px 4px rgba(0,0,0,0.8);letter-spacing:2px;">SHOP</div>'
      + '<div style="display:flex;align-items:center;gap:8px;">'
        + '<div style="font-family:Times New Roman,serif;font-size:16px;color:rgba(220,180,60,0.95);'
          + 'text-shadow:0 0 4px rgba(220,180,60,0.3);">'
          + '<span style="color:rgba(255,255,255,0.6);font-size:13px;">Gold: </span>' + gold + 'g</div>'
        + '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleShop\')" style="'
          + 'width:24px;height:24px;display:flex;align-items:center;justify-content:center;'
          + 'cursor:pointer;pointer-events:auto;'
          + 'font-family:Times New Roman,serif;font-size:18px;font-weight:700;'
          + 'color:rgba(200,180,200,0.7);'
          + 'border:1px solid rgba(80,60,100,0.3);border-radius:3px;'
          + 'background:rgba(30,20,40,0.5);'
          + 'transition:color 0.15s,border-color 0.15s;'
          + '" onmouseenter="this.style.color=\'rgba(255,255,255,0.95)\';this.style.borderColor=\'rgba(160,100,220,0.5)\';"'
          + ' onmouseleave="this.style.color=\'rgba(200,180,200,0.7)\';this.style.borderColor=\'rgba(80,60,100,0.3)\';"'
          + '>&times;</div>'
      + '</div>'
    + '</div>'

    // Divider
    + '<div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(160,100,220,0.25),transparent);margin-bottom:8px;"></div>'

    // Item grid — scrollable
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;overflow:hidden;padding:2px;flex:0 0 auto;">'
    + gridCells
    + '</div>'

    // Detail panel
    + detailHtml

    // Bottom ornamental line
    + '<div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:60%;height:1px;'
      + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

  + '</div>';
}

// Main entry point — call ALWAYS (whether panel is open or not).
// When closed: returns hidden preloader imgs so assets are cached.
// When open:   returns the full panel (no preloader needed — images already visible).
export function renderDoorPanel(localPlayer) {
  if (!localPlayer.state.showDoorPanel) return _renderPreloader(localPlayer);

  var s = localPlayer.state;
  var px = s.doorPanelX ?? 50;
  var py = s.doorPanelY ?? 45;

  // Building-specific data (with fallbacks for The Keep)
  var buildingName = s.buildingName || 'The Keep';
  var gifUrl = s.buildingGif || DEFAULT_GIF;
  var portrait = s.npcPortrait || DEFAULT_PORTRAIT;
  var npcName = s.npcName || 'Guard';
  var npcDialogue = s.npcDialogue || 'Looking for trouble?';

  // Backdrop — clicking closes
  var backdrop = '<div style="'
    + 'position:fixed;top:0;left:0;width:100vw;height:100vh;'
    + 'background:transparent;'
    + 'pointer-events:auto;z-index:8000;'
    + '" data-interactive onclick="sendAction(\'closeDoorPanel\')"></div>';

  // Single draggable window
  var win = '<div draggable="true" data-interactive style="'
    + 'position:fixed;left:' + px + '%;top:' + py + '%;'
    + 'transform:translate(-50%,-50%);'
    + 'width:917px;height:614px;'
    + 'pointer-events:auto;z-index:8001;cursor:grab;'
    + '" '
    + 'ondragstart="this.style.opacity=\'0.7\';" '
    + 'ondragend="this.style.opacity=\'1\';if(event.clientX>0||event.clientY>0){sendAction(\'moveDoorPanel\',{x:Math.round(event.clientX/window.innerWidth*100),y:Math.round(event.clientY/window.innerHeight*100)});}" '
    + '>'

    // --- Building gif (lowest layer, behind the stone frame) ---
    + '<img src="' + gifUrl + '" loading="eager" decoding="async" style="'
      + 'position:absolute;top:56%;left:50%;transform:translate(-50%,-50%) translate(-10%,-6%);'
      + 'width:33.6vw;max-width:none;'
      + 'object-fit:contain;'
      + 'user-select:none;-webkit-user-drag:none;'
      + 'pointer-events:none;'
      + '" />'

    // --- Stone background frame (on top of gif) ---
    // Solid dark background renders INSTANTLY; stone texture loads over it
    + '<div style="'
      + 'position:absolute;top:0;left:0;width:100%;height:100%;'
      + 'background-color:transparent;'
      + 'background-image:url(\'' + DEFAULT_STONE_BG + '\');'
      + 'background-size:contain;'
      + 'background-repeat:no-repeat;'
      + 'background-position:center;'
      + 'border:5px solid rgba(10,10,10,0.95);'
      + 'border-radius:6px;'
      + 'box-shadow:0 0 20px rgba(0,0,0,0.6);'
      + 'pointer-events:none;'
      + '"></div>'

    // --- Building name title ---
    + '<div style="'
      + 'position:absolute;right:50px;top:5%;'
      + 'width:168px;text-align:center;pointer-events:none;'
      + 'display:flex;justify-content:center;'
      + '">'
      + '<div style="'
        + 'font-family:Cinzel,serif;font-size:22px;font-weight:700;'
        + 'color:rgba(255,255,255,0.92);'
        + 'text-shadow:0 1px 6px rgba(0,0,0,0.9),0 0 12px rgba(0,0,0,0.5);'
        + 'letter-spacing:2px;'
        + 'text-align:center;word-wrap:break-word;white-space:normal;'
        + '">' + buildingName + '</div>'
    + '</div>'

    // --- NPC portrait + label + Greet button ---
    // Count how many dialogue options will be visible to compute dynamic font size
    + (function() {
      var optCount = 1; // Greet is always shown
      if (_renderProfessionButton(s, 28) !== '') optCount++;
      if (_renderShopButton(s, 28) !== '') optCount++;
      if (_renderQuestButton(s, 28) !== '') optCount++;
      if (_renderRunestoneButton(s, 28) !== '') optCount++;
      if (_renderWarBannerButton(s, 28) !== '') optCount++;
      if (_renderCompleteQuestButton(s, 28) !== '') optCount++;
      if (_renderGuildButton(s, 28) !== '') optCount++;
      // Shrink font when 5+ options
      var fs = optCount >= 5 ? 22 : 28;

      return '<div style="'
        + 'position:absolute;right:55px;top:16%;'
        + 'width:168px;'
        + 'display:flex;flex-direction:column;align-items:center;gap:6px;'
        + 'pointer-events:none;'
        + '">'

        // Portrait image (not clickable)
        + '<div style="'
          + 'width:160px;height:160px;'
          + 'border:4px solid rgba(60,50,35,0.9);'
          + 'border-radius:6px;'
          + 'box-shadow:0 0 12px rgba(0,0,0,0.7),inset 0 0 8px rgba(0,0,0,0.4);'
          + 'overflow:hidden;flex-shrink:0;'
          + '">'
          + '<img src="' + portrait + '" loading="eager" decoding="async" style="'
            + 'width:100%;height:100%;object-fit:cover;object-position:center 15%;'
            + 'user-select:none;-webkit-user-drag:none;'
            + 'pointer-events:none;'
            + '" />'
        + '</div>'

        // NPC name label — constrained to portrait width, wraps naturally
        + '<div style="'
          + 'font-family:Cinzel,serif;font-size:15px;font-weight:700;'
          + 'color:rgba(160,100,220,0.95);'
          + 'text-shadow:0 0 8px rgba(120,60,180,0.4),0 1px 4px rgba(0,0,0,0.8);'
          + 'letter-spacing:1px;'
          + 'width:160px;text-align:center;word-wrap:break-word;white-space:normal;overflow-wrap:break-word;'
          + '">' + npcName + '</div>'

        // Greet button (hidden in sigilara mode)
        + (s.sigilaraMode ? '' : '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleNpcDialogue\')" style="'
          + 'margin-top:18px;'
          + 'pointer-events:auto;cursor:pointer;'
          + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
          + 'color:' + (s.showNpcDialogue ? 'rgba(120,255,60,0.95)' : 'rgba(255,255,255,0.85)') + ';'
          + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
          + 'letter-spacing:1px;'
          + 'transition:color 0.15s;'
          + '" onmouseenter="this.style.color=\'' + (s.showNpcDialogue ? 'rgba(120,255,60,0.95)' : 'rgba(160,100,220,0.95)') + '\';"'
          + ' onmouseleave="this.style.color=\'' + (s.showNpcDialogue ? 'rgba(120,255,60,0.95)' : 'rgba(255,255,255,0.85)') + '\';"'
          + '>Greet</div>')

        // Sigilara mode — Play and Rules buttons
        + (s.sigilaraMode ? (
          '<div data-interactive onclick="event.stopPropagation();window.open(\'https://www.spawn.co/cal/final-abyss-sigilara/play\',\'_blank\');" style="'
            + 'margin-top:18px;'
            + 'pointer-events:auto;cursor:pointer;'
            + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
            + 'color:rgba(220,180,60,0.95);'
            + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
            + 'letter-spacing:1px;'
            + 'transition:color 0.15s;'
            + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
            + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
            + '>Play</div>'
          + '<div data-interactive onclick="event.stopPropagation();" style="'
            + 'margin-top:8px;'
            + 'pointer-events:auto;cursor:pointer;'
            + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
            + 'color:rgba(220,180,60,0.95);'
            + 'text-shadow:0 1px 4px rgba(0,0,0,0.8),0 0 8px rgba(220,180,60,0.3);'
            + 'letter-spacing:1px;'
            + 'transition:color 0.15s;'
            + '" onmouseenter="this.style.color=\'rgba(255,210,80,1)\';"'
            + ' onmouseleave="this.style.color=\'rgba(220,180,60,0.95)\';"'
            + '>Rules</div>'
        ) : '')

        // Profession button — only for buildings that offer a profession
        + _renderProfessionButton(s, fs)

        // Shop button — only for buildings with shop inventories
        + _renderShopButton(s, fs)

        // Quest button — only for cottages with available quests
        + _renderQuestButton(s, fs)

        // Runestone button — only at Magic Shop, only if player doesn't already have one
        + _renderRunestoneButton(s, fs)

        // War Banner button — only at Magic Shop, only if player doesn't already have one
        + _renderWarBannerButton(s, fs)

        // Complete Quest button — only if player has a delivery quest targeting this cottage
        + _renderCompleteQuestButton(s, fs)

        // Wizard delivery quest button — only at apothecary for urgent-correspondence
        + _renderWizardQuestCompleteButton(s, fs)

        // Guild button — only at Tavern, only if player has no guild
        + _renderGuildButton(s, fs)

        // Sigilara button — only at Blanheim Tavern
        + _renderSigilaraButton(s, fs)

      + '</div>';
    })()

    // --- Close button ---
    + '<div style="'
      + 'position:absolute;right:50px;top:78%;width:168px;text-align:center;'
      + '">'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'closeDoorPanel\')" style="'
        + 'display:inline-block;'
        + 'padding:8px 28px;'
        + 'background:rgba(140,140,140,0.85);'
        + 'border:2px solid rgba(90,90,90,0.8);'
        + 'border-radius:4px;'
        + 'cursor:pointer;'
        + 'font-family:Cinzel,serif;font-size:18px;font-weight:700;'
        + 'color:rgba(30,30,30,0.95);'
        + 'letter-spacing:2px;'
        + 'text-shadow:0 1px 1px rgba(255,255,255,0.15);'
        + 'box-shadow:0 2px 6px rgba(0,0,0,0.4);'
        + 'transition:background 0.15s,box-shadow 0.15s;'
        + '" onmouseenter="this.style.background=\'rgba(170,170,170,0.95)\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.5)\';"'
        + ' onmouseleave="this.style.background=\'rgba(140,140,140,0.85)\';this.style.boxShadow=\'0 2px 6px rgba(0,0,0,0.4)\';"'
        + '>Close</div>'
    + '</div>'

    // --- Shop overlay ---
    + _renderShopOverlay(s)

    // --- Guild creation overlay (covers gif area) ---
    + _renderGuildCreationOverlay(s)

    // --- Profession dialogue overlay (covers gif area) ---
    + _renderProfessionDialogue(s)

    // --- NPC dialogue overlay (covers gif area) ---
    + (s.showNpcDialogue ? (
      '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleNpcDialogue\')" style="'
        + 'position:absolute;'
        + 'top:63.5%;left:0.5%;'
        + 'width:71%;height:30%;'
        + 'pointer-events:auto;cursor:pointer;'
        + 'z-index:15;'
        + 'display:flex;align-items:center;justify-content:center;'
        + '">'

        // Inner panel — dark gothic overlay
        + '<div style="'
          + 'width:100%;height:100%;'
          + 'background:linear-gradient(160deg, rgba(8,6,12,0.96) 0%, rgba(14,10,22,0.97) 40%, rgba(6,4,10,0.98) 100%);'
          + 'border:2px solid rgba(80,55,100,0.35);'
          + 'border-radius:4px;'
          + 'box-shadow:'
            + '0 0 40px rgba(0,0,0,0.8),'
            + 'inset 0 0 60px rgba(0,0,0,0.5),'
            + 'inset 0 1px 0 rgba(120,80,160,0.12),'
            + '0 0 15px rgba(80,40,120,0.15);'
          + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
          + 'padding:30px;'
          + 'position:relative;overflow:hidden;'
          + '">'

          // Top ornamental line
          + '<div style="'
            + 'position:absolute;top:16px;left:50%;transform:translateX(-50%);'
            + 'width:60%;height:1px;'
            + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
            + '"></div>'

          // Subtle corner accents (top-left, top-right)
          + '<div style="'
            + 'position:absolute;top:10px;left:10px;'
            + 'width:20px;height:20px;'
            + 'border-top:1px solid rgba(160,100,220,0.25);'
            + 'border-left:1px solid rgba(160,100,220,0.25);'
            + '"></div>'
          + '<div style="'
            + 'position:absolute;top:10px;right:10px;'
            + 'width:20px;height:20px;'
            + 'border-top:1px solid rgba(160,100,220,0.25);'
            + 'border-right:1px solid rgba(160,100,220,0.25);'
            + '"></div>'

          // Bottom corner accents
          + '<div style="'
            + 'position:absolute;bottom:10px;left:10px;'
            + 'width:20px;height:20px;'
            + 'border-bottom:1px solid rgba(160,100,220,0.25);'
            + 'border-left:1px solid rgba(160,100,220,0.25);'
            + '"></div>'
          + '<div style="'
            + 'position:absolute;bottom:10px;right:10px;'
            + 'width:20px;height:20px;'
            + 'border-bottom:1px solid rgba(160,100,220,0.25);'
            + 'border-right:1px solid rgba(160,100,220,0.25);'
            + '"></div>'

          // Dialogue text
          + '<div style="'
            + 'font-family:Times New Roman,serif;font-size:26px;font-weight:400;font-style:italic;'
            + 'color:rgba(255,255,255,0.92);'
            + 'text-shadow:0 1px 8px rgba(0,0,0,0.9),0 0 20px rgba(80,40,120,0.15);'
            + 'text-align:center;line-height:1.6;'
            + 'letter-spacing:0.5px;'
            + 'max-width:85%;'
            + '">' + npcDialogue + '</div>'

          // Bottom ornamental line
          + '<div style="'
            + 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);'
            + 'width:60%;height:1px;'
            + 'background:linear-gradient(to right, transparent, rgba(160,100,220,0.35), transparent);'
            + '"></div>'

        + '</div>'
      + '</div>'
    ) : '')

  + '</div>';

  return backdrop + win;
}

module.exports = { renderDoorPanel };
