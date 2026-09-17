import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  validate,
  applyFixes,
  loadSpec,
  parseIconNames,
  openingTags,
} = require("../../scripts/validate-ai-code.js");

const spec = loadSpec();
const iconNames = parseIconNames(spec);
const rules = (source: string): string[] =>
  validate(source, spec, iconNames).map((i: { rule: string }) => i.rule);
const fixed = (source: string): string => applyFixes(source, validate(source, spec, iconNames));

describe("color.tokens", () => {
  it("flags a literal colour in an inline style", () => {
    expect(rules(`<Row style={{ background: "#fff" }} />`)).toContain("color.tokens");
  });

  it("flags a literal colour handed to a colour prop", () => {
    expect(rules(`<LinearGauge color="rgb(1, 2, 3)" />`)).toContain("color.tokens");
  });

  it("does not flag a string that merely looks like hex", () => {
    // An order id. `#1024` is a syntactically valid #RGBA literal, which is
    // why the old whole-file regex flagged every table of them.
    expect(rules(`const rows = [{ id: "#1024", total: "$129.00" }];`)).not.toContain(
      "color.tokens",
    );
  });

  it("does not flag SVG paint, which has no token form", () => {
    expect(rules(`<path d="M0 0" fill="#15D9EF" stroke="#15AAEF" />`)).not.toContain(
      "color.tokens",
    );
  });
});

describe("RevealFx.delay", () => {
  it("flags seconds, which is what 1.8.x took", () => {
    expect(rules(`<RevealFx delay={index * 0.1} />`)).toContain("RevealFx.delay");
    expect(rules(`<ShineFx speed={0.75} />`)).toContain("RevealFx.delay");
  });

  it("leaves milliseconds alone", () => {
    expect(rules(`<RevealFx delay={index * 100} />`)).not.toContain("RevealFx.delay");
    expect(rules(`<ShineFx speed={750} />`)).not.toContain("RevealFx.delay");
  });
});

describe("Card.interactive", () => {
  it("flags a card nobody can operate", () => {
    expect(rules(`<Card padding="12">Static</Card>`)).toContain("Card.interactive");
  });

  it("accepts one that is operable", () => {
    expect(rules(`<Card onClick={pick}>Plan</Card>`)).not.toContain("Card.interactive");
  });

  it("accepts one handed to a trigger, which its owner operates", () => {
    expect(rules(`<DropdownWrapper trigger={<Card gap="16"><Avatar /></Card>} />`)).not.toContain(
      "Card.interactive",
    );
  });
});

describe("layout.defaults", () => {
  it('flags lines="auto" on Textarea, which is now the default', () => {
    expect(rules(`<Textarea id="a" lines="auto" />`)).toContain("layout.defaults");
    expect(rules(`<Textarea id="a" lines={"auto"} />`)).toContain("layout.defaults");
  });

  it("leaves a fixed row count alone", () => {
    expect(rules(`<Textarea id="a" lines={3} />`)).not.toContain("layout.defaults");
  });

  it("does not reach lines on Background or CodeBlock", () => {
    expect(rules(`<Background lines={{ display: true }} />`)).not.toContain("layout.defaults");
    expect(rules(`<CodeBlock lines={{ display: true }} codes={[]} />`)).not.toContain(
      "layout.defaults",
    );
  });
});

describe("layout.defaults — props another prop implies", () => {
  it("flags fillWidth beside maxWidth on the same element", () => {
    expect(rules(`<Column fillWidth maxWidth="l" gap="40" />`)).toContain("layout.defaults");
    expect(rules(`<Column maxWidth={44} fillWidth />`)).toContain("layout.defaults");
  });

  it("leaves a computed maxWidth alone, since it may resolve to undefined", () => {
    const src = `<Column fillWidth maxWidth={isHero ? undefined : "xl"} />`;
    expect(rules(src)).not.toContain("layout.defaults");
    expect(fixed(src)).toBe(src);
  });

  it("leaves fillWidth and maxWidth on different elements alone", () => {
    expect(rules(`<Column fillWidth><Column maxWidth="l" /></Column>`)).not.toContain(
      "layout.defaults",
    );
  });

  it("flags minWidth={0} beside fillWidth", () => {
    expect(rules(`<Column fillWidth gap="12" flex={1} minWidth={0} />`)).toContain(
      "layout.defaults",
    );
    expect(rules(`<Row fillWidth minWidth="0" />`)).toContain("layout.defaults");
  });

  it("leaves minWidth={0} alone on a flex child that is not fillWidth", () => {
    expect(rules(`<Row vertical="center" gap="8" minWidth={0} />`)).not.toContain(
      "layout.defaults",
    );
  });

  it("is not fooled by a > inside a prop value", () => {
    expect(
      rules(`<Row onClick={() => count > 1} fillWidth><Column maxWidth="l" /></Row>`),
    ).not.toContain("layout.defaults");
  });

  it("drops the implied prop under --fix and nothing else", () => {
    expect(fixed(`<Column fillWidth maxWidth="l" gap="40">`)).toBe(
      `<Column maxWidth="l" gap="40">`,
    );
    expect(fixed(`<Column fillWidth gap="12" minWidth={0}>`)).toBe(`<Column fillWidth gap="12">`);
    expect(fixed(`<Column fillWidth><Row minWidth={0} /></Column>`)).toBe(
      `<Column fillWidth><Row minWidth={0} /></Column>`,
    );
  });
});

