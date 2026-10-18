import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleButton } from "../components/ToggleButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * ToggleButton is the styled button SegmentedControl, Tabs and NavItem build
 * on. It renders a real button when it has something to do (an `onClick` or
 * a `type`), a link with an `href`, and answers the keyboard like either.
 * The selected state is styling only: the role that uses it (tab, menuitem…)
 * carries the ARIA state.
 */
describe("ToggleButton: interaction", () => {
  it("is a button named by its label, clicked by pointer, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<ToggleButton label="Bold" onClick={onClick} />, {
      wrapper: wrap,
    });
    const button = screen.getByRole("button", { name: "Bold" });
    await user.click(button);
    await user.tab();
    await user.tab({ shift: true });
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
    await expectNoAxeViolations(container);
  });

  it("renders children when there is no label, and its icons", () => {
    const { container } = render(
      <ToggleButton prefixIcon="chevronLeft" suffixIcon="chevronRight" onClick={vi.fn()}>
        Back
      </ToggleButton>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });

  it("is a link with an href", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(<ToggleButton label="Docs" href="/docs" onClick={onClick} />, { wrapper: wrap });
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled: out of the Tab order and not clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <ToggleButton label="Locked" disabled onClick={onClick} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button", { name: "Locked" });
    expect(button).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("passes ARIA state and role through, for the control that uses it", () => {
    render(
      <ToggleButton
        label="Overview"
        role="tab"
        aria-selected
        selected
        onClick={vi.fn()}
        aria-controls="panel"
      />,
      { wrapper: wrap },
    );
    const tab = screen.getByRole("tab", { name: "Overview", selected: true });
    expect(tab).toHaveAttribute("aria-controls", "panel");
  });

  it("forwards its ref to the button", () => {
    const ref = createRef<HTMLElement>();
    render(<ToggleButton ref={ref} label="Ref" onClick={vi.fn()} />, { wrapper: wrap });
    expect(ref.current).toBe(screen.getByRole("button", { name: "Ref" }));
  });

  // With no `onClick` or `href` it is still a button, so Tab reaches it, and
  // says whether it is on.
  it("is a focusable toggle with nothing else to do", () => {
    render(<ToggleButton label="Static" selected />, { wrapper: wrap });
    const button = screen.getByRole("button", { name: "Static" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("renders a button from `type` alone", () => {
    render(<ToggleButton label="Submit" type="submit" />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
  });
});
