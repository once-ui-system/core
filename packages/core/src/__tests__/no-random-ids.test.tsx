import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname, "..");

/** Effects whose randomness only drives animation after mount, never markup. */
const ANIMATION_ONLY = new Set([
  "components/CelebrationFx.tsx",
  "components/FadingLettersFx.tsx",
  "components/LetterFx.tsx",
  "components/MatrixFx.tsx",
  "components/ParticleFx.tsx",
  "components/WeatherFx.tsx",
  // Shuffles which verb shows next, after mount; the first render is fixed.
  "modules/ai/WorkingIndicator.tsx",
]);

const sources = (dir: string): string[] =>
  readdirSync(path.join(SRC, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(rel);
    return /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [rel] : [];
  });

/**
 * BarChart, LineChart and LineBarChart built their gradient ids from
 * Math.random, so the server and the client rendered different ids and
 * hydration logged an attribute mismatch (seen in Stack). Ids come from
 * useId; randomness is only allowed in effects that animate after mount.
 */
describe("no Math.random in rendered markup", () => {
  it("is only called by animation effects", () => {
    const offenders = [...sources("components"), ...sources("modules")].filter(
      (file) =>
        !ANIMATION_ONLY.has(file) &&
        readFileSync(path.join(SRC, file), "utf8").includes("Math.random("),
    );
    expect(offenders).toEqual([]);
  });
});
