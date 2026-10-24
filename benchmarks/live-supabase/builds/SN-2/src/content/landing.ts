import type { IconName } from "@/resources/icons";

// All landing-page copy. The sections in src/app/(landing)/components read
// from here; the product name and tagline come from schema in
// src/resources/once-ui.config.js.

const hero = {
  title: "Notes your whole team",
  titleMuted: "can find.",
  description:
    "Acme Notes keeps your team's notes in shared notebooks, searchable in an instant, with roles that decide who can see and change what.",
  primary: { label: "Get started", href: "/auth" },
  secondary: { label: "Read the blog", href: "/blog" },
};

const features = {
  label: "Features",
  title: "Everything your team needs to keep notes together",
  description: "Write once, share with the right people and find it again in seconds.",
  items: [
    { icon: "book", title: "Shared notebooks", description: "Keep notes in notebooks your whole team can read and add to." },
    { icon: "search", title: "Instant search", description: "Find any note as you type, across every notebook you can access." },
    { icon: "quality", title: "Roles and permissions", description: "Owners, admins and members: decide who can manage and who can contribute." },
  ] as { icon: IconName; title: string; description: string }[],
};

const sections = {
  pricing: {
    label: "Pricing",
    title: "Simple pricing",
    description: "Start for free. Upgrade when your team grows.",
  },
};

const cta = {
  title: "Ready to find your notes?",
  description: "Create an account and start your first notebook in minutes.",
  primary: { label: "Get started", href: "/auth" },
  secondary: { label: "Read the blog", href: "/blog" },
};

const blogIntro = {
  title: "Blog",
  description: "News and product updates from Acme Notes.",
};

export const landingCopy = { hero, features, sections, cta, blogIntro };

const plans = {
  free: {
    name: "Free",
    href: "/auth",
    highlight: false,
    price: "$0",
    unit: "",
    features: ["Up to 3 members", "Shared notebooks", "Instant search"],
  },
  team: {
    name: "Team",
    href: "/auth",
    highlight: true,
    price: "$8",
    unit: "per member per month",
    features: ["Unlimited members", "Everything in Free", "Roles and permissions"],
  },
};

export { plans };
