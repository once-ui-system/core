import {
  DataThemeProvider,
  LayoutProvider,
  type Schemes,
  Scroller,
  schemes,
  ThemeProvider,
} from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StylePanel, type StylePanelValue } from "../StylePanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

/** The second swatch, in view from the start, and the eleventh, out of it. */
const near = schemes[1] as Schemes;
const far = schemes[10] as Schemes;

/**
 * A style panel in a narrow sidebar. `stacked` puts every row's label above
 * its control; a custom-colour row takes the same layout props as any other
 * row; the chosen swatch is scrolled into view; and the scroll buttons can be
 * translated with the rest of the panel.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

/** The flex line that holds a row's label: the row itself, or a custom row's inner line. */
const lineOf = (label: string) => screen.getByText(label).parentElement as HTMLElement;

describe("StylePanel stacked", () => {
  it("puts each row's label above its control", () => {
    render(<StylePanel stacked value={{}} onValueChange={vi.fn()} customColors />, { wrapper });
    for (const label of ["Theme", "Shape", "Brand", "Accent", "Neutral", "Style", "Scaling"]) {
      expect(lineOf(label)).toHaveClass("flex-column");
    }
  });

  it("leaves the default panel's rows inline", () => {
    render(<StylePanel value={{}} onValueChange={vi.fn()} customColors />, { wrapper });
    for (const label of ["Theme", "Brand", "Accent", "Neutral", "Style"]) {
      expect(lineOf(label)).not.toHaveClass("flex-column");
    }
  });

  it("loses to a row's own layout props", () => {
    render(
      <StylePanel.Root stacked>
        <StylePanel.Group title="Page">
          <StylePanel.Theme direction="row" />
          <StylePanel.Shape />
        </StylePanel.Group>
      </StylePanel.Root>,
      { wrapper },
    );
    expect(lineOf("Theme")).not.toHaveClass("flex-column");
    expect(lineOf("Shape")).toHaveClass("flex-column");
  });
});

describe("StylePanel's option rows", () => {
  // The button's size shows in its radius class.
  const scalingTab = () => screen.getByRole("radio", { name: "100" });

  /** The SegmentedControl around a row's options. */
  const optionsOf = (tab: HTMLElement) =>
    tab.closest('[role="radiogroup"]')?.parentElement?.parentElement;

  it("keep their size inline, and stop at 22rem beside the label", () => {
    render(<StylePanel value={{}} onValueChange={vi.fn()} />, { wrapper });
    expect(scalingTab()).toHaveClass("radius-l");
    expect((optionsOf(scalingTab()) as HTMLElement).style.maxWidth).toBe("22rem");
  });

  it("take the whole row when stacked", () => {
    render(<StylePanel stacked value={{}} onValueChange={vi.fn()} />, { wrapper });
    expect((optionsOf(scalingTab()) as HTMLElement).style.maxWidth).toBe("");
  });

  it("drop a size when stacked, so a sidebar fits more of them", () => {
    render(<StylePanel stacked value={{}} onValueChange={vi.fn()} />, { wrapper });
    expect(scalingTab()).toHaveClass("radius-m");
    expect(screen.getByRole("radio", { name: "Contrast" })).toHaveClass("radius-m");
  });
});

describe("a custom-colour row", () => {
  it("lays out its label and swatches by the props every row takes", () => {
    const { container } = render(
      <StylePanel.Root value={{ brand: "custom", brandSeed: "#c2410c" }} onValueChange={vi.fn()}>
        <StylePanel.Group title="Color">
          <StylePanel.Brand custom direction="column" gap="12" paddingX="16" />
        </StylePanel.Group>
      </StylePanel.Root>,
      { wrapper },
    );
    const line = lineOf("Brand");
    expect(line).toHaveClass("flex-column", "g-12");
    // Spacing still belongs to the row, which holds the line and the picker.
    const row = container.querySelector('[class*="row"]') as HTMLElement;
    expect(row).toHaveClass("px-16");
    expect(row).not.toHaveClass("flex-column");
    expect(row).toContainElement(screen.getByLabelText("Custom brand colour"));
  });

  it("keeps a host's className beside the row's own", () => {
    render(
      <StylePanel.Root>
        <StylePanel.Group title="Page">
          <StylePanel.Theme className="mine" />
        </StylePanel.Group>
      </StylePanel.Root>,
      { wrapper },
    );
    const row = lineOf("Theme");
    expect(row).toHaveClass("mine");
    expect(row.className).toMatch(/row/);
  });
});

