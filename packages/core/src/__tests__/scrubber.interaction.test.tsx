import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Scrubber } from "../components/Scrubber";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

function stubWidth(el: Element, width = 1000) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    width,
    height: 40,
    left: 0,
    right: width,
    top: 0,
    bottom: 40,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

const Player = (props: Partial<React.ComponentProps<typeof Scrubber>>) => {
  const [time, setTime] = useState(30000);
  return <Scrubber duration={60000} value={time} onChange={setTime} {...props} />;
};

/**
 * Scrubber as a seek slider the keyboard can drive: one Tab stop named
 * "Seek" (or its label), the arrow keys in both axes step it as the ARIA
 * slider pattern asks, Home and End jump to the ends, the value text reads
 * as a time, and a drag on the bar seeks until the pointer is released.
 */
describe("Scrubber: interaction", () => {
  it("is one named Tab stop with its value as time", async () => {
    const user = userEvent.setup();
    const { container } = render(<Player />, { wrapper: wrap });
    await user.tab();
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveFocus();
    expect(slider).toHaveAttribute("aria-valuetext", "0:30");
    await expectNoAxeViolations(container);
  });

  it("steps with Left and Right, and jumps with Home and End", async () => {
    const user = userEvent.setup();
    render(<Player step={5000} />, { wrapper: wrap });
    await user.tab();
    const slider = screen.getByRole("slider", { name: "Seek" });
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveAttribute("aria-valuenow", "35000");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(slider).toHaveAttribute("aria-valuenow", "25000");
    await user.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "60000");
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveAttribute("aria-valuenow", "60000");
    await user.keyboard("{Home}");
    expect(slider).toHaveAttribute("aria-valuetext", "0:00");
  });

  // A slider takes Up and Down as well as Left and Right; these did nothing
  // here, and scrolled the page instead.
  it("steps with Up and Down too, without scrolling the page", async () => {
    const user = userEvent.setup();
    render(<Player step={1000} />, { wrapper: wrap });
    await user.tab();
    const slider = screen.getByRole("slider", { name: "Seek" });
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(slider).toHaveAttribute("aria-valuenow", "32000");
    await user.keyboard("{ArrowDown}");
    expect(slider).toHaveAttribute("aria-valuenow", "31000");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    slider.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves other keys alone", () => {
    const onChange = vi.fn();
    render(<Scrubber duration={1000} value={0} onChange={onChange} />, { wrapper: wrap });
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    screen.getByRole("slider").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("seeks along a drag on the bar until the pointer is released", () => {
    const onChange = vi.fn();
    render(<Scrubber duration={10000} value={0} onChange={onChange} />, { wrapper: wrap });
    const slider = screen.getByRole("slider");
    stubWidth(slider);
    const bar = slider.firstElementChild as HTMLElement;
    fireEvent.pointerDown(bar, { button: 0, clientX: 250 });
    fireEvent.pointerMove(document, { clientX: 500 });
    fireEvent.pointerMove(document, { clientX: 2000 });
    fireEvent.pointerUp(document);
    fireEvent.pointerMove(document, { clientX: 100 });
    expect(onChange.mock.calls).toEqual([[2500], [5000], [10000]]);
  });

  it("takes its name from aria-label or ariaLabel", () => {
    const { rerender } = render(<Player ariaLabel="Playhead" />, { wrapper: wrap });
    expect(screen.getByRole("slider", { name: "Playhead" })).toBeInTheDocument();
    rerender(<Player ariaLabel="Playhead" aria-label="Video position" />);
    expect(screen.getByRole("slider", { name: "Video position" })).toBeInTheDocument();
  });

  it("formats time with formatTime, and hides it with showTime off", () => {
    const { rerender } = render(<Player formatTime={(t) => `${t / 1000}s`} />, { wrapper: wrap });
    expect(screen.getByText("30s")).toBeInTheDocument();
    expect(screen.getByText("60s")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "30s");
    rerender(<Player showTime={false} />);
    expect(screen.queryByText("1:00")).not.toBeInTheDocument();
  });
});
