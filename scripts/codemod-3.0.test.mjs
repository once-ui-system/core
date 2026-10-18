/**
 * Regression tests for the 2.x → 3.0 codemod.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const run = (src) => transform(src);

describe("ariaLabel → aria-label", () => {
  it("renames it on the five components that took it", () => {
    for (const tag of ["IconButton", "Spinner", "Switch", "Scrubber", "StatusIndicator"]) {
      const { out } = run(`${core(tag)}<${tag} ariaLabel="Name" />`);
      assert.match(out, new RegExp(`<${tag} aria-label="Name" />`));
    }
  });

  it("drops the alias when aria-label is already set, since that one won", () => {
    const { out } = run(`${core("Spinner")}<Spinner aria-label="A" ariaLabel="B" />`);
    assert.match(out, /<Spinner aria-label="A" \/>/);
  });

  it("leaves another library's prop of the same name alone", () => {
    const src = `import { Switch } from "./ui";\n<Switch ariaLabel="x" />`;
    assert.equal(run(src).out, src);
  });

  it("migrates MDX, where components have no import", () => {
    assert.equal(run(`<IconButton icon="search" ariaLabel="Search" />`).out, `<IconButton icon="search" aria-label="Search" />`);
  });
});

describe("Dialog hideClose → showClose", () => {
  const dialog = (attrs) => run(`${core("Dialog")}<Dialog open ${attrs} />`).out.split("\n")[1];

  it("inverts the shorthand", () => {
    assert.equal(dialog("hideClose"), "<Dialog open showClose={false} />");
  });
  it("inverts a literal and an expression", () => {
    assert.equal(dialog("hideClose={true}"), "<Dialog open showClose={false} />");
    assert.equal(dialog("hideClose={locked}"), "<Dialog open showClose={!locked} />");
    assert.equal(dialog("hideClose={a && b}"), "<Dialog open showClose={!(a && b)} />");
  });
  it("drops the default and a value showClose overrode", () => {
    assert.equal(dialog("hideClose={false}"), "<Dialog open />");
    assert.equal(dialog("hideClose showClose"), "<Dialog open showClose />");
  });
});

describe("CodeBlock root highlight", () => {
  it("moves onto every inline entry that set none", () => {
    const src = `${core("CodeBlock")}<CodeBlock highlight="2" codes={[{ code: a, language: "tsx" }, { code: b, language: "css", highlight: "1" }]} />`;
    const { out, warnings } = run(src);
    assert.deepEqual(warnings, []);
    assert.match(out, /\{ highlight: "2", code: a, language: "tsx" \}/);
    assert.match(out, /\{ code: b, language: "css", highlight: "1" \}/);
    assert.doesNotMatch(out, /<CodeBlock highlight/);
  });

  it("reports codes it cannot see into", () => {
    const { out, warnings } = run(`${core("CodeBlock")}<CodeBlock highlight={lines} codes={snippets} />`);
    assert.match(out, /highlight=\{lines\}/);
    assert.equal(warnings.length, 1);
  });
});

describe("renamed and removed exports", () => {
  it("renames Particle to ParticleFx, import and elements", () => {
    const { out } = run(`${core("Particle, Row")}<Particle density={20}><Row /></Particle>`);
    // F8: the import pass then moves ParticleFx to @once-ui-system/fx.
    assert.equal(
      out,
      `${core("Row")}import { ParticleFx } from "@once-ui-system/fx";\n<ParticleFx density={20}><Row /></ParticleFx>`,
    );
  });

  it("keeps an alias when the old name is used as a value", () => {
    const { out } = run(`${core("Particle")}const Fx = Particle;\n<Particle />`);
    assert.match(out, /import \{ ParticleFx as Particle \}/);
    assert.match(out, /<Particle \/>/);
  });

  it("keeps the caller's own alias", () => {
    const { out } = run(`import { Particle as Dots } from "@once-ui-system/core";\n<Dots />`);
    assert.match(out, /import \{ ParticleFx as Dots \}/);
  });

  it("reports removed exports", () => {
    const { warnings } = run(`import type { BaseBreakpointProps } from "@once-ui-system/core";`);
    assert.equal(warnings.length, 1);
  });
});

describe("idempotence", () => {
  it("changes nothing on its own output", () => {
    const src = `${core("Dialog, Particle, Spinner")}<Dialog hideClose /><Particle /><Spinner ariaLabel="x" />`;
    const once = run(src).out;
    assert.equal(run(once).out, once);
    assert.deepEqual(run(once).hits, []);
  });
});
