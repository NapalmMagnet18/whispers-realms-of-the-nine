// A falling leaf's face: one leaf cut from the creator's leaf sheet (/cdn/leaves-u3qvd2rg4.webp), the frame picked
// by the particle's seed; the sheet's own alpha cuts it out. Worn by the card sink in scripts/fx/leaf-fall.fx.js.
import { vec2, vec4, select, float } from "builtin/tsl";
import { MeshStandardNodeMaterial, DoubleSide } from "builtin/three";
const FRAMES = [[0.052, 0.046, 0.131, 0.384], [0.226, 0.047, 0.131, 0.384], [0.404, 0.044, 0.136, 0.48], [0.57, 0.044, 0.137, 0.48], [0.784, 0.043, 0.179, 0.224], [0.773, 0.314, 0.19, 0.247]];
export function material(ctx) {
  const m = new MeshStandardNodeMaterial();
  m.side = DoubleSide;
  const k = ctx.fx.seed.fract().mul(FRAMES.length).floor();
  let rect = vec4(...FRAMES[0]);
  for (let i = 1; i < FRAMES.length; i++) rect = select(k.equal(float(i)), vec4(...FRAMES[i]), rect);
  const p = vec2(ctx.fx.uvAcross, ctx.fx.uvAlong);
  const t = ctx.texture("/cdn/leaves-u3qvd2rg4.webp").sample(vec2(rect.x.add(p.x.mul(rect.z)), float(1).sub(rect.y.add(p.y.mul(rect.w)))));
  m.colorNode = t.rgb;
  m.opacityNode = t.a.mul(ctx.fx.alpha);
  m.alphaTest = 0.4;
  m.roughness = 0.8;
  return m;
}
