const pricing = {
  title: "Pricing",
  description: <>Start for free. Upgrade for epic features.</>,
}

const plans = {
    free: {
      name: "Free",
      href: "/auth?state=signup",
      color: "neutral",
      gradient: false,
      price: {
        original: "0",
        discounted: "0",
      },
      features: [
        "Comprehensive variables",
        "Fluid component system"
      ],
    },
    pro: {
      name: "Pro",
      href: "/auth?state=signup",
      color: "brand",
      gradient: false,
      price: {
        original: "120",
        discounted: "80",
      },
      features: [
        "Comprehensive variables",
        "Fluid component system",
        "Landing page examples",
        "Marketing resources",
        "Data viz module",
        "Social module",
        "Regular updates",
      ],
    }
  };

export { pricing, plans };