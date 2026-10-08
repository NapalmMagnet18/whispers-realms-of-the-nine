// Quest dialog UI component — MMORPG Tools Mod — parchment style (50% zoom, draggable)
// Matches the locked template from quest-dialog-template.md exactly.
// Uses zoom:0.5 on an inner wrapper so the panel + all text shrink
// uniformly while the layout box also collapses. All font-sizes are doubled
// pre-zoom so they land at the correct final px. 18px minimum floor means
// nothing below 36px pre-zoom.

// Portrait lookup — keyed by giverName (lowercase). Only modify ui-quest.js per instructions.
var _CUR = require('lib/currency.js');
var NPC_PORTRAITS = {
  'clawtheus': '/cdn/icon-circular-face-closeup-orange-lobster-face-wearing-morpheus-matrix-round-pince-nez-sunglasses-dark-gothic-tight-crop-filling-frame.png',
  'morwenna blackthorn': '/cdn/portrait-gothic-dark-fantasy-female-black-cloak-pale-face-closeup.png',
  'marta thimble': '/cdn/portrait-gothic-dark-fantasy-middle-aged-seamstress-face-closeup.png',
  'isolde ravenmere': '/cdn/portrait-gothic-dark-fantasy-female-dark-hooded-cloak-piercing-eyes-face-closeup.png',
  'old man whisper': '/cdn/portrait-gothic-dark-fantasy-elderly-storyteller-long-beard-face-closeup.png',
  'sera hollowthorn': '/cdn/portrait-gothic-dark-fantasy-young-mother-worried-eyes-face-closeup.png',
  'daren ironfist': '/cdn/portrait-gothic-dark-fantasy-one-armed-retired-soldier-face-closeup.png',
  'ivy fernleaf': '/cdn/portrait-gothic-dark-fantasy-shy-herbalist-girl-braided-hair-face-closeup.png',
  'finnegan cork': '/cdn/portrait-gothic-dark-fantasy-drunk-bard-with-lute-face-closeup.png',
  'nana bramble': '/cdn/portrait-gothic-dark-fantasy-weathered-old-woman-herbalist-face-closeup.png',
  'lady ashworth': '/cdn/portrait-gothic-dark-fantasy-suspicious-widow-black-veil-face-closeup.png',
  'velara nightshade': '/cdn/portrait-gothic-dark-fantasy-female-black-cloak-shadowed-face-closeup.png',
  'morrigan the hollow': '/cdn/portrait-gothic-dark-fantasy-gaunt-woman-hollow-eyes-dark-robes-face-closeup.png',
  'veldris': '/cdn/portrait-gothic-fantasy-old-wizard-white-beard-purple-hat-face-closeup.png'
};

export function getPortrait(quest) {
  if (quest.portrait) return quest.portrait;
  var name = (quest.giverName || '').toLowerCase();
  return NPC_PORTRAITS[name] || '/cdn/icon-circular-face-closeup-dark-gothic-mysterious-npc-tight-crop-filling-frame.png';
}

