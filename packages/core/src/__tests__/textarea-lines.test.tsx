import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `lines` defaults to "auto" in 2.0 (it was 3). The three things that hang off
 * that switch are the row count, the inline resize style, and the resize
 * handle — so they are what this asserts, rather than the measured height,
 * which jsdom has no layout engine to produce.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = (ui: React.ReactElement) =>
  render(ui, { wrapper: wrap }).container.querySelector("textarea") as HTMLTextAreaElement;

describe("Textarea lines", () => {
  it("grows with its content by default", () => {
    const el = field(<Textarea id="a" label="Notes" />);
    expect(el.rows).toBe(1);
    expect(el.style.resize).toBe("none");
  });

  it("fixes the row count when given a number", () => {
    const el = field(<Textarea id="a" label="Notes" lines={4} />);
    expect(el.rows).toBe(4);
    expect(el.style.resize).not.toBe("none");
  });

  it("keeps the resize handle only on a fixed height", () => {
    const auto = render(<Textarea id="a" label="Notes" />, { wrapper: wrap });
    const fixed = render(<Textarea id="b" label="Notes" lines={4} />, { wrapper: wrap });
    const handle = (r: ReturnType<typeof render>) =>
      Boolean(r.container.querySelector('[class*="resizeHandle"]'));
    expect(handle(auto)).toBe(false);
    expect(handle(fixed)).toBe(true);
  });

  it("still honours resize='none' on a fixed height", () => {
    const r = render(<Textarea id="a" label="Notes" lines={4} resize="none" />, { wrapper: wrap });
    expect(r.container.querySelector('[class*="resizeHandle"]')).toBeNull();
  });

  // Agents reached for a fixed `lines` only to make an empty field taller, and
  // lost growing and gained a drag handle with it.
  it("grows from a minimum with { min }, without a resize handle", () => {
    const r = render(<Textarea id="a" label="Bio" lines={{ min: 3 }} />, { wrapper: wrap });
    const el = r.container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.rows).toBe(3);
    expect(el.style.resize).toBe("none");
    expect(r.container.querySelector('[class*="resizeHandle"]')).toBeNull();
  });

  it("grows with what is typed in { min }, and stops at { max }", () => {
    const el = field(<Textarea id="a" label="Bio" lines={{ min: 2, max: 4 }} />);
    // jsdom has no layout: give it a line height, padding and a content height.
    el.style.lineHeight = "20px";
    el.style.paddingTop = "8px";
    el.style.paddingBottom = "8px";
    let content = 60;
    Object.defineProperty(el, "scrollHeight", { configurable: true, get: () => content });

    fireEvent.change(el, { target: { value: "one\ntwo\nthree" } });
    expect(el.style.height).toBe("60px");
    expect(el.style.overflowY).toBe("");

    content = 200;
    fireEvent.change(el, { target: { value: "a\nb\nc\nd\ne\nf\ng\nh" } });
    // four lines of 20px plus 16px of padding, then it scrolls
    expect(el.style.height).toBe("96px");
    expect(el.style.overflowY).toBe("auto");
  });

  it("keeps at least one row for { min: 0 } or {}", () => {
    expect(field(<Textarea id="a" label="Notes" lines={{}} />).rows).toBe(1);
    expect(field(<Textarea id="b" label="Notes" lines={{ min: 0 }} />).rows).toBe(1);
  });
});
