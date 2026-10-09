// Talent trees: one per discipline, three specializations each, four tiers (3 · 2 · 3 · 2 choices), one pick per tier.
// A point comes every 5 levels (12 by 60): exactly one pick in every tier of every spec at cap.
// fx are percentages: power = more damage on every hit (scripts/lib/kit.js power), haste = shorter cooldowns
// (each class core), health = more max health (scripts/quest-player.js). Picks live on state.unlockedTalents as { "spec:tier": index }.
const ICONS = {"ar-aether": "/cdn/value.e0f9751be5d7d4a1f32e22b8082363f479459704fddd72238665497859132e1f.png", "ar-ember": "/cdn/value.00facb3ba4f4841d70cb1f12c216a10c0462f6599eed10df47967783432aa6bd.png", "ar-rime": "/cdn/value.e49ad456a59f0f2466f25bf1b2a83a4596c901df53916160449325fcfe357417.png", "pf-briarward": "/cdn/value.8a856af99ba04515801a2006c4a786249236efaeb5e8fe58dd51cb686cbf14fe.png", "pf-marksman": "/cdn/value.4b1a000f9d7ebd751d672d9e49bdb7e50f428f7c6201d444eca11e3defdf4b22.png", "pf-wildrunner": "/cdn/value.54c8b26ada89bd00ddbd434adf1087b7b0de368a9216416c43ba972dcf12fb7a.png", "sh-duskwalker": "/cdn/value.af64d5e4100e524aa02f1aee0c2184cb42c4d03dba8687fdaf982f05499778a2.png", "sh-nightblade": "/cdn/value.35bfb1fd9b0ee6e4075124232ec0992ba88ffd9dca08075575ecf531fb36755e.png", "sh-veilborn": "/cdn/value.40211787d6fe1cf0f4bf1242c01b00999efbbae3741602d1cfe67a12c00659bd.png", "vg-bulwark": "/cdn/value.1753fd313a7bde2b0026540b9806b78645d36f16533b7328e2bd65c966bff47f.png", "vg-lanternguard": "/cdn/value.26613e01da8d428b5718d3334eb04b67ff5d527e95ad04bc847c09a46d8632a5.png", "vg-warbringer": "/cdn/value.7dfc90b430d03c51976dfc7a4e1d59843959376c6ef82b2705b34a0d1c7f8093.png"};
const I = (k) => ICONS[k];
const T = (name, flavor, fx) => ({ name, flavor, fx });
export const TREES = {
  vanguard: [
    { id: 'bulwark', name: 'Bulwark', color: '#c9a46a', icon: I('vg-bulwark'), tiers: [
      [T('Iron Hide', 'Plate worn thin by a hundred winters.', { health: 4 }), T('Braced Stance', 'Feet wide, shield high.', { health: 3, haste: 2 }), T('Scarred Veteran', 'Every scar a lesson.', { health: 2, power: 2 })],
      [T('Unbroken', 'The line holds while you stand.', { health: 6 }), T('Shieldwall Rhythm', 'Raise, strike, raise.', { haste: 4, health: 2 })],
      [T('Stone in the Ford', 'The river parts around you.', { health: 7 }), T('Tempered Plate', 'Forged twice, quenched in oil.', { health: 5, power: 2 }), T('Bastion\'s Patience', 'Wait for the opening.', { haste: 5 })],
      [T('Last Wall of the March', 'Nothing passes.', { health: 10, power: 2 }), T('Lantern Oath', 'You swore to keep the light.', { health: 7, haste: 4 })] ] },
    { id: 'warbringer', name: 'Warbringer', color: '#e0623a', icon: I('vg-warbringer'), tiers: [
      [T('Keen Edge', 'A whetstone every night.', { power: 4 }), T('Battle Hunger', 'The fight feeds you.', { power: 3, health: 2 }), T('Quick Blade', 'Strike before they think.', { haste: 3, power: 1 })],
      [T('Cleaving Arc', 'One swing, three throats.', { power: 6 }), T('Relentless', 'Never stop moving forward.', { power: 3, haste: 3 })],
      [T('Bloodied Steel', 'It remembers every cut.', { power: 7 }), T('Warcry', 'Your voice shakes the crows loose.', { power: 4, haste: 3 }), T('Executioner', 'Finish what you start.', { power: 5, health: 2 })],
      [T('Wrath of the Reach', 'The Reach answers with fire.', { power: 10 }), T('Unending War', 'Peace was never yours.', { power: 7, haste: 4 })] ] },
    { id: 'lanternguard', name: 'Lanternguard', color: '#f2b04a', icon: I('vg-lanternguard'), tiers: [
      [T('Watchful', 'Eyes on the treeline.', { haste: 4 }), T('Warm Hearth', 'You carry home with you.', { health: 3, haste: 1 }), T('Lit Wick', 'A small flame, steady.', { power: 2, haste: 2 })],
      [T('Night Patrol', 'Long roads, short rests.', { haste: 6 }), T('Ember Shield', 'Light burns those who strike it.', { haste: 3, power: 3 })],
      [T('Guiding Flame', 'Others follow your light.', { haste: 7 }), T('Kindled Blood', 'Your veins run warm.', { haste: 4, health: 4 }), T('Burning Vigil', 'You do not sleep.', { haste: 3, power: 4 })],
      [T('Undying Lantern', 'The flame outlives the keeper.', { haste: 9, health: 3 }), T('Dawnbringer', 'Every night ends with you.', { haste: 6, power: 5 })] ] },
  ],
  arcanist: [
    { id: 'ember', name: 'Ember', color: '#ff8a3a', icon: I('ar-ember'), tiers: [
      [T('Kindling', 'Every spell starts small.', { power: 4 }), T('Ash Breath', 'Smoke follows your words.', { power: 3, haste: 1 }), T('Coal Heart', 'Warm under the robes.', { power: 2, health: 3 })],
      [T('Searing Bolts', 'Your Firebolt burns hotter.', { power: 6 }), T('Fanned Flames', 'Quick casts, quick fire.', { power: 3, haste: 3 })],
      [T('Pyre Mind', 'Thoughts like wildfire.', { power: 7 }), T('Cinder Storm', 'Embers rain on the wicked.', { power: 5, haste: 2 }), T('Flameborn', 'Fire will not take you.', { power: 4, health: 4 })],
      [T('Heart of the Inferno', 'You are the fire now.', { power: 11 }), T('Phoenix Rite', 'Burn, fall, rise.', { power: 6, health: 6 })] ] },
    { id: 'rime', name: 'Rime', color: '#8fd0ff', icon: I('ar-rime'), tiers: [
      [T('Cold Focus', 'Calm as a frozen pond.', { haste: 4 }), T('Frostbitten', 'The chill lingers in them.', { power: 3, haste: 1 }), T('Winter Coat', 'You stopped feeling the cold.', { health: 4 })],
      [T('Shatterpoint', 'Ice breaks where you strike.', { power: 4, haste: 2 }), T('Quick Frost', 'Shards come faster.', { haste: 6 })],
      [T('Glacial Mind', 'Slow the world, not yourself.', { haste: 7 }), T('Hoarfrost', 'Frost grows on every hit.', { power: 5, haste: 2 }), T('Ice Veins', 'Blood like meltwater.', { health: 5, haste: 2 })],
      [T('Eternal Winter', 'The March remembers the long frost.', { haste: 10, power: 2 }), T('Crown of Rime', 'A circlet that never melts.', { power: 6, haste: 6 })] ] },
    { id: 'aether', name: 'Aether', color: '#b08cff', icon: I('ar-aether'), tiers: [
      [T('Warded Mind', 'A rune drawn on every breath.', { health: 4 }), T('Ley Touched', 'You hear the lines hum.', { haste: 2, power: 2 }), T('Glyphwork', 'Neat letters, sharp spells.', { power: 3, health: 1 })],
      [T('Thick Ward', 'Your Ward drinks more harm.', { health: 6 }), T('Arcane Tempo', 'Spells flow in measure.', { haste: 4, power: 2 })],
      [T('Starlit Shell', 'A skin of quiet light.', { health: 7 }), T('Spellweave', 'Each cast threads the next.', { haste: 4, power: 3 }), T('Resonance', 'Magic answers magic.', { power: 5, health: 2 })],
      [T('Archmage\'s Aegis', 'Nothing reaches you unasked.', { health: 9, haste: 3 }), T('Nine-fold Sigil', 'The old circles turn for you.', { power: 6, health: 5 })] ] },
  ],
  pathfinder: [
    { id: 'marksman', name: 'Marksman', color: '#e8d9b5', icon: I('pf-marksman'), tiers: [
      [T('Steady Aim', 'Breathe out, then loose.', { power: 4 }), T('Fletcher\'s Eye', 'Straight shafts fly true.', { power: 3, haste: 1 }), T('Long Draw', 'Pull to the cheek.', { power: 2, health: 2 })],
      [T('Broadheads', 'Wider cuts, deeper wounds.', { power: 6 }), T('Swift Nock', 'The next arrow is already there.', { power: 3, haste: 3 })],
      [T('Heartseeker', 'You never miss what matters.', { power: 7 }), T('Barrage', 'Volley after volley.', { power: 4, haste: 3 }), T('Hunter\'s Mark', 'Marked prey bleeds more.', { power: 5, health: 2 })],
      [T('Deadeye', 'One arrow, one end.', { power: 11 }), T('Storm of Shafts', 'The sky goes dark with them.', { power: 7, haste: 4 })] ] },
    { id: 'wildrunner', name: 'Wildrunner', color: '#8fcf6a', icon: I('pf-wildrunner'), tiers: [
      [T('Light Feet', 'Leaves do not stir.', { haste: 4 }), T('Trail Sense', 'You read the ground.', { haste: 2, power: 2 }), T('Lean and Hard', 'The road keeps you thin.', { health: 3, haste: 1 })],
      [T('Quick Roll', 'Tumble and up again.', { haste: 6 }), T('Running Shot', 'Loose without stopping.', { haste: 3, power: 3 })],
      [T('Wind at Your Back', 'The March pushes you on.', { haste: 7 }), T('Stag\'s Heart', 'Run all day.', { haste: 4, health: 4 }), T('Hit and Fade', 'Strike, then be gone.', { haste: 4, power: 3 })],
      [T('Untouchable', 'They grasp at air.', { haste: 10, health: 2 }), T('Wild Hunt', 'The pack runs with you.', { haste: 6, power: 6 })] ] },
    { id: 'briarward', name: 'Briarward', color: '#6b8a3a', icon: I('pf-briarward'), tiers: [
      [T('Bark Skin', 'Tough as an old oak.', { health: 4 }), T('Thorn Tips', 'Arrows dipped in briar sap.', { power: 3, health: 1 }), T('Forest Breath', 'Pine air heals.', { health: 3, haste: 1 })],
      [T('Rooted', 'Hard to move, hard to fell.', { health: 6 }), T('Bramble Snare', 'The briar holds them.', { power: 3, haste: 3 })],
      [T('Heartwood', 'Grown slow, grown strong.', { health: 7 }), T('Briar Fletching', 'Thorns that bite twice.', { power: 5, health: 2 }), T('Green Patience', 'The forest waits with you.', { haste: 5, health: 2 })],
      [T('Warden of Briarwild', 'The woods know your name.', { health: 9, power: 3 }), T('Thornheart', 'Hurt you and bleed.', { health: 6, power: 6 })] ] },
  ],
  shade: [
    { id: 'nightblade', name: 'Nightblade', color: '#c04050', icon: I('sh-nightblade'), tiers: [
      [T('Honed Dagger', 'Thin as a whisper.', { power: 4 }), T('Cruel Angle', 'Between the ribs.', { power: 3, haste: 1 }), T('Cold Blood', 'Your heart never races.', { power: 2, health: 2 })],
      [T('Ambusher', 'The first strike is the last.', { power: 6 }), T('Flurry', 'Three cuts in a breath.', { power: 3, haste: 3 })],
      [T('Assassin\'s Art', 'Death as a craft.', { power: 7 }), T('Venom Edge', 'The wound keeps working.', { power: 5, haste: 2 }), T('Red Harvest', 'You leave nothing standing.', { power: 5, health: 2 })],
      [T('Hand of the Ninth', 'The old order\'s last blade.', { power: 11 }), T('Thousand Cuts', 'None of them deep. All of them.', { power: 7, haste: 4 })] ] },
    { id: 'duskwalker', name: 'Duskwalker', color: '#7a6aa8', icon: I('sh-duskwalker'), tiers: [
      [T('Soft Step', 'Floorboards forget you.', { haste: 4 }), T('Smoke Cloak', 'Grey on grey.', { haste: 2, health: 2 }), T('Quick Hands', 'Pockets empty, throats open.', { haste: 2, power: 2 })],
      [T('Long Shadow', 'Shadowstep reaches farther in time.', { haste: 6 }), T('Fading Strike', 'Hit as you vanish.', { haste: 3, power: 3 })],
      [T('Between Moments', 'You move in the gaps.', { haste: 7 }), T('Dusk Blood', 'Twilight in your veins.', { haste: 4, health: 4 }), T('Ghost Walk', 'Half here, half not.', { haste: 4, power: 3 })],
      [T('One With the Dark', 'You are the dusk.', { haste: 10, power: 2 }), T('Nightfall', 'When you come, the light goes.', { haste: 6, power: 6 })] ] },
    { id: 'veilborn', name: 'Veilborn', color: '#4a6a8a', icon: I('sh-veilborn'), tiers: [
      [T('Thick Veil', 'Harder to see, harder to hit.', { health: 4 }), T('Moon Touched', 'Pale light heals.', { health: 3, haste: 1 }), T('Hidden Knife', 'Always one more.', { health: 2, power: 2 })],
      [T('Evasion', 'They cut the shadow, not you.', { health: 6 }), T('Veil Tempo', 'Slip in and out faster.', { haste: 4, health: 2 })],
      [T('Shroud', 'Wrapped in night.', { health: 7 }), T('Lunar Edge', 'Silver-bright, cold-sharp.', { power: 5, health: 2 }), T('Patient Shadow', 'The veil comes back sooner.', { haste: 5, health: 2 })],
      [T('Moonborn', 'Born under the pale eye.', { health: 9, haste: 3 }), T('Veil of the Nine', 'The old secrets hide you.', { health: 6, power: 6 })] ] },
  ],
};
export const LEVEL_PER_POINT = 5;
export const MAX_POINTS = 12;
export function classKey(className) { const k = String(className || 'vanguard').toLowerCase(); return TREES[k] ? k : 'vanguard'; }
export function pointsEarned(level) { return Math.min(MAX_POINTS, Math.floor((level || 1) / LEVEL_PER_POINT)); }
const valid = (cls, key, idx) => { const [sp, ti] = String(key).split(':'); const spec = TREES[cls].find((x) => x.id === sp); return spec && spec.tiers[+ti] && spec.tiers[+ti][idx] ? spec.tiers[+ti][idx] : null; };
export function picks(state) { const cls = classKey(state?.className), out = []; for (const [k, v] of Object.entries(state?.unlockedTalents || {})) { const t = valid(cls, k, v); if (t) out.push({ key: k, t }); } return out; }
export function pointsFree(state) { return Math.max(0, pointsEarned(state?.level) - picks(state).length); }
export function talentFx(state) { const f = { power: 0, haste: 0, health: 0 }; for (const { t } of picks(state)) for (const k in t.fx) f[k] += t.fx[k]; return f; }
export function fxText(fx) { return Object.entries(fx).map(([k, v]) => `+${v}% ${k === 'power' ? 'damage' : k === 'haste' ? 'faster cooldowns' : 'max health'}`).join(' · '); }
// can a pick at spec:tier index land? tier 0 opens at once; each tier needs the one under it in the same spec
export function canPick(state, spec, tier, idx) {
  const cls = classKey(state?.className), sp = TREES[cls].find((x) => x.id === spec), ut = state?.unlockedTalents || {};
  if (!sp || !sp.tiers[tier] || !sp.tiers[tier][idx]) return false;
  if (ut[`${spec}:${tier}`] !== undefined) return false;
  if (tier > 0 && ut[`${spec}:${tier - 1}`] === undefined) return false;
  return pointsFree(state) > 0;
}
