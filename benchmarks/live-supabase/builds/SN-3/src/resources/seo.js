import { baseURL, schema } from "./once-ui.config";

// Page titles and descriptions, built from the one config file.
const name = schema.name;
const image = "/images/og/home.jpg";

const page = (path, title, description) => ({
  path,
  title,
  description,
  image,
  robots: "index,follow",
  canonical: `${baseURL}${path === "/" ? "" : path}`,
  alternates: [{ href: `${baseURL}${path === "/" ? "" : path}`, hrefLang: "en" }],
});

const landing = {
  home: page("/", `${name}: ${schema.tagline}`, schema.description),
  blog: page("/blog", `Blog - ${name}`, `News and updates from the ${name} team.`),
  terms: page("/terms", `Terms - ${name}`, `The terms of using ${name}.`),
  privacy: page("/privacy", `Privacy - ${name}`, `How ${name} handles your information.`),
};

const product = {
  dashboard: page("/app", `Dashboard - ${name}`, `Your organization's dashboard in ${name}.`),
  members: page("/app", `Members - ${name}`, `The people in your organization in ${name}.`),
  settings: page("/app", `Settings - ${name}`, `Organization settings in ${name}.`),
};

const auth = {
  auth: page("/auth", `Sign in - ${name}`, `Sign in or create your ${name} account.`),
};

export { landing, product, auth };
