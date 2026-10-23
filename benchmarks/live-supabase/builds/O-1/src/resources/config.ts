import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// The one place for the brand, the theme and the SEO defaults. Pages read from here.
export const brand = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
  url: "https://acme-notes.example",
  email: "hello@acme-notes.example",
};

export const seo = {
  titleTemplate: `%s · ${brand.name}`,
  defaultTitle: `${brand.name}: ${brand.tagline}`,
  description: brand.description,
  locale: "en_US",
  ogImage: "/og.svg",
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

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "up to 3 members",
    features: ["Up to 3 members", "Shared notebooks", "Instant search"],
  },
  {
    id: "team",
    name: "Team",
    price: "$8",
    per: "per member per month",
    features: ["Unlimited members", "Roles and permissions", "Priority support"],
  },
] as const;
