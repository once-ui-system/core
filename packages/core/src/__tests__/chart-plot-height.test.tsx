import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
// The implementations, not the public shells: those load lazily behind the
// optional recharts peer and render nothing synchronously.
import BarChart from "../modules/data/BarChart.impl";
import LineBarChart from "../modules/data/LineBarChart.impl";
import LineChart from "../modules/data/LineChart.impl";
import PieChart from "../modules/data/PieChart.impl";

/**
 * `height` sizes a chart's card once, and the plot takes what the header
 * leaves.
 *
 * The plot row used to carry `min-height: ${height}rem` as well, so a chart
 * with a title asked for header + height inside a card that is `height` tall:
 * the plot hung past the card by the header's height and was clipped by its
 * own `overflow: hidden` (measured in Chromium: 45px with a title, 65px with a
 * description). BarChart grew instead, because its card used `minHeight`. jsdom
 * has no layout, so this pins the structure that produced it: no minimum on the
 * plot row, and a fixed height on every card.
 */
const data = [{ date: "2026-01-01", a: 1 }];
const series = [{ key: "a" }];

const charts = {
  LineChart: <LineChart title="t" height={24} series={series} data={data} />,
  BarChart: <BarChart title="t" height={24} series={series} data={data} />,
  LineBarChart: <LineBarChart title="t" height={24} series={series} data={data} />,
  PieChart: <PieChart title="t" height={24} series={{ key: "a" }} data={data} />,
};

describe("chart plot height", () => {
  for (const [name, chart] of Object.entries(charts)) {
    it(`${name}: the card is the height and the plot has no minimum of its own`, () => {
      const { container } = render(chart);
      const card = container.firstElementChild as HTMLElement;
      const plot = card.lastElementChild as HTMLElement;
      expect(card.style.height).toBe("24rem");
      expect(card.style.minHeight).toBe("");
      expect(plot.style.minHeight).toBe("");
    });
  }
});
