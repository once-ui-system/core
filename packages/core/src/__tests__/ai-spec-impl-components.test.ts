import spec from "../../ai/spec.json";
import { describe, expect, it } from "vitest";

/**
 * Components whose dependency is an optional peer ship as a lazy shell
 * (`X.tsx`) in front of the real implementation (`X.impl.tsx`), with the
 * module's shared interface next to them. The generator read the shell only,
 * so every one of these came out with `props: {}` and a phantom
 * `extends: ["X.impl", "interfaces"]` — leaving agents and the docs' props
 * tables with no chart or upload API at all.
 */
const SPLIT = ["LineChart", "BarChart", "PieChart", "LineBarChart", "CodeBlock", "MediaUpload"];

type Entry = { props?: Record<string, string>; extends?: string[]; mixins?: string[] };
const components = spec.components as unknown as Record<string, Entry>;

describe("components split across an impl file", () => {
  it.each(SPLIT)("%s resolves its own props", (name) => {
    expect(Object.keys(components[name]?.props ?? {}).length).toBeGreaterThan(0);
  });

  it.each(SPLIT)("%s names no phantom base", (name) => {
    for (const base of components[name]?.extends ?? []) {
      expect(base).not.toMatch(/\.impl$/);
      expect(base).not.toBe("interfaces");
      // every remaining base must be a component the spec actually documents
      expect(components[base]).toBeDefined();
    }
  });

  it("carries the chart contract as a shared mixin, not four copies", () => {
    const chartProps = (spec.mixins as unknown as Record<string, Record<string, string>>).ChartProps;
    expect(chartProps).toBeDefined();
    expect(chartProps.series).toMatch(/SeriesConfig/);
    expect(chartProps.data).toMatch(/DataPoint/);
    for (const chart of ["LineChart", "BarChart", "PieChart", "LineBarChart"]) {
      expect(components[chart]?.mixins).toContain("ChartProps");
    }
  });

  it("reads defaults from the implementation, not the forwarding shell", () => {
    expect(components.LineChart?.props?.axis).toContain("= both");
    expect(components.LineChart?.props?.tooltip).toContain("= true");
  });
});
