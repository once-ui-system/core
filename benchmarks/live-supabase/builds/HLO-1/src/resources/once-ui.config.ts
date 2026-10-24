import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// The one config file for the brand, the theme and the SEO defaults.
// Pages read `site` through src/lib/seo.ts.

export const site = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions for every member.",
  url: "https://acme-notes.example",
  locale: "en_US",
};

export const style: OnceUIStyleConfig = {
  // Keep "system"; defaultTheme picks what a first visit sees and the theme switch keeps working.
  theme: "system",
  defaultTheme: "dark",
  neutral: "gray",
  brand: "emerald",
  accent: "cyan",
  solid: "contrast",
  solidStyle: "flat",
  border: "playful",
  surface: "filled",
  transition: "all",
  scaling: "100",
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "gradient",
  mode: "categorical",
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};
