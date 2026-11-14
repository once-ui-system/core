import { afterEach, describe, expect, it, vi } from "vitest";
import {
  armElementPicker,
  markElement,
  pageSections,
  selectCursor,
} from "../modules/workspace/elementPicker";

afterEach(() => {
  document.body.innerHTML = "";
});

const cursorRule = () =>
  document.getElementById("once-ui-element-picker-cursor")?.textContent ?? null;

const click = (el: Element) =>
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
const move = (el: Element) => el.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));

describe("pageSections", () => {
  it("lists top-level sections only", () => {
    document.body.innerHTML =
      "<section id='a'><section id='inner'></section></section><section id='b'></section>";
    expect(pageSections(document).map((el) => el.id)).toEqual(["a", "b"]);
  });
});

describe("armElementPicker", () => {
  it("picks the outermost section with its position and heading", () => {
    document.body.innerHTML =
      "<header><a id='logo' href='/'>Logo</a></header><section><h2>Hero</h2></section><section><h2>Menu  of the week</h2><p id='p'>Rye</p></section>";
    const onPick = vi.fn();
    const disarm = armElementPicker(document, { onPick });
    expect(cursorRule()).toContain("data:image/svg+xml");
    click(document.getElementById("p") as HTMLElement);
    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "section", index: 2, total: 2, label: "Menu of the week" }),
    );
    disarm();
    expect(cursorRule()).toBeNull();
  });

  it("takes any cursor in place of the select cursor", () => {
    const disarm = armElementPicker(document, { onPick: vi.fn(), cursor: "crosshair" });
    expect(cursorRule()).toContain("cursor: crosshair !important");
    disarm();
  });

  it("reports a click outside every section and keeps it from following links", () => {
    document.body.innerHTML = "<a id='logo' href='/'>Logo</a><section><h2>Hero</h2></section>";
    const onMiss = vi.fn();
    const onPick = vi.fn();
    armElementPicker(document, { onPick, onMiss });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.getElementById("logo")?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onMiss).toHaveBeenCalledWith("outside");
    expect(onPick).not.toHaveBeenCalled();
  });

  it("falls back to single elements on a page without sections", () => {
    document.body.innerHTML = "<article><h1 id='t'>Post title</h1><p>Body</p></article>";
    const onPick = vi.fn();
    armElementPicker(document, { onPick });
    click(document.getElementById("t") as HTMLElement);
    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "element", tag: "h1", label: "Post title", index: 0 }),
    );
  });

  it("outlines the hovered block and clears it on disarm", () => {
    document.body.innerHTML = "<section id='s'><h2>Hero</h2></section>";
    const disarm = armElementPicker(document, { onPick: vi.fn() });
    const section = document.getElementById("s") as HTMLElement;
    move(section);
    expect(section.style.outline).not.toBe("");
    disarm();
    expect(section.style.outline).toBe("");
  });

  it("cancels on Escape", () => {
    const onCancel = vi.fn();
    armElementPicker(document, { onPick: vi.fn(), onCancel });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("selectCursor", () => {
  it("is an SVG cursor with its hotspot and a crosshair fallback, in the accent given", () => {
    const value = selectCursor("#ff0000");
    expect(value).toMatch(/^url\("data:image\/svg\+xml,.+"\) 3 3, crosshair$/);
    expect(decodeURIComponent(value)).toContain('stroke="#ff0000"');
  });
});

describe("markElement", () => {
  it("outlines until cleaned up", () => {
    const el = document.createElement("section");
    const clear = markElement(el);
    expect(el.style.outline).not.toBe("");
    clear();
    expect(el.style.outline).toBe("");
  });
});
