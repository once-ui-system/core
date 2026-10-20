import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "../components/IconButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * An icon-only control: a real button (or link) named by its label, operable
 * from the keyboard, inert when disabled, with a tooltip that follows hover
 * and focus and that Escape dismisses.
 */
describe("IconButton: rendering", () => {
  it("renders a named button with an icon and passes axe", async () => {
    const { container } = render(
      <IconButton icon="close" aria-label="Close" onClick={() => {}} />,
      { wrapper },
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button.querySelector("svg")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders a link for an href", async () => {
    const { container } = render(<IconButton icon="close" aria-label="Home" href="/" />, {
      wrapper,
    });
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expectNoAxeViolations(container);
  });

  it("renders children in place of the icon", () => {
    render(
      <IconButton aria-label="Count" onClick={() => {}}>
        <span>3</span>
      </IconButton>,
      { wrapper },
    );
    const button = screen.getByRole("button", { name: "Count" });
    expect(button).toHaveTextContent("3");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("shows a spinner while loading", () => {
    render(<IconButton icon="close" aria-label="Close" loading onClick={() => {}} />, {
      wrapper,
    });
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("forwards the ref to the button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<IconButton ref={ref} icon="close" aria-label="Close" onClick={() => {}} />, {
      wrapper,
    });
    expect(ref.current).toBe(screen.getByRole("button", { name: "Close" }));
  });
});

describe("IconButton: interaction", () => {
  it("fires onClick from the mouse, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="close" aria-label="Close" onClick={onClick} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("is disabled for mouse and keyboard when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <IconButton icon="close" aria-label="Close" disabled onClick={onClick} />
        <button type="button">After</button>
      </>,
      { wrapper },
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows its tooltip on hover and hides it on leave", async () => {
    const user = userEvent.setup();
    render(<IconButton icon="close" tooltip="Close panel" onClick={() => {}} />, { wrapper });
    const button = screen.getByRole("button", { name: "Close panel" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.hover(button);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Close panel");
    await user.unhover(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows its tooltip on keyboard focus and dismisses it with Escape", async () => {
    const user = userEvent.setup();
    render(<IconButton icon="close" tooltip="Close panel" onClick={() => {}} />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Close panel" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Close panel");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close panel" })).toHaveFocus();
  });
});
