import * as core from "@once-ui-system/core";
import { describe, expect, it } from "vitest";
import * as fx from "../index.js";

/** 3.0, F8: the effects are this package's, and core's root no longer has them. */
const EFFECTS = [
  "BlobFx",
  "CelebrationFx",
  "CountdownFx",
  "CountFx",
  "Effect",
  "FlipFx",
  "GlitchFx",
  "GradientFx",
  "HoloFx",
  "LetterFx",
  "MatrixFx",
  "ParticleFx",
  "RevealFx",
  "ShineFx",
  "TiltFx",
  "TypeFx",
  "WeatherFx",
];

describe("@once-ui-system/fx", () => {
  it("exports the effects (sixteen in 3.0, GradientFx in 3.1) and nothing else", () => {
    expect(Object.keys(fx).sort()).toEqual([...EFFECTS].sort());
  });

  it.each(EFFECTS)("%s is not on @once-ui-system/core", (name) => {
    expect(name in core).toBe(false);
  });
});
