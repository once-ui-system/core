import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  STATIC_SPACING_TOKENS,
  tokenLength as t,
  translateTransform,
  translateValue,
} from "../utils/layoutClasses";

/**
 * `translateX` and `translateY` are typed `SpacingToken | number | CSSUnit`,
 * and the harness teaches the token (`translateY="16"`), but only a number and
 * a CSS unit resolved: a token wrote no transform at all, on Flex and Grid
 * alike. A token is its spacing variable now, the one the spacing classes
 * read. Text and Heading are leaves in 3.0 (G2) and take no translate.
 */
const TOKENS = readFileSync(
  join(__dirname, "../../../foundations/test/__snapshots__/tokens-custom-properties.txt"),
  "utf8",
).split("\n");

const styleOf = (html: string) => {
  const at = html.indexOf('style="');
  return at === -1 ? "" : html.slice(at + 7, html.indexOf('"', at + 7));
};

const attributesOf = (html: string) =>
  [...html.slice(0, html.indexOf(">")).matchAll(/\s([^\s=>]+)(?==|\s|$)/g)].map((m) =>
    m[1].toLowerCase(),
  );

// Each is overloaded, so their union is not callable as JSX.
const COMPONENTS: [string, React.ElementType][] = [
  ["Flex", Flex],
  ["Grid", Grid],
];

describe("translate values", () => {
  it("reads every spacing token as a variable foundations defines", () => {
    for (const token of STATIC_SPACING_TOKENS) {
      const value = translateValue(token);
      expect(value, token).toBe(`var(--static-space-${token})`);
      expect(TOKENS, token).toContain(`--static-space-${token}`);
    }
    for (const size of ["xs", "s", "m", "l", "xl"]) {
      expect(translateValue(size), size).toBe(`var(--responsive-space-${size})`);
      expect(TOKENS, size).toContain(`--responsive-space-${size}`);
    }
  });

  it("keeps a number as px and a CSS unit as written", () => {
    expect(translateValue(1.5)).toBe(t(1.5));
    expect(translateValue(-2)).toBe(t(-2));
    expect(translateValue(0)).toBe("0px");
    expect(translateValue("-50%")).toBe("-50%");
    expect(translateValue("10vw")).toBe("10vw");
    expect(translateValue("calc(100% - 1rem)")).toBe("calc(100% - 1rem)");
    expect(translateValue("16px")).toBe("16px");
    expect(translateValue("2.5rem")).toBe("2.5rem");
    // Not a token, not a unit: nothing, as before.
    expect(translateValue("16pixels")).toBeUndefined();
    expect(translateValue("16pt")).toBeUndefined();
    expect(translateValue("")).toBeUndefined();
    expect(translateValue(undefined)).toBeUndefined();
  });

  it("writes one translate, the unset axis 0", () => {
    expect(translateTransform("16", undefined)).toBe("translate(var(--static-space-16), 0)");
    expect(translateTransform(undefined, "m")).toBe("translate(0, var(--responsive-space-m))");
    expect(translateTransform("8", -1)).toBe(`translate(var(--static-space-8), ${t(-1)})`);
    expect(translateTransform(undefined, undefined)).toBeUndefined();
    expect(translateTransform("nope", undefined)).toBeUndefined();
  });
});

describe.each(COMPONENTS)("%s translateX / translateY", (_name, Component) => {
  it("writes a token as its spacing variable, on the server", () => {
    const style = styleOf(
      renderToStaticMarkup(
        <Component translateX="16" translateY="m">
          x
        </Component>,
      ),
    );
    expect(style).toContain(
      "transform:translate(var(--static-space-16), var(--responsive-space-m))",
    );
  });

  it("composes a token with a number or a CSS unit on the other axis", () => {
    expect(
      styleOf(
        renderToStaticMarkup(
          <Component translateX="-50%" translateY="8">
            x
          </Component>,
        ),
      ),
    ).toContain("transform:translate(-50%, var(--static-space-8))");
    expect(
      styleOf(
        renderToStaticMarkup(
          <Component translateX="72" translateY={-1}>
            x
          </Component>,
        ),
      ),
    ).toContain(`transform:translate(var(--static-space-72), ${t(-1)})`);
  });

  it("still writes a number as px and a CSS unit as written", () => {
    expect(styleOf(renderToStaticMarkup(<Component translateX={1.5}>x</Component>))).toContain(
      `transform:translate(${t(1.5)}, 0)`,
    );
    expect(
      styleOf(renderToStaticMarkup(<Component translateY="calc(100% - 1rem)">x</Component>)),
    ).toContain("transform:translate(0, calc(100% - 1rem))");
  });

  it("lets a transform in style replace it, as style replaces any resolved value", () => {
    // A `style` object moves Flex and Grid to the client, hence the provider.
    const { container } = render(
      <LayoutProvider>
        <Component translateX="16" style={{ transform: "scale(2)" }}>
          x
        </Component>
      </LayoutProvider>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.transform).toBe("scale(2)");
  });

  it("writes no transform without a translate, and no attribute either way", () => {
    expect(styleOf(renderToStaticMarkup(<Component>x</Component>))).not.toContain("transform");
    const html = renderToStaticMarkup(
      <Component translateX="16" translateY="s">
        x
      </Component>,
    );
    const leaked = attributesOf(html).filter(
      (attr) => attr === "translatex" || attr === "translatey",
    );
    expect(leaked).toEqual([]);
  });
});

describe("translate on the client path", () => {
  it("writes a token transform when Flex and Grid render through the client component", () => {
    // A breakpoint width moves both to the client; the base translate goes
    // through to the server component they wrap.
    const { container } = render(
      <LayoutProvider>
        <Flex translateY="16" m={{ width: 20 }}>
          flex
        </Flex>
        <Grid translateX="s" m={{ width: 20 }}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(flex.style.transform).toBe("translate(0, var(--static-space-16))");
    expect(grid.style.transform).toBe("translate(var(--responsive-space-s), 0)");
    for (const el of [flex, grid]) {
      expect(el.hasAttribute("translatex")).toBe(false);
      expect(el.hasAttribute("translatey")).toBe(false);
    }
  });
});
