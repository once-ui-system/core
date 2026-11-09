import { act, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Flex } from "../components/Flex";
import { Table } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import LineChart from "../modules/data/LineChart.impl";

/*
 * What a dashboard pays per render, pinned from the Databuddy benchmark
 * (a 4x-throttled Overview: ~230 table skeletons, a LineChart, seven tables).
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Flex render cost", () => {
  it("writes no style attribute when no inline value is set", () => {
    // React writes every key of a style object on mount, an unset one as "".
    const { container } = render(<Flex padding="16" gap="8" fillWidth />, { wrapper: wrap });
    expect(container.firstElementChild?.hasAttribute("style")).toBe(false);
  });

  it("still writes the inline values that are set", () => {
    const { container } = render(<Flex padding={3} height="64" />, { wrapper: wrap });
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.paddingTop).not.toBe("");
    expect(el.style.height).toBe("var(--static-space-64)");
  });

  it("still writes breakpoint classes when a breakpoint object is given", () => {
    const { container } = render(<Flex direction="row" s={{ direction: "column", gap: "4" }} />, {
      wrapper: wrap,
    });
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).toMatch(/\bs-flex-column\b/);
    expect(cls).toMatch(/\bs-g-4\b/);
  });

  it("writes no breakpoint class without a breakpoint object", () => {
    const { container } = render(<Flex direction="column" padding="16" />, { wrapper: wrap });
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).not.toMatch(/\b(xl|l|m|s|xs)-/);
    expect(cls).not.toMatch(/\s$/);
  });
});

describe("skeleton animation cost", () => {
  const scss = readFileSync(join(__dirname, "../components/Skeleton.module.scss"), "utf8");

  it("pulses opacity, which the compositor runs, not a colour", () => {
    const keyframes = scss.slice(scss.indexOf("@keyframes skeleton-loading"));
    const body = keyframes.slice(0, keyframes.indexOf("\n}\n"));
    expect(body).toMatch(/opacity:/);
    expect(body).not.toMatch(/background|color:/);
  });

  it("puts many pulses in one iteration, so iteration boundaries are rare", () => {
    expect(scss).toMatch(/\$skeleton-cycles:\s*40;/);
    expect(scss).toMatch(/\$skeleton-step:\s*2\.5%;/);
  });

  it("animates a Table's skeleton rows, not every cell", () => {
    const { container } = render(
      <Table
        aria-label="t"
        columns={[
          { key: "a", header: "A" },
          { key: "b", header: "B" },
        ]}
        rows={[]}
        loading
      />,
      { wrapper: wrap },
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.className).toMatch(/group/);
    expect(rows[1] instanceof HTMLElement && rows[1].style.animationDelay).toBe("80ms");
    // The cells' skeletons carry no inline delay, so they stay server Flexes.
    for (const cell of container.querySelectorAll("tbody td > *")) {
      expect((cell as HTMLElement).style.animationDelay).toBe("");
    }
  });
});

describe("chart plot measuring", () => {
  type Callback = (entries: { borderBoxSize: { inlineSize: number; blockSize: number }[] }[]) => void;
  let observers: { cb: Callback; el?: Element }[] = [];
  let rect: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        cb: Callback;
        constructor(cb: Callback) {
          this.cb = cb;
          observers.push(this as unknown as { cb: Callback });
        }
        observe(el: Element) {
          (this as unknown as { el: Element }).el = el;
        }
        disconnect() {}
        unobserve() {}
      },
    );
    rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rect.mockRestore();
  });

  const data = [
    { date: "2026-01-01", a: 1 },
    { date: "2026-01-02", a: 3 },
  ];

  it("does not force a layout when the plot mounts", () => {
    render(<LineChart series={[{ key: "a" }]} data={data} />, { wrapper: wrap });
    expect(rect).not.toHaveBeenCalled();
  });

  it("draws at the size the observer reports, and keeps it across a reload", () => {
    const { container, rerender } = render(
      <LineChart series={[{ key: "a" }]} data={data} />,
      { wrapper: wrap },
    );
    const plot = () => container.querySelector("svg[viewBox]") as SVGElement;
    act(() => {
      for (const o of observers)
        o.cb([{ borderBoxSize: [{ inlineSize: 500, blockSize: 200 }] }]);
    });
    expect(plot().getAttribute("viewBox")).toBe("0 0 500 200");

    // Loading unmounts the plot; when it comes back it starts at its last size.
    rerender(<LineChart series={[{ key: "a" }]} data={data} loading />);
    expect(container.querySelector("svg[viewBox]")).toBeNull();
    rerender(<LineChart series={[{ key: "a" }]} data={data} />);
    expect(plot().getAttribute("viewBox")).toBe("0 0 500 200");
  });
});
