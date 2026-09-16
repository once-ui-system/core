import { describe, expect, it } from "vitest";
import spec from "../../ai/spec.json";

/**
 * The spec resolved a component's props but not the types those props named.
 * `series: SeriesConfig | SeriesConfig[]` pointed at a shape the spec never
 * defined, so a chart API that was finally visible still was not usable — two
 * clean-context agents hit it independently and reverse-engineered the row
 * shape from an example.
 */
const types = spec.types as unknown as Record<string, string[] | Record<string, string> | string>;
const components = spec.components as unknown as Record<string, { props?: Record<string, string> }>;
const mixins = spec.mixins as unknown as Record<string, Record<string, string>>;

/** Words that appear in a prop string but are not a type the spec should own. */
const NOT_A_TYPE = new Set([
  // TS and DOM builtins
  "Array",
  "ChangeEvent",
  "CSSProperties",
  "Date",
  "ElementType",
  "FC",
  "HTMLAttributes",
  "HTMLButtonElement",
  "HTMLDivElement",
  "HTMLElement",
  "HTMLInputElement",
  "MouseEvent",
  "MouseEventHandler",
  "FocusEventHandler",
  "Omit",
  "Partial",
  "Promise",
  "React",
  "ReactNode",
  "Record",
  "Ref",
  "RefObject",
  "ComponentProps",
  "File",
  // literal values that happen to be capitalised
  "ANIMATION_DURATION",
  "An",
  "DD",
  "Drag",
  "End",
  "HH",
  "Loading",
  "MM",
  "MMM",
  "No",
  "SS",
  "Search",
  "Seek",
  "Start",
  "Toggle",
  // a generic parameter, not a nameable type: `items: T[]` on InfiniteScroll
  "T",
]);

const referenced = () => {
  const blob = [
    ...Object.values(components).flatMap((c) => Object.values(c.props ?? {})),
    ...Object.values(mixins).flatMap((m) => Object.values(m)),
  ].join("\n");
  return [...new Set([...blob.matchAll(/\b[A-Z][A-Za-z0-9_]*\b/g)].map((m) => m[0]))];
};

describe("spec types", () => {
  it.each([
    "SeriesConfig",
    "DataPoint",
    "LegendConfig",
    "DateConfig",
    "BarWidth",
    "TableHeader",
    "GridSize",
    "Opacity",
    "curveType",
    "AccordionItem",
    "ButtonOption",
    "GradientProps",
    "Placement",
    "FlexValue",
  ])("resolves %s", (name) => {
    expect(types[name]).toBeDefined();
  });

  it("gives a chart its row and series shape, not just their names", () => {
    expect(types.SeriesConfig).toMatchObject({ key: "!string" });
    // DataPoint's whole point is the index signature — series keys live there.
    expect(Object.keys(types.DataPoint as Record<string, string>)).toContain("[key: string]");
  });

  it("enumerates a union that mixes literals with a primitive", () => {
    // Dropped entirely before, because `number` is not a string literal.
    expect(types.BarWidth).toEqual(expect.arrayContaining(["number", "fill", "l"]));
  });

  it("names the props that take a breakpoint object, not the mapped type's text", () => {
    // Was sixty lines of declaration text with section comments in it. The
    // question this type answers is which props accept `{ s: ..., m: ... }`,
    // and only the key list answers it.
    const flex = types.FlexBreakpointProps as string[];
    expect(flex).toEqual(expect.arrayContaining(["gap", "direction", "padding", "hide"]));
    expect(types.GridBreakpointProps).toEqual(expect.arrayContaining(["columns", "rows"]));
    // Grid takes columns/rows where Flex takes direction: they are not aliases.
    expect(flex).not.toContain("columns");
  });

  it("points at the component rather than inlining its whole surface", () => {
    expect(types.AvatarProps).toBe("Avatar props");
  });

  it("emits the same text whatever the checkout's line endings are", () => {
    // A multi-line object default kept its source newlines, so the committed
    // artifacts flip-flopped between a CRLF checkout and an LF one.
    expect(JSON.stringify(spec)).not.toMatch(/\\r|\\n {2,}/);
  });

  it("leaves no prop naming a type the spec cannot resolve", () => {
    const unresolved = referenced().filter(
      (name) => !NOT_A_TYPE.has(name) && !types[name] && !components[name] && !mixins[name],
    );
    expect(unresolved).toEqual([]);
  });
});
