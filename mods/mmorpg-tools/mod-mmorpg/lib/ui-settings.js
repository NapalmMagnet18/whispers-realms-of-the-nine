var { versionTag } = require('./version.js');
// Settings tab UI for MMORPG Tools Mod
// Dark gothic styling — near-black marble, gold accents, Cinzel font

export function renderSettingsTab(s) {
  var html = '';

  // ─── Toggle UI Art Button ───
  var hideArt = s.hideUiArt === true;
  var artLabel = hideArt ? 'Show UI Art' : 'Hide UI Art';
  html += '<div data-interactive onclick="sendAction(\'toggleUiArt\')" style="'
    + 'padding:8px 16px;'
    + 'background:rgba(30,25,18,0.5);'
    + 'border:1px solid rgba(80,65,40,0.4);'
    + 'border-radius:4px;cursor:pointer;pointer-events:auto;'
    + 'font-family:Cinzel,serif;font-size:18px;'
    + 'color:rgba(200,175,120,0.65);'
    + 'text-align:center;letter-spacing:1px;'
    + 'margin-bottom:10px;'
    + '" onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.5)\';this.style.color=\'rgba(200,175,120,0.9)\'"'
    + ' onmouseleave="this.style.borderColor=\'rgba(80,65,40,0.4)\';this.style.color=\'rgba(200,175,120,0.65)\'">'
    + artLabel + '</div>';

  // ─── Divider ───
  html += '<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(80,65,40,0.25),transparent);margin-bottom:10px;"></div>';

  // ─── Main Menu Button (secondary, subtle) ───
  html += '<div data-interactive onclick="sendAction(\'goToMainMenu\')" style="'
    + 'padding:8px 18px;'
    + 'background:rgba(40,30,20,0.3);'
    + 'border:1px solid rgba(80,65,40,0.3);'
    + 'border-radius:4px;cursor:pointer;pointer-events:auto;'
    + 'font-family:Cinzel,serif;font-size:18px;'
    + 'color:rgba(200,175,120,0.5);'
    + 'text-align:center;letter-spacing:1px;'
    + '" onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.4)\';this.style.color=\'rgba(200,175,120,0.75)\'"'
    + ' onmouseleave="this.style.borderColor=\'rgba(80,65,40,0.3)\';this.style.color=\'rgba(200,175,120,0.5)\'">'
    + 'Main Menu</div>';

  if (!s.inMainMenu) html += versionTag('left:16px;bottom:6px;transform:none;'); // clear of the XP bar at bottom-centre
  return html;
}

module.exports = { renderSettingsTab };
