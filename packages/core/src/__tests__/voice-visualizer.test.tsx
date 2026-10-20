import { render as baseRender, renderHook, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { useAudioLevel } from "../modules/ai/audioLevel";
import { VoiceVisualizer } from "../modules/ai/VoiceVisualizer";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

describe("VoiceVisualizer", () => {
  it("announces the state it is in", () => {
    const { rerender } = render(<VoiceVisualizer state="listening" />);
    expect(screen.getByRole("status").textContent).toBe("Listening");
    rerender(<VoiceVisualizer state="speaking" />);
    expect(screen.getByRole("status").textContent).toBe("Speaking");
    expect(screen.getByRole("status").getAttribute("data-state")).toBe("speaking");
  });

  it("writes a level to CSS variables, clamped, and marks itself live", () => {
    render(<VoiceVisualizer variant="bars" bars={3} level={1.4} state="speaking" />);
    const root = screen.getByRole("status");
    expect(root.hasAttribute("data-live")).toBe(true);
    expect(root.style.getPropertyValue("--voice-level")).toBe("1");
    // The middle bar is the tallest.
    const bars = [0, 1, 2].map((i) => Number(root.style.getPropertyValue(`--voice-bar-${i}`)));
    expect(bars[1]).toBeGreaterThan(bars[0]);
    expect(bars[0]).toBe(bars[2]);
  });

  it("drops the last level when the level goes away", () => {
    const { rerender } = render(<VoiceVisualizer variant="bars" bars={3} level={0.8} />);
    rerender(<VoiceVisualizer variant="bars" bars={3} state="thinking" />);
    const root = screen.getByRole("status");
    expect(root.style.getPropertyValue("--voice-level")).toBe("");
    expect(root.style.getPropertyValue("--voice-bar-1")).toBe("");
  });

  it("plays its stand-in animation when there is no audio", () => {
    render(<VoiceVisualizer state="listening" />);
    expect(screen.getByRole("status").hasAttribute("data-live")).toBe(false);
  });

  it("renders the bar count asked for", () => {
    const { container } = render(<VoiceVisualizer variant="bars" bars={7} />);
    expect(container.querySelectorAll("[style*='--voice-bar']")).toHaveLength(7);
  });

  it("takes a scheme for its colors", () => {
    render(<VoiceVisualizer color="accent" />);
    expect(screen.getByRole("status").style.getPropertyValue("--voice-color")).toBe(
      "var(--function-accent-500)",
    );
  });

  it("renders on the server", () => {
    expect(
      renderToString(
        <LayoutProvider>
          <VoiceVisualizer state="thinking" />
        </LayoutProvider>,
      ),
    ).toContain("Thinking");
  });

  it("falls back quietly where Web Audio is missing", () => {
    const stream = {} as MediaStream;
    expect(() => render(<VoiceVisualizer source={stream} state="listening" />)).not.toThrow();
    const { result } = renderHook(() => useAudioLevel(stream));
    expect(result.current).toBe(0);
  });

  it("has no axe violations", async () => {
    const { container } = render(<VoiceVisualizer state="speaking" variant="bars" />);
    await expectNoAxeViolations(container);
  });
});
