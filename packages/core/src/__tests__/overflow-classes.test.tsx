import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";

/**
 * `overflow="clip"` and `"visible"` type-check on every layout primitive — the
 * props are `CSSProperties["overflow"]` — but foundations generated classes
 * for `auto`, `scroll` and `hidden` only. The other two reached the DOM as a
 * class name with no rule behind it, and the element kept whatever overflow it
 * already had.
 */
const DISPLAY = readFileSync(
  join(__dirname, "../../../foundations/scss/styles/display.generated.scss"),
  "utf8",
);

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

const VALUES = ["auto", "scroll", "hidden", "clip", "visible"] as const;

describe("overflow classes", () => {
  it("generates every value on every axis, at the base and at every breakpoint", () => {
    const missing: string[] = [];
    for (const bp of ["", "xl-", "l-", "m-", "s-", "xs-"]) {
      for (const axis of ["overflow", "overflow-x", "overflow-y"]) {
        for (const value of VALUES) {
          const cls = `.${bp}${axis}-${value} {`;
          if (!DISPLAY.includes(cls)) missing.push(cls);
        }
      }
    }
    // `overflow-x-auto` and its siblings existed already; this is the five
    // values on all three axes, with nothing left out.
    expect(missing).toEqual([]);
  });

  it("lets a longhand beat the shorthand beside it, for the new values too", () => {
    // `overflow="clip" overflowY="auto"` means "clip x, scroll y". With equal
    // specificity the later rule wins, so every shorthand has to come first.
    const base = DISPLAY.split("@media")[0];
    const at = (cls: string) => base.indexOf(`.${cls} {`);
    for (const shorthand of ["overflow-clip", "overflow-visible"]) {
      for (const longhand of ["overflow-x-auto", "overflow-y-auto", "overflow-y-scroll"]) {
        expect(at(shorthand), `${shorthand} before ${longhand}`).toBeLessThan(at(longhand));
      }
    }
    for (const longhand of ["overflow-x-clip", "overflow-y-visible"]) {
      for (const shorthand of ["overflow-hidden", "overflow-scroll", "overflow-auto"]) {
        expect(at(shorthand), `${shorthand} before ${longhand}`).toBeLessThan(at(longhand));
      }
    }
  });

  it("emits the class from Flex and Grid on the server path", () => {
    // Flex and Grid are each overloaded, so their union is not callable as JSX.
    for (const Component of [Flex, Grid] as React.ElementType[]) {
      const classes = classesOf(
        renderToStaticMarkup(
          <Component overflow="clip" overflowX="visible" overflowY="clip">
            x
          </Component>,
        ),
      );
      expect(classes).toContain("overflow-clip");
      expect(classes).toContain("overflow-x-visible");
      expect(classes).toContain("overflow-y-clip");
    }
  });

  it("gives clip and visible no scrollbar styling, since neither scrolls", () => {
    for (const value of ["clip", "visible", "hidden"] as const) {
      const classes = classesOf(renderToStaticMarkup(<Flex overflow={value}>x</Flex>));
      expect(classes, value).not.toContain("scrollbar-minimal");
    }
    for (const value of ["auto", "scroll"] as const) {
      const classes = classesOf(renderToStaticMarkup(<Grid overflowY={value}>x</Grid>));
      expect(classes, value).toContain("scrollbar-minimal");
    }
  });

  it("reaches the breakpoint classes without leaving the server", () => {
    // No LayoutProvider: the client path would throw here.
    const html = renderToStaticMarkup(
      <Flex overflow="hidden" s={{ overflow: "visible" }}>
        x
      </Flex>,
    );
    expect(classesOf(html)).toContain("s-overflow-visible");
    expect(classesOf(html)).toContain("xs-overflow-visible");
  });

  it("applies an xl overflow at xl as well as below it", () => {
    // Flex wrote `l-` through `xs-` for an `xl` object and skipped `xl-`
    // itself, so the value held everywhere except the one width it named.
    const classes = classesOf(renderToStaticMarkup(<Flex xl={{ overflowX: "clip" }}>x</Flex>));
    for (const bp of ["xl", "l", "m", "s", "xs"]) {
      expect(classes, bp).toContain(`${bp}-overflow-x-clip`);
    }
  });
});
