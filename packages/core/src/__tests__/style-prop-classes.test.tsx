import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { Heading } from "../components/Heading";
import { ServerFlex } from "../components/ServerFlex";
import { Text } from "../components/Text";
import type { BlendMode, BlurSize, UserSelect } from "../types";

/**
 * `user-select`, `mix-blend-mode` and blur had no prop, so the apps wrote them
 * in `style` — and any `style` object moves `Flex` and `Grid` to the client.
 * They are enumerable, so they are classes now: the element stays a server
 * component and the value is in the first paint.
 */
const DISPLAY = readFileSync(
  join(__dirname, "../../../foundations/scss/styles/display.generated.scss"),
  "utf8",
);

const USER_SELECT: UserSelect[] = ["none", "text", "all", "auto"];
const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "plus-lighter",
];
const BLUR_SIZES: BlurSize[] = ["xs", "s", "m", "l", "xl"];

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

const ruleFor = (cls: string) => {
  const at = DISPLAY.indexOf(`.${cls} {`);
  return at === -1 ? undefined : DISPLAY.slice(at, DISPLAY.indexOf("}", at));
};

describe("enumerable style props as classes", () => {
  it("has a rule behind every value the types allow", () => {
    const missing = [
      ...USER_SELECT.map((v) => `user-select-${v}`),
      ...BLEND_MODES.map((v) => `blend-mode-${v}`),
      ...BLUR_SIZES.map((v) => `blur-${v}`),
      ...BLUR_SIZES.map((v) => `backdrop-blur-${v}`),
    ].filter((cls) => !ruleFor(cls));
    expect(missing).toEqual([]);
  });

  it("writes the prefixed property Safari still needs", () => {
    expect(ruleFor("user-select-none")).toContain("-webkit-user-select: none;");
    expect(ruleFor("user-select-none")).toContain("user-select: none;");
    expect(ruleFor("backdrop-blur-m")).toContain("-webkit-backdrop-filter: blur(");
    expect(ruleFor("backdrop-blur-m")).toContain("backdrop-filter: blur(");
  });

  it("puts blur on the static spacing scale", () => {
    expect(ruleFor("blur-xs")).toContain("blur(var(--static-space-4))");
    expect(ruleFor("blur-m")).toContain("blur(var(--static-space-16))");
    expect(ruleFor("blur-xl")).toContain("blur(var(--static-space-48))");
  });

  it("lets backdropBlur win over the backdrop a surface background brings", () => {
    // `.surface-background` sets backdrop-filter too; it lives in an earlier
    // generated file, so the explicit prop wins at equal specificity.
    const index = readFileSync(
      join(__dirname, "../../../foundations/scss/styles/index.scss"),
      "utf8",
    );
    expect(index.indexOf("background.generated")).toBeLessThan(index.indexOf("display.generated"));
  });

  it("maps each prop to its class on Flex and Grid, on the server", () => {
    // Flex and Grid are each overloaded, so their union is not callable as JSX.
    for (const Component of [Flex, Grid] as React.ElementType[]) {
      // No LayoutProvider: the client path would throw.
      const html = renderToStaticMarkup(
        <Component userSelect="none" blendMode="color-dodge" blur="xl" backdropBlur="s">
          x
        </Component>,
      );
      const classes = classesOf(html);
      expect(classes).toContain("user-select-none");
      expect(classes).toContain("blend-mode-color-dodge");
      expect(classes).toContain("blur-xl");
      expect(classes).toContain("backdrop-blur-s");
      expect(html).not.toContain("style=");
      // None of the props leaks onto the DOM as an attribute.
      expect(html).not.toMatch(/userselect|blendmode|backdropblur|\sblur=/i);
    }
  });

  it("writes a number as px, inline, still on the server", () => {
    const html = renderToStaticMarkup(
      <Flex blur={0.125} backdropBlur={0.75}>
        x
      </Flex>,
    );
    expect(html).toContain("filter:blur(0.125px)");
    expect(html).toContain("backdrop-filter:blur(0.75px)");
    expect(html).toContain("-webkit-backdrop-filter:blur(0.75px)");
    expect(classesOf(html).some((cls) => cls.startsWith("blur-"))).toBe(false);
  });

  it("lets style override the blur, as the escape hatch it is", () => {
    // A `style` object sends Flex to the client; ServerFlex is the half that
    // writes the element, so test the merge there.
    const html = renderToStaticMarkup(
      <ServerFlex blur={1} style={{ filter: "grayscale(1)" }}>
        x
      </ServerFlex>,
    );
    expect(html).toContain("filter:grayscale(1)");
    expect(html).not.toContain("blur(1px)");
  });

  it("keeps userSelect off Text and Heading, which take the leaf props (3.0)", () => {
    // @ts-expect-error — a layout prop; wrap the text in a Row to set it.
    const text = renderToStaticMarkup(<Text userSelect="none">label</Text>);
    expect(text).toBeDefined();
  });

  it("leaves transform in style, where the animations drive it", () => {
    // @ts-expect-error — `transform` is deliberately not a prop.
    const el = <Flex transform="scale(2)">x</Flex>;
    expect(el).toBeDefined();
  });
});
