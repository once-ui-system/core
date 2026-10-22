import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogoSpinner, Mascot, ThemeProvider, WorkingIndicator } from "../src";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const wrap = (node: React.ReactNode) => render(<ThemeProvider theme="light">{node}</ThemeProvider>);

// On the web the drawings go through react-native-svg's DOM build.
describe("assistant drawings on the web", () => {
  it("draws the mascot as an <svg> image with tile eyes and lid clips", async () => {
    const { container } = wrap(<Mascot state="thinking" />);
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByLabelText("Assistant, thinking")).toBeTruthy();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelectorAll("clipPath")).toHaveLength(5);
  });

  it("draws the logo loader's four tiles", () => {
    const { container } = wrap(<LogoSpinner />);
    expect(container.querySelectorAll("path")).toHaveLength(4);
  });

  it("shimmers the verb one letter at a time", () => {
    wrap(<WorkingIndicator label="Kerning" loader={false} />);
    expect(screen.getByLabelText("Working").textContent).toBe("Kerning");
  });
});
