// FBsRenderer — the film stock (from The Fourth Knock, @fbp). Point a place's atmosphere.look.script here.
// Dials via atmosphere.look.params: exposure, sat, vignette, grain, dread (0..1), ao (0..1.5).
import { grade, grain, vignette, chromaticAberration, film } from "builtin/postfx";
import { float, min } from "builtin/tsl";
import { AO, FILM, DIALS } from "./lib/tuning.js";
import { contactShadow } from "./lib/ao.js";

export function look(ctx) {
  const dial = (k) => ctx.param(k, DIALS[k]);
  const dread = dial("dread");
  const ao = contactShadow(ctx);
  const lit = ctx.scene.mul(float(1).sub(min(ao.mul(dial("ao")).mul(AO.strength), AO.max)));
  const graded = grade(chromaticAberration(lit, FILM.aberration), {
    exposure: dial("exposure"),
    saturation: float(dial("sat")).sub(dread.mul(FILM.dreadSat)),
    contrast: FILM.contrast, gamma: FILM.gamma, lift: FILM.lift, gain: FILM.gain, temperature: FILM.temperature,
  });
  const framed = vignette(graded, float(dial("vignette")).add(dread.mul(FILM.dreadVignette)), { color: FILM.vignetteColor, feather: FILM.vignetteFeather });
  return grain(film(framed, FILM.filmAmount), dial("grain"));
}
