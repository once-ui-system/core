import { baseURL, schema } from "./once-ui.config";

// Every title below that names the product reads it from here, and every URL
// is built from baseURL in once-ui.config.js.
const name = schema.name;

const page = (path, title, description) => ({
  path,
  title,
  description,
  image: "/images/og/home.jpg",
  robots: "index,follow",
  canonical: `${baseURL}${path === "/" ? "" : path}`,
  alternates: [{ href: `${baseURL}${path === "/" ? "" : path}`, hrefLang: "en" }],
});

const landing = {
  home: page("/", `${name}: ${schema.tagline.replace(/\.$/, "")}`, schema.description),
  blog: page("/blog", `Blog - ${name}`, `News and product updates from ${name}.`),
  terms: page("/terms", `Terms - ${name}`, `The terms of using ${name}.`),
  privacy: page("/privacy", `Privacy - ${name}`, `How ${name} handles your data.`),
};

const product = {
  dashboard: page("/app", `Dashboard - ${name}`, `Your organization's dashboard in ${name}.`),
  members: page("/app/members", `Members - ${name}`, `The members of your organization in ${name}.`),
  settings: page("/app/settings", `Settings - ${name}`, `Organization settings in ${name}.`),
  profile: page("/profile", `Profile - ${name}`, `Your profile in ${name}.`),
};

const auth = {
  auth: page("/auth", `Sign in - ${name}`, `Sign up or sign in to your ${name} account.`),
};

export { landing, product, auth };
