import { baseURL, schema } from "./once-ui.config";

// One entry per surface. Pages pass their entry to the Next metadata API
// (title, description, canonical, Open Graph image). Private surfaces are
// noindex so search engines skip sign-in and the signed-in app.
const name = schema.name;
const image = "/images/og/home.jpg";

function page(path, title, description, robots = "index,follow") {
  return {
    path,
    title,
    description,
    image,
    robots,
    canonical: `${baseURL}${path}`,
  };
}

const landing = {
  home: page("/", `${name}: ${schema.tagline}`, schema.description),
  blog: page("/blog", `Blog - ${name}`, `Posts from the ${name} team.`),
  privacy: page("/privacy", `Privacy Policy - ${name}`, `How ${name} handles your personal information.`),
  terms: page("/terms", `Terms of Use - ${name}`, `The terms for using ${name}.`),
};

const auth = {
  signIn: page("/auth", `Sign in - ${name}`, `Sign in, create an account or reset your password for ${name}.`, "noindex,nofollow"),
  updatePassword: page("/auth/update-password", `Set a new password - ${name}`, `Choose a new password for your ${name} account.`, "noindex,nofollow"),
  invite: page("/invite", `Join an organization - ${name}`, `Accept an invitation to an organization on ${name}.`, "noindex,nofollow"),
};

const product = {
  dashboard: page("/app", `Dashboard - ${name}`, `Your organization's dashboard in ${name}.`, "noindex,nofollow"),
  members: page("/app/members", `Members - ${name}`, `Members and invitations in ${name}.`, "noindex,nofollow"),
  settings: page("/app/settings", `Settings - ${name}`, `Organization settings and plan in ${name}.`, "noindex,nofollow"),
  profile: page("/profile", `Profile - ${name}`, `Your ${name} account.`, "noindex,nofollow"),
};

export { landing, auth, product };
