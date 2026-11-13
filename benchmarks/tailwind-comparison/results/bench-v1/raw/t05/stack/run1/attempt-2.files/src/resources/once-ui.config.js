import { landing } from "./seo";

// Used for SEO in meta tags and schema.
const baseURL = "http://localhost:3000";

// Fonts: nothing is loaded from the network. Each entry exposes a
// `variable` class name (defined in custom.css) that sets the CSS variable
// the Once UI tokens read, pointing at a system font stack.
const heading = { variable: "lumen-font-heading" };
const body = { variable: "lumen-font-body" };
const label = { variable: "lumen-font-label" };
const code = { variable: "lumen-font-code" };

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// The app's languages, as BCP 47 tags ("en", "hu", "de-AT"). The first is the
// default: it sets <html lang>, how prices are formatted and which entry of
// each labels file (src/content/<surface>/labels.ts) the UI shows.
const i18n = {
  locales: ["en"],
};

// default customization applied to the HTML in the main layout.tsx
const style = {
  theme: "system", // dark | light - not needed when using ThemeProvider
  neutral: "gray", // sand | gray | slate
  brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "orange", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [
  {
    name: "Email",
    icon: "email",
    link: `mailto:${schema.email}`,
  },
];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
