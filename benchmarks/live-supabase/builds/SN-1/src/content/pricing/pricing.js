// Prices are per member per month; a null price is free.
const plans = {
  free: {
    name: "Free",
    href: "/auth",
    color: "neutral",
    price: "0",
    period: "",
    features: ["Up to 3 members", "Shared notebooks", "Instant search"],
    cta: "Start free",
  },
  team: {
    name: "Team",
    href: "/auth",
    color: "brand",
    price: "8",
    period: "per member per month",
    features: ["Unlimited members", "Everything in Free", "Roles and permissions"],
    cta: "Get started",
  },
};

export { plans };
