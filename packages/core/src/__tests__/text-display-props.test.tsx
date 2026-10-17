import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";

/**
 * `Text` and `Heading` take `DisplayProps` and `SpacingProps` in their types,
 * and read only the padding, margin, `opacity` and `userSelect` among them.
 * Everything else — `pointerEvents`, `overflow`, `position`, `zIndex`, `gap`,
 * the offsets — was spread onto the element, so it reached the DOM as an
 * attribute that did nothing (and React warned about the camel-cased ones).
 * They resolve as `Flex` resolves them now: a class where foundations
 * generates one, inline where a class cannot hold the value. `inline`, `hide`,
 * `dark` and `light` are Flex and Grid display modes with no class that fits
 * text; they are taken out of the props and do nothing, as before.
 */
const STYLES = join(__dirname, "../../../foundations/scss/styles");
const GENERATED = ["display", "position", "spacing"]
  .map((name) => readFileSync(join(STYLES, `${name}.generated.scss`), "utf8"))
  .join("\n");

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

const styleOf = (html: string) => {
  const at = html.indexOf('style="');
  return at === -1 ? "" : html.slice(at + 7, html.indexOf('"', at + 7));
};

/** Every attribute name on the root element. */
const attributesOf = (html: string) =>
  [...html.slice(0, html.indexOf(">")).matchAll(/\s([^\s=>]+)(?==|\s|$)/g)].map((m) =>
    m[1].toLowerCase(),
  );

const LEAKED = [
  "pointerevents",
  "overflow",
  "overflowx",
  "overflowy",
  "scrollbar",
  "position",
  "transition",
  "zindex",
  "gap",
  "top",
  "right",
  "bottom",
  "left",
  "translatex",
  "translatey",
  "inline",
  "hide",
  "dark",
  "light",
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each([
  ["Text", Text],
  ["Heading", Heading],
] as const)("%s display props", (_name, Component) => {
  it("maps the ones with a class to that class, on the server", () => {
    const html = renderToStaticMarkup(
      <Component
        pointerEvents="none"
        position="absolute"
        overflow="hidden"
        overflowX="auto"
        transition="micro-medium"
        zIndex={0}
        opacity={0}
        gap="8"
        top="16"
        left="0"
      >
        x
      </Component>,
    );
    const classes = classesOf(html);
    const expected = [
      "pointer-events-none",
      "position-absolute",
      "overflow-hidden",
      "overflow-x-auto",
      // `overflowX="auto"` scrolls, so it takes the scrollbar styling, as on Flex.
      "scrollbar-minimal",
      "transition-micro-medium",
      "z-index-0",
      "opacity-0",
      "g-8",
      "top-16",
      "left-0",
    ];
    for (const cls of expected) expect(classes).toContain(cls);
    // Every one of them has a rule behind it.
    const dead = expected.filter(
      (cls) => cls !== "scrollbar-minimal" && !GENERATED.includes(`.${cls} {`),
    );
    expect(dead).toEqual([]);
    expect(GENERATED).toContain(".scrollbar-minimal::-webkit-scrollbar {");
  });

  it("writes a value a class cannot hold inline", () => {
    const style = styleOf(
      renderToStaticMarkup(
        <Component gap={0.5} top={2} right="50%" bottom="calc(100% - 1rem)" translateX={1}>
          x
        </Component>,
      ),
    );
    expect(style).toContain("gap:0.5px");
    expect(style).toContain("top:2px");
    expect(style).toContain("right:50%");
    expect(style).toContain("bottom:calc(100% - 1rem)");
    expect(style).toContain("transform:translate(1px, 0)");
  });

  it("lets style win over a resolved value", () => {
    const style = styleOf(
      renderToStaticMarkup(
        <Component top={2} style={{ top: "3px" }}>
          x
        </Component>,
      ),
    );
    expect(style).toContain("top:3px");
    expect(style).not.toContain("top:2px");
  });

  it("puts none of them on the DOM as an attribute", () => {
    const html = renderToStaticMarkup(
      <Component
        pointerEvents="auto"
        overflow="auto"
        overflowX="clip"
        overflowY="visible"
        scrollbar="default"
        position="sticky"
        transition="macro-long"
        zIndex={2}
        gap="-1"
        top="0"
        right={1}
        bottom="10vh"
        left="m"
        translateX="50%"
        translateY={-1}
        inline
        hide
        dark
        light
      >
        x
      </Component>,
    );
    const leaked = attributesOf(html).filter((attr) => LEAKED.includes(attr));
    expect(leaked).toEqual([]);
    expect(classesOf(html)).toContain("scrollbar-default");
    expect(classesOf(html)).toContain("g-horizontal--1");
  });

  it("gives inline, hide, dark and light no class", () => {
    const classes = classesOf(
      renderToStaticMarkup(
        <Component inline hide dark light>
          x
        </Component>,
      ),
    );
    expect(classes.filter((cls) => /flex|grid|hide|show|dark|light|inline/.test(cls))).toEqual([]);
  });

  it("raises no unknown-prop warning when it mounts", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <Component pointerEvents="none" overflowX="hidden" zIndex={1} translateY={1} hide dark>
        x
      </Component>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttributeNames().filter((attr) => LEAKED.includes(attr))).toEqual([]);
    expect(el.style.transform).toBe("translate(0, 1px)");
    const warnings = error.mock.calls.map((call) => String(call[0]));
    expect(warnings.filter((w) => /does not recognize|non-boolean attribute/.test(w))).toEqual([]);
  });
});
