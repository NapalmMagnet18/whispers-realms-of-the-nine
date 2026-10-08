// The mushrooms' look: the creator's painted mushroom sheet, sampled at the uvs scripts/mushroom.js lays.
import { uv } from "builtin/tsl";
import { MeshStandardNodeMaterial } from "builtin/three";
export function material(ctx) {
  const m = new MeshStandardNodeMaterial();
  m.colorNode = ctx.texture("/cdn/mushrooms-u566plguh.webp").sample(uv()).rgb.mul(ctx.param("gain", 1.1));
  m.roughness = 0.7;
  return m;
}
