// One place for the brand, the theme settings and the SEO defaults.
// Pages read from here; the colour tokens themselves live in src/app/globals.css.

export const site = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions for every organization.",
  url: "https://acme-notes.example",
  locale: "en",
  email: "hello@acme-notes.example",
  theme: {
    // Dark mode is the default; the layout adds the `dark` class to <html>.
    defaultMode: "dark" as "dark" | "light",
    primary: "emerald",
    accent: "cyan",
    neutral: "gray",
  },
  seo: {
    titleDefault: "Acme Notes: Notes your whole team can find.",
    titleTemplate: "%s | Acme Notes",
    keywords: ["team notes", "shared notebooks", "note search", "team workspace"],
  },
} as const;

export type Site = typeof site;
