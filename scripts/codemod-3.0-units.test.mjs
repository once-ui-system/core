/**
 * Regression tests for the 2.x → 3.0 codemod: units, durations and speed
 * (MIGRATING.md § "2.x → 3.0", 6; breaks D2–D5).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { transform, transformUnits } from "./codemod-3.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const fx = (names) => `import { ${names} } from "@once-ui-system/fx";\n`;
const body = (src) => transform(src).out.split("\n").slice(1).join("\n");
const warned = (src) => transform(src).warnings.join("\n");

describe("D2: a number that was rem becomes a rem string", () => {
  it("rewrites sizes, spacing, offsets, translate and blur on Flex-based components", () => {
    assert.equal(
      body(`${core("Column")}<Column maxWidth={40} padding={2} top={-1} translateY={0.5} blur={1} />`),
      `<Column maxWidth="40rem" padding="2rem" top="-1rem" translateY="0.5rem" blur="1rem" />`,
    );
  });

  it("keeps the whitespace and formatting around the value", () => {
    assert.equal(body(`${core("Row")}<Row\n  height={ 24 }\n  gap="8"\n/>`), `<Row\n  height="24rem"\n  gap="8"\n/>`);
  });

  it("normalises the number, so .5 is written 0.5rem", () => {
    assert.equal(body(`${core("Flex")}<Flex width={.5} />`), `<Flex width="0.5rem" />`);
  });

  it("leaves zero, tokens, strings and CSS lengths alone", () => {
    const src = `${core("Flex")}<Flex minWidth={0} padding="16" gap={"8"} width="50%" height="20rem" />`;
    assert.equal(transform(src).out, src);
  });

  it("rewrites both literal branches of a ternary", () => {
    assert.equal(
      body(`${core("Flex")}<Flex width={wide ? 40 : "100%"} height={a ? 1 : b ? 2 : 3} />`),
      `<Flex width={wide ? "40rem" : "100%"} height={a ? "1rem" : b ? "2rem" : "3rem"} />`,
    );
  });

  it("rewrites the numbers inside an inline breakpoint object, not its style", () => {
    assert.equal(
      body(`${core("Column")}<Column s={{ maxWidth: 20, gap: "4", style: { width: 20 } }} />`),
      `<Column s={{ maxWidth: "20rem", gap: "4", style: { width: 20 } }} />`,
    );
  });

  it("covers the component props that were rem", () => {
    assert.equal(
      body(
        `${core("Avatar, Media, Animation, DropdownWrapper, Setting, CodeBlock, Carousel")}` +
          `<Avatar size={4} /><Media height={20} /><Animation slideUp={1} blur={4} />` +
          `<DropdownWrapper minWidth={12} minHeight={200} /><Setting controlWidth={14} />` +
          `<CodeBlock codeHeight={24} /><Carousel thumbnail={{ height: 6, sizes: "120px" }} />`,
      ),
      `<Avatar size="4rem" /><Media height="20rem" /><Animation slideUp="1rem" blur={4} />` +
        // Converted as DropdownWrapper's, then renamed by F5.
        `<Dropdown minWidth="12rem" minHeight="200px" /><Setting controlWidth="14rem" />` +
        `<CodeBlock codeHeight="24rem" /><Carousel thumbnail={{ height: "6rem", sizes: "120px" }} />`,
    );
  });

  it("leaves props that were already px alone", () => {
    const src =
      `${core("Dialog, LinearGauge, AutoScroll, Media")}` +
      `<Dialog minHeight={400} /><LinearGauge width={400} height={80} />` +
      `<AutoScroll scrollGap={24} /><Media sizes={320} />`;
    // F2 then folds AutoScroll into Scroller `auto`, its px gap unchanged.
    assert.equal(
      transform(src).out,
      src
        .replace("AutoScroll,", "Scroller,")
        .replace("<AutoScroll scrollGap={24} />", "<Scroller auto={{ gap: 24 }} />"),
    );
  });

  it("leaves elements that are not Once UI's alone", () => {
    for (const src of [
      `import { Row } from "./ui";\n<Row maxWidth={40} />`,
      `${core("Row")}import { LineChart } from "recharts";\n<img width={600} height={400} /><LineChart width={600} />`,
    ]) {
      assert.equal(transform(src).out, src);
    }
  });

  it("migrates by name where there are no imports (MDX), and under an alias", () => {
    assert.equal(transform("<Column maxWidth={32}>").out, `<Column maxWidth="32rem">`);
    assert.equal(
      body(`${core("Column as Stack")}<Stack gap={1} />`),
      `<Stack gap="1rem" />`,
    );
  });

  it("is idempotent", () => {
    const once = transform(`${core("Column, Mask")}<Column maxWidth={40} s={{ gap: 1 }} /><Mask radius={25} />`).out;
    assert.equal(transform(once).out, once);
  });
});

describe("D2: what it cannot rewrite exactly is reported", () => {
  it("reports a variable or a call it cannot follow, and says why", () => {
    const { out, warnings } = transform(`${core("Flex")}<Flex width={w} height={h * 2} maxWidth={size()} />`);
    const w = warnings.join("\n");
    assert.match(w, /width=\{w\}.*rem \(now px\).*\{`\$\{w\}rem`\}.*\(w is not defined in this file\)/);
    assert.match(w, /maxWidth=\{size\(\)\}.*\(it is the result of a call\)/);
    // `h * 2` is a number whatever h is.
    assert.match(out, /height=\{`\$\{h \* 2\}rem`\}/);
  });

  it("reports a breakpoint object passed by name, and a spread inside one", () => {
    assert.match(warned(`${core("Row")}<Row s={mobile} />`), /<Row> s=\{mobile\}/);
    assert.match(warned(`${core("Row")}<Row s={{ ...base, gap: 1 }} />`), /<Row> s: spread/);
  });

  it("does not report a value that can only be a string", () => {
    assert.equal(
      warned(`${core("Row")}<Row gap={dense ? "4" : "8"} width={undefined} padding={\`\${x}px\`} />`),
      "",
    );
  });
});

describe("D3: one unit per kind on the outliers", () => {
  it("Mask: x/y were percentages and radius was vh", () => {
    assert.equal(body(`${core("Mask")}<Mask x={50} y={0} radius={25} />`), `<Mask x="50%" y={0} radius="25vh" />`);
  });

  it("Background: gradient x/y/width/height become percentages of the element, mask too", () => {
    assert.equal(
      body(
        `${core("Background")}<Background gradient={{ display: true, x: 50, width: 100, tilt: -35 }} mask={{ x: 100, radius: 75 }} />`,
      ),
      `<Background gradient={{ display: true, x: "50%", width: "100%", tilt: -35 }} mask={{ x: "100%", radius: "75vh" }} />`,
    );
  });

  it("reports a gradient object it cannot see into", () => {
    assert.match(warned(`${core("Background")}<Background gradient={g} />`), /gradient=\{g\}: check x, y, width, height/);
    const spread = `${core("Background")}<Background gradient={{ ...g, x: 50 }} />`;
    assert.equal(body(spread), `<Background gradient={{ ...g, x: "50%" }} />`);
    assert.match(warned(spread), /gradient: spread or computed entries; check x, y, width, height/);
  });
});

describe("D4: seconds become milliseconds", () => {
  it("multiplies literal durations by 1000", () => {
    assert.equal(
      body(
        `${core("CelebrationFx, WeatherFx, FlipFx, MatrixFx")}<CelebrationFx duration={4} /><WeatherFx duration={0.5} />` +
          `<FlipFx autoFlipInterval={3} /><MatrixFx bulge={{ type: "wave", duration: 2, delay: 100 }} />`,
      ),
      `<CelebrationFx duration={4000} /><WeatherFx duration={500} /><FlipFx autoFlipInterval={3000} />` +
        `<MatrixFx bulge={{ type: "wave", duration: 2000, delay: 100 }} />`,
    );
  });

  it("reaches into Effect's per-effect settings", () => {
    assert.equal(
      body(`${core("Effect")}<Effect type="weather" weather={{ duration: 5 }} matrix={{ bulge: { duration: 3 } }} />`),
      `<Effect type="weather" weather={{ duration: 5000 }} matrix={{ bulge: { duration: 3000 } }} />`,
    );
  });

  it("leaves a value that is already milliseconds, and asks about one it cannot tell", () => {
    const src = `${core("CelebrationFx")}<CelebrationFx duration={4000} />`;
    // Only the import moves (F8: the effects are @once-ui-system/fx).
    assert.equal(transform(src).out, src.replace("@once-ui-system/core", "@once-ui-system/fx"));
    assert.match(warned(`${core("CelebrationFx")}<CelebrationFx duration={200} />`), /200 is read as milliseconds/);
    assert.match(warned(`${core("WeatherFx")}<WeatherFx duration={secs} />`), /seconds \(now milliseconds\)/);
  });
});

describe("D5: speed is a multiplier; lengths of time are duration", () => {
  it("renames RevealFx speed to duration, keywords to their milliseconds", () => {
    assert.equal(
      body(`${core("RevealFx")}<RevealFx speed="fast" /><RevealFx speed={1500} /><RevealFx speed={"slow"} />`),
      `<RevealFx duration={1000} /><RevealFx duration={1500} /><RevealFx duration={3000} />`,
    );
  });

  it("renames ShineFx and CountFx speed to duration and TypeFx speed to charDuration", () => {
    assert.equal(
      body(`${core("ShineFx, CountFx, TypeFx")}<ShineFx speed={800} /><CountFx value={9} speed={ms} /><TypeFx words="a" speed={60} />`),
      `<ShineFx duration={800} /><CountFx value={9} duration={ms} /><TypeFx words="a" charDuration={60} />`,
    );
  });

  it("drops a duration that 2.x never read when speed is beside it", () => {
    assert.equal(
      body(`${core("CountFx")}<CountFx value={v} speed={1000} duration={500} />`),
      "<CountFx value={v} duration={1000} />",
    );
  });

  it("reports a RevealFx speed it cannot read, and ParticleFx's new scale", () => {
    assert.match(warned(`${core("RevealFx")}<RevealFx speed={pace} />`), /"fast" 1000, "medium" 2000, "slow" 3000/);
    assert.match(warned(`${core("ParticleFx")}<ParticleFx speed={pace} />`), /speed=\{pace \/ 0\.3\}/);
    assert.match(warned(`${core("Effect")}<Effect type="particle" speed={1} />`), /divide a 2\.x value by 0\.3/);
    assert.equal(warned(`${core("Effect")}<Effect type="matrix" speed={2} />`), "");
  });

  it("leaves speed alone where it is already a multiplier or a keyword", () => {
    const src = `${core("MatrixFx, AutoScroll, LetterFx")}<MatrixFx speed={2} /><AutoScroll speed="slow" /><LetterFx speed="fast" />`;
    // F2 then folds AutoScroll into Scroller `auto`, its speed keyword unchanged,
    // and the import pass moves the effects to @once-ui-system/fx (F8).
    assert.equal(
      transform(src).out,
      src
        .replace(core("MatrixFx, AutoScroll, LetterFx"), `${core("Scroller")}${fx("MatrixFx, LetterFx")}`)
        .replace('<AutoScroll speed="slow" />', '<Scroller auto={{ speed: "slow" }} />'),
    );
  });
});

describe("transformUnits", () => {
  it("takes a predicate for which imports are Once UI, for core's own sources", () => {
    const src = `import { Row } from "./Row";\n<Row maxWidth={40} />`;
    assert.equal(transformUnits(src).out, src);
    assert.equal(
      transformUnits(src, { isCore: (s) => s.startsWith(".") }).out,
      `import { Row } from "./Row";\n<Row maxWidth="40rem" />`,
    );
  });
});

describe("chart height and merged px", () => {
  it("rewrites dataStyle's height in a config, and on DataThemeProvider", () => {
    const config = `const dataStyle = 1;\nexport const style = {\n  dataStyle: {\n    variant: "gradient",\n    height: 24, // default\n    tick: { fontSize: 11 },\n  },\n};`;
    const { out, warnings } = transform(config);
    assert.match(out, /height: "24rem", \/\/ default/);
    assert.match(out, /fontSize: 11/);
    assert.deepEqual(warnings, []);
    assert.equal(transform(out).out, out);
    assert.equal(body(`${core("DataThemeProvider")}<DataThemeProvider height={20} />`), `<DataThemeProvider height="20rem" />`);
  });

  it("reports a dataStyle height it cannot read", () => {
    assert.equal(transform(`x = { dataStyle: { height: h } };`).warnings.length, 1);
  });

  it("pins DropdownWrapper's px minHeight, so the merged Dropdown survives a second run", () => {
    const once = transform(`${core("DropdownWrapper")}<DropdownWrapper minHeight={200} trigger={<b />} dropdown={<i />} />`).out;
    assert.match(once, /<Dropdown minHeight="200px" trigger=\{<b \/>\}><i \/><\/Dropdown>/);
    assert.equal(transform(once).out, once);
  });
});

describe("the file's own components", () => {
  const warned = (src) => transform(src).warnings.join("\n");

  it("reports a number on a wrapper defined here or imported from a relative path", () => {
    const local = `${core("Row")}const Shelf = (flex) => <Row {...flex} />;\n<Shelf minWidth={14} />`;
    assert.match(warned(local), /<Shelf> minWidth=\{14\}: .* write "14rem"/);
    assert.equal(transform(local).out, local);
    assert.match(warned(`${core("Row")}import { PlanCard } from "./PlanCard";\n<PlanCard minWidth={20} />`), /PlanCard/);
  });

  it("stays quiet on packages, strings, MDX and files without Once UI", () => {
    assert.equal(warned(`${core("Row")}import Image from "next/image";\n<Image width={200} />`), "");
    assert.equal(warned(`${core("Row")}const Book = () => null;\n<Book minWidth="14rem" />`), "");
    assert.equal(warned(`import { Book } from "./Book";\n<Book minWidth={14} />`), "");
  });
});

describe("ParticleFx speed literals", () => {
  it("divides by 0.3 to two decimals, and drops the 2.x default", () => {
    const src = `${core("ParticleFx")}<ParticleFx speed={0.6} />\n<ParticleFx speed={0.3} />\n<ParticleFx speed={1} />\n`;
    const { out } = transform(src);
    assert.equal(
      out,
      'import { ParticleFx } from "@once-ui-system/fx";\n<ParticleFx speed={2} />\n<ParticleFx />\n<ParticleFx speed={3.33} />\n',
    );
    // Now imported from fx: a second run leaves the 3.0 values alone.
    assert.equal(transform(out).out, out);
  });

  it("reports the value where the element is not imported (MDX)", () => {
    const { out, warnings } = transform("<ParticleFx speed={0.6} />\n");
    assert.equal(out, "<ParticleFx speed={0.6} />\n");
    assert.match(warnings.join("\n"), /0\.6 → 2/);
  });
});

describe("numbers the units pass used to miss", () => {
  it("reports a size number on a component imported through a path alias", () => {
    const w = warned(
      core("Row") +
        'import { A } from "@/components/a";\nimport { B } from "~/ui";\n<A maxHeight={28} />\n<B width={3} />\n',
    );
    assert.match(w, /<A> maxHeight=\{28\}: .*28rem in 2\.x and is 28px/);
    assert.match(w, /<B> width=\{3\}/);
  });

  it("converts a const dataStyle as well as a dataStyle property", () => {
    assert.equal(
      transform('export const dataStyle = {\n  height: 24,\n  variant: "flat",\n};\n').out,
      'export const dataStyle = {\n  height: "24rem",\n  variant: "flat",\n};\n',
    );
  });

  it("writes a same-file number const used as a size as the rem it was, and leaves a string const", () => {
    const src = `${core("Column")}const MAX = 20;\nconst W = "20rem";\n<Column maxWidth={MAX} s={{ minWidth: MAX }} />\n<Column maxWidth={W} />\n`;
    const { out, warnings } = transform(src);
    assert.equal(
      out.split("\n").slice(1).join("\n"),
      'const MAX = 20;\nconst W = "20rem";\n<Column maxWidth={`${MAX}rem`} s={{ minWidth: `${MAX}rem` }} />\n<Column maxWidth={W} />\n',
    );
    assert.deepEqual(warnings, []);
    assert.equal(transform(out).out, out);
  });

  it("writes a member of an object nothing writes to, and names a shadowed const or one written to", () => {
    const src =
      `${core("Column")}const CAP = { plain: 20 } as const;\nconst LOOSE = { plain: 20 };\nconst N = 14;\nconst MUT = { w: 2 };\nMUT.w = 3;\n` +
      "<Column maxWidth={CAP.plain} minWidth={LOOSE.plain} height={MUT.w} />\nconst Card = ({ N }) => <Column width={N} />;\n";
    const { out, warnings } = transform(src);
    assert.match(out, /maxWidth=\{`\$\{CAP\.plain\}rem`\} minWidth=\{`\$\{LOOSE\.plain\}rem`\} height=\{MUT\.w\}/);
    assert.match(out, /<Column width=\{N\} \/>/);
    const w = warnings.join("\n");
    assert.match(w, /height=\{MUT\.w\}.*MUT is written to in this file/);
    assert.match(w, /N is 14, a const in this file/);
  });

  it("writes a numeric call (Math.max) as the rem it was", () => {
    const { out, warnings } = transform(`${core("Column")}const W = 14;\n<Column width={W} gap={Math.max(W, 2)} />\n`);
    assert.match(out, /width=\{`\$\{W\}rem`\} gap=\{`\$\{Math\.max\(W, 2\)\}rem`\}/);
    assert.deepEqual(warnings, []);
  });

  it("reads a numeric string radius on Mask, and numeric strings in Background's objects", () => {
    assert.equal(body(`${core("Mask")}<Mask radius="50" />`), '<Mask radius="50vh" />');
    assert.equal(
      body(`${core("Background")}<Background mask={{ radius: "50" }} gradient={{ x: "50", y: 20 }} />`),
      '<Background mask={{ radius: "50vh" }} gradient={{ x: "50%", y: "20%" }} />',
    );
  });
});

describe("an own component that passes a size on to a layout component", () => {
  // A small app on disk: a tsconfig with path aliases, wrappers behind them.
  const app = (files) => {
    const root = mkdtempSync(join(tmpdir(), "codemod-own-"));
    for (const [name, text] of Object.entries(files)) {
      mkdirSync(join(root, name, ".."), { recursive: true });
      writeFileSync(join(root, name), text);
    }
    return root;
  };
  const FILES = {
    "tsconfig.json":
      '{\n  // comment\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": { "@/*": ["./src/*"], "@ui/*": ["./src/components/ui/*"], },\n  },\n}\n',
    "src/components/index.ts": 'export { Sidebar } from "./Sidebar";\nexport * from "./ui/Panel";\n',
    "src/components/Sidebar.tsx":
      'import { Column } from "@once-ui-system/core";\nexport const Sidebar: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {\n  return <Column fillWidth {...flex}>x</Column>;\n};\nexport default Sidebar;\n',
    "src/components/ui/Panel.tsx":
      'import { forwardRef } from "react";\nimport { Flex, Row } from "@once-ui-system/core";\ninterface PanelProps extends React.ComponentProps<typeof Flex> {\n  title?: string;\n}\nexport const Panel = forwardRef<HTMLDivElement, PanelProps>(({ title, children, ...rest }, ref) => (\n  <Row gap="8" {...rest} ref={ref}>{title}{children}</Row>\n));\nexport const Taker = ({ maxWidth, ...rest }: React.ComponentProps<typeof Flex>) => <Row {...rest} />;\n',
    "src/components/Card.tsx":
      'import { Column } from "@once-ui-system/core";\nimport { Panel } from "./ui/Panel";\nexport function Card(props: React.ComponentProps<typeof Column> & { active?: boolean }) {\n  return <Panel title={props.active ? "on" : "off"} {...props} />;\n}\n',
  };
  const run = (src) => {
    const root = app(FILES);
    try {
      const file = join(root, "src/pages/a.tsx");
      return transform(src, { file });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };

  it("follows relative, @/ and tsconfig paths imports, and re-exports", () => {
    const r = run(
      `${core("Column")}import { Sidebar } from "@/components";\nimport { Panel } from "@ui/Panel";\nimport { Card } from "../components/Card";\n<Column><Sidebar minWidth={16} /><Panel maxWidth={24} title="t" /><Card height={3} /></Column>\n`,
    );
    assert.match(r.out, /<Sidebar minWidth="16rem" \/>/);
    assert.match(r.out, /<Panel maxWidth="24rem" title="t" \/>/);
    // A props object, an intersection type, a member read and a wrapper of a wrapper.
    assert.match(r.out, /<Card height="3rem" \/>/);
    assert.ok(r.hits.some((h) => h.includes("Sidebar passes it on to a Column")));
    assert.equal(r.warnings.length, 0);
    assert.equal(transform(r.out).out, r.out);
  });

  it("reports a wrapper it cannot read and a default import; one that takes the prop out and never reads it is quiet", () => {
    const r = run(
      `${core("Column")}import { Taker } from "@ui/Panel";\nimport { Other } from "@/components/Other";\nimport Def from "../components/Sidebar";\n<Column><Taker maxWidth={10} /><Other maxHeight={28} /><Def width={3} /></Column>\n`,
    );
    assert.match(r.out, /<Taker maxWidth=\{10\} \/>/);
    assert.match(r.out, /<Other maxHeight=\{28\} \/>/);
    assert.match(r.out, /<Def width=\{3\} \/>/);
    // Taker drops maxWidth: it did nothing in 2.x and does nothing now.
    assert.equal(r.warnings.length, 2);
    assert.doesNotMatch(r.warnings.join("\n"), /<Taker>/);
  });

  it("rewrites a same-file wrapper without a file to read", () => {
    const { out } = transform(
      `${core("Column")}const Local = ({ ...flex }: React.ComponentProps<typeof Column>) => <Column {...flex} />;\n<Local width={12} />\n`,
    );
    assert.match(out, /<Local width="12rem" \/>/);
  });

  it("leaves a wrapper that reads the prop itself to a report", () => {
    const { out, warnings } = transform(
      `${core("Column")}const W = (p: React.ComponentProps<typeof Column>) => <Column {...p} data-w={p.width} />;\n<W width={12} />\n`,
    );
    assert.match(out, /<W width=\{12\} \/>/);
    assert.equal(warnings.length, 1);
  });
});

describe("a breakpoint object chosen by a ternary", () => {
  it("is quiet when both branches hold only strings", () => {
    assert.equal(warned(`${core("Row")}<Row m={wide ? { direction: "column" } : {}} />\n`), "");
  });
  it("still reports a number in a branch", () => {
    assert.match(warned(`${core("Row")}<Row m={wide ? { maxWidth: 2 } : {}} />\n`), /numeric sizes and spacing in it were rem/);
  });
});
