const pricing = {
  title: "Pricing",
  description: <>Start for free. Upgrade when your team grows.</>,
}

// Prices are per year; `original` above `discounted` shows a crossed-out price.
const plans = {
  free: {
    name: "Free",
    href: "/auth?state=signup",
    color: "neutral",
    gradient: false,
    price: { original: "0", discounted: "0" },
    features: ["Up to 3 members", "Core features", "Community support"],
  },
  pro: {
    name: "Pro",
    href: "/auth?state=signup",
    color: "brand",
    gradient: false,
    price: { original: "120", discounted: "120" },
    features: ["Unlimited members", "Everything in Free", "Roles and permissions", "Priority support"],
  },
};

export { pricing, plans };
