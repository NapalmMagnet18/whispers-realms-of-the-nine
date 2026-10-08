// The trees' look: one material per kind (params.kind), worn by every scripts/gen/tree.js tree. Bark faces (uv.x < 5)
// sample the creator's painted bark with its normal map; leaf cards (uv.x >= 10) sample the kind's painted cluster
// colour, cut by its mask (alphaTest), lifted by `leafGain`. Vertex colour (the geometry's tint) shades both.
import { uv, vec2, vec3, mix, step, normalMap, normalView, vertexColor, float, Fn, Discard } from "builtin/tsl";
import { MeshStandardNodeMaterial, DoubleSide } from "builtin/three";
const KINDS = {
  pine:      { bark: "/cdn/bark-normaltree-u9xpx2wlu.webp", normal: "/cdn/bark-normaltree-normal-u8iiw3l01.webp", leaf: "/cdn/leaf-pine-c-u2al2ck9b.webp", mask: "/cdn/leaf-pine-u9tw3bqgj.webp", gain: 1.7 },
  giantpine: { bark: "/cdn/bark-normaltree-u9xpx2wlu.webp", normal: "/cdn/bark-normaltree-normal-u8iiw3l01.webp", leaf: "/cdn/leaves-giantpine-c-u1ohevj1u.webp", mask: null, gain: 1.25 },
  oak:       { bark: "/cdn/bark-normaltree-u9xpx2wlu.webp", normal: "/cdn/bark-normaltree-normal-u8iiw3l01.webp", leaf: "/cdn/leaves-normaltree-c-u72woe53u.webp", mask: "/cdn/leaves-normaltree-u4fwh58hi.webp", gain: 1.15 },
  twisted:   { bark: "/cdn/bark-twistedtree-u37sw9e2o.webp", normal: "/cdn/bark-twistedtree-normal-u576v4lop.webp", leaf: "/cdn/leaves-twistedtree-c-u6cxjzkk5.webp", mask: "/cdn/leaves-twistedtree-u6n6yq55h.webp", gain: 1.1 },
  dead:      { bark: "/cdn/bark-deadtree-u2s9hxqea.webp", normal: "/cdn/bark-deadtree-normal-u0xjdcje6.webp", leaf: null, mask: null, gain: 1 },
};
export function material(ctx) {
  const K = KINDS[ctx.params?.kind] || KINDS.pine;
  const m = new MeshStandardNodeMaterial();
  m.side = DoubleSide;
  const tint = vertexColor().rgb;
  const barkTex = ctx.texture(ctx.params?.bark || K.bark);
  const barkUV = uv();
  const barkCol = barkTex.sample(barkUV).rgb;
  const nrm = normalMap(ctx.texture(K.normal).sample(barkUV), vec2(1.2, 1.2));
  if (!K.leaf) {
    m.colorNode = barkCol.mul(tint);
    m.normalNode = nrm;
    m.roughness = 0.95;
    return m;
  }
  const isLeaf = step(5.0, uv().x);
  const leafUV = vec2(uv().x.fract(), uv().y.fract());
  const leaf = ctx.texture(K.leaf).sample(leafUV);
  const cut = K.mask ? ctx.texture(K.mask).sample(leafUV).r : leaf.a;
  const leafCol = leaf.rgb.mul(ctx.param("leafGain", K.gain));
  const body = mix(barkCol, leafCol, isLeaf).mul(tint);
  const keep = mix(float(1), cut, isLeaf);
  // the card is cut where its mask is dark: an explicit discard, so the cut holds on every renderer
  m.colorNode = Fn(() => { Discard(keep.lessThan(0.45)); return body; })();
  m.normalNode = mix(nrm, normalView, isLeaf);
  m.roughnessNode = mix(float(0.95), float(0.75), isLeaf);
  return m;
}
