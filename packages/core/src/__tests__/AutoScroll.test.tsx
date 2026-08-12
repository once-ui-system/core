import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoScroll } from "../components/AutoScroll";

describe("AutoScroll", () => {
  let resizeCallback: ((entries: Array<{ contentRect: { width: number } }>) => void) | null = null;
  let mockAnimation: {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    updatePlaybackRate: ReturnType<typeof vi.fn>;
    currentTime: number | null;
    playbackRate: number;
    playState: string;
  };
  let animateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAnimation = {
      play: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      updatePlaybackRate: vi.fn(),
      currentTime: 0,
      playbackRate: 1,
      playState: "running",
    };

    animateSpy = vi.fn().mockReturnValue(mockAnimation);
    HTMLElement.prototype.animate = animateSpy as unknown as typeof HTMLElement.prototype.animate;

    class MockResizeObserver {
      constructor(callback: (entries: Array<{ contentRect: { width: number } }>) => void) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children duplicated in marquee content tracks", () => {
    const { container } = render(
      <AutoScroll>
        <div>Item Alpha</div>
        <div>Item Beta</div>
      </AutoScroll>,
    );

    expect(screen.getAllByText("Item Alpha")).toHaveLength(2);
    expect(screen.getAllByText("Item Beta")).toHaveLength(2);

    const root = container.firstElementChild;
    expect(root).toHaveClass("overflow-hidden");
    expect(root).toHaveClass("w-full");

    const marqueeWrapper = container.querySelector(".will-change-transform");
    expect(marqueeWrapper).toBeInTheDocument();
    expect(marqueeWrapper).toHaveClass("w-full");

    const contentTracks = container.querySelectorAll(".whitespace-nowrap");
    expect(contentTracks).toHaveLength(2);
    for (const track of contentTracks) {
      expect(track).toHaveClass("shrink-0");
      expect(track).toHaveClass("min-w-full");
      expect(track).toHaveClass("w-fit");
      expect(track).toHaveClass("justify-around");
    }
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AutoScroll ref={ref}>
        <div>Test Item</div>
      </AutoScroll>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <AutoScroll className="custom-marquee" style={{ opacity: 0.8 }}>
        <div>Item</div>
      </AutoScroll>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-marquee");
    expect(root.style.opacity).toBe("0.8");
  });

  it("applies scrollGap correctly as number or string", () => {
    const { container: containerWithNumber } = render(
      <AutoScroll scrollGap={24}>
        <div>Item</div>
      </AutoScroll>,
    );

    const tracksNumber = containerWithNumber.querySelectorAll(".whitespace-nowrap");
    for (const track of tracksNumber) {
      expect((track as HTMLElement).style.marginRight).toBe("24px");
    }

    const { container: containerWithString } = render(
      <AutoScroll scrollGap="2rem">
        <div>Item</div>
      </AutoScroll>,
    );

    const tracksString = containerWithString.querySelectorAll(".whitespace-nowrap");
    for (const track of tracksString) {
      expect((track as HTMLElement).style.marginRight).toBe("2rem");
    }
  });

  it("initializes animation when content width is measured via ResizeObserver", () => {
    render(
      <AutoScroll speed="fast">
        <div>Animated Item</div>
      </AutoScroll>,
    );

    expect(resizeCallback).not.toBeNull();
    act(() => {
      resizeCallback?.([{ contentRect: { width: 300 } }]);
    });

    expect(animateSpy).toHaveBeenCalled();
    const [keyframes, options] = animateSpy.mock.calls[0];
    expect(keyframes).toEqual([
      { transform: "translateX(0)" },
      { transform: "translateX(-300px)" },
    ]);
    expect(options).toEqual({
      duration: 10000,
      iterations: Infinity,
      easing: "linear",
    });
  });

  it("supports reverse direction and different speed presets", () => {
    render(
      <AutoScroll speed="slow" reverse>
        <div>Reversed Item</div>
      </AutoScroll>,
    );

    act(() => {
      resizeCallback?.([{ contentRect: { width: 400 } }]);
    });

    expect(animateSpy).toHaveBeenCalled();
    const [keyframes, options] = animateSpy.mock.calls[0];
    expect(keyframes).toEqual([
      { transform: "translateX(-400px)" },
      { transform: "translateX(0)" },
    ]);
    expect(options.duration).toBe(40000);
  });

  it("handles hover='pause' interaction", () => {
    const { container } = render(
      <AutoScroll hover="pause">
        <div>Hover Item</div>
      </AutoScroll>,
    );

    act(() => {
      resizeCallback?.([{ contentRect: { width: 250 } }]);
    });
    const wrapper = container.querySelector(".will-change-transform") as HTMLElement;

    act(() => {
      fireEvent.mouseEnter(wrapper);
    });
    expect(mockAnimation.pause).toHaveBeenCalledTimes(1);

    mockAnimation.playState = "paused";
    act(() => {
      fireEvent.mouseLeave(wrapper);
    });
    expect(mockAnimation.play).toHaveBeenCalledTimes(2); // initial setup restore + mouseLeave resume
  });

  it("handles hover='slow' interaction", () => {
    const { container } = render(
      <AutoScroll hover="slow">
        <div>Hover Item</div>
      </AutoScroll>,
    );

    act(() => {
      resizeCallback?.([{ contentRect: { width: 250 } }]);
    });
    const wrapper = container.querySelector(".will-change-transform") as HTMLElement;

    act(() => {
      fireEvent.mouseEnter(wrapper);
    });
    expect(mockAnimation.updatePlaybackRate).toHaveBeenCalledWith(0.25);

    act(() => {
      fireEvent.mouseLeave(wrapper);
    });
    expect(mockAnimation.updatePlaybackRate).toHaveBeenCalledWith(1);
  });
});
