import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { validate, loadSpec, parseIconNames } = require("../../scripts/validate-ai-code.js");

const spec = loadSpec();
const iconNames = parseIconNames(spec);
const rules = (source: string): string[] =>
  validate(source, spec, iconNames).map((i: { rule: string }) => i.rule);

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
    expect(rules(`const rows = [{ id: "#1024", total: "$129.00" }];`)).not.toContain("color.tokens");
  });

  it("does not flag SVG paint, which has no token form", () => {
    expect(rules(`<path d="M0 0" fill="#15D9EF" stroke="#15AAEF" />`)).not.toContain("color.tokens");
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
    expect(
      rules(`<DropdownWrapper trigger={<Card gap="16"><Avatar /></Card>} />`),
    ).not.toContain("Card.interactive");
  });
});

describe("layout.defaults", () => {
  it("flags lines=\"auto\" on Textarea, which is now the default", () => {
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
