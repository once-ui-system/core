import { baseURL, brand, seoDefaults } from "./once-ui.config";

/** One page's metadata, built from the brand and SEO defaults in once-ui.config.js. */
function page(path, title, description, extra = {}) {
  const url = path === "/" ? baseURL : `${baseURL}${path}`;
  return {
    path,
    title,
    description,
    image: seoDefaults.image,
    robots: seoDefaults.robots,
    canonical: url,
    alternates: [{ href: url, hrefLang: seoDefaults.locale }],
    ...extra,
  };
}

const landing = {
  home: page("/", `${brand.name}: ${brand.tagline}`, brand.description),
  blog: page("/blog", `Blog - ${brand.name}`, `News and updates from ${brand.name}.`),
  terms: page("/terms", `Terms - ${brand.name}`, `The terms of using ${brand.name}.`),
  privacy: page("/privacy", `Privacy - ${brand.name}`, `How ${brand.name} handles your data.`),
};

const product = {
  dashboard: page("/app", `Dashboard - ${brand.name}`, `Your organization at a glance.`, {
    robots: "noindex,nofollow",
  }),
  members: page("/app/members", `Members - ${brand.name}`, `People in your organization, and invitations.`, {
    robots: "noindex,nofollow",
  }),
  settings: page("/app/settings", `Settings - ${brand.name}`, `Organization settings and plan.`, {
    robots: "noindex,nofollow",
  }),
};

const auth = {
  auth: page("/auth", `Sign in - ${brand.name}`, `Sign in or create your ${brand.name} account.`),
};

export { landing, product, auth };
