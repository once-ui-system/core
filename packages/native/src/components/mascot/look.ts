/**
 * What both mascots share before drawing: sizes, labels and the seeded look,
 * so the flat mascot and the cube mode (`MascotCube`) read one character the
 * same way.
 */
import type { MascotLook } from "../Mascot";
import type { MascotState } from "./pose";

export const SIZE = { s: 32, m: 48, l: 96, xl: 160 } as const;
export const SCHEMES = new Set(["brand", "accent", "neutral"]);

export const STATE_LABEL: Record<MascotState, string> = {
  idle: "Assistant",
  listening: "Assistant, listening",
  thinking: "Assistant, thinking",
  speaking: "Assistant, speaking",
  sleeping: "Assistant, asleep",
};

/* A small deterministic generator, so a seed always gives the same character. */
function random(seed: string | number) {
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
 * The same seed gives the same character as core's `mascotLook`, on the web
 * and on the phone.
 */
export function mascotLook(seed: string | number): MascotLook {
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
