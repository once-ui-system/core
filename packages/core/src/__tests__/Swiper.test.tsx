import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Swiper,
  swiperContainerVariants,
  swiperDotVariants,
  swiperNavButtonVariants,
  swiperScrollContainerVariants,
  swiperSlideVariants,
  swiperVariants,
} from "../components/Swiper";

describe("Swiper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockItems = [
    { slide: "https://example.com/slide1.jpg", alt: "Slide 1" },
    { slide: "https://example.com/slide2.jpg", alt: "Slide 2" },
    { slide: "https://example.com/slide3.jpg", alt: "Slide 3" },
  ];

  it("returns null when items is empty", () => {
    const { container } = render(<Swiper items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders single slide without controls or indicators", () => {
    render(<Swiper items={[{ slide: "https://example.com/single.jpg", alt: "Single" }]} />);
    expect(screen.getByAltText("Single")).toBeInTheDocument();
    expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
  });

  it("renders custom ReactNode slide content", () => {
    render(
      <Swiper
        items={[
          { slide: <div data-testid="custom-swiper-1">Custom 1</div> },
          { slide: <div data-testid="custom-swiper-2">Custom 2</div> },
        ]}
      />,
    );
    expect(screen.getByTestId("custom-swiper-1")).toBeInTheDocument();
  });

  it("forwards ref to root Column and applies custom className and style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Swiper
        ref={ref}
        items={mockItems}
        className="custom-swiper-class"
        style={{ opacity: 0.95 }}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-swiper-class");
    expect(root).toHaveClass("isolate");
    expect((root as HTMLElement).style.opacity).toBe("0.95");
  });

  it("renders navigation controls and dot indicators for multiple items", () => {
    render(<Swiper items={mockItems} />);

    expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
  });

  it("navigates forward and backward on next / prev button click", () => {
    const { container } = render(<Swiper items={mockItems} />);

    const scrollContainer = container.querySelector(".overflow-x-auto") as HTMLElement;
    scrollContainer.scrollTo = vi.fn();
    Object.defineProperty(scrollContainer, "clientWidth", { value: 500, configurable: true });

    const nextButton = screen.getByLabelText("Next slide");
    act(() => {
      fireEvent.click(nextButton);
      vi.advanceTimersByTime(550);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 500,
      behavior: "smooth",
    });

    const prevButton = screen.getByLabelText("Previous slide");
    act(() => {
      fireEvent.click(prevButton);
      vi.advanceTimersByTime(550);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: "smooth",
    });
  });

  it("navigates to specific slide on dot indicator click and keydown", () => {
    const { container } = render(<Swiper items={mockItems} />);

    const scrollContainer = container.querySelector(".overflow-x-auto") as HTMLElement;
    scrollContainer.scrollTo = vi.fn();
    Object.defineProperty(scrollContainer, "clientWidth", { value: 400, configurable: true });

    const dot3 = screen.getByLabelText("Go to slide 3");
    act(() => {
      fireEvent.click(dot3);
      vi.advanceTimersByTime(550);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 800,
      behavior: "smooth",
    });

    const dot2 = screen.getByLabelText("Go to slide 2");
    act(() => {
      fireEvent.keyDown(dot2, { key: "Enter" });
      vi.advanceTimersByTime(550);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 400,
      behavior: "smooth",
    });

    act(() => {
      fireEvent.keyDown(dot2, { key: " " });
      vi.advanceTimersByTime(550);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 400,
      behavior: "smooth",
    });
  });

  it("handles mouse drag to scroll interaction", () => {
    const { container } = render(<Swiper items={mockItems} />);

    const scrollContainer = container.querySelector(".overflow-x-auto") as HTMLElement;
    scrollContainer.scrollTo = vi.fn();
    Object.defineProperty(scrollContainer, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, "scrollLeft", {
      value: 0,
      writable: true,
      configurable: true,
    });

    // Start drag
    act(() => {
      fireEvent.mouseDown(scrollContainer, { pageX: 200 });
    });

    // Drag move
    act(() => {
      fireEvent.mouseMove(document, { pageX: 100 });
    });

    // Release drag
    act(() => {
      fireEvent.mouseUp(document);
      vi.advanceTimersByTime(350);
    });

    expect(scrollContainer.scrollTo).toHaveBeenCalled();
  });

  it("handles scroll event updating active index", () => {
    const { container } = render(<Swiper items={mockItems} />);

    const scrollContainer = container.querySelector(".overflow-x-auto") as HTMLElement;
    Object.defineProperty(scrollContainer, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, "scrollLeft", {
      value: 600,
      writable: true,
      configurable: true,
    });

    act(() => {
      fireEvent.scroll(scrollContainer);
    });

    const dot3 = screen.getByLabelText("Go to slide 3");
    expect(dot3).toHaveClass("scale-[1.2]");
  });

  it("renders with contained controls", () => {
    const { container } = render(<Swiper items={mockItems} controls="contained" />);

    const dotsContainer = container.querySelector(".translate-y-\\[-100\\%\\]");
    expect(dotsContainer).toBeInTheDocument();
  });

  it("exports CVA variant generators correctly", () => {
    expect(swiperVariants()).toContain("isolate");
    expect(swiperContainerVariants()).toContain("group/swiper");
    expect(swiperScrollContainerVariants()).toContain("[scrollbar-width:none]");
    expect(swiperSlideVariants()).toContain("shrink-0");
    expect(swiperNavButtonVariants()).toContain("opacity-0");
    expect(swiperDotVariants({ active: true })).toContain("bg-neutral-on-background-strong");
    expect(swiperDotVariants({ active: false })).toContain("bg-neutral-alpha-medium");
  });
});
