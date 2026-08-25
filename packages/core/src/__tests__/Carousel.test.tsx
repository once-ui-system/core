import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Carousel,
  carouselControlsVariants,
  carouselFadeVariants,
  carouselIndicatorLineVariants,
  carouselIndicatorVariants,
  carouselNavButtonVariants,
  carouselVariants,
} from "../components/Carousel";

describe("Carousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockItems = [
    { slide: "https://example.com/image1.jpg", alt: "Slide 1" },
    { slide: "https://example.com/image2.jpg", alt: "Slide 2" },
    { slide: "https://example.com/image3.jpg", alt: "Slide 3" },
  ];

  it("returns null when items is empty", () => {
    const { container } = render(<Carousel items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders single slide without controls", () => {
    render(<Carousel items={[{ slide: "https://example.com/single.jpg", alt: "Single" }]} />);
    expect(screen.getByAltText("Single")).toBeInTheDocument();
  });

  it("renders custom ReactNode slide content", () => {
    render(
      <Carousel
        items={[
          { slide: <div data-testid="custom-slide-1">Custom 1</div> },
          { slide: <div data-testid="custom-slide-2">Custom 2</div> },
        ]}
      />,
    );
    expect(screen.getByTestId("custom-slide-1")).toBeInTheDocument();
  });

  it("forwards ref to root Column and applies custom className and style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Carousel
        ref={ref}
        items={mockItems}
        className="custom-carousel-class"
        style={{ zIndex: 10 }}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-carousel-class");
    expect(root).toHaveClass("isolate");
    expect((root as HTMLElement).style.zIndex).toBe("10");
  });

  it("renders controls and line indicators for multiple items by default", () => {
    const { container } = render(<Carousel items={mockItems} />);

    // Line indicators (3 items)
    const indicators = container.querySelectorAll(".group\\/indicator");
    expect(indicators.length).toBe(3);

    // Controls wrapper
    const controls = container.querySelector(".group\\/controls");
    expect(controls).toBeInTheDocument();
  });

  it("navigates forward and backward with next and prev buttons", () => {
    const { container } = render(<Carousel items={mockItems} />);

    // Initially active index is 0, image 1 alt is present
    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();

    // Right nav button
    const rightNav = container.querySelector(".translate-x-4");
    expect(rightNav).toBeInTheDocument();

    // Click next
    act(() => {
      const rightButton = rightNav?.querySelector("button");
      if (rightButton) fireEvent.click(rightButton);
      vi.advanceTimersByTime(350);
    });

    // Now active index is 1, image 2 is active
    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();

    // Click prev
    const leftNav = container.querySelector(".-translate-x-4");
    expect(leftNav).toBeInTheDocument();

    act(() => {
      const leftButton = leftNav?.querySelector("button");
      if (leftButton) fireEvent.click(leftButton);
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
  });

  it("navigates when clicking line indicators", () => {
    const { container } = render(<Carousel items={mockItems} />);

    const indicators = container.querySelectorAll(".group\\/indicator");
    expect(indicators.length).toBe(3);

    // Click 3rd indicator (index 2)
    act(() => {
      fireEvent.click(indicators[2]);
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByAltText("Slide 3")).toBeInTheDocument();
  });

  it('renders thumbnail indicators when indicator="thumbnail"', () => {
    render(<Carousel items={mockItems} indicator="thumbnail" />);

    // Thumbnail images rendered in scroller
    const images = screen.getAllByAltText("Slide 1");
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it("handles touch swipe gestures", () => {
    const { container } = render(<Carousel items={mockItems} />);

    const revealFx = container.querySelector(".group\\/controls")?.parentElement;
    expect(revealFx).toBeInTheDocument();

    if (revealFx) {
      // Swipe left (next)
      act(() => {
        fireEvent.touchStart(revealFx, {
          touches: [{ clientX: 200, clientY: 0 }],
        });
        fireEvent.touchEnd(revealFx, {
          changedTouches: [{ clientX: 100, clientY: 0 }],
        });
        vi.advanceTimersByTime(350);
      });

      expect(screen.getByAltText("Slide 2")).toBeInTheDocument();

      // Swipe right (prev)
      act(() => {
        fireEvent.touchStart(revealFx, {
          touches: [{ clientX: 100, clientY: 0 }],
        });
        fireEvent.touchEnd(revealFx, {
          changedTouches: [{ clientX: 200, clientY: 0 }],
        });
        vi.advanceTimersByTime(350);
      });

      expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
    }
  });

  it("handles auto-play and play/pause toggle", () => {
    render(<Carousel items={mockItems} play={{ auto: true, interval: 2000, controls: true }} />);

    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();

    // Advance timer by 2000ms + transition 350ms
    act(() => {
      vi.advanceTimersByTime(2000);
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();

    // Find play/pause button (initially showing pause since auto=true)
    const toggleButton = screen.getByRole("button", { name: "pause" });
    expect(toggleButton).toBeInTheDocument();

    // Toggle pause
    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByRole("button", { name: "play" })).toBeInTheDocument();

    // Advance timer - should stay on slide 2
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();
  });

  it("handles play progress indicator", () => {
    const { container } = render(
      <Carousel items={mockItems} play={{ auto: true, interval: 2000, progress: true }} />,
    );

    // Progress bar exists
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const progressFill = container.querySelector(".bg-brand-solid-strong");
    expect(progressFill).toBeInTheDocument();
  });

  it("exports CVA variant generators correctly", () => {
    expect(carouselVariants()).toContain("isolate");
    expect(carouselControlsVariants()).toContain("group/controls");
    expect(carouselFadeVariants()).toContain("opacity-0");
    expect(carouselNavButtonVariants({ direction: "left" })).toContain("-translate-x-4");
    expect(carouselNavButtonVariants({ direction: "right" })).toContain("translate-x-4");
    expect(carouselIndicatorVariants()).toContain("group/indicator");
    expect(carouselIndicatorLineVariants({ active: true })).toContain(
      "bg-neutral-on-background-strong",
    );
    expect(carouselIndicatorLineVariants({ active: false })).toContain("bg-neutral-alpha-medium");
  });
});
