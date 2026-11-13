import { landing } from "./seo";

// Used for SEO in meta tags and schema.
const baseURL = "https://lumen.example";

// Lumen sets its type in system fonts: nothing is fetched from the network.
// Once UI reads these four CSS variables; the root layout sets them on <html>.
const fonts = {
  heading: {
    variable: "--font-heading",
    stack: 'Georgia, "Times New Roman", serif',
  },
  body: {
    variable: "--font-body",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
  label: {
    variable: "--font-label",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
  code: {
    variable: "--font-code",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
};

// The app's languages, as BCP 47 tags. The first is the default.
const i18n = {
  locales: ["en"],
};

// Lumen's brand ramp. #0F766E sits at step 500/600 in the light theme (primary
// buttons, the current nav item, links, focus rings) and is lifted for contrast
// in the dark theme.
const brandScale = {
  light: {
    100: "#042F2C",
    200: "#064E49",
    300: "#0B5F58",
    400: "#0D6B63",
    500: "#0F766E",
    600: "#0F766E",
    700: "#2FA298",
    800: "#8FD3CB",
    900: "#BDE8E3",
    1000: "#D6F2EF",
    1100: "#E9F8F6",
    1200: "#F3FBFA",
  },
  dark: {
    100: "#042F2C",
    200: "#064E49",
    300: "#0B5F58",
    400: "#0D6B63",
    500: "#0F766E",
    600: "#2DA399",
    700: "#4DB8AE",
    800: "#8FD3CB",
    900: "#BDE8E3",
    1000: "#D6F2EF",
    1100: "#E9F8F6",
    1200: "#F3FBFA",
  },
};

// Cool slate neutrals.
const neutralScale = {
  100: "#0F172A",
  200: "#1E293B",
  300: "#334155",
  400: "#475569",
  500: "#64748B",
  600: "#94A3B8",
  700: "#CBD5E1",
  800: "#E2E8F0",
  900: "#F1F5F9",
  1000: "#F8FAFC",
  1100: "#FBFCFD",
  1200: "#FFFFFF",
};

// Default customization applied to the HTML in the root layout.
const style = {
  theme: "system", // keep "system" so the theme switch works; defaultTheme picks the first visit
  defaultTheme: "light", // dark | light | system
  neutral: "slate", // sand | gray | slate
  brand: "emerald", // seed family; brandScale gives the exact colours
  accent: "emerald",
  brandScale,
  accentScale: brandScale,
  neutralScale,
  solid: "color", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "90", // 90 | 95 | 100 | 105 | 110: compact density
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 20, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// Schema data
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
