import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollToTop } from "../components/ScrollToTop";

describe("ScrollToTop", () => {
  let scrollToSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with hidden classes when window.scrollY <= offset", () => {
    const { container } = render(
      <ScrollToTop>
        <span>Top</span>
      </ScrollToTop>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("fixed");
    expect(root).toHaveClass("bottom-16");
    expect(root).toHaveClass("right-16");
    expect(root).toHaveClass("opacity-0");
    expect(root).toHaveClass("invisible");
    expect(root).toHaveClass("pointer-events-none");
    expect(root).toHaveAttribute("data-visible", "false");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("tabindex", "-1");
  });

  it("becomes visible when scrolled beyond offset", () => {
    const { container } = render(
      <ScrollToTop offset={200}>
        <span>Top</span>
      </ScrollToTop>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("opacity-0");

    // Simulate scroll past offset
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 250, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root).toHaveClass("opacity-100");
    expect(root).toHaveClass("visible");
    expect(root).toHaveClass("pointer-events-auto");
    expect(root).toHaveAttribute("data-visible", "true");
    expect(root).toHaveAttribute("aria-hidden", "false");
    expect(root).toHaveAttribute("tabindex", "0");

    // Simulate scroll back to top
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root).toHaveClass("opacity-0");
    expect(root).toHaveClass("invisible");
    expect(root).toHaveAttribute("data-visible", "false");
  });

  it("calls window.scrollTo on click", () => {
    render(
      <ScrollToTop>
        <span>Back to top</span>
      </ScrollToTop>,
    );

    const button = screen.getByText("Back to top");
    fireEvent.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("forwards ref to root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ScrollToTop ref={ref}>
        <span>Top</span>
      </ScrollToTop>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <ScrollToTop className="custom-scroll-btn" style={{ padding: "10px" }}>
        <span>Top</span>
      </ScrollToTop>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-scroll-btn");
    expect(root.style.padding).toBe("10px");
  });
});
