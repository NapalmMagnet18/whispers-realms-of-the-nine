// Every tuned number of the camera.
export const CAMERA = {
  distance: 5.5,          // resting arm, m
  minDistance: 0,         // wheel all the way in = first person
  maxDistance: 16,
  zoomRate: 1.5,          // m per wheel notch
  height: 1.35,           // orbit pivot over the feet
  aim: 1.25,              // look-at point over the feet
  eyeHeight: 1.55,        // first-person eye
  firstPersonAt: 0.65,    // body hides inside this distance
  defaultPitch: -0.22,    // radians, slightly looking down
  lookSensitivity: 3,
  lookResponse: 24,       // easing rate toward the drag goal, 1/s
  lookSettle: 0.0001,
  minPitch: -1.4,
  maxPitch: 1.4,
  zoomResponse: 16,
  zoomSettle: 0.001,
  firstPersonEnterDistance: 0.002,
  nearBlendDistance: 1.2  // pivot glides from orbit height to eye height over this span
};