describe("the chosen swatch", () => {
  // jsdom lays nothing out: give every strip 200px of a 600px track, and
  // place each swatch by its index, 40px apart.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute("role") !== "radio" || !this.parentElement) {
        return DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 40 });
      }
      const index = Array.from(this.parentElement.children).indexOf(this);
      return DOMRect.fromRect({ x: index * 40, y: 0, width: 40, height: 40 });
    });
    HTMLElement.prototype.scrollBy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: jsdom has no scrollBy to restore.
    delete (HTMLElement.prototype as any).scrollBy;
  });

  const scrolledBy = () =>
    vi
      .mocked(HTMLElement.prototype.scrollBy)
      .mock.calls.map(([options]) => (options as ScrollToOptions).left);

  /** Where a swatch's right edge has to land: 40px, a swatch, short of the strip's 200px. */
  const revealed = (name: string) => {
    const swatch = screen.getByRole("radio", { name });
    const index = Array.from(swatch.parentElement?.children ?? []).indexOf(swatch);
    return (index + 1) * 40 - 160;
  };

  it("is scrolled into view, clear of the Next button, when the panel mounts", () => {
    render(
      <StylePanel.Root value={{ brand: "custom", brandSeed: "#c2410c" }} onValueChange={vi.fn()}>
        <StylePanel.Brand custom />
      </StylePanel.Root>,
      { wrapper },
    );
    // The custom swatch is the last one in the strip.
    expect(revealed("Brand colour: custom")).toBeGreaterThan(0);
    expect(scrolledBy()).toEqual([revealed("Brand colour: custom")]);
  });

  it("stays put when it is already in view", () => {
    render(
      <StylePanel.Root value={{ brand: near }} onValueChange={vi.fn()}>
        <StylePanel.Brand />
      </StylePanel.Root>,
      { wrapper },
    );
    expect(screen.getByRole("radio", { name: `Brand colour: ${near}` })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // The second swatch spans 40–80px, inside the 40–160px clear of both buttons.
    expect(scrolledBy()).toEqual([]);
  });

  it("is brought into view when the choice changes", async () => {
    function Host() {
      const [value, setValue] = useState<StylePanelValue>({ brand: near });
      return (
        <>
          <button type="button" onClick={() => setValue({ brand: far })}>
            Pick from outside
          </button>
          <StylePanel.Root value={value} onValueChange={setValue}>
            <StylePanel.Brand />
          </StylePanel.Root>
        </>
      );
    }
    render(<Host />, { wrapper });
    expect(scrolledBy()).toEqual([]);
    await userEvent.setup().click(screen.getByRole("button", { name: "Pick from outside" }));
    expect(scrolledBy()).toEqual([revealed(`Brand colour: ${far}`)]);
  });
});

describe("the scroll buttons", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "scrollLeft", "get").mockReturnValue(100);
  });
  afterEach(() => vi.restoreAllMocks());

  it("keep their English names by default", () => {
    render(
      <Scroller>
        <span>one</span>
      </Scroller>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Scroll Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Next" })).toBeInTheDocument();
  });

  it("take translated names, on a Scroller and through StylePanel's labels", async () => {
    const scroller = render(
      <Scroller labels={{ previous: "Zurück" }}>
        <span>one</span>
      </Scroller>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Next" })).toBeInTheDocument();
    scroller.unmount();

    const { container } = render(
      <StylePanel.Root labels={{ scroller: { previous: "Előző", next: "Következő" } }}>
        <StylePanel.Brand />
        <StylePanel.Neutral />
        <StylePanel.Solid />
        <StylePanel.Scaling />
      </StylePanel.Root>,
      { wrapper },
    );
    // Two swatch strips and two option rows.
    expect(await screen.findAllByRole("button", { name: "Következő" })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: "Előző" })).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^Scroll/ })).toBeNull();
    await expectNoAxeViolations(container);
  });
});
