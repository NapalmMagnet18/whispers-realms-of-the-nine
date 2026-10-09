// FBsRenderer — screen-space contact shadows: a half-res spiral-tap pass, then a depth-aware blur.
// Returns the AO factor (0 open .. 1 occluded) at screenUV.
import { float, vec2, vec3, dot, max, min, clamp, smoothstep, length, fract, sin, cos, abs, screenUV } from "builtin/tsl";
import { AO } from "./tuning.js";

const BLUR_TAPS = [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5], [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5]];

export function contactShadow(ctx) {
  const rawT = ctx.target("ao", { scale: 0.5, format: "rgba16float" }); // depth rides g at 16 bits: 8 stepped into stairs
  const raw = ctx.pass(rawT, (uv) => {
    const P = ctx.worldPosition(uv), N = ctx.normal(uv), z = abs(ctx.viewZAt(uv));
    const pf = uv.mul(rawT.size).floor();
    const rot = fract(fract(pf.x.mul(0.06711056).add(pf.y.mul(0.00583715))).mul(52.9829189)).mul(6.2832); // interleaved gradient noise
    const rUV = min(float(AO.radius).div(z.mul(1.35).max(0.2)), 0.06);
    const aspect = rawT.size.y.div(rawT.size.x);
    let occ = float(0);
    for (let i = 0; i < AO.taps; i++) {
      const f = (i + 0.5) / AO.taps, a = rot.add(i * 2.39996);
      const S = ctx.worldPosition(uv.add(vec2(cos(a).mul(aspect), sin(a)).mul(rUV.mul(f * f * 0.9 + 0.1))));
      const v = S.sub(P), d = length(v);
      occ = occ.add(max(dot(N, v.div(d.max(1e-4))).sub(0.15), 0).mul(float(1).sub(smoothstep(AO.radius * 0.3, AO.radius, d))));
    }
    return vec3(clamp(occ.div(AO.taps).mul(1.4), 0, 1).mul(float(1).sub(smoothstep(AO.fadeNear, AO.fadeFar, z))), z.div(40), 0);
  });
  const blurT = ctx.target("aoBlur", { scale: 0.5, format: "rgba8unorm" });
  const blur = ctx.pass(blurT, (uv) => {
    const c = raw.sample(uv), t = vec2(1).div(rawT.size);
    let sum = c.r, wsum = float(1);
    for (const [x, y] of BLUR_TAPS) {
      const s = raw.sample(uv.add(t.mul(vec2(x, y))));
      const w = float(1).sub(smoothstep(0.004, 0.02, abs(s.g.sub(c.g)))); // stop at silhouettes
      sum = sum.add(s.r.mul(w)); wsum = wsum.add(w);
    }
    return vec3(sum.div(wsum), 0, 0);
  });
  return blur.sample(screenUV).r;
}