export function renderQuestDialog(localPlayer) {
  var dialog = localPlayer.state.questDialogData;
  if (!dialog || !localPlayer.state.showQuestDialog) return '';

  var quest = dialog;
  var playerName = localPlayer.state.charName || 'adventurer';

  // Replace {player} placeholder in quest text
  var questText = (quest.text || '').replace(/\{player\}/g, playerName);

  // Build objectives list — purple diamond bullets, dark text per template
  var objectiveRows = '';
  var objectives = quest.objectives || [];
  for (var i = 0; i < objectives.length; i++) {
    var obj = objectives[i];
    objectiveRows += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;">'
      + '<div style="width:8px;height:8px;background:oklch(0.3 0.15 310);transform:rotate(45deg);flex-shrink:0;"></div>'
      + '<span style="font-size:32px;color:oklch(0.3 0.02 0);font-family:\'Times New Roman\',Times,serif;line-height:1.2;">' + obj.desc + (obj.target ? ' (0/' + obj.target + ')' : '') + '</span>'
      + '</div>';
  }

  // Build rewards section — gold coin + Cinzel bold
  var rewardItems = '';
  if (quest.rewards) {
    if (quest.rewards.gold) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;">'
        + '<img src="/cdn/sprite-transparent-fantasy-gold-coin-shiny.png" draggable="false" style="width:24px;height:24px;filter:drop-shadow(0 2px 4px rgba(180,130,30,0.5));-webkit-user-drag:none;user-select:none;" />'
        + '<span style="font-size:36px;color:oklch(0.3 0.08 50);font-family:Cinzel,serif;font-weight:700;filter:drop-shadow(0 1px 2px rgba(180,130,30,0.3));">' + quest.rewards.gold + ' Gold</span>'
        + '</div>';
    }
    if (quest.rewards.copper) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;font-size:36px;color:oklch(0.3 0.08 50);font-family:Cinzel,serif;font-weight:700;">' + _CUR.formatHtml(quest.rewards.copper) + '</div>';
    }
    if (quest.rewards.xp) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;">'
        + '<img src="/cdn/sprite-gothic-dark-fantasy-green-xp-star-icon.png" draggable="false" style="width:24px;height:24px;filter:drop-shadow(0 2px 4px rgba(60,180,60,0.5));-webkit-user-drag:none;user-select:none;" />'
        + '<span style="font-size:36px;color:oklch(0.4 0.15 145);font-family:Cinzel,serif;font-weight:700;filter:drop-shadow(0 1px 2px rgba(60,180,60,0.3));">' + quest.rewards.xp + ' XP</span>'
        + '</div>';
    }
    if (quest.rewards.items) {
      for (var ri = 0; ri < quest.rewards.items.length; ri++) {
        var item = quest.rewards.items[ri];
        var nameColor = item.rarity === 'rare' ? 'oklch(0.65 0.2 300)' : item.rarity === 'epic' ? 'oklch(0.6 0.22 310)' : 'oklch(0.3 0.08 50)';
        rewardItems += '<div style="display:flex;align-items:center;gap:14px;">'
          + '<img src="' + (item.icon || '/cdn/sprite-fantasy-gem-ruby-red.png') + '" draggable="false" style="width:36px;height:36px;filter:drop-shadow(0 0 6px rgba(120,60,180,0.6));object-fit:contain;-webkit-user-drag:none;user-select:none;" />'
          + '<span style="font-size:36px;color:' + nameColor + ';font-family:Cinzel,serif;font-weight:700;">' + (item.name || 'Item') + '</span>'
          + '</div>';
      }
    }
  }

  // Drag handler — inline IIFE
  var dragHandler = ''
    + '(function(e){'
      + 'if(e.target.tagName===\'BUTTON\')return;'
      + 'e.preventDefault();e.stopPropagation();'
      + 'var p=document.getElementById(\'questDragPanel\');'
      + 'if(!p)return;'
      + 'var r=p.getBoundingClientRect();'
      + 'var offX=e.clientX-r.left;'
      + 'var offY=e.clientY-r.top;'
      + 'p.style.cursor=\'grabbing\';'
      + 'p.style.left=r.left+\'px\';'
      + 'p.style.top=r.top+\'px\';'
      + 'p.style.transform=\'none\';'
      + 'p.style.position=\'fixed\';'
      + 'p.style.margin=\'0\';'
      + 'function mv(ev){'
        + 'p.style.left=(ev.clientX-offX)+\'px\';'
        + 'p.style.top=(ev.clientY-offY)+\'px\';'
      + '}'
      + 'function up(){'
        + 'p.style.cursor=\'grab\';'
        + 'document.removeEventListener(\'mousemove\',mv);'
        + 'document.removeEventListener(\'mouseup\',up);'
      + '}'
      + 'document.addEventListener(\'mousemove\',mv);'
      + 'document.addEventListener(\'mouseup\',up);'
    + '})(event)';

  // Button styles — purple gradient, gold text, per template
  var btnBase = ''
    + 'font-family:Cinzel,serif;font-size:36px;font-weight:700;'
    + 'padding:7px 26px;'
    + 'background:linear-gradient(180deg,rgba(60,30,90,0.92),rgba(40,18,65,0.96));'
    + 'color:oklch(0.82 0.1 85);'
    + 'border:2px solid oklch(0.4 0.16 300);'
    + 'border-radius:4px;'
    + 'cursor:pointer;letter-spacing:2px;text-transform:uppercase;'
    + 'box-shadow:0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(160,100,220,0.15);'
    + '';

  var btnHoverIn = "this.style.background='linear-gradient(180deg,rgba(80,40,120,0.95),rgba(55,28,85,0.98))';this.style.borderColor='oklch(0.5 0.2 300)';this.style.boxShadow='0 4px 18px rgba(120,60,180,0.4),inset 0 1px 0 rgba(160,100,220,0.2)'";
  var btnHoverOut = "this.style.background='linear-gradient(180deg,rgba(60,30,90,0.92),rgba(40,18,65,0.96))';this.style.borderColor='oklch(0.4 0.16 300)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(160,100,220,0.15)'";

  var portraitUrl = getPortrait(quest);

  // Full parchment-style template per locked spec
  return '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;align-items:flex-start;justify-content:flex-start;padding-left:320px;padding-top:80px;z-index:8000;pointer-events:none;">'

    // Backdrop click to decline — fully transparent, no darkening
    + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:auto;" data-interactive onclick="sendAction(\'declineQuest\')"></div>'

    // Draggable panel wrapper
    + '<div id="questDragPanel" data-interactive style="'
      + 'position:relative;pointer-events:auto;cursor:grab;'
      + ''
      + 'user-select:none;'
    + '" onmousedown="' + dragHandler + '">'

      // Zoom wrapper — 0.5 scale
      + '<div style="zoom:0.5;">'

        // Parchment image container — image is displayed, content overlaid
        + '<div style="position:relative;display:inline-block;">'

          // The parchment PNG — display block, the panel sizes to this
          + '<img src="/cdn/ui-medieval-quest-dialog-frame-8ndltjdy.webp" draggable="false" style="'
            + 'display:block;max-height:170vh;pointer-events:none;-webkit-user-drag:none;user-select:none;'
          + '" />'

          // Content overlay — absolute over parchment
          + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;padding:50px 56px 48px;box-sizing:border-box;">'

            // Portrait circle — 163x163, positioned per template
            + '<div style="width:163px;height:163px;border-radius:50%;border:4px solid oklch(0.4 0.12 55);overflow:hidden;margin-top:62px;margin-left:70px;box-shadow:0 0 16px rgba(0,0,0,0.5),0 0 30px rgba(0,0,0,0.3);flex-shrink:0;">'
              + '<img src="' + portraitUrl + '" draggable="false" style="width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;user-select:none;" />'
            + '</div>'

            // NPC name — positioned beside portrait per template
            + '<div style="font-family:Cinzel,serif;font-size:30px;font-weight:700;color:oklch(0.95 0 0);letter-spacing:4px;text-transform:uppercase;margin-top:-126px;margin-left:300px;">'
              + (quest.giverName || 'Unknown')
            + '</div>'

            // Quest title — Cinzel 38px, left aligned, padded
            + '<div style="text-align:left;margin-top:144px;margin-bottom:12px;padding-left:148px;">'
              + '<span style="font-family:Cinzel,serif;font-size:38px;font-weight:700;color:oklch(0.3 0.02 0);letter-spacing:2px;">' + (quest.title || 'Quest') + '</span>'
            + '</div>'

            // Quest description — Times New Roman 32px, supports {player}
            + '<div style="font-family:\'Times New Roman\',Times,serif;font-size:32px;line-height:1.2;color:oklch(0.3 0.02 0);margin-bottom:44px;max-width:740px;padding-left:148px;margin-top:8px;">'
              + questText
            + '</div>'

            // Objectives header — purple
            + '<div style="padding-left:148px;margin-bottom:10px;">'
              + '<div style="font-family:Cinzel,serif;font-size:36px;font-weight:700;color:oklch(0.3 0.12 310);letter-spacing:3px;text-transform:uppercase;">Objectives</div>'
            + '</div>'

            // Objective rows
            + '<div style="padding-left:148px;margin-bottom:20px;">'
              + objectiveRows
            + '</div>'

            // Rewards header — gold
            + '<div style="padding-left:148px;margin-bottom:10px;">'
              + '<div style="font-family:Cinzel,serif;font-size:36px;font-weight:700;color:oklch(0.35 0.1 85);letter-spacing:3px;text-transform:uppercase;">Rewards</div>'
            + '</div>'

            // Reward items
            + '<div style="padding-left:148px;margin-bottom:20px;">'
              + '<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;">'
                + rewardItems
              + '</div>'
            + '</div>'

            // Accept / Decline buttons — absolute bottom, centered, gap 130px
            + '<div style="position:absolute;bottom:155px;left:0;right:0;display:flex;justify-content:center;gap:130px;">'
              + '<button data-interactive onclick="sendAction(\'acceptQuest\',{questId:\'' + quest.id + '\'})" class="brass-plate" style="' + btnBase + '" onmouseenter="' + btnHoverIn + '" onmouseleave="' + btnHoverOut + '">'
                + 'Accept'
              + '</button>'
              + '<button data-interactive onclick="sendAction(\'declineQuest\')" style="' + btnBase + '" onmouseenter="' + btnHoverIn + '" onmouseleave="' + btnHoverOut + '">'
                + 'Decline'
              + '</button>'
            + '</div>'

          + '</div>' // end content overlay
        + '</div>' // end parchment container
      + '</div>' // end zoom wrapper
    + '</div>' // end draggable panel

    // No animation keyframes needed
    + ''
  + '</div>';
}

