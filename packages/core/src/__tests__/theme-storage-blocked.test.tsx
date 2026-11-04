import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { DataThemeProvider, useDataTheme } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";

/**
 * In a sandboxed or third-party iframe, or with cookies off, merely reading
 * `window.localStorage` throws a SecurityError. The providers must still
 * render and switch themes; the choice is simply not remembered.
 */

let restore: (() => void) | undefined;

beforeEach(() => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException(
        "Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
        "SecurityError",
      );
    },
  });
  restore = () => {
    if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
  };
});

afterEach(() => {
  restore?.();
  document.documentElement.removeAttribute("data-theme");
});

function DataVizMode() {
  const { mode, setChartOptions } = useDataTheme();
  return (
    <button type="button" onClick={() => setChartOptions({ mode: "divergent" })}>
      mode: {mode}
    </button>
  );
}

describe("theme providers with storage blocked", () => {
  it("render and switch themes without throwing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <LayoutProvider>
        <ThemeProvider>
          <DataThemeProvider>
            <ThemeSwitcher />
            <DataVizMode />
          </DataThemeProvider>
        </ThemeProvider>
      </LayoutProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Dark theme" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: /mode:/ }));
    expect(screen.getByRole("button", { name: /mode:/ }).textContent).toBe("mode: divergent");
    error.mockRestore();
  });
});
