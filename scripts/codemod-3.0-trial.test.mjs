/**
 * Regression tests for the 2.x → 3.0 codemod, from the second trial
 * migration (five apps): what the hand-fixed diffs did that the codemod
 * should have, and the reports it gave wrongly or not at all.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { detectOneX, majorOf, oneXSigns } from "./codemod-3.0-detect.mjs";
import { numberKind } from "./codemod-3.0-values.mjs";
import { transform } from "./codemod-3.0.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "codemod-3.0.mjs");
const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const run = (src, file = "/app/src/a.tsx") => transform(src, { file });
const body = (src, file) => run(src, file).out.split("\n").slice(1).join("\n");

/** A small app on disk: `files` is { path: text }. Removed by the caller. */
function app(files) {
  const root = mkdtempSync(join(tmpdir(), "codemod-trial-"));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), text);
  }
  return root;
}

describe("a number reaching a size prop through a variable", () => {
  it("writes a template at the use site when every value is a number", () => {
    // Arithmetic on a same-file const, a field of a mapped array, a typed prop.
    assert.equal(
      body(`${core("Column")}const HOUR = 4;\nexport const A = ({ hours }) => <Column height={hours.length * HOUR} />;\n`),
      "const HOUR = 4;\nexport const A = ({ hours }) => <Column height={`${hours.length * HOUR}rem`} />;\n",
    );
    assert.match(
      body(`${core("Column, Row")}const CARDS = [{ w: 10 }, { w: 12 }];\nexport const A = () => <Row>{CARDS.map((c) => <Column key={c.w} width={c.w} />)}</Row>;\n`),
      /width=\{`\$\{c\.w\}rem`\}/,
    );
    assert.match(
      body(`${core("Column")}interface P { w: number; label: string }\nexport function A({ w }: P) { return <Column maxWidth={w} />; }\n`),
      /maxWidth=\{`\$\{w\}rem`\}/,
    );
  });

  it("follows a config imported from the app's own files", () => {
    const root = app({
      "src/config.js": "export const layout = { content: { width: 44 } };\n",
      "src/Page.tsx": `${core("Column")}import { layout } from "./config";\nexport const P = () => <Column maxWidth={layout.content.width} />;\n`,
    });
    try {
      const file = join(root, "src/Page.tsx");
      const r = run(`${core("Column")}import { layout } from "./config";\nexport const P = () => <Column maxWidth={layout.content.width} />;\n`, file);
      assert.match(r.out, /maxWidth=\{`\$\{layout\.content\.width\}rem`\}/);
      assert.deepEqual(r.warnings, []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("is quiet on strings: a function returning a percentage, a string-union type, a destructured result", () => {
    for (const src of [
      `${core("Column")}export const A = ({ at }: { at: number }) => { const top = (n: number) => \`\${n * 10}%\` as const; return <Column position="absolute" top={top(at)} />; };\n`,
      `${core("Column")}type W = "m" | "l" | "xl";\nexport const A = ({ width }: { width: W }) => <Column maxWidth={width} />;\n`,
      `${core("Row")}const at = (a: number) => {\n  const r = a * 2;\n  return { left: \`\${r}%\`, top: "0" } as const;\n};\nexport const A = () => { const { left, top } = at(3); return <Row position="absolute" left={left} top={top} />; };\n`,
      `${core("Row")}export const A = ({ note }: { note?: { top: \`\${number}%\` } }) => <Row position="absolute" top={note?.top ?? "0"} />;\n`,
    ]) {
      const r = run(src);
      assert.equal(r.out, src, src);
      assert.deepEqual(r.warnings, [], src);
    }
  });

  it("reads a function's declared return type, imported from another file", () => {
    const root = app({
      "src/width.ts": 'export type SiteMaxWidth = "m" | "l";\nexport const siteMaxWidth = (s: { w?: string }): SiteMaxWidth =>\n  s.w === "s" ? "m" : "l";\n',
    });
    try {
      const src = `${core("Column")}import { siteMaxWidth } from "./width";\nexport const P = ({ s }) => <Column maxWidth={siteMaxWidth(s)} />;\n`;
      const r = run(src, join(root, "src/P.tsx"));
      assert.equal(r.out, src);
      assert.deepEqual(r.warnings, []);
      assert.equal(numberKind({ file: join(root, "src/P.tsx"), src }, src.indexOf("siteMaxWidth(s)"), src.indexOf("siteMaxWidth(s)") + 15).kind, "str");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("takes the const of the block the read is in", () => {
    const out = body(
      `${core("Column")}export const A = () => { const n = 4; const f = () => { const n = "50%"; return <Column width={n} />; }; return <Column width={n} />; };\n`,
    );
    assert.match(out, /const n = "50%"; return <Column width=\{n\} \/>/);
    assert.match(out, /return <Column width=\{`\$\{n\}rem`\} \/>; \};\n$/);
  });

  it("reports a value that is a number only sometimes, with where the numbers are", () => {
    const { warnings } = run(`${core("Column")}const W = { a: 12, b: "100%" };\nexport const A = ({ k }: { k: "a" | "b" }) => <Column maxWidth={W[k]} />;\n`);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /W\[k\] is a number \(line 2\) or a string/);
    assert.match(warnings[0], /\(line 3\)$/);
  });

  it("reports each site of a value it cannot read, on its own line", () => {
    const { warnings } = run(`${core("Column, Row")}export const A = ({ w }) => (<Row><Column maxWidth={w} />\n<Column minWidth={w} /></Row>);\n`);
    assert.equal(warnings.length, 2);
    assert.match(warnings[0], /maxWidth=\{w\}.*\(line 2\)$/);
    assert.match(warnings[1], /minWidth=\{w\}.*\(line 3\)$/);
  });

  it("leaves the call sites of a wrapper that makes the number rem itself", () => {
    // The wrapper's own `minWidth={minWidth ?? 12}` becomes a template; `<Choose minWidth={16}>` stays 16rem.
    const src =
      `${core("Column")}const Choose = ({ minWidth }: { minWidth?: number }) => <Column minWidth={minWidth ?? 12} />;\n` +
      "export const A = () => <Choose minWidth={16} />;\n";
    const r = run(src);
    assert.match(r.out, /<Column minWidth=\{`\$\{minWidth \?\? 12\}rem`\} \/>/);
    assert.match(r.out, /<Choose minWidth=\{16\} \/>/);
    assert.deepEqual(r.warnings, []);
    // Only in an inline style, a number is px before and after.
    const styled = `${core("Row")}function Brand({ height = 24 }: { height?: number }) { return <Row style={{ height, maxWidth: height * 8 }} />; }\nexport const B = () => <Brand height={32} />;\n`;
    assert.deepEqual(run(styled).warnings, []);
  });
});

describe("the dataStyle height", () => {
  it("casts the use site of a config it rewrote, in TypeScript only", () => {
    const src = `${core("DataThemeProvider")}const dataStyle = { height: 24 };\nexport const P = () => <DataThemeProvider height={dataStyle.height} />;\n`;
    assert.equal(
      body(src),
      'const dataStyle = { height: "24rem" };\nexport const P = () => <DataThemeProvider height={dataStyle.height as `${number}rem`} />;\n',
    );
    assert.match(body(src, "/app/src/a.jsx"), /height=\{dataStyle\.height\} \/>/);
    assert.equal(run(run(src).out).out, run(src).out);
  });

  it("leaves a typed config alone and writes the template at the use site", () => {
    assert.equal(
      body(`${core("DataThemeProvider")}type DS = { height: number };\nconst dataStyle: DS = { height: 24 };\nexport const P = () => <DataThemeProvider height={dataStyle.height} />;\n`),
      "type DS = { height: number };\nconst dataStyle: DS = { height: 24 };\nexport const P = () => <DataThemeProvider height={`${dataStyle.height}rem`} />;\n",
    );
  });
});

describe("leaf props the parent did not count as layout", () => {
  it("reaches an element after a regex literal with // in it", () => {
    assert.match(
      body(`${core("Column, Text")}const re = /^https?:\\/\\//;\nexport const A = ({ ok }) => (<Column>{ok ? <Text padding="8">a</Text> : null}</Column>);\n`),
      /\{ok \? <Column padding="8"><Text>a<\/Text><\/Column> : null\}/,
    );
  });

  it("wraps a visibility-only leaf in a JSX prop's value in a Row", () => {
    assert.match(
      body(`${core("NavIcon, Fade")}export const A = () => <Fade trigger={<NavIcon hide m={{ hide: false }} onClick={go} />} />;\n`),
      /trigger=\{<Row hide m=\{\{ hide: false \}\}><NavIcon onClick=\{go\} \/><\/Row>\}/,
    );
  });

  it("wraps a leaf inside a layout element with `as`", () => {
    assert.match(body(`${core("Row, Text")}export const A = () => <Row as="li"><Text paddingX="8">a</Text></Row>;\n`), /<Row as="li"><Column paddingX="8"><Text>a<\/Text><\/Column><\/Row>/);
  });

  it("moves an absolutely placed leaf's placement, and its key, to the Row", () => {
    assert.match(
      body(`${core("Avatar, Row")}export const A = ({ xs }) => <Row>{xs.map((x) => <Avatar key={x} value={x} position="absolute" top="0" left="50%" translateX="-50%" />)}</Row>;\n`),
      /<Row key=\{x\} position="absolute" top="0" left="50%" translateX="-50%"><Avatar value=\{x\} \/><\/Row>/,
    );
  });

  it("drops a field's height, which 2.x handed to the native input", () => {
    const r = run(`${core("Input, NumberInput, Row")}export const A = () => (<Row><Input id="a" height="s" /><NumberInput id="b" height="s" /><Input type="image" height="20" src="a" /></Row>);\n`);
    assert.match(r.out, /<Input id="a" \/><NumberInput id="b" \/><Input type="image" height="20" src="a" \/>/);
    assert.equal(r.hits.filter((h) => /height dropped/.test(h)).length, 2);
  });

  it("names the Row's props in a type that picked them from the leaf", () => {
    const out = body(
      `${core("Icon, Row")}type A = Pick<ComponentProps<typeof Icon>, "onBackground" | "background">;\ntype B = Pick<ComponentProps<typeof Icon>, "name" | "border">[];\ntype C = ComponentProps<typeof Icon>["border"];\n`,
    );
    assert.equal(
      out,
      'type A = Pick<ComponentProps<typeof Icon>, "onBackground"> & Pick<ComponentProps<typeof Row>, "background">;\n' +
        'type B = (Pick<ComponentProps<typeof Icon>, "name"> & Pick<ComponentProps<typeof Row>, "border">)[];\n' +
        'type C = ComponentProps<typeof Row>["border"];\n',
    );
  });
});

describe("renamed props read through a type", () => {
  it("renames the key of ComponentProps<typeof Text> and TextProps", () => {
    assert.equal(
      body(`${core("Text, type TextProps")}type A = React.ComponentProps<typeof Text>["variant"];\ntype B = TextProps["variant"];\n`),
      'type A = React.ComponentProps<typeof Text>["textVariant"];\ntype B = TextProps["textVariant"];\n',
    );
  });
});

describe("tone through a ternary and built data", () => {
  it("splits a Button variant ternary holding danger into variant and tone", () => {
    assert.match(
      body(`${core("Button")}export const A = ({ bad }) => <Button variant={bad ? "danger" : "secondary"}>x</Button>;\n`),
      /<Button variant=\{bad \? "primary" : "secondary"\} tone=\{bad \? "danger" : undefined\}>/,
    );
  });

  it("renames variant in each object an addToast ternary chooses", () => {
    assert.match(
      body(`${core("useToast")}export function A({ ok }) { const { addToast } = useToast(); addToast(ok ? { variant: "success", message: "y" } : { variant: "danger", message: "n" }); }\n`),
      /addToast\(ok \? \{ tone: "success", message: "y" \} : \{ tone: "danger", message: "n" \}\)/,
    );
  });

  it("maps Timeline state in typed items, pushes, and a .map with a destructured item", () => {
    assert.equal(
      body(`${core("Timeline, type TimelineItem")}const items: TimelineItem[] = [{ label: "a", state: "active" }, { label: "b", state: "default" }];\nitems.push({ label: "c", state: "success" });\nexport const A = () => <Timeline items={items} />;\n`),
      'const items: TimelineItem[] = [{ label: "a", tone: "brand" }, { label: "b" }];\nitems.push({ label: "c", tone: "success" });\nexport const A = () => <Timeline items={items} />;\n',
    );
    assert.match(
      body(`${core("Timeline")}export const A = ({ steps, at }) => { const items = steps.map(({ label }, i) => ({ label, state: i <= at ? ("active" as const) : ("default" as const) })); return <Timeline items={items} />; };\n`),
      /tone: i <= at \? \("brand" as const\) : undefined \}\)\)/,
    );
  });
});

describe("a 1.x tree", () => {
  it("reads the major of a version or range", () => {
    assert.equal(majorOf("^1.8.5"), 1);
    assert.equal(majorOf("~2.1.0-rc.0"), 2);
    assert.equal(majorOf("latest"), null);
    assert.equal(majorOf("file:../core-3.0.0.tgz"), null);
  });

  it("knows 1.x code by its root-barrel imports and old prop names", () => {
    assert.equal(oneXSigns(`${core("CodeBlock, Row")}`).length, 1);
    assert.equal(oneXSigns(`${core("Dialog")}<Dialog isOpen={o} />`).length, 1);
    assert.equal(oneXSigns(`${core("Dialog")}<Dialog open={o} />`).length, 0);
    // Someone else's Dialog keeps its own prop names.
    assert.equal(oneXSigns('import { Dialog } from "./Dialog";\n<Dialog isOpen={o} />').length, 0);
  });

  it("stops the CLI before writing anything, and names the 2.0 codemod", () => {
    const root = app({
      "package.json": JSON.stringify({ dependencies: { "@once-ui-system/core": "latest" } }),
      "node_modules/@once-ui-system/core/package.json": JSON.stringify({ version: "1.8.5" }),
      "src/a.tsx": `${core("Text")}<Text variant="body-default-m">a</Text>\n`,
    });
    try {
      assert.ok(detectOneX(join(root, "src"), [join(root, "src/a.tsx")]));
      const r = spawnSync(process.execPath, [CLI, join(root, "src")], { encoding: "utf8" });
      assert.equal(r.status, 1);
      assert.match(r.stderr, /this looks like 1\.x: run the 2\.0 codemod first/);
      assert.match(r.stderr, /@once-ui-system\/core 1\.8\.5/);
      const forced = spawnSync(process.execPath, [CLI, join(root, "src"), "--dry", "--force"], { encoding: "utf8" });
      assert.equal(forced.status, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("runs on a 2.x tree, and prints each report with its file and line", () => {
    const root = app({
      "package.json": JSON.stringify({ dependencies: { "@once-ui-system/core": "^2.1.0" } }),
      "src/a.tsx": `${core("Column")}export const A = ({ w }) => (\n  <Column maxWidth={w} />\n);\n`,
    });
    try {
      const r = spawnSync(process.execPath, [CLI, join(root, "src"), "--dry"], { encoding: "utf8" });
      assert.equal(r.status, 0);
      assert.match(r.stdout, /! .*a\.tsx:3 {2}<Column> maxWidth=\{w\}/);
      assert.match(r.stdout, /1 to fix by hand/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