export function renderTurnInDialog(localPlayer) {
  var dialog = localPlayer.state.questDialogData;
  if (!dialog || !localPlayer.state.showQuestDialog) return '';

  var quest = dialog;

  // Build objectives list — all complete with green checkmarks
  var objectiveRows = '';
  var objectives = quest.objectives || [];
  for (var i = 0; i < objectives.length; i++) {
    var obj = objectives[i];
    var progressText = obj.target ? ' (' + obj.target + '/' + obj.target + ')' : '';
    objectiveRows += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;">'
      + '<div style="width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">'
        + '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="oklch(0.3 0.02 0)" /><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<span style="font-size:32px;color:oklch(0.3 0.02 0);font-family:\'Times New Roman\',Times,serif;line-height:1.2;text-decoration:line-through;text-decoration-color:oklch(0.35 0.02 0);">' + obj.desc + progressText + '</span>'
      + '</div>';
  }

  // Build rewards section — gold, xp, items, reputation
  var rewardItems = '';
  if (quest.rewards) {
    if (quest.rewards.gold) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;">'
        + '<img src="/cdn/sprite-transparent-fantasy-gold-coin-shiny.png" draggable="false" style="width:24px;height:24px;filter:drop-shadow(0 2px 4px rgba(180,130,30,0.5));-webkit-user-drag:none;user-select:none;" />'
        + '<span style="font-size:36px;color:oklch(0.3 0.08 50);font-family:Cinzel,serif;font-weight:700;filter:drop-shadow(0 1px 2px rgba(180,130,30,0.3));">' + quest.rewards.gold + ' Gold</span>'
        + '</div>';
    }
    if (quest.rewards.copper) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;font-size:36px;color:oklch(0.3 0.08 50);font-family:Cinzel,serif;font-weight:700;">' + _CUR.formatHtml(quest.rewards.copper) + '</div>';
    }
    if (quest.rewards.xp) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;">'
        + '<img src="/cdn/sprite-gothic-dark-fantasy-green-xp-star-icon.png" draggable="false" style="width:24px;height:24px;filter:drop-shadow(0 2px 4px rgba(60,180,60,0.5));-webkit-user-drag:none;user-select:none;" />'
        + '<span style="font-size:36px;color:oklch(0.4 0.15 145);font-family:Cinzel,serif;font-weight:700;filter:drop-shadow(0 1px 2px rgba(60,180,60,0.3));">' + quest.rewards.xp + ' XP</span>'
        + '</div>';
    }
    if (quest.rewards.reputation) {
      rewardItems += '<div style="display:flex;align-items:center;gap:12px;">'
        + '<img src="/cdn/sprite-gothic-dark-fantasy-golden-shield-reputation-icon.png" draggable="false" style="width:24px;height:24px;filter:drop-shadow(0 2px 4px rgba(180,150,50,0.5));-webkit-user-drag:none;user-select:none;" />'
        + '<span style="font-size:36px;color:oklch(0.35 0.1 85);font-family:Cinzel,serif;font-weight:700;filter:drop-shadow(0 1px 2px rgba(180,150,50,0.3));">+' + quest.rewards.reputation + ' Reputation</span>'
        + '</div>';
    }
    if (quest.rewards.items) {
      for (var ri = 0; ri < quest.rewards.items.length; ri++) {
        var item = quest.rewards.items[ri];
        var nameColor = item.rarity === 'rare' ? 'oklch(0.65 0.2 300)' : item.rarity === 'epic' ? 'oklch(0.6 0.22 310)' : 'oklch(0.3 0.08 50)';
        rewardItems += '<div style="display:flex;align-items:center;gap:14px;">'
          + '<img src="' + (item.icon || '/cdn/sprite-fantasy-gem-ruby-red.png') + '" draggable="false" style="width:36px;height:36px;filter:drop-shadow(0 0 6px rgba(120,60,180,0.6));object-fit:contain;-webkit-user-drag:none;user-select:none;" />'
          + '<span style="font-size:36px;color:' + nameColor + ';font-family:Cinzel,serif;font-weight:700;">' + (item.name || 'Item') + '</span>'
          + '</div>';
      }
    }
  }

  // Drag handler — inline IIFE (same as quest dialog)
  var dragHandler = ''
    + '(function(e){'
      + 'if(e.target.tagName===\'BUTTON\')return;'
      + 'e.preventDefault();e.stopPropagation();'
      + 'var p=document.getElementById(\'turnInDragPanel\');'
      + 'if(!p)return;'
      + 'var r=p.getBoundingClientRect();'
      + 'var offX=e.clientX-r.left;'
      + 'var offY=e.clientY-r.top;'
      + 'p.style.cursor=\'grabbing\';'
      + 'p.style.left=r.left+\'px\';'
      + 'p.style.top=r.top+\'px\';'
      + 'p.style.transform=\'none\';'
      + 'p.style.position=\'fixed\';'
      + 'p.style.margin=\'0\';'
      + 'function mv(ev){'
        + 'p.style.left=(ev.clientX-offX)+\'px\';'
        + 'p.style.top=(ev.clientY-offY)+\'px\';'
      + '}'
      + 'function up(){'
        + 'p.style.cursor=\'grab\';'
        + 'document.removeEventListener(\'mousemove\',mv);'
        + 'document.removeEventListener(\'mouseup\',up);'
      + '}'
      + 'document.addEventListener(\'mousemove\',mv);'
      + 'document.addEventListener(\'mouseup\',up);'
    + '})(event)';

  // Button styles — purple gradient, gold text, matching renderQuestDialog
  var btnBase = ''
    + 'font-family:Cinzel,serif;font-size:36px;font-weight:700;'
    + 'padding:7px 26px;'
    + 'background:linear-gradient(180deg,rgba(60,30,90,0.92),rgba(40,18,65,0.96));'
    + 'color:oklch(0.82 0.1 85);'
    + 'border:2px solid oklch(0.4 0.16 300);'
    + 'border-radius:4px;'
    + 'cursor:pointer;letter-spacing:2px;text-transform:uppercase;'
    + 'box-shadow:0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(160,100,220,0.15);'
    + '';

  var btnHoverIn = "this.style.background='linear-gradient(180deg,rgba(80,40,120,0.95),rgba(55,28,85,0.98))';this.style.borderColor='oklch(0.5 0.2 300)';this.style.boxShadow='0 4px 18px rgba(120,60,180,0.4),inset 0 1px 0 rgba(160,100,220,0.2)'";
  var btnHoverOut = "this.style.background='linear-gradient(180deg,rgba(60,30,90,0.92),rgba(40,18,65,0.96))';this.style.borderColor='oklch(0.4 0.16 300)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(160,100,220,0.15)'";

  // Complete Quest button — black bg, gold text/border, dark gothic aesthetic
  var completeBtnBase = ''
    + 'font-family:Cinzel,serif;font-size:36px;font-weight:700;'
    + 'padding:7px 26px;margin-left:40px;'
    + 'background:linear-gradient(180deg,rgba(20,18,15,0.94),rgba(10,8,5,0.98));'
    + 'color:oklch(0.82 0.12 85);'
    + 'border:2px solid oklch(0.55 0.12 85);'
    + 'border-radius:4px;'
    + 'cursor:pointer;letter-spacing:2px;text-transform:uppercase;'
    + 'box-shadow:0 2px 8px rgba(0,0,0,0.4),0 0 12px rgba(180,150,50,0.12),inset 0 1px 0 rgba(200,170,80,0.1);'
    + '';

  var completeBtnHoverIn = "this.style.background='linear-gradient(180deg,rgba(30,26,20,0.96),rgba(18,15,10,0.99))';this.style.borderColor='oklch(0.65 0.15 85)';this.style.boxShadow='0 4px 18px rgba(180,150,50,0.25),inset 0 1px 0 rgba(200,170,80,0.15)'";
  var completeBtnHoverOut = "this.style.background='linear-gradient(180deg,rgba(20,18,15,0.94),rgba(10,8,5,0.98))';this.style.borderColor='oklch(0.55 0.12 85)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.4),0 0 12px rgba(180,150,50,0.12),inset 0 1px 0 rgba(200,170,80,0.1)'";

  var portraitUrl = getPortrait(quest);
  var questId = quest.questId || quest.id || '';

  // Full parchment-style template — same layout as renderQuestDialog
  return '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;align-items:flex-start;justify-content:flex-start;padding-left:320px;padding-top:80px;z-index:8000;pointer-events:none;">'

    // Backdrop click to close
    + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:auto;" data-interactive onclick="sendAction(\'closeQuestDialog\')"></div>'

    // Draggable panel wrapper
    + '<div id="turnInDragPanel" data-interactive style="'
      + 'position:relative;pointer-events:auto;cursor:grab;'
      + 'user-select:none;'
    + '" onmousedown="' + dragHandler + '">'

      // Zoom wrapper — same 0.5 scale as quest dialog
      + '<div style="zoom:0.5;">'

        // Parchment image container
        + '<div style="position:relative;display:inline-block;">'

          // The parchment PNG
          + '<img src="/cdn/ui-medieval-quest-dialog-frame-8ndltjdy.webp" draggable="false" style="'
            + 'display:block;max-height:170vh;pointer-events:none;-webkit-user-drag:none;user-select:none;'
          + '" />'

          // Content overlay
          + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;padding:50px 56px 48px;box-sizing:border-box;">'

            // Portrait circle
            + '<div style="width:163px;height:163px;border-radius:50%;border:4px solid oklch(0.4 0.12 55);overflow:hidden;margin-top:62px;margin-left:70px;box-shadow:0 0 16px rgba(0,0,0,0.5),0 0 30px rgba(0,0,0,0.3);flex-shrink:0;">'
              + '<img src="' + portraitUrl + '" draggable="false" style="width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;user-select:none;" />'
            + '</div>'

            // NPC name
            + '<div style="font-family:Cinzel,serif;font-size:30px;font-weight:700;color:oklch(0.95 0 0);letter-spacing:4px;text-transform:uppercase;margin-top:-130px;margin-left:300px;">'
              + (quest.giverName || 'Quest Giver')
            + '</div>'

            // "Quest Complete" header
            + '<div style="text-align:left;margin-top:140px;margin-bottom:4px;padding-left:148px;">'
              + '<span style="font-family:Cinzel,serif;font-size:38px;font-weight:700;color:oklch(0.3 0.02 0);letter-spacing:3px;text-transform:uppercase;">Quest Complete</span>'
            + '</div>'

            // Quest title
            + '<div style="text-align:left;margin-bottom:20px;padding-left:148px;">'
              + '<span style="font-family:Cinzel,serif;font-size:46px;font-weight:700;color:oklch(0.3 0.02 0);letter-spacing:2px;">' + (quest.title || 'Quest') + '</span>'
            + '</div>'

            // Objectives header — green for completed
            + '<div style="padding-left:148px;margin-bottom:10px;">'
              + '<div style="font-family:Cinzel,serif;font-size:36px;font-weight:700;color:oklch(0.3 0.02 0);letter-spacing:3px;text-transform:uppercase;">Objectives</div>'
            + '</div>'

            // Objective rows (all complete)
            + '<div style="padding-left:148px;margin-bottom:20px;">'
              + objectiveRows
            + '</div>'

            // Rewards header — dark grey
            + '<div style="padding-left:148px;margin-bottom:10px;">'
              + '<div style="font-family:Cinzel,serif;font-size:36px;font-weight:700;color:oklch(0.3 0.02 0);letter-spacing:3px;text-transform:uppercase;">Rewards</div>'
            + '</div>'

            // Reward items
            + '<div style="padding-left:148px;margin-bottom:20px;">'
              + '<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;">'
                + rewardItems
              + '</div>'
            + '</div>'

            // Complete Quest / Close buttons — absolute bottom, close shifted left
            + '<div style="position:absolute;bottom:155px;left:0;right:0;display:flex;justify-content:center;gap:130px;">'
              + '<button data-interactive onclick="sendAction(\'completeQuest\',{questId:\'' + questId + '\'})" class="brass-plate" style="' + completeBtnBase + '" onmouseenter="' + completeBtnHoverIn + '" onmouseleave="' + completeBtnHoverOut + '">'
                + 'Complete Quest'
              + '</button>'
              + '<button data-interactive onclick="sendAction(\'closeQuestDialog\')" style="margin-left:-60px;' + btnBase + '" onmouseenter="' + btnHoverIn + '" onmouseleave="' + btnHoverOut + '">'
                + 'Close'
              + '</button>'
            + '</div>'

          + '</div>' // end content overlay
        + '</div>' // end parchment container
      + '</div>' // end zoom wrapper
    + '</div>' // end draggable panel
  + '</div>';
}

