import assert from "node:assert/strict";
import { test } from "node:test";
import { transformIconNames } from "./codemod-3.0-icons.mjs";

test("reports the two icons that changed meaning, without rewriting", () => {
  const src = `<Icon name="check" />\n<Icon size="xs" name={"checkbox"} />`;
  const { out, warnings } = transformIconNames(src);
  assert.equal(out, src);
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /icon "check" .*checkCircle .*\(line 1\)/);
  assert.match(warnings[1], /icon "checkbox" .*write check .*\(line 2\)/);
});

test("reads icon props and config objects", () => {
  const src = `<Button prefixIcon="check" /><NavItem icon='checkbox' />\nconst items = [{ label: "Done", icon: "check" }];`;
  assert.equal(transformIconNames(src).warnings.length, 3);
});

test("leaves other names and non-icon props alone", () => {
  const src = `<input name="checkbox" /><Icon name="close" /><Tag label="check" /><Icon name="checkCircle" />`;
  assert.deepEqual(transformIconNames(src).warnings, []);
});
