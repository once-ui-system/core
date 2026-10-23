export const features = [
  {
    icon: "book" as const,
    title: "Shared notebooks",
    description: "Keep every team's notes in notebooks everyone can open, edit and build on together.",
  },
  {
    icon: "search" as const,
    title: "Instant search",
    description: "Find any note in a moment, across every notebook you have access to.",
  },
  {
    icon: "people" as const,
    title: "Roles and permissions",
    description: "Owners, admins and members: decide who can read, write and manage each organization.",
  },
];

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    detail: "Up to 3 members",
    features: ["Shared notebooks", "Instant search", "Up to 3 members"],
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    detail: "For growing teams",
    features: ["Everything in Free", "Unlimited members", "Roles and permissions"],
  },
];