module.exports = { renderQuestDialog, renderTurnInDialog };

// ── Quest tracker (SP-009) + quest-giver markers + NPC speech: drawn every frame from player state ──
var _qd = require('./quest-data.js');
var _rule = require('./ui-art.js').rule;
var _reachSince = 0;
var QUEST_NPCS = [{ id: 'gatekeeper-elric', name: 'Gatekeeper Elric' },
  // the Reach's townsfolk (scripts/lib/data/townsfolk.yml): a nameplate each, no quest marker
  { id: 'reach-npc-mira', name: 'Mira the Forgekeeper' }, { id: 'reach-npc-dren', name: 'Quartermaster Dren' }, { id: 'reach-npc-bram', name: 'Bram Alder' },
  { id: 'reach-npc-tamsin', name: 'Tamsin the Ranger' }, { id: 'reach-npc-vale', name: 'Sister Vale' }, { id: 'reach-npc-rowan', name: 'Rowan the Ferryman' }];
// the race starts' greeters: drawn only while the hero stands within 90 m of them
var GREETERS = [{ id: 'start-thornhollow/start-thornhollow-greeter', name: 'Elder Fennick Thornwhisper', x: -717, z: 71 },
  { id: 'start-cinderhold/start-cinderhold-greeter', name: 'Forgemother Brenna Ashvein', x: 898, z: -172 },
  { id: 'start-gullrest/start-gullrest-greeter', name: 'Old Maren Tidewell', x: 252, z: 1432 }];
