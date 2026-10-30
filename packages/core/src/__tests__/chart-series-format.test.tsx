import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { DataTooltip } from "../modules/data/DataTooltip";
import {
  chartFormatters,
  chartSeries,
  makeValueFormatter,
  rowsByX,
} from "../modules/data/utils/chartSeries";

/**
 * 3.0 chart props: `xKey`, series `label` and `format`, `valueFormat` and
 * `locale`. The renderer reads every series and number through these helpers,
 * so they are what pins the behaviour.
 */
describe("chartSeries", () => {
  const rows = [{ month: "Jan", revenue: 10, cost: 4 }];

  it("takes the first non-series key as x and never draws it as a series", () => {
    const { xKey, series } = chartSeries(rows, undefined);
    expect(xKey).toBe("month");
    expect(series.map((s) => s.key)).toEqual(["revenue", "cost"]);
  });

  it("uses xKey when given, and labels series by label or key", () => {
    const { xKey, series } = chartSeries(
      rows,
      [{ key: "cost", label: "Costs" }, { key: "revenue" }],
      "month",
    );
    expect(xKey).toBe("month");
    expect(series.map((s) => s.label)).toEqual(["Costs", "revenue"]);
    expect(series.every((s) => s.color)).toBe(true);
  });

  it("prefers a real key over label for x, and never draws label", () => {
    const { xKey, series } = chartSeries([{ label: "Q1", date: "2026-01-01", v: 1 }], undefined);
    expect(xKey).toBe("date");
    expect(series.map((s) => s.key)).toEqual(["v"]);
    expect(chartSeries([{ label: "Q1", v: 1 }], { key: "v" }).xKey).toBe("label");
  });

  it("finds a tick's row by its x value", () => {
    expect(rowsByX(rows, "month").get("Jan")).toBe(rows[0]);
  });
});

describe("makeValueFormatter", () => {
  it("groups digits in the locale", () => {
    expect(makeValueFormatter(undefined)(12400)).toBe("12,400");
    // hu-HU groups with a no-break space.
    expect(makeValueFormatter("number", "hu-HU")(12400).replace(/\s/g, " ")).toBe("12 400");
  });

  it("writes compact, percent, Intl options and functions", () => {
    expect(makeValueFormatter("compact")(12400)).toBe("12.4K");
    expect(makeValueFormatter("percent")(0.42)).toBe("42%");
    expect(makeValueFormatter({ style: "currency", currency: "USD" })(5)).toBe("$5.00");
    expect(makeValueFormatter((v) => `${v} kg`)(3)).toBe("3 kg");
  });

  it("falls back to the default locale on a tag the platform rejects", () => {
    expect(makeValueFormatter(undefined, "not a locale!")(1000)).toBe("1,000");
  });
});

describe("chartFormatters", () => {
  const series = chartSeries(
    [{ x: 1, a: 1, b: 2 }],
    [{ key: "a" }, { key: "b", format: "percent" }],
  ).series;

  it("asks for nothing when nothing was asked, so 2.x charts draw the same", () => {
    expect(
      chartFormatters(undefined, undefined, chartSeries([{ x: 1, a: 1 }], { key: "a" }).series),
    ).toEqual({});
  });

  it("formats each series by its own format, else the chart's", () => {
    const { tooltip } = chartFormatters("compact", undefined, series);
    expect(tooltip?.(1500, "a")).toBe("1.5K");
    expect(tooltip?.(0.5, "b")).toBe("50%");
  });

  it("writes a percent stack's axis as percentages", () => {
    const { axis, tooltip } = chartFormatters(undefined, undefined, [], true);
    expect(axis?.(0.25)).toBe("25%");
    expect(tooltip).toBeUndefined();
  });
});

describe("DataTooltip formatValue", () => {
  it("writes values with the chart's formatter", () => {
    const { getByText } = render(
      <DataTooltip
        active
        label="Jan"
        payload={[{ name: "Revenue", value: 1234.5, dataKey: "revenue", color: "red" }]}
        formatValue={(v, key) => `${key}:${v}`}
      />,
      { wrapper: ({ children }) => <LayoutProvider>{children}</LayoutProvider> },
    );
    expect(getByText("revenue:1234.5")).toBeTruthy();
    expect(getByText("Revenue")).toBeTruthy();
  });
});
