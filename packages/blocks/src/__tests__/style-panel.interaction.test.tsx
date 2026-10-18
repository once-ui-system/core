import { DataThemeProvider, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { StylePanel } from "../StylePanel.js";
import { type StylePanelValue } from "../StylePanelSections.js";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

function Host({
  initial = {},
  onChange,
}: {
  initial?: StylePanelValue;
  onChange?: (next: StylePanelValue, changed: Partial<StylePanelValue>) => void;
}) {
  const [value, setValue] = useState<StylePanelValue>(initial);
  return (
    <StylePanel
      value={value}
      onValueChange={(next, changed) => {
        setValue(next);
        onChange?.(next, changed);
      }}
    />
  );
}

const swatch = (name: string) => screen.getByRole("button", { name });

/**
 * The panel's swatch rows are toggle buttons (one tab stop each, Enter/Space
 * choose) and its option rows are segmented tab lists. Controlled, each choice
 * reports the whole next value plus just the change; bound, it writes to
 * ThemeProvider. `visibility` drops sections and rows.
 */
describe("StylePanel interaction", () => {
  it("reports a swatch click with the next value and the change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ brand: "blue" }} onChange={onChange} />, { wrapper });
    expect(swatch("Brand colour: blue")).toHaveAttribute("aria-pressed", "true");

    await user.click(swatch("Corner style: rounded"));
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "blue", border: "rounded" },
      { border: "rounded" },
    );
    expect(swatch("Corner style: rounded")).toHaveAttribute("aria-pressed", "true");

    await user.click(swatch("Neutral colour: sand"));
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "blue", border: "rounded", neutral: "sand" },
      { neutral: "sand" },
    );
  });

  it("chooses a swatch with Enter and Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });
    swatch("Accent colour: red").focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ accent: "red" }, { accent: "red" });
    swatch("Accent colour: green").focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith({ accent: "green" }, { accent: "green" });
  });

  it("gives each swatch one tab stop", async () => {
    const user = userEvent.setup();
    render(<Host />, { wrapper });
    swatch("Corner style: sharp").focus();
    await user.tab();
    expect(swatch("Corner style: conservative")).toHaveFocus();
    await user.tab();
    expect(swatch("Corner style: playful")).toHaveFocus();
  });

  it("reports a segmented choice", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });
    await user.click(screen.getByRole("tab", { name: "Plastic" }));
    expect(onChange).toHaveBeenLastCalledWith({ solidStyle: "plastic" }, { solidStyle: "plastic" });
    expect(screen.getByRole("tab", { name: "Plastic" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "110" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { solidStyle: "plastic", scaling: "110" },
      { scaling: "110" },
    );
  });

  it("reports the chart mode in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });
    await user.click(screen.getByRole("tab", { name: "Divergent" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { chartMode: "divergent" },
      { chartMode: "divergent" },
    );
  });

  it("writes to ThemeProvider when not controlled", async () => {
    const user = userEvent.setup();
    render(<StylePanel />, { wrapper });
    await user.click(swatch("Corner style: playful"));
    expect(swatch("Corner style: playful")).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-border", "playful");
  });

  it("drops sections and rows by visibility, and shows Body text only on request", () => {
    const { rerender } = render(
      <StylePanel
        value={{}}
        onValueChange={vi.fn()}
        visibility={{ color: { section: false }, page: { shape: false } }}
      />,
      { wrapper },
    );
    expect(screen.queryByRole("button", { name: /Brand colour/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Corner style/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Dark theme" })).toBeInTheDocument();
    expect(screen.queryByText("Body text")).toBeNull();

    rerender(
      <StylePanel
        value={{}}
        onValueChange={vi.fn()}
        visibility={{ bodyText: { section: true } }}
      />,
    );
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("renders a composed panel from its parts", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <StylePanel.Root value={{}} onValueChange={onChange}>
        <StylePanel.Page />
      </StylePanel.Root>,
      { wrapper },
    );
    expect(screen.queryByRole("button", { name: /Brand colour/ })).toBeNull();
    const page = within(container);
    await user.click(page.getByRole("button", { name: "Corner style: sharp" }));
    expect(onChange).toHaveBeenLastCalledWith({ border: "sharp" }, { border: "sharp" });
    await expectNoAxeViolations(container);
  });

  it("refuses a section outside a Root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<StylePanel.Color />, { wrapper })).toThrow(/inside a <StylePanel>/);
  });
});
