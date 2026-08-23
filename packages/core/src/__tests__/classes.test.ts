import { describe, expect, it } from "vitest";
import { cn, extractDomProps, generateClasses, STYLE_PROP_KEYS } from "../classes";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("flex", false && "hidden", "items-center")).toBe("flex items-center");
    expect(cn("text-left", "text-center")).toBe("text-center");
    expect(cn("bg-neutral-weak", "bg-brand-medium")).toBe("bg-brand-medium");
  });

  it("handles null, undefined, boolean and empty string values gracefully", () => {
    expect(cn("flex", null, undefined, false, true && "w-full", "")).toBe("flex w-full");
  });

  it("overrides generated classes with user-provided className", () => {
    const generated = generateClasses({ padding: "4", background: "surface" });
    const merged = cn(generated, "p-8 custom-class");
    expect(merged).toContain("p-8");
    expect(merged).not.toContain("p-4");
    expect(merged).toContain("custom-class");
  });

  it("preserves font type, weight, and size simultaneously through cn", () => {
    const merged = cn("font-heading", "font-strong", "font-xl", "font-family-code");
    expect(merged).toContain("font-heading");
    expect(merged).toContain("font-strong");
    expect(merged).toContain("font-xl");
    expect(merged).toContain("font-family-code");
  });
});

describe("generateClasses - display & layout mode", () => {
  it("generates default flex display when flex properties are passed", () => {
    const res = generateClasses({ direction: "column", gap: "m" });
    expect(res).toContain("flex");
    expect(res).toContain("flex-col");
  });

  it("generates inline-flex when inline is true for flex container", () => {
    const res = generateClasses({ direction: "row", inline: true });
    expect(res).toContain("inline-flex");
    expect(res).toContain("flex-row");
  });

  it("generates grid and inline-grid displays", () => {
    expect(generateClasses({ display: "grid", columns: "3" })).toContain("grid");
    expect(generateClasses({ display: "grid", inline: true, columns: "3" })).toContain(
      "inline-grid",
    );
  });

  it("generates explicit display modes (block, inline-block, inline)", () => {
    expect(generateClasses({ display: "block" })).toContain("block");
    expect(generateClasses({ display: "inline-block" })).toContain("inline-block");
    expect(generateClasses({ display: "inline" })).toContain("inline");
  });

  it("generates hidden when hide is true", () => {
    expect(generateClasses({ hide: true })).toContain("hidden");
    expect(generateClasses({ display: "flex", hide: true })).toContain("hidden");
  });

  it("generates dark and light theme indicators", () => {
    expect(generateClasses({ dark: true })).toContain("dark-flex");
    expect(generateClasses({ light: true })).toContain("light-flex");
    expect(generateClasses({ display: "grid", dark: true })).toContain("dark-grid");
    expect(generateClasses({ display: "grid", light: true })).toContain("light-grid");
  });
});

describe("generateClasses - flexbox alignment & directions", () => {
  it("handles flex directions correctly", () => {
    expect(generateClasses({ direction: "row" })).toContain("flex-row");
    expect(generateClasses({ direction: "column" })).toContain("flex-col");
    expect(generateClasses({ direction: "row-reverse" })).toContain("flex-row-reverse");
    expect(generateClasses({ direction: "column-reverse" })).toContain("flex-col-reverse");
  });

  it("maps row alignment props (horizontal -> justify, vertical -> items)", () => {
    const res = generateClasses({
      direction: "row",
      horizontal: "center",
      vertical: "end",
    });
    expect(res).toContain("justify-center");
    expect(res).toContain("items-end");
  });

  it("maps row alignment props (between, stretch, even)", () => {
    const res = generateClasses({
      direction: "row",
      horizontal: "between",
      vertical: "stretch",
    });
    expect(res).toContain("justify-between");
    expect(res).toContain("items-stretch");

    const evenRes = generateClasses({
      direction: "row",
      horizontal: "even",
      vertical: "between",
    });
    expect(evenRes).toContain("justify-evenly");
    expect(evenRes).toContain("items-baseline");
  });

  it("maps column alignment props (horizontal -> items, vertical -> justify)", () => {
    const res = generateClasses({
      direction: "column",
      horizontal: "center",
      vertical: "end",
    });
    expect(res).toContain("items-center");
    expect(res).toContain("justify-end");
  });

  it("maps column alignment props (between, stretch, even)", () => {
    const res = generateClasses({
      direction: "column",
      horizontal: "between",
      vertical: "stretch",
    });
    expect(res).toContain("items-baseline");
    expect(res).toContain("justify-stretch");
  });

  it("handles center shorthand", () => {
    const res = generateClasses({ center: true });
    expect(res).toContain("justify-center");
    expect(res).toContain("items-center");
  });

  it("handles flexWrap and flex values", () => {
    expect(generateClasses({ wrap: true })).toContain("flex-wrap");
    expect(generateClasses({ flex: 1 })).toContain("flex-1");
    expect(generateClasses({ flex: "auto" })).toContain("flex-auto");
    expect(generateClasses({ flex: "initial" })).toContain("flex-initial");
    expect(generateClasses({ flex: "none" })).toContain("flex-none");
  });
});

