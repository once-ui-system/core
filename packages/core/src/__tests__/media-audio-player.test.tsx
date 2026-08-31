import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaAudioPlayer } from "../components/MediaAudioPlayer";
import { LayoutProvider } from "../contexts";

// Column/Row route through ClientFlex, which requires the provider.
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * jsdom implements no media pipeline — no decoding, no timeupdate, and
 * HTMLMediaElement.play is not even defined. So these assert the wiring the
 * component is responsible for (element, accessible names, slider semantics,
 * time formatting) and not playback, which only a real browser can exercise.
 */
describe("MediaAudioPlayer", () => {
  it("renders an audio element with the given source", () => {
    const { container } = render(<MediaAudioPlayer src="/narration.mp3" />, { wrapper: wrap });
    const audio = container.querySelector("audio");
    expect(audio).toBeTruthy();
    expect(audio).toHaveAttribute("src", "/narration.mp3");
    expect(audio).toHaveAttribute("preload", "metadata");
  });

  it("names the group and the transport control", () => {
    render(<MediaAudioPlayer src="/a.mp3" label="Chapter narration" />, { wrapper: wrap });
    expect(screen.getByRole("group", { name: "Chapter narration" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("exposes a seekable slider with a readable value", () => {
    render(<MediaAudioPlayer src="/a.mp3" />, { wrapper: wrap });
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    expect(slider).toHaveAttribute("aria-valuetext", "0:00 of 0:00");
    expect(slider).toHaveAttribute("tabindex", "0");
  });

  it("formats elapsed and total time", () => {
    render(<MediaAudioPlayer src="/a.mp3" />, { wrapper: wrap });
    expect(screen.getByText("0:00 / 0:00")).toBeInTheDocument();
  });

  it("forwards loop and autoplay to the element", () => {
    const { container } = render(<MediaAudioPlayer src="/a.mp3" loop autoplay />, { wrapper: wrap });
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute("loop");
    expect(audio?.autoplay).toBe(true);
  });

  it("does not call onTimeUpdate before playback produces an event", () => {
    const onTimeUpdate = vi.fn();
    render(<MediaAudioPlayer src="/a.mp3" onTimeUpdate={onTimeUpdate} />, { wrapper: wrap });
    expect(onTimeUpdate).not.toHaveBeenCalled();
  });
});
