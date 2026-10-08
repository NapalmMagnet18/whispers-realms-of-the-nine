// Windmill sails turn slowly, forever; one tween everyone sees.
import { animate } from "builtin/tween";
export function onSpawn(ctx) {
  animate(ctx, ctx.self, { "rotation.roll": "+=360" }, { duration: 24, loop: true, easing: "linear" });
}
