// FBsRenderer — the lighting model (from The Fourth Knock, @fbp). Point world.config.yaml `lighting:` here.
// GGX + Lambert on matte real-world roughness, soft shadow edges, zero flat ambient: only lights, their
// bounce rows (bounce.js) and the sky's environment light a surface.
import { dot, max, mix, normalize, float, vec3, oneMinus } from "builtin/tsl";
import { SURFACE, SHADOW } from "./lib/tuning.js";
import { matteRoughness, distributionGGX, geometrySmith, fresnelSchlick, softShadow } from "./lib/brdf.js";

export function lighting(surface, lights) {
  const { albedo, normal: N, view: V, metalness } = surface;
  const { roughness, dielectric } = matteRoughness(surface);
  const f0 = mix(vec3(0.04), albedo, metalness);
  const diffuseAlbedo = albedo.mul(oneMinus(metalness));
  const NdotV = max(dot(N, V), 1e-4);

  const direct = lights.each((light) => {
    const L = light.direction;
    const NdotL = max(dot(N, L), 0);
    const H = normalize(V.add(L));
    const F = fresnelSchlick(f0, dot(H, V));
    const specular = distributionGGX(max(dot(N, H), 0), roughness).mul(geometrySmith(NdotV, NdotL, roughness)).mul(F)
      .div(max(float(4).mul(NdotV).mul(NdotL), 1e-4));
    const diffuse = oneMinus(F).mul(diffuseAlbedo).div(Math.PI);
    const shade = mix(float(SHADOW.floor), float(1), softShadow(light.shadow));
    return diffuse.add(specular.mul(light.shadow)).mul(light.color).mul(shade).mul(NdotL);
  });

  // the env reflection was folded for the authored roughness: damp it by how much matte we added
  const added = roughness.sub(surface.roughness).div(max(oneMinus(surface.roughness), 0.05)).add(roughness.mul(0.5)).clamp(0, 1);
  const envKeep = mix(float(1), mix(float(1), float(SURFACE.envMatte), added), dielectric);
  return direct.mul(mix(float(SURFACE.occlusionFloor), float(1), surface.occlusion))
    .add(lights.environment.mul(envKeep).mul(surface.occlusion));
}