describe("generateClasses - grid properties", () => {
  it("maps grid columns and rows with numbers and strings", () => {
    const res = generateClasses({
      display: "grid",
      columns: "4",
      rows: "2",
    });
    expect(res).toContain("grid-cols-4");
    expect(res).toContain("grid-rows-2");
  });

  it("handles 12-column grid and special values", () => {
    expect(generateClasses({ display: "grid", columns: 12 })).toContain("grid-cols-12");
    expect(generateClasses({ display: "grid", columns: "subgrid" })).toContain("grid-cols-subgrid");
    expect(generateClasses({ display: "grid", columns: "none" })).toContain("grid-cols-none");
  });
});

describe("generateClasses - spacing tokens (static & responsive)", () => {
  it("handles static numeric spacing tokens", () => {
    const res = generateClasses({
      padding: "16",
      margin: "32",
      gap: "24",
    });
    expect(res).toContain("p-16");
    expect(res).toContain("m-32");
    expect(res).toContain("gap-24");
  });

  it("handles responsive T-shirt spacing tokens", () => {
    const res = generateClasses({
      padding: "l",
      margin: "m",
      gap: "s",
    });
    expect(res).toContain("p-l");
    expect(res).toContain("m-m");
    expect(res).toContain("gap-s");
  });

  it("handles 0 spacing and special -1 gap token", () => {
    expect(generateClasses({ padding: "0", margin: "0", gap: "0" })).toContain("p-0");
    expect(generateClasses({ padding: "0", margin: "0", gap: "0" })).toContain("m-0");
    expect(generateClasses({ padding: "0", margin: "0", gap: "0" })).toContain("gap-0");
    expect(generateClasses({ gap: "-1" })).toContain("gap-[-1px]");
  });

  it("handles raw numeric pixel values", () => {
    const res = generateClasses({
      padding: 15,
      margin: 30,
      gap: 10,
    });
    expect(res).toContain("p-[15px]");
    expect(res).toContain("m-[30px]");
    expect(res).toContain("gap-[10px]");
  });
});

describe("generateClasses - directional padding & margin", () => {
  it("handles directional padding tokens (px, py, pt, pb, pl, pr)", () => {
    const res = generateClasses({
      paddingX: "l",
      paddingY: "m",
      paddingTop: "16",
      paddingBottom: "8",
      paddingLeft: "4",
      paddingRight: "2",
    });
    expect(res).toContain("px-l");
    expect(res).toContain("py-m");
    expect(res).toContain("pt-16");
    expect(res).toContain("pb-8");
    expect(res).toContain("pl-4");
    expect(res).toContain("pr-2");
  });

  it("handles directional margin tokens (mx, my, mt, mb, ml, mr)", () => {
    const res = generateClasses({
      marginX: "s",
      marginY: "xs",
      marginTop: "0",
      marginBottom: "24",
      marginLeft: "12",
      marginRight: "64",
    });
    expect(res).toContain("mx-s");
    expect(res).toContain("my-xs");
    expect(res).toContain("mt-0");
    expect(res).toContain("mb-24");
    expect(res).toContain("ml-12");
    expect(res).toContain("mr-64");
  });
});

