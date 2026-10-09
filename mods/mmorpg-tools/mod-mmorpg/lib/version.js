// The game's update version: bump this line with each release (0.47.6: guild banner over the Hall of Banners). Drawn only on the main menu, settings and pause screens.
var GAME_VERSION = '0.47.22 Alpha';
// The Herald of the Realm on the main menu reads these, newest first: [version, title, note, optional /cdn/ art]. Add a row with each bump.
var PATCH_NOTES = [
  ['v0.47.22', 'The March in Bloom', 'Blossom trees and wildflower meadows now line the roads out of Lantern\'s Reach.'],
  ['v0.47', 'Wings over the March', 'Eleven gryphon roosts now link the continent. Walk near one to learn it, press E to fly. The Ninth Veil and the Ashfall Reaches wait at the far edges.', '/cdn/value.9b81f41b857bd952a2ae562a55e5b84d5eb6137b07dee8760b7cc32d97bd68f0.png'],
  ['v0.47', 'The Deepgrove Bounty', 'A lit board west of Rootwake Glade pays for Scab\'s raiders. Level 8 and up.', '/cdn/value.6489d07ac1164f457c728992a582ec1e52cb7ce0d2e3e0b4726fae264c3ebd86.png'],
  ['v0.46', 'Wells of the March', 'Draw a bucket at any town well and drink to heal over time.'],
  ['v0.46', 'Party Finder & Banner Vale', 'Queue for dungeons, raids and the 5v5 banner battleground from any town board.', '/cdn/value.b076587b8d0ebb04368c665fb66c1a3d0e1303b8695e64a49188e8c8e5ae0436.png'],
];
var GAME_TITLE = 'WHISPERS: Realm of the Nine';
function versionTag(extra) {
  return '<div style="position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9999;pointer-events:none;'
    + 'font:500 11px/1 Cinzel,Palatino,Georgia,serif;letter-spacing:1.5px;color:rgba(232,217,181,.55);text-shadow:0 1px 2px #000;white-space:nowrap;' + (extra || '') + '">'
    + GAME_TITLE + ' &middot; v' + GAME_VERSION + '</div>';
}
module.exports = { GAME_VERSION: GAME_VERSION, GAME_TITLE: GAME_TITLE, versionTag: versionTag, PATCH_NOTES: PATCH_NOTES };
