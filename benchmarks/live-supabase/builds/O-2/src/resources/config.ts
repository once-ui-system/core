import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Brand, theme and SEO defaults: every page reads from here.
export const brand = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  url: "https://acme-notes.example",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, roles and permissions.",
};

export const seo = {
  titleTemplate: `%s · ${brand.name}`,
  defaultTitle: `${brand.name}: ${brand.tagline}`,
  description: brand.description,
  locale: "en_US",
};

export const style: OnceUIStyleConfig = {
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
