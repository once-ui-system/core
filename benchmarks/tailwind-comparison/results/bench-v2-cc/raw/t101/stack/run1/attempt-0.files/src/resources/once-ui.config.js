import { landing } from "./seo";

const baseURL = "https://lumen.example.com";

// Fonts are plain system stacks (set as CSS variables in custom.css): nothing is
// loaded from the network. The shape stays so the root layout can keep reading it.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

/** @type {import("@once-ui-system/core").OnceUIStyleConfig} */
const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light",
  neutral: "slate",
  brand: "custom",
  brandSeed: "#0F766E",
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // 2px corners, see custom.css
  surface: "filled",
  transition: "micro",
  scaling: "90", // compact density
};

const dataStyle = {
  variant: "flat",
  mode: "categorical",
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
  email: "support@lumen.example.com",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
