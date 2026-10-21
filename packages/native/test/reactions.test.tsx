import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reactions, ThemeProvider } from "../src";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// The Expo web build draws through react-native-web.
describe("Reactions on the web", () => {
  it("toggles a chip and moves its count", async () => {
    const { container } = render(
      <ThemeProvider theme="light">
        <Reactions
          options={[
            { value: "❤️", label: "Love" },
            { value: "👍", label: "Like" },
          ]}
          counts={{ "❤️": 2 }}
          showAll
          picker={false}
        />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByLabelText("Like, 0"));
    expect(screen.getByLabelText("Like, 1")).toBeTruthy();
    expect(screen.getByLabelText("Like, 1").getAttribute("aria-pressed")).toBe("true");
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.textContent?.match(/👍/g)).toHaveLength(1);
  });
});
