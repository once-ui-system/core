import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// The one config file: brand, theme and SEO defaults. Pages read from here.

export const brand = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  url: "https://acme-notes.example",
  email: "hello@acme-notes.example",
  locale: "en_US",
};

export const seo = {
  title: brand.name,
  description: `${brand.name}: ${brand.tagline} Shared notebooks, instant search, and roles and permissions for teams.`,
  siteName: brand.name,
  locale: brand.locale,
  type: "website" as const,
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

export const appNav = [
  { label: "Dashboard", segment: "", icon: "grid" as const },
  { label: "Members", segment: "/members", icon: "people" as const },
  { label: "Settings", segment: "/settings", icon: "settings" as const },
];
