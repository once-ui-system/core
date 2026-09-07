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
