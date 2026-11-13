/**
 * The mascot's geometry and seeded looks, shared by the animated `Mascot`
 * (a client component) and `mascotSvg`, which draws a still on the server.
 * No React here, and no "use client", so server code can import it.
 */
import type { MascotLook } from "./Mascot.js";
import { readSeedWords } from "./mascotWords.js";

export const DEFAULT_LOOK: Required<Omit<MascotLook, "bodyPath" | "eyeColor" | "sides" | "face">> =
  {
    color: "brand",
    roundness: 0.7,
    aspect: 1,
    surface: "glossy",
    eyes: "tile",
    eyeSize: 1,
    eyeSpacing: 1,
    eyeHeight: 0,
    mouth: "none",
    brows: false,
    cheeks: false,
    personality: "default",
  };

/* The top tile of the Once UI mark (590 box), centered on 0,0 below. */
export const TILE =
  "M173.08 155.146L247.587 80.6393C273.772 54.4536 316.228 54.4536 342.413 80.6393L416.92 155.146L308.547 263.52C301.065 271.002 288.935 271.002 281.453 263.52L173.08 155.146Z";

/** Width and height of each eye, before `eyeSize`. */
export const EYE_BOX = {
  tile: { w: 42, h: 36 },
  pill: { w: 22, h: 40 },
  round: { w: 28, h: 28 },
  wide: { w: 36, h: 18 },
  dot: { w: 16, h: 16 },
  custom: { w: 40, h: 40 },
} as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** A superellipse around (100, 104): exponent 2 is a circle, higher is squarer. */
export function bodyShape(roundness: number, aspect: number) {
  const n = 2 + (1 - clamp(roundness, 0, 1)) * 4;
  const scale = clamp(aspect, 0.6, 1.6);
  const a = scale >= 1 ? 82 : 82 * scale;
  const b = scale >= 1 ? 78 / scale : 78;
  const points: string[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 100 + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 104 + b * Math.sign(s) * Math.abs(s) ** (2 / n);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return { d: `M${points.join("L")}Z`, top: 104 - b, bottom: 104 + b, halfWidth: a };
}

/* A small deterministic generator, so a seed always gives the same character. */
export function random(seed: string | number) {
  let h = 2166136261;
  for (const char of String(seed)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A whole look from a seed: a user id, a product name, any string or number.
 * The same seed always gives the same character. Words in it describe the
 * mascot: "happy-red-fox", "sleepyPandaDJ" or "Royal Robot 42" set the colour,
 * the body, the face and the mood (see `MASCOT_SEED_WORDS`); whatever the words
 * leave open comes from the seed's hash, as it does for a seed with no words.
 */
export function mascotLook(seed: string | number): MascotLook {
  return { ...hashedLook(seed), ...readSeedWords(seed).look };
}

/* The look from the seed's hash alone: what every part the words don't set falls back to. */
function hashedLook(seed: string | number): MascotLook {
  const next = random(seed);
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)];
  const range = (min: number, max: number) => Math.round((min + next() * (max - min)) * 100) / 100;
  return {
    color: `oklch(0.72 0.16 ${Math.round(next() * 360)})`,
    roundness: range(0.2, 1),
    aspect: range(0.8, 1.3),
    surface: pick(["glossy", "glossy", "matte", "flat", "glass"] as const),
    eyes: pick(["tile", "pill", "round", "wide", "dot"] as const),
    eyeSize: range(0.85, 1.25),
    eyeSpacing: range(0.8, 1.25),
    eyeHeight: range(-0.35, 0.3),
    mouth: pick(["none", "none", "smile", "dot", "line"] as const),
    brows: next() < 0.35,
    cheeks: next() < 0.4,
    personality: pick(["calm", "default", "default", "bouncy"] as const),
  };
}
