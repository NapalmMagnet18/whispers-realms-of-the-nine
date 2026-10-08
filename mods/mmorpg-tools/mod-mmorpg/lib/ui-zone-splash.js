// "Now Entering" splash (creator's painted zone art, 2026-10-08). Drawn by ui.js every frame from the local player's position:
// - the first moment in the world (Enter World / creation): the region's art full-screen, held 1.2 s, faded out by 3.6 s
// - walking into another painted region: the same art as a framed card, top-centre, for 4.5 s
// Never blocks play (pointer-events none). Region shapes mirror scripts/lib/regions.js (circles first, then the broad bands).
var ART = {
  reach: ['/cdn/00-key-art-u4k2ellba.webp', '/cdn/chatgpt-image-oct-7-2026-09-54-03-pm-1-u5u429bhl.webp'],
  briarwild: ['/cdn/04-briarwild-loading-u2dtrlb01.webp'],
  deepwood: ['/cdn/04-briarwild-loading-u2dtrlb01.webp', '/cdn/chatgpt-image-oct-7-2026-10-01-09-pm-2-u43sdvpt1.webp'],
  hollowcrypt: ['/cdn/05-hollowcrypt-loading-u4vyudn4f.webp'],
  sorrowfen: ['/cdn/06-sorrowfen-loading-u1aqmb6c3.webp'],
  tideglass: ['/cdn/value.48a63d4ebcc3070c23694e1f3497fc42e954e87a15d077f3e3755e10f52930d2.png'],
  emberstone: ['/cdn/07-emberstone-loading-u7mciofoy.webp'],
  ashfall: ['/cdn/07-emberstone-loading-u7mciofoy.webp'],
  saltmere: ['/cdn/chatgpt-image-oct-7-2026-10-01-08-pm-1-u11atau6r.webp'],
  velthraen: ['/cdn/08-velthraen-loading-u09qyl6yt.webp'],
  spire: ['/cdn/chatgpt-image-oct-7-2026-10-01-12-pm-6-u7md0wibr.webp', '/cdn/chatgpt-image-oct-7-2026-09-54-07-pm-7-u6hx0nqke.webp'],
  ninthveil: ['/cdn/09-ninth-veil-loading-u8xh7ka90.webp'],
};
var _pick = 0;
function srcOf(k) { var a = ART[k] || ART.ninthveil; return a[(_pick++) % a.length]; }
// region → art; a region missing here shows no card when walked into (the realm-wide Ninth Veil greets those on arrival)
var CIRCLES = [
  { art: 'reach', x: 0, z: 0, r: 70 },
  { art: 'briarwild', x: -720, z: 70, r: 60 },      // Thornhollow
  { art: 'sorrowfen', x: -430, z: 560, r: 60 },     // Reedhaven Refuge (Reedbound)
  { art: 'spire', x: -200, z: -1100, r: 60 },       // Starfall Eyrie (Veylori)
  { art: 'emberstone', x: 900, z: -170, r: 60 },    // Cinderhold
  { art: 'emberstone', x: 135, z: 30, r: 80 },      // Emberstone Quarry
  { art: 'spire', x: 30, z: -360, r: 90 },          // The Old Spire
  { art: 'saltmere', x: 250, z: 1430, r: 60 },      // Gullrest
  { art: 'saltmere', x: 300, z: 1650, r: 420 },     // Saltmere Coast
  { art: 'hollowcrypt', x: 1350, z: -700, r: 330 },
  { art: 'tideglass', x: -1000, z: 1920, r: 340 },
  { art: 'sorrowfen', x: -1300, z: 950, r: 520 },
  { art: 'velthraen', x: -3540, z: -20, r: 320 },     // Velthraen Reach (31-38)
  { art: 'ashfall', x: 7560, z: -170, r: 260 },       // Emberstone Bastion (38-45)
];
function artAt(x, z) {
  for (var i = 0; i < CIRCLES.length; i++) { var c = CIRCLES[i]; if (Math.hypot(x - c.x, z - c.z) < c.r) return c.art; }
  if (z < -6400) return 'ninthveil';             // the Ninth Veil
  if (x > 6400) return 'ashfall';               // Ashfall Reaches, Emberstone Bastion
  if (x < -3000) return 'velthraen';            // Elderveil Wilds, the World-Tree
  if (z < -800) return null;                    // Greyspine: no painting yet
  if (x > 650) return 'emberstone';             // Emberstone Highlands
  if (x < -500) return 'deepwood';              // Briarwild Deepwood
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
    _splash = { art: a || 'ninthveil', t0: now, full: true }; _splash.src = srcOf(_splash.art); _shown[_splash.art] = now;
  } else if (a !== _cur) {
    _cur = a;
    if (a && (!_shown[a] || now - _shown[a] > REPEAT)) { _splash = { art: a, t0: now, full: false, src: srcOf(a) }; _shown[a] = now; }
  }
  if (!_splash) return '';
  var t = now - _splash.t0, src = _splash.src;
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
export function zoneArtFor(x, z) { return srcOf(artAt(x, z) || 'ninthveil'); }
module.exports = { renderZoneSplash: renderZoneSplash, resetZoneSplash: resetZoneSplash, zoneSplashActive: zoneSplashActive, zoneArtFor: zoneArtFor };
