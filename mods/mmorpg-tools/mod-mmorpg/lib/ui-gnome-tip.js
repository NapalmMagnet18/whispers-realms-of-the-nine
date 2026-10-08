// Gnome Avatar Tip Jar — gothic luxury modal
// Circular gnome GIF with green glowing frame, click opens tip modal

var GNOME_GIF = 'https://github.com/rooibosteadrinker/gifs/blob/main/gnome_male.gif?raw=true';

export function renderGnomeTipJar(localPlayer, rightHudLayout) {
  var tipScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var tipScaleStyle = tipScale < 1 ? "transform:scale(" + tipScale + ");transform-origin:top left;" : "";
  var showModal = localPlayer.state.showTipModal === true;

  // On main menu, hide the fixed avatar (the main menu has its own inline tip section)
  var hideFixedAvatar = localPlayer.state.inMainMenu === true;

  // --- Gnome avatar circle (positioned below the race portrait, left side) ---
  var gnomeAvatar = ''
    + '<style>'
    + '@keyframes gnomeGlow {'
    + '  0%, 100% { box-shadow: 0 0 8px rgba(40,200,80,0.5), 0 0 16px rgba(40,200,80,0.2), inset 0 0 6px rgba(0,0,0,0.4); }'
    + '  50% { box-shadow: 0 0 14px rgba(40,200,80,0.8), 0 0 28px rgba(40,200,80,0.35), inset 0 0 6px rgba(0,0,0,0.4); }'
    + '}'
    + '@keyframes gnomeFrameGlow {'
    + '  0%, 100% { filter: drop-shadow(0 0 6px rgba(40,200,80,0.4)) drop-shadow(0 2px 8px rgba(0,0,0,0.7)); }'
    + '  50% { filter: drop-shadow(0 0 12px rgba(40,200,80,0.7)) drop-shadow(0 2px 8px rgba(0,0,0,0.7)); }'
    + '}'
    + '@keyframes tipModalFade {'
    + '  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }'
    + '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }'
    + '}'
    + '@keyframes tipShimmer {'
    + '  0% { background-position: -200% center; }'
    + '  100% { background-position: 200% center; }'
    + '}'
    + '</style>'
    + '<div data-interactive onclick="sendAction(\'toggleTipModal\')" style="'
    + '  position:fixed; top:135px; left:38px; z-index:89; ${tipScaleStyle}'
    + '  width:72px; height:72px; cursor:pointer; pointer-events:auto;'
    + '">'
    // (frame removed)
    // Inner portrait circle
    + '  <div style="'
    + '    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);'
    + '    width:58px; height:58px; border-radius:50%; overflow:hidden;'
    + '    border: 2px solid rgba(40,200,80,0.7);'
    + '    animation: gnomeGlow 3s ease-in-out infinite;'
    + '  ">'
    + '    <img src="' + GNOME_GIF + '" style="'
    + '      width:100%; height:100%; object-fit:cover;'
    + '      -webkit-user-drag:none; user-select:none; pointer-events:none;'
    + '    " />'
    + '  </div>'
    // Small "TIP" label
    + '  <div style="'
    + '    position:absolute; bottom:-11px; left:50%; transform:translateX(-50%);'
    + '    font-family:Cinzel,Palatino,Georgia,serif; font-size:10px; font-weight:bold;'
    + '    color:rgba(40,200,80,0.9); letter-spacing:2px;'
    + '    text-shadow:0 0 6px rgba(40,200,80,0.5), 0 1px 2px rgba(0,0,0,0.9);'
    + '    pointer-events:none;'
    + '  ">TIP</div>'
    + '</div>';

  // --- Tip Modal ---
  var tipModal = '';
  if (showModal) {
    tipModal = ''
      // Backdrop
      + '<div data-interactive onclick="sendAction(\'toggleTipModal\')" style="'
      + '  position:fixed; inset:0; z-index:9998;'
      + '  background:rgba(0,0,0,0.75);'
      + '  backdrop-filter:blur(4px);'
      + '"></div>'
      // Modal container
      + '<div style="'
      + '  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);'
      + '  z-index:9999; pointer-events:auto;'
      + '  animation: tipModalFade 0.3s ease-out forwards;'
      + '">'
      + '  <div style="'
      + '    width:380px;'
      + '    background:linear-gradient(135deg, rgba(8,4,12,0.97), rgba(15,8,20,0.97), rgba(8,4,12,0.97));'
      + '    border:1px solid rgba(120,60,200,0.4);'
      + '    border-radius:12px;'
      + '    box-shadow: 0 0 40px rgba(100,40,180,0.2), 0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(120,60,200,0.15);'
      + '    overflow:hidden;'
      + '    font-family:Cinzel,Palatino,Georgia,serif;'
      + '  ">'

      // Top accent line
      + '    <div style="height:2px; background:linear-gradient(90deg, transparent, rgba(120,60,200,0.6), rgba(40,200,80,0.4), rgba(120,60,200,0.6), transparent);"></div>'

      // Header with gnome portrait
      + '    <div style="padding:24px 24px 16px; text-align:center;">'
      // Gnome portrait centered
      + '      <div style="'
      + '        width:80px; height:80px; border-radius:50%; overflow:hidden;'
      + '        margin:0 auto 16px;'
      + '        border:2px solid rgba(40,200,80,0.6);'
      + '        box-shadow: 0 0 16px rgba(40,200,80,0.4), 0 0 32px rgba(40,200,80,0.15), inset 0 0 8px rgba(0,0,0,0.5);'
      + '      ">'
      + '        <img src="' + GNOME_GIF + '" style="width:100%;height:100%;object-fit:cover;" />'
      + '      </div>'
      // Title
      + '      <div style="'
      + '        font-size:22px; font-weight:bold; letter-spacing:2px;'
      + '        color:rgba(220,190,100,0.95);'
      + '        text-shadow:0 0 12px rgba(200,170,80,0.3), 0 2px 4px rgba(0,0,0,0.9);'
      + '      ">LEAVE A TIP</div>'
      // Subtitle
      + '      <div style="'
      + '        font-size:13px; color:rgba(180,160,200,0.7); margin-top:6px;'
      + '        letter-spacing:1px; line-height:1.4;'
      + '      ">Support the creator</div>'
      + '    </div>'

      // Divider
      + '    <div style="height:1px; margin:0 20px; background:linear-gradient(90deg, transparent, rgba(120,60,200,0.4), transparent);"></div>'

      // Tip tiers
      + '    <div style="padding:20px 24px; display:flex; flex-direction:column; gap:10px;">'

      // Tier 1: Small tip — $1
      + renderTipTier('tip-small', '100 Spoins', '$1.00', 'A Token of Thanks',
          'rgba(40,200,80,0.15)', 'rgba(40,200,80,0.5)', 'rgba(40,200,80,0.9)',
          '/cdn/sprite-fantasy-gold-coin-glowing-green.png')

      // Tier 2: Medium tip — $5
      + renderTipTier('tip-medium', '500 Spoins', '$5.00', 'A Generous Gift',
          'rgba(120,60,200,0.15)', 'rgba(120,60,200,0.5)', 'rgba(200,170,80,0.95)',
          '/cdn/sprite-fantasy-gold-pouch-glowing-green.png')

      // Tier 3: Large tip — $10
      + renderTipTier('tip-large', '1000 Spoins', '$10.00', 'A Grand Tribute',
          'rgba(200,170,80,0.12)', 'rgba(200,170,80,0.5)', 'rgba(255,220,120,0.95)',
          '/cdn/sprite-fantasy-treasure-chest-gold-glowing.png')

      + '    </div>'

      // Divider before custom
      + '    <div style="height:1px; margin:0 20px; background:linear-gradient(90deg, transparent, rgba(120,60,200,0.3), transparent);"></div>'

      // Custom Amount section
      + '    <div style="padding:16px 24px;">'
      + '      <div style="'
      + '        font-size:13px; color:rgba(180,160,200,0.6); letter-spacing:1.5px;'
      + '        text-align:center; margin-bottom:12px; text-transform:uppercase;'
      + '        font-family:Cinzel,Palatino,Georgia,serif;'
      + '      ">\u2014 or choose your own tribute \u2014</div>'
      + '      <div style="display:flex; gap:10px; align-items:stretch;">'
      // Dollar sign + input container
      + '        <div style="'
      + '          flex:1; display:flex; align-items:center; gap:0;'
      + '          background:linear-gradient(135deg, rgba(120,60,200,0.1), rgba(10,6,15,0.85));'
      + '          border:1px solid rgba(120,60,200,0.4);'
      + '          border-radius:8px; overflow:hidden;'
      + '          box-shadow:inset 0 2px 8px rgba(0,0,0,0.5);'
      + '        ">'
      + '          <div style="'
      + '            padding:0 0 0 14px; font-size:18px; font-weight:bold;'
      + '            color:rgba(200,170,80,0.7); font-family:Cinzel,Palatino,Georgia,serif;'
      + '            pointer-events:none; user-select:none;'
      + '          ">$</div>'
      + '          <input data-interactive id="gnome-tip-custom-input" type="number" min="1" max="100" step="1" placeholder="Amount"'
      + '            style="'
      + '              flex:1; background:transparent; border:none; outline:none;'
      + '              color:rgba(220,200,240,0.95); font-size:18px; font-weight:bold;'
      + '              font-family:Cinzel,Palatino,Georgia,serif;'
      + '              padding:12px 12px 12px 6px;'
      + '              letter-spacing:1px;'
      + '            "'
      + '            onfocus="this.parentElement.style.borderColor=\'rgba(200,170,80,0.6)\'"'
      + '            onblur="this.parentElement.style.borderColor=\'rgba(120,60,200,0.4)\'"'
      + '          />'
      + '        </div>'
      // Donate button
      + '        <div data-interactive onclick="'
      + '          var inp=document.getElementById(\'gnome-tip-custom-input\');'
      + '          if(!inp)return;'
      + '          var v=Math.round(parseFloat(inp.value)||0);'
      + '          if(v<1||v>100){inp.style.borderColor=\'rgba(200,60,60,0.8)\';return;}'
      + '          sendAction(\'tipCustomDonate\',{dollars:v});'
      + '        " style="'
      + '          display:flex; align-items:center; justify-content:center;'
      + '          padding:12px 18px;'
      + '          background:linear-gradient(135deg, rgba(40,200,80,0.2), rgba(20,120,50,0.3));'
      + '          border:1px solid rgba(40,200,80,0.5);'
      + '          border-radius:8px; cursor:pointer; pointer-events:auto;'
      + '          box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 8px rgba(40,200,80,0.15);'
      + '          transition:all 0.2s;'
      + '          font-family:Cinzel,Palatino,Georgia,serif;'
      + '          font-size:14px; font-weight:bold; letter-spacing:1.5px;'
      + '          color:rgba(40,200,80,0.95);'
      + '          text-shadow:0 0 8px rgba(40,200,80,0.3), 0 1px 2px rgba(0,0,0,0.9);'
      + '          white-space:nowrap;'
      + '        "'
      + '        onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 20px rgba(40,200,80,0.3), 0 0 12px rgba(40,200,80,0.25)\';this.style.borderColor=\'rgba(40,200,80,0.8)\'"'
      + '        onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.4), 0 0 8px rgba(40,200,80,0.15)\';this.style.borderColor=\'rgba(40,200,80,0.5)\'"'
      + '        >DONATE</div>'
      + '      </div>'
      // Helper text
      + '      <div style="'
      + '        font-size:11px; color:rgba(180,160,200,0.4); text-align:center;'
      + '        margin-top:8px; letter-spacing:0.5px;'
      + '        font-family:Cinzel,Palatino,Georgia,serif;'
      + '      ">$1 \u2013 $100 \u00b7 100 Spoins per dollar</div>'
      + '    </div>'

      // Bottom divider
      + '    <div style="height:1px; margin:0 20px; background:linear-gradient(90deg, transparent, rgba(120,60,200,0.4), transparent);"></div>'

      // Footer
      + '    <div style="padding:14px 24px; text-align:center;">'
      + '      <div data-interactive onclick="sendAction(\'toggleTipModal\')" style="'
      + '        display:inline-block; cursor:pointer; pointer-events:auto;'
      + '        font-size:14px; color:rgba(180,160,200,0.6); letter-spacing:1px;'
      + '        transition:color 0.2s;'
      + '      "'
      + '      onmouseover="this.style.color=\'rgba(220,200,240,0.9)\'"'
      + '      onmouseout="this.style.color=\'rgba(180,160,200,0.6)\'"'
      + '      >Close</div>'
      + '    </div>'

      // Bottom accent
      + '    <div style="height:2px; background:linear-gradient(90deg, transparent, rgba(120,60,200,0.6), rgba(40,200,80,0.4), rgba(120,60,200,0.6), transparent);"></div>'
      + '  </div>'
      + '</div>';
  }

  return (hideFixedAvatar ? '' : gnomeAvatar) + tipModal;
}

