import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoScroll } from "../components/AutoScroll";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** jsdom has no Web Animations: record what AutoScroll asks for instead. */
type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  playbackRate: number;
  playState: "running" | "paused" | "idle";
  currentTime: number | null;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  updatePlaybackRate: ReturnType<typeof vi.fn>;
};
let animations: FakeAnimation[] = [];

beforeEach(() => {
  animations = [];
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300);
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    writable: true,
    value(keyframes: Keyframe[], options: KeyframeAnimationOptions) {
      const animation: FakeAnimation = {
        keyframes,
        options,
        playbackRate: 1,
        playState: "running",
        currentTime: 0,
        play: vi.fn(() => {
          animation.playState = "running";
        }),
        pause: vi.fn(() => {
          animation.playState = "paused";
        }),
        cancel: vi.fn(() => {
          animation.playState = "idle";
        }),
        updatePlaybackRate: vi.fn((rate: number) => {
          animation.playbackRate = rate;
        }),
      };
      animations.push(animation);
      return animation;
    },
  });
});

/** The content's width is read on resize; that is when the marquee starts. */
const start = () => {
  act(() => {
    fireEvent(window, new Event("resize"));
  });
  return animations.at(-1) as FakeAnimation;
};

const Logos = (props: Partial<React.ComponentProps<typeof AutoScroll>>) => (
  <AutoScroll {...props}>
    <a href="/a">Acme</a>
    <a href="/b">Globex</a>
  </AutoScroll>
);

/**
 * A marquee: the content twice in a row, moved by a linear infinite
 * animation. The second copy is only there to close the loop, so it is
 * hidden from assistive tech and the Tab order. Hover slows or pauses it.
 */
describe("AutoScroll: content", () => {
  it("exposes the content once and passes axe", async () => {
    const { container } = render(<Logos />, { wrapper });
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual(["Acme", "Globex"]);
    expect(container.querySelectorAll("a")).toHaveLength(4);
    await expectNoAxeViolations(container);
  });

  it("keeps the copy out of the Tab order", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Logos />
        <button type="button">After</button>
      </>,
      { wrapper },
    );
    const copy = screen.getAllByText("Acme")[1].parentElement as HTMLElement;
    expect(copy).toHaveAttribute("aria-hidden", "true");
    expect(copy).toHaveAttribute("inert");
    await user.tab();
    expect(screen.getByRole("link", { name: "Acme" })).toHaveFocus();
  });

  it("puts scrollGap after each copy", () => {
    render(<Logos scrollGap={24} />, { wrapper });
    const copies = screen.getAllByText("Acme").map((a) => a.parentElement as HTMLElement);
    expect(copies.map((c) => c.style.marginRight)).toEqual(["24px", "24px"]);
  });
});

describe("AutoScroll: animation", () => {
  it("moves the content left by its width, at the chosen speed", () => {
    render(<Logos speed="fast" />, { wrapper });
    const animation = start();
    expect(animation.keyframes).toEqual([
      { transform: "translateX(0)" },
      { transform: "translateX(-300px)" },
    ]);
    expect(animation.options).toMatchObject({
      duration: 10000,
      iterations: Number.POSITIVE_INFINITY,
      easing: "linear",
    });
  });

  it("runs the other way with reverse", () => {
    render(<Logos reverse />, { wrapper });
    expect(start().keyframes[0]).toEqual({ transform: "translateX(-300px)" });
  });

  it("slows to a quarter on hover by default and recovers on leave", async () => {
    const user = userEvent.setup();
    render(<Logos />, { wrapper });
    const animation = start();
    const track = screen.getAllByText("Acme")[0].parentElement?.parentElement as HTMLElement;
    await user.hover(track);
    expect(animation.playbackRate).toBe(0.25);
    await user.unhover(track);
    expect(animation.playbackRate).toBe(1);
  });

  it("pauses on hover with hover=pause and plays again on leave", async () => {
    const user = userEvent.setup();
    render(<Logos hover="pause" />, { wrapper });
    const animation = start();
    const track = screen.getAllByText("Acme")[0].parentElement?.parentElement as HTMLElement;
    await user.hover(track);
    expect(animation.playState).toBe("paused");
    await user.unhover(track);
    expect(animation.playState).toBe("running");
  });

  it("ignores hover with hover=none", async () => {
    const user = userEvent.setup();
    render(<Logos hover="none" />, { wrapper });
    const animation = start();
    const track = screen.getAllByText("Acme")[0].parentElement?.parentElement as HTMLElement;
    await user.hover(track);
    expect(animation.playState).toBe("running");
    expect(animation.playbackRate).toBe(1);
  });

  it("cancels its animation on unmount", () => {
    const { unmount } = render(<Logos />, { wrapper });
    const animation = start();
    unmount();
    expect(animation.cancel).toHaveBeenCalled();
  });
});
