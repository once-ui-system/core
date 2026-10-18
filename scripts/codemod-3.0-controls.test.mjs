/**
 * Regression tests for the 2.x → 3.0 codemod: the value contract on controls,
 * groups and disclosure (MIGRATING.md § "2.x → 3.0", 5).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const body = (src) => transform(src).out.split("\n").slice(1).join("\n");

describe("onToggle → onCheckedChange", () => {
  it("renames it on Checkbox, RadioButton and Switch, keeping the handler", () => {
    for (const tag of ["Checkbox", "RadioButton", "Switch"]) {
      assert.equal(
        body(`${core(tag)}<${tag} checked={on} onToggle={(next) => setOn(next)} />`),
        `<${tag} checked={on} onCheckedChange={(next) => setOn(next)} />`,
      );
    }
  });

  it("leaves a native onChange on the control alone", () => {
    assert.equal(
      body(`${core("Checkbox")}<Checkbox onChange={handle} onToggle={set} />`),
      "<Checkbox onChange={handle} onCheckedChange={set} />",
    );
  });

  it("renames the docs wrapper that forwards to Switch", () => {
    assert.equal(transform("<ClientSwitch onToggle={set} />").out, "<ClientSwitch onCheckedChange={set} />");
  });

  it("leaves another library's Switch alone", () => {
    const src = `import { Switch } from "./ui";\n<Switch onToggle={set} />`;
    assert.equal(transform(src).out, src);
  });
});

describe("onChange → onValueChange on value controls", () => {
  it("renames it on every value control", () => {
    for (const tag of [
      "RadioGroup",
      "SegmentedControl",
      "Tabs",
      "Slider",
      "ThemeSwitcher",
      "StylePanel",
    ]) {
      assert.equal(
        body(`${core(tag)}<${tag} value={v} onChange={setV} />`),
        `<${tag} value={v} onValueChange={setV} />`,
      );
    }
    // RangeSlider is Slider range in 3.0 (the merges pass).
    assert.equal(
      body(`${core("RangeSlider")}<RangeSlider value={v} onChange={setV} />`),
      "<Slider range value={v} onValueChange={setV} />",
    );
  });

  it("renames it on StylePanel.Root, keeping both arguments", () => {
    assert.equal(
      body(`${core("StylePanel")}<StylePanel.Root value={v} onChange={(next, changed) => save(next, changed)}>`),
      "<StylePanel.Root value={v} onValueChange={(next, changed) => save(next, changed)}>",
    );
  });

  it("leaves Input's native onChange alone in the same file", () => {
    assert.equal(
      body(`${core("Input, Slider")}<Input onChange={a} />\n<Slider onChange={b} />`),
      "<Input onChange={a} />\n<Slider onValueChange={b} />",
    );
  });

  it("drops the old name when the new one is already set", () => {
    assert.equal(
      body(`${core("Tabs")}<Tabs onValueChange={a} onChange={b} />`),
      "<Tabs onValueChange={a} />",
    );
  });
});

describe("Pagination and Scrubber", () => {
  it("renames Pagination onChange to onPageChange", () => {
    assert.equal(
      body(`${core("Pagination")}<Pagination page={p} onChange={setP} total={9} />`),
      "<Pagination page={p} onPageChange={setP} total={9} />",
    );
  });

  it("renames Scrubber onChange and onSelect", () => {
    assert.equal(
      body(`${core("Scrubber")}<Scrubber value={t} onChange={seek} selected={id} onSelect={pick} />`),
      "<Scrubber value={t} onValueChange={seek} selected={id} onSelectedChange={pick} />",
    );
  });

  it("leaves a menu's onSelect alone: it is an action", () => {
    // F5 renames the element itself (DropdownWrapper → Dropdown); onSelect stays.
    const src = `${core("DropdownWrapper")}<DropdownWrapper onSelect={pick} />`;
    assert.equal(transform(src).out, `${core("Dropdown")}<Dropdown onSelect={pick} />`);
  });
});

describe("Accordion and NavGroup onToggle → onOpenChange", () => {
  it("renames it and flags the call site (a handler it cannot see; a zero-argument one is quiet, see round5)", () => {
    for (const tag of ["Accordion", "NavGroup"]) {
      const { out, warnings } = transform(`${core(tag)}<${tag} title="T" onToggle={props.onToggle} />`);
      assert.match(out, new RegExp(`<${tag} title="T" onOpenChange=\\{props\\.onToggle\\} />`));
      assert.equal(warnings.length, 1);
      assert.match(warnings[0], new RegExp(`^<${tag}> onToggle: renamed to onOpenChange`));
    }
  });

  it("turns an Accordion open with no handler into defaultOpen, the 2.x starting state", () => {
    const { out, warnings } = transform(`${core("Accordion")}<Accordion title="T" open />\n<Accordion title="U" open={isOpen}>x</Accordion>`);
    assert.match(out, /<Accordion title="T" defaultOpen \/>/);
    assert.match(out, /<Accordion title="U" defaultOpen=\{isOpen\}>x<\/Accordion>/);
    // An expression: 2.x also followed it when it changed later, so that is said.
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^<Accordion> open=\{isOpen\} → defaultOpen: 2\.x also opened or closed/);
    assert.equal(transform(out).out, out);
  });

  it("leaves a controlled Accordion alone, quietly, and reports one with a spread", () => {
    const src = `${core("Accordion")}<Accordion title="T" open={o} onToggle={() => setO(!o)} />`;
    const { out, warnings } = transform(src);
    assert.match(out, /open=\{o\} onOpenChange=/);
    assert.ok(!warnings.some((w) => /<Accordion> open/.test(w)));
    const spread = transform(`${core("Accordion")}<Accordion {...p} title="T" open />`);
    assert.match(spread.out, / open \/>/);
    assert.match(spread.warnings.join("\n"), /<Accordion> open: .*defaultOpen/);
  });


  it("is idempotent", () => {
    const once = transform(`${core("NavGroup")}<NavGroup label="L" onToggle={t} />`).out;
    const twice = transform(once);
    assert.equal(twice.out, once);
    assert.deepEqual(twice.hits, []);
    assert.deepEqual(twice.warnings, []);
  });
});

describe("default* and size renames", () => {
  it("renames revealedByDefault on RevealFx and Carousel", () => {
    for (const tag of ["RevealFx", "Carousel"]) {
      assert.equal(body(`${core(tag)}<${tag} revealedByDefault />`), `<${tag} defaultRevealed />`);
    }
  });

  it("renames Kbar and KbarContent inputSize to size", () => {
    assert.equal(body(`${core("Kbar")}<Kbar items={i} inputSize="l">`), `<Kbar items={i} size="l">`);
    assert.equal(
      body(`${core("KbarContent")}<KbarContent open onClose={c} items={i} inputSize="s" />`),
      `<KbarContent open onClose={c} items={i} size="s" />`,
    );
  });

  it("migrates MDX, where components have no import", () => {
    assert.equal(
      transform(`<Switch onToggle={x} />\n<Pagination onChange={y} />`).out,
      `<Switch onCheckedChange={x} />\n<Pagination onPageChange={y} />`,
    );
  });
});
