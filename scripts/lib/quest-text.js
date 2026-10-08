// Quest dialogue (text, progressText, turnInText, doneText, refusedText) lives in data/quest-text.yml, off the boot:
// warm() import()s it once after the body stands; qt(id, field) reads it, '' until it lands (a second at most).
let T = null, pending = null;
export function warm() {
  if (T || pending) return;
  pending = import('./data/quest-text.yml').then((m) => { T = (m && m.default) || m || {}; }, () => { pending = null; });
}
export function qt(id, field) { warm(); return (T && T[id] && T[id][field]) || ''; }
export function withText(q) { if (!q) return q; warm(); const t = T && T[q.id]; return t ? { ...q, ...t } : q; }
