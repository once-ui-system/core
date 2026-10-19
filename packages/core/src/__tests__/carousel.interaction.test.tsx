import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Carousel } from "../components/Carousel";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = [
  { slide: "/one.jpg", alt: "First" },
  { slide: "/two.jpg", alt: "Second" },
  { slide: "/three.jpg", alt: "Third" },
];

/**
 * Slides change after a 300ms fade-out and a 50ms pause, so these tests run
 * on fake timers. user-event hangs under them here (jsdom 30 + vitest 4),
 * so the DOM is driven with fireEvent.
 */
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const shown = () => screen.getAllByRole("img")[0].getAttribute("alt");
const button = (name: string) => screen.getByRole("button", { name });
const query = (name: string) => screen.queryByRole("button", { name });

/**
 * One slide at a time, changed by Previous/Next, the line or thumbnail
 * indicators (each a named button that marks the current slide and answers
 * Enter and Space), a swipe, or autoplay with a pause control.
 */
describe("Carousel: rendering", () => {
  it("shows the first slide with Next only, and passes axe", async () => {
    vi.useRealTimers();
    const { container } = render(<Carousel items={items} />, { wrapper });
    expect(shown()).toBe("First");
    expect(button("Next slide")).toBeInTheDocument();
    expect(query("Previous slide")).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders nothing for no items and no controls for one", () => {
    const { container, rerender } = render(<Carousel items={[]} />, { wrapper });
    expect(container).toBeEmptyDOMElement();
    rerender(<Carousel items={items.slice(0, 1)} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("forwards the ref and keeps the caller's style", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Carousel ref={ref} items={items} style={{ maxWidth: "20rem" }} />, { wrapper });
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toContainElement(screen.getAllByRole("img")[0]);
    expect(ref.current?.style.maxWidth).toBe("20rem");
    expect(ref.current?.style.isolation).toBe("isolate");
  });
});

describe("Carousel: navigation", () => {
  it("moves with Next and Previous after the transition", () => {
    render(<Carousel items={items} />, { wrapper });
    fireEvent.click(button("Next slide"));
    expect(shown()).toBe("First");
    advance(350);
    expect(shown()).toBe("Second");
    fireEvent.click(button("Previous slide"));
    advance(350);
    expect(shown()).toBe("First");
  });

  it("ignores a second press during the transition", () => {
    render(<Carousel items={items} />, { wrapper });
    fireEvent.click(button("Next slide"));
    advance(100);
    fireEvent.click(button("Next slide"));
    advance(700);
    expect(shown()).toBe("Second");
  });

  it("jumps with a line indicator from a click, Enter and Space", async () => {
    vi.useRealTimers();
    const { container } = render(<Carousel items={items} />, { wrapper });
    expect(button("Go to slide 1")).toHaveAttribute("aria-current", "true");
    await expectNoAxeViolations(container);
    vi.useFakeTimers();

    fireEvent.click(button("Go to slide 3"));
    advance(350);
    expect(shown()).toBe("Third");
    expect(button("Go to slide 3")).toHaveAttribute("aria-current", "true");
    expect(button("Go to slide 1")).not.toHaveAttribute("aria-current");

    fireEvent.keyDown(button("Go to slide 2"), { key: "Enter" });
    advance(350);
    expect(shown()).toBe("Second");
    fireEvent.keyDown(button("Go to slide 1"), { key: " " });
    advance(350);
    expect(shown()).toBe("First");
  });

  it("makes every indicator reachable with Tab", () => {
    render(<Carousel items={items} />, { wrapper });
    for (const n of [1, 2, 3]) {
      expect(button(`Go to slide ${n}`)).toHaveAttribute("tabindex", "0");
    }
  });

  it("jumps with a thumbnail from a click or the keyboard", async () => {
    vi.useRealTimers();
    const { container } = render(<Carousel items={items} indicator="thumbnail" />, {
      wrapper,
    });
    await expectNoAxeViolations(container);
    vi.useFakeTimers();
    fireEvent.click(button("Go to slide 2"));
    advance(350);
    expect(shown()).toBe("Second");
    expect(button("Go to slide 2")).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(button("Go to slide 3"), { key: "Enter" });
    advance(350);
    expect(shown()).toBe("Third");
  });

  it("swipes left for the next slide and right for the previous", () => {
    render(<Carousel items={items} />, { wrapper });
    const surface = screen.getAllByRole("img")[0].closest("[class*='revealFx']") as HTMLElement;
    fireEvent.touchStart(surface, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 200 }] });
    advance(350);
    expect(shown()).toBe("Second");
    fireEvent.touchStart(surface, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 130 }] });
    advance(350);
    expect(shown()).toBe("Second");
    fireEvent.touchStart(surface, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 200 }] });
    advance(350);
    expect(shown()).toBe("First");
  });
});

describe("Carousel: autoplay", () => {
  it("advances every interval and loops, and the pause button stops it", () => {
    render(<Carousel items={items} play={{ auto: true, interval: 1000, controls: true }} />, {
      wrapper,
    });
    advance(1350);
    expect(shown()).toBe("Second");
    fireEvent.click(button("Pause slideshow"));
    advance(5000);
    expect(shown()).toBe("Second");
    fireEvent.click(button("Play slideshow"));
    advance(1350);
    expect(shown()).toBe("Third");
    // Each slide change restarts the interval, so a lap is interval + 350ms.
    advance(1350);
    expect(shown()).toBe("First");
  });

  it("still advances with the progress bar on", () => {
    render(
      <Carousel
        items={items}
        play={{ auto: true, interval: 1000, controls: true, progress: true }}
      />,
      { wrapper },
    );
    advance(1400);
    expect(shown()).toBe("Second");
  });
});
