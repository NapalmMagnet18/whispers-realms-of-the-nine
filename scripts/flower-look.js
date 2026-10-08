// The wildflowers' look: stems keep their vertex green; a head card (uv.x >= 10, laid by scripts/flower.js with
// params.frame) samples the creator's painted flower sheet and is cut out by its alpha.
import { uv, vec2, mix, step, float, vertexColor, Fn, Discard } from "builtin/tsl";
import { MeshStandardNodeMaterial, DoubleSide } from "builtin/three";
export function material(ctx) {
  const m = new MeshStandardNodeMaterial();
  m.side = DoubleSide;
  const head = step(5.0, uv().x);
  const t = ctx.texture("/cdn/flowers-u3nrtlyel.webp").sample(vec2(uv().x.sub(10.0), uv().y));
  const body = mix(vertexColor().rgb, t.rgb.mul(1.1), head), keep = mix(float(1), t.a, head);
  m.colorNode = Fn(() => { Discard(keep.lessThan(0.5)); return body; })();
  m.roughness = 0.8;
  return m;
}
