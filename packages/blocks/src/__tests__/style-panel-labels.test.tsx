import {
  DataThemeProvider,
  LayoutProvider,
  ThemeProvider,
  ThemeSwitcher,
} from "@once-ui-system/core";
import { render, screen, within } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { StylePanel, type StylePanelLabels } from "../StylePanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

/**
 * `labels` translates every string the panel shows or announces: group
 * headings, row labels, segmented options, the swatches' accessible names and
 * the theme switcher's. Root merges them over the English defaults and every
 * group and row reads them from context, so a composed panel is translated
 * as a whole; a row's or group's own prop still wins. Without `labels` the
 * panel says exactly what it said before.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

/** Every group, including the opt-in body text one. */
const everySection = { bodyText: { section: true } } as const;

const ENGLISH = {
  headings: [
    "Page",
    "Customize page theme",
    "Color",
    "Customize color schemes",
    "Solid style",
    "Customize the appearance of interactive elements",
    "Body text",
    "Scale running text without touching headings",
    "Advanced",
    "Customize advanced styling options",
  ],
  rows: [
    "Theme",
    "Shape",
    "Brand",
    "Accent",
    "Neutral",
    "Style",
    "Effect",
    "Text size",
    "Line height",
    "Surface",
    "Density",
    "Scaling",
    "Data Style",
    "Transition",
  ],
  tabs: [
    "Color",
    "Inverse",
    "Contrast",
    "Flat",
    "Plastic",
    ...["90", "95", "100", "105", "110"],
    ...["90", "100", "110", "120"],
    "Filled",
    "Translucent",
    "Compact",
    "Normal",
    "Spacious",
    ...["90", "95", "100", "105", "110"],
    "Categorical",
    "Divergent",
    "Sequential",
    "All",
    "Micro",
    "Macro",
    "None",
  ],
  buttons: [
    "System theme",
    "Dark theme",
    "Light theme",
    ...["sharp", "conservative", "playful", "rounded"].map((shape) => `Corner style: ${shape}`),
    ...[
      "blue",
      "indigo",
      "violet",
      "magenta",
      "pink",
      "red",
      "orange",
      "yellow",
      "moss",
      "green",
      "emerald",
      "aqua",
      "cyan",
    ].flatMap((scheme) => [`Brand colour: ${scheme}`]),
    ...[
      "blue",
      "indigo",
      "violet",
      "magenta",
      "pink",
      "red",
      "orange",
      "yellow",
      "moss",
      "green",
      "emerald",
      "aqua",
      "cyan",
    ].map((scheme) => `Accent colour: ${scheme}`),
    ...["gray", "sand", "slate", "dusk", "mint", "rose"].map((n) => `Neutral colour: ${n}`),
  ],
};

/** A complete German set, with every string unique so each can be found. */
const de: StylePanelLabels = {
  groups: {
    page: { title: "Seite", description: "Seitendesign anpassen" },
    color: { title: "Farben", description: "Farbschemata anpassen" },
    solidStyle: { title: "Flächen", description: "Aussehen interaktiver Elemente anpassen" },
    bodyText: { title: "Fließtext", description: "Fließtext ohne Überschriften skalieren" },
    advanced: { title: "Erweitert", description: "Erweiterte Gestaltungsoptionen" },
  },
  rows: {
    theme: "Erscheinungsbild",
    shape: "Ecken",
    brand: "Marke",
    accent: "Akzent",
    neutral: "Grauton",
    solid: "Stil",
    effect: "Effekt",
    surface: "Oberfläche",
    density: "Dichte",
    scaling: "Skalierung",
    transition: "Übergänge",
    dataStyle: "Diagrammstil",
    bodySize: "Textgröße",
    bodyLineHeight: "Zeilenhöhe",
  },
  options: {
    solid: { color: "Farbig", inverse: "Invertiert", contrast: "Kontrast" },
    effect: { flat: "Flach", plastic: "Plastisch" },
    surface: { filled: "Gefüllt", translucent: "Durchscheinend" },
    transition: { all: "Alle", micro: "Mikro", macro: "Makro", none: "Keine" },
    dataStyle: { categorical: "Kategorisch", divergent: "Divergierend", sequential: "Sequenziell" },
    density: { compact: "Kompakt", normal: "Standard", spacious: "Geräumig" },
    scaling: (value) => `${value} %`,
    bodySize: (value) => `${value} % Text`,
    bodyLineHeight: (value) => `${value} % Zeile`,
  },
  names: {
    shapes: { sharp: "spitz", conservative: "dezent", playful: "verspielt", rounded: "rund" },
    schemes: { blue: "Blau", red: "Rot" },
    neutrals: { gray: "Grau", sand: "Sandfarben" },
  },
  swatches: {
    shape: (name) => `Ecken ${name}`,
    // A translation can put the words in its own order.
    scheme: (name, row) => `${name} als ${row === "brand" ? "Markenfarbe" : "Akzentfarbe"}`,
    neutral: (name) => `${name} als Grauton`,
  },
  themeSwitcher: { system: "Systemdesign", dark: "Dunkles Design", light: "Helles Design" },
};

