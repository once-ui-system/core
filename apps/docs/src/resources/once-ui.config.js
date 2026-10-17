// @ts-check
import { defineConfig } from "@once-ui-system/core/config";

// Typed by defineConfig, so `style` and `dataStyle` go to ThemeInit and the
// providers as written: no casts, no renamed keys.
const { baseURL, style, dataStyle } = defineConfig({
  baseURL: "https://docs.once-ui.com",
  style: {
    theme: "system", // dark | light
    neutral: "gray", // sand | gray | slate | rose | mint | dusk
    brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
    accent: "orange", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
    solid: "contrast", // color | contrast
    solidStyle: "flat", // flat | plastic
    border: "conservative", // rounded | playful | conservative | sharp
    surface: "filled", // filled | translucent
    transition: "all", // all | micro | macro
    scaling: "100",
  },
  dataStyle: {
    variant: "gradient", // flat | gradient | outline
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
  },
});

const layout = /** @type {const} */ ({
  // A number is px; a string is a CSS length (rem follows the root font size).
  header: {
    width: "200rem", // max-width of the content inside the header
  },
  body: {
    width: "200rem", // max-width of the body
  },
  sidebar: {
    width: "17rem", // width of the sidebar
    collapsible: true, // accordion or static render
  },
  content: {
    width: "44rem", // width of the main content block
  },
  sideNav: {
    width: "17rem", // width of the sideNav on document pages
  },
  footer: {
    width: "44rem", // width of the content inside the footer
  },
});

/**
 * Links are automatically displayed. Register new icons in icons.ts.
 * @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]}
 */
const social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/once-ui-system",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/company/",
  },
  {
    name: "Discord",
    icon: "discord",
    link: "https://discord.com/invite/design-engineers",
  },
];

const schema = {
  logo: "",
  type: "Organization",
  name: "Once UI",
  description:
    "Once UI is the open-source design system for the AI-native era. We equip design engineers, founders and creatives with pre-styled, out-of-the-box solutions to ship amazing products consistently.",
  email: "support@once-ui.com",
  locale: "en_US",
};

const meta = {
  home: {
    title: "The open-source design system for the AI-native web",
    description: schema.description,
    path: "/",
    image: "/api/og/generate?title=The open-source design system for the AI-native web",
  },
};

export { baseURL, dataStyle, layout, meta, schema, social, style };