describe("border.default", () => {
  it("flags a border colour that restates the default, on any side", () => {
    expect(rules(`<Column border="neutral-alpha-weak" radius="l" />`)).toContain("border.default");
    expect(rules(`<Row borderBottom="neutral-alpha-weak" />`)).toContain("border.default");
    expect(rules(`<Column borderRight="neutral-alpha-weak" />`)).toContain("border.default");
  });

  it("leaves a colour that deviates from the default alone", () => {
    expect(rules(`<Column border="neutral-alpha-medium" />`)).not.toContain("border.default");
    expect(rules(`<Column border="brand-alpha-medium" />`)).not.toContain("border.default");
    expect(rules(`<Column border />`)).not.toContain("border.default");
  });

  it("does not reach a background or a Background layer's colour", () => {
    expect(rules(`<Row background="neutral-alpha-weak" />`)).not.toContain("border.default");
    expect(rules(`<Background dots={{ color: "neutral-alpha-weak" }} />`)).not.toContain(
      "border.default",
    );
  });

  it("rewrites to the bare prop under --fix", () => {
    expect(fixed(`<Column border="neutral-alpha-weak" radius="l">`)).toBe(
      `<Column border radius="l">`,
    );
    expect(fixed(`<Row fillWidth borderBottom="neutral-alpha-weak">`)).toBe(
      `<Row fillWidth borderBottom>`,
    );
  });
});

describe("zIndex.scope", () => {
  it("flags a zIndex with nothing positioned to stack against", () => {
    expect(rules(`<Column zIndex={2} gap="16" />`)).toContain("zIndex.scope");
  });

  it("accepts a zIndex inside a stacking group", () => {
    expect(
      rules(
        `<Column><Background position="absolute" top="0" left="0" fill /><Column zIndex={1} /></Column>`,
      ),
    ).not.toContain("zIndex.scope");
    expect(rules(`<Row position="sticky" top="0" zIndex={1} />`)).not.toContain("zIndex.scope");
  });
});

describe("nested JSX in a prop value", () => {
  it("does not read a nested tag's props as the parent's", () => {
    expect(
      rules(`<DropdownWrapper fillWidth dropdown={<Column maxWidth={20} fitHeight />} />`),
    ).not.toContain("layout.defaults");
  });

  it("still checks the nested tag on its own", () => {
    expect(rules(`<DropdownWrapper dropdown={<Column fillWidth maxWidth={20} />} />`)).toContain(
      "layout.defaults",
    );
    expect(fixed(`<DropdownWrapper dropdown={<Column fillWidth maxWidth={20} />} />`)).toBe(
      `<DropdownWrapper dropdown={<Column maxWidth={20} />} />`,
    );
  });

  it("rewrites the parent without touching the nested tag", () => {
    expect(fixed(`<Row fillWidth maxWidth="l" trigger={<Card fillWidth padding="8" />}>`)).toBe(
      `<Row maxWidth="l" trigger={<Card fillWidth padding="8" />}>`,
    );
  });
});

describe("openingTags", () => {
  it("reads a tag whose prop value contains a >", () => {
    const [tag] = openingTags(`<Row onClick={() => a > b} gap="8">x</Row>`);
    expect(tag.name).toBe("Row");
    expect(tag.attrs).toBe(` onClick={() => a > b} gap="8"`);
  });
});

describe("layout.shorthands — per element", () => {
  it("flags fillWidth + fillHeight and horizontal + vertical center on one element", () => {
    expect(rules(`<Row fillWidth fillHeight />`)).toContain("layout.shorthands");
    expect(rules(`<Row gap="12" vertical="center" wrap horizontal="center" />`)).toContain(
      "layout.shorthands",
    );
  });

  it("does not flag the pair split across a parent and its child", () => {
    expect(rules(`<Column fillWidth><Row fillHeight /></Column>`)).not.toContain(
      "layout.shorthands",
    );
    expect(
      rules(`<Row horizontal="center"><Row vertical="center" horizontal="between" /></Row>`),
    ).not.toContain("layout.shorthands");
  });

  it("collapses the pair to the shorthand under --fix, whatever sits between them", () => {
    expect(fixed(`<Row gap="12" vertical="center" wrap horizontal="center">`)).toBe(
      `<Row gap="12" center wrap>`,
    );
    expect(fixed(`<Row fillWidth gap="8" fillHeight>`)).toBe(`<Row fill gap="8">`);
  });
});
