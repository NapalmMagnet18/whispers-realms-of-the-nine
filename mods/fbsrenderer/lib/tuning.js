// FBsRenderer — every tuned number, in one place. lighting.js, look.js and the AO pass read from here.
export const SURFACE = {
  roughMin: 0.5,     // no painted or wooden surface is glassier than this
  roughPush: 0.45,   // how far every dielectric is pushed toward matte
  grimeRough: 0.35,  // dark albedo reads rougher, pale paint a touch smoother
  envMatte: 0.12,    // how much the env reflection is damped on surfaces made matte
  occlusionFloor: 0.45, // direct light kept inside baked occlusion
};
export const SHADOW = { floor: 0.0 }; // a wall stops a lamp dead: umbra is lit by bounce rows, never leak
export const AO = { taps: 8, radius: 0.45, fadeNear: 12, fadeFar: 30, strength: 0.75, max: 0.8 };
export const FILM = {
  aberration: 0.0016, contrast: 1.06, gamma: 1.06,
  lift: [0, 0.003, 0.012], gain: [1.02, 1.0, 0.96], temperature: -0.05,
  vignetteColor: "oklch(0.04 0.01 260)", vignetteFeather: 0.55, filmAmount: 0.08,
  dreadSat: 0.3, dreadVignette: 0.3,
};
// defaults for the live dials (place atmosphere.look.params override each)
export const DIALS = { exposure: 1.0, sat: 0.74, vignette: 0.55, grain: 0.085, dread: 0, ao: 1.0 };
export const BOUNCE = { share: 0.2, epsilon: 0.004, offBelow: 0.02 };
