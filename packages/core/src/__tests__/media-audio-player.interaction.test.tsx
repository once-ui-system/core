import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaAudioPlayer } from "../components/MediaAudioPlayer";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type MediaState = { paused: boolean; time: number; duration: number };
const state = new WeakMap<HTMLMediaElement, MediaState>();
const stateOf = (el: HTMLMediaElement) => {
  let s = state.get(el);
  if (!s) {
    s = { paused: true, time: 0, duration: 120 };
    state.set(el, s);
  }
  return s;
};

/**
 * jsdom has no media pipeline: `play()` throws "not implemented" and `paused`
 * never changes. This fakes just enough of HTMLMediaElement (paused, play,
 * pause, currentTime, duration) for the player's own wiring to be exercised.
 */
function fakeMedia() {
  const proto = HTMLMediaElement.prototype;
  const play = vi.spyOn(proto, "play").mockImplementation(function (this: HTMLMediaElement) {
    stateOf(this).paused = false;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  const pause = vi.spyOn(proto, "pause").mockImplementation(function (this: HTMLMediaElement) {
    stateOf(this).paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(proto, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
    return stateOf(this).paused;
  });
  vi.spyOn(proto, "duration", "get").mockImplementation(function (this: HTMLMediaElement) {
    return stateOf(this).duration;
  });
  vi.spyOn(proto, "currentTime", "get").mockImplementation(function (this: HTMLMediaElement) {
    return stateOf(this).time;
  });
  vi.spyOn(proto, "currentTime", "set").mockImplementation(function (
    this: HTMLMediaElement,
    value: number,
  ) {
    stateOf(this).time = value;
  });
  return { play, pause };
}

const audio = (container: HTMLElement) => container.querySelector("audio") as HTMLAudioElement;
const loaded = (el: HTMLAudioElement) =>
  act(() => {
    el.dispatchEvent(new Event("loadedmetadata"));
  });

/**
 * The audio player: a named group, a Play/Pause button, and a seek slider
 * that takes focus and answers arrows (5s) and Space/Enter (toggle). Callers
 * hang narration sync off onTimeUpdate/onPlayingChange, so those must report
 * the element's own values.
 */
describe("MediaAudioPlayer interaction", () => {
  let media: ReturnType<typeof fakeMedia>;
  beforeEach(() => {
    media = fakeMedia();
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });
  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, "setPointerCapture");
    Reflect.deleteProperty(Element.prototype, "releasePointerCapture");
  });

  it("has no axe violations", async () => {
    const { container } = render(<MediaAudioPlayer src="/a.mp3" label="Episode 4" />, { wrapper });
    await expectNoAxeViolations(container);
  });

  it("reads the duration from loadedmetadata into the slider and time label", () => {
    const { container } = render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    loaded(audio(container));
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveAttribute("aria-valuemax", "120");
    expect(slider).toHaveAttribute("aria-valuetext", "0:00 of 2:00");
    expect(screen.getByText("0:00 / 2:00")).toBeInTheDocument();
  });

  it("plays and pauses from the button, reporting onPlayingChange", async () => {
    const user = userEvent.setup();
    const onPlayingChange = vi.fn();
    render(<MediaAudioPlayer src="/a.mp3" onPlayingChange={onPlayingChange} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(media.play).toHaveBeenCalledTimes(1);
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(media.pause).toHaveBeenCalledTimes(1);
    expect(onPlayingChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("reaches the button then the slider with Tab", async () => {
    const user = userEvent.setup();
    render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Play" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveFocus();
  });

  it("toggles playback with Space and Enter on the slider", async () => {
    const user = userEvent.setup();
    render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    screen.getByRole("slider", { name: "Seek" }).focus();
    await user.keyboard(" ");
    expect(media.play).toHaveBeenCalledTimes(1);
    await user.keyboard("{Enter}");
    expect(media.pause).toHaveBeenCalledTimes(1);
  });

  it("seeks 5 seconds with the arrows, clamped to 0 and the duration", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    loaded(audio(container));
    screen.getByRole("slider", { name: "Seek" }).focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(audio(container).currentTime).toBe(10);
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(audio(container).currentTime).toBe(0);
    stateOf(audio(container)).time = 117;
    await user.keyboard("{ArrowRight}");
    expect(audio(container).currentTime).toBe(120);
  });

  it("reports timeupdate positions through onTimeUpdate and the slider", () => {
    const onTimeUpdate = vi.fn();
    const { container } = render(<MediaAudioPlayer src="/a.mp3" onTimeUpdate={onTimeUpdate} />, {
      wrapper,
    });
    loaded(audio(container));
    stateOf(audio(container)).time = 65.4;
    act(() => {
      audio(container).dispatchEvent(new Event("timeupdate"));
    });
    expect(onTimeUpdate).toHaveBeenCalledWith(65.4);
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveAttribute("aria-valuenow", "65");
    expect(slider).toHaveAttribute("aria-valuetext", "1:05 of 2:00");
  });

  it("seeks to where the track is pressed and dragged", () => {
    const { container } = render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    loaded(audio(container));
    const slider = screen.getByRole("slider", { name: "Seek" });
    vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 400,
      top: 0,
      height: 4,
      right: 500,
      bottom: 4,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(slider, { clientX: 200, pointerId: 1 });
    expect(audio(container).currentTime).toBe(30);
    fireEvent.pointerMove(slider, { clientX: 900, pointerId: 1 });
    expect(audio(container).currentTime).toBe(120);
    fireEvent.pointerUp(slider, { clientX: 900, pointerId: 1 });
    fireEvent.pointerMove(slider, { clientX: 100, pointerId: 1 });
    expect(audio(container).currentTime).toBe(120);
  });

  it("does not leave an unhandled rejection when the browser refuses to play", async () => {
    const user = userEvent.setup();
    let then: ReturnType<typeof vi.spyOn> | undefined;
    media.play.mockImplementation(() => {
      const refused = Promise.reject(new DOMException("blocked", "NotAllowedError"));
      then = vi.spyOn(refused, "then");
      return refused;
    });
    render(<MediaAudioPlayer src="/a.mp3" />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Play" }));
    // A rejection is handled once something attaches a rejection handler
    // (`.catch(fn)` is `.then(undefined, fn)`).
    expect(then?.mock.calls.some((call: unknown[]) => typeof call[1] === "function")).toBe(true);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("stops listening to the element after unmount", () => {
    const onTimeUpdate = vi.fn();
    const { container, unmount } = render(
      <MediaAudioPlayer src="/a.mp3" onTimeUpdate={onTimeUpdate} />,
      { wrapper },
    );
    const el = audio(container);
    unmount();
    el.dispatchEvent(new Event("timeupdate"));
    expect(onTimeUpdate).not.toHaveBeenCalled();
  });
});
