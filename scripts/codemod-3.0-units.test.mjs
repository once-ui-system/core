/**
 * Regression tests for the 2.x → 3.0 codemod: units, durations and speed
 * (MIGRATING.md § "2.x → 3.0", 6; breaks D2–D5).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
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
  it("reports a variable, arithmetic or a call", () => {
    const w = warned(`${core("Flex")}<Flex width={w} height={h * 2} maxWidth={size()} />`);
    assert.match(w, /width=\{w\}.*rem \(now px\).*\{`\$\{w\}rem`\}/);
    assert.match(w, /height=\{h \* 2\}/);
    assert.match(w, /maxWidth=\{size\(\)\}/);
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
    assert.match(warned(`${core("ParticleFx")}<ParticleFx speed={0.6} />`), /divide a 2\.x value by 0\.3/);
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
