// Music Panel — MMORPG Tools Mod
// Shows the music jukebox UI with tracks from mod music-tracks.js

const { TRACKS } = require('./music-tracks.js');

export function renderMusicTab(s) {
  var isPlaying = (s.activeTrack !== null && s.activeTrack !== undefined && s.activeTrack !== -1);

  var toggleIcon = isPlaying
    ? '<rect x="13" y="13" width="10" height="10" rx="1" fill="rgba(220,190,100,0.95)"/>'
    : '<polygon points="14,11 14,25 26,18" fill="rgba(220,190,100,0.95)"/>';

  var toggleAction = isPlaying ? "sendAction('stopTrack')" : "sendAction('playTrack',{index:0})";

  var toggleBtn = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'
    + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;color:rgba(180,155,100,0.4);letter-spacing:1.5px;text-transform:uppercase;">'
    + (isPlaying ? 'Now Playing' : 'Select a Track')
    + '</div>'
    + '<div data-interactive onclick="' + toggleAction + '" style="'
    + 'width:36px;height:36px;border-radius:50%;cursor:pointer;'
    + 'background:linear-gradient(135deg,rgba(15,10,8,0.95),rgba(25,18,12,0.9));'
    + 'border:2px solid rgba(80,60,35,0.6);'
    + 'box-shadow:0 0 8px rgba(0,0,0,0.6),inset 0 1px 3px rgba(0,0,0,0.5)' + (isPlaying ? ',0 0 12px rgba(140,80,200,0.3)' : '') + ';'
    + 'display:flex;align-items:center;justify-content:center;transition:all 0.15s;'
    + '" onmouseenter="this.style.borderColor=\'rgba(200,175,120,0.8)\'"'
    + ' onmouseleave="this.style.borderColor=\'rgba(80,60,35,0.6)\'">'
    + '<svg width="36" height="36" viewBox="0 0 36 36">' + toggleIcon + '</svg>'
    + '</div>'
    + '</div>';

  var divider = '<div style="height:1px;background:linear-gradient(to right,transparent,rgba(80,60,35,0.4),transparent);margin-bottom:4px;"></div>';

  var trackList = '';
  for (var i = 0; i < TRACKS.length; i++) {
    var t = TRACKS[i];
    var isActive = (s.activeTrack === i);
    var numColor = isActive ? 'rgba(220,190,100,0.95)' : 'rgba(120,100,70,0.5)';
    var nameColor = isActive ? 'rgba(220,190,100,0.95)' : 'rgba(180,155,120,0.75)';
    var rowBg = isActive ? 'linear-gradient(90deg,rgba(80,30,120,0.25),rgba(60,20,100,0.12),transparent)' : 'transparent';
    var rowBorder = isActive ? 'rgba(140,80,200,0.35)' : 'transparent';
    var playingDot = isActive
      ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:rgba(200,140,255,0.9);box-shadow:0 0 6px rgba(200,140,255,0.7);margin-right:6px;flex-shrink:0;"></span>'
      : '';

    trackList += '<div data-interactive onclick="sendAction(\'playTrack\',{index:' + i + '})" style="'
      + 'padding:5px 8px;border-radius:3px;cursor:pointer;display:flex;align-items:center;'
      + 'background:' + rowBg + ';border-left:2px solid ' + rowBorder + ';transition:all 0.12s;">'
      + playingDot
      + '<span style="font-family:Cinzel,serif;font-size:18px;color:' + numColor + ';min-width:22px;flex-shrink:0;">' + (i + 1) + '.</span>'
      + '<span style="font-family:Cinzel,serif;font-size:18px;color:' + nameColor + ';text-shadow:0 1px 2px rgba(0,0,0,0.8);letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.name + '</span>'
      + '</div>';
  }

  return toggleBtn + divider + trackList;
}

module.exports = { renderMusicTab: renderMusicTab };
