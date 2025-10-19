const baseURL = "https://docs.once-ui.com";

const routes = {
  '/changelog':  true,
  '/roadmap':    true,
}

const style = {
  theme: "system", // dark | light
  neutral: "gray", // sand | gray | slate
  brand: "blue", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "indigo", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100"
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

const layout = {
  // units are set in REM
  header: {
    width: 200, // max-width of the content inside the header
  },
  body: {
    width: 200, // max-width of the body
  },
  sidebar: {
    width: 17, // width of the sidebar
    collapsible: true, // accordion or static render
  },
  content: {
    width: 44, // width of the main content block
  },
  sideNav: {
    width: 17, // width of the sideNav on document pages
  },
  footer: {
    width: 44, // width of the content inside the footer
  },
};

const effects = {
  mask: {
    cursor: false,
    x: 50,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: false,
    x: 50,
    y: 0,
    width: 100,
    height: 100,
    tilt: 0,
    colorStart: "brand-background-strong",
    colorEnd: "static-transparent",
    opacity: 50,
  },
  dots: {
    display: false,
    size: 2,
    color: "brand-on-background-weak",
    opacity: 20,
  },
  lines: {
    display: false,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
  grid: {
    display: false,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/once-ui-system",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/company/once-ui/",
  },
  {
    name: "Discord",
    icon: "discord",
    link: "https://discord.com/invite/5EyAQ4eNdS",
  },
];

const schema = {
  logo: "",
  type: "Organization",
  name: "Once UI",
  description: "Once UI design system and Next.js component library and Magic templates documentation.",
  email: "support@once-ui.com",
  locale: "en_US"
};

const meta = {
  home: {
    title: `Docs – ${schema.name}`,
    description: schema.description,
    path: "/",
    image: "/api/og/generate?title=Magic Templates&description=Documentation of the official Once UI templates"
  },
  roadmap: {
    title: `Roadmap – ${schema.name}`,
    description: schema.description,
    path: "/roadmap",
    image: "/api/og/generate?title=Roadmap"
  },
  changelog: {
    title: `Changelog – ${schema.name}`,
    description: schema.description,
    path: "/changelog",
    image: "/api/og/generate?title=Changelog"
  }
};

export { dataStyle, effects, style, layout, baseURL, social, schema, meta, routes };
