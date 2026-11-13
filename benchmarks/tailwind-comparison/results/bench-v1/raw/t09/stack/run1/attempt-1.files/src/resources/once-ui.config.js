import { defineConfig } from "@once-ui-system/core/config";
import { landing } from "./seo";

// The site's public origin, used for SEO tags and schema.
const baseURL = "https://lumen.example";

// Fonts are system fonts, so nothing is loaded. The family stacks live in
// custom.css as the --font-* variables the design system reads.
const fonts = {};

// The app's languages, as BCP 47 tags ("en", "hu", "de-AT"). The first is the
// default: it sets <html lang>, how prices are formatted and which entry of
// each labels file (src/content/<surface>/labels.ts) the UI shows.
const i18n = {
  locales: ["en"],
};

// Lumen brand ramp, built around #E8590C at step 600 (the solid colour that
// primary buttons, links and focus rings use), one ramp per theme.
const brandScale = {
  light: {
    100: "#fff4ec",
    200: "#ffe6d4",
    300: "#ffcfab",
    400: "#ffb078",
    500: "#f78a45",
    600: "#E8590C",
    700: "#c24a08",
    800: "#9b3b08",
    900: "#7a3009",
    1000: "#5a2408",
    1100: "#3d1807",
    1200: "#260f05",
    "600-15": "rgba(232, 89, 12, 0.15)",
    "600-30": "rgba(232, 89, 12, 0.3)",
    "600-50": "rgba(232, 89, 12, 0.5)",
  },
  dark: {
    100: "#260f05",
    200: "#3d1807",
    300: "#5a2408",
    400: "#7a3009",
    500: "#a63f08",
    600: "#E8590C",
    700: "#f27a38",
    800: "#f99a63",
    900: "#fdb88d",
    1000: "#ffd2b3",
    1100: "#ffe6d4",
    1200: "#fff4ec",
    "600-15": "rgba(232, 89, 12, 0.15)",
    "600-30": "rgba(232, 89, 12, 0.3)",
    "600-50": "rgba(232, 89, 12, 0.5)",
  },
};

// Warm stone grey: a neutral with a slight red-yellow cast, so surfaces and
// borders sit comfortably next to the orange brand colour.
const neutralScale = {
  light: {
    100: "#fafaf9",
    200: "#f5f5f4",
    300: "#e7e5e4",
    400: "#d6d3d1",
    500: "#a8a29e",
    600: "#78716c",
    700: "#57534e",
    800: "#44403c",
    900: "#292524",
    1000: "#1c1917",
    1100: "#0f0d0c",
    1200: "#0a0908",
    "600-15": "rgba(120, 113, 108, 0.15)",
    "600-30": "rgba(120, 113, 108, 0.3)",
    "600-50": "rgba(120, 113, 108, 0.5)",
  },
  dark: {
    100: "#0c0a09",
    200: "#1c1917",
    300: "#292524",
    400: "#44403c",
    500: "#57534e",
    600: "#78716c",
    700: "#a8a29e",
    800: "#d6d3d1",
    900: "#e7e5e4",
    1000: "#f5f5f4",
    1100: "#fafaf9",
    1200: "#fdfdfc",
    "600-15": "rgba(120, 113, 108, 0.15)",
    "600-30": "rgba(120, 113, 108, 0.3)",
    "600-50": "rgba(120, 113, 108, 0.5)",
  },
};

// `theme` stays "system" so the header toggle can switch the whole site
// ("dark" or "light" would lock it); `defaultTheme` is what a first visit sees.
const { style, dataStyle } = defineConfig({
  style: {
    theme: "system",
    defaultTheme: "dark",
    neutral: "custom",
    brand: "custom",
    accent: "custom",
    brandScale,
    accentScale: brandScale,
    neutralScale,
    solid: "color",
    solidStyle: "flat",
    border: "conservative",
    surface: "filled",
    transition: "all",
    scaling: "100",
  },
  dataStyle: {
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
  },
});

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "hello@lumen.example",
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
