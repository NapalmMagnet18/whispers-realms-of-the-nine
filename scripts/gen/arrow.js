// A kit missile's body, nose along −Z, centred on its origin. params.shape: "arrow" (oak shaft, iron head, red fletching) | "shard" (a glowing ice crystal).
import { boxR, triN } from './shape.js'
export function geometry(ctx) {
  ctx.flat()
  const shape = ctx.params?.shape || 'arrow'
  if (shape === 'shard') {
    ctx.color('oklch(0.88 0.06 230)'); ctx.emissive(0.9, 1.5, 2.4); ctx.roughness(0.15)
    const tip = [0, 0, -0.38], tail = [0, 0, 0.22], N = 6, R = []
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; R.push([Math.cos(a) * 0.075 * (i % 2 ? 0.7 : 1), Math.sin(a) * 0.075 * (i % 2 ? 0.7 : 1), -0.04]) }
    for (let i = 0; i < N; i++) { const a = R[i], b = R[(i + 1) % N], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
      triN(ctx, tip, a, b, [mx, my, -0.3]); triN(ctx, tail, a, b, [mx, my, 0.3]) }
    ctx.emissive(null)
    return
  }
  ctx.color('oklch(0.45 0.06 60)'); ctx.roughness(0.8)
  boxR(ctx, [0, 0, 0.02], [0.022, 0.022, 0.72])
  ctx.color('oklch(0.55 0.01 250)'); ctx.metalness(0.8); ctx.roughness(0.35)
  const t = [0, 0, -0.42], z = -0.32, w = 0.032, B = [[-w, 0, z], [0, w, z], [w, 0, z], [0, -w, z]]
  for (let i = 0; i < 4; i++) { const a = B[i], b = B[(i + 1) % 4]; triN(ctx, t, a, b, [(a[0] + b[0]), (a[1] + b[1]), -0.2]) }
  triN(ctx, B[0], B[1], B[2], [0, 0, 1]); triN(ctx, B[0], B[2], B[3], [0, 0, 1])
  ctx.metalness(0); ctx.color('oklch(0.45 0.13 30)'); ctx.roughness(0.9)
  boxR(ctx, [0, 0, 0.3], [0.11, 0.004, 0.11]); boxR(ctx, [0, 0, 0.3], [0.004, 0.11, 0.11])
}
