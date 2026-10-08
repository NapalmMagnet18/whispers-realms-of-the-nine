// spawn6 native template "player"
export const player = {
  behavior: ["scripts/humanoid-locomotion.js", "scripts/player.js", "scripts/vanguard.js", "scripts/arcanist.js", "scripts/pathfinder.js", "scripts/shade.js", "scripts/quest-player.js", "scripts/vendor.js", "scripts/flight.js", "scripts/vitality.js"],
  feetPosition: { x: 0, y: 2, z: 0 },
  physics: { body: "character" },
  tags: ["player"],
};
