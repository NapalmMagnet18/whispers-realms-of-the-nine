// The regions of the Lantern March continent: one table read by the terrain generator and the HUD.
// Order matters: the first region whose test passes names where you stand.
import { coastD } from "../terrain-reach.js";
export const REGIONS = [
  { id: "sea", name: "The Shrouded Sea", test: (x, z) => coastD(x, z) > 1.0 },
  { id: "reach", name: "Lantern's Reach", x: 0, z: 0, r: 70 },
  { id: "thornhollow", name: "Thornhollow", x: -720, z: 70, r: 60 },
  { id: "cinderhold", name: "Cinderhold", x: 900, z: -170, r: 60 },
  { id: "gullrest", name: "Gullrest", x: 250, z: 1430, r: 60 },
  { id: "farm", name: "Windmill Farm", x: -18, z: 52, r: 26 },
  { id: "quarry", name: "Emberstone Quarry", x: 135, z: 30, r: 80 },
  { id: "spire", name: "The Old Spire", x: 30, z: -360, r: 90 },
  { id: "hollowcrypt", name: "Hollowcrypt Vale", x: 1350, z: -700, r: 330 },
  { id: "sorrowfen", name: "Sorrowfen", x: -1300, z: 950, r: 520 },
  { id: "saltmere", name: "Saltmere Coast", x: 300, z: 1650, r: 420 },
  { id: "frostveil", name: "Frostveil Tundra", test: (x, z) => z < -3000 },
  { id: "sunscar", name: "Sunscar Expanse", test: (x, z) => x > 3000 },
  { id: "elderveil", name: "Elderveil Wilds", test: (x, z) => x < -3000 },
  { id: "greyspine", name: "Greyspine Mountains", test: (x, z) => z < -800 },
  { id: "highlands", name: "Emberstone Highlands", test: (x, z) => x > 650 },
  { id: "deepwood", name: "Briarwild Deepwood", test: (x, z) => x < -500 },
  { id: "briarwild", name: "Briarwild", test: (x, z) => x < -60 && x > -500 && Math.abs(z) < 420 },
];
export const MARCH = "The Lantern March";
export function regionAt(x, z) {
  for (const g of REGIONS) {
    if (g.test ? g.test(x, z) : Math.hypot(x - g.x, z - g.z) < g.r) return g.name;
  }
  return MARCH;
}
