import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoverCard } from "../components/HoverCard";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

const Card = (props: Partial<React.ComponentProps<typeof HoverCard>>) => (
  <>
    <HoverCard
      trigger={
        <button type="button" aria-describedby="profile-card">
          Lorant
        </button>
      }
      {...props}
    >
      <div id="profile-card">Design engineer at Once UI</div>
    </HoverCard>
    <button type="button">Next</button>
  </>
);

const body = () => screen.queryByText("Design engineer at Once UI");
const trigger = () => screen.getByRole("button", { name: "Lorant" });

/**
 * HoverCard shows rich content beside its trigger on hover or focus, in a
 * portal so no overflow clips it, and goes away on unhover, blur and Escape
 * (WCAG 1.4.13: dismissible without moving the pointer or focus).
 */
describe("HoverCard", () => {
  it("shows nothing but the trigger until it is hovered", () => {
    render(<Card />, { wrapper: wrap });
    expect(trigger()).toBeInTheDocument();
    expect(body()).toBeNull();
  });

  it("opens on hover into a portal on document.body and closes on unhover", async () => {
    const user = userEvent.setup();
    const { container } = render(<Card />, { wrapper: wrap });

    await user.hover(trigger());
    const card = await screen.findByText("Design engineer at Once UI");
    expect(container).not.toContainElement(card);
    expect(document.body).toContainElement(card);
    await waitFor(() => expect(card.parentElement?.style.visibility).toBe("visible"));

    await user.unhover(trigger());
    await waitFor(() => expect(body()).toBeNull());
  });

  it("opens on keyboard focus, describes its trigger, and closes when focus moves on", async () => {
    const user = userEvent.setup();
    render(<Card />, { wrapper: wrap });

    await user.tab();
    expect(trigger()).toHaveFocus();
    await screen.findByText("Design engineer at Once UI");
    expect(trigger()).toHaveAccessibleDescription("Design engineer at Once UI");
    await expectNoAxeViolations(document.body);

    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    await waitFor(() => expect(body()).toBeNull());
  });

  it("closes on Escape while focus stays on the trigger", async () => {
    const user = userEvent.setup();
    render(<Card />, { wrapper: wrap });
    await user.tab();
    await screen.findByText("Design engineer at Once UI");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(body()).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  it("follows a controlled `active`, whatever the pointer does", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Card active />, { wrapper: wrap });
    expect(await screen.findByText("Design engineer at Once UI")).toBeInTheDocument();

    rerender(<Card active={false} />);
    await waitFor(() => expect(body()).toBeNull());
    await user.hover(trigger());
    expect(body()).toBeNull();
  });

  describe("delay", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("waits `delay` ms before opening, and never opens if the pointer leaves first", () => {
      render(<Card delay={400} />, { wrapper: wrap });
      const wrapper = trigger().parentElement as HTMLElement;

      fireEvent.mouseEnter(wrapper);
      act(() => vi.advanceTimersByTime(399));
      expect(body()).toBeNull();
      act(() => vi.advanceTimersByTime(1));
      expect(body()).not.toBeNull();

      fireEvent.mouseLeave(wrapper);
      expect(body()).toBeNull();

      fireEvent.mouseEnter(wrapper);
      act(() => vi.advanceTimersByTime(200));
      fireEvent.mouseLeave(wrapper);
      act(() => vi.advanceTimersByTime(1000));
      expect(body()).toBeNull();
    });
  });
});
