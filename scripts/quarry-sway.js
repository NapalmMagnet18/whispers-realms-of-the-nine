// A hanging thing sways on its rope: state.sway = degrees either side (default 2.5), state.period = seconds a swing.
import { animate } from "builtin/tween";
export function onSpawn(ctx) {
  const a = ctx.self.state?.sway ?? 2.5;
  animate(ctx, ctx.self, { "rotation.roll": [-a, a] }, { duration: ctx.self.state?.period ?? 3.4, easing: "easeInOutSine", direction: "alternate", loop: true });
}
