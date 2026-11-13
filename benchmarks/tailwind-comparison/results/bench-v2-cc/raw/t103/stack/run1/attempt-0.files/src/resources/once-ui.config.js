import { landing } from "./seo";

const baseURL = "https://lumen.example";

// Lumen's type system. System font stacks only, so nothing is loaded from the
// network. The stacks are defined on the `.lumen-fonts` class in custom.css;
// the root layout puts that class on <html> through `fonts.*.variable`.
const heading = { variable: "lumen-fonts" };
const body = { variable: "lumen-fonts" };
const label = { variable: "lumen-fonts" };
const code = { variable: "lumen-fonts" };

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

const i18n = {
  locales: ["en"],
};

// Lumen: dark by default, warm stone neutrals, brand #E8590C (the exact
// ramp lives in custom.css as --scheme-brand-*), 4px corners.
const style = {
  theme: "dark", // dark | light - not needed when using ThemeProvider
  neutral: "sand", // sand | gray | slate
  brand: "orange",
  accent: "orange",
  solid: "color", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
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
    line: false
  },
};

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
