import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  composeTransform as coreComposeTransform,
  translateTransform as coreTranslateTransform,
  translateValue as coreTranslateValue,
} from "../../../core/src/utils/layoutClasses.js";
import { speedFactor as coreSpeedFactor } from "../../../core/src/utils/speed.js";
import { speedFactor } from "../internal/speed.js";
import { composeTransform, translateTransform, translateValue } from "../internal/translate.js";

/**
 * The effects read `speed`, `translateY` and their colour props exactly as
 * core does, through copies of three of core's internal helpers: they are not
 * public API, and core keeps its own. These hold each copy to the original,
 * so a change to one fails here until the other follows. (In the workspace
 * only: the published package has no tests.)
 */
const CORE = path.resolve(__dirname, "../../../core/src");
const body = (file: string) =>
  readFileSync(file, "utf8")
    .replace(/^(\/\/[^\n]*\n)+\n?/, "")
    .trim();

describe("copies of core's internal helpers", () => {
  it("cssColor is core's, word for word", () => {
    expect(body(path.resolve(__dirname, "../internal/cssColor.ts"))).toBe(
      body(path.join(CORE, "internal/cssColor.ts")),
    );
  });

  it("cannotHover is core's, word for word", () => {
    expect(body(path.resolve(__dirname, "../internal/pointer.ts"))).toBe(
      body(path.join(CORE, "internal/pointer.ts")),
    );
  });

  it.each([
    [undefined, undefined],
    [8, undefined],
    [undefined, "16"],
    ["m", "-2px"],
    ["huge", 4],
  ] as const)("translateTransform(%s, %s) matches core", (x, y) => {
    expect(translateTransform(x, y)).toBe(coreTranslateTransform(x, y));
  });

  it.each([
    [],
    [undefined, false],
    ["translate(8px, 0)", "rotateY(180deg)"],
    [undefined, "rotateX(180deg)"],
  ] as const)("composeTransform(%j) matches core", (...parts) => {
    expect(composeTransform(...parts)).toBe(coreComposeTransform(...parts));
  });

  it.each(["slow", "medium", "fast", 1.5, 0, -1, Number.NaN, undefined] as const)(
    "speedFactor(%s) matches core",
    (speed) => {
      expect(speedFactor(speed)).toBe(coreSpeedFactor(speed));
    },
  );

  it.each([
    0,
    16,
    -8,
    "16",
    "72",
    "160",
    "m",
    "xl",
    "1.5rem",
    "50%",
    "-2px",
    "calc(100% - 8px)",
    "var(--x)",
    "huge",
    "",
    undefined,
    null,
  ])("translateValue(%s) matches core", (value) => {
    expect(translateValue(value)).toBe(coreTranslateValue(value));
  });
});