describe("generateClasses - sizing & dimensions", () => {
  it("handles fill, fillWidth, and fillHeight boolean flags", () => {
    expect(generateClasses({ fill: true })).toContain("w-full h-full min-w-0 min-h-0");
    expect(generateClasses({ fillWidth: true })).toContain("w-full min-w-0");
    expect(generateClasses({ fillHeight: true })).toContain("h-full min-h-0");
  });

  it("handles fit, fitWidth, and fitHeight boolean flags", () => {
    expect(generateClasses({ fit: true })).toContain("w-fit h-fit");
    expect(generateClasses({ fitWidth: true })).toContain("w-fit");
    expect(generateClasses({ fitHeight: true })).toContain("h-fit");
  });

  it("handles dimension tokens and CSS units (px, rem, %, vh, dvh, vw, calc)", () => {
    const res = generateClasses({
      width: "320px",
      height: "100%",
      maxWidth: "90rem",
      maxHeight: "80vh",
      minWidth: "12rem",
      minHeight: "100dvh",
    });
    expect(res).toContain("w-[320px]");
    expect(res).toContain("h-[100%]");
    expect(res).toContain("max-w-[90rem]");
    expect(res).toContain("max-h-[80vh]");
    expect(res).toContain("min-w-[12rem]");
    expect(res).toContain("min-h-[100dvh]");
  });

  it("handles calc expressions in dimensions", () => {
    const res = generateClasses({
      height: "calc(100vh - 4rem)",
      width: "calc(100% - 32px)",
    });
    expect(res).toContain("h-[calc(100vh - 4rem)]");
    expect(res).toContain("w-[calc(100% - 32px)]");
  });

  it("handles aspectRatio prop", () => {
    expect(generateClasses({ aspectRatio: "16/9" })).toContain("aspect-[16/9]");
    expect(generateClasses({ aspectRatio: "1/1" })).toContain("aspect-[1/1]");
  });
});

describe("generateClasses - positioning & transforms", () => {
  it("handles position types and default sticky top-0", () => {
    expect(generateClasses({ position: "relative" })).toContain("relative");
    expect(generateClasses({ position: "absolute" })).toContain("absolute");
    expect(generateClasses({ position: "fixed" })).toContain("fixed");
    expect(generateClasses({ position: "sticky" })).toContain("sticky top-0");
  });

  it("handles explicit sticky top offset", () => {
    const res = generateClasses({ position: "sticky", top: "2rem" });
    expect(res).toContain("sticky");
    expect(res).toContain("top-[2rem]");
    expect(res).not.toContain("top-0");
  });

  it("handles top, right, bottom, left offsets with tokens and units", () => {
    const res = generateClasses({
      position: "absolute",
      top: "16",
      right: "24",
      bottom: "0",
      left: "50%",
    });
    expect(res).toContain("top-16");
    expect(res).toContain("right-24");
    expect(res).toContain("bottom-0");
    expect(res).toContain("left-[50%]");
  });

  it("handles translateX and translateY transforms", () => {
    const res = generateClasses({
      translateX: "2rem",
      translateY: "-50%",
    });
    expect(res).toContain("translate-x-[2rem]");
    expect(res).toContain("translate-y-[-50%]");
  });

  it("handles numeric translateX and translateY (interpreted as rem)", () => {
    const res = generateClasses({
      translateX: 2,
      translateY: -1,
    });
    expect(res).toContain("translate-x-[2rem]");
    expect(res).toContain("translate-y-[-1rem]");
  });
});

