import type { IconName } from "@/resources/icons";

// All landing-page copy. The sections in src/app/(landing)/components read
// from here; the product name itself comes from schema.name in
// src/resources/once-ui.config.js.

const hero = {
  title: "Notes your whole team can find.",
  description:
    "Acme Notes keeps your team's notebooks in one place, with search that answers before you finish typing.",
  primary: { label: "Get started", href: "/auth" },
};

const features = {
  label: "Features",
  title: "Everything your team needs",
  description: "Write together, find anything, and stay in control of who sees what.",
  items: [
    { icon: "people", title: "Shared notebooks", description: "Keep notes in notebooks your whole team can read and add to." },
    { icon: "search", title: "Instant search", description: "Find any note in a moment, across every notebook you can access." },
    { icon: "quality", title: "Roles and permissions", description: "Owners, admins and members: decide who can manage the workspace." },
  ] as { icon: IconName; title: string; description: string }[],
};

const pricing = {
  label: "Pricing",
  title: "Simple pricing",
  description: "Start for free. Upgrade when your team grows.",
  plans: [
    {
      name: "Free",
      price: "$0",
      unit: "",
      highlight: false,
      features: ["Up to 3 members", "Shared notebooks", "Instant search"],
    },
    {
      name: "Team",
      price: "$8",
      unit: "per member per month",
      highlight: true,
      features: ["Unlimited members", "Everything in Free", "Roles and permissions"],
    },
  ],
};

export const landingCopy = { hero, features, pricing };
