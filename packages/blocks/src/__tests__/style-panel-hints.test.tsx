import { LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { StylePanel, StylePanelBrand, StylePanelRoot, StylePanelTheme } from "../StylePanel.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </LayoutProvider>
);

/** The info icons beside row labels: an icon inside a label element. */
const infoIcons = (container: HTMLElement) =>
  container.querySelectorAll("[id] > [class*='icon'], [id] > * svg");

describe("row hints and label width", () => {
  it("shows no hint icons by default", () => {
    const { container } = render(<StylePanel value={{}} onValueChange={() => {}} />, { wrapper });
    const before = infoIcons(container).length;
    const { container: c2 } = render(<StylePanel hints value={{}} onValueChange={() => {}} />, {
      wrapper,
    });
    expect(infoIcons(c2).length).toBeGreaterThan(before);
  });

  it("a row's own hint shows without the Root's hints, and false drops a built-in one", () => {
    const { container } = render(
      <StylePanelRoot value={{}} onValueChange={() => {}}>
        <StylePanelTheme hint="Pick light or dark" />
      </StylePanelRoot>,
      { wrapper },
    );
    const withHint = infoIcons(container).length;
    const { container: c2 } = render(
      <StylePanelRoot hints value={{}} onValueChange={() => {}}>
        <StylePanelTheme hint={false} />
      </StylePanelRoot>,
      { wrapper },
    );
    expect(withHint).toBeGreaterThan(infoIcons(c2).length);
  });

  it("gives every label one width beside its control", () => {
    render(
      <StylePanelRoot labelWidth="8rem" value={{}} onValueChange={() => {}}>
        <StylePanelTheme />
        <StylePanelBrand />
      </StylePanelRoot>,
      { wrapper },
    );
    const label = (text: string) => screen.getAllByText(text)[0]?.closest("[id]") as HTMLElement;
    expect(label("Theme").style.width || label("Theme").className).toBeTruthy();
    expect(label("Theme").className).toBe(label("Brand").className);
    expect(label("Theme").style.flexShrink).toBe("0");
  });

  it("ignores the label width while stacked", () => {
    render(
      <StylePanelRoot stacked labelWidth="8rem" value={{}} onValueChange={() => {}}>
        <StylePanelTheme />
      </StylePanelRoot>,
      { wrapper },
    );
    const label = screen.getAllByText("Theme")[0]?.closest("[id]") as HTMLElement;
    expect(label.style.flexShrink).toBe("");
  });
});
