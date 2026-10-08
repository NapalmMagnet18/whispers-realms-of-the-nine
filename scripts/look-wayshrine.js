// The Wayshrine's look (character select / create): warm lantern grade, a deep blue-brown vignette, soft bloom on the gold.
import { grade, vignette, grain } from 'builtin/postfx';
export function look(ctx) {
  const bloomStrength = ctx.param('bloomStrength', 0.38);
  const bloomRadius = ctx.param('bloomRadius', 0.65);
  const bloomThreshold = ctx.param('bloomThreshold', 0.9);
  let c = ctx.scene;
  c = grade(c, { exposure: ctx.param('exposure', 1.1), saturation: 1.06, contrast: 1.06, temperature: 0.05 });
  c = vignette(c, ctx.param('vignette', 0.3), { color: [0.06, 0.04, 0.07] });
  c = grain(c, 0.022);
  return c;
}
