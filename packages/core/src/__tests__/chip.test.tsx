import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../components/Chip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

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

  // With `onRemove`, the remove button used to render inside the chip's own
  // role="button" element, an interactive control nested in another
  // (axe: "nested-interactive"); assistive tech flattens the inner one away.
  it("has no axe violations with a remove button", async () => {
    const { container } = render(<Chip label="Design" onRemove={vi.fn()} />, { wrapper });
    await expectNoAxeViolations(container);
  });

  it("puts the chip's own control and its remove button side by side", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip label="Design" selected={false} onClick={onClick} onRemove={vi.fn()} />, {
      wrapper,
    });
    const chip = screen.getByRole("button", { name: "Design" });
    const remove = screen.getByRole("button", { name: "Remove" });

    expect(chip).not.toContainElement(remove);
    expect(remove).not.toContainElement(chip);
    expect(chip).toHaveAttribute("tabindex", "0");
    expect(chip).toHaveAttribute("aria-pressed", "false");

    await user.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
    chip.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  // Enter on the nested remove button used to reach the chip's key handler,
  // which clicked the chip and cancelled the button's own activation.
  it("removes on Enter and Space without clicking the chip", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<Chip label="Design" onClick={onClick} onRemove={onRemove} />, { wrapper });
    screen.getByRole("button", { name: "Remove" }).focus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the chip's look on the box and names its control with aria-label", () => {
    const { container } = render(
      <Chip
        label="Design"
        className="custom"
        aria-label="Design filter"
        onRemove={vi.fn()}
        iconButtonProps={{ "aria-label": "Remove Design" }}
      />,
      { wrapper },
    );
    const box = container.querySelector(".custom");
    expect(box?.className).toMatch(/_chip_/);
    expect(box).not.toHaveAttribute("role");
    expect(box).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("button", { name: "Design filter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Remove Design" }).tagName).toBe("BUTTON");
  });

  it("forwards a typed ref to the chip's box", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Chip ref={ref} label="Design" onRemove={vi.fn()} />, {
      wrapper,
    });
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(container.querySelector('[class*="_chip_"]'));
  });

  // `className` used to be spread after the chip's own classes and replace
  // them, dropping the chip and selected/unselected styling.
  it("keeps its own classes when given a className", () => {
    render(<Chip label="Design" className="custom" selected={false} />, { wrapper });
    const chip = screen.getByRole("button", { name: "Design" });
    expect(chip).toHaveClass("custom");
    // CSS module class names keep their local name: _chip_<hash>, _unselected_<hash>.
    expect(chip.className).toMatch(/_chip_/);
    expect(chip.className).toMatch(/_unselected_/);
  });

  it("makes the label plain text beside the remove button with interactive={false}", async () => {
    const { container } = render(<Chip label="Design" interactive={false} onRemove={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Remove",
    ]);
    expect(screen.getByText("Design").closest("[tabindex]")).toBeNull();
    expect(container.querySelector("[aria-pressed]")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("draws suffixIcon after the label and prefixIcon before it, both hidden from the name", async () => {
    const { container } = render(
      <Chip label="Q4 pricing" prefixIcon="document" suffixIcon="chevronDown" />,
      { wrapper },
    );
    const chip = screen.getByRole("button", { name: "Q4 pricing" });
    const parts = Array.from(chip.children);
    expect(parts).toHaveLength(3);
    expect(parts[0].querySelector("svg")).not.toBeNull();
    expect(parts[1].textContent).toBe("Q4 pricing");
    expect(parts[2].querySelector("svg")).not.toBeNull();
    expect(parts[2]).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("keeps suffixIcon inside the chip's control when it is removable", () => {
    render(<Chip label="Q4 pricing" suffixIcon="chevronDown" onRemove={() => {}} />, {
      wrapper,
    });
    const control = screen.getByRole("button", { name: "Q4 pricing" });
    expect(control.lastElementChild?.querySelector("svg")).not.toBeNull();
    expect(control).not.toContainElement(screen.getByRole("button", { name: "Remove" }));
  });
});
