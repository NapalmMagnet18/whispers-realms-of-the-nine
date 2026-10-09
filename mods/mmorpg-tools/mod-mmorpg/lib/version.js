// The game's update version: bump this line with each release (0.47.6: guild banner over the Hall of Banners). Drawn only on the main menu, settings and pause screens.
var GAME_VERSION = '0.47.39 Alpha';
// The Herald of the Realm on the main menu reads these, newest first: [version, title, note, optional /cdn/ art]. Add a row with each bump.
var PATCH_NOTES = [
  ['v0.47.39', 'Petalfall Hollow', 'Somewhere in the thornwood west of Lantern\'s Reach, a ring of blossom trees hides a spring, six old standing stones and a fairy ring. Someone left an offering box there. Find it.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.38', "The Wayfarer's Blessing", "Kneel at any wayside shrine on the town roads (E) for the Wayfarer's Blessing: 20% faster travel for five minutes, golden motes at your heels.", '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.36', 'Wayside Shrines', 'A small candlelit shrine under a red shingle roof, a bench beside it, now waits along the road out of every race town. Walk close and you hear its candles crackle and its chimes stir.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.35', 'Lanterns on the Roads', 'Iron lantern posts now line the first stretch of road out of every race town, so the way home glows at dusk.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.34', 'Arches of the Hearths', 'Every race town now greets the road with a flowering arch and a hanging lantern: ember gold at Cinderhold, sea blue at Gullrest, fen violet at Reedhaven, star white at Starfall Eyrie.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.33', 'Thornhollow in Bloom', 'Seven flower beds now fill the bare clearings around Thornhollow, and a rose arch with a hanging lantern spans the road into town.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.27', 'Green Rise', 'The blossom hamlet now sits on a gentle green rise above the tideline, deep meadow grass and wildflowers instead of wet sand.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.26', 'The Blossom Hamlet', 'Four cottages now stand on the Reedhaven road, each in a ring of roses and lupines, a lamp over every door. The last of the town kit is placed too: crates, red banners and a farm gate in Lantern\'s Reach.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.24', 'Petals on the Wind', 'Blossom petals now drift across the March roads and Thornhollow, and fireflies glow low over the flower beds of every hearth town.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.23', 'Every Hearth in Bloom', 'Each race town now wears its own flowers: rose and violet at Thornhollow, ember gold at Cinderhold, sea blue at Gullrest, fen violet at Reedhaven, star white at Starfall Eyrie.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
  ['v0.47.22', 'The March in Bloom', 'Blossom trees and wildflower meadows now line the roads out of Lantern\'s Reach.', '/cdn/value.a3b7d175b8f2989f4561896afd914517e6f45914e600f2a1ef647bd38b46eec1.png'],
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