export function renderQuestTracker(localPlayer, world) {
  var s = localPlayer.state || {};
  var out = '<style>@keyframes qbob{50%{transform:translateY(-6px)}}@keyframes qpop{0%{transform:scale(1.5)}100%{transform:scale(1)}}'
    + '.qt-plate{background:oklch(0.22 0.04 60 / .82);box-shadow:0 0 0 2px oklch(0.55 0.09 75),3px 3px 0 oklch(0.12 0.02 60);color:oklch(0.94 0.03 90);padding:10px 14px;min-width:250px}'
    + '.qtk{width:236px;font-family:Geist,Arial,sans-serif;text-shadow:0 1px 2px #000,0 0 4px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.6)}'
    + '.qtk-h{font:600 15px Cinzel,serif;color:#f2b04a;padding-left:4px}'
    + '.qtk-q{position:relative;padding-left:22px;margin-top:6px}'
    + '.qtk-t{color:#f2b04a;font-size:15px;line-height:1.25}'
    + '.qtk-o{color:#e8d9b5;font-size:13px;line-height:1.3;padding-left:6px}.qtk-o.done{color:#8c8577}'
    + '.qtk-b{position:absolute;left:0;top:0;width:16px;height:16px;border-radius:50%;background:radial-gradient(#4a3420,#1a120c);border:1px solid #f2b04a;color:#f2b04a;font:700 11px/15px Cinzel,serif;text-align:center;box-shadow:0 0 6px rgba(242,176,74,.5)}</style>';
  var aqs = s.activeQuests || [];
  var rows = '';
  for (var i = 0; i < aqs.length; i++) {
    var aq = aqs[i]; if (!aq || !aq.objectives) continue;
    var p = aq.baseline ? _qd.questProgress(aq, s) : { objectives: aq.objectives, done: false };
    rows += '<div class="qtk-q">' + (p.done ? '<div class="qtk-b">?</div>' : '') + '<div class="qtk-t">' + (aq.title || 'Quest') + '</div>';
    if (p.done) rows += '<div class="qtk-o">- Return to ' + (aq.giverName || 'the quest giver') + '</div>';
    else for (var j = 0; j < p.objectives.length; j++) {
      var o = p.objectives[j], c = Math.min(o.current || 0, o.target), done = c >= o.target;
      rows += '<div class="qtk-o' + (done ? ' done' : '') + '">- <span id="qt-' + aq.questId + '-' + o.key + '-' + c + '" style="display:inline-block;animation:qpop .25s">' + c + '/' + o.target + '</span> ' + o.desc + '</div>';
    }
    rows += '</div>';
  }
  if (rows) out += '<div class="fixed qtk" style="top:262px;right:calc(var(--spawn-chrome-reservation-right-inset, 50px) + 12px);pointer-events:none;z-index:40">'
    + '<div class="qtk-h">Quests</div>' + _rule('section', '100%', 8) + rows + '</div>';
  var fp = localPlayer.feetPosition || { x: 999, z: 999 };
  var nearReach = Math.abs(fp.x) < 90 && Math.abs(fp.z) < 90;
  var _t = (typeof performance !== 'undefined' ? performance.now() : 0);
  if (!nearReach) _reachSince = 0; else if (!_reachSince) _reachSince = _t || 1;
  if (_t && _t - _reachSince < 6000) nearReach = false; // the town's people stream in first: an anchor before them finds nobody // the townsfolk all stand in Lantern's Reach: anchors elsewhere find nobody
  var _list = nearReach ? QUEST_NPCS.slice() : [];
  for (var g = 0; g < GREETERS.length; g++) if (Math.abs(fp.x - GREETERS[g].x) < 90 && Math.abs(fp.z - GREETERS[g].z) < 90) _list.push(GREETERS[g]);
  for (var n = 0; n < _list.length; n++) {
    var st = _qd.questStatus(_list[n].id, s);
    var mark = st === 'available' ? '!' : st === 'ready' ? '?' : '';
    var markCol = st === 'ready' ? 'oklch(0.86 0.15 85)' : 'oklch(0.9 0.17 90)';
    out += '<div data-world-anchor="' + _list[n].id + '" data-anchor-offset="0 2.25 0" style="pointer-events:none;z-index:95;text-align:center;transform:translate(-50%,-100%);opacity:clamp(0,calc((40 - var(--anchor-depth,0)) / 10),1)">'
      + (mark ? '<div style="font-size:52px;line-height:1;font-weight:900;color:' + markCol + ';-webkit-text-stroke:3px oklch(0.2 0.04 60);paint-order:stroke;text-shadow:0 0 14px oklch(0.85 0.17 85 / .8);animation:qbob 1.2s ease-in-out infinite">' + mark + '</div>' : '')
      + '<div style="font-size:18px;color:oklch(0.94 0.04 90);-webkit-text-stroke:3px oklch(0.2 0.04 60);paint-order:stroke;white-space:nowrap">' + _list[n].name + '</div></div>';
  }
  if (s.npcSay && s.npcSay.text) {
    out += '<div data-world-anchor="' + (s.npcSay.anchor || 'gatekeeper-elric') + '" data-anchor-offset="' + (s.npcSay.offset || '0 2.9 0') + '" style="pointer-events:none;z-index:96;transform:translate(-50%,-100%)"><div id="say-' + s.npcSay.id + '" class="qt-plate" style="max-width:' + (s.npcSay.anchor ? 400 : 340) + 'px;font-size:17px;line-height:1.35;animation:qpop .2s">' + s.npcSay.text + '</div></div>';
  }
  return out;
}
module.exports.renderQuestTracker = renderQuestTracker;
