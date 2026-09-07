/**
 * Regression tests for the 1.8.x → 2.0 prop codemod.
 *
 * Every case here is a defect the codemod actually shipped with, found by
 * running it against the consumer apps. They are grouped by the failure they
 * guard against, because each one was silent: the codemod reported success
 * and left the app broken, which is the one thing a migration tool must never
 * do.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-2.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const hits = (src) => transform(src).hits;

describe("comments inside a tag", () => {
  it("migrates a tag whose nested comment contains an apostrophe", () => {
    // An apostrophe used to open a string that never closed, so the scanner
    // ran off the end of the file and skipped the element without a word.
    const src = `${core("Dialog")}<Dialog isOpen={a} footer={<Row>
      // the action they're trying to take
      <Button />
    </Row>}>x</Dialog>`;
    assert.deepEqual(hits(src), ["<Dialog> isOpen → open"]);
  });

  it("migrates a tag with a block comment between attributes", () => {
    const src = `${core("Dialog")}<Dialog /* it's fine */ isOpen={a} />`;
    assert.deepEqual(hits(src), ["<Dialog> isOpen → open"]);
  });

  it("does not rewrite an old prop name mentioned in a comment", () => {
    const src = `${core("Dialog")}<Dialog\n  // isOpen is set by the parent\n  open={a} />`;
    assert.deepEqual(hits(src), []);
  });
});

describe("scoping renames to Once UI components", () => {
  it("migrates a component imported from core", () => {
    assert.deepEqual(hits(`${core("Modal")}<Modal isOpen={a} />`), ["<Modal> isOpen → open"]);
  });

  it("migrates a component imported from a core subpath", () => {
    const src = `import { Media } from "@once-ui-system/core/components/Media";\n<Media fill />`;
    assert.deepEqual(hits(src), ["<Media> fill → stretch"]);
  });

  it("leaves an app's own component of the same name alone", () => {
    // Renaming isOpen here turns working code into a type error.
    assert.deepEqual(hits(`import { Modal } from ".";\n<Modal isOpen={a} />`), []);
  });

  it("follows an alias to the element that actually needs migrating", () => {
    const src = `import { Modal as Sheet } from "@once-ui-system/core";\n<Sheet isOpen={a} />`;
    assert.deepEqual(hits(src), ["<Modal> isOpen → open"]);
  });

  it("migrates only the alias when the old name is a local component", () => {
    const src =
      `import { Modal as Sheet } from "@once-ui-system/core";\n` +
      `import { Modal } from "./Modal";\n` +
      `<Sheet isOpen={a} /><Modal isOpen={b} />`;
    assert.deepEqual(hits(src), ["<Modal> isOpen → open"]);
    assert.match(transform(src).out, /<Modal isOpen=\{b\}/);
  });

  it("falls back to matching by name when nothing is imported", () => {
    // MDX gets its components from the provider, not from an import.
    assert.deepEqual(hits(`<Dialog isOpen={a} />`), ["<Dialog> isOpen → open"]);
  });
});

describe("radius → corners", () => {
  for (const tag of ["Button", "IconButton", "Input", "Textarea"]) {
    it(`renames radius="none" on ${tag}, which has no radius in 2.0`, () => {
      assert.deepEqual(hits(`${core(tag)}<${tag} radius="none" />`), [`<${tag}> radius → corners`]);
    });
  }

  it("leaves radius alone on a component that still has it", () => {
    assert.deepEqual(hits(`${core("Column")}<Column radius="m" />`), []);
  });
});

describe("value changes are reported, never guessed", () => {
  it("flags a seconds delay rather than rewriting it", () => {
    const { hits: h, warnings, out } = transform(`${core("RevealFx")}<RevealFx delay={0.4} />`);
    assert.deepEqual(h, []);
    assert.equal(warnings.length, 1);
    assert.match(out, /delay=\{0\.4\}/);
  });

  it("does not re-flag an already-migrated millisecond value", () => {
    assert.deepEqual(transform(`${core("RevealFx")}<RevealFx delay={400} />`).warnings, []);
  });

  it("reports the ColorInput onChange signature change", () => {
    // A rename cannot express it and the compiler only catches it at the call
    // site, so the codemod has to say something.
    const { warnings } = transform(`${core("ColorInput")}<ColorInput onChange={handle} />`);
    assert.deepEqual(warnings, [
      "<ColorInput> onChange: now receives (value: string), not the change event",
    ]);
  });
});

