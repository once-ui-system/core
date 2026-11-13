import { defineConfig } from "@once-ui-system/core/config";
import { landing } from "./seo";

const baseURL = "https://lumen.example.com";

// Lumen's identity lives here and in custom.css (corner radius, font stacks):
// the providers and ThemeInit read this one object, so every screen follows it.
const config = defineConfig({
  style: {
    theme: "system", // stays "system" so the theme switch works
    defaultTheme: "light",
    neutral: "sand",
    brand: "custom",
    accent: "orange",
    brandSeed: "#DB2777",
    solid: "color",
    solidStyle: "flat",
    border: "rounded",
    surface: "filled",
    transition: "all",
    scaling: "105",
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

const style = config.style;
const dataStyle = config.dataStyle;

const i18n = {
  locales: ["en"],
};

const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "hello@lumen.example.com",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, i18n, style, schema, social, dataStyle };
