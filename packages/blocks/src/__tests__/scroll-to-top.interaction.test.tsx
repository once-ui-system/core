import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "@once-ui-system/core";
import { ScrollToTop } from "../ScrollToTop.js";
import { LayoutProvider } from "@once-ui-system/core";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const scrollWindowTo = (y: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  act(() => {
    fireEvent.scroll(window);
  });
};

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

const Top = (props: Partial<React.ComponentProps<typeof ScrollToTop>>) => (
  <ScrollToTop {...props}>
    <Button size="s" prefixIcon="chevronUp">
      Top
    </Button>
  </ScrollToTop>
);

/**
 * The floating "back to top" control as the docs use it: a decorative Button
 * inside. It stays hidden and out of the Tab order until the page is
 * scrolled past `offset`, then is a button named by its content that a
 * click, Enter or Space sends to the top.
 */
describe("ScrollToTop: visibility", () => {
  it("is hidden and unfocusable at the top of the page", () => {
    const { container } = render(<Top />, { wrapper });
    const control = container.firstElementChild as HTMLElement;
    expect(control).toHaveAttribute("aria-hidden", "true");
    expect(control).toHaveAttribute("tabindex", "-1");
    expect(control).toHaveAttribute("data-visible", "false");
  });

  it("appears past the offset and hides again above it", async () => {
    const { container } = render(<Top offset={100} />, { wrapper });
    scrollWindowTo(150);
    const control = screen.getByRole("button", { name: "Top" });
    expect(control).toHaveAttribute("tabindex", "0");
    expect(control).toHaveAttribute("data-visible", "true");
    await expectNoAxeViolations(container);
    scrollWindowTo(50);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows on mount when the page is already scrolled", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1000 });
    render(<Top />, { wrapper });
    expect(screen.getByRole("button", { name: "Top" })).toHaveAttribute("data-visible", "true");
  });

  it("uses a changed offset", () => {
    const { rerender } = render(<Top offset={500} />, { wrapper });
    scrollWindowTo(300);
    expect(screen.queryByRole("button", { name: "Top" })).not.toBeInTheDocument();
    rerender(<Top offset={200} />);
    scrollWindowTo(300);
    expect(screen.getByRole("button", { name: "Top" })).toBeInTheDocument();
  });
});

describe("ScrollToTop: activation", () => {
  it("scrolls smoothly to the top on click", async () => {
    const user = userEvent.setup();
    render(<Top />, { wrapper });
    scrollWindowTo(1000);
    await user.click(screen.getByRole("button", { name: "Top" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("is reached with Tab and pressed with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<Top />, { wrapper });
    scrollWindowTo(1000);
    await user.tab();
    expect(screen.getByRole("button", { name: "Top" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    await user.keyboard("a");
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it("is skipped by Tab while hidden", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Top />
        <button type="button">After</button>
      </>,
      { wrapper },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });
});
