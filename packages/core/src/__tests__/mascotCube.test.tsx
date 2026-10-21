import { render as baseRender, screen, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  compose,
  normalMatrix,
  quatAxisAngle,
  quatEuler,
  quatMultiply,
  rotate,
  snapQuarterTurns,
} from "../modules/ai/cube/math";
import { type CubeInput, CubeMotion, poseFor } from "../modules/ai/cube/state";
import { Mascot } from "../modules/ai/Mascot";
import { cubeSides } from "../modules/ai/MascotCube";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

/* A seeded generator, so every run turns the cube the same way. */
function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const input = (state: CubeInput["state"], extra: Partial<CubeInput> = {}): CubeInput => ({
  state,
  mood: "neutral",
  lookX: 0,
  lookY: 0,
  level: 0,
  reduced: false,
  personality: "default",
  ...extra,
});

const run = (motion: CubeMotion, seconds: number, at: CubeInput) => {
  for (let t = 0; t < seconds; t += 1 / 60) motion.update(1 / 60, at);
};

const home = (motion: CubeMotion) =>
  motion.cubies.every((c) => {
    const p = rotate(c.q, c.home);
    const x = rotate(c.q, [1, 0, 0]);
    const y = rotate(c.q, [0, 1, 0]);
    return (
      p.every((v, i) => Math.abs(v - c.home[i]) < 1e-6) &&
      Math.abs(x[0] - 1) < 1e-6 &&
      Math.abs(y[1] - 1) < 1e-6
    );
  });

describe("Mascot working=cube", () => {
  it("rests as the blob with its face showing", () => {
    const motion = new CubeMotion(seeded());
    run(motion, 1, input("idle"));
    expect(motion.morph).toBe(0);
    expect(motion.face).toBe(1);
    expect(motion.solved).toBe(true);
  });

  it("becomes the cube with no face while thinking, and turns its layers", () => {
    const motion = new CubeMotion(seeded());
    run(motion, 4, input("thinking"));
    expect(motion.morph).toBe(1);
    expect(motion.face).toBe(0);
    expect(motion.history.length + (motion.active ? 1 : 0)).toBeGreaterThan(0);
    expect(home(motion)).toBe(false);
  });

  it("solves the cube when it stops thinking, shows the logo, then softens back with its face", () => {
    const motion = new CubeMotion(seeded());
    run(motion, 4, input("thinking"));
    run(motion, 4, input("idle"));
    expect(motion.solved).toBe(true);
    expect(home(motion)).toBe(true);
    // the logo beat: the solved cube turned 45°
    const beat = new CubeMotion(seeded());
    run(beat, 4, input("thinking"));
    let sawLogo = false;
    for (let t = 0; t < 6; t += 1 / 60) {
      beat.update(1 / 60, input("idle"));
      if (beat.solved && beat.hold > 0 && beat.rot.spin > 0.7) sawLogo = true;
    }
    expect(sawLogo).toBe(true);
    expect(beat.morph).toBe(0);
    expect(beat.face).toBe(1);
  });

  it("holds the cube still under reduced motion", () => {
    const motion = new CubeMotion(seeded());
    run(motion, 4, input("thinking", { reduced: true }));
    expect(motion.morph).toBe(1);
    expect(motion.history).toHaveLength(0);
    expect(motion.active).toBeNull();
  });

  it("eases the face toward each mood and opens the mouth with the voice", () => {
    expect(poseFor("happy", { state: "idle", level: 0 }).curve).toBeGreaterThan(
      poseFor("sad", { state: "idle", level: 0 }).curve,
    );
    expect(poseFor("neutral", { state: "speaking", level: 1 }).open).toBe(1);
    const motion = new CubeMotion(seeded());
    run(motion, 1, input("idle", { mood: "surprised" }));
    expect(motion.pose.open).toBeGreaterThan(0.95);
  });

  it("snaps turns to exact quarter turns", () => {
    const q = quatMultiply(
      quatAxisAngle(1, Math.PI / 2 + 0.01),
      quatAxisAngle(0, -Math.PI / 2 - 0.02),
    );
    const snapped = snapQuarterTurns(q);
    for (const axis of [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ] as [number, number, number][]) {
      for (const v of rotate(snapped, axis)) expect(Math.abs(v - Math.round(v))).toBeLessThan(1e-9);
    }
  });

  it("turns normals with the model", () => {
    const q = quatEuler(0.3, 0.9, 0.2);
    const n = normalMatrix(compose([0, 0, 0], q, [1.2, 0.8, 1]));
    const up = [n[3], n[4], n[5]];
    const len = Math.hypot(up[0], up[1], up[2]);
    // with scale, only the direction matters: the top face's normal follows the rotated y axis
    const s = [1.2, 0.8, 1];
    const expected = rotate(q, [0, 1 / s[1], 0]);
    const el = Math.hypot(...expected);
    for (const [i, v] of up.entries()) expect(v / len).toBeCloseTo(expected[i] / el, 5);
  });

  it("builds sides from a preset or a color per side, the front following the body", () => {
    const color: [number, number, number] = [0.2, 0.4, 0.9];
    const resolve = () => [1, 0, 0] as [number, number, number];
    expect(cubeSides("mono", color, resolve).top).toEqual(color);
    expect(cubeSides("classic", color, resolve).front).toEqual(color);
    expect(cubeSides({ top: "red" }, color, resolve).top).toEqual([1, 0, 0]);
    expect(cubeSides("tints", color, resolve).top).not.toEqual(color);
  });

  it("falls back to the flat mascot where WebGL is missing", async () => {
    const { container } = render(<Mascot working="cube" state="thinking" />);
    await waitFor(() => expect(container.querySelector("svg")).toBeTruthy());
    expect(screen.getByRole("img", { name: "Assistant, thinking" })).toBeTruthy();
  });
});
