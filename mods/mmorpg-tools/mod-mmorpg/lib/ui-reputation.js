// Reputation tab UI — MMORPG Tools Mod
var { REP_TIERS, getTierIndex, getTierName, getProgressInTier } = require('./reputation.js');

export function renderReputationTab(s) {
  var rep = s.reputation || 0;
  var tierIdx = getTierIndex(rep);
  var tierName = getTierName(rep);
  var prog = getProgressInTier(rep);
  var pct = Math.round((prog.current / prog.max) * 100);
  var isMaxed = rep >= 3000;

  var GREEN_BRIGHT = 'rgba(120,220,140,0.95)';
  var GREEN_DIM = 'rgba(80,160,100,0.6)';
  var GREEN_GLOW = 'rgba(100,200,120,0.5)';
  var GREEN_BAR = 'linear-gradient(to right, rgba(50,140,70,0.9), rgba(80,200,100,0.9))';
  var GREEN_BAR_FULL = 'linear-gradient(to right, rgba(80,200,100,0.9), rgba(140,230,160,0.9))';
  var GOLD = 'rgba(220,190,100,0.95)';

  var html = '';
  html += '<div style="text-align:center;margin-bottom:8px;">';
  html += '<div style="font-family:Cinzel,serif;font-size:11px;color:rgba(180,170,150,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">Standing</div>';
  html += '<div style="font-family:Cinzel,serif;font-size:18px;color:' + GOLD + ';letter-spacing:1.5px;text-shadow:0 0 10px rgba(220,190,100,0.3);">Reputation</div>';
  html += '</div>';

  html += '<div style="text-align:center;margin-bottom:10px;">';
  html += '<div style="display:inline-block;padding:5px 18px;border-radius:4px;background:linear-gradient(135deg,rgba(40,80,50,0.4),rgba(25,50,30,0.5));border:1px solid rgba(100,200,120,0.4);box-shadow:0 0 16px rgba(100,200,120,0.15),inset 0 1px 0 rgba(100,200,120,0.08);">';
  html += '<div style="font-family:Cinzel,serif;font-size:19px;color:' + GREEN_BRIGHT + ';letter-spacing:1px;text-shadow:0 0 12px ' + GREEN_GLOW + ';">' + tierName + '</div>';
  html += '</div></div>';

  html += '<div style="margin:0 12px 4px;">';
  html += '<div style="height:14px;border-radius:3px;overflow:hidden;background:rgba(30,28,25,0.8);border:1px solid rgba(80,60,40,0.4);box-shadow:inset 0 2px 6px rgba(0,0,0,0.6);">';
  html += '<div style="width:' + pct + '%;height:100%;border-radius:2px;transition:width 0.4s;background:' + (isMaxed ? GREEN_BAR_FULL : GREEN_BAR) + ';box-shadow:0 0 8px rgba(80,200,100,0.4);"></div>';
  html += '</div>';
  html += '<div style="text-align:center;margin-top:2px;font-family:Cinzel,serif;font-size:13px;color:' + (isMaxed ? GREEN_BRIGHT : GREEN_DIM) + ';letter-spacing:0.5px;">';
  html += isMaxed ? '<span style="color:' + GREEN_BRIGHT + ';">MAX</span>' : (prog.current + ' / ' + prog.max);
  html += '</div></div>';

  html += '<div style="text-align:center;margin:4px 0 10px;font-family:Cinzel,serif;font-size:12px;color:rgba(180,170,150,0.45);letter-spacing:0.5px;">Total: ' + rep + ' / 3000</div>';

  html += '<div style="margin:0 8px;">';
  html += '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(200,175,120,0.6);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(80,60,40,0.3);">Reputation Tiers</div>';
  for (var i = 0; i < REP_TIERS.length; i++) {
    var tier = REP_TIERS[i];
    var isCurrent = i === tierIdx;
    var isBelow = i < tierIdx;
    var rowBg = isCurrent ? 'background:linear-gradient(135deg,rgba(40,80,50,0.3),rgba(25,50,30,0.35));border:1px solid rgba(100,200,120,0.35);' : 'background:rgba(20,18,15,0.3);border:1px solid rgba(80,60,40,0.2);';
    var rowShadow = isCurrent ? 'box-shadow:0 0 10px rgba(100,200,120,0.1);' : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:4px;margin-bottom:4px;' + rowBg + rowShadow + '">';
    if (isBelow) {
      html += '<div style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(80,200,100,0.15);border:1px solid rgba(80,200,100,0.4);"><span style="color:' + GREEN_BRIGHT + ';font-size:11px;">\u2713</span></div>';
    } else if (isCurrent) {
      html += '<div style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(80,200,100,0.25);border:1px solid rgba(100,200,120,0.6);box-shadow:0 0 8px rgba(100,200,120,0.3);"><div style="width:6px;height:6px;border-radius:50%;background:' + GREEN_BRIGHT + ';box-shadow:0 0 6px ' + GREEN_GLOW + ';"></div></div>';
    } else {
      html += '<div style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(40,35,30,0.4);border:1px solid rgba(80,60,40,0.3);"><span style="color:rgba(120,100,80,0.35);font-size:10px;">\u25CB</span></div>';
    }
    var nameColor = isCurrent ? GREEN_BRIGHT : isBelow ? 'rgba(120,200,140,0.6)' : 'rgba(150,140,120,0.35)';
    html += '<div style="flex:1;"><div style="font-family:Cinzel,serif;font-size:13px;color:' + nameColor + ';letter-spacing:0.5px;">' + tier.name + '</div>';
    var rangeColor = isCurrent ? 'rgba(120,200,140,0.5)' : 'rgba(150,140,120,0.25)';
    var rangeText = i === 3 ? '3000' : tier.min + ' \u2013 ' + tier.max;
    html += '<div style="font-family:Cinzel,serif;font-size:10px;color:' + rangeColor + ';margin-top:1px;">' + rangeText + ' pts</div></div></div>';
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:10px;padding:0 16px;font-family:Cinzel,serif;font-size:11px;color:rgba(150,140,120,0.35);font-style:italic;line-height:1.4;">Complete quests to increase your reputation.</div>';
  return html;
}

module.exports = { renderReputationTab: renderReputationTab };