describe("generateClasses - colors, backgrounds, solids & borders", () => {
  it("handles special background tokens (page, surface, transparent, overlay)", () => {
    expect(generateClasses({ background: "page" })).toContain("bg-page");
    expect(generateClasses({ background: "surface" })).toContain("bg-surface");
    expect(generateClasses({ background: "transparent" })).toContain("bg-transparent");
    expect(generateClasses({ background: "overlay" })).toContain("bg-[var(--backdrop)]");
  });

  it("handles 2-part theme background colors (background tints)", () => {
    expect(generateClasses({ background: "brand-medium" })).toContain("bg-brand-background-medium");
    expect(generateClasses({ background: "neutral-weak" })).toContain("bg-neutral-background-weak");
    expect(generateClasses({ background: "accent-strong" })).toContain(
      "bg-accent-background-strong",
    );
    expect(generateClasses({ background: "danger-medium" })).toContain(
      "bg-danger-background-medium",
    );
  });

  it("handles alpha background colors", () => {
    expect(generateClasses({ background: "brand-alpha-medium" })).toContain(
      "bg-brand-alpha-medium",
    );
    expect(generateClasses({ background: "neutral-alpha-weak" })).toContain(
      "bg-neutral-alpha-weak",
    );
  });

  it("handles solid fills and sets both bg and on-solid text colors", () => {
    const res = generateClasses({ solid: "brand-medium" });
    expect(res).toContain("bg-brand-solid-medium");
    expect(res).toContain("text-brand-on-solid-medium");

    const neutralRes = generateClasses({ solid: "neutral-strong" });
    expect(neutralRes).toContain("bg-neutral-solid-strong");
    expect(neutralRes).toContain("text-neutral-on-solid-strong");
  });

  it("handles onBackground text colors", () => {
    expect(generateClasses({ onBackground: "neutral-weak" })).toContain(
      "text-neutral-on-background-weak",
    );
    expect(generateClasses({ onBackground: "brand-strong" })).toContain(
      "text-brand-on-background-strong",
    );
  });

  it("handles boolean border (defaults to neutral-border-medium)", () => {
    const res = generateClasses({ border: true });
    expect(res).toContain("border");
    expect(res).toContain("border-solid");
    expect(res).toContain("border-neutral-border-medium");
  });

  it("handles named color borders", () => {
    expect(generateClasses({ border: "neutral-alpha-medium" })).toContain(
      "border-neutral-alpha-medium",
    );
    expect(generateClasses({ border: "brand-medium" })).toContain("border-brand-border-medium");
    expect(generateClasses({ border: "surface" })).toContain("border-surface-border");
    expect(generateClasses({ border: "transparent" })).toContain("border-transparent");
  });

  it("handles directional borders (borderTop, borderBottom, borderLeft, borderRight, borderX, borderY)", () => {
    expect(generateClasses({ borderTop: true })).toContain("border-t border-neutral-border-medium");
    expect(generateClasses({ borderBottom: "brand-medium" })).toContain(
      "border-b border-brand-border-medium",
    );
    expect(generateClasses({ borderLeft: "danger-weak" })).toContain(
      "border-l border-danger-border-weak",
    );
    expect(generateClasses({ borderRight: true })).toContain(
      "border-r border-neutral-border-medium",
    );
    expect(generateClasses({ borderX: true })).toContain("border-x border-neutral-border-medium");
    expect(generateClasses({ borderY: "accent-strong" })).toContain(
      "border-y border-accent-border-strong",
    );

    const combined = generateClasses({
      borderTop: true,
      borderBottom: true,
      borderLeft: true,
      borderRight: true,
    });
    expect(combined).toContain("border-t");
    expect(combined).toContain("border-b");
    expect(combined).toContain("border-l");
    expect(combined).toContain("border-r");
    expect(combined).toContain("border-neutral-border-medium");
  });

  it("handles borderStyle and borderWidth", () => {
    const res = generateClasses({
      border: true,
      borderStyle: "dashed",
      borderWidth: 2,
    });
    expect(res).toContain("border-dashed");
    expect(res).toContain("border-[2px]");
  });
});

describe("generateClasses - radii & nested radii", () => {
  it("handles standard radii tokens (xs, s, m, l, xl, full, none)", () => {
    expect(generateClasses({ radius: "xs" })).toContain("rounded-xs");
    expect(generateClasses({ radius: "s" })).toContain("rounded-s");
    expect(generateClasses({ radius: "m" })).toContain("rounded-m");
    expect(generateClasses({ radius: "l" })).toContain("rounded-l");
    expect(generateClasses({ radius: "xl" })).toContain("rounded-xl");
    expect(generateClasses({ radius: "full" })).toContain("rounded-full");
    expect(generateClasses({ radius: "none" })).toContain("rounded-none");
  });

  it("handles nested radii tokens with nest prefix or short alias", () => {
    expect(generateClasses({ radius: "m-4" })).toContain("rounded-m-nest-4");
    expect(generateClasses({ radius: "m-nest-4" })).toContain("rounded-m-nest-4");
    expect(generateClasses({ radius: "l-8" })).toContain("rounded-l-nest-8");
    expect(generateClasses({ radius: "l-nest-8" })).toContain("rounded-l-nest-8");
  });

  it("handles directional and corner radii", () => {
    const res = generateClasses({
      topRadius: "m",
      bottomRadius: "s",
      leftRadius: "l",
      rightRadius: "xs",
    });
    expect(res).toContain("rounded-t-m");
    expect(res).toContain("rounded-b-s");
    expect(res).toContain("rounded-l-l");
    expect(res).toContain("rounded-r-xs");

    const cornerRes = generateClasses({
      topLeftRadius: "s",
      topRightRadius: "m",
      bottomLeftRadius: "l",
      bottomRightRadius: "xl",
    });
    expect(cornerRes).toContain("rounded-tl-s");
    expect(cornerRes).toContain("rounded-tr-m");
    expect(cornerRes).toContain("rounded-bl-l");
    expect(cornerRes).toContain("rounded-br-xl");
  });
});

