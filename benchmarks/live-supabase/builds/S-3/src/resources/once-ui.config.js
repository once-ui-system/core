// The one place for the product's identity: name, tagline, canonical URL, theme
// and SEO defaults. Pages read from here (directly or through ./seo.js).
const baseURL = "https://acme-notes.example";

const brand = {
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
};

// Defaults every page falls back to (see seo.js for the per-page values).
const seoDefaults = {
  titleSuffix: ` | ${brand.name}`,
  description: brand.description,
  image: "/api/og",
  robots: "index,follow",
  locale: "en_US",
};

// Import and set font for each variant
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// The app's languages, as BCP 47 tags ("en", "hu", "de-AT"). The first is the
// default: it sets <html lang>, how prices are formatted and which entry of
// each labels file (src/content/<surface>/labels.ts) the UI shows. More than
// one turns on language URLs (/hu/store) when the app has the i18n slice;
// without it the app always renders the first.
const i18n = {
  locales: ["en"],
};

// default customization applied to the HTML in the main layout.tsx
const style = {
  theme: "dark", // dark | light | system
  neutral: "gray", // sand | gray | slate
  brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "cyan", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false
  },
};

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Acme Notes",
  description: brand.description,
  email: "hello@acme-notes.example",
};

export { baseURL, brand, seoDefaults, fonts, i18n, style, schema, dataStyle };
