import { landing } from "./seo";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL = "https://stack.once-ui.com";

// Fonts are system stacks, set once as CSS variables in src/resources/custom.css
// (headings: ui-rounded / SF Pro Rounded, body: ui-sans-serif). Nothing loads from the network.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen's brand: #DB2777 as the 600 step of the brand scale, warm sand neutrals,
// 16px corners (see custom.css), light by default, airy density.
const brandScale = {
  100: "#500724",
  200: "#6b0f35",
  300: "#831843",
  400: "#9d174d",
  500: "#be185d",
  600: "#db2777",
  700: "#ec4899",
  800: "#f472b6",
  900: "#f9a8d4",
  1000: "#fbcfe8",
  1100: "#fce7f3",
  1200: "#fdf2f8",
  "600-15": "rgba(219,39,119,0.15)",
  "600-30": "rgba(219,39,119,0.3)",
  "600-50": "rgba(219,39,119,0.5)",
};

const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light", // what a first visit sees
  neutral: "sand", // sand | gray | slate
  brand: "custom", // exact colours come from brandScale
  accent: "orange",
  solid: "color", // solid buttons use the brand colour
  solidStyle: "flat",
  border: "rounded",
  surface: "filled",
  transition: "all",
  scaling: "105", // airy: a little larger everywhere
  brandScale,
};

const dataStyle = {
  variant: "gradient",
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
  email: "hello@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
