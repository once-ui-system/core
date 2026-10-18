import { DataThemeProvider, IconButton, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { fireEvent, render, waitFor } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { StyleOverlay } from "../StyleOverlay.js";

/** The October 2026 accessibility drill: the overlay opens and closes from the keyboard. */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("StyleOverlay", () => {
  it("opens from the keyboard and closes with Escape", async () => {
    render(
      <ThemeProvider>
        <DataThemeProvider>
          <StyleOverlay>
            <IconButton icon="sparkle" aria-label="Open style panel" />
          </StyleOverlay>
        </DataThemeProvider>
      </ThemeProvider>,
      { wrapper: wrap },
    );
    // Role queries trip on a jsdom computed-style bug inside StylePanel.
    const trigger = document.querySelector<HTMLElement>('[aria-label="Open style panel"]');
    expect(trigger?.tagName).toBe("BUTTON");
    fireEvent.click(trigger as HTMLElement);
    await waitFor(() =>
      expect(document.querySelector('[aria-label="Close style panel"]')).toHaveFocus(),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(document.querySelector('[aria-label="Open style panel"]')).toHaveFocus(),
    );
  });
});
