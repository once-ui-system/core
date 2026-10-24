import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// One file for the brand, the theme and the SEO defaults. Pages read from it.

export const brand = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles that decide who can read, edit and invite.",
  url: "https://acme-notes.example",
  locale: "en_US",
};

export const seo = {
  title: brand.name,
  titleTemplate: `%s · ${brand.name}`,
  description: brand.description,
  url: brand.url,
  siteName: brand.name,
  locale: brand.locale,
};

export const style: OnceUIStyleConfig = {
  // "dark" or "light" here locks the theme and the top-bar switch stops working.
  // Keep "system" and pick what a first visit sees with defaultTheme.
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
