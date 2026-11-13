const origin = "https://lumen.example";

const base = {
  image: "/images/og/home.jpg",
  alternates: [{ href: origin, hrefLang: "en" }],
};

const landing = {
  home: {
    ...base,
    path: "/",
    title: "Lumen: product analytics and issue tracking for small teams",
    description:
      "Product analytics and issue tracking that small teams actually read. Dashboards, a built-in tracker and EU-hosted data.",
    robots: "index,follow",
    canonical: origin,
  },
  pricing: {
    ...base,
    path: "/pricing",
    title: "Pricing - Lumen",
    description:
      "Simple pricing for Lumen. Start free, move to Team at $12 per seat, and get two months free on yearly billing.",
    robots: "index,follow",
    canonical: `${origin}/pricing`,
  },
};

const product = {
  dashboard: {
    ...base,
    path: "/app",
    title: "Dashboard - Lumen",
    description: "Your Lumen dashboard.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app`,
  },
  analytics: {
    ...base,
    path: "/app/analytics",
    title: "Analytics - Lumen",
    description: "Analytics in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/analytics`,
  },
  users: {
    ...base,
    path: "/app/users",
    title: "Users - Lumen",
    description: "Users in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/users`,
  },
  settings: {
    ...base,
    path: "/app/settings",
    title: "Settings - Lumen",
    description: "Settings in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/settings`,
  },
};

const auth = {
  auth: {
    ...base,
    path: "/auth",
    title: "Log in - Lumen",
    description: "Sign up or log in to your Lumen account.",
    robots: "index,follow",
    canonical: `${origin}/auth`,
  },
};

const sameAs = {};

export { landing, product, auth, sameAs };
