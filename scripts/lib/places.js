// Every place a hero plays in (the open world and each dungeon/raid instance) and where a fallen hero rises inside one.
// A new dungeon or raid is one row here; quests, class kits, vitality and music read this list.
export const PLAY = ["main", "hollowcrypt", "drowned-bell", "root-archive", "pale-choir", "emberheart", "ninth-assembly", "banner-vale"];
export const isPlay = (place) => PLAY.includes(place);
export const SAFE_HOME = {
  hollowcrypt: { x: 0, y: 0.3, z: -4 },
  "drowned-bell": { x: 0, y: 0.3, z: -4 },
  "root-archive": { x: 0, y: 0.3, z: -4 },
  "pale-choir": { x: 0, y: 0.3, z: -4 },
  emberheart: { x: 0, y: 0.3, z: -4 },
  "ninth-assembly": { x: 0, y: 0.3, z: -4 },
  "banner-vale": { x: 0, y: 3.5, z: 104 }, // vitality.js raises vale heroes at their own team base
};