describe("generateClasses - typography & text variants", () => {
  it("handles composite text variants (e.g. heading-strong-xl, body-default-m)", () => {
    const headingRes = generateClasses({ variant: "heading-strong-xl" });
    expect(headingRes).toContain("font-heading");
    expect(headingRes).toContain("font-strong");
    expect(headingRes).toContain("font-xl");

    const bodyRes = generateClasses({ variant: "body-default-m" });
    expect(bodyRes).toContain("font-body");
    expect(bodyRes).toContain("font-default");
    expect(bodyRes).toContain("font-m");

    const labelRes = generateClasses({ variant: "label-normal-s" });
    expect(labelRes).toContain("font-label");
    expect(labelRes).toContain("font-normal");
    expect(labelRes).toContain("font-s");
  });

  it("handles individual typography override props", () => {
    const res = generateClasses({
      size: "l",
      weight: "strong",
      family: "code",
      align: "center",
      textWrap: "balance",
      truncate: true,
    });
    expect(res).toContain("font-l");
    expect(res).toContain("font-strong");
    expect(res).toContain("font-family-code");
    expect(res).toContain("text-center");
    expect(res).toContain("text-balance");
    expect(res).toContain("truncate");
  });

  it("handles custom textFamily", () => {
    expect(generateClasses({ textFamily: "monospace" })).toContain("font-[monospace]");
  });
});

describe("generateClasses - effects, shadow, opacity, zIndex, cursor, transition", () => {
  it("handles shadow tokens", () => {
    expect(generateClasses({ shadow: "xs" })).toContain("shadow-xs");
    expect(generateClasses({ shadow: "s" })).toContain("shadow-s");
    expect(generateClasses({ shadow: "m" })).toContain("shadow-m");
    expect(generateClasses({ shadow: "l" })).toContain("shadow-l");
    expect(generateClasses({ shadow: "xl" })).toContain("shadow-xl");
  });

  it("handles opacity tokens (0, 10, 50, 100)", () => {
    expect(generateClasses({ opacity: 0 })).toContain("opacity-0");
    expect(generateClasses({ opacity: 50 })).toContain("opacity-50");
    expect(generateClasses({ opacity: 100 })).toContain("opacity-100");
  });

  it("handles zIndex (numbers and negative values)", () => {
    expect(generateClasses({ zIndex: 0 })).toContain("z-index-0");
    expect(generateClasses({ zIndex: 5 })).toContain("z-index-5");
    expect(generateClasses({ zIndex: -1 })).toContain("z-index--1");
  });

  it("handles transitions", () => {
    expect(generateClasses({ transition: "micro-short" })).toContain("transition-micro-short");
    expect(generateClasses({ transition: "micro-medium" })).toContain("transition-micro-medium");
    expect(generateClasses({ transition: "macro-long" })).toContain("transition-macro-long");
  });

  it("handles overflow, scrollbar, cursor, and pointerEvents", () => {
    const res = generateClasses({
      overflow: "hidden",
      overflowX: "auto",
      overflowY: "scroll",
      scrollbar: "minimal",
      cursor: "pointer",
      pointerEvents: "none",
    });
    expect(res).toContain("overflow-hidden");
    expect(res).toContain("overflow-x-auto");
    expect(res).toContain("overflow-y-scroll");
    expect(res).toContain("scrollbar-minimal");
    expect(res).toContain("cursor-pointer");
    expect(res).toContain("pointer-events-none");
  });
});

