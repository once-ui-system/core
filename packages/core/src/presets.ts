import type { OnceUIDataStyleConfig } from "./contexts/DataThemeProvider.js";
import type { OnceUIStyleConfig } from "./contexts/ThemeProvider.js";

/**
 * A font a preset was designed with: the family as Google Fonts names it, and
 * the name `next/font/google` exports it under.
 *
 * `{ family: "Space Grotesk", nextFont: "Space_Grotesk" }` is
 * `Space_Grotesk({ variable: "--font-heading", subsets: ["latin"] })`.
 */
export interface PresetFont {
  family: string;
  nextFont: string;
}

export interface ThemePreset {
  /** What the preset is for, in a sentence. */
  description: string;
  /** `once-ui.config`'s `style`: what ThemeInit and ThemeProvider take. */
  style: OnceUIStyleConfig;
  /** `once-ui.config`'s `dataStyle`: what DataThemeProvider takes. */
  dataStyle: OnceUIDataStyleConfig;
  /** The faces it was designed with, for `--font-heading`, `--font-body`, `--font-code`. */
  fonts: { heading: PresetFont; body: PresetFont; code: PresetFont };
}

const geist: PresetFont = { family: "Geist", nextFont: "Geist" };
const geistMono: PresetFont = { family: "Geist Mono", nextFont: "Geist_Mono" };

/**
 * Finished looks for the kinds of app Once UI is built for. Each one sets
 * every axis that makes a theme read as designed rather than default: a
 * tinted page and a lifted surface in both themes, the brand and accent, how
 * solids fill, the corner style, density and motion, and the faces.
 *
 * Start from one with {@link themePreset} and change only what the product
 * needs: its own brand colour is `brandSeed`.
 */
export const themePresets = {
  /** Operations, incidents, dispatch, maps, monitoring. */
  ops: {
    description:
      "Operations, incident, dispatch and map tools: dark first, compact, a quiet cyan brand on slate so status colours carry the meaning.",
    style: {
      theme: "system",
      defaultTheme: "dark",
      neutral: "slate",
      brand: "cyan",
      accent: "orange",
      solid: "contrast",
      solidStyle: "flat",
      border: "conservative",
      surface: "filled",
      transition: "micro",
      density: "compact",
      pageBackground: { light: "#f4f6f8", dark: "#0a0d12" },
      surfaceBackground: { light: "#ffffff", dark: "#121821" },
    },
    dataStyle: { variant: "flat", mode: "categorical" },
    fonts: {
      heading: { family: "Space Grotesk", nextFont: "Space_Grotesk" },
      body: { family: "IBM Plex Sans", nextFont: "IBM_Plex_Sans" },
      code: { family: "IBM Plex Mono", nextFont: "IBM_Plex_Mono" },
    },
  },
  /** Consumer, health, home, food, pets, plants: friendly and warm. */
  care: {
    description:
      "Consumer, health and care apps: warm paper, a terracotta brand with moss, soft corners and a friendly grotesque.",
    style: {
      theme: "system",
      defaultTheme: "light",
      neutral: "sand",
      brand: "custom",
      brandSeed: "#d4643a",
      accent: "moss",
      solid: "color",
      solidStyle: "flat",
      border: "playful",
      surface: "filled",
      transition: "all",
      pageBackground: { light: "#f7f3ec", dark: "#12100d" },
      surfaceBackground: { light: "#fffdf9", dark: "#1c1915" },
    },
    dataStyle: { variant: "gradient", mode: "categorical" },
    fonts: {
      heading: { family: "Bricolage Grotesque", nextFont: "Bricolage_Grotesque" },
      body: geist,
      code: geistMono,
    },
  },
  /** Editors, studios, media and design tools. */
  creative: {
    description:
      "Editors, studios and media tools: dark first on dusk, a violet brand with an orange accent, glossy solids and round corners.",
    style: {
      theme: "system",
      defaultTheme: "dark",
      neutral: "dusk",
      brand: "violet",
      accent: "orange",
      solid: "color",
      solidStyle: "plastic",
      border: "playful",
      surface: "filled",
      transition: "all",
      pageBackground: { light: "#f8f7fb", dark: "#0d0b12" },
      surfaceBackground: { light: "#ffffff", dark: "#17141f" },
    },
    dataStyle: { variant: "gradient", mode: "categorical" },
    fonts: {
      heading: { family: "Sora", nextFont: "Sora" },
      body: geist,
      code: geistMono,
    },
  },
  /** Stores, bookings, marketplaces, venues. */
  commerce: {
    description:
      "Stores, bookings and marketplaces: light first, ink buttons on near-white, an emerald brand for what is selected and in stock.",
    style: {
      theme: "system",
      defaultTheme: "light",
      neutral: "gray",
      brand: "emerald",
      accent: "orange",
      solid: "contrast",
      solidStyle: "flat",
      border: "rounded",
      surface: "filled",
      transition: "all",
      pageBackground: { light: "#f9f9f9", dark: "#0c0c0c" },
      surfaceBackground: { light: "#ffffff", dark: "#161616" },
    },
    dataStyle: { variant: "flat", mode: "categorical" },
    fonts: {
      heading: { family: "Instrument Sans", nextFont: "Instrument_Sans" },
      body: geist,
      code: geistMono,
    },
  },
} as const satisfies Record<string, ThemePreset>;

export type ThemePresetName = keyof typeof themePresets;

/**
 * A preset's `style`, `dataStyle` and `fonts`, with the app's own changes on
 * top. Spread into `defineConfig`:
 *
 * ```ts
 * import { defineConfig, themePreset } from "@once-ui-system/core/config";
 *
 * const care = themePreset("care", { style: { brandSeed: "#c2410c" } });
 * export const { style, dataStyle } = defineConfig({
 *   style: care.style,
 *   dataStyle: care.dataStyle,
 * });
 * // care.fonts.heading.nextFont === "Bricolage_Grotesque"
 * ```
 */
export function themePreset<N extends ThemePresetName>(
  name: N,
  overrides: { style?: OnceUIStyleConfig; dataStyle?: OnceUIDataStyleConfig } = {},
): {
  style: OnceUIStyleConfig;
  dataStyle: OnceUIDataStyleConfig;
  fonts: (typeof themePresets)[N]["fonts"];
} {
  const preset = themePresets[name];
  if (!preset) {
    throw new Error(
      `Unknown theme preset "${String(name)}": one of ${Object.keys(themePresets).join(", ")}`,
    );
  }
  const style: OnceUIStyleConfig = { ...preset.style, ...overrides.style };
  // A seed or scale of the app's own brand replaces the preset's named one.
  if (
    (overrides.style?.brandSeed || overrides.style?.brandScale) &&
    overrides.style?.brand === undefined
  ) {
    style.brand = "custom";
  }
  if (overrides.style?.brand && overrides.style.brand !== "custom" && !overrides.style.brandSeed) {
    delete style.brandSeed;
  }
  return {
    style,
    dataStyle: { ...preset.dataStyle, ...overrides.dataStyle },
    fonts: preset.fonts,
  };
}
