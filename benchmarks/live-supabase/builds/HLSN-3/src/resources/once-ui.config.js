// The canonical URL of the site. Used for canonical links, Open Graph URLs and the sitemap.
const baseURL = "https://acme-notes.example";

// Fonts for each variant
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

// Theme applied to the HTML in the root layout. Dark mode is the default.
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

// The product's identity: the brand name, tagline and contact details are read from here.
const schema = {
  logo: "/logo.svg",
  type: "Organization",
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description: "Notes your whole team can find.",
};

export { baseURL, fonts, style, schema };
