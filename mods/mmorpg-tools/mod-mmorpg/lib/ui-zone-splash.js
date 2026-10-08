// "Now Entering" splash (creator's painted zone art, 2026-10-08). Drawn by ui.js every frame from the local player's position:
// - the first moment in the world (Enter World / creation): the region's art full-screen, held 1.2 s, faded out by 3.6 s
// - walking into another painted region: the same art as a framed card, top-centre, for 4.5 s
// Never blocks play (pointer-events none). Region shapes mirror scripts/lib/regions.js (circles first, then the broad bands).
var ART = {
  reach: '/cdn/chatgpt-image-oct-7-2026-09-54-03-pm-1-u5u429bhl.webp',
  briarwild: '/cdn/chatgpt-image-oct-7-2026-09-54-04-pm-2-u6195ot7r.webp',
  hollowcrypt: '/cdn/chatgpt-image-oct-7-2026-09-54-04-pm-3-u95wrtxa4.webp',
  sorrowfen: '/cdn/chatgpt-image-oct-7-2026-09-54-05-pm-4-u2rtupzkq.webp',
  emberstone: '/cdn/chatgpt-image-oct-7-2026-09-54-06-pm-5-u50038dxi.webp',
  velthraen: '/cdn/chatgpt-image-oct-7-2026-09-54-07-pm-6-u3fwls0tp.webp',
  ninthveil: '/cdn/chatgpt-image-oct-7-2026-09-54-07-pm-7-u6hx0nqke.webp',
};
// region → art; a region missing here shows no card when walked into (the realm-wide Ninth Veil greets those on arrival)
var CIRCLES = [
  { art: 'reach', x: 0, z: 0, r: 70 },
  { art: 'briarwild', x: -720, z: 70, r: 60 },      // Thornhollow
  { art: 'emberstone', x: 900, z: -170, r: 60 },    // Cinderhold
  { art: 'emberstone', x: 135, z: 30, r: 80 },      // Emberstone Quarry
  { art: 'ninthveil', x: 30, z: -360, r: 90 },      // The Old Spire
  { art: 'hollowcrypt', x: 1350, z: -700, r: 330 },
  { art: 'sorrowfen', x: -1300, z: 950, r: 520 },
];
function artAt(x, z) {
  for (var i = 0; i < CIRCLES.length; i++) { var c = CIRCLES[i]; if (Math.hypot(x - c.x, z - c.z) < c.r) return c.art; }
  if (z < -6400) return 'ninthveil';             // the Ninth Veil
  if (x < -3000) return 'velthraen';            // Elderveil Wilds, the World-Tree
  if (z < -800) return null;                    // Greyspine: no painting yet
  if (x > 650) return 'emberstone';             // Emberstone Highlands
  if (x < -60 && Math.abs(z) < 420) return 'briarwild';
  return null;
}
var _cur = null, _shown = {}, _splash = null, _first = true, _since = 0;
var HOLD_FULL = 2200, END_FULL = 4800, END_CARD = 4500, REPEAT = 180000;

export function renderZoneSplash(localPlayer) {
  var fp = localPlayer.feetPosition; if (!fp) return '';
  if (localPlayer.state && localPlayer.state.flying) return ''; // on the wing: the card waits for the landing
  var now = typeof performance !== 'undefined' ? performance.now() : 0;
  if (!_since) _since = now || 1;
  if (_first && now - _since < 350) return ''; // the body settles at its destination first
  var a = artAt(fp.x, fp.z);
  if (_first) {
    _first = false; _cur = a;
    _splash = { art: a || 'ninthveil', t0: now, full: true }; _shown[_splash.art] = now;
  } else if (a !== _cur) {
    _cur = a;
    if (a && (!_shown[a] || now - _shown[a] > REPEAT)) { _splash = { art: a, t0: now, full: false }; _shown[a] = now; }
  }
  if (!_splash) return '';
  var t = now - _splash.t0, src = ART[_splash.art];
  if (_splash.full) {
    if (t > END_FULL) { _splash = null; return ''; }
    var op = t < HOLD_FULL ? 1 : Math.max(0, 1 - (t - HOLD_FULL) / (END_FULL - HOLD_FULL));
    return '<div style="position:fixed;inset:0;z-index:900;pointer-events:none;background:#000;opacity:' + op.toFixed(3) + '">'
      + '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;display:block" /></div>';
  }
  if (t > END_CARD) { _splash = null; return ''; }
  var o = t < 400 ? t / 400 : t > END_CARD - 900 ? Math.max(0, (END_CARD - t) / 900) : 1;
  var y = t < 400 ? (1 - t / 400) * -14 : 0;
  return '<div style="position:fixed;top:72px;left:50%;z-index:880;pointer-events:none;width:min(46vw,720px);aspect-ratio:1672/941;'
    + 'transform:translate(-50%,' + y.toFixed(1) + 'px);opacity:' + o.toFixed(3) + ';box-shadow:0 0 0 2px #c9a46a,0 0 0 5px #2a1e16,0 0 0 6px #6b4a2f,0 18px 40px rgba(0,0,0,.65)">'
    + '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;display:block" /></div>';
}
export function resetZoneSplash() { _first = true; _splash = null; _cur = null; _since = 0; }
export function zoneSplashActive() { return !!_splash; }
export function zoneArtFor(x, z) { return ART[artAt(x, z) || 'ninthveil']; }
module.exports = { renderZoneSplash: renderZoneSplash, resetZoneSplash: resetZoneSplash, zoneSplashActive: zoneSplashActive, zoneArtFor: zoneArtFor };
