import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SplitView } from "../components/SplitView";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const panels = {
  leftPanel: <div>Left content</div>,
  rightPanel: <div>Right content</div>,
};

const separator = () => screen.getByRole("separator", { name: "Resize panels" });
const leftPane = () => screen.getByText("Left content").parentElement as HTMLElement;

beforeEach(() => {
  Object.assign(HTMLElement.prototype, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  });
});

/**
 * The window-splitter pattern: a focusable separator reporting the split as
 * a value, moved by pointer drag or the arrow keys within min/max, and a
 * tabbed layout below the collapse breakpoint. Complements splitview.test.tsx.
 */
describe("SplitView: split layout", () => {
  it("passes axe with its separator", async () => {
    const { container } = render(<SplitView {...panels} />, { wrapper });
    expect(separator()).toHaveAttribute("aria-orientation", "vertical");
    expect(separator()).toHaveAttribute("aria-valuenow", "30");
    await expectNoAxeViolations(container);
  });

  it("is reached with Tab after the left panel's content", async () => {
    const user = userEvent.setup();
    render(
      <SplitView leftPanel={<button type="button">In left</button>} rightPanel={<p>Right</p>} />,
      { wrapper },
    );
    await user.tab();
    await user.tab();
    expect(separator()).toHaveFocus();
  });

  it("ignores Up and Down in a side-by-side split", async () => {
    const user = userEvent.setup();
    render(<SplitView {...panels} />, { wrapper });
    separator().focus();
    await user.keyboard("{ArrowUp}{ArrowDown}");
    expect(separator()).toHaveAttribute("aria-valuenow", "30");
    await user.keyboard("{ArrowRight}");
    expect(separator()).toHaveAttribute("aria-valuenow", "35");
    expect(leftPane().style.width).toBe("35%");
  });

  it("follows a pointer drag, clamped, and restores the page cursor after", () => {
    const { container } = render(<SplitView {...panels} />, { wrapper });
    const root = container.firstElementChild as HTMLElement;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 500,
    } as DOMRect);

    fireEvent.pointerDown(separator(), { clientX: 300, pointerId: 1 });
    expect(document.body.style.cursor).toBe("col-resize");
    fireEvent.pointerMove(document, { clientX: 600 });
    expect(separator()).toHaveAttribute("aria-valuenow", "60");
    fireEvent.pointerMove(document, { clientX: 950 });
    expect(separator()).toHaveAttribute("aria-valuenow", "80");
    fireEvent.pointerUp(document);
    expect(document.body.style.cursor).toBe("");
    expect(document.body.style.userSelect).toBe("");

    fireEvent.pointerMove(document, { clientX: 100 });
    expect(separator()).toHaveAttribute("aria-valuenow", "80");
  });

  it("stops a drag on pointercancel", () => {
    const { container } = render(<SplitView {...panels} />, { wrapper });
    vi.spyOn(container.firstElementChild as HTMLElement, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 500,
    } as DOMRect);
    fireEvent.pointerDown(separator(), { clientX: 400, pointerId: 1 });
    fireEvent.pointerCancel(document);
    fireEvent.pointerMove(document, { clientX: 700 });
    expect(separator()).toHaveAttribute("aria-valuenow", "40");
  });
});

describe("SplitView: collapsed", () => {
  it("switches panels from the keyboard through its tabs", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SplitView {...panels} collapseBelow="l" labels={{ left: "Editor", right: "Preview" }} />,
      { wrapper },
    );
    await expectNoAxeViolations(container);
    await user.tab();
    expect(document.activeElement).toHaveTextContent("Editor");
    // SegmentedControl moves focus with the arrows and selects on Enter.
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Left content")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Right content")).toBeInTheDocument();
    expect(screen.queryByText("Left content")).not.toBeInTheDocument();
  });

  it("labels the tabs 1 and 2 without labels", () => {
    render(<SplitView {...panels} collapseBelow="l" />, { wrapper });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
