// The site's canonical URL. Used for canonical links, Open Graph URLs and
// the sitemap-style absolute links in SEO metadata.
const baseURL = "https://acme-notes.example";

// Fonts: one Google family for headings, body and labels, plus a mono for code.
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

// Once UI theme. Dark mode is the default.
const style = {
  theme: "dark", // dark | light | system
  neutral: "gray", // sand | gray | slate
  brand: "emerald",
  accent: "cyan",
  solid: "contrast", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

// The product's identity: the header, footer, titles and the sign-in screen read it.
const schema = {
  logo: "/logo.svg",
  type: "Organization",
  name: "Acme Notes",
  tagline: "Notes your whole team can find.",
  description:
    "Acme Notes is a notes app for teams: shared notebooks, instant search, and roles and permissions.",
  email: "hello@example.com",
};

export { baseURL, fonts, style, schema };
