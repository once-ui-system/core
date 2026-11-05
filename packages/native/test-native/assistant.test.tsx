import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Circle } from "react-native-svg";
import {
  LogoSpinner,
  Mascot,
  mascotLook,
  ThemeProvider,
  WorkingIndicator,
  workingVerbs,
} from "../src";
import { logoSpinnerPose } from "../src/components/LogoSpinner";
import { motionAt, targetPose } from "../src/components/mascot/pose";
import { shimmerLevels } from "../src/components/WorkingIndicator";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

// The drawings animate every frame; fake timers keep the frame loop from
// running between assertions, and `act` + `advanceTimersByTime` steps it.
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

/** How many host elements of `type` the screen holds. */
const count = (type: string) => {
  let found = 0;
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const element = node as { type?: string; children?: unknown[] };
    if (element.type === type) found++;
    element.children?.forEach(walk);
  };
  walk(screen.toJSON());
  return found;
};

describe("Mascot", () => {
  it("is one image named for what it is doing", async () => {
    await wrap(<Mascot />);
    expect(screen.getByLabelText("Assistant")).toBeTruthy();
    await wrap(<Mascot state="thinking" mood="happy" />);
    expect(screen.getByLabelText("Assistant, thinking")).toBeTruthy();
    await wrap(<Mascot state="sleeping" aria-label="Lumen" />);
    expect(screen.getByLabelText("Lumen")).toBeTruthy();
  });

  it("gives a seed the same look as core's mascotLook", () => {
    expect(mascotLook("acme")).toEqual(mascotLook("acme"));
    expect(mascotLook("acme")).not.toEqual(mascotLook("lumen"));
  });

  it("sizes by token or number", async () => {
    await wrap(<Mascot testID="m" size="xl" />);
    expect(screen.getByTestId("m").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 160, height: 160 })]),
    );
    await wrap(<Mascot testID="m" size={72} />);
    expect(screen.getByTestId("m").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 72, height: 72 })]),
    );
  });

  it("draws the accessory with the body", async () => {
    await wrap(<Mascot accessory={<Circle testID="hat" cx={100} cy={20} r={8} fill="red" />} />);
    expect(screen.getByTestId("hat")).toBeTruthy();
  });

  it("settles each state and mood as core's stylesheet does", () => {
    const base = { tileEyes: true, lookX: 0, lookY: 0 } as const;
    const asleep = targetPose({ ...base, state: "sleeping", mood: "neutral" });
    expect(asleep.eyes[0].lt).toBe(0.72);
    expect(asleep.gy).toBe(0.25);
    const wink = targetPose({ ...base, state: "idle", mood: "wink" });
    expect(wink.eyes[0]).toMatchObject({ lt: 0.44, lb: 0.44 });
    expect(wink.eyes[1].tile).toBe(180);
    const pondering = targetPose({ ...base, tileEyes: false, state: "thinking", mood: "neutral" });
    expect(pondering).toMatchObject({ gx: 0.5, gy: -0.7 });
    const looking = targetPose({ ...base, lookX: -1, lookY: 0.5, state: "idle", mood: "neutral" });
    expect(looking).toMatchObject({ gx: -1, gy: 0.5 });
  });

  it("turns tile eyes while thinking and blinks otherwise", () => {
    const thinking = {
      state: "thinking",
      mood: "neutral",
      tileEyes: true,
      personality: "default",
    } as const;
    // A quarter turn lands at 22% of the 4.8s loop.
    expect(motionAt(thinking, 4.8 * 0.3).turn[0]).toBeCloseTo(90, 0);
    expect(motionAt(thinking, 4.8 * 0.955).blink[0]).toBe(1);
    const idle = { ...thinking, state: "idle" } as const;
    expect(motionAt(idle, 4.6 * 0.955).blink[0]).toBeCloseTo(0.08, 2);
    expect(motionAt(idle, 1).turn[0]).toBe(0);
  });

  it("moves its mouth with the level while speaking", () => {
    const speaking = {
      state: "speaking",
      mood: "neutral",
      tileEyes: true,
      personality: "default",
    } as const;
    expect(motionAt({ ...speaking, level: 0 }, 0).talk).toBeCloseTo(0.25);
    expect(motionAt({ ...speaking, level: 1 }, 0).talk).toBeCloseTo(1.2);
    expect(motionAt({ ...speaking, level: 1 }, 0).body.sy).toBeCloseTo(1.1);
  });

  it("draws z's only while sleeping", async () => {
    await wrap(<Mascot />);
    expect(count("RNSVGText")).toBe(0);
    await wrap(<Mascot state="sleeping" />);
    expect(count("RNSVGText")).toBe(2);
  });
});

describe("LogoSpinner", () => {
  it("is a progress bar with a label", async () => {
    await wrap(<LogoSpinner aria-label="Generating" />);
    expect(screen.getByLabelText("Generating").props.accessibilityRole).toBe("progressbar");
  });

  it("parts the tiles and turns a quarter in each twist", () => {
    const half = logoSpinnerPose("twist", 1.6 * 0.45, 1.6, false);
    expect(half.tiles[0].y).toBeCloseTo(-56, 0);
    expect(half.tiles[1].x).toBeCloseTo(56, 0);
    expect(logoSpinnerPose("twist", 1.6 * 0.8, 1.6, false).rotate).toBeCloseTo(90, 0);
  });

  it("lifts one tile at a time in the wave, and only fades with reduce motion", () => {
    const wave = logoSpinnerPose("wave", 1.6 * 0.15, 1.6, false);
    expect(wave.tiles[0].y).toBeCloseTo(-48, 0);
    expect(wave.tiles[1]).toMatchObject({ x: 0, y: 0 });
    const still = logoSpinnerPose("twist", 1.6 * 0.25, 1.6, true);
    expect(still.rotate).toBe(0);
    expect(still.tiles[0]).toMatchObject({ x: 0, y: 0, scale: 1 });
    expect(still.tiles[0].opacity).toBeCloseTo(0.35, 2);
  });
});

describe("WorkingIndicator", () => {
  it("reads as one fixed label, not each verb", async () => {
    await wrap(<WorkingIndicator shuffle={false} shimmer={false} />);
    const row = screen.getByLabelText("Working");
    expect(row.props.accessible).toBe(true);
    expect(screen.getByText(`${workingVerbs[0]}…`)).toBeTruthy();
  });

  it("walks the verbs in order without shuffle", async () => {
    await wrap(
      <WorkingIndicator
        verbs={["Brewing", "Kerning"]}
        shuffle={false}
        shimmer={false}
        interval={1000}
      />,
    );
    expect(screen.getByText("Brewing…")).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Kerning…")).toBeTruthy();
  });

  it("shows a fixed label, elapsed time and detail", async () => {
    await wrap(
      <WorkingIndicator
        label="Searching the docs"
        showElapsed
        startedAt={Date.now() - 65_000}
        detail="tap to stop"
        loader={false}
      />,
    );
    expect(screen.getByText("Searching the docs")).toBeTruthy();
    expect(screen.getByText(/1m 05s · tap to stop/)).toBeTruthy();
  });

  it("sweeps the shimmer across the letters", () => {
    const start = shimmerLevels(10, 0.2);
    const later = shimmerLevels(10, 1.4);
    const brightest = (levels: number[]) => levels.indexOf(Math.max(...levels));
    expect(brightest(later)).toBeGreaterThan(brightest(start));
  });
});