describe("Skeleton, whose props meant different things per shape", () => {
  const sk = (jsx) => transform(`${core("Skeleton")}${jsx}`);

  it("turns a delay step into the milliseconds the stylesheet applied", () => {
    // .delay-2 was animation-delay: 0.2s, so the step is × 100, not × 1000.
    assert.match(sk(`<Skeleton delay="2" />`).out, /delay=\{200\}/);
  });

  it("maps a line's width scale to the percentage it already rendered", () => {
    const { out } = sk(`<Skeleton shape="line" width="l" height="xs" />`);
    assert.match(out, /width="75%"/);
    assert.match(out, /size="xs"/);
  });

  it("defaults to line when shape is not given", () => {
    assert.match(sk(`<Skeleton width="m" />`).out, /width="50%"/);
  });

  it("takes a circle's diameter from width, not height", () => {
    // .circle only ever used w-*; renaming height → size would silently
    // resize every circle whose two values differed.
    const { out, warnings } = sk(`<Skeleton shape="circle" width="l" height="xs" />`);
    assert.match(out, /size="l"/);
    assert.doesNotMatch(out, /height=/);
    assert.equal(warnings.length, 1);
  });

  it("drops width and height on a block, which ignored both", () => {
    const { out } = sk(`<Skeleton shape="block" width="m" height="m" />`);
    assert.equal(out.split("\n")[1], `<Skeleton shape="block" />`);
  });

  it("leaves a computed shape alone and says so", () => {
    const { hits, warnings } = sk(`<Skeleton shape={s} width="m" />`);
    assert.deepEqual(hits, []);
    assert.equal(warnings.length, 1);
  });

  it("migrates a computed step rather than reporting it", () => {
    const { out, warnings } = sk(`<Skeleton delay={String(i + 1) as SkeletonDelay} />`);
    assert.match(out, /delay=\{\(i \+ 1\) \* 100\}/);
    assert.deepEqual(warnings, []);
  });

  it("is idempotent: a second run is a no-op", () => {
    const once = sk(`<Skeleton shape="circle" width="m" height="m" delay="1" />`).out;
    const twice = transform(once);
    assert.deepEqual(twice.hits, []);
    assert.deepEqual(twice.warnings, []);
    assert.equal(twice.out, once);
  });
});

describe("Skeleton delay written as a stringified step", () => {
  const delayOf = (v) => {
    const { out } = transform(`${core("Skeleton")}<Skeleton shape="line" delay=${v} />`);
    return out.match(/delay=\{[^}]*\}/)[0];
  };

  // The old union forced every computed step through String()+cast; that
  // wrapper is what 2.0 removes, and the step was x 0.1s.
  for (const [from, to] of [
    ['{i.toString() as "1" | "2" | "3"}', "delay={i * 100}"],
    ["{String(i + 1) as SkeletonDelay}", "delay={(i + 1) * 100}"],
    ["{String(i + 1) as any}", "delay={(i + 1) * 100}"],
    ['{(i + 1).toString() as "1" | "2"}', "delay={(i + 1) * 100}"],
    ['{index.toString() as "1" | "2"}', "delay={index * 100}"],
  ]) {
    it(`rewrites ${from}`, () => assert.equal(delayOf(from), to));
  }

  it("leaves a bare variable to a warning — its own type is what must change", () => {
    const { out, warnings } = transform(
      `${core("Skeleton")}<Skeleton shape="line" delay={d as "1" | "2"} />`,
    );
    assert.match(out, /delay=\{d as "1" \| "2"\}/);
    assert.equal(warnings.length, 1);
  });

  it("does not multiply a step that may be undefined", () => {
    // (undefined) * 100 is NaN, so this one needs a human.
    const { out } = transform(
      `${core("Skeleton")}<Skeleton shape="line" delay={String(x) as "1" | undefined} />`,
    );
    assert.match(out, /delay=\{String\(x\) as "1" \| undefined\}/);
  });

  it("stays idempotent over the rewritten form", () => {
    const once = transform(`${core("Skeleton")}<Skeleton shape="line" delay={i.toString() as "1"} />`).out;
    assert.deepEqual(transform(once).hits, []);
    assert.deepEqual(transform(once).warnings, []);
  });
});

