// Awakening handbook data: the one table the god-mode guide (panel.js) draws and the guide's hands (input.js) obey.
// pages: id, title, icon tile colour, what it is; features: [icon, name, what it does, the line Ask Savi sends, status key]
// switches: the mod's optional world settings, each a lake material param or the look's param, with its dependency.
export const PAGES = [
  { id: 'overview', title: 'Overview', icon: '🌅', tint: '#ff9f0a', blurb: 'Awakening makes a Spawn world look and feel real: light, land, plants, water and weather. Every piece is optional and stands on its own.' },
  { id: 'light', title: 'Light & Film', icon: '☀️', tint: '#ff9f0a', blurb: 'Physically based sun, sky and shadow, then a film-grade finish: sharpening, contact shadow, sun-lit mist and a gentle grade.',
    features: [
      ['☀️', 'Light', 'Realistic sun and shadow on every surface. Metal shines, rock stays matte, corners darken naturally.', 'Turn on Awakening lighting in this world.', 'lighting'],
      ['🎞️', 'Film look', 'Sharpening, soft contact shadows, sun-lit mist that pools in low ground, and a gentle colour grade.', 'Add a little more mist in the valley and soften the vignette.', 'look'],
    ] },
  { id: 'clouds', title: 'Clouds', icon: '☁️', tint: '#64d2ff', blurb: 'Real volumetric clouds with silver edges and dark bellies. Their shadows drift across the land.',
    features: [
      ['☁️', 'Volumetric clouds', 'Clouds you can see depth in, lit by the sun from behind. Slower machines get a painted layer instead.', 'Make the sky more overcast with heavier clouds.', 'look'],
    ] },
  { id: 'ground', title: 'Ground', icon: '🟫', tint: '#ac8e68', blurb: 'Sharp 2K ground textures with no visible tiling, and layered granite on rock.',
    features: [
      ['🟫', 'Ground textures', 'Grass, dry grass, forest floor, gravel, granite and snow, blended by slope and height.', 'Add a mud texture where the ground is wet and low.', null],
      ['🪨', 'Rock', 'Close-up granite detail layered onto rock models: lichen, cracks and weathering.', 'Use Awakening rock on the cliffs in this world.', null],
    ] },
  { id: 'mountains', title: 'Mountains', icon: '⛰️', tint: '#8e8e93', blurb: 'Ranges carved by simulated rivers: gullies, ridges and snow in the couloirs. Your mountains keep their size.',
    features: [
      ['⛰️', 'Eroded mountains', 'Water-carved ridges and valleys over your own heights. Nothing shrinks without asking.', 'Carve eroded mountains around my valley.', null],
    ] },
  { id: 'grass', title: 'Grass', icon: '🌾', tint: '#30d158', blurb: 'Wind-blown blades that lean together in gusts and thin with distance and on slower devices.',
    features: [
      ['🌾', 'Grass', 'Real blades, green and dry kinds, moving with the place\u2019s wind.', 'Make the meadow denser and a little drier.', null],
    ] },
  { id: 'forest', title: 'Forest', icon: '🌲', tint: '#34c759', blurb: 'Whole forests planted from rules, with a floor of moss, twigs and cones under them.',
    features: [
      ['🌲', 'Forest planner', 'Species in clumps, glades, understory and trails worn through, all from a few rules.', 'Replant the forest a little thicker with more glades.', null],
      ['🍂', 'Forest floor', 'Moss, twigs, cones and tufts scattered in clusters under the trees.', 'Add more moss under the pines.', null],
    ] },
  { id: 'water', title: 'Water', icon: '💧', tint: '#0a84ff', blurb: 'One water surface for lakes, rivers and falls: depth colour, reflections, current, foam and wakes.',
    features: [
      ['💧', 'Lakes', 'Depth colour, reflections, refraction, sun glints and caustics. Far water goes calm and glassy.', 'Make the lake water clearer near the shore.', 'lake'],
      ['🏞️', 'Rivers & creeks', 'Current, whitewater at drops, boulders that split the flow.', 'Run a creek from the nearest hill into the lake.', 'river'],
      ['🔀', 'Where waters meet', 'A river hands over to a lake with no seam; its current spreads into calmer water.', 'Blend the creek into the lake more softly.', 'meet'],
      ['🌊', 'Waterfalls', 'A layered curtain that tears white as it falls, with froth churning in the pool below.', 'Add a waterfall off the nearest cliff.', null],
      ['〰️', 'Ripples & wakes', 'Wading and swimming leave trails, rocks leave wakes, boats leave wakes, things splash.', 'Make splashes a little quieter.', 'lake'],
      ['🏖️', 'Shoreline', 'Soft foam where water laps, damp dark sand the waves just left.', 'Put less foam on the lake edge.', 'lake'],
      ['🛶', 'Boats & floaters', 'Boats and driftwood ride the very waves you see and drift with wind and swell.', 'Add a rowboat at the jetty.', null],
    ] },
  { id: 'weather', title: 'Weather', icon: '⛈️', tint: '#5e5ce6', blurb: 'Optional squalls, storm waves and thunderstorms on one shared clock, so water, sky and boats agree.',
    features: [
      ['🌬️', 'Squalls', 'Every few minutes a squall crosses the water. In clear weather it is a passing riffle; in a storm, waves build and whitecaps break.', 'Make squalls come less often.', 'squall'],
      ['🌊', 'Storm waves', 'When a thunderstorm comes through, its squall raises real chop. Boats and driftwood heave and drift on it. Clear weather stays calm.', 'Make storm waves a little gentler.', 'stormWaves'],
      ['⛈️', 'Thunderstorms', 'Squalls arrive as storms: dark cloud, rain, wet ground, lightning on the ridges, thunder after.', 'Make storms rarer but stronger.', 'storm'],
    ] },
]

// optional world settings: key → where it lives; needs = another switch it depends on
export const SWITCHES = [
  { key: 'squall', label: 'Squalls', sub: 'Gusts cross the water every few minutes.', on: 'lake' },
  { key: 'stormWaves', label: 'Storm waves', sub: 'In a thunderstorm, squalls raise real chop that boats ride. Clear days stay calm.', on: 'lake', needs: 'squall' },
  { key: 'squallPush', label: 'Weather pushes boats', sub: 'Squalls shove and rock boats and floaters.', on: 'lake', needs: 'squall' },
  { key: 'storm', label: 'Thunderstorms', sub: 'Squalls bring cloud, rain, wet ground and lightning.', on: 'look', needs: 'squall' },
]
