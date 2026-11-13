import { landing } from "./seo";

// Lumen: public address used for SEO in meta tags and schema
const baseURL = "https://lumen.example";

// Fonts are system stacks, set once as CSS variables in src/resources/custom.css
// (headings in ui-monospace, body in ui-sans-serif). Nothing is loaded from the network.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

// The app's languages, as BCP 47 tags. The first is the default.
const i18n = {
  locales: ["en"],
};

// Lumen's theme: dark by default, warm stone neutrals, brand #E8590C (the
// exact scale lives in custom.css), 4px corners ("conservative" borders).
const style = {
  theme: "dark", // dark | light | system
  neutral: "sand", // sand | gray | slate (refined to warm stone in custom.css)
  brand: "orange", // refined to #E8590C in custom.css
  accent: "orange",
  solid: "color", // primary buttons are filled with the brand colour
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "100", // balanced density
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
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
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
