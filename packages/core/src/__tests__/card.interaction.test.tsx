import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../components/Card";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * A Card is a plain surface until it gets an onClick (a button, toggle-able
 * with `selected`) or an href (a link). Only the operable forms take focus.
 */
describe("Card: static", () => {
  it("renders content with no interactive role and no tab stop", async () => {
    const { container } = render(<Card>Plain</Card>, { wrapper });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(screen.getByText("Plain")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("does not take a click cursor or a stray radius class", () => {
    const { container } = render(<Card>Plain</Card>, { wrapper });
    expect(container.innerHTML).not.toMatch(/radius-undefined|cursor-interactive/);
  });
});

describe("Card: button", () => {
  it("is a focusable, named button that fires on click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Card onClick={onClick} aria-label="Pro plan">
        Pro
      </Card>,
      { wrapper },
    );
    const button = screen.getByRole("button", { name: "Pro plan" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(screen.getByText("Pro"));
    expect(onClick).toHaveBeenCalledTimes(3);
    await expectNoAxeViolations(container);
  });

  it("exposes `selected` as aria-pressed and follows it", async () => {
    const user = userEvent.setup();
    const Plan = () => {
      const [selected, setSelected] = useState(false);
      return (
        <Card onClick={() => setSelected((s) => !s)} selected={selected}>
          Pro
        </Card>
      );
    };
    const { container } = render(<Plan />, { wrapper });
    const button = screen.getByRole("button", { name: "Pro" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    await expectNoAxeViolations(container);
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves aria-pressed off a button card with no selected state", () => {
    render(<Card onClick={() => {}}>Pro</Card>, { wrapper });
    expect(screen.getByRole("button", { name: "Pro" })).not.toHaveAttribute("aria-pressed");
  });

  it("forwards the ref to the focusable element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Card ref={ref} onClick={() => {}}>
        Pro
      </Card>,
      { wrapper },
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Pro" }));
  });
});

describe("Card: link", () => {
  it("is a focusable link that passes axe", async () => {
    const user = userEvent.setup();
    const { container } = render(<Card href="/projects/1">Launch</Card>, { wrapper });
    const link = screen.getByRole("link", { name: "Launch" });
    expect(link).toHaveAttribute("href", "/projects/1");
    await user.tab();
    expect(link).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("does not announce aria-pressed on a link even when selected", () => {
    render(
      <Card href="/projects/1" selected>
        Launch
      </Card>,
      { wrapper },
    );
    expect(screen.getByRole("link", { name: "Launch" })).not.toHaveAttribute("aria-pressed");
  });

  it("follows Enter on a link card through its onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card href="#launch" onClick={onClick}>
        Launch
      </Card>,
      { wrapper },
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Current behaviour, flagged as questionable: an onClick wins the role, so
  // an <a href> card that also has a handler is announced as a button.
  it("announces a link card with an onClick as a button", () => {
    render(
      <Card href="#launch" onClick={() => {}}>
        Launch
      </Card>,
      { wrapper },
    );
    const el = screen.getByRole("button", { name: "Launch" });
    expect(el.tagName).toBe("A");
  });
});
