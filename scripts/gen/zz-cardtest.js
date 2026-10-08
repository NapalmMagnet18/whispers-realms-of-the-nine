export function geometry(ctx) {
  ctx.albedo("/cdn/leaf-pine-c-u2al2ck9b.webp");
  ctx.quad(-1, 0, 0, 1, 0, 0, 1, 2, 0, -1, 2, 0);
  ctx.albedo("/cdn/bark-twistedtree-u37sw9e2o.webp");
  ctx.quad(1.2, 0, 0, 3.2, 0, 0, 3.2, 2, 0, 1.2, 2, 0);
  return { uvs: [0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1] };
}
