import { describe, expect, it } from "vitest";
import gotchas from "../../ai/gotchas.json";
import spec from "../../ai/spec.json";

/**
 * A gotcha is one rule an agent reads next to the components it names. A
 * component name the spec does not have points the agent at nothing, and the
 * 2.1 behaviour fixes need their notes so agents stop writing the workarounds
 * (toast refs, remount keys, local pickers) the apps carried.
 */
type Gotcha = { rule: string; components: string[] };
const entries = Object.entries(gotchas as Record<string, Gotcha>);
const components = spec.components as unknown as Record<string, unknown>;

describe("ai gotchas", () => {
  it.each(entries)("%s is one rule naming components the spec has", (_, gotcha) => {
    expect(typeof gotcha.rule).toBe("string");
    expect(gotcha.rule).not.toMatch(/\n/);
    expect(gotcha.components.length).toBeGreaterThan(0);
    expect(gotcha.components.filter((name) => !components[name])).toEqual([]);
  });

  it.each([
    "Toast.stable",
    "NumberInput.value",
    "Select.closed",
    "Button.trigger",
    "ContextMenu.contents",
  ])("%s says what 2.1 fixed", (id) => {
    expect((gotchas as Record<string, Gotcha>)[id]?.rule).toMatch(/^Fixed in 2\.1: /);
  });
});
