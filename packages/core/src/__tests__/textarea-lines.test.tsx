import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts";

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
});
