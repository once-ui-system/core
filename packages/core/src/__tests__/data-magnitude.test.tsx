import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { DivergingBars, divergingScale } from "../modules/data/DivergingBars";
import { Heatmap, heatmapStep } from "../modules/data/Heatmap";
import { squarify, Treemap } from "../modules/data/Treemap";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Treemap, Heatmap and DivergingBars, moved from Sigilio's portfolio into
 * core: drawn as HTML, every mark a focusable button with its value in its
 * name, and the same card, states and number formats as the other charts.
 */

const Providers = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <DataThemeProvider>{children}</DataThemeProvider>
  </LayoutProvider>
);

const holdings = [
  { label: "ACME", value: 500, change: 0.12, share: "50%" },
  { label: "Globex", value: 300, change: -0.08, share: "30%" },
  { label: "Initech", value: 200, change: 0, share: "20%" },
  { label: "Gone", value: 0, change: 0.5 },
];

describe("squarify", () => {
  it("fills the box with one rect per value, areas in proportion", () => {
    const rects = squarify([6, 6, 4, 3, 2, 2, 1], { x: 0, y: 0, w: 60, h: 40 });
    const area = rects.reduce((sum, r) => sum + r.w * r.h, 0);
    expect(area).toBeCloseTo(2400, 6);
    expect(rects[0].w * rects[0].h).toBeCloseTo(600, 6);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-1e-9);
      expect(r.y + r.h).toBeLessThanOrEqual(40 + 1e-9);
    }
  });

  it("returns empty rects when there is nothing to size", () => {
    expect(squarify([0, 0], { x: 0, y: 0, w: 10, h: 10 })).toEqual([
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ]);
  });
});

describe("Treemap", () => {
  it("draws a tile per positive item, largest first, named with its value and tone", async () => {
    const { container } = render(
      <Treemap
        title="Holdings"
        data={holdings}
        toneKey="change"
        subKey="share"
        valueFormat={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
        toneFormat="percent"
      />,
      { wrapper: Providers },
    );
    const group = screen.getByRole("figure", { name: "Holdings" });
    const tiles = group.querySelectorAll("button");
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).toHaveAccessibleName("ACME: €500, +12%, 50%");
    expect(tiles[1]).toHaveAccessibleName("Globex: €300, -8%, 30%");
    expect((tiles[0] as HTMLElement).style.background).toContain("--chart-gain");
    expect((tiles[1] as HTMLElement).style.background).toContain("--chart-loss");
    expect((tiles[2] as HTMLElement).style.background).toContain("--neutral-alpha-weak");
    await expectNoAxeViolations(container);
  });

  it("shows a hover card on focus and hides it on blur", () => {
    render(<Treemap aria-label="Spend" data={holdings} />, { wrapper: Providers });
    const tile = screen.getByRole("button", { name: /ACME/ });
    fireEvent.focus(tile);
    expect(screen.getByText("500", { selector: "div" })).toBeInTheDocument();
    fireEvent.blur(tile);
    expect(screen.queryByText("500", { selector: "div" })).toBeNull();
  });

  it("takes custom gain and loss colours", () => {
    render(<Treemap aria-label="Spend" data={holdings} toneKey="change" gainColor="blue" />, {
      wrapper: Providers,
    });
    const root = screen.getByRole("figure", { name: "Spend" }).parentElement as HTMLElement;
    expect(root.style.getPropertyValue("--chart-gain")).toBe("var(--data-blue)");
  });

  it("shows the empty, error and loading states", () => {
    const { rerender } = render(<Treemap data={[]} emptyState="Nothing held" />, {
      wrapper: Providers,
    });
    expect(screen.getByText("Nothing held")).toBeInTheDocument();
    rerender(<Treemap data={holdings} error errorState="Prices failed" />);
    expect(screen.getByText("Prices failed")).toBeInTheDocument();
    expect(screen.queryByRole("figure")).toBeNull();
  });

  it("renders on the server", () => {
    const html = renderToString(
      <Providers>
        <Treemap aria-label="Spend" data={holdings} />
      </Providers>,
    );
    expect(html).toContain("ACME");
  });
});

describe("Heatmap", () => {
  const years = [
    { label: "2025", Jan: 10, Feb: 0, Mar: 40 },
    { label: "2026", Jan: 20, Feb: null, Mar: -5 },
  ];

  it("puts each value in one of five steps against the largest", () => {
    expect(heatmapStep(40, 40)).toBe(4);
    expect(heatmapStep(1, 40)).toBe(0);
    expect(heatmapStep(20, 40)).toBe(2);
    expect(heatmapStep(5, 0)).toBe(0);
  });

  it("draws a named cell per row and column; empty, zero and negative cells stay neutral", async () => {
    const { container } = render(
      <Heatmap
        title="Dividends"
        data={years}
        columns={["Jan", "Feb", { key: "Mar", label: "March" }]}
      />,
      { wrapper: Providers },
    );
    const cells = screen.getByRole("figure", { name: "Dividends" }).querySelectorAll("button");
    expect(cells).toHaveLength(6);
    expect(cells[2]).toHaveAccessibleName("2025 March: 40");
    expect(cells[4]).toHaveAccessibleName("2026 Feb: No data");
    expect((cells[2] as HTMLElement).style.background).toContain("--chart-seq");
    for (const i of [1, 4, 5]) {
      expect((cells[i] as HTMLElement).style.background).toContain("--neutral-alpha-weak");
    }
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("hides the scale and renames its ends", () => {
    const { rerender } = render(
      <Heatmap
        aria-label="Visits"
        data={years}
        columns={["Jan"]}
        legend={{ less: "Kevesebb", more: "Több" }}
      />,
      { wrapper: Providers },
    );
    expect(screen.getByText("Kevesebb")).toBeInTheDocument();
    rerender(
      <Heatmap aria-label="Visits" data={years} columns={["Jan"]} legend={{ display: false }} />,
    );
    expect(screen.queryByText("Less")).toBeNull();
  });
});

describe("DivergingBars", () => {
  const moves = [
    { label: "ACME", value: 0.12 },
    { label: "Globex", value: -0.04 },
    { label: "Flat", value: 0 },
  ];

  it("puts zero where the largest loss ends", () => {
    expect(divergingScale([3, -1]).zero).toBeCloseTo(25);
    expect(divergingScale([3, 1]).zero).toBe(0);
    expect(divergingScale([-3, -1]).zero).toBe(100);
  });

  it("writes each value with its sign and draws gains and losses apart", async () => {
    const { container } = render(
      <DivergingBars title="Since bought" data={moves} valueFormat="percent" />,
      { wrapper: Providers },
    );
    const bars = screen.getByRole("figure", { name: "Since bought" }).querySelectorAll("button");
    expect(bars[0]).toHaveAccessibleName("ACME: +12%");
    expect(bars[1]).toHaveAccessibleName("Globex: -4%");
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect((bars[0] as HTMLElement).style.left).toBe("25%");
    expect((bars[1] as HTMLElement).style.right).toBe("75%");
    expect((bars[2] as HTMLElement).style.width).toBe("2px");
    await expectNoAxeViolations(container);
  });
});
