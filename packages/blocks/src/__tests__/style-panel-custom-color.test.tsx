import { DataThemeProvider, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  StylePanel,
  StylePanelAccent,
  StylePanelBrand,
  StylePanelGroup,
  type StylePanelLabels,
  StylePanelRoot,
  type StylePanelValue,
} from "../StylePanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

/**
 * `customColors` (or `custom` on `StylePanelBrand`/`StylePanelAccent`) ends
 * the row's swatches with one for a colour of the host's own. Choosing it
 * reports `brand: "custom"` with a seed; while it is chosen a colour field
 * edits the seed. It is a controlled-mode feature: bound to ThemeProvider,
 * whose `setStyle` takes no seed, the swatch does not render. The panel only
 * reports the seed — the host renders the scheme.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

/** A host that owns the state, like a site editor previewing a saved style. */
function Host({
  initial = {},
  onChange,
  labels,
}: {
  initial?: StylePanelValue;
  onChange?: (next: StylePanelValue, changed: Partial<StylePanelValue>) => void;
  labels?: StylePanelLabels;
}) {
  const [value, setValue] = useState<StylePanelValue>(initial);
  return (
    <StylePanel
      customColors
      labels={labels}
      value={value}
      onValueChange={(next, changed) => {
        setValue(next);
        onChange?.(next, changed);
      }}
    />
  );
}

const customBrand = () => screen.getByRole("radio", { name: "Brand colour: custom" });
const brandField = () => screen.getByLabelText("Custom brand colour") as HTMLInputElement;
/** The decorative face inside a swatch. */
const face = (swatch: HTMLElement) => swatch.querySelector('[class*="swatch"]') as HTMLElement;

