// Tip Reminder Popup — gothic luxury modal matching the existing tip jar style
// Shows after 1 hour of playtime, once per session

var GNOME_GIF = 'https://github.com/rooibosteadrinker/gifs/blob/main/gnome_male.gif?raw=true';

export function renderTipReminderTier(buyableId, spoinsText, usdText, label, bgColor, borderColor, textColor, iconUrl) {
  return ''
    + '<div data-interactive onclick="sendAction(\'tipFromReminder\', { buyableId: \'' + buyableId + '\' })" style="'
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

export function renderTipReminder(localPlayer) {
  if (!localPlayer.state.showTipReminder) return '';

  return ''
    // Animations
    + '<style>'
    + '@keyframes tipReminderFade {'
    + '  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }'
    + '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }'
    + '}'
    + '@keyframes tipReminderPulse {'
    + '  0%, 100% { box-shadow: 0 0 16px rgba(200,170,80,0.3), 0 0 40px rgba(100,40,180,0.15); }'
    + '  50% { box-shadow: 0 0 24px rgba(200,170,80,0.5), 0 0 60px rgba(100,40,180,0.25); }'
    + '}'
    + '</style>'

    // Backdrop
    + '<div data-interactive onclick="sendAction(\'dismissTipReminder\')" style="'
    + '  position:fixed; inset:0; z-index:9998;'
    + '  background:rgba(0,0,0,0.75);'
    + '  backdrop-filter:blur(4px);'
    + '"></div>'

    // Modal container
    + '<div style="'
    + '  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);'
    + '  z-index:9999; pointer-events:auto;'
    + '  animation: tipReminderFade 0.4s ease-out forwards;'
    + '">'
    + '  <div style="'
    + '    width:400px;'
    + '    background:linear-gradient(135deg, rgba(8,4,12,0.97), rgba(15,8,20,0.97), rgba(8,4,12,0.97));'
    + '    border:1px solid rgba(200,170,80,0.35);'
    + '    border-radius:12px;'
    + '    box-shadow: 0 0 40px rgba(200,170,80,0.15), 0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200,170,80,0.1);'
    + '    overflow:hidden;'
    + '    font-family:Cinzel,Palatino,Georgia,serif;'
    + '    animation: tipReminderPulse 4s ease-in-out infinite;'
    + '  ">'

    // Top accent line — gold
    + '    <div style="height:2px; background:linear-gradient(90deg, transparent, rgba(200,170,80,0.6), rgba(120,60,200,0.4), rgba(200,170,80,0.6), transparent);"></div>'

    // Header with gnome portrait and message
    + '    <div style="padding:28px 28px 18px; text-align:center;">'
    // Gnome portrait
    + '      <div style="'
    + '        width:80px; height:80px; border-radius:50%; overflow:hidden;'
    + '        margin:0 auto 18px;'
    + '        border:2px solid rgba(200,170,80,0.5);'
    + '        box-shadow: 0 0 16px rgba(200,170,80,0.3), 0 0 32px rgba(200,170,80,0.1), inset 0 0 8px rgba(0,0,0,0.5);'
    + '      ">'
    + '        <img src="' + GNOME_GIF + '" style="width:100%;height:100%;object-fit:cover;" />'
    + '      </div>'
    // Main message text
    + '      <div style="'
    + '        font-size:15px; color:rgba(220,200,240,0.9); line-height:1.5;'
    + '        letter-spacing:0.5px;'
    + '        text-shadow:0 1px 3px rgba(0,0,0,0.8);'
    + '      ">It looks like you\'re enjoying the game, would you like to leave a tip for the creator?</div>'
    + '    </div>'

    // Divider
    + '    <div style="height:1px; margin:0 24px; background:linear-gradient(90deg, transparent, rgba(200,170,80,0.35), transparent);"></div>'

    // Tip tiers — matching existing system
    + '    <div style="padding:18px 24px; display:flex; flex-direction:column; gap:10px;">'

    // Tier 1: $1
    + renderTipReminderTier('tip-small', '100 Spoins', '$1.00', 'A Token of Thanks',
        'rgba(40,200,80,0.15)', 'rgba(40,200,80,0.5)', 'rgba(40,200,80,0.9)',
        '/cdn/sprite-fantasy-gold-coin-glowing-green.png')

    // Tier 2: $5
    + renderTipReminderTier('tip-medium', '500 Spoins', '$5.00', 'A Generous Gift',
        'rgba(120,60,200,0.15)', 'rgba(120,60,200,0.5)', 'rgba(200,170,80,0.95)',
        '/cdn/sprite-fantasy-gold-pouch-glowing-green.png')

    // Tier 3: $10
    + renderTipReminderTier('tip-large', '1000 Spoins', '$10.00', 'A Grand Tribute',
        'rgba(200,170,80,0.12)', 'rgba(200,170,80,0.5)', 'rgba(255,220,120,0.95)',
        '/cdn/sprite-fantasy-treasure-chest-gold-glowing.png')

    + '    </div>'

    // Divider
    + '    <div style="height:1px; margin:0 24px; background:linear-gradient(90deg, transparent, rgba(200,170,80,0.3), transparent);"></div>'

    // Dismiss button — styled as gentle "No thanks"
    + '    <div style="padding:16px 24px; text-align:center;">'
    + '      <div data-interactive onclick="sendAction(\'dismissTipReminder\')" style="'
    + '        display:inline-block; cursor:pointer; pointer-events:auto;'
    + '        font-size:14px; color:rgba(180,160,200,0.6); letter-spacing:1px;'
    + '        transition:color 0.2s;'
    + '        font-family:Cinzel,Palatino,Georgia,serif;'
    + '      "'
    + '      onmouseover="this.style.color=\'rgba(220,200,240,0.9)\'"'
    + '      onmouseout="this.style.color=\'rgba(180,160,200,0.6)\'"'
    + '      >No Thanks</div>'
    + '    </div>'

    // Bottom accent line
    + '    <div style="height:2px; background:linear-gradient(90deg, transparent, rgba(200,170,80,0.6), rgba(120,60,200,0.4), rgba(200,170,80,0.6), transparent);"></div>'
    + '  </div>'
    + '</div>';
}

module.exports = { renderTipReminder };
