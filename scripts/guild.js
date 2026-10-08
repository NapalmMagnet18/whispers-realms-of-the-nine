// On every player's body: a thin stub. The guild system (scripts/lib/guild-core.js: SQL guilds, roster, invites,
// the shared guild vault) loads on first need: a guild action pressed, or a hero who already wears a guild tag.
const ACTS = ['createGuild', 'confirmJoinGuild', 'guildAcceptInvite', 'guildDeclineInvite', 'leaveGuild', 'guildLeave', 'guildKick', 'guildInvite',
  'openGuildJoin', 'closeGuildJoin', 'closeGuildPanel', 'toggleGuildInviteInput', 'toggleGuildCreation', 'bankTab', 'guildVaultDeposit', 'guildVaultWithdraw'];
const MNS = 'mmorpg-tools:';
let core = null, loading = null;
const load = () => core ? Promise.resolve(core) : (loading = loading || import('./lib/guild-core.js').then((m) => (core = m)));
function hit(input) {
  for (const a of ACTS) for (const n of [a, MNS + a]) if ((input.pressed && input.pressed[n]) || (input.actions && input.actions[n])) return true;
  return false;
}
export function onInput(ctx, input) {
  if (core) return core.onInput(ctx, input);
  if (!hit(input)) return;
  const copy = { pressed: { ...(input.pressed || {}) }, actions: { ...(input.actions || {}) }, actionData: { ...(input.actionData || {}) } };
  load().then((m) => m.onInput(ctx, copy)).catch((e) => ctx.log('guild load failed', String(e && e.message || e)));
}
export const updateSchedule = { every: { seconds: 2 } };
export function update(ctx) {
  if (!ctx.self.state.guildName && !ctx.self.state.pendingGuildInvite) return;
  if (core) return core.update(ctx);
  load().catch(() => {});
}
