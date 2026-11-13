// Lumen: brand, theme and fonts live here and nowhere else.
// Fonts are system stacks (nothing is loaded from the network). Each entry only
// carries the class name that custom.css uses to set the font variables.
const lumenFonts = { variable: "lumen-fonts" };

const baseURL = "https://lumen.example";

const fonts = {
  heading: lumenFonts,
  body: lumenFonts,
  label: lumenFonts,
  code: lumenFonts,
};

const i18n = {
  locales: ["en"],
};

// Brand #0F766E, cool slate neutrals, light by default (the visitor can still
// switch), 2px corners (custom.css), compact density (scaling 90).
const style = {
  theme: "system", // stays "system" so the theme switch keeps working
  defaultTheme: "light",
  neutral: "slate",
  brand: "custom",
  brandSeed: "#0F766E",
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color",
  solidStyle: "flat",
  border: "conservative",
  surface: "filled",
  transition: "micro",
  scaling: "90",
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
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
  email: "hello@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