describe("the width default a line used to get for free", () => {
  const sk = (jsx) => transform(`${core("Skeleton")}${jsx}`);

  it("makes the old 50% explicit, so the skeleton stays visible", () => {
    // 1.8.x defaulted width to "m" (.w-m { width: 50% }). 2.0 has no default
    // and the element is an inline flex with no content, so without this the
    // skeleton renders at zero width.
    assert.match(sk(`<Skeleton shape="line" height="xl" />`).out, /width="50%"/);
  });

  it("applies to a line that never named its shape either", () => {
    assert.match(sk(`<Skeleton height="l" />`).out, /width="50%"/);
  });

  it("leaves a line that already sizes itself alone", () => {
    assert.doesNotMatch(sk(`<Skeleton shape="line" fillWidth height="l" />`).out, /width=/);
    assert.match(sk(`<Skeleton shape="line" width="l" />`).out, /width="75%"/);
  });

  it("does not touch a circle or a block, whose widths never came from w-*", () => {
    assert.doesNotMatch(sk(`<Skeleton shape="circle" width="m" height="m" />`).out, /width=/);
    assert.doesNotMatch(sk(`<Skeleton shape="block" />`).out, /width=/);
  });

  it("does not add the width twice on a second run", () => {
    const once = sk(`<Skeleton shape="line" height="xl" />`).out;
    assert.equal(transform(once).out, once);
  });
});

describe("imports that moved to a subpath", () => {
  const out = (src) => transform(src).out;

  it("splits a statement that mixes core and relocated names", () => {
    assert.equal(
      out(`import { Column, LineChart, Text, PieChart } from "@once-ui-system/core";`),
      'import { Column, Text } from "@once-ui-system/core";\n' +
        'import { LineChart, PieChart } from "@once-ui-system/core/data";',
    );
  });

  it("drops the original statement when everything moved", () => {
    assert.equal(
      out(`import { MediaUpload } from "@once-ui-system/core";`),
      'import { MediaUpload } from "@once-ui-system/core/media";',
    );
  });

  it("sends each name to its own subpath", () => {
    const result = out(`import { CodeBlock, MediaUpload, BarChart } from "@once-ui-system/core";`);
    assert.match(result, /\{ BarChart \} from "@once-ui-system\/core\/data"/);
    assert.match(result, /\{ CodeBlock \} from "@once-ui-system\/core\/code"/);
    assert.match(result, /\{ MediaUpload \} from "@once-ui-system\/core\/media"/);
  });

  it("keeps an alias pointing at the same local name", () => {
    assert.match(
      out(`import { LineChart as Chart } from "@once-ui-system/core";`),
      /\{ LineChart as Chart \} from "@once-ui-system\/core\/data"/,
    );
  });

  it("keeps a type-only import type-only", () => {
    assert.match(
      out(`import type { ChartProps } from "@once-ui-system/core";`),
      /^import type \{ ChartProps \} from "@once-ui-system\/core\/data";$/,
    );
  });

  it("leaves an import with nothing relocated untouched", () => {
    const src = `import { Row, Button } from "@once-ui-system/core";`;
    assert.equal(out(src), src);
  });

  it("leaves an already-migrated subpath import alone", () => {
    const src = `import { LineChart } from "@once-ui-system/core/data";`;
    assert.equal(out(src), src);
  });
});

describe("stylesheets that moved to foundations", () => {
  it("moves both entries and keeps the quote style", () => {
    const { out } = transform(
      `import "@once-ui-system/core/css/styles.css";\nimport '@once-ui-system/core/css/tokens.css';`,
    );
    assert.equal(
      out,
      `import "@once-ui-system/foundations/css/styles.css";\nimport '@once-ui-system/foundations/css/tokens.css';`,
    );
  });

  it("says the package has to be added, which it cannot do itself", () => {
    const { warnings } = transform(`import "@once-ui-system/core/css/tokens.css";`);
    assert.deepEqual(warnings, ["add @once-ui-system/foundations to this app's dependencies"]);
  });

  it("leaves an already-migrated import alone", () => {
    const src = `import "@once-ui-system/foundations/css/tokens.css";`;
    const { out, hits, warnings } = transform(src);
    assert.equal(out, src);
    assert.deepEqual(hits, []);
    assert.deepEqual(warnings, []);
  });

  it("does not touch other core subpath imports", () => {
    const src = `import { LayoutProvider } from "@once-ui-system/core/next";`;
    assert.equal(transform(src).out, src);
  });
});
