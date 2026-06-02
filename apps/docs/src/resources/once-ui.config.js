const baseURL = "https://docs.once-ui.com";

const routes = {
  '/changelog':  true,
  '/roadmap':    true,
}

const style = {
  theme: "system", // dark | light
  neutral: "gray", // sand | gray | slate
  brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "orange", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
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
    collapsible: false, // accordion or static render
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
    link: "https://discord.com/invite/design-engineers",
  },
];

const schema = {
  logo: "",
  type: "Organization",
  name: "Once UI",
  description: "Once UI is the open-source design system for the AI-native era. We equip design engineers, founders and creatives with pre-styled, out-of-the-box solutions to ship amazing products consistently.",
  email: "support@once-ui.com",
  locale: "en_US"
};

const meta = {
  home: {
    title: "The open-source design system for the AI-native web",
    description: schema.description,
    path: "/",
    image: "/api/og/generate?title=The open-source design system for the AI-native web"
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

export { dataStyle, style, layout, baseURL, social, schema, meta, routes };
