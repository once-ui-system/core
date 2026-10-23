// Single source for brand, theme and SEO defaults. Pages read from here.
export const siteConfig = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  url: "https://acme-notes.example",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
  theme: {
    primary: "emerald",
    accent: "cyan",
    neutral: "gray",
    defaultMode: "dark" as "dark" | "light",
  },
  seo: {
    titleTemplate: "%s | Acme Notes",
    locale: "en_US",
    ogImage: "/og.png",
  },
  plans: [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "",
      blurb: "Up to 3 members",
      features: ["Up to 3 members", "Shared notebooks", "Instant search"],
    },
    {
      id: "team",
      name: "Team",
      price: "$8",
      period: "per member per month",
      blurb: "For growing teams",
      features: ["Unlimited members", "Roles and permissions", "Priority support"],
    },
  ],
} as const;
