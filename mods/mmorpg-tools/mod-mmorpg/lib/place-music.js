// Place music mapping — MMORPG Tools Mod
// Export interface matches scripts/lib/place-music.js exactly

var PLACE_MUSIC = {
  'main': '/cdn/music-instrumental-fantasy-adventure-orchestral.mp3',
};

export function getPlaceMusic(placeId) {
  if (!placeId) return null;
  return PLACE_MUSIC[placeId] || null;
}

module.exports = { PLACE_MUSIC: PLACE_MUSIC, getPlaceMusic: getPlaceMusic };
