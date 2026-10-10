import { describe, expectTypeOf, it } from "vitest";
import type { DataStyle } from "../contexts/ThemeProvider";
import type { BarChartProps } from "../modules/data/BarChart.impl";
import type { LineBarChartProps } from "../modules/data/LineBarChart.impl";
import type { LineChartProps } from "../modules/data/LineChart.impl";
import type { PieChartProps } from "../modules/data/PieChart.impl";

/**
 * The charts typed `data-viz-style` as a bare `string`, so an editor offered
 * nothing and the spec told an agent nothing. It names the `DataStyle` union
 * now. The `(string & {})` arm keeps a 2.0 caller that passes a `string`
 * compiling — narrowing a prop type is a major change — without collapsing
 * the union, which is what keeps the three values suggestible.
 */
// Exclude rather than NonNullable: `NonNullable` is `T & {}`, which collapses
// `string & {}` to `string` and would hide what is being tested.
type VizStyle<P extends { "data-viz-style"?: unknown }> = Exclude<P["data-viz-style"], undefined>;

describe("data-viz-style", () => {
  it("names DataStyle on every chart", () => {
    expectTypeOf<DataStyle>().toExtend<VizStyle<LineChartProps>>();
    expectTypeOf<DataStyle>().toExtend<VizStyle<BarChartProps>>();
    expectTypeOf<DataStyle>().toExtend<VizStyle<LineBarChartProps>>();
    expectTypeOf<DataStyle>().toExtend<VizStyle<PieChartProps>>();
  });

  it("keeps the three values in the union, so they stay suggestible", () => {
    // Against a bare `string` this Extract is `never`.
    expectTypeOf<Extract<VizStyle<LineChartProps>, DataStyle>>().toEqualTypeOf<DataStyle>();
    expectTypeOf<Extract<VizStyle<BarChartProps>, DataStyle>>().toEqualTypeOf<DataStyle>();
    expectTypeOf<Extract<VizStyle<LineBarChartProps>, DataStyle>>().toEqualTypeOf<DataStyle>();
    expectTypeOf<Extract<VizStyle<PieChartProps>, DataStyle>>().toEqualTypeOf<DataStyle>();
  });
});
