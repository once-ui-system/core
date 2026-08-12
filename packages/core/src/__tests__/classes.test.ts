import { describe, expect, it } from "vitest";
import { cn, generateClasses } from "../classes";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("flex", false && "hidden", "items-center")).toBe("flex items-center");
  });

  it("overrides generated classes with user-provided className", () => {
    const generated = generateClasses({ padding: "4", background: "surface" });
    const merged = cn(generated, "p-8 custom-class");
    expect(merged).toContain("p-8");
    expect(merged).not.toContain("p-4");
    expect(merged).toContain("custom-class");
  });
});

describe("generateClasses", () => {
  it("generates default flex and position classes", () => {
    const result = generateClasses(
      undefined, // padding
      undefined, // paddingLeft
      undefined, // paddingRight
      undefined, // paddingTop
      undefined, // paddingBottom
      undefined, // paddingX
      undefined, // paddingY
      undefined, // margin
      undefined, // marginLeft
      undefined, // marginRight
      undefined, // marginTop
      undefined, // marginBottom
      undefined, // marginX
      undefined, // marginY
      undefined, // gap
      undefined, // top
      undefined, // right
      undefined, // bottom
      undefined, // left
      undefined, // translateX
      undefined, // translateY
      "column", // flexDirection
      "center", // flexHorizontal
      "between", // flexVertical
    );

    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-between");
  });

  it("handles spacing tokens and dimensions", () => {
    const result = generateClasses(
      "16", // padding
      undefined,
      undefined,
      undefined,
      undefined,
      "24", // paddingX
      undefined,
      "8", // margin
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "12", // gap
    );

    expect(result).toContain("p-16");
    expect(result).toContain("px-24");
    expect(result).toContain("m-8");
    expect(result).toContain("gap-12");
  });

  it("handles background, borders, and radius", () => {
    const result = generateClasses(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "brand-medium", // background
      undefined, // solid
      undefined, // borderTop
      undefined, // borderBottom
      undefined, // borderRight
      undefined, // borderLeft
      undefined, // borderX
      undefined, // borderY
      "neutral-medium", // border
      "dashed", // borderStyle
      2, // borderWidth
      undefined, // topRadius
      undefined, // rightRadius
      undefined, // bottomRadius
      undefined, // leftRadius
      undefined, // topLeftRadius
      undefined, // topRightRadius
      undefined, // bottomLeftRadius
      undefined, // bottomRightRadius
      "m", // radius
      "s", // shadow
    );

    expect(result).toContain("bg-brand-background-medium");
    expect(result).toContain("border-neutral-border-medium");
    expect(result).toContain("border-dashed");
    expect(result).toContain("border-[2px]");
    expect(result).toContain("rounded-m");
    expect(result).toContain("shadow-s");
  });

  it("generates grid classes and responsive columns", () => {
    const result = generateClasses({
      display: "grid",
      columns: "3",
      rows: "2",
      gap: "16",
      fillWidth: true,
      s: { columns: 1 },
      m: { columns: 2 },
    });

    expect(result).toContain("grid");
    expect(result).toContain("grid-cols-3");
    expect(result).toContain("grid-rows-2");
    expect(result).toContain("gap-16");
    expect(result).toContain("w-full");
    expect(result).toContain("s:grid-cols-1");
    expect(result).toContain("m:grid-cols-2");
  });

  it("generates inline-grid and dark-grid classes", () => {
    const result = generateClasses({
      display: "grid",
      inline: true,
      columns: 4,
      dark: true,
    });

    expect(result).toContain("inline-grid");
    expect(result).toContain("grid-cols-4");
    expect(result).toContain("dark-grid");
  });

  it("generates typography classes and handles text variants", () => {
    const result = generateClasses({
      variant: "heading-strong-xl",
      align: "center",
      textWrap: "balance",
      truncate: true,
    });

    expect(result).toContain("font-heading");
    expect(result).toContain("font-strong");
    expect(result).toContain("font-xl");
    expect(result).toContain("text-center");
    expect(result).toContain("text-balance");
    expect(result).toContain("truncate");
  });

  it("handles responsive typography breakpoints", () => {
    const result = generateClasses({
      variant: "heading-strong-m",
      s: { align: "center", size: "s" },
      m: { size: "l", hide: true },
    });

    expect(result).toContain("font-heading");
    expect(result).toContain("font-strong");
    expect(result).toContain("font-m");
    expect(result).toContain("s:text-center");
    expect(result).toContain("s:font-s");
    expect(result).toContain("m:font-l");
    expect(result).toContain("m:hidden");
  });

  it("preserves font type, weight, and size simultaneously through cn", () => {
    const merged = cn("font-heading", "font-strong", "font-xl", "font-family-code");
    expect(merged).toContain("font-heading");
    expect(merged).toContain("font-strong");
    expect(merged).toContain("font-xl");
    expect(merged).toContain("font-family-code");
  });
});
