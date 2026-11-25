import { DataThemeProvider, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  StylePanelEffect,
  StylePanelFonts,
  StylePanelRoot,
  StylePanelScaling,
  StylePanelShape,
  StylePanelSite,
  StylePanelSolid,
  type StylePanelValue,
} from "../StylePanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

/**
 * 3.2: the panel for a site builder. Tiles drawn as real buttons, swatches
 * that wrap, named text sizes, font pairings, and StylePanelSite composing
 * them, ported from Tavilio's design tab.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

const PAIRS = [
  { value: "poster", label: "Poster", heading: "Bebas Neue, sans-serif" },
  { value: "classic", label: "Classic", heading: "Playfair Display, serif" },
];

function Controlled({
  initial,
  children,
  onChange,
}: {
  initial: StylePanelValue;
  children: React.ReactNode;
  onChange?: (changed: Partial<StylePanelValue>) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <StylePanelRoot
      value={value}
      onValueChange={(next, changed) => {
        setValue(next);
        onChange?.(changed);
      }}
    >
      {children}
    </StylePanelRoot>
  );
}

describe("StylePanel tiles", () => {
  it("draw Shape, Effect and Solid as radio tiles that each hold a sample button", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Controlled
        initial={{ border: "playful", solidStyle: "flat", solid: "color" }}
        onChange={onChange}
      >
        <StylePanelShape tiles />
        <StylePanelEffect tiles />
        <StylePanelSolid tiles />
      </Controlled>,
      { wrapper },
    );
    const effect = screen.getByRole("radiogroup", { name: "Effect" });
    const tiles = within(effect).getAllByRole("radio");
    expect(tiles.map((tile) => tile.getAttribute("aria-checked"))).toHaveLength(3);
    for (const name of ["Flat", "Plastic", "Glow"]) {
      expect(within(effect).getByRole("radio", { name })).toBeInTheDocument();
    }
    // The sample is a picture: hidden, out of the Tab order, not a control.
    expect(within(effect).queryAllByRole("button")).toHaveLength(0);
    expect(tiles[0].querySelector(".button")).toHaveAttribute("tabindex", "-1");
    // Each sample wears its own option.
    expect(tiles[2].querySelector('[data-solid-style="glow"]')).not.toBeNull();

    fireEvent.click(within(effect).getByRole("radio", { name: "Glow" }));
    expect(onChange).toHaveBeenLastCalledWith({ solidStyle: "glow" });
    expect(within(effect).getByRole("radio", { name: "Glow" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    const shape = screen.getByRole("radiogroup", { name: "Shape" });
    expect(within(shape).getByRole("radio", { name: "Playful" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    for (const group of screen.getAllByRole("radiogroup")) {
      const stops = within(group)
        .getAllByRole("radio")
        .filter((radio) => radio.getAttribute("tabindex") === "0");
      expect(stops).toHaveLength(1);
    }
    await expectNoAxeViolations(container);
  });

  it("follow the Root's tiles, and a row's own prop wins", () => {
    render(
      <StylePanelRoot tiles value={{}} onValueChange={() => {}}>
        <StylePanelEffect />
        <StylePanelSolid tiles={false} />
      </StylePanelRoot>,
      { wrapper },
    );
    // Tiles carry a sample wearing its option; the segmented row does not.
    const effect = screen.getByRole("radiogroup", { name: "Effect" });
    expect(effect.querySelector("[data-solid-style]")).not.toBeNull();
    const solid = screen.getByRole("radiogroup", { name: "Style" });
    expect(solid.querySelector("[data-solid-style]")).toBeNull();
  });
});

describe("StylePanel swatches", () => {
  it("wrap instead of scrolling with swatches=wrap", () => {
    const { container } = render(
      <StylePanelSite value={{ brand: "blue" }} onValueChange={() => {}} />,
      { wrapper },
    );
    const brand = screen.getByRole("radiogroup", { name: "Brand" });
    // No scroll buttons: every swatch is on screen.
    expect(within(brand.parentElement as HTMLElement).queryByRole("button")).toBeNull();
    expect(container.querySelectorAll('[aria-label^="Brand colour: "]').length).toBeGreaterThan(10);
  });
});

describe("StylePanelScaling named", () => {
  it("offers Small, Normal and Large for 95, 100 and 105", () => {
    const onChange = vi.fn();
    render(
      <Controlled initial={{ scaling: "100" }} onChange={onChange}>
        <StylePanelScaling named />
      </Controlled>,
      { wrapper },
    );
    const group = screen.getByRole("radiogroup", { name: "Scaling" });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => radio.textContent),
    ).toEqual(["Small", "Normal", "Large"]);
    fireEvent.click(within(group).getByRole("radio", { name: "Large" }));
    expect(onChange).toHaveBeenLastCalledWith({ scaling: "105" });
  });
});

describe("StylePanelFonts", () => {
  it("offers pairings as radios and shows the host's own pickers on One by one", () => {
    const onValueChange = vi.fn();
    render(
      <StylePanelRoot>
        <StylePanelFonts
          pairs={PAIRS}
          value="classic"
          onValueChange={onValueChange}
          more={<p>Per-role pickers</p>}
        />
      </StylePanelRoot>,
      { wrapper },
    );
    const group = screen.getByRole("radiogroup", { name: "Fonts" });
    expect(within(group).getByRole("radio", { name: /Classic/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(within(group).getByRole("radio", { name: /Poster/ }));
    expect(onValueChange).toHaveBeenCalledWith("poster");

    expect(screen.queryByText("Per-role pickers")).toBeNull();
    const toggle = screen.getByRole("button", { name: "One by one" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByText("Per-role pickers")).toBeInTheDocument();
  });
});

describe("StylePanelSite", () => {
  it("composes Look, Colour, Shape and buttons, Fonts and Fine-tune", async () => {
    const { container } = render(
      <StylePanelSite
        value={{ brand: "blue", border: "rounded", solidStyle: "flat", solid: "color" }}
        onValueChange={() => {}}
        look={<p>Host looks</p>}
        fonts={{ pairs: PAIRS, value: "poster" }}
        fineTune={<p>Page width</p>}
        labels={{ groups: { color: { title: "Colour" } } }}
      />,
      { wrapper },
    );
    for (const title of ["Look", "Colour", "Shape and buttons", "Fonts", "Fine-tune"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    expect(screen.getByText("Host looks")).toBeInTheDocument();
    for (const name of ["Brand", "Theme", "Shape", "Effect", "Style", "Fonts"]) {
      expect(screen.getByRole("radiogroup", { name })).toBeInTheDocument();
    }
    // Fine-tune starts folded.
    expect(screen.queryByRole("radiogroup", { name: "Scaling" })).toBeNull();
    fireEvent.click(screen.getByText("Fine-tune"));
    expect(await screen.findByRole("radiogroup", { name: "Scaling" })).toBeInTheDocument();
    expect(screen.getByText("Page width")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
