// Every tuned number of the camera.
export const CAMERA = {
  distance: 5.5,          // resting arm, m
  minDistance: 0,         // wheel all the way in = first person
  maxDistance: 16,
  zoomRate: 1.5,          // m per wheel notch
  height: 1.35,           // orbit pivot over the feet
  aim: 1.25,              // look-at point over the feet
  eyeHeight: 1.55,        // first-person eye
  sitEyeHeight: 0.82,     // sat on the ground (target.state.sitting), the first-person eye drops to the seated head
  mountEyeHeight: 1.1,    // over target.state.mountLift: a rider's eye sits up in the saddle
  firstPersonAt: 0.65,    // body hides inside this distance
  defaultPitch: -0.22,    // radians, slightly looking down
  lookSensitivity: 3.6,
  cursorDragScale: 1.5,   // left drag: cursor-ray radians to look units, matched to the right drag's feel
  cursorResponse: 22,     // left drag glides to the cursor (~45 ms), hiding the cursor's uneven samples
  lookResponse: 1000,     // 1:1 with the mouse, no glide: stops the moment you let go, like WoW classic
  lookSettle: 0.0001,
  minPitch: -1.4,
  maxPitch: 1.4,
  zoomResponse: 16,
  zoomSettle: 0.001,
  firstPersonEnterDistance: 0.002,
  nearBlendDistance: 1.2  // pivot glides from orbit height to eye height over this span
};

// Every tuned number of the body (move.js).
export const MOVE = {
  walkSpeed: 1.6,         // m/s, after Numpad / toggles walking, and every backpedal
  runSpeed: 4.8,          // m/s, the default pace (times body.state.speedMul when a game sets it)
  acceleration: 80,       // m/s² toward the keys' intent
  deceleration: 120,      // m/s² back to rest
  jumpSpeed: 10,          // m/s up on Space
  strafeLean: 45,         // degrees her body turns toward a pure Q/E strafe (W+Q's diagonal look)
  strafeLeanRate: 360,    // degrees a second the lean eases in and out
  maxSlope: 56,           // WoW: ground steeper than this (degrees) can't be walked or jumped up; she slides off
  slideAccel: 18,         // m/s² down a too-steep face
  slideMax: 9             // m/s, the fastest slide
};

// Underwater (WoW swimming; a game sets body.state.swimming while she is in water): steering with the mouse and moving
// forward swims along the camera's pitch; Space rises, X (held.sit) sinks; nothing held keeps your depth.
export const SWIM = {
  pitchDead: 0.28,        // radians of look either side of level that still swim flat (the resting camera looks down a little)
  vertical: 3.2,          // m/s straight up on Space / down on X underwater
  surface: 1.35,          // depth (water surface minus feet, m) where the engine floats you: shallower is the surface
  response: 8,            // how fast the vertical stroke eases in, 1/s
  maxTilt: 60,            // degrees the body pitches into a dive or a rise
  tiltRate: 120           // degrees a second the tilt eases
};
