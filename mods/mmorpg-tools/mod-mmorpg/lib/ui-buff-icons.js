// War Banner buff icon UI component — MMORPG Tools Mod

export function formatMMSS(totalSec) {
  var sec = Math.max(0, Math.ceil(totalSec));
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
}

export function renderBuffIcons(localPlayer, rightHudLayout) {
  var buffScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var buffScaleStyle = buffScale < 1 ? "transform:scale(" + buffScale + ");transform-origin:top right;" : "";
  var s = localPlayer.state;
  if (!s.warBannerBuff) return '';

  var timeLeft = s.warBannerTimeLeft ?? 0;
  if (timeLeft <= 0) return '';

  var timeStr = formatMMSS(timeLeft);
  var isLow = timeLeft <= 30;
  var timerColor = isLow ? 'rgba(255,90,60,0.95)' : 'rgba(255,225,140,0.95)';
  var timerGlow = isLow
    ? '0 0 6px rgba(255,60,30,0.7),0 1px 2px rgba(0,0,0,0.9)'
    : '0 0 4px rgba(200,160,60,0.5),0 1px 2px rgba(0,0,0,0.9)';
  var pulseAnim = isLow ? 'animation:wbTimerPulse 0.8s ease-in-out infinite;' : '';

  return ''
    + '<style>'
    + '@keyframes wbBannerGlow {'
    + '  0%,100%{box-shadow:0 0 5px rgba(180,140,40,0.4),0 0 12px rgba(140,60,20,0.2),inset 0 0 4px rgba(0,0,0,0.5);}'
    + '  50%{box-shadow:0 0 10px rgba(220,180,60,0.7),0 0 20px rgba(180,80,30,0.35),inset 0 0 4px rgba(0,0,0,0.5);}'
    + '}'
    + '@keyframes wbTimerPulse {'
    + '  0%,100%{opacity:1;}'
    + '  50%{opacity:0.5;}'
    + '}'
    + '</style>'
    + '<div style="'
    + 'position:fixed;top:20px;right:280px;z-index:91;' + buffScaleStyle + ''
    + 'display:flex;align-items:center;gap:6px;'
    + 'pointer-events:none;'
    + '">'
    + '<div data-interactive style="'
    + 'width:36px;height:36px;position:relative;pointer-events:auto;cursor:default;'
    + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
    + 'border:2px solid rgba(160,130,60,0.7);border-radius:3px;'
    + 'animation:wbBannerGlow 2.5s ease-in-out infinite;'
    + 'flex-shrink:0;'
    + '">'
    + '<img src="/cdn/icon-dark-gothic-war-banner-battle-flag.png" style="'
    + 'width:100%;height:100%;object-fit:contain;pointer-events:none;'
    + '-webkit-user-drag:none;user-select:none;'
    + 'filter:brightness(1.1) sepia(0.1) saturate(1.2);'
    + '" />'
    + '<div style="'
    + 'position:absolute;top:-4px;right:-4px;'
    + 'background:linear-gradient(135deg,rgba(180,50,30,0.95),rgba(120,30,15,0.95));'
    + 'border:1px solid rgba(220,160,60,0.6);border-radius:2px;'
    + 'padding:0 2px;font-family:Cinzel,serif;font-size:8px;line-height:12px;'
    + 'color:rgba(255,220,120,0.95);white-space:nowrap;'
    + 'text-shadow:0 1px 2px rgba(0,0,0,0.8);pointer-events:none;'
    + '">+25%</div>'
    + '<div class="buff-tooltip" style="'
    + 'display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);'
    + 'margin-top:6px;padding:6px 10px;pointer-events:none;z-index:200;white-space:nowrap;'
    + 'background:linear-gradient(135deg,rgba(8,5,12,0.95),rgba(20,12,28,0.95));'
    + 'border:1px solid rgba(160,130,60,0.6);border-radius:3px;'
    + 'box-shadow:0 2px 12px rgba(0,0,0,0.8),0 0 6px rgba(140,100,30,0.2);'
    + '">'
    + '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(220,195,120,0.95);line-height:1.3;">War Banner</div>'
    + '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(120,255,120,0.9);line-height:1.2;margin-top:2px;">+25% Damage</div>'
    + '<div style="font-family:Cinzel,serif;font-size:11px;color:rgba(180,160,120,0.7);line-height:1.2;margin-top:2px;">Same-race allies in range</div>'
    + '</div>'
    + '</div>'
    + '<div style="'
    + 'position:absolute;bottom:1px;left:0;right:0;'
    + 'text-align:center;'
    + 'font-family:Cinzel,serif;font-size:11px;font-weight:700;line-height:1;'
    + 'color:' + timerColor + ';'
    + 'text-shadow:' + timerGlow + ';'
    + 'letter-spacing:0.5px;pointer-events:none;'
    + pulseAnim
    + '">' + timeStr + '</div>'
    + '</div>'
    + '</div>';
}

module.exports = { renderBuffIcons: renderBuffIcons };
