import { schema } from "@/resources";

export const hero = {
  title: schema.name,
  tagline: schema.tagline,
  cta: { label: "Get started", href: "/auth" },
};

export const features = [
  {
    title: "Shared notebooks",
    description: "Keep notes in notebooks your whole team can open, so everyone works from the same pages.",
  },
  {
    title: "Instant search",
    description: "Find any note as you type, across every notebook you are allowed to see.",
  },
  {
    title: "Roles and permissions",
    description: "Owners, admins and members each see and change exactly what their role allows.",
  },
];

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For small teams getting started.",
    points: ["Up to 3 members", "Shared notebooks", "Instant search"],
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    description: "For teams that keep growing.",
    points: ["Billed per member", "Shared notebooks", "Instant search", "Roles and permissions"],
  },
];
