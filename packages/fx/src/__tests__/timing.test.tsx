import { LayoutProvider } from "@once-ui-system/core";
import { act, render } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlitchFx } from "../GlitchFx.js";
import { RevealFx } from "../RevealFx.js";
import { ShineFx } from "../ShineFx.js";

/** 3.0, D5: times are milliseconds and `speed` is a multiplier (core's units-px test). */
const r = (ui: React.ReactElement) => render(ui, { wrapper: LayoutProvider });

describe("time is milliseconds, speed a multiplier", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("RevealFx and ShineFx take duration in ms", () => {
    const reveal = r(
      <RevealFx data-testid="r" duration={750}>
        x
      </RevealFx>,
    ).getByTestId("r");
    expect(reveal.style.transitionDuration).toBe("750ms");
    act(() => void vi.advanceTimersByTime(0));
    const shine = r(<ShineFx duration={1200}>s</ShineFx>).container
      .firstElementChild as HTMLElement;
    expect(shine.style.animationDuration).toBe("1200ms");
  });

  it("GlitchFx speed sets the glitch cycle", () => {
    const el = r(
      <GlitchFx data-testid="g" speed={2}>
        g
      </GlitchFx>,
    ).getByTestId("g");
    expect(el.style.getPropertyValue("--glitch-duration")).toBe("1250ms");
  });
});
