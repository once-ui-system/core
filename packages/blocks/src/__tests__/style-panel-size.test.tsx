import { LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { MascotPanel } from "../MascotPanel.js";
import { StylePanel } from "../StylePanel.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </LayoutProvider>
);

/** The row a label sits in. */
const rowOf = (label: string) => screen.getAllByText(label)[0]?.parentElement as HTMLElement;

describe("panel size", () => {
  it("tightens StylePanel's rows at size s", () => {
    const { unmount } = render(<StylePanel value={{}} onValueChange={() => {}} />, { wrapper });
    const roomy = rowOf("Theme").className;
    unmount();
    render(<StylePanel size="s" value={{}} onValueChange={() => {}} />, { wrapper });
    const tight = rowOf("Theme").className;
    expect(tight).not.toBe(roomy);
  });

  it("tightens MascotPanel's rows and shrinks its tiles at size s", () => {
    const { unmount } = render(<MascotPanel value={{ v: 1 }} />, { wrapper });
    const roomy = rowOf("Roundness").className;
    unmount();
    const { container } = render(<MascotPanel size="s" value={{ v: 1 }} />, { wrapper });
    expect(rowOf("Roundness").className).not.toBe(roomy);
    expect(container.firstElementChild?.className).toMatch(/small/);
  });
});
