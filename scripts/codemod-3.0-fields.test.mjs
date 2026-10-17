/**
 * The 2.x → 3.0 codemod's value contract for fields and pickers (C1, C2):
 * value handlers become `onValueChange`, `onChange` stays the native event.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const body = (src) => transform(src).out.split("\n").slice(1).join("\n");

describe("value onChange → onValueChange on fields and pickers", () => {
  const tags = [
    "NumberInput",
    "ColorInput",
    "TagInput",
    "DateInput",
    "DateRangeInput",
    "DatePicker",
    "DateRangePicker",
  ];

  it("renames it on each, keeping the handler as written", () => {
    for (const tag of tags) {
      const out = body(`${core(tag)}<${tag} value={v} onChange={(next) => setV(next)} />`);
      assert.equal(out, `<${tag} value={v} onValueChange={(next) => setV(next)} />`, tag);
    }
  });

  it("leaves Input, Textarea and PasswordInput's native onChange alone", () => {
    for (const tag of ["Input", "Textarea", "PasswordInput"]) {
      const src = `${core(tag)}<${tag} id="a" onChange={(e) => setV(e.target.value)} />`;
      assert.equal(transform(src).out, src, tag);
    }
  });

  it("follows an aliased import and leaves another library's component alone", () => {
    assert.equal(
      body(`${core("NumberInput as Num")}<Num onChange={setN} />`),
      "<Num onValueChange={setN} />",
    );
    const src = `import { NumberInput } from "./ui";\n<NumberInput onChange={setN} />`;
    assert.equal(transform(src).out, src);
  });

  it("migrates MDX, where components have no import", () => {
    assert.equal(
      transform(`<TagInput id="t" value={tags} onChange={setTags} />`).out,
      `<TagInput id="t" value={tags} onValueChange={setTags} />`,
    );
  });

  it("is idempotent", () => {
    const once = transform(`${core("ColorInput")}<ColorInput value={c} onChange={setC} />`).out;
    assert.equal(transform(once).out, once);
  });
});

describe("Select onSelect → onValueChange", () => {
  it("renames it on Select", () => {
    assert.equal(
      body(`${core("Select")}<Select options={o} value={v} onSelect={(x) => setV(x)} />`),
      "<Select options={o} value={v} onValueChange={(x) => setV(x)} />",
    );
  });

  it("keeps onSelect on menus, where it is an action", () => {
    for (const tag of ["DropdownWrapper", "ContextMenu", "EmojiPicker"]) {
      const src = `${core(tag)}<${tag} onSelect={pick} />`;
      assert.equal(transform(src).out, src, tag);
    }
  });
});

describe("DatePicker", () => {
  it("renames defaultDate → defaultValue", () => {
    assert.equal(
      body(`${core("DatePicker")}<DatePicker defaultDate={today} onChange={setD} />`),
      "<DatePicker defaultValue={today} onValueChange={setD} />",
    );
  });

  it("flags open, which was an autofocus hint and not visibility", () => {
    const src = `${core("DatePicker")}<DatePicker autoFocus open={isOpen} />`;
    const { out, warnings } = transform(src);
    assert.equal(out, src);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /<DatePicker> open: was an autofocus hint/);
  });

  it("does not flag open on DateInput, where it is the picker's open state", () => {
    const { warnings } = transform(`${core("DateInput")}<DateInput id="d" open={o} />`);
    assert.deepEqual(warnings, []);
  });
});