describe("generateClasses - responsive breakpoints (xl, l, m, s, xs)", () => {
  it("prefixes flex responsive overrides correctly", () => {
    const res = generateClasses({
      direction: "row",
      gap: "l",
      s: {
        direction: "column",
        gap: "s",
        padding: "m",
        horizontal: "center",
        fillWidth: true,
      },
      m: {
        gap: "m",
        padding: "l",
      },
    });

    expect(res).toContain("flex-row");
    expect(res).toContain("gap-l");
    expect(res).toContain("s:flex-col");
    expect(res).toContain("s:gap-s");
    expect(res).toContain("s:p-m");
    expect(res).toContain("s:items-center");
    expect(res).toContain("s:w-full");
    expect(res).toContain("s:min-w-0");
    expect(res).toContain("m:gap-m");
    expect(res).toContain("m:p-l");
  });

  it("prefixes grid responsive overrides correctly", () => {
    const res = generateClasses({
      display: "grid",
      columns: "4",
      gap: "24",
      s: { columns: 1, gap: "12" },
      m: { columns: 2, gap: "16" },
      l: { columns: 3 },
    });

    expect(res).toContain("grid");
    expect(res).toContain("grid-cols-4");
    expect(res).toContain("s:grid-cols-1");
    expect(res).toContain("s:gap-12");
    expect(res).toContain("m:grid-cols-2");
    expect(res).toContain("m:gap-16");
    expect(res).toContain("l:grid-cols-3");
  });

  it("handles responsive hide and show toggle", () => {
    const res = generateClasses({
      display: "flex",
      xs: { hide: true },
      m: { hide: false },
    });
    expect(res).toContain("xs:hidden");
    expect(res).toContain("m:flex");
  });

  it("handles responsive typography overrides", () => {
    const res = generateClasses({
      variant: "heading-strong-xl",
      s: { align: "center", size: "s" },
      m: { size: "l", weight: "normal" },
    });

    expect(res).toContain("font-heading");
    expect(res).toContain("font-strong");
    expect(res).toContain("font-xl");
    expect(res).toContain("s:text-center");
    expect(res).toContain("s:font-s");
    expect(res).toContain("m:font-l");
    expect(res).toContain("m:font-normal");
  });
});

describe("generateClasses - legacy positional arguments overload", () => {
  it("supports legacy 61-argument positional signature correctly", () => {
    const result = generateClasses(
      "16", // 0: padding
      undefined, // 1: paddingLeft
      undefined, // 2: paddingRight
      undefined, // 3: paddingTop
      undefined, // 4: paddingBottom
      "24", // 5: paddingX
      undefined, // 6: paddingY
      "8", // 7: margin
      undefined, // 8: marginLeft
      undefined, // 9: marginRight
      undefined, // 10: marginTop
      undefined, // 11: marginBottom
      undefined, // 12: marginX
      undefined, // 13: marginY
      "12", // 14: gap
      undefined, // 15: top
      undefined, // 16: right
      undefined, // 17: bottom
      undefined, // 18: left
      undefined, // 19: translateX
      undefined, // 20: translateY
      "column", // 21: flexDirection
      "center", // 22: flexHorizontal
      "between", // 23: flexVertical
      undefined, // 24: flexCenter
      undefined, // 25: flexWrap
      undefined, // 26: flex
      undefined, // 27: flexXl
      undefined, // 28: flexL
      undefined, // 29: flexM
      undefined, // 30: flexS
      undefined, // 31: flexXs
      undefined, // 32: textVariant
      undefined, // 33: textWrap
      undefined, // 34: textSize
      undefined, // 35: textWeight
      undefined, // 36: textAlign
      undefined, // 37: textType
      undefined, // 38: textFamily
      undefined, // 39: textTruncate
      undefined, // 40: width
      undefined, // 41: height
      undefined, // 42: maxWidth
      undefined, // 43: maxHeight
      undefined, // 44: fit
      undefined, // 45: fitWidth
      undefined, // 46: fitHeight
      undefined, // 47: fill
      true, // 48: fillWidth
      undefined, // 49: fillHeight
      undefined, // 50: aspectRatio
      "surface", // 51: background
      undefined, // 52: solid
      undefined, // 53: borderTop
      undefined, // 54: borderBottom
      undefined, // 55: borderRight
      undefined, // 56: borderLeft
      undefined, // 57: borderX
      undefined, // 58: borderY
      "neutral-medium", // 59: border
    );

    expect(result).toContain("flex");
    expect(result).toContain("flex-col");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-between");
    expect(result).toContain("p-16");
    expect(result).toContain("px-24");
    expect(result).toContain("m-8");
    expect(result).toContain("gap-12");
    expect(result).toContain("w-full");
    expect(result).toContain("bg-surface");
    expect(result).toContain("border-neutral-border-medium");
  });
});

