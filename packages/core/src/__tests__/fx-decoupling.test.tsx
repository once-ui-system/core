import fs from "node:fs";
import path from "node:path";
import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { CountUp } from "../internal/CountUp";
import { Reveal } from "../internal/Reveal";
import { ShineText } from "../internal/ShineText";
import { formatCount } from "../internal/useCountUp";
import { tokenLength as t } from "../utils/layoutClasses";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * 3.0 (F8 prerequisite): the effects move to `@once-ui-system/fx`, so nothing
 * else in core may import one. ProgressBar, RadialGauge and DataTooltip count
 * with the internal CountUp, Carousel and DatePicker reveal with Reveal, and
 * Table's loading text shines with ShineText.
 */
const SRC = path.resolve(__dirname, "..");
const isEffect = (file: string) => /(?:Fx|^Effect)\.tsx?$/.test(path.basename(file));

const sources = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") sources(full, out);
    } else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

describe("core does not depend on the effects", () => {
  it("no module outside the effects imports an *Fx module", () => {
    const offenders: string[] = [];
    for (const file of sources(SRC)) {
      if (isEffect(file) || path.basename(file) === "index.ts") continue;
      const src = fs.readFileSync(file, "utf8");
      for (const m of src.matchAll(/from\s+["'](\.[^"']*\/(\w+Fx|Effect))["']/g)) {
        offenders.push(`${path.relative(SRC, file)} → ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("CountUp", () => {
  let frames: Map<number, FrameRequestCallback>;
  let id: number;
  const flush = (t: number) => {
    const due = [...frames.values()];
    frames.clear();
    act(() => {
      for (const f of due) f(t);
    });
  };

  beforeEach(() => {
    frames = new Map();
    id = 0;
    vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) => {
      frames.set(++id, f);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (n: number) => frames.delete(n));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the value at once, then counts to a new one and settles on it", () => {
    const { rerender } = render(<CountUp value={10} duration={1000} easing="linear" />);
    expect(screen.getByText("10")).toBeInTheDocument();

    rerender(<CountUp value={20} duration={1000} easing="linear" />);
    flush(100);
    flush(600);
    expect(screen.getByText("15")).toBeInTheDocument();
    flush(1100);
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("lands when the value is changed back mid-run", () => {
    const { rerender } = render(<CountUp value={10} duration={1000} easing="linear" />);
    rerender(<CountUp value={20} duration={1000} easing="linear" />);
    flush(100);
    flush(600);
    rerender(<CountUp value={10} duration={1000} easing="linear" />);
    flush(700);
    flush(1700);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("keeps CountFx's markup: a span around the Text, children after the number", () => {
    const { container } = render(
      <CountUp value={42}>
        <em>%</em>
      </CountUp>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.tagName).toBe("SPAN");
    expect(outer.textContent).toBe("42%");
  });

  it("formats with a separator and decimals", () => {
    expect(formatCount(1234567.5, ",", 1)).toBe("1,234,567.5");
    expect(formatCount(999)).toBe("999");
  });
});

describe("Reveal", () => {
  it("writes its duration in ms and a px offset for a number", () => {
    const { container } = render(
      <Reveal duration={250} translateY={16} revealed={false}>
        content
      </Reveal>,
      { wrapper },
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.transitionDuration).toBe("250ms");
    expect(el.style.transform).toBe(`translateY(${t(16)})`);
  });

  it("starts hidden and reveals once mounted", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<Reveal duration={250}>content</Reveal>, { wrapper });
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toMatch(/hidden/);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(el.className).toMatch(/revealed/);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(el.className).toMatch(/revealedNoMask/);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("ShineText", () => {
  it("sweeps for 1s at ShineFx's base opacity", () => {
    render(<ShineText>Loading data...</ShineText>);
    const el = screen.getByText("Loading data...");
    expect(el.style.animationDuration).toBe("1000ms");
    expect(el.style.getPropertyValue("--shine-base-opacity")).toBe("0.3");
  });
});
