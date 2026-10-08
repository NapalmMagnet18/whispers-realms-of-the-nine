// Cursed Item NPC dialog UI — Morvaine the Accursed
// Uses the EXACT same door-panel window structure (917x614, stone frame, drag, layout)
// but with no building name header.

var DEFAULT_STONE_BG = '/cdn/background-dark-stone-wall-interior-tuo5plzu.webp';
var CURSED_GIF = 'https://github.com/rooibosteadrinker/gifs/blob/main/cursed_item_npc.gif?raw=true';
var PORTRAIT_URL = '/cdn/portrait-square-dark-gothic-hooded-woman-pale-skin-glowing-eyes-cursed-sorceress-closeup.png';

// Preloader — hidden imgs so browser cache is warm before player opens dialog
export function _renderPreloader() {
  return '<div style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;" aria-hidden="true">'
    + '<img src="' + CURSED_GIF + '" decoding="async" style="width:1px;height:1px;" />'
    + '<img src="' + DEFAULT_STONE_BG + '" decoding="async" style="width:1px;height:1px;" />'
    + '<img src="' + PORTRAIT_URL + '" decoding="async" style="width:1px;height:1px;" />'
    + '</div>';
}

export function renderCursedItemDialog(localPlayer) {
  if (!localPlayer.state.cursedItemDialog) return _renderPreloader();

  var s = localPlayer.state;
  var dialogState = s.cursedItemDialogState || 'initial';
  var px = s.cursedItemPanelX ?? 50;
  var py = s.cursedItemPanelY ?? 45;

  // Dialog text + buttons based on state
  var dialogText = '';
  var showDialogue = false;

  // Build the right-side button options (same style as door panel Greet button)
  var optionsHtml = '';
  var fs = 28; // font size for options

  if (dialogState === 'initial') {
    // Cursed Item button — same style as vampire/door panel options
    optionsHtml = ''
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'cursedItemDialogChoice\')" style="'
        + 'margin-top:18px;'
        + 'pointer-events:auto;cursor:pointer;'
        + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
        + 'color:rgba(255,255,255,0.85);'
        + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
        + 'letter-spacing:1px;'
        + 'transition:color 0.15s;'
        + '" onmouseenter="this.style.color=\'rgba(180,60,60,0.95)\';"'
        + ' onmouseleave="this.style.color=\'rgba(255,255,255,0.85)\';"'
        + '>Cursed Item</div>';

    showDialogue = true;
    dialogText = 'You tread where shadows dare not linger, mortal. I can see it in your eyes \u2014 the hunger for power, the willingness to pay its price. How... delightful.';

  } else if (dialogState === 'cursed') {
    optionsHtml = ''
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'cursedItemDialogClose\')" style="'
        + 'margin-top:18px;'
        + 'pointer-events:auto;cursor:pointer;'
        + 'font-family:Times New Roman,serif;font-size:' + fs + 'px;font-style:italic;'
        + 'color:rgba(255,255,255,0.85);'
        + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);'
        + 'letter-spacing:1px;'
        + 'transition:color 0.15s;'
        + '" onmouseenter="this.style.color=\'rgba(180,60,60,0.95)\';"'
        + ' onmouseleave="this.style.color=\'rgba(255,255,255,0.85)\';"'
        + '>Farewell</div>';

    showDialogue = true;
    dialogText = 'I have in my possession a cursed item, maybe I\u2019ll tell you about it one day...';
  }

  // Backdrop — clicking closes (same as door panel)
  var backdrop = '<div style="'
    + 'position:fixed;top:0;left:0;width:100vw;height:100vh;'
    + 'background:transparent;'
    + 'pointer-events:auto;z-index:8000;'
    + '" data-interactive onclick="sendAction(\'cursedItemDialogClose\')"></div>';

  // Single draggable window — EXACT same structure as door panel (917x614)
  var win = '<div draggable="true" data-interactive style="'
    + 'position:fixed;left:' + px + '%;top:' + py + '%;'
    + 'transform:translate(-50%,-50%);'
    + 'width:917px;height:614px;'
    + 'pointer-events:auto;z-index:8001;cursor:grab;'
    + '" '
    + 'ondragstart="this.style.opacity=\'0.7\';" '
    + 'ondragend="this.style.opacity=\'1\';if(event.clientX>0||event.clientY>0){sendAction(\'moveCursedItemPanel\',{x:Math.round(event.clientX/window.innerWidth*100),y:Math.round(event.clientY/window.innerHeight*100)});}" '
    + '>'

    // --- NPC GIF (lowest layer, behind the stone frame) ---
    + '<img src="' + CURSED_GIF + '" loading="eager" decoding="async" style="'
      + 'position:absolute;top:56%;left:50%;transform:translate(-50%,-50%) translate(-10%,-6%);'
      + 'width:33.6vw;max-width:none;'
      + 'object-fit:contain;'
      + 'user-select:none;-webkit-user-drag:none;'
      + 'pointer-events:none;'
      + '" />'

    // --- Stone background frame (on top of gif) — EXACT same as door panel ---
    + '<div style="'
      + 'position:absolute;top:0;left:0;width:100%;height:100%;'
      + 'background-color:transparent;'
      + "background-image:url('" + DEFAULT_STONE_BG + "');"
      + 'background-size:contain;'
      + 'background-repeat:no-repeat;'
      + 'background-position:center;'
      + 'border:5px solid rgba(10,10,10,0.95);'
      + 'border-radius:6px;'
      + 'box-shadow:0 0 20px rgba(0,0,0,0.6);'
      + 'pointer-events:none;'
      + '"></div>'

    // --- NO building name title (removed per requirement) ---

    // --- NPC portrait + label + dialog options ---
    + '<div style="'
      + 'position:absolute;right:55px;top:10%;'
      + 'width:168px;'
      + 'display:flex;flex-direction:column;align-items:center;gap:6px;'
      + 'pointer-events:none;'
      + '">'

      // Portrait image — circular (160x160, 4px border, fully rounded)
      + '<div style="'
        + 'width:160px;height:160px;'
        + 'border:4px solid rgba(60,50,35,0.9);'
        + 'border-radius:4px;'
        + 'box-shadow:0 0 12px rgba(0,0,0,0.7),inset 0 0 8px rgba(0,0,0,0.4),0 0 20px rgba(120,30,30,0.25);'
        + 'overflow:hidden;flex-shrink:0;'
        + '">'
        + '<img src="' + PORTRAIT_URL + '" loading="eager" decoding="async" style="'
          + 'width:100%;height:100%;object-fit:cover;object-position:center center;'
          + 'user-select:none;-webkit-user-drag:none;'
          + 'pointer-events:none;'
          + '" />'
      + '</div>'

      // NPC name label — same style as vampire NPC but with red accent
      + '<div style="'
        + 'font-family:Cinzel,serif;font-size:14px;font-weight:700;'
        + 'color:rgba(180,60,60,0.95);'
        + 'text-shadow:0 0 8px rgba(140,30,30,0.4),0 1px 4px rgba(0,0,0,0.8);'
        + 'letter-spacing:1px;'
        + 'width:160px;text-align:center;word-wrap:break-word;white-space:normal;overflow-wrap:break-word;'
        + '">Morvaine the Accursed</div>'

      // Dialog option buttons
      + optionsHtml

    + '</div>'

    // --- Close button — EXACT same style as door panel ---
    + '<div style="'
      + 'position:absolute;right:50px;top:78%;width:168px;text-align:center;'
      + '">'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'cursedItemDialogClose\')" style="'
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

    // --- NPC dialogue overlay (covers gif area) — EXACT same structure as door panel ---
    + (showDialogue ? (
      '<div data-interactive onclick="event.stopPropagation();" style="'
        + 'position:absolute;'
        + 'top:63.5%;left:0.5%;'
        + 'width:71%;height:30%;'
        + 'pointer-events:auto;cursor:default;'
        + 'z-index:15;'
        + 'display:flex;align-items:center;justify-content:center;'
        + '">'

        // Inner panel — dark gothic overlay (EXACT same as door panel dialogue)
        + '<div style="'
          + 'width:100%;height:100%;'
          + 'background:linear-gradient(160deg, rgba(8,6,12,0.96) 0%, rgba(14,10,22,0.97) 40%, rgba(6,4,10,0.98) 100%);'
          + 'border:2px solid rgba(100,30,30,0.35);'
          + 'border-radius:4px;'
          + 'box-shadow:'
            + '0 0 40px rgba(0,0,0,0.8),'
            + 'inset 0 0 60px rgba(0,0,0,0.5),'
            + 'inset 0 1px 0 rgba(140,40,40,0.12),'
            + '0 0 15px rgba(100,20,20,0.15);'
          + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
          + 'padding:30px;'
          + 'position:relative;overflow:hidden;'
          + '">'

          // Top ornamental line
          + '<div style="'
            + 'position:absolute;top:16px;left:50%;transform:translateX(-50%);'
            + 'width:60%;height:1px;'
            + 'background:linear-gradient(to right, transparent, rgba(180,60,60,0.35), transparent);'
            + '"></div>'

          // Corner accents (top-left, top-right)
          + '<div style="'
            + 'position:absolute;top:10px;left:10px;'
            + 'width:20px;height:20px;'
            + 'border-top:1px solid rgba(180,60,60,0.25);'
            + 'border-left:1px solid rgba(180,60,60,0.25);'
            + '"></div>'
          + '<div style="'
            + 'position:absolute;top:10px;right:10px;'
            + 'width:20px;height:20px;'
            + 'border-top:1px solid rgba(180,60,60,0.25);'
            + 'border-right:1px solid rgba(180,60,60,0.25);'
            + '"></div>'

          // Bottom corner accents
          + '<div style="'
            + 'position:absolute;bottom:10px;left:10px;'
            + 'width:20px;height:20px;'
            + 'border-bottom:1px solid rgba(180,60,60,0.25);'
            + 'border-left:1px solid rgba(180,60,60,0.25);'
            + '"></div>'
          + '<div style="'
            + 'position:absolute;bottom:10px;right:10px;'
            + 'width:20px;height:20px;'
            + 'border-bottom:1px solid rgba(180,60,60,0.25);'
            + 'border-right:1px solid rgba(180,60,60,0.25);'
            + '"></div>'

          // Dialogue text — EXACT same style as door panel (26px, italic, centered)
          + '<div style="'
            + "font-family:Times New Roman,serif;font-size:26px;font-weight:400;font-style:italic;"
            + 'color:rgba(255,255,255,0.92);'
            + 'text-shadow:0 1px 8px rgba(0,0,0,0.9),0 0 20px rgba(100,20,20,0.15);'
            + 'text-align:center;line-height:1.6;'
            + 'letter-spacing:0.5px;'
            + 'max-width:85%;'
            + '">' + dialogText + '</div>'

          // Bottom ornamental line
          + '<div style="'
            + 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);'
            + 'width:60%;height:1px;'
            + 'background:linear-gradient(to right, transparent, rgba(180,60,60,0.35), transparent);'
            + '"></div>'

        + '</div>'
      + '</div>'
    ) : '')

  + '</div>';

  return backdrop + win;
}

module.exports = { renderCursedItemDialog };
