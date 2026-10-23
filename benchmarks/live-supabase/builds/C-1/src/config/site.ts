// Single source of truth for brand, theme and SEO defaults.
export const siteConfig = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
  url: "https://acme-notes.example",
  theme: {
    brand: "emerald",
    accent: "cyan",
    neutral: "gray",
    defaultMode: "dark" as "dark" | "light",
  },
  seo: {
    titleTemplate: "%s | Acme Notes",
    keywords: ["notes", "team notes", "shared notebooks", "search"],
    ogImageAlt: "Acme Notes",
  },
  features: [
    {
      title: "Shared notebooks",
      description: "Keep every team's notes in notebooks everyone can open and edit together.",
    },
    {
      title: "Instant search",
      description: "Find any note, by any author, the moment you start typing.",
    },
    {
      title: "Roles and permissions",
      description: "Owners, admins and members decide who can see and change what.",
    },
  ],
  plans: [
    { name: "Free", price: "$0", detail: "Up to 3 members", cta: "Get started" },
    { name: "Team", price: "$8", detail: "per member per month", cta: "Get started" },
  ],
} as const;

export function pageTitle(title: string) {
  return siteConfig.seo.titleTemplate.replace("%s", title);
}
