// The game's update version: bump this line with each release. Drawn only on the main menu, settings and pause screens.
var GAME_VERSION = '0.40.3 Alpha';
var GAME_TITLE = 'WHISPERS: Realm of the Nine';
function versionTag(extra) {
  return '<div style="position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9999;pointer-events:none;'
    + 'font:500 11px/1 Cinzel,Palatino,Georgia,serif;letter-spacing:1.5px;color:rgba(232,217,181,.55);text-shadow:0 1px 2px #000;white-space:nowrap;' + (extra || '') + '">'
    + GAME_TITLE + ' &middot; v' + GAME_VERSION + '</div>';
}
module.exports = { GAME_VERSION: GAME_VERSION, GAME_TITLE: GAME_TITLE, versionTag: versionTag };
