import { LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StylePanelAdvanced,
  StylePanelDensity,
  StylePanelRoot,
  StylePanelScaling,
} from "../StylePanel.js";

/**
 * The Density row, beside Scaling: bound to ThemeProvider it writes
 * `data-density`, and the density's scaling too until a scaling is chosen;
 * controlled, it only reports the value.
 */

const root = document.documentElement;

afterEach(() => {
  localStorage.clear();
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </LayoutProvider>
);

describe("StylePanel Density", () => {
  it("sits next to Scaling", () => {
    render(
      <StylePanelRoot>
        <StylePanelAdvanced />
      </StylePanelRoot>,
      { wrapper },
    );
    const density = screen.getByText("Density", { exact: true });
    const scaling = screen.getByText("Scaling", { exact: true });
    expect(
      density.compareDocumentPosition(scaling) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("writes data-density and brings the density's scaling along", () => {
    render(
      <StylePanelRoot>
        <StylePanelDensity />
        <StylePanelScaling />
      </StylePanelRoot>,
      { wrapper },
    );
    act(() => screen.getByRole("radio", { name: "Compact" }).click());
    expect(root.getAttribute("data-density")).toBe("compact");
    expect(root.getAttribute("data-scaling")).toBe("95");

    // A scaling chosen here is the theme's own from then on.
    act(() => screen.getByRole("radio", { name: "110" }).click());
    act(() => screen.getByRole("radio", { name: "Spacious" }).click());
    expect(root.getAttribute("data-density")).toBe("spacious");
    expect(root.getAttribute("data-scaling")).toBe("110");
  });

  it("reports the density when a host owns the state", () => {
    const onValueChange = vi.fn();
    render(
      <StylePanelRoot value={{ density: "normal" }} onValueChange={onValueChange}>
        <StylePanelDensity />
      </StylePanelRoot>,
      { wrapper },
    );
    act(() => screen.getByRole("radio", { name: "Spacious" }).click());
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ density: "spacious" }),
      expect.objectContaining({ density: "spacious" }),
    );
  });
});