describe("StylePanel custom colour", () => {
  it("is not offered unless the host opts in", () => {
    render(<StylePanel value={{}} onValueChange={vi.fn()} />, { wrapper });
    expect(screen.queryByRole("radio", { name: "Brand colour: custom" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Accent colour: custom" })).toBeNull();
  });

  it("is not offered when bound to ThemeProvider, which takes no seed", () => {
    render(<StylePanel customColors />, { wrapper });
    expect(screen.queryByRole("radio", { name: "Brand colour: custom" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Accent colour: custom" })).toBeNull();

    render(
      <StylePanelRoot>
        <StylePanelBrand custom />
      </StylePanelRoot>,
      { wrapper },
    );
    expect(screen.queryByRole("radio", { name: "Brand colour: custom" })).toBeNull();
  });

  it("ends the Brand and Accent swatches, and only those", () => {
    render(<Host />, { wrapper });
    const names = screen.getAllByRole("radio").map((b) => b.getAttribute("aria-label"));
    expect(names[names.indexOf("Brand colour: cyan") + 1]).toBe("Brand colour: custom");
    expect(names[names.indexOf("Accent colour: cyan") + 1]).toBe("Accent colour: custom");
    expect(names.filter((name) => name?.endsWith(": custom"))).toHaveLength(2);
  });

  it("shows a placeholder until there is a seed, then paints the swatch with it", () => {
    const { unmount } = render(<Host />, { wrapper });
    expect(face(customBrand()).getAttribute("style")).toBeNull();
    expect(face(customBrand()).querySelector("svg")).not.toBeNull();
    unmount();

    render(<Host initial={{ brand: "blue", brandSeed: "#ff8800" }} />, { wrapper });
    expect(face(customBrand()).style.background).toBe("rgb(255, 136, 0)");
    expect(face(customBrand()).querySelector("svg")).toBeNull();
  });

  it("selects custom with a default seed when there is none", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ brand: "blue" }} onChange={onChange} />, { wrapper });

    expect(customBrand()).toHaveAttribute("aria-checked", "false");
    await user.click(customBrand());
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "custom", brandSeed: "#5a93fc" },
      { brand: "custom", brandSeed: "#5a93fc" },
    );
    expect(customBrand()).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Brand colour: blue" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("selects custom with the seed the host already has", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ brand: "red", accentSeed: "#00aa55" }} onChange={onChange} />, {
      wrapper,
    });
    await user.click(screen.getByRole("radio", { name: "Accent colour: custom" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "red", accent: "custom", accentSeed: "#00aa55" },
      { accent: "custom", accentSeed: "#00aa55" },
    );
  });

  it("works from the keyboard, as every swatch now does", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host onChange={onChange} />, { wrapper });

    screen.getByRole("radio", { name: "Brand colour: red" }).focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ brand: "red" }, { brand: "red" });

    customBrand().focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "custom", brandSeed: "#5a93fc" },
      { brand: "custom", brandSeed: "#5a93fc" },
    );
    expect(customBrand()).toHaveFocus();
  });

  it("edits the seed in a labelled colour field while custom is chosen", () => {
    const onChange = vi.fn();
    render(<Host initial={{ brand: "custom", brandSeed: "#336699" }} onChange={onChange} />, {
      wrapper,
    });
    expect(brandField()).toHaveAttribute("type", "color");
    expect(brandField().value).toBe("#336699");
    // Only the chosen row shows a field.
    expect(screen.queryByLabelText("Custom accent colour")).toBeNull();

    fireEvent.change(brandField(), { target: { value: "#ff8800" } });
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "custom", brandSeed: "#ff8800" },
      { brand: "custom", brandSeed: "#ff8800" },
    );
    expect(face(customBrand()).style.background).toBe("rgb(255, 136, 0)");
    expect(screen.getByText("#ff8800")).toBeInTheDocument();
  });

  it("hides the field when a named scheme is chosen, keeping the seed for later", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host initial={{ brand: "custom", brandSeed: "#336699" }} onChange={onChange} />, {
      wrapper,
    });
    await user.click(screen.getByRole("radio", { name: "Brand colour: green" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { brand: "green", brandSeed: "#336699" },
      { brand: "green" },
    );
    expect(screen.queryByLabelText("Custom brand colour")).toBeNull();
    expect(face(customBrand()).style.background).toBe("rgb(51, 102, 153)");
  });

  it("does not report the field's clear button, which would leave no seed", () => {
    const onChange = vi.fn();
    render(<Host initial={{ brand: "custom", brandSeed: "#336699" }} onChange={onChange} />, {
      wrapper,
    });
    // A bare click: see color-input.test.tsx on jsdom and this field's suffix.
    fireEvent.click(screen.getByRole("button", { name: "Remove", hidden: true }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows a short hex seed in the field, and leaves it empty for other formats", () => {
    const { unmount } = render(<Host initial={{ brand: "custom", brandSeed: "#F80" }} />, {
      wrapper,
    });
    expect(brandField().value).toBe("#ff8800");
    unmount();

    render(<Host initial={{ brand: "custom", brandSeed: "oklch(0.72 0.17 40)" }} />, { wrapper });
    expect(screen.queryByText("oklch(0.72 0.17 40)")).toBeNull();
    // The swatch is CSS, which reads oklch() itself.
    expect(face(customBrand()).getAttribute("style")).toContain("oklch(0.72 0.17 40)");
  });

  it("takes its names, label, description and clear button from labels", () => {
    const labels: StylePanelLabels = {
      custom: {
        swatch: (row) => `Eigene ${row === "brand" ? "Markenfarbe" : "Akzentfarbe"}`,
        picker: (row) => `${row === "brand" ? "Markenfarbe" : "Akzentfarbe"} wählen`,
        description: (seed, row) => `${seed} ist zu hell für weißen Text (${row})`,
        remove: "Entfernen",
      },
    };
    render(<Host labels={labels} initial={{ brand: "custom", brandSeed: "#eeeeee" }} />, {
      wrapper,
    });

    expect(screen.getByRole("radio", { name: "Eigene Markenfarbe" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Eigene Akzentfarbe" })).toBeInTheDocument();
    const field = screen.getByLabelText("Markenfarbe wählen");
    const hint = screen.getByText("#eeeeee ist zu hell für weißen Text (brand)");
    expect(field.getAttribute("aria-describedby")).toContain(hint.id);
    expect(screen.getByRole("button", { name: "Entfernen", hidden: true })).toBeInTheDocument();
  });

  it("is offered on a composed row with `custom`", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <StylePanelRoot value={{}} onValueChange={onChange}>
        <StylePanelGroup>
          <StylePanelBrand />
          <StylePanelAccent custom label="Highlight" />
        </StylePanelGroup>
      </StylePanelRoot>,
      { wrapper },
    );
    expect(screen.queryByRole("radio", { name: "Brand colour: custom" })).toBeNull();
    expect(screen.getByText("Highlight")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Accent colour: custom" }));
    expect(onChange).toHaveBeenLastCalledWith(
      { accent: "custom", accentSeed: "#5a93fc" },
      { accent: "custom", accentSeed: "#5a93fc" },
    );
  });

  it("has no axe violations, labelled and with the picker open", async () => {
    const labels: StylePanelLabels = {
      rows: { brand: "Marke", accent: "Akzent" },
      swatches: { scheme: (name, row) => `${name} (${row})` },
      custom: {
        swatch: (row) => `Eigene Farbe (${row})`,
        picker: (row) => `Eigene Farbe wählen (${row})`,
        description: (seed) => `Zu hell: ${seed}`,
        remove: "Entfernen",
      },
    };
    const { container } = render(
      <Host labels={labels} initial={{ brand: "custom", brandSeed: "#eeeeee", accent: "red" }} />,
      { wrapper },
    );
    expect(screen.getByLabelText("Eigene Farbe wählen (brand)")).toBeInTheDocument();
    expect(screen.getByText("Zu hell: #eeeeee")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Eigene Farbe (brand)" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expectNoAxeViolations(container);
  });
});

describe("StylePanel controlled Theme row", () => {
  it("shows value.theme and reports a choice, writing nothing to ThemeProvider or storage", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    localStorage.clear();
    document.documentElement.setAttribute("data-theme", "light");
    render(<Host initial={{ theme: "dark" }} onChange={onChange} />, { wrapper });

    const dark = screen.getByRole("radio", { name: "Dark theme" });
    const light = screen.getByRole("radio", { name: "Light theme" });
    expect(dark).toHaveAttribute("aria-checked", "true");

    await user.click(light);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ theme: "light" }), {
      theme: "light",
    });
    expect(light).toHaveAttribute("aria-checked", "true");
    expect(dark).toHaveAttribute("aria-checked", "false");

    await user.click(dark);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ theme: "dark" }), {
      theme: "dark",
    });
    expect(localStorage.getItem("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("treats an unset theme as the system one", () => {
    render(<StylePanel value={{}} onValueChange={vi.fn()} />, { wrapper });
    expect(screen.getByRole("radio", { name: "System theme" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
