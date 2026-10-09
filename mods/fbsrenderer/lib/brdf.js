// FBsRenderer — the microfacet terms, one job each. lighting.js composes them.
import { dot, max, pow, clamp, float, mix, vec3, oneMinus, PI } from "builtin/tsl";
import { SURFACE } from "./tuning.js";

export const luminance = (c) => dot(c, vec3(0.2126, 0.7152, 0.0722));

// real-world roughness: dielectrics toward matte, broken up by their own albedo; metal and glass untouched
export function matteRoughness(surface) {
  const dielectric = oneMinus(clamp(surface.metalness.mul(2), 0, 1));
  const pushed = mix(surface.roughness, float(1), float(SURFACE.roughPush)).add(float(0.42).sub(luminance(surface.albedo)).mul(SURFACE.grimeRough));
  const roughness = clamp(mix(surface.roughness, max(pushed, float(SURFACE.roughMin)), dielectric), 0.04, 1);
  return { roughness, dielectric };
}
export function distributionGGX(NdotH, roughness) {
  const a2 = roughness.mul(roughness).mul(roughness.mul(roughness));
  const d = NdotH.mul(NdotH).mul(a2.sub(1)).add(1);
  return a2.div(max(PI.mul(d).mul(d), 1e-6));
}
export function geometrySmith(NdotV, NdotL, roughness) {
  const r = roughness.add(1), k = r.mul(r).div(8);
  return NdotV.div(NdotV.mul(oneMinus(k)).add(k)).mul(NdotL.div(NdotL.mul(oneMinus(k)).add(k)));
}
export function fresnelSchlick(f0, HdotV) {
  return f0.add(oneMinus(f0).mul(pow(clamp(oneMinus(max(HdotV, 0)), 0, 1), 5)));
}
// the hard shadow-map edge rides a smoothstep so the step reads as a falloff
export const softShadow = (s) => s.mul(s).mul(float(3).sub(s.mul(2)));
