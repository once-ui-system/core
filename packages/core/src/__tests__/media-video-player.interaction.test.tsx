import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaVideoPlayer } from "../components/MediaVideoPlayer";
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

const player = () => screen.getByRole("group", { name: "Video player" });
const video = (container: HTMLElement) => container.querySelector("video") as HTMLVideoElement;

/**
 * The video player owns a focusable group with YouTube-style shortcuts
 * (Space/k play, m mute, f fullscreen, arrows seek 5s), a control bar of
 * named icon buttons and a seek slider. These protect that wiring; decoding
 * and real playback only exist in a browser.
 */
describe("MediaVideoPlayer", () => {
  let media: ReturnType<typeof fakeMedia>;
  beforeEach(() => {
    media = fakeMedia();
    // jsdom has no pointer capture.
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(Element.prototype, "setPointerCapture");
    Reflect.deleteProperty(Element.prototype, "releasePointerCapture");
    Reflect.deleteProperty(HTMLElement.prototype, "requestFullscreen");
  });

  it("renders a muted, inline, metadata-preloaded video with the given source and fit", () => {
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" objectFit="contain" loop />, {
      wrapper,
    });
    const el = video(container);
    expect(el).toHaveAttribute("src", "/clip.mp4");
    expect(el).toHaveAttribute("preload", "metadata");
    expect(el).toHaveAttribute("playsinline");
    expect(el.loop).toBe(true);
    expect(el.muted).toBe(true);
    expect(el.style.objectFit).toBe("contain");
  });

  it("names the group, the transport buttons and the seek slider", async () => {
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    expect(player()).toHaveAttribute("tabindex", "0");
    // Paused: the centre overlay and the bar both offer Play.
    expect(screen.getAllByRole("button", { name: "Play" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    await expectNoAxeViolations(container, { rules: { "video-caption": { enabled: false } } });
  });

  it("starts unmuted when muted={false}", () => {
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" muted={false} />, { wrapper });
    expect(video(container).muted).toBe(false);
    expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
  });

  it("plays and pauses from the bar button, swapping its name", async () => {
    const user = userEvent.setup();
    render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    const [, barPlay] = screen.getAllByRole("button", { name: "Play" });
    await user.click(barPlay);
    expect(media.play).toHaveBeenCalledTimes(1);
    // Playing: the centre button is gone and the bar offers Pause.
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(media.pause).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button", { name: "Play" })).toHaveLength(2);
  });

  it("toggles playback with a click on the video surface", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    await user.click(video(container));
    expect(media.play).toHaveBeenCalledTimes(1);
    await user.click(video(container));
    expect(media.pause).toHaveBeenCalledTimes(1);
  });

  it("does not toggle playback for clicks inside the control bar", async () => {
    const user = userEvent.setup();
    render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    await user.click(screen.getByRole("slider", { name: "Seek" }));
    expect(media.play).not.toHaveBeenCalled();
  });

  it("mutes and unmutes from its button", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Unmute" }));
    expect(video(container).muted).toBe(false);
    expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
    expect(media.play).not.toHaveBeenCalled();
  });

  it("answers Space and k with play/pause when the player has focus", async () => {
    const user = userEvent.setup();
    render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    await user.tab();
    expect(player()).toHaveFocus();
    await user.keyboard(" ");
    expect(media.play).toHaveBeenCalledTimes(1);
    await user.keyboard("k");
    expect(media.pause).toHaveBeenCalledTimes(1);
  });

  it("lets Space on a focused control button press that button, not toggle playback", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    screen.getByRole("button", { name: "Unmute" }).focus();
    await user.keyboard(" ");
    expect(media.play).not.toHaveBeenCalled();
    expect(video(container).muted).toBe(false);
  });

  it("answers m with mute and f with fullscreen", async () => {
    const user = userEvent.setup();
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    HTMLElement.prototype.requestFullscreen = requestFullscreen;
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    player().focus();
    await user.keyboard("m");
    expect(video(container).muted).toBe(false);
    await user.keyboard("f");
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("reflects fullscreen state from fullscreenchange in the button name", async () => {
    render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: player() });
    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(screen.getByRole("button", { name: "Exit fullscreen" })).toBeInTheDocument();
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });
    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeInTheDocument();
  });

  it("seeks 5 seconds with the arrow keys, clamped to the clip", async () => {
    const user = userEvent.setup();
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    player().focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(video(container).currentTime).toBe(10);
    expect(screen.getByText("0:10 / 2:00")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(video(container).currentTime).toBe(0);
    stateOf(video(container)).time = 118;
    await user.keyboard("{ArrowRight}");
    expect(video(container).currentTime).toBe(120);
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuenow", "100");
  });

  it("updates time and progress from timeupdate", () => {
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    stateOf(video(container)).time = 30;
    act(() => {
      video(container).dispatchEvent(new Event("timeupdate"));
    });
    expect(screen.getByText("0:30 / 2:00")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuenow", "25");
  });

  it("seeks to the pointer position on the track", () => {
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    const slider = screen.getByRole("slider", { name: "Seek" });
    vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 200,
      top: 0,
      height: 4,
      right: 200,
      bottom: 4,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(slider, { clientX: 50, pointerId: 1 });
    expect(video(container).currentTime).toBe(30);
    fireEvent.pointerMove(slider, { clientX: 100, pointerId: 1 });
    expect(video(container).currentTime).toBe(60);
    fireEvent.pointerUp(slider, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(slider, { clientX: 150, pointerId: 1 });
    expect(video(container).currentTime).toBe(60);
    expect(media.play).not.toHaveBeenCalled();
  });

  it("tries to autoplay, and shows Play again when the browser refuses", async () => {
    media.play.mockImplementation(() =>
      Promise.reject(new DOMException("blocked", "NotAllowedError")),
    );
    render(<MediaVideoPlayer src="/clip.mp4" autoplay />, { wrapper });
    expect(media.play).toHaveBeenCalledTimes(1);
    expect(await screen.findAllByRole("button", { name: "Play" })).toHaveLength(2);
  });

  it("hides the controls 2.5s after playback starts and reveals them on mouse move", async () => {
    vi.useFakeTimers();
    const { container } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    const overlay = video(container).nextElementSibling as HTMLElement;
    await act(async () => {
      video(container).play();
    });
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(overlay.className).toContain("hidden");
    fireEvent.mouseMove(player());
    expect(overlay.className).toContain("visible");
  });

  it("clears the hide-controls timer on unmount", async () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, "clearTimeout");
    const { container, unmount } = render(<MediaVideoPlayer src="/clip.mp4" />, { wrapper });
    await act(async () => {
      video(container).play();
    });
    unmount();
    expect(clear).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
