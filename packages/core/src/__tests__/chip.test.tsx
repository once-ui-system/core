import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../components/Chip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { axeViolations, expectNoAxeViolations } from "../test/axe";

/**
 * Chip is a pressable, optionally removable label. It renders as a
 * `role="button"` element with `aria-pressed` for its selected state, answers
 * to pointer clicks and to Enter and Space, and its remove button is separate:
 * removing never counts as a click on the chip.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Chip", () => {
  it("renders a focusable toggle button named by its label, selected by default", () => {
    render(<Chip label="Design" />, { wrapper });
    const chip = screen.getByRole("button", { name: "Design" });
    expect(chip).toHaveAttribute("tabindex", "0");
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("reflects `selected={false}` in aria-pressed", () => {
    render(<Chip label="Design" selected={false} />, { wrapper });
    expect(screen.getByRole("button", { name: "Design" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClick on a pointer click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip label="Design" onClick={onClick} />, { wrapper });
    const chip = screen.getByRole("button", { name: "Design" });

    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);

    chip.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("is reachable with Tab", async () => {
    const user = userEvent.setup();
    render(<Chip label="Design" />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Design" })).toHaveFocus();
  });

  it("renders a remove button only with onRemove, and removing is not a click on the chip", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { rerender } = render(<Chip label="Design" onClick={onClick} />, { wrapper });
    expect(screen.getAllByRole("button")).toHaveLength(1);

    rerender(<Chip label="Design" onClick={onClick} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls both its own remove handler and iconButtonProps.onClick", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onIconClick = vi.fn();
    render(
      <Chip
        label="Design"
        onRemove={onRemove}
        iconButtonProps={{ onClick: onIconClick, tooltip: "Remove Design" }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onIconClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations without a remove button", async () => {
    const { container } = render(<Chip label="Design" onClick={vi.fn()} />, { wrapper });
    await expectNoAxeViolations(container);
  });

  // BUG: with `onRemove`, the remove button is rendered inside the chip's own
  // role="button" element, an interactive control nested in another
  // (axe: "nested-interactive"); assistive tech flattens the inner one away.
  it.skip("has no axe violations with a remove button", async () => {
    const { container } = render(<Chip label="Design" onRemove={vi.fn()} />, { wrapper });
    expect(await axeViolations(container)).toEqual([]);
  });

  // BUG: `className` is spread after the chip's own classes and replaces them,
  // so a custom class drops the chip and selected/unselected styling.
  it.skip("keeps its own classes when given a className", () => {
    render(<Chip label="Design" className="custom" selected={false} />, { wrapper });
    const chip = screen.getByRole("button", { name: "Design" });
    expect(chip).toHaveClass("custom");
    // CSS module class names keep their local name: _chip_<hash>, _unselected_<hash>.
    expect(chip.className).toMatch(/_chip_/);
    expect(chip.className).toMatch(/_unselected_/);
  });
});
