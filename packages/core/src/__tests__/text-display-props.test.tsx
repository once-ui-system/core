import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";
import { tokenLength as t } from "../utils/layoutClasses";

/**
 * 3.0 (G2): `Text` and `Heading` are leaves. They take their typography and
 * colour props and `LeafProps` (margins, `flex`, `fillWidth`, `position` and
 * the offsets), which resolve as `Flex` resolves them: a class where
 * foundations generates one, inline where a class cannot hold the value. The
 * layout props 2.x typed on them (padding, `gap`, `overflow`, `zIndex`,
 * `pointerEvents`, `translateX`, `inline`, `hide`, `showIn`…) are type errors;
 * a Row or Column around the text carries them.
 */
const STYLES = join(__dirname, "../../../foundations/scss/styles");
const GENERATED = ["display", "position", "spacing", "flex"]
  .map((name) => {
    try {
      return readFileSync(join(STYLES, `${name}.generated.scss`), "utf8");
    } catch {
      return "";
    }
  })
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

const LEAKED = ["position", "top", "right", "bottom", "left", "flex", "fillwidth", "margin"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each([
  ["Text", Text],
  ["Heading", Heading],
] as const)("%s leaf props", (_name, Component) => {
  it("maps the ones with a class to that class, on the server", () => {
    const html = renderToStaticMarkup(
      <Component position="absolute" top="16" left="0" marginTop="8" flex={1} fillWidth opacity={0}>
        x
      </Component>,
    );
    const classes = classesOf(html);
    // `position` is inline, as on every leaf whose root is not a Flex.
    expect(styleOf(html)).toContain("position:absolute");
    const expected = ["top-16", "left-0", "mt-8", "opacity-0"];
    for (const cls of expected) expect(classes).toContain(cls);
    expect(classes).toContain("flex-1");
    expect(classes).toContain("fill-width");
    // Every one of them has a rule behind it.
    const dead = expected.filter((cls) => !GENERATED.includes(`.${cls} {`));
    expect(dead).toEqual([]);
  });

  it("writes a value a class cannot hold inline", () => {
    const style = styleOf(
      renderToStaticMarkup(
        <Component top={2} right="50%" bottom="calc(100% - 1rem)" marginLeft={3}>
          x
        </Component>,
      ),
    );
    expect(style).toContain(`top:${t(2)}`);
    expect(style).toContain("right:50%");
    expect(style).toContain("bottom:calc(100% - 1rem)");
    expect(style).toContain(`margin-left:${t(3)}`);
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
    expect(style).not.toContain(`top:${t(2)}`);
  });

  it("puts none of them on the DOM as an attribute", () => {
    const html = renderToStaticMarkup(
      <Component position="sticky" top="0" right={1} bottom="10vh" left="m" flex={2} fillWidth>
        x
      </Component>,
    );
    expect(attributesOf(html).filter((attr) => LEAKED.includes(attr))).toEqual([]);
  });

  it("types the layout props out", () => {
    const elements = (
      <>
        {/* @ts-expect-error — padding is a layout prop: wrap the text in a Column */}
        <Component padding="8">x</Component>
        {/* @ts-expect-error — only `hide` changes at a breakpoint on text */}
        <Component s={{ direction: "column" }}>x</Component>
        {/* @ts-expect-error */}
        <Component hide>x</Component>
        {/* @ts-expect-error */}
        <Component gap="8">x</Component>
        {/* @ts-expect-error */}
        <Component zIndex={1}>x</Component>
        {/* @ts-expect-error */}
        <Component translateX={1}>x</Component>
        {/* @ts-expect-error */}
        <Component maxWidth={320}>x</Component>
      </>
    );
    expect(elements).toBeTruthy();
  });

  it("raises no unknown-prop warning when it mounts", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <Component position="relative" top={1} flex={1} marginX="auto">
        x
      </Component>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttributeNames().filter((attr) => LEAKED.includes(attr))).toEqual([]);
    expect(el.style.top).toBe(t(1));
    const warnings = error.mock.calls.map((call) => String(call[0]));
    expect(warnings.filter((w) => /does not recognize|non-boolean attribute/.test(w))).toEqual([]);
  });
});
