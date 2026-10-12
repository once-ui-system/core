import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  validate,
  applyFixes,
  PRE_2_PROPS,
  loadSpec,
  parseIconNames,
  openingTags,
  jsxElements,
  registeredIconNames,
  projectIconNames,
  isNextProject,
} = require("../../scripts/validate-ai-code.js");

type Issue = { rule: string; message: string; fix?: string };
type Options = { next?: boolean; icons?: { names: Set<string>; unresolved: boolean } };

const spec = loadSpec();
const iconNames = parseIconNames(spec);
const issues = (source: string, options: Options = {}): Issue[] =>
  validate(source, spec, iconNames, options);
const rules = (source: string, options: Options = {}): string[] =>
  issues(source, options).map((i) => i.rule);
const fixed = (source: string, options: Options = {}): string =>
  applyFixes(source, validate(source, spec, iconNames, options));

/** A throwaway project directory with the given files in it. */
function project(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "once-ui-validate-"));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

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

  it("leaves SVG paint to color.svgPaint", () => {
    const src = `<path d="M0 0" fill="#15D9EF" stroke="#15AAEF" />`;
    expect(rules(src)).not.toContain("color.tokens");
    expect(rules(src)).toContain("color.svgPaint");
  });
});

describe("color.svgPaint", () => {
  it("flags a literal colour painted onto inline SVG", () => {
    expect(rules(`<svg><path d="M0 0" fill="#15D9EF" /></svg>`)).toContain("color.svgPaint");
    expect(rules(`<svg><circle r="4" stroke={"#fff"} /></svg>`)).toContain("color.svgPaint");
    expect(rules(`<linearGradient><stop stopColor="rgb(1, 2, 3)" /></linearGradient>`)).toContain(
      "color.svgPaint",
    );
  });

  it("names the first offender and counts the rest", () => {
    const [issue] = issues(`<svg><path fill="#15D9EF" /><path stroke="#15AAEF" /></svg>`);
    expect(issue.message).toMatch(
      /^Literal colour in inline SVG: <path fill="#15D9EF"> \(and 1 more\)/,
    );
  });

  it("accepts currentColor, a token and the values that are not colours", () => {
    expect(
      rules(
        `<svg fill="none"><path fill="currentColor" stroke="var(--brand-solid-strong)" /><rect fill="url(#g)" /></svg>`,
      ),
    ).not.toContain("color.svgPaint");
  });

  it("looks only at intrinsic elements, not at a component's props", () => {
    expect(rules(`<Media fill src="/a.jpg" />`)).not.toContain("color.svgPaint");
    expect(rules(`<Background gradient={{ colorStart: "brand-solid-strong" }} />`)).not.toContain(
      "color.svgPaint",
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
    expect(rules(`<RevealFx delay={index * 0.1 * 1000} />`)).not.toContain("RevealFx.delay");
  });

  it("covers every effect whose timing is in milliseconds, and what extends one", () => {
    expect(rules(`<CountFx value={9} speed={1.5} />`)).toContain("RevealFx.delay");
    expect(rules(`<TypeFx words={w} delay={0.4} />`)).toContain("RevealFx.delay");
    // HoverCard extends Animation, whose delay is milliseconds.
    expect(rules(`<HoverCard trigger={t} delay={0.2} />`)).toContain("RevealFx.delay");
  });

  it("does not flag speed on effects where it is a multiplier", () => {
    for (const fx of ["MatrixFx", "WeatherFx", "ParticleFx", "CelebrationFx", "Effect"]) {
      expect(rules(`<${fx} speed={0.5} />`)).not.toContain("RevealFx.delay");
    }
  });

  it("names the component and prop it found", () => {
    const [issue] = issues(`<ShineFx speed={0.75}>Shine</ShineFx>`);
    expect(issue.message).toMatch(/^ShineFx speed is in milliseconds/);
  });
});

describe("Card.interactive", () => {
  it("flags a card nobody can operate", () => {
    expect(rules(`<Card padding="12">Static</Card>`)).toContain("Card.interactive");
  });

  it("accepts one whose props are spread in, which may carry the handler", () => {
    expect(rules(`<Card {...props}/>`)).not.toContain("Card.interactive");
    expect(rules(`<Card padding="12" {...rest}>Plan</Card>`)).not.toContain("Card.interactive");
  });

  it("is not fooled by a > inside a prop value", () => {
    expect(rules(`<Card onMouseEnter={() => a > b} onClick={pick} />`)).not.toContain(
      "Card.interactive",
    );
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
    // A bare border is --default-border, neutral-alpha-weak; neutral-weak is
    // the solid colour of that strength.
    expect(rules(`<Column border="neutral-weak" />`)).not.toContain("border.default");
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

  it("looks at the element's own group, not anything positioned in the file", () => {
    // Two components in one file: the sticky header in one does not make the
    // zIndex in the other part of a group.
    const src = `
      const Header = () => <Row position="sticky" top="0" />;
      const Body = () => (
        <Column>
          <Column zIndex={5} />
        </Column>
      );`;
    expect(rules(src)).toContain("zIndex.scope");
    expect(issues(src).find((i) => i.rule === "zIndex.scope")?.message).toMatch(/<Column>/);
  });

  it("accepts content over a layer that sits beside one of its ancestors", () => {
    expect(
      rules(
        `<Column><Background position="absolute" top="0" left="0" fill /><Row><Column zIndex={1} /></Row></Column>`,
      ),
    ).not.toContain("zIndex.scope");
  });

  it("accepts an element positioned through style, as floating UI does", () => {
    expect(rules(`<Column zIndex={9} style={{ position: strategy, top: y }} />`)).not.toContain(
      "zIndex.scope",
    );
    expect(rules(`<Column zIndex={9} style={{ position: "relative" }} />`)).toContain(
      "zIndex.scope",
    );
  });

  it("accepts an element whose spread props may carry the position", () => {
    expect(rules(`<Row fillWidth zIndex={3} {...flex} />`)).not.toContain("zIndex.scope");
  });
});

describe("layout.defaults — position", () => {
  it('flags position="relative" on a layout primitive, where it is the default', () => {
    expect(rules(`<Column position="relative" gap="16" />`)).toContain("layout.defaults");
    expect(rules(`<Row position={"relative"} />`)).toContain("layout.defaults");
  });

  it("looks at the element, not the file", () => {
    // Before, any position="relative" anywhere in the file — a string in a
    // comment, an override on a component positioned another way — counted.
    expect(rules(`<Column position="absolute" top="0" />`)).not.toContain("layout.defaults");
    expect(rules(`<Media position="relative" src="/a.jpg" />`)).not.toContain("layout.defaults");
    expect(rules(`// position="relative" is the default\n<Column gap="8" />`)).not.toContain(
      "layout.defaults",
    );
  });
});

describe("jsxElements", () => {
  it("groups siblings and keeps prop-value JSX out of the owner's children", () => {
    const els = jsxElements(
      `<Row><Card trigger={<Avatar />} /><Text>a</Text><img src="x" /></Row>`,
    );
    const byName = Object.fromEntries(
      els.map((e: { name: string; group: string }) => [e.name, e.group]),
    );
    expect(byName.Card).toBe(byName.Text);
    expect(byName.img).toBe(byName.Text);
    expect(byName.Avatar).not.toBe(byName.Text);
  });

  it("reads a type argument as a type, not a tag", () => {
    const els = jsxElements(`const [a] = useState<Item>(x); return <Row />;`);
    expect(els.map((e: { name: string }) => e.name)).toEqual(["Row"]);
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

describe("layout.shorthands — Flex direction", () => {
  it("flags a Flex whose direction never changes", () => {
    expect(rules(`<Flex direction="column" gap="16" />`)).toContain("layout.shorthands");
    expect(rules(`<Flex direction={"row"} gap="16" />`)).toContain("layout.shorthands");
  });

  it("accepts a Flex that changes direction at a breakpoint, which is what Flex is for", () => {
    expect(rules(`<Flex direction="column" m={{ direction: "row" }} gap="16" />`)).not.toContain(
      "layout.shorthands",
    );
    expect(rules(`<Flex direction="row" s={{ direction: "column", gap: "8" }} />`)).not.toContain(
      "layout.shorthands",
    );
  });

  it("does not read a direction off a nested tag or a breakpoint of another prop", () => {
    // The nested tag's direction is not this Flex's: it has none, so it is a Row.
    const found = issues(`<Flex trigger={<Card direction="column" />} onClick={() => a > b} />`)
      .filter((i) => i.rule === "layout.shorthands")
      .map((i) => i.message);
    expect(found).toEqual([expect.stringMatching(/^Use Row instead of a Flex with no direction/)]);
    expect(rules(`<Flex direction="column" m={{ gap: "8" }} />`)).toContain("layout.shorthands");
  });
});

describe("layout.shorthands — a Flex with no direction", () => {
  it("flags it as a Row, since Flex defaults to row", () => {
    const found = issues(`<Flex gap="8" vertical="center">a</Flex>`).filter(
      (i) => i.rule === "layout.shorthands",
    );
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/^Use Row instead of a Flex with no direction/);
    expect(found[0].fix).toBe("Row");
  });

  it("accepts one whose direction changes at a breakpoint", () => {
    expect(rules(`<Flex gap="8" s={{ direction: "column" }} />`)).not.toContain(
      "layout.shorthands",
    );
  });

  it("does not guess when spread props or an opaque breakpoint may carry a direction", () => {
    expect(rules(`<Flex gap="8" {...flex} />`)).not.toContain("layout.shorthands");
    expect(rules(`<Flex gap="8" s={responsive} />`)).not.toContain("layout.shorthands");
    expect(rules(`<Flex gap="8" s={{ ...mobile, gap: "4" }} />`)).not.toContain(
      "layout.shorthands",
    );
  });

  it("leaves a computed or reversed direction alone", () => {
    expect(rules(`<Flex direction={isMobile ? "column" : "row"} />`)).not.toContain(
      "layout.shorthands",
    );
    expect(rules(`<Flex direction="row-reverse" />`)).not.toContain("layout.shorthands");
  });
});

describe("layout.shorthands — Flex direction under --fix", () => {
  it("renames the element, closing tag included, and drops the literal direction", () => {
    expect(fixed(`<Flex direction="column" gap="16"><Text>a</Text></Flex>`)).toBe(
      `<Column gap="16"><Text>a</Text></Column>`,
    );
    expect(fixed(`<Flex direction={"row"} gap="16" />`)).toBe(`<Row gap="16" />`);
    expect(fixed(`<Flex gap="8">a</Flex>`)).toBe(`<Row gap="8">a</Row>`);
  });

  it("matches each closing tag to its own Flex, and leaves a real Flex as it is", () => {
    expect(
      fixed(
        `<Flex direction="column"><Flex direction="row" s={{ direction: "column" }}><Flex>a</Flex></Flex><Flex gap="4" /></Flex>`,
      ),
    ).toBe(
      `<Column><Flex direction="row" s={{ direction: "column" }}><Row>a</Row></Flex><Row gap="4" /></Column>`,
    );
  });

  it("keeps the report but not the rewrite when spread props might change the result", () => {
    const src = `<Flex direction="column" {...rest}>a</Flex>`;
    expect(rules(src)).toContain("layout.shorthands");
    expect(fixed(src)).toBe(src);
  });

  it("imports what it writes and drops Flex once nothing uses it", () => {
    expect(
      fixed(
        `import { Flex, Text } from "@once-ui-system/core";\n<Flex direction="column"><Text>a</Text></Flex>`,
      ),
    ).toBe(`import { Column, Text } from "@once-ui-system/core";\n<Column><Text>a</Text></Column>`);
    expect(
      fixed(
        `import {\n  Flex,\n  Text,\n} from "@once-ui-system/core";\n<Flex {...p}><Flex direction="row" /></Flex>`,
      ),
    ).toBe(
      `import {\n  Flex,\n  Row,\n  Text,\n} from "@once-ui-system/core";\n<Flex {...p}><Row /></Flex>`,
    );
  });

  it("does not rename a Flex that is not the package's", () => {
    const local = `import { Flex } from "./Flex";\n<Flex direction="column" />`;
    expect(fixed(local)).toBe(local);
    const aliased = `import { Row as Flex } from "@once-ui-system/core";\n<Flex direction="column" />`;
    expect(fixed(aliased)).toBe(aliased);
  });
});

describe("theme.typedProps", () => {
  it("flags a raw theme attribute where the component types the prop, and names it", () => {
    const [issue] = issues(`<Row data-border="rounded" gap="8" />`);
    expect(issue.rule).toBe("theme.typedProps");
    expect(issue.message).toBe(
      '<Row> takes the typed theme props — write themeBorder="rounded" for data-border="rounded"',
    );
    expect(rules(`<Column data-theme="dark" />`)).toContain("theme.typedProps");
    expect(rules(`<Background data-solid="color" fill />`)).toContain("theme.typedProps");
    expect(rules(`<Grid data-surface="translucent" columns="2" />`)).toContain("theme.typedProps");
  });

  it("leaves components without the typed props alone", () => {
    expect(rules(`<Button data-border="rounded" label="Go" />`)).not.toContain("theme.typedProps");
    expect(rules(`<IconButton data-border="rounded" icon="plus" />`)).not.toContain(
      "theme.typedProps",
    );
  });

  it("reads the StyleProps prop, not a component's own prop of the same name", () => {
    // ThemeProvider's `theme` is the app's theme, not a subtree's data-theme.
    expect(rules(`<ThemeProvider data-theme="dark" />`)).not.toContain("theme.typedProps");
    expect(rules(`<Tag data-border="rounded" label="New" />`)).toContain("theme.typedProps");
  });

  it("leaves a value the typed prop does not take, and attributes with no prop", () => {
    expect(rules(`<Row data-theme="system" />`)).not.toContain("theme.typedProps");
    expect(rules(`<Row data-brand="emerald" data-scaling="90" />`)).not.toContain(
      "theme.typedProps",
    );
  });

  it("does not read a nested tag's attributes as the parent's", () => {
    expect(rules(`<DropdownWrapper trigger={<Button data-border="rounded" />} />`)).not.toContain(
      "theme.typedProps",
    );
  });

  it("writes the typed prop under --fix and nothing else", () => {
    expect(fixed(`<Row data-border="rounded" gap="8"><Button data-border="rounded" /></Row>`)).toBe(
      `<Row themeBorder="rounded" gap="8"><Button data-border="rounded" /></Row>`,
    );
    expect(fixed(`<Background data-solid="color" data-theme={mode} fill />`)).toBe(
      `<Background themeSolid="color" theme={mode} fill />`,
    );
  });
});

describe("Icon.cast", () => {
  it("flags an icon name cast to IconName, however it is written", () => {
    expect(rules(`<Icon name={"rocketShip" as IconName} />`)).toContain("Icon.cast");
    expect(rules(`const items = [{ icon: kind as IconName }];`)).toContain("Icon.cast");
    expect(rules(`const icons = names as unknown as IconName[];`)).toContain("Icon.cast");
  });

  it("counts the casts", () => {
    const src = `const a = [{ icon: "code" as IconName }, { icon: "plus" as IconName }];`;
    expect(issues(src).find((i) => i.rule === "Icon.cast")?.message).toMatch(
      /^2 `as IconName` casts/,
    );
  });

  it("leaves typing alone: annotations, as const, satisfies, imports and comments", () => {
    const src = `
      import { type IconName } from "@once-ui-system/core";
      const links: { icon: IconName }[] = [{ icon: "book" }];
      const more = [{ icon: "code" as const }];
      const one = "home" satisfies IconName;
      // never write "x" as IconName
      /* "y" as IconName */`;
    expect(rules(src)).not.toContain("Icon.cast");
  });
});

describe("Icon.names", () => {
  it("reads the icon vocabulary from spec.iconNames", () => {
    expect(iconNames.size).toBeGreaterThan(50);
    expect(iconNames.has("check")).toBe(true);
    expect(parseIconNames({ iconNames: ["a"], tokens: { IconName: '"b" | "c"' } })).toEqual(
      new Set(["a", "b", "c"]),
    );
  });

  it("flags an unknown name on a prop typed IconName", () => {
    expect(rules(`<Icon name="rocketShip" />`)).toContain("Icon.names");
    expect(rules(`<IconButton icon="sparkles" />`)).toContain("Icon.names");
    expect(rules(`<Button prefixIcon="loading">Save</Button>`)).toContain("Icon.names");
    expect(rules(`<Tag suffixIcon={"github"} label="x" />`)).toContain("Icon.names");
  });

  it("accepts the names the package ships", () => {
    expect(rules(`<Icon name="check" /><IconButton icon="close" />`)).not.toContain("Icon.names");
    expect(rules(`<Button prefixIcon="plus" suffixIcon="chevronDown">Add</Button>`)).not.toContain(
      "Icon.names",
    );
  });

  it("looks only at props typed IconName, not at every name= or icon=", () => {
    expect(rules(`<Input id="e" name="email" label="Email" />`)).not.toContain("Icon.names");
    expect(rules(`<Logo icon="/trademark/icon.svg" />`)).not.toContain("Icon.names");
    expect(rules(`<Icon name={iconFor(kind)} />`)).not.toContain("Icon.names");
  });

  it("checks icon fields in data the spec types as IconName", () => {
    expect(rules(`const links = [{ label: "Docs", href: "/docs", icon: "bookz" }];`)).toContain(
      "Icon.names",
    );
    expect(rules(`const links = [{ label: "Docs", href: "/docs", icon: "book" }];`)).not.toContain(
      "Icon.names",
    );
    expect(rules(`const site = { icon: "/favicon.svg" };`)).not.toContain("Icon.names");
  });

  it("accepts names the file or the project registers", () => {
    const augmented = `
      declare module "@once-ui-system/core" {
        interface IconLibraryOverrides { rocket: true; "brand-x": true }
      }
      <Icon name="rocket" />`;
    expect(rules(augmented)).not.toContain("Icon.names");
    expect(
      rules(`<Icon name="rocket" />`, { icons: { names: new Set(["rocket"]), unresolved: false } }),
    ).not.toContain("Icon.names");
  });

  it("reads registrations derived from an icon object, the way the docs recommend", () => {
    const icons = `
      export const iconLibrary: Record<string, IconType> = {
        rocket: HiRocket,
        "github-mark": FaGithub, // brand
        europe,
      };
      declare module "@once-ui-system/core" {
        interface IconLibraryOverrides extends Record<keyof typeof iconLibrary, true> {}
      }`;
    expect([...registeredIconNames(icons).names].sort()).toEqual(
      ["europe", "github-mark", "rocket"].sort(),
    );
    const dir = project({ "package.json": "{}", "src/resources/icons.ts": icons });
    const found = projectIconNames(dir);
    expect(found.unresolved).toBe(false);
    expect(found.names.has("rocket")).toBe(true);
  });

  it("stands down when a registration cannot be read", () => {
    const opaque = `interface IconLibraryOverrides extends Record<keyof typeof icons, true> {}`;
    expect(registeredIconNames(opaque).unresolved).toBe(true);
    expect(
      rules(`<Icon name="anything" />`, { icons: { names: new Set(), unresolved: true } }),
    ).not.toContain("Icon.names");
  });
});

describe("LayoutProvider.next", () => {
  const rootImport = `import { Column, LayoutProvider } from "@once-ui-system/core";\n`;

  it("flags LayoutProvider from the package root in a Next.js app", () => {
    expect(rules(rootImport, { next: true })).toContain("LayoutProvider.next");
    expect(
      rules(`export { LayoutProvider } from "@once-ui-system/core";`, { next: true }),
    ).toContain("LayoutProvider.next");
  });

  it("treats a file that imports from next as a Next.js app", () => {
    expect(rules(`${rootImport}import type { Metadata } from "next";`)).toContain(
      "LayoutProvider.next",
    );
    expect(rules(`${rootImport}import { Inter } from "next/font/google";`)).toContain(
      "LayoutProvider.next",
    );
  });

  it("leaves other apps alone", () => {
    expect(rules(rootImport)).not.toContain("LayoutProvider.next");
    expect(rules(rootImport, { next: false })).not.toContain("LayoutProvider.next");
  });

  it("accepts the /next import, a type-only import, and composed adapters", () => {
    const opts = { next: true };
    expect(
      rules(`import { LayoutProvider } from "@once-ui-system/core/next";`, opts),
    ).not.toContain("LayoutProvider.next");
    expect(
      rules(`import type { LayoutProvider } from "@once-ui-system/core";`, opts),
    ).not.toContain("LayoutProvider.next");
    expect(
      rules(`${rootImport}import { NextAdapterProvider } from "@once-ui-system/core/next";`, opts),
    ).not.toContain("LayoutProvider.next");
  });

  it("moves the import under --fix and keeps the rest of the root import", () => {
    expect(fixed(rootImport, { next: true })).toBe(
      `import { Column } from "@once-ui-system/core";\nimport { LayoutProvider } from "@once-ui-system/core/next";\n`,
    );
    expect(fixed(`import { LayoutProvider } from "@once-ui-system/core";\n`, { next: true })).toBe(
      `import { LayoutProvider } from "@once-ui-system/core/next";\n`,
    );
  });

  it("merges into an existing /next import and keeps an alias", () => {
    const src = `import { LayoutProvider as Layout } from "@once-ui-system/core";\nimport { nextAdapters } from "@once-ui-system/core/next";\n`;
    // Composing the adapters by hand already does what /next does, so this
    // one is not flagged; force the fix to check the merge itself.
    expect(applyFixes(src, [{ rule: "LayoutProvider.next", fix: "next-layout-provider" }])).toBe(
      `import { nextAdapters, LayoutProvider as Layout } from "@once-ui-system/core/next";\n`,
    );
  });

  it("detects a Next.js project from the nearest package.json", () => {
    const app = project({
      "package.json": JSON.stringify({ dependencies: { next: "16.0.0" } }),
      "src/app/layout.tsx": "",
    });
    expect(isNextProject(path.join(app, "src", "app"))).toBe(true);
    // A library that supports Next lists it as a peer; that is not a Next app.
    const lib = project({ "package.json": JSON.stringify({ peerDependencies: { next: ">=15" } }) });
    expect(isNextProject(lib)).toBe(false);
  });
});

describe("api.renamed: 1.x prop names", () => {
  it("names the 2.x prop for a 1.x one, which TypeScript does not", () => {
    const found = issues(
      `<SegmentedControl buttons={b} selected="a" onToggle={(v) => set(v)} />\n<Dialog isOpen={open} title="Hi" onClose={close} />`,
    ).filter((issue) => issue.rule === "api.renamed");
    expect(found.map((issue) => issue.message)).toEqual([
      "SegmentedControl takes value in 2.x; selected is the 1.x name",
      "SegmentedControl takes onChange in 2.x; onToggle is the 1.x name",
      "Dialog takes open in 2.x; isOpen is the 1.x name",
    ]);
  });

  it("leaves the 2.x names, and old names 2.x reuses, alone", () => {
    expect(
      rules(
        `<SegmentedControl buttons={b} value="a" onChange={set} />\n<Media fill src="/a.jpg" />\n<Feedback icon />`,
      ),
    ).not.toContain("api.renamed");
  });

  it("only lists names the spec no longer has, so it never flags a valid prop", () => {
    type Entry = { props?: Record<string, string>; mixins?: string[]; extends?: string[] };
    const components = spec.components as Record<string, Entry>;
    const mixins = spec.mixins as Record<string, Record<string, string>>;
    const accepts = (name: string, prop: string, seen = new Set<string>()): boolean => {
      const entry = components[name];
      if (!entry || seen.has(name)) return false;
      seen.add(name);
      return (
        prop in (entry.props ?? {}) ||
        (entry.mixins ?? []).some((mixin) => prop in (mixins[mixin] ?? {})) ||
        (entry.extends ?? []).some((parent) => accepts(parent, prop, seen))
      );
    };
    for (const [name, renames] of Object.entries(
      PRE_2_PROPS as Record<string, Record<string, string>>,
    )) {
      expect(components[name], name).toBeDefined();
      for (const [old, now] of Object.entries(renames)) {
        expect(accepts(name, old), `${name}.${old}`).toBe(false);
        expect(accepts(name, now), `${name}.${now}`).toBe(true);
      }
    }
  });
});
