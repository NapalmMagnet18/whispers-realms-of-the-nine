// temporary uv probe: deleted after one look
export function geometry(ctx) {
  const uvs = [];
  if (ctx.params?.mode === "tri") {
    ctx.tri(-1, 0, 0, 1, 0, 0, 1, 2, 0); uvs.push(10.004, 0.004, 10.996, 0.004, 10.996, 0.996);
    ctx.tri(-1, 0, 0, 1, 2, 0, -1, 2, 0); uvs.push(10.004, 0.004, 10.996, 0.996, 10.004, 0.996);
  } else { ctx.quad(-1, 0, 0, 1, 0, 0, 1, 2, 0, -1, 2, 0); uvs.push(10.004, 0.004, 10.996, 0.004, 10.996, 0.996, 10.004, 0.996); }
  return { uvs };
}
