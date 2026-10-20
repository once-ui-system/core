import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { StylePanel, type StylePanelValue } from "../components/StylePanel";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { expectNoAxeViolations } from "../test/axe";

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
      onChange={(next, changed) => {
        setValue(next);
        onChange?.(next, changed);
      }}
    />
  );
}

const swatch = (name: string) => screen.getByRole("radio", { name });

/**
 * Every row of options is a radio group named by its label (one tab stop, the
 * arrows move and choose, Enter/Space choose). Controlled, each choice
 * reports the whole next value plus just the change; bound, it writes to
 * ThemeProvider. `visibility` drops sections and rows.
 */
describe("StylePanel interaction", () => {
  it("reports a swatch click with the next value and the change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ brand: "blue" }} onChange={onChange} />, { wrapper });
    expect(swatch("Brand colour: blue")).toHaveAttribute("aria-checked", "true");

    await user.click(swatch("Corner style: rounded"));
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "blue", border: "rounded" },
      { border: "rounded" },
    );
    expect(swatch("Corner style: rounded")).toHaveAttribute("aria-checked", "true");

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

  it("gives each swatch row one tab stop, the arrows moving and choosing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ border: "playful" }} onChange={onChange} />, { wrapper });
    const shape = screen.getByRole("radiogroup", { name: "Shape" });
    // Chosen, the swatch is the stop; nothing chosen, the first one is.
    expect(swatch("Corner style: playful")).toHaveAttribute("tabindex", "0");
    expect(swatch("Corner style: sharp")).toHaveAttribute("tabindex", "-1");
    expect(swatch("Brand colour: blue")).toHaveAttribute("tabindex", "0");
    expect(swatch("Brand colour: red")).toHaveAttribute("tabindex", "-1");

    swatch("Corner style: playful").focus();
    await user.keyboard("{ArrowRight}");
    expect(swatch("Corner style: rounded")).toHaveFocus();
    expect(swatch("Corner style: rounded")).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith({ border: "rounded" }, { border: "rounded" });
    await user.keyboard("{ArrowRight}");
    expect(swatch("Corner style: sharp")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(swatch("Corner style: rounded")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(swatch("Corner style: sharp")).toHaveAttribute("aria-checked", "true");

    // Tab leaves the group rather than walking its swatches.
    await user.tab();
    expect(shape.contains(document.activeElement)).toBe(false);
    expect(swatch("Brand colour: blue")).toHaveFocus();
  });

  it("names every option group by its row and exposes it as a radio group", async () => {
    const { container } = render(<Host initial={{ solid: "inverse" }} />, { wrapper });
    const groups = screen
      .getAllByRole("radiogroup")
      .map((group) => group.getAttribute("aria-label") ?? group.getAttribute("aria-labelledby"));
    expect(groups.every(Boolean)).toBe(true);
    for (const name of [
      "Theme",
      "Shape",
      "Brand",
      "Accent",
      "Neutral",
      "Style",
      "Effect",
      "Surface",
      "Scaling",
      "Data Style",
      "Transition",
    ]) {
      expect(screen.getByRole("radiogroup", { name })).toBeInTheDocument();
    }
    expect(screen.queryAllByRole("tablist")).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: /colour|Corner|theme/ })).toHaveLength(0);
    const style = screen.getByRole("radiogroup", { name: "Style" });
    expect(within(style).getByRole("radio", { name: "Inverse" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(style).getByRole("radio", { name: "Inverse" })).toHaveAttribute("tabindex", "0");
    expect(within(style).getByRole("radio", { name: "Color" })).toHaveAttribute("tabindex", "-1");
    // A segmented row is one radio group, not a tablist inside one.
    expect(style.querySelector('[role="tablist"], [role="radiogroup"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("moves and chooses with the arrows on a segmented row and the theme row", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ surface: "filled", theme: "dark" }} onChange={onChange} />, {
      wrapper,
    });
    const surface = screen.getByRole("radiogroup", { name: "Surface" });
    within(surface).getByRole("radio", { name: "Filled" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(within(surface).getByRole("radio", { name: "Translucent" })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(
      { surface: "translucent", theme: "dark" },
      { surface: "translucent" },
    );

    expect(swatch("Dark theme")).toHaveAttribute("tabindex", "0");
    expect(swatch("System theme")).toHaveAttribute("tabindex", "-1");
    swatch("Dark theme").focus();
    await user.keyboard("{ArrowRight}");
    expect(swatch("Light theme")).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(
      { surface: "translucent", theme: "light" },
      { theme: "light" },
    );
  });

  it("names a group by the default row label when the row hides its label", () => {
    render(
      <StylePanel.Root value={{}} onChange={vi.fn()}>
        <StylePanel.Shape label={false} />
        <StylePanel.Surface label={false} />
        <StylePanel.Brand label="Marke" />
      </StylePanel.Root>,
      { wrapper },
    );
    expect(screen.getByRole("radiogroup", { name: "Shape" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Surface" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Marke" })).toBeInTheDocument();
  });

  it("reports a segmented choice", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });
    await user.click(screen.getByRole("radio", { name: "Plastic" }));
    expect(onChange).toHaveBeenLastCalledWith({ solidStyle: "plastic" }, { solidStyle: "plastic" });
    expect(screen.getByRole("radio", { name: "Plastic" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "110" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { solidStyle: "plastic", scaling: "110" },
      { scaling: "110" },
    );
  });

  it("reports the chart mode in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });
    await user.click(screen.getByRole("radio", { name: "Divergent" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { chartMode: "divergent" },
      { chartMode: "divergent" },
    );
  });

  it("writes to ThemeProvider when not controlled", async () => {
    const user = userEvent.setup();
    render(<StylePanel />, { wrapper });
    await user.click(swatch("Corner style: playful"));
    expect(swatch("Corner style: playful")).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-border", "playful");
  });

  it("drops sections and rows by visibility, and shows Body text only on request", () => {
    const { rerender } = render(
      <StylePanel
        value={{}}
        onChange={vi.fn()}
        visibility={{ color: { section: false }, page: { shape: false } }}
      />,
      { wrapper },
    );
    expect(screen.queryByRole("radio", { name: /Brand colour/ })).toBeNull();
    expect(screen.queryByRole("radio", { name: /Corner style/ })).toBeNull();
    expect(screen.getByRole("radio", { name: "Dark theme" })).toBeInTheDocument();
    expect(screen.queryByText("Body text")).toBeNull();

    rerender(
      <StylePanel value={{}} onChange={vi.fn()} visibility={{ bodyText: { section: true } }} />,
    );
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("renders a composed panel from its parts", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <StylePanel.Root value={{}} onChange={onChange}>
        <StylePanel.Page />
      </StylePanel.Root>,
      { wrapper },
    );
    expect(screen.queryByRole("radio", { name: /Brand colour/ })).toBeNull();
    const page = within(container);
    await user.click(page.getByRole("radio", { name: "Corner style: sharp" }));
    expect(onChange).toHaveBeenLastCalledWith({ border: "sharp" }, { border: "sharp" });
    await expectNoAxeViolations(container);
  });

  it("refuses a section outside a Root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<StylePanel.Color />, { wrapper })).toThrow(/inside a <StylePanel>/);
  });
});
