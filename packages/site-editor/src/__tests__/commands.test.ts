import { describe, expect, it } from "vitest";
import { applyCommand, coalesces } from "../commands.js";
import { createHistory, record, redo, undo } from "../history.js";
import type { Page } from "../model.js";

const page = (): Page => ({
  sections: [
    { id: "a", type: "hero", props: { title: "A" } },
    { id: "b", type: "faq", props: {} },
    { id: "c", type: "cta", props: {} },
  ],
});

const ids = (p: Page) => p.sections.map((s) => s.id).join("");

describe("applyCommand", () => {
  it("adds at an index, clamped to the list", () => {
    const section = { id: "x", type: "stats", props: {} };
    expect(ids(applyCommand(page(), { type: "add", section, index: 1 }))).toBe("axbc");
    expect(ids(applyCommand(page(), { type: "add", section }))).toBe("abcx");
    expect(ids(applyCommand(page(), { type: "add", section, index: 99 }))).toBe("abcx");
  });

  it("moves, removes and duplicates", () => {
    expect(ids(applyCommand(page(), { type: "move", id: "a", to: 2 }))).toBe("bca");
    expect(ids(applyCommand(page(), { type: "move", id: "c", to: -5 }))).toBe("cab");
    expect(ids(applyCommand(page(), { type: "remove", id: "b" }))).toBe("ac");
    const copy = applyCommand(page(), { type: "duplicate", id: "a", newId: "a2" });
    expect(ids(copy)).toBe("aa2bc");
    expect(copy.sections[1]?.props).toEqual({ title: "A" });
    expect(copy.sections[1]?.props).not.toBe(copy.sections[0]?.props);
  });

  it("sets and removes props without touching the page it was given", () => {
    const before = page();
    const after = applyCommand(before, { type: "setProp", id: "a", key: "title", value: "B" });
    expect(after.sections[0]?.props.title).toBe("B");
    expect(before.sections[0]?.props.title).toBe("A");
    const cleared = applyCommand(after, {
      type: "setProp",
      id: "a",
      key: "title",
      value: undefined,
    });
    expect("title" in (cleared.sections[0]?.props ?? {})).toBe(false);
  });

  it("returns the same page when nothing changes", () => {
    const before = page();
    expect(applyCommand(before, { type: "remove", id: "nope" })).toBe(before);
    expect(applyCommand(before, { type: "move", id: "a", to: 0 })).toBe(before);
    expect(applyCommand(before, { type: "setProp", id: "a", key: "title", value: "A" })).toBe(
      before,
    );
  });

  it("coalesces typing into one field, not different fields", () => {
    const a = { type: "setProp", id: "a", key: "title", value: "x" } as const;
    expect(coalesces(a, { ...a, value: "xy" })).toBe(true);
    expect(coalesces(a, { ...a, key: "description" })).toBe(false);
    expect(coalesces(undefined, a)).toBe(false);
  });
});

describe("history", () => {
  it("undoes and redoes", () => {
    let h = createHistory(1);
    h = record(h, 2, undefined, 0);
    h = record(h, 3, undefined, 10);
    h = undo(h);
    expect(h.present).toBe(2);
    h = redo(h);
    expect(h.present).toBe(3);
    h = undo(undo(h));
    expect(h.present).toBe(1);
    expect(undo(h)).toBe(h);
  });

  it("makes a run of one key within a second one step", () => {
    let h = createHistory("");
    h = record(h, "h", "title", 0);
    h = record(h, "he", "title", 300);
    h = record(h, "hey", "title", 600);
    expect(h.past).toEqual([""]);
    h = record(h, "hey!", "title", 2000);
    expect(h.past).toEqual(["", "hey"]);
  });

  it("drops the redo stack on a new step", () => {
    let h = record(createHistory(1), 2);
    h = undo(h);
    h = record(h, 5);
    expect(h.future).toEqual([]);
  });
});