describe("extractDomProps & STYLE_PROP_KEYS", () => {
  it("filters out all Once UI style props while preserving native HTML attributes", () => {
    const props = {
      id: "my-element",
      role: "banner",
      "aria-label": "Header",
      "data-testid": "header-test",
      tabIndex: 0,
      onClick: () => {},
      children: "Hello World",
      // Generator style props that should be filtered:
      padding: "l",
      paddingX: "m",
      margin: "0",
      marginBottom: "s",
      gap: "m",
      background: "page",
      border: "neutral-alpha-medium",
      fillWidth: true,
      minHeight: "100vh",
      direction: "column",
      horizontal: "center",
      vertical: "center",
      center: true,
      wrap: true,
      overflowX: "auto",
      zIndex: 10,
      radius: "l",
      shadow: "m",
      xs: { hide: true },
      s: { direction: "column" },
    };

    const domProps = extractDomProps(props);

    // Native attributes preserved:
    expect(domProps.id).toBe("my-element");
    expect(domProps.role).toBe("banner");
    expect(domProps["aria-label"]).toBe("Header");
    expect(domProps["data-testid"]).toBe("header-test");
    expect(domProps.tabIndex).toBe(0);
    expect(typeof domProps.onClick).toBe("function");
    expect(domProps.children).toBe("Hello World");

    // Generator style props stripped:
    expect(domProps.padding).toBeUndefined();
    expect(domProps.paddingX).toBeUndefined();
    expect(domProps.margin).toBeUndefined();
    expect(domProps.marginBottom).toBeUndefined();
    expect(domProps.gap).toBeUndefined();
    expect(domProps.background).toBeUndefined();
    expect(domProps.border).toBeUndefined();
    expect(domProps.fillWidth).toBeUndefined();
    expect(domProps.minHeight).toBeUndefined();
    expect(domProps.direction).toBeUndefined();
    expect(domProps.horizontal).toBeUndefined();
    expect(domProps.vertical).toBeUndefined();
    expect(domProps.center).toBeUndefined();
    expect(domProps.wrap).toBeUndefined();
    expect(domProps.overflowX).toBeUndefined();
    expect(domProps.zIndex).toBeUndefined();
    expect(domProps.radius).toBeUndefined();
    expect(domProps.shadow).toBeUndefined();
    expect(domProps.xs).toBeUndefined();
    expect(domProps.s).toBeUndefined();
  });

  it("contains all essential Once UI generator keys in STYLE_PROP_KEYS", () => {
    expect(STYLE_PROP_KEYS.has("padding")).toBe(true);
    expect(STYLE_PROP_KEYS.has("margin")).toBe(true);
    expect(STYLE_PROP_KEYS.has("gap")).toBe(true);
    expect(STYLE_PROP_KEYS.has("background")).toBe(true);
    expect(STYLE_PROP_KEYS.has("border")).toBe(true);
    expect(STYLE_PROP_KEYS.has("fillWidth")).toBe(true);
    expect(STYLE_PROP_KEYS.has("fillHeight")).toBe(true);
    expect(STYLE_PROP_KEYS.has("fitWidth")).toBe(true);
    expect(STYLE_PROP_KEYS.has("fitHeight")).toBe(true);
    expect(STYLE_PROP_KEYS.has("radius")).toBe(true);
    expect(STYLE_PROP_KEYS.has("shadow")).toBe(true);
    expect(STYLE_PROP_KEYS.has("direction")).toBe(true);
    expect(STYLE_PROP_KEYS.has("horizontal")).toBe(true);
    expect(STYLE_PROP_KEYS.has("vertical")).toBe(true);
    expect(STYLE_PROP_KEYS.has("center")).toBe(true);
    expect(STYLE_PROP_KEYS.has("wrap")).toBe(true);
    expect(STYLE_PROP_KEYS.has("xs")).toBe(true);
    expect(STYLE_PROP_KEYS.has("s")).toBe(true);
    expect(STYLE_PROP_KEYS.has("m")).toBe(true);
    expect(STYLE_PROP_KEYS.has("l")).toBe(true);
    expect(STYLE_PROP_KEYS.has("xl")).toBe(true);
  });
});
