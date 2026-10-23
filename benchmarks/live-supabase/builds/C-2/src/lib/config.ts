// Single source of truth for brand, theme and SEO defaults.
export const siteConfig = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  url: "https://acme-notes.example",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
  theme: {
    brand: "emerald",
    accent: "cyan",
    neutral: "gray",
    mode: "dark" as "dark" | "light",
  },
  seo: {
    titleTemplate: "%s | Acme Notes",
    defaultTitle: "Acme Notes: Notes your whole team can find.",
    locale: "en_US",
    ogImage: "/opengraph-image",
  },
  plans: {
    free: { name: "Free", price: "$0", detail: "Up to 3 members" },
    team: { name: "Team", price: "$8", detail: "per member per month" },
  },
};

export type SiteConfig = typeof siteConfig;
