// A gryphon on the wing, carrying its rider from roost to roost. The whole flight is a function of the room clock
// (state.t0, state.dur), so wherever it simulates it sits at the same point; at the end it sets the rider down and is gone.
function sstep(t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); }
export function at(s, t) {
  const k = Math.min(1, Math.max(0, t));
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease in, ease out along the track
  const dx = s.bx - s.ax, dz = s.bz - s.az, L = Math.hypot(dx, dz) || 1;
  const sway = Math.sin(e * Math.PI) * Math.min(260, L * 0.08) * (s.side || 1);
  const x = s.ax + dx * e + (-dz / L) * sway, z = s.az + dz * e + (dx / L) * sway;
  const up = sstep(k / s.climb), down = sstep((1 - k) / s.climb);
  const y = k < 0.5 ? s.ay + (s.cruise - s.ay) * up : s.by + (s.cruise - s.by) * down;
  return { x, y, z };
}
export function update(ctx) {
  const s = ctx.self.state;
  if (!s || !s.t0) return;
  const t = (ctx.now() - s.t0) / (s.dur * 1000);
  if (t >= 1) {
    const r = s.rider && ctx.getObject(s.rider);
    if (r) {
      if (r.parent) r.parent = null;
      r.feetPosition = { x: s.bx, y: s.by + 1.2, z: s.bz };
      r.velocity = { x: 0, y: 0, z: 0 };
      r.state.flying = null;
      r.state.flightLanded = { name: s.destName, at: ctx.now() };
      ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-gryphon-wings-landing-flap.mp3', position: r.feetPosition, volume: 0.6 }, { audience: { player: r.id } });
    }
    ctx.destroy(ctx.self.id);
    return;
  }
  const p = at(s, t), q = at(s, Math.min(1, t + 0.004));
  ctx.self.feetPosition = p;
  const yaw = Math.atan2(-(q.x - p.x), -(q.z - p.z)) * 180 / Math.PI;
  const pitch = Math.atan2(q.y - p.y, Math.hypot(q.x - p.x, q.z - p.z) || 1) * 180 / Math.PI;
  ctx.self.rotation = { yaw, pitch: Math.max(-25, Math.min(25, pitch)), roll: Math.sin(ctx.now() / 1400) * 6 };
}
