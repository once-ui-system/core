// Brand, theme and SEO defaults for Acme Notes. Pages and the root layout read from here.

export const site = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions for every member.",
  url: "https://acme-notes.example",
  locale: "en_US",
  theme: {
    // Tailwind palette names are documented here; the values below are what the layout applies.
    brand: "emerald",
    brandColor: "oklch(69.6% 0.17 162.48)", // emerald-500
    accent: "cyan",
    accentColor: "oklch(78.9% 0.154 211.53)", // cyan-400
    neutral: "gray",
    mode: "dark" as "dark" | "light",
  },
  seo: {
    titleDefault: "Acme Notes: Notes your whole team can find.",
    titleTemplate: "%s | Acme Notes",
    keywords: ["team notes", "shared notebooks", "note search", "team workspace"],
    ogType: "website",
  },
  pricing: {
    free: { price: 0, memberLimit: 3 },
    team: { pricePerMemberPerMonth: 8 },
  },
} as const;

export type Site = typeof site;