export function renderTipTier(buyableId, spoinsText, usdText, label, bgColor, borderColor, textColor, iconUrl) {
  return ''
    + '<div data-interactive onclick="sendAction(\'tipDonate\', { buyableId: \'' + buyableId + '\' })" style="'
    + '  display:flex; align-items:center; gap:14px; padding:14px 16px;'
    + '  background:linear-gradient(135deg, ' + bgColor + ', rgba(10,6,15,0.8));'
    + '  border:1px solid ' + borderColor + ';'
    + '  border-radius:8px; cursor:pointer; pointer-events:auto;'
    + '  box-shadow: 0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);'
    + '  transition:all 0.2s;'
    + '"'
    + ' onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 20px rgba(120,60,200,0.3), inset 0 1px 0 rgba(255,255,255,0.05)\';this.style.borderColor=\'' + textColor + '\'"'
    + ' onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)\';this.style.borderColor=\'' + borderColor + '\'"'
    + '>'
    // Icon
    + '  <div style="width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">'
    + '    <img src="' + iconUrl + '" style="width:38px;height:38px;object-fit:contain;filter:drop-shadow(0 0 6px ' + borderColor + ');" />'
    + '  </div>'
    // Text
    + '  <div style="flex:1;">'
    + '    <div style="font-size:16px;font-weight:bold;color:' + textColor + ';letter-spacing:1px;text-shadow:0 1px 3px rgba(0,0,0,0.9);">' + label + '</div>'
    + '    <div style="font-size:12px;color:rgba(180,160,200,0.6);margin-top:2px;letter-spacing:0.5px;">' + spoinsText + ' · ' + usdText + '</div>'
    + '  </div>'
    // Arrow
    + '  <div style="color:' + textColor + ';font-size:18px;opacity:0.6;pointer-events:none;">›</div>'
    + '</div>';
}

module.exports = { renderGnomeTipJar };
