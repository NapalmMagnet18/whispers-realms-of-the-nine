// Place music mapping — MMORPG Tools Mod
// Export interface matches scripts/lib/place-music.js exactly

var PLACE_MUSIC = {
  'main': '/cdn/moodboard-painterly-fantasy/music-warm-medieval-village-lute-recorder-hand-drum-afternoon-loop.mp3',
  'main-menu-land': '/cdn/moodboard-painterly-fantasy/music-majestic-fantasy-main-theme-solo-horn-rising-strings-choir-swell-loop.mp3',
  'character-creation-land': '/cdn/moodboard-painterly-fantasy/music-gentle-hopeful-fantasy-harp-celesta-soft-strings-hero-awakening-loop.mp3',
  'hollowcrypt': '/cdn/moodboard-gothic-horror/music-hollowcrypt-candlelit-vault-low-choir-slow-bells.mp3',
};

export function getPlaceMusic(placeId) {
  if (!placeId) return null;
  return PLACE_MUSIC[placeId] || null;
}

module.exports = { PLACE_MUSIC: PLACE_MUSIC, getPlaceMusic: getPlaceMusic };
