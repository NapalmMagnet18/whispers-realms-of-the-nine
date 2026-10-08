// The Realm Gate's veil: lantern-gold energy churning in a slow spiral, white-gold at the heart,
// ember orange at the rim. Unlit, additive, worn by a plane in the arch's opening.
import { vec2, vec3, uv, time, float, mix, smoothstep, mx_fractal_noise_float, mx_noise_float } from "builtin/tsl";
import { MeshBasicNodeMaterial, AdditiveBlending, DoubleSide } from "builtin/three";

export function material(ctx) {
  const m = new MeshBasicNodeMaterial();
  const W = ctx.param("width", 7.8), H = ctx.param("height", 11.6), glow = ctx.param("glow", 1);
  const p = uv().sub(vec2(0.5, 0.5)).mul(vec2(W, H)).sub(vec2(0, ctx.param("centreY", -0.6)));
  const r = p.length().div(4.4);
  const ang = p.y.atan2(p.x);
  const sw = ang.add(time.mul(0.11)).add(r.mul(2.6));
  const q = vec2(sw.cos(), sw.sin()).mul(r.mul(2.2));
  const n1 = mx_fractal_noise_float(vec3(q.x, q.y, time.mul(0.06)), 4, 2.0, 0.55, 1.0);
  const n2 = mx_noise_float(vec3(p.x.mul(0.55), p.y.mul(0.4).sub(time.mul(0.25)), time.mul(0.1)));
  const core = float(1).sub(smoothstep(0.0, 1.05, r));
  const veins = float(1).sub(n1.abs()).pow(7).mul(1.3);
  const v = core.mul(1.25).add(n1.mul(0.5).add(0.5).mul(0.8).mul(float(1).sub(r.mul(0.35)))).add(veins).add(n2.mul(0.15)).max(0);
  const ember = vec3(0.85, 0.16, 0.03), gold = vec3(2.4, 1.25, 0.3), white = vec3(6.0, 4.4, 2.4);
  const col = mix(mix(ember, gold, smoothstep(0.35, 1.0, v)), white, smoothstep(1.25, 1.9, v));
  m.colorNode = col.mul(v.mul(0.8).add(0.12)).mul(glow);
  m.transparent = true;
  m.blending = AdditiveBlending;
  m.depthWrite = false;
  m.side = DoubleSide;
  m.fog = false;
  return m;
}
