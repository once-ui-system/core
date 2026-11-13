import { landing } from "./seo";

const baseURL = "https://lumen.example";

// Lumen uses the system font stacks (no network fonts). The stacks themselves
// are set once as the --font-* tokens in src/resources/custom.css.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen's theme, read by ThemeInit and ThemeProvider (see src/resources/theme.ts).
const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light", // the theme a visitor starts on
  neutral: "slate", // cool slate grey
  brand: "custom", // exact brand colour from brandSeed / brandScale
  brandSeed: "#0F766E",
  brandScale: { 600: "#0F766E" },
  accent: "cyan",
  solid: "color", // primary buttons and the current nav item use the brand colour
  solidStyle: "flat",
  border: "sharp", // the squarest corner radius
  surface: "filled",
  transition: "micro",
  scaling: "95", // compact density
  pageBackground: { light: "#F1F5F9", dark: "#0B1220" },
  surfaceBackground: { light: "#FFFFFF", dark: "#111A2B" },
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24,
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
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
