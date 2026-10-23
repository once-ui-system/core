import { baseURL, brand, seoDefaults } from "./once-ui.config";

/** One SEO object for a page: defaults from the config, then the page's own title, description and path. */
const page = (path, title, description = seoDefaults.description, image = seoDefaults.image) => ({
  path,
  title: title === brand.name ? title : `${title}${seoDefaults.titleSuffix}`,
  description,
  image,
  robots: seoDefaults.robots,
  canonical: `${baseURL}${path === "/" ? "" : path}`,
  alternates: [{ href: `${baseURL}${path === "/" ? "" : path}`, hrefLang: "en" }],
});

const landing = {
  home: page("/", brand.name, `${brand.tagline} ${brand.description}`),
  blog: page("/blog", "Blog", "News and updates from the Acme Notes team."),
  terms: page("/terms", "Terms", "The terms for using Acme Notes."),
  privacy: page("/privacy", "Privacy", "How Acme Notes handles your information."),
};

const product = {
  dashboard: page("/app", "Dashboard", "Your organization at a glance."),
  members: page("/app/members", "Members", "Who is in your organization, and invitations."),
  settings: page("/app/settings", "Settings", "Rename your organization and manage its plan."),
  profile: page("/profile", "Profile", "Your Acme Notes profile."),
};

const auth = {
  auth: page("/auth", "Sign in", "Sign in to Acme Notes, or create an account."),
};

export { landing, product, auth };
