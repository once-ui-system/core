import { baseURL, brand, seoDefaults } from "./once-ui.config";

// One entry per page: title, description, path, image. Defaults come from
// once-ui.config.js, so renaming the product is a one-file change.
const page = (path, title, description = seoDefaults.description) => ({
  path,
  title,
  description,
  image: seoDefaults.image,
  robots: seoDefaults.robots,
  canonical: `${baseURL}${path === "/" ? "" : path}`,
  alternates: [{ href: `${baseURL}${path === "/" ? "" : path}`, hrefLang: "en" }],
});

const landing = {
  home: page("/", `${brand.name}: ${brand.tagline}`),
  blog: page("/blog", `Blog | ${brand.name}`, `News and updates from ${brand.name}.`),
  privacy: page("/privacy", `Privacy | ${brand.name}`, `How ${brand.name} handles your data.`),
  terms: page("/terms", `Terms | ${brand.name}`, `The terms for using ${brand.name}.`),
};

const product = {
  dashboard: page("/app", `Dashboard | ${brand.name}`, `Your organization's overview in ${brand.name}.`),
  members: page("/app/members", `Members | ${brand.name}`, `Who is in your organization, and invitations.`),
  settings: page("/app/settings", `Settings | ${brand.name}`, `Organization settings and plan.`),
  billing: page("/app/billing", `Billing | ${brand.name}`, `Your organization's plan.`),
  profile: page("/profile", `Profile | ${brand.name}`, `Your ${brand.name} profile.`),
};

const auth = {
  auth: page("/auth", `Sign in | ${brand.name}`, `Sign in or create your ${brand.name} account.`),
};

export { landing, product, auth };
