import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column } from "../components/Column";
import { Grid } from "../components/Grid";
import { Row } from "../components/Row";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { cssColor } from "../internal/cssColor";
import { splitAlpha } from "../utils/colorAlpha";
import { borderColorValue } from "../utils/layoutClasses";

/**
 * Any colour token at any opacity: `background="brand/12"`,
 * `border="accent-strong/40"`, `background="gradient/16"`. 3.0 had three
 * alpha steps per tone (15, 30, 50%) and nothing between them, so a glow at
 * 12 or 22% meant a hand-made `--my-colour` variable.
 */

const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

describe("splitAlpha", () => {
  it("reads the opacity after a slash, clamped to 0–100", () => {
    expect(splitAlpha("brand/12")).toEqual(["brand", 12]);
    expect(splitAlpha("brand-strong/40%")).toEqual(["brand-strong", 40]);
    expect(splitAlpha("accent/140")).toEqual(["accent", 100]);
    expect(splitAlpha("brand-strong")).toEqual(["brand-strong", undefined]);
    expect(splitAlpha("brand/x")).toEqual(["brand/x", undefined]);
  });
});

describe("colour props at an opacity", () => {
  it("draws a tone itself from its alpha colour", () => {
    const { container } = render(<Column background="brand/12" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe(mix("var(--brand-alpha)", 12));
    expect(el.className).not.toMatch(/undefined|brand\/12/);
  });

  it("takes the role's own token for a weight", () => {
    const { container } = render(
      <Row background="accent-strong/40" border="brand-medium/22" borderStyle="dashed" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe(mix("var(--accent-background-strong)", 40));
    expect(el.style.borderColor).toBe(mix("var(--brand-border-medium)", 22));
    // The width and style classes still come from the border prop.
    expect(el.className).toContain("border-1");
    expect(el.className).toContain("border-dashed");
  });

  it("works on solid, on the alpha steps and on Grid", () => {
    const { container } = render(
      <>
        <Row solid="brand-strong/60" />
        <Grid background="neutral-alpha-strong/50" borderTop="danger/30" />
      </>,
    );
    const [row, grid] = Array.from(container.children) as HTMLElement[];
    expect(row.style.backgroundColor).toBe(mix("var(--brand-solid-strong)", 60));
    expect(grid.style.backgroundColor).toBe(mix("var(--neutral-alpha-strong)", 50));
    expect(grid.style.borderColor).toBe(mix("var(--danger-alpha)", 30));
  });

  it("leaves values without an opacity to their classes", () => {
    const { container } = render(<Row background="brand-alpha-weak" border="accent-medium" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("brand-background-alpha-weak");
    expect(el.className).toContain("accent-border-medium");
    expect(el.getAttribute("style")).toBeNull();
  });

  it("lets style win over the prop", () => {
    const { container } = render(<Row background="brand/12" style={{ backgroundColor: "red" }} />, {
      wrapper: LayoutProvider,
    });
    expect((container.firstElementChild as HTMLElement).style.backgroundColor).toBe("red");
  });

  it("writes breakpoint borders at an opacity too", () => {
    expect(borderColorValue("brand/22")).toBe(mix("var(--brand-alpha)", 22));
    expect(borderColorValue("brand-strong")).toBe("var(--brand-border-strong)");
  });
});

describe("the brand-to-accent gradient", () => {
  it("is a class at full strength and inline at an opacity", () => {
    const { container } = render(
      <>
        <Row background="gradient" />
        <Row background="gradient/16" />
      </>,
    );
    const [full, faint] = Array.from(container.children) as HTMLElement[];
    expect(full.className).toContain("gradient-background");
    expect(faint.style.backgroundImage).toContain(mix("var(--brand-color-strong)", 16));
    expect(faint.style.backgroundImage).toContain(mix("var(--accent-color-strong)", 16));
  });
});

describe("free colour props (cssColor)", () => {
  it("reads every form at an opacity", () => {
    expect(cssColor("brand/12")).toBe(mix("var(--brand-alpha)", 12));
    expect(cssColor("brand-strong/40")).toBe(mix("var(--brand-on-background-strong)", 40));
    expect(cssColor("brand-color-strong/22")).toBe(mix("var(--brand-color-strong)", 22));
    expect(cssColor("--my-hue/50")).toBe(mix("var(--my-hue)", 50));
    // A raw function keeps its own slash.
    expect(cssColor("rgb(0 0 0 / 50%)")).toBe("rgb(0 0 0 / 50%)");
  });
});

describe("tokens", () => {
  const theme = readFileSync(
    join(__dirname, "../../../foundations/scss/tokens/theme.scss"),
    "utf8",
  );

  it("defines each tone's alpha colour in both themes", () => {
    for (const tone of ["neutral", "brand", "accent", "info", "danger", "warning", "success"]) {
      expect(theme.match(new RegExp(`--${tone}-alpha:\\s`, "g"))?.length, tone).toBe(2);
    }
  });

  it("defines the accent hue and the gradient beside brand's", () => {
    expect(theme.match(/--accent-color-strong:/g)?.length).toBe(2);
    expect(theme.match(/--gradient-brand-accent:/g)?.length).toBe(2);
  });
});