const buttonNames = (container: HTMLElement = document.body) =>
  within(container)
    .getAllByRole("button")
    .map((button) => button.getAttribute("aria-label"));

const tabNames = (container: HTMLElement = document.body) =>
  within(container)
    .getAllByRole("tab")
    .map((tab) => tab.textContent?.trim());

describe("StylePanel without labels", () => {
  it("says exactly what it said before", () => {
    render(<StylePanel visibility={everySection} />, { wrapper });
    for (const text of [...ENGLISH.headings, ...ENGLISH.rows]) {
      expect(screen.getAllByText(text, { exact: true }).length).toBeGreaterThan(0);
    }
    expect(tabNames()).toEqual(ENGLISH.tabs);
    expect(buttonNames()).toEqual(ENGLISH.buttons);
  });
});

describe("StylePanel labels", () => {
  it("reach every group, row, option and accessible name of the default panel", () => {
    const { container } = render(<StylePanel labels={de} visibility={everySection} />, {
      wrapper,
    });

    for (const group of Object.values(de.groups ?? {})) {
      expect(screen.getByText(group?.title as string)).toBeInTheDocument();
      expect(screen.getByText(group?.description as string)).toBeInTheDocument();
    }
    for (const row of Object.values(de.rows ?? {})) {
      expect(screen.getByText(row as string)).toBeInTheDocument();
    }

    expect(tabNames()).toEqual([
      "Farbig",
      "Invertiert",
      "Kontrast",
      "Flach",
      "Plastisch",
      ...["90", "95", "100", "105", "110"].map((v) => `${v} % Text`),
      ...["90", "100", "110", "120"].map((v) => `${v} % Zeile`),
      "Gefüllt",
      "Durchscheinend",
      "Kompakt",
      "Standard",
      "Geräumig",
      ...["90", "95", "100", "105", "110"].map((v) => `${v} %`),
      "Kategorisch",
      "Divergierend",
      "Sequenziell",
      "Alle",
      "Mikro",
      "Makro",
      "Keine",
    ]);

    const names = buttonNames();
    expect(names.slice(0, 3)).toEqual(["Systemdesign", "Dunkles Design", "Helles Design"]);
    expect(names).toEqual(
      expect.arrayContaining([
        "Ecken spitz",
        "Ecken rund",
        "Blau als Markenfarbe",
        "Rot als Akzentfarbe",
        "Grau als Grauton",
        "Sandfarben als Grauton",
        // A name the host did not translate falls back to the key.
        "violet als Markenfarbe",
        "mint als Grauton",
      ]),
    );

    // Nothing English is left, in the text or in an accessible name.
    const english = new Set([...ENGLISH.headings, ...ENGLISH.rows, ...ENGLISH.buttons]);
    for (const tab of ENGLISH.tabs) if (!/^\d+$/.test(tab)) english.add(tab);
    const texts = [...container.querySelectorAll("*")].flatMap((element) =>
      [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .filter(Boolean),
    );
    expect(texts.filter((text) => english.has(text as string))).toEqual([]);
    expect(names.filter((name) => english.has(name as string))).toEqual([]);
  });

  it("reach the rows and groups of a composed panel", () => {
    render(
      <StylePanel.Root labels={de} value={{ brand: "blue" }} onValueChange={vi.fn()}>
        <StylePanel.Group title="Meine Auswahl">
          <StylePanel.Brand />
          <StylePanel.Solid />
          <StylePanel.Scaling />
          <StylePanel.DataStyle />
        </StylePanel.Group>
        <StylePanel.Page />
      </StylePanel.Root>,
      { wrapper },
    );

    expect(screen.getByText("Meine Auswahl")).toBeInTheDocument();
    expect(screen.getByText("Marke")).toBeInTheDocument();
    expect(screen.getByText("Stil")).toBeInTheDocument();
    expect(screen.getByText("Skalierung")).toBeInTheDocument();
    expect(screen.getByText("Diagrammstil")).toBeInTheDocument();
    expect(screen.getByText("Seite")).toBeInTheDocument();
    expect(screen.getByText("Erscheinungsbild")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Blau als Markenfarbe" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Dunkles Design" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ecken verspielt" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Invertiert" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "105 %" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Sequenziell" })).toBeInTheDocument();
  });

  it("lose to a row's or group's own props", () => {
    render(
      <StylePanel.Root labels={de}>
        <StylePanel.Page title="Mein Titel" description={false} />
        <StylePanel.Color title={false} description="Eigene Beschreibung" rows={{ brand: false }} />
        <StylePanel.Group title={false} description={false}>
          <StylePanel.Brand label="Hausfarbe" />
          <StylePanel.Accent label={false} />
        </StylePanel.Group>
      </StylePanel.Root>,
      { wrapper },
    );

    expect(screen.getByText("Mein Titel")).toBeInTheDocument();
    expect(screen.queryByText("Seite")).not.toBeInTheDocument();
    expect(screen.queryByText("Seitendesign anpassen")).not.toBeInTheDocument();
    expect(screen.queryByText("Farben")).not.toBeInTheDocument();
    expect(screen.getByText("Eigene Beschreibung")).toBeInTheDocument();
    expect(screen.getByText("Hausfarbe")).toBeInTheDocument();
    // Brand appears once, under its own label; Accent once, from the Color group.
    expect(screen.queryByText("Marke")).not.toBeInTheDocument();
    expect(screen.getAllByText("Akzent")).toHaveLength(1);
    // The swatches are still translated.
    expect(screen.getByRole("button", { name: "Blau als Markenfarbe" })).toBeInTheDocument();
  });

  it("keep the English for whatever they leave out", () => {
    render(
      <StylePanel
        labels={{
          groups: { color: { title: "Farben" } },
          rows: { brand: "Marke" },
          options: { solid: { inverse: "Invertiert" } },
          swatches: { neutral: (name) => `Grauton ${name}` },
          themeSwitcher: { dark: "Dunkel", light: undefined },
        }}
      />,
      { wrapper },
    );

    expect(screen.getByText("Farben")).toBeInTheDocument();
    expect(screen.getByText("Customize color schemes")).toBeInTheDocument();
    expect(screen.getByText("Marke")).toBeInTheDocument();
    expect(screen.getByText("Accent")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Invertiert" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Contrast" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grauton gray" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Brand colour: blue" })).toBeInTheDocument();
    expect(buttonNames().slice(0, 3)).toEqual(["System theme", "Dunkel", "Light theme"]);
  });

  it("leave a labelled panel without axe violations", async () => {
    const { container } = render(<StylePanel labels={de} visibility={everySection} />, {
      wrapper,
    });
    await expectNoAxeViolations(container);
  });
});

describe("ThemeSwitcher labels", () => {
  it("name the options, keeping the English for any left out", () => {
    render(<ThemeSwitcher labels={{ system: "Système", dark: "Sombre" }} />, { wrapper });
    expect(buttonNames()).toEqual(["Système", "Sombre", "Light theme"]);
  });
});
