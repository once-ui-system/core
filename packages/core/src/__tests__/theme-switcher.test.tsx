import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * ThemeSwitcher is a toggle group of three buttons, system, dark and light,
 * with `aria-pressed` on the theme in force. Choosing one sets the theme
 * through ThemeProvider (the `data-theme` attribute and the stored
 * preference). Collapsed, it stays a real group: every option keeps its tab
 * stop, and opening downwards puts the active option first.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </LayoutProvider>
);

const option = (name: "System theme" | "Dark theme" | "Light theme") =>
  screen.getByRole("button", { name });

const pressed = () =>
  screen
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.getAttribute("aria-label"));

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSwitcher", () => {
  it("renders the three themes as named toggle buttons, with the active one pressed", () => {
    render(<ThemeSwitcher />, { wrapper });
    expect(
      screen.getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual(["System theme", "Dark theme", "Light theme"]);
    expect(pressed()).toEqual(["System theme"]);
  });

  it("marks a stored preference as active", () => {
    localStorage.setItem("data-theme", "dark");
    render(<ThemeSwitcher />, { wrapper });
    expect(pressed()).toEqual(["Dark theme"]);
  });

  it("sets and stores the theme on click", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />, { wrapper });

    await user.click(option("Dark theme"));
    expect(pressed()).toEqual(["Dark theme"]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("data-theme")).toBe("dark");

    await user.click(option("Light theme"));
    expect(pressed()).toEqual(["Light theme"]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("returns to the system theme and forgets the stored choice", async () => {
    const user = userEvent.setup();
    localStorage.setItem("data-theme", "dark");
    render(<ThemeSwitcher />, { wrapper });

    await user.click(option("System theme"));
    expect(pressed()).toEqual(["System theme"]);
    expect(localStorage.getItem("data-theme")).toBeNull();
    // The test setup's matchMedia never matches, so the system is light.
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("works from the keyboard: each option is a tab stop and Enter chooses it", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />, { wrapper });

    await user.tab();
    expect(option("System theme")).toHaveFocus();
    await user.tab();
    expect(option("Dark theme")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(pressed()).toEqual(["Dark theme"]);
    await user.tab();
    expect(option("Light theme")).toHaveFocus();
    await user.keyboard(" ");
    expect(pressed()).toEqual(["Light theme"]);
  });

  it("keeps every option a tab stop when collapsed", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher collapsed />, { wrapper });
    await user.tab();
    await user.tab();
    await user.tab();
    expect(option("Light theme")).toHaveFocus();
  });

  it("puts the active option first when collapsed into a column", async () => {
    const user = userEvent.setup();
    localStorage.setItem("data-theme", "light");
    const { container } = render(<ThemeSwitcher collapsed direction="column" />, { wrapper });
    const order = () =>
      within(container)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"));

    expect(order()).toEqual(["Light theme", "System theme", "Dark theme"]);
    await user.click(option("Dark theme"));
    expect(order()).toEqual(["Dark theme", "System theme", "Light theme"]);
    // The button that was clicked moved, and kept its focus.
    expect(option("Dark theme")).toHaveFocus();
  });

  it("controlled, shows the host's theme and reports a choice without setting it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    localStorage.setItem("data-theme", "light");
    const { rerender } = render(<ThemeSwitcher value="dark" onValueChange={onChange} />, {
      wrapper,
    });
    expect(pressed()).toEqual(["Dark theme"]);

    await user.click(option("Light theme"));
    expect(onChange).toHaveBeenCalledWith("light");
    // The host has not accepted it yet, and nothing outside the switcher moved.
    expect(pressed()).toEqual(["Dark theme"]);
    expect(localStorage.getItem("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    rerender(<ThemeSwitcher value="system" onValueChange={onChange} />);
    expect(pressed()).toEqual(["System theme"]);
  });

  it("uncontrolled, sets the theme and then reports it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitcher onValueChange={onChange} />, { wrapper });
    await user.click(option("Dark theme"));
    expect(onChange).toHaveBeenCalledWith("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("forwards its ref to the group", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ThemeSwitcher ref={ref} />, { wrapper });
    expect(ref.current).toContainElement(option("Dark theme"));
  });

  it("has no axe violations, open or collapsed", async () => {
    const open = render(<ThemeSwitcher />, { wrapper });
    await expectNoAxeViolations(open.container);
    open.unmount();

    const collapsed = render(<ThemeSwitcher collapsed direction="column" />, { wrapper });
    await expectNoAxeViolations(collapsed.container);
  });

  it("as a radio group, has one tab stop on the active theme and the arrows choose", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container, rerender } = render(
      <ThemeSwitcher semantics="radio" aria-label="Theme" value="dark" onValueChange={onChange} />,
      { wrapper },
    );
    const radio = (name: string) => screen.getByRole("radio", { name });
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument();
    expect(radio("Dark theme")).toHaveAttribute("aria-checked", "true");
    expect(radio("Dark theme")).not.toHaveAttribute("aria-pressed");
    expect(radio("Dark theme")).toHaveAttribute("tabindex", "0");
    expect(radio("System theme")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(radio("Dark theme")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(radio("Light theme")).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("light");
    rerender(
      <ThemeSwitcher semantics="radio" aria-label="Theme" value="light" onValueChange={onChange} />,
    );
    await user.keyboard("{ArrowRight}");
    expect(radio("System theme")).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("system");
    await expectNoAxeViolations(container);
  });
});
