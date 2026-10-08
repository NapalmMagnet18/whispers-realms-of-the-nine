// Banner Vale referee (scripts/lib/data/battleground.yml). Every hero who arrives joins the smaller team and stands on its base.
// Banners are the placed objects banner-gold / banner-crimson; the referee moves them (home, carried, dropped) and keeps
// place.state.bg = { match, phase, score, carrier, endsAt, winner } that the scoreboards read.
import BG from "../../scripts/lib/data/battleground.yml";
export const cadence = "100ms";
const TEAMS = ["gold", "crimson"];
const other = (t) => (t === "gold" ? "crimson" : "gold");
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function say(ctx, text, color, size) {
  for (const p of ctx.place.players) ctx.emit("damageNumber", { position: { x: p.feetPosition.x, y: p.feetPosition.y + 3, z: p.feetPosition.z }, text, color: color || "#e8d9b5", size: size || 1.3, lifetime: 3 }, { audience: { player: p.id } });
}
function sound(ctx, clip, vol) { ctx.emit("playSound", { clip, volume: vol ?? 0.7 }, { audience: { place: "banner-vale" } }); }
function standAt(ctx, team) { const s = BG.teams[team].stand; const h = ctx.place.terrain.heightAt(s.x, s.z) ?? 3; return { x: s.x, y: h + 0.1, z: s.z }; }
function fresh(ctx, now) {
  return { match: now, phase: "playing", startedAt: now, endsAt: now + BG.matchMin * 60000, score: { gold: 0, crimson: 0 },
    flags: { gold: { at: "home" }, crimson: { at: "home" } }, winner: null };
}
function boards(ctx, bg) {
  const left = Math.max(0, Math.round((bg.endsAt - ctx.now()) / 1000));
  const row = { gold: bg.score.gold, crimson: bg.score.crimson, clock: Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0"),
    goldFlag: bg.flags.gold.at, crimsonFlag: bg.flags.crimson.at, banner: bg.phase === "won" ? (bg.winner ? BG.teams[bg.winner].name + " win!" : "A draw") : "First to " + BG.toWin };
  const key = JSON.stringify(row);
  if (key === lastBoard) return; lastBoard = key;
  for (const b of ctx.query({ tags: ["bg-board"] })) b.state.v = row;
}
let lastBoard = "";
export function tick(ctx) {
  const now = ctx.now(), ps = ctx.place.state;
  if (!ctx.place.playerCount) { if (ps.bg && ps.bg.phase !== "idle") ps.bg = { phase: "idle" }; return; }
  let bg = ps.bg;
  if (!bg || bg.phase === "idle") { bg = ps.bg = fresh(ctx, now); sound(ctx, BG.sounds.horn, 0.8); say(ctx, "The banners are raised. First to " + BG.toWin + "!", "#f2b04a", 1.5); }
  const players = ctx.place.players;
  // join: the smaller team, set on its base
  const count = { gold: 0, crimson: 0 };
  for (const p of players) if (p.state.bgMatch === bg.match && p.state.bgTeam) count[p.state.bgTeam]++;
  for (const p of players) {
    const s = p.state;
    if (!s.characterCreated) continue;
    if (s.bgMatch !== bg.match || !s.bgTeam) {
      const t = count.gold <= count.crimson ? "gold" : "crimson"; count[t]++;
      s.bgTeam = t; s.bgMatch = bg.match; s.pvpShieldUntil = now + 8000;
      const b = BG.teams[t].base; p.feetPosition = { x: b.x + (ctx.random() - 0.5) * 8, y: b.y + 0.5, z: b.z + (ctx.random() - 0.5) * 4 };
      ctx.emit("damageNumber", { position: { x: b.x, y: b.y + 3, z: b.z }, text: "You fight for the " + BG.teams[t].name, color: BG.teams[t].color, size: 1.5, lifetime: 4 }, { audience: { player: p.id } });
      ctx.emit("playSound", { clip: BG.sounds.horn, volume: 0.6 }, { audience: { player: p.id } });
    }
  }
  if (bg.phase === "won") {
    boards(ctx, bg);
    if (now >= bg.homeAt) {
      for (const p of players) { p.state._worldEnterAt = now; p.state.bgTeam = null; try { ctx.cross(p, "+main"); } catch (e) { ctx.log("vale send-home failed", { e: String(e) }); } }
      ps.bg = { phase: "idle" };
    }
    return;
  }
  const byId = new Map(players.map((p) => [p.id, p]));
  const alive = (p) => p && !p.state.dying && (p.state.health ?? 1) > 0 && p.state.bgMatch === bg.match;
  for (const team of TEAMS) {
    const f = bg.flags[team], obj = ctx.getObject("banner-" + team);
    if (f.at === "carried") {
      const c = byId.get(f.by);
      if (!alive(c)) { // the carrier fell or left: the banner drops where they stood
        const at = c ? c.feetPosition : f.pos || standAt(ctx, team);
        bg.flags[team] = { at: "dropped", pos: { x: at.x, y: at.y, z: at.z }, since: now };
        say(ctx, "The " + BG.teams[team].name + " banner is down!", BG.teams[team].color);
        if (obj) obj.feetPosition = { x: at.x, y: at.y, z: at.z };
        continue;
      }
      f.pos = { x: c.feetPosition.x, y: c.feetPosition.y, z: c.feetPosition.z };
      if (obj) obj.feetPosition = { x: f.pos.x - 0.3, y: f.pos.y + 0.4, z: f.pos.z + 0.3 };
      // capture: home with the enemy banner while your own banner stands
      const mine = c.state.bgTeam;
      if (bg.flags[mine].at === "home" && d2(f.pos, BG.teams[mine].stand) < BG.capRadius) {
        bg.score[mine]++; bg.flags[team] = { at: "home" };
        if (obj) obj.feetPosition = standAt(ctx, team);
        c.state.bgCaptures = (c.state.bgCaptures || 0) + 1;
        sound(ctx, BG.sounds.capture, 0.8);
        ctx.emit("shockwave", { position: f.pos, speed: 14, thickness: 2, intensity: 0.6 }, { audience: { place: "banner-vale" } });
        say(ctx, (c.state.charName || "A hero") + " captures the banner! " + bg.score.gold + " : " + bg.score.crimson, BG.teams[mine].color, 1.5);
        if (bg.score[mine] >= BG.toWin) return finish(ctx, bg, mine, players, now);
      }
      continue;
    }
    const pos = f.at === "home" ? standAt(ctx, team) : f.pos;
    if (f.at === "dropped" && now - f.since > BG.dropReturnSec * 1000) {
      bg.flags[team] = { at: "home" }; if (obj) obj.feetPosition = standAt(ctx, team);
      sound(ctx, BG.sounds.ret, 0.6); say(ctx, "The " + BG.teams[team].name + " banner returns home", BG.teams[team].color); continue;
    }
    for (const p of players) {
      if (!alive(p) || d2(p.feetPosition, pos) > BG.grabRadius || Math.abs(p.feetPosition.y - pos.y) > 3) continue;
      if (p.state.bgTeam === team) {
        if (f.at === "dropped") { bg.flags[team] = { at: "home" }; if (obj) obj.feetPosition = standAt(ctx, team); sound(ctx, BG.sounds.ret, 0.6); say(ctx, (p.state.charName || "A hero") + " returns the " + BG.teams[team].name + " banner", BG.teams[team].color); }
        break;
      }
      if (Object.values(bg.flags).some((x) => x.at === "carried" && x.by === p.id)) continue;
      bg.flags[team] = { at: "carried", by: p.id, pos };
      sound(ctx, BG.sounds.grab, 0.8);
      ctx.emit("flash", { target: p.id, color: BG.teams[team].color, duration: 0.4 }, { audience: { place: "banner-vale" } });
      say(ctx, (p.state.charName || "A hero") + " has the " + BG.teams[team].name + " banner!", BG.teams[other(team)].color);
      break;
    }
  }
  if (now >= bg.endsAt) { const w = bg.score.gold === bg.score.crimson ? null : bg.score.gold > bg.score.crimson ? "gold" : "crimson"; return finish(ctx, bg, w, players, now); }
  boards(ctx, bg);
}
function finish(ctx, bg, winner, players, now) {
  bg.phase = "won"; bg.winner = winner; bg.homeAt = now + BG.endHoldSec * 1000;
  for (const t of TEAMS) { bg.flags[t] = { at: "home" }; const o = ctx.getObject("banner-" + t); if (o) o.feetPosition = standAt(ctx, t); }
  sound(ctx, BG.sounds.win, 0.9);
  ctx.emit("slowMo", { scale: 0.4, duration: 1.2 }, { audience: { place: "banner-vale" } });
  for (const p of players) {
    const s = p.state; if (s.bgMatch !== bg.match) continue;
    const won = winner && s.bgTeam === winner;
    const cu = won ? BG.reward.win : BG.reward.loss;
    s.copper = (Number(s.copper) || 0) + cu; s.honor = (s.honor || 0) + (won ? BG.reward.honorWin : BG.reward.honorLoss); s._questSave = true;
    ctx.emit("screenFlash", { color: won ? "#f2b04a" : "#5a2a22", duration: 1, intensity: 0.4 }, { audience: { player: p.id } });
    ctx.emit("damageNumber", { position: { x: p.feetPosition.x, y: p.feetPosition.y + 3, z: p.feetPosition.z }, text: winner ? (won ? "VICTORY" : "DEFEAT") + "  +" + (won ? BG.reward.honorWin : BG.reward.honorLoss) + " Honor" : "DRAW  +" + BG.reward.honorLoss + " Honor", color: won ? "#f2b04a" : "#e8d9b5", size: 2.2, lifetime: 6 }, { audience: { player: p.id } });
  }
  ctx.emit("milestone", { step: 1, name: "finished a Banner Vale match" }, { audience: { place: "banner-vale" } });
  boards(ctx, bg);
}
