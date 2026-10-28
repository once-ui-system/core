import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Swiper } from "../components/Swiper";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { mockReducedMotion } from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = [
  { slide: "/one.jpg", alt: "First" },
  { slide: "/two.jpg", alt: "Second" },
  { slide: "/three.jpg", alt: "Third" },
];

let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  scrollTo = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    writable: true,
    value: scrollTo,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * user-event hangs here under fake timers (jsdom 30 + vitest 4), and the
 * 500ms settle needs them, so these tests drive the DOM with fireEvent.
 */
const press = (el: HTMLElement) => fireEvent.click(el);
const key = (el: HTMLElement, k: string) => fireEvent.keyDown(el, { key: k });
const dot = (n: number) => screen.getByRole("button", { name: `Go to slide ${n}` });
/** jsdom keeps scrollLeft at 0 on a box it never laid out; give the scroller a real one. */
const scroller = () => {
  const el = screen.getAllByRole("img")[0].closest("[class*='scrollContainer']") as HTMLElement;
  if (!Object.hasOwn(el, "scrollLeft")) {
    let left = 0;
    Object.defineProperty(el, "scrollLeft", {
      configurable: true,
      get: () => left,
      set: (value: number) => {
        left = value;
      },
    });
  }
  return el;
};

/** The smooth scroll is given 500ms before the slide counts as arrived. */
const settle = () =>
  act(() => {
    vi.advanceTimersByTime(500);
  });

/**
 * A row of image (or node) slides with Previous/Next buttons that appear
 * only when there is somewhere to go, and a dot per slide that jumps to it
 * from a click, Enter or Space and marks the slide in front.
 */
describe("Swiper: rendering", () => {
  it("renders every slide with its alt text and passes axe", async () => {
    vi.useRealTimers();
    const { container } = render(<Swiper items={items} />, { wrapper });
    expect(screen.getAllByRole("img").map((img) => img.getAttribute("alt"))).toEqual([
      "First",
      "Second",
      "Third",
    ]);
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous slide" })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders node slides", () => {
    render(<Swiper items={[{ slide: <p>Hello</p> }, { slide: <p>World</p> }]} />, { wrapper });
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders nothing for no items", () => {
    const { container } = render(<Swiper items={[]} />, { wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it("drops controls and dots for a single slide or when turned off", () => {
    const { rerender } = render(<Swiper items={items.slice(0, 1)} />, { wrapper });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<Swiper items={items} controls={false} indicator={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("marks the dot of the slide in front", () => {
    render(<Swiper items={items} />, { wrapper });
    expect(dot(1)).toHaveAttribute("aria-current", "true");
    expect(dot(2)).not.toHaveAttribute("aria-current");
  });
});

describe("Swiper: navigation", () => {
  it("scrolls one slide per Next, then shows Previous", () => {
    render(<Swiper items={items} />, { wrapper });
    press(screen.getByRole("button", { name: "Next slide" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "smooth" });
    settle();
    expect(dot(2)).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument();

    press(screen.getByRole("button", { name: "Next slide" }));
    settle();
    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();

    press(screen.getByRole("button", { name: "Previous slide" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "smooth" });
  });

  it("jumps to a slide from its dot with a click, Enter or Space", () => {
    render(<Swiper items={items} />, { wrapper });
    press(dot(3));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 800, behavior: "smooth" });
    settle();
    expect(dot(3)).toHaveAttribute("aria-current", "true");

    key(dot(2), "Enter");
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "smooth" });
    key(dot(1), " ");
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
    expect(scrollTo).toHaveBeenCalledTimes(3);
  });

  it("follows a scroll of its own to the nearest slide", () => {
    render(<Swiper items={items} />, { wrapper });
    act(() => {
      scroller().scrollLeft = 790;
      fireEvent.scroll(scroller());
    });
    expect(dot(3)).toHaveAttribute("aria-current", "true");
  });

  it("snaps a mouse drag to the nearest slide", () => {
    render(<Swiper items={items} />, { wrapper });
    const el = scroller();
    fireEvent.mouseDown(el, { clientX: 500 });
    expect(el.style.scrollSnapType).toBe("none");
    fireEvent.mouseMove(document, { clientX: 300 });
    expect(el.scrollLeft).toBe(300);
    fireEvent.mouseUp(document);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "smooth" });
    expect(dot(2)).toHaveAttribute("aria-current", "true");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(el.style.scrollSnapType).toBe("x mandatory");
  });

  it("jumps instead of smooth-scrolling under reduced motion", () => {
    mockReducedMotion(true);
    render(<Swiper items={items} />, { wrapper });
    press(screen.getByRole("button", { name: "Next slide" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "auto" });
    settle();

    const el = scroller();
    fireEvent.mouseDown(el, { clientX: 500 });
    fireEvent.mouseMove(document, { clientX: 300 });
    fireEvent.mouseUp(document);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: "auto" });
  });
});

describe("Swiper: visibility", () => {
  /** Captures the observer's callback so a test can report what the browser would. */
  const observe = () => {
    const seen: { callback: IntersectionObserverCallback } = { callback: () => {} };
    const Real = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        seen.callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    return { seen, restore: () => (globalThis.IntersectionObserver = Real) };
  };
  const entry = (target: Element, ratio: number, width = 400) =>
    ({
      target,
      isIntersecting: true,
      intersectionRatio: ratio,
      boundingClientRect: { width } as DOMRectReadOnly,
    }) as IntersectionObserverEntry;

  it("ignores a neighbour that only touches the edge of the view", () => {
    const { seen, restore } = observe();
    try {
      render(<Swiper items={items} />, { wrapper });
      const slides = [...scroller().children];
      // What the browser reports first: the slide in view, and the next one touching its edge.
      act(() => {
        seen.callback([entry(slides[0], 1), entry(slides[1], 0)], {} as IntersectionObserver);
      });
      expect(dot(1)).toHaveAttribute("aria-current", "true");
    } finally {
      restore();
    }
  });

  it("ignores slides that have no width yet", () => {
    const { seen, restore } = observe();
    try {
      render(<Swiper items={items} />, { wrapper });
      const slides = [...scroller().children];
      // Before the images load every slide is zero wide, and a zero-area
      // target that intersects reports a ratio of 1.
      act(() => {
        seen.callback(
          slides.map((slide) => entry(slide, 1, 0)),
          {} as IntersectionObserver,
        );
      });
      expect(dot(1)).toHaveAttribute("aria-current", "true");
    } finally {
      restore();
    }
  });
});
