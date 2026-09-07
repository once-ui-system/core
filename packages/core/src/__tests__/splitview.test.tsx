import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SplitView } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const panels = {
  leftPanel: <div>Left content</div>,
  rightPanel: <div>Right content</div>,
};

/**
 * jsdom reports window.innerWidth as 1024, which is above the default `s`
 * collapse point, so the split layout is what renders here. The collapsed
 * layout is asserted by forcing `collapseBelow` past that width.
 */
describe("SplitView", () => {
  it("shows both panels and a resizable separator on a wide viewport", () => {
    render(<SplitView {...panels} />, { wrapper: wrap });
    expect(screen.getByText("Left content")).toBeInTheDocument();
    expect(screen.getByText("Right content")).toBeInTheDocument();
    expect(screen.getByRole("separator", { name: "Resize panels" })).toBeInTheDocument();
  });

  it("honours defaultSplit, minSplit and maxSplit", () => {
    // These three props were accepted and then ignored: the hook hardcoded
    // 0.3 / 0.2 / 0.8 regardless of what was passed.
    render(<SplitView {...panels} defaultSplit={0.6} minSplit={0.1} maxSplit={0.9} />, {
      wrapper: wrap,
    });
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-valuenow", "60");
    expect(sep).toHaveAttribute("aria-valuemin", "10");
    expect(sep).toHaveAttribute("aria-valuemax", "90");
  });

  it("resizes from the keyboard, not only a pointer", async () => {
    const user = userEvent.setup();
    render(<SplitView {...panels} defaultSplit={0.5} />, { wrapper: wrap });
    const sep = screen.getByRole("separator");
    sep.focus();
    await user.keyboard("{ArrowRight}");
    expect(sep).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(sep).toHaveAttribute("aria-valuenow", "45");
  });

  it("clamps keyboard resizing to the configured bounds", async () => {
    const user = userEvent.setup();
    render(<SplitView {...panels} defaultSplit={0.25} minSplit={0.2} maxSplit={0.8} />, {
      wrapper: wrap,
    });
    const sep = screen.getByRole("separator");
    sep.focus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(sep).toHaveAttribute("aria-valuenow", "20");
  });

  it("collapses to tabs below the breakpoint, showing one panel at a time", async () => {
    const user = userEvent.setup();
    render(<SplitView {...panels} collapseBelow="l" labels={{ left: "Editor", right: "Preview" }} />, {
      wrapper: wrap,
    });
    // No draggable divider on a phone — that is the point of the collapse.
    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByText("Left content")).toBeInTheDocument();
    expect(screen.queryByText("Right content")).toBeNull();

    await user.click(screen.getByText("Preview"));
    expect(screen.getByText("Right content")).toBeInTheDocument();
    expect(screen.queryByText("Left content")).toBeNull();
  });

  it("keeps the split at every size when collapseBelow is false", () => {
    render(<SplitView {...panels} collapseBelow={false} />, { wrapper: wrap });
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
