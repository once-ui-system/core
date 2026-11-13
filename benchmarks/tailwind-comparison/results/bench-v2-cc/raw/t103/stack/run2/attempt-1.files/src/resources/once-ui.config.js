import { landing } from "./seo";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL = "https://lumen.example.com";

// Fonts are system stacks (nothing is loaded from the network). The families
// are set as tokens in custom.css: headings in ui-monospace, body in ui-sans-serif.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen brand ramp: #E8590C sits at step 600 in both themes.
const brandRamp = {
  dark: {
    100: "#2a1004",
    200: "#4a1c06",
    300: "#7a2e08",
    400: "#a8410a",
    500: "#cf500b",
    600: "#e8590c",
    700: "#f27a3a",
    800: "#f79b66",
    900: "#fbb892",
    1000: "#fdd0b8",
    1100: "#fee4d4",
    1200: "#fff1e8",
    "600-15": "rgba(232,89,12,0.15)",
    "600-30": "rgba(232,89,12,0.3)",
    "600-50": "rgba(232,89,12,0.5)",
  },
  light: {
    100: "#fff1e8",
    200: "#fee4d4",
    300: "#fdd0b8",
    400: "#fbb892",
    500: "#f79b66",
    600: "#e8590c",
    700: "#cf500b",
    800: "#a8410a",
    900: "#7a2e08",
    1000: "#4a1c06",
    1100: "#2a1004",
    1200: "#1a0a02",
    "600-15": "rgba(232,89,12,0.15)",
    "600-30": "rgba(232,89,12,0.3)",
    "600-50": "rgba(232,89,12,0.5)",
  },
};

// default customization applied to the HTML in the main layout.tsx
const style = {
  theme: "dark", // dark | light | system
  neutral: "sand", // warm stone grey
  brand: "custom",
  accent: "custom",
  brandScale: brandRamp,
  accentScale: brandRamp,
  solid: "color", // brand-coloured primary buttons
  solidStyle: "flat",
  border: "conservative",
  surface: "filled",
  transition: "micro",
  scaling: "100",
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
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

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example.com",
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
