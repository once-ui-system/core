// Lumen's brand lives here: colours, radius-free style switches and fonts.
// The theme provider (src/components/Providers.tsx) and the pre-paint
// ThemeInit script (src/app/layout.tsx) both read this one object.

const baseURL = "https://lumen.example";

// System font stacks: nothing is loaded from the network. The stacks
// themselves are set once as the --font-* tokens in src/resources/custom.css.
const fonts = {
  heading: {
    variable: "--font-heading",
    style: { fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif' },
  },
  body: {
    variable: "--font-body",
    style: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  },
  label: {
    variable: "--font-label",
    style: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  },
  code: {
    variable: "--font-code",
    style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  },
};

const i18n = {
  locales: ["en"],
};

/** @type {import("@once-ui-system/core").OnceUIStyleConfig} */
const style = {
  theme: "system", // stays "system" so the visitor can switch
  defaultTheme: "light", // a first visit starts light
  neutral: "sand", // warm sand neutrals
  brand: "custom", // generated from brandSeed
  brandSeed: "#DB2777", // Lumen pink: primary buttons, current nav item, links, focus rings
  accent: "pink",
  solid: "color", // solid surfaces (primary buttons) use the brand colour
  solidStyle: "flat",
  border: "rounded", // radius is pinned to 16px in custom.css
  surface: "filled",
  transition: "all",
  scaling: "105", // airy: everything a little larger
};

const dataStyle = {
  variant: "gradient", // flat | gradient | outline
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
  description: "Lumen is a product-analytics and issue-tracking app for small software teams.",
  email: "hello@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
