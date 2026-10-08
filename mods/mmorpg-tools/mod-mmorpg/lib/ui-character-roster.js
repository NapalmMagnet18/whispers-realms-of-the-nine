// Character Roster Panel — MMORPG Tools Mod
var { RACES, CLASS_COLORS, CLASS_ICONS } = require('mod-mmorpg/lib/races.js');

export function renderCharacterRoster(localPlayer) {
  var characters = localPlayer.state.characters || [];
  var selectedIdx = localPlayer.state.selectedCharIdx ?? 0;
  var deleteConfirmIdx = localPlayer.state._deleteConfirmIdx;
  var deleteConfirmName = localPlayer.state._deleteConfirmName || '';

  if (!localPlayer.state.inMainMenu) return '';

  var leaderboardData = localPlayer.state.leaderboardData || [];
  var sortedLeaderboard = leaderboardData.slice().sort(function(a, b) {
    return (b.playerKills || 0) - (a.playerKills || 0);
  });

  var headerHtml = ''
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">'
    + '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(160,100,220,0.4));"></div>'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:16px;color:rgba(210,180,255,0.85);letter-spacing:5px;text-transform:uppercase;text-shadow:0 0 10px rgba(140,80,200,0.3);white-space:nowrap;">Characters</div>'
    + '<div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(160,100,220,0.4),transparent);"></div>'
    + '</div>';

  var cardsHtml = '';
  if (characters.length === 0) {
    cardsHtml = '<div style="text-align:center;padding:24px 16px;font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;color:rgba(160,140,180,0.4);letter-spacing:2px;font-style:italic;">No souls bound yet...</div>';
  } else {
    for (var i = 0; i < characters.length; i++) {
      var ch = characters[i];
      var isSelected = i === selectedIdx;
      var race = RACES[ch.raceIndex ?? 0];
      var raceName = race ? race.name : 'Unknown';
      var classIdx = ch.classIndex ?? 0;
      if (race && classIdx >= race.classes.length) classIdx = 0;
      var className = race ? race.classes[classIdx] : 'Unknown';
      var level = ch.level ?? 1;
      var charName = ch.charName || 'Unnamed';
      var classColor = (CLASS_COLORS && CLASS_COLORS[className]) || '#a080d0';

      var portrait = '';
      if (race) {
        var gIdx = ch.genderIndex ?? 0;
        var portraitUrl = gIdx === 0 ? race.malePortrait : race.femalePortrait;
        if (portraitUrl) {
          portrait = '<img src="' + portraitUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;-webkit-user-drag:none;user-select:none;pointer-events:none;" />';
        }
      }

      var borderColor = isSelected ? 'rgba(180,120,255,0.7)' : 'rgba(100,60,160,0.35)';
      var bgGrad = isSelected ? 'linear-gradient(135deg,rgba(60,30,100,0.75),rgba(35,15,65,0.85))' : 'linear-gradient(135deg,rgba(30,15,50,0.6),rgba(18,8,35,0.75))';
      var shadowVal = isSelected ? '0 0 18px rgba(140,80,220,0.3),inset 0 1px 0 rgba(255,255,255,0.06)' : '0 0 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.03)';
      var selectedIndicator = isSelected ? '<div style="position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(180deg,rgba(180,120,255,0.8),rgba(120,60,200,0.4));border-radius:2px 0 0 2px;"></div>' : '';

      var deleteBtn = '<div data-interactive onclick="event.stopPropagation();sendAction(\'deleteCharacter\',{index:' + i + ',name:\'' + charName.replace(/'/g, "\\'") + '\'})" style="'
        + 'position:absolute;top:8px;right:8px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;border-radius:4px;background:rgba(80,20,20,0.0);transition:all 0.2s ease;color:rgba(180,120,120,0.35);font-size:14px;"'
        + ' onmouseenter="this.style.background=\'rgba(120,30,30,0.6)\';this.style.color=\'rgba(255,100,100,0.9)\'"'
        + ' onmouseleave="this.style.background=\'rgba(80,20,20,0.0)\';this.style.color=\'rgba(180,120,120,0.35)\'">'
        + '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 4h8l-.7 8.1c-.05.5-.47.9-.97.9H4.67c-.5 0-.92-.4-.97-.9L3 4z" stroke="currentColor" stroke-width="1.2"/><path d="M2 3.5h10M5.5 2h3c.28 0 .5.22.5.5v1h-4v-1c0-.28.22-.5.5-.5z" stroke="currentColor" stroke-width="1.1"/><path d="M5.5 6v4M8.5 6v4" stroke="currentColor" stroke-width="1" opacity="0.7"/></svg>'
        + '</div>';

      cardsHtml += '<div data-interactive onclick="sendAction(\'selectCharacter\',{index:' + i + '})" style="'
        + 'position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;background:' + bgGrad + ';border:1px solid ' + borderColor + ';box-shadow:' + shadowVal + ';cursor:pointer;pointer-events:auto;transition:all 0.25s ease;margin-bottom:8px;"'
        + ' onmouseenter="this.style.borderColor=\'rgba(180,120,255,0.6)\'"'
        + ' onmouseleave="this.style.borderColor=\'' + borderColor + '\'">'
        + selectedIndicator
        + '<div style="width:48px;height:48px;min-width:48px;border-radius:50%;overflow:hidden;border:2px solid ' + (isSelected ? 'rgba(180,140,255,0.5)' : 'rgba(100,70,160,0.3)') + ';background:rgba(20,10,35,0.8);' + (isSelected ? 'box-shadow:0 0 10px rgba(140,80,220,0.3);' : '') + '">' + portrait + '</div>'
        + '<div style="flex:1;min-width:0;padding-right:28px;">'
        + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:15px;color:' + (isSelected ? 'rgba(240,220,255,0.95)' : 'rgba(200,180,230,0.8)') + ';letter-spacing:1.5px;text-shadow:0 1px 3px rgba(0,0,0,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + charName + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-top:3px;">'
        + '<span style="font-family:Cinzel,serif;font-size:11px;color:rgba(160,140,190,0.6);letter-spacing:1px;">' + raceName + '</span>'
        + '<span style="color:rgba(120,80,180,0.4);font-size:9px;">\u2022</span>'
        + '<span style="font-family:Cinzel,serif;font-size:11px;color:' + classColor + ';letter-spacing:1px;opacity:0.7;">' + className + '</span>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;">'
        + '<span style="font-family:Cinzel,serif;font-size:11px;color:rgba(200,170,80,0.7);letter-spacing:0.5px;">Lv. ' + level + '</span>'
        + '</div></div>'
        + deleteBtn
        + '</div>';
    }
  }

  // Delete confirmation overlay
  var deleteOverlay = '';
  if (deleteConfirmIdx !== undefined && deleteConfirmIdx !== null && deleteConfirmIdx >= 0) {
    deleteOverlay = '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:6px;">'
      + '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(255,120,120,0.95);letter-spacing:1px;text-align:center;margin-bottom:12px;">Delete <span style="color:rgba(240,220,255,0.95);">' + deleteConfirmName + '</span>?</div>'
      + '<div style="display:flex;gap:12px;">'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'confirmDeleteCharacter\')" style="padding:6px 18px;background:rgba(180,40,40,0.7);border:1px solid rgba(255,100,100,0.5);border-radius:4px;cursor:pointer;font-family:Cinzel,serif;font-size:13px;color:rgba(255,200,200,0.95);letter-spacing:1px;">Delete</div>'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'cancelDeleteCharacter\')" style="padding:6px 18px;background:rgba(60,40,80,0.5);border:1px solid rgba(160,100,220,0.4);border-radius:4px;cursor:pointer;font-family:Cinzel,serif;font-size:13px;color:rgba(200,180,230,0.8);letter-spacing:1px;">Cancel</div>'
      + '</div></div>';
  }

  return '<div style="position:fixed;top:0;right:0;width:320px;height:100vh;display:flex;flex-direction:column;pointer-events:none;z-index:60;">'
    + '<div style="flex:1;overflow-y:auto;padding:100px 20px 80px 20px;pointer-events:auto;position:relative;">'
    + headerHtml
    + cardsHtml
    + deleteOverlay
    + '</div></div>';
}

module.exports = { renderCharacterRoster: renderCharacterRoster };
