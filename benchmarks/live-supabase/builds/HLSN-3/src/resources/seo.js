import { baseURL, schema } from "./once-ui.config";

// SEO defaults. Every page has a title and description; the shared image is the Open Graph card.
const name = schema.name;
const image = "/images/og/home.png";

const page = (path, title, description, options = {}) => {
  const url = `${baseURL}${path}`;
  return {
    path,
    title,
    description,
    image,
    robots: options.robots ?? "index,follow",
    canonical: url,
    alternates: [{ href: url, hrefLang: "en" }],
  };
};

const landing = {
  home: page("/", `${name}: ${schema.tagline.replace(/\.$/, "")}`, schema.description),
  blog: page("/blog", `Blog - ${name}`, `News and guides from the ${name} team.`),
  privacy: page("/privacy", `Privacy Policy - ${name}`, `How ${name} handles your information.`),
  terms: page("/terms", `Terms of Use - ${name}`, `The terms for using ${name}.`),
};

const auth = {
  signIn: page("/auth", `Sign in - ${name}`, `Sign in or create an account for ${name}.`, {
    robots: "noindex,nofollow",
  }),
  updatePassword: page("/auth/update-password", `Set a new password - ${name}`, `Choose a new password for your ${name} account.`, {
    robots: "noindex,nofollow",
  }),
};

const product = {
  dashboard: page("/app", `Dashboard - ${name}`, `Your organizations in ${name}.`, { robots: "noindex,nofollow" }),
  profile: page("/profile", `Profile - ${name}`, `Your ${name} profile.`, { robots: "noindex,nofollow" }),
  invite: page("/invite", `Join an organization - ${name}`, `Accept an invitation to an organization in ${name}.`, {
    robots: "noindex,nofollow",
  }),
};

export { landing, auth, product, image as defaultImage };
