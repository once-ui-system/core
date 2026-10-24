import type { IconName } from "@/resources/icons";

// All landing-page copy. The product name comes from schema.name in
// src/resources/once-ui.config.js.

const hero = {
  title: "Acme Notes",
  tagline: "Notes your whole team can find.",
  primary: { label: "Get started", href: "/auth" },
};

const features = {
  title: "Everything your team writes, in one place",
  items: [
    {
      icon: "book" as IconName,
      title: "Shared notebooks",
      description: "Keep team notes in notebooks that everyone in the organization can open.",
    },
    {
      icon: "search" as IconName,
      title: "Instant search",
      description: "Find a note by a word from its title or its body, as you type.",
    },
    {
      icon: "people" as IconName,
      title: "Roles and permissions",
      description: "Owners, admins and members see and change exactly what their role allows.",
    },
  ],
};

const pricing = {
  title: "Simple pricing",
  description: "Start free with up to three members. Upgrade when your team grows.",
  plans: [
    {
      name: "Free",
      price: "$0",
      period: "",
      features: ["Up to 3 members", "Shared notebooks", "Instant search"],
      cta: { label: "Get started", href: "/auth" },
      highlighted: false,
    },
    {
      name: "Team",
      price: "$8",
      period: "per member per month",
      features: ["Unlimited members", "Everything in Free", "Roles and permissions"],
      cta: { label: "Get started", href: "/auth" },
      highlighted: true,
    },
  ],
};

export const landingCopy = { hero, features, pricing };
