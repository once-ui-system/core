import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NavIcon } from "../components/NavIcon";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * NavIcon was a focusable `div` with no role, no name and no keyboard
 * handling: a keyboard could reach it but not press it, and a screen reader
 * announced nothing. It is now a named button, pressed with Enter and Space
 * as well as a click, whose `aria-expanded` follows `active`.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const MenuToggle = ({ onToggle }: { onToggle?: (open: boolean) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <NavIcon
      active={open}
      aria-controls="menu"
      onClick={() => {
        setOpen(!open);
        onToggle?.(!open);
      }}
    />
  );
};

describe("NavIcon", () => {
  it("is a focusable button named Menu", async () => {
    const user = userEvent.setup();
    render(<NavIcon />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("takes its name from aria-label", () => {
    render(<NavIcon aria-label="Toggle navigation menu" />, { wrapper });
    expect(screen.getByRole("button", { name: "Toggle navigation menu" })).toBeInTheDocument();
  });

  it("toggles on a click, Enter and Space, with aria-expanded following active", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<MenuToggle onToggle={onToggle} />, { wrapper });
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "menu");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(onToggle.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("reports no state without `active`", () => {
    render(<NavIcon />, { wrapper });
    expect(screen.getByRole("button", { name: "Menu" })).not.toHaveAttribute("aria-expanded");
  });

  it("runs the caller's onKeyDown, which can cancel the toggle", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavIcon onClick={onClick} onKeyDown={(event) => event.preventDefault()} />, {
      wrapper,
    });
    screen.getByRole("button", { name: "Menu" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<NavIcon ref={ref} />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("button", { name: "Menu" }));
  });

  it("has no axe violations, closed or open", async () => {
    const { container, rerender } = render(<NavIcon active={false} />, { wrapper });
    await expectNoAxeViolations(container);
    rerender(<NavIcon active />);
    await expectNoAxeViolations(container);
  });
});
