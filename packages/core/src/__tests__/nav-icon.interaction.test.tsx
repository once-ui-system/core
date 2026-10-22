import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NavIcon } from "../components/NavIcon";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The menu toggle wired to a real menu: it controls the element it names in
 * `aria-controls`, presses once per key (not once per keydown and again on
 * keyup), and ignores keys that are not Enter or Space.
 */
describe("NavIcon with a menu", () => {
  const Header = ({ onClick }: { onClick?: () => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <NavIcon
          active={open}
          aria-controls="site-menu"
          onClick={() => {
            onClick?.();
            setOpen((o) => !o);
          }}
        />
        {open && (
          <nav id="site-menu" aria-label="Site">
            <a href="/a">A</a>
          </nav>
        )}
      </>
    );
  };

  it("opens the menu it controls and passes axe open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />, { wrapper });
    const toggle = screen.getByRole("button", { name: "Menu" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(toggle.getAttribute("aria-controls") as string)).toBe(
      screen.getByRole("navigation", { name: "Site" }),
    );
    await expectNoAxeViolations(container);
  });

  it("presses once per Enter or Space and ignores other keys", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Header onClick={onClick} />, { wrapper });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.keyboard("{Escape}{ArrowDown}a");
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("draws the cross while active", () => {
    const { rerender, container } = render(<NavIcon active={false} />, { wrapper });
    const lines = () => Array.from(container.querySelectorAll("[role=button] > div"));
    expect(lines().every((l) => !/_active_/.test(l.className))).toBe(true);
    rerender(<NavIcon active />);
    expect(lines()).toHaveLength(2);
    expect(lines().every((l) => /_active_/.test(l.className))).toBe(true);
  });
});
