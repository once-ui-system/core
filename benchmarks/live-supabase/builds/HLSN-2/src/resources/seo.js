import { baseURL, schema } from "./once-ui.config";

// Every title below that names the product reads it from here, and every URL
// is built from baseURL in once-ui.config.js.
const name = schema.name;
const image = "/images/og/home.jpg";

const page = (path, title, description, robots = "index,follow") => ({
  path,
  title,
  description,
  image,
  robots,
  canonical: `${baseURL}${path === "/" ? "" : path}`,
  alternates: [{ href: baseURL, hrefLang: "en" }],
});

const landing = {
  home: page("/", `${name}: ${schema.description.replace(/\.$/, "")}`, schema.description),
  blog: page("/blog", `Blog - ${name}`, `News and guides from the ${name} team.`),
  privacy: page("/privacy", `Privacy Policy - ${name}`, `How ${name} handles your data.`),
  terms: page("/terms", `Terms - ${name}`, `The terms for using ${name}.`),
};

const product = {
  dashboard: page("/app", `Dashboard - ${name}`, `Your ${name} workspace.`, "noindex,nofollow"),
  members: page("/app/members", `Members - ${name}`, `Who is in this ${name} organization.`, "noindex,nofollow"),
  settings: page("/app/settings", `Settings - ${name}`, `Organization settings for ${name}.`, "noindex,nofollow"),
  profile: page("/profile", `Profile - ${name}`, `Your ${name} account.`, "noindex,nofollow"),
};

const auth = {
  auth: page("/auth", `Log in - ${name}`, `Sign up or log in to your ${name} account.`),
};

export { landing, product, auth };
