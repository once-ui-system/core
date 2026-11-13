The workspace still shows only the original files, so my output is not on disk and nothing exists at `components/` or `lib/` to resolve. The reported errors only name the `components` imports, but the home page and `SiteShell` also depend on `@/lib/data`, so I'll resend everything in full. To keep resolution robust I'll keep the `@/*` alias, which `tsconfig.json` maps to `./*` (the project root), with all files under `app/`, `components/` and `lib/`.

```ts lib/data.ts
export interface Plan {
  name: string;
  priceMonth: number;
  seats: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeatureSection {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  stat: { value: string; label: string };
}

export interface ComparisonRow {
  feature: string;
  free: string | boolean;
  team: string | boolean;
  business: string | boolean;
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
  brandColor: "#E8590C",
  headingFont: 'Georgia, "Times New Roman", serif',
  bodyFont: "ui-sans-serif, system-ui, sans-serif",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const logos: string[] = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const featureSections: FeatureSection[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers your whole team will open on Monday",
    body: "Lumen turns raw events into a single weekly page: who showed up, what they did, and what changed since last week. No dashboards to build, no query language to learn.",
    points: [
      "A weekly digest written in plain sentences, not charts alone",
      "Funnels and retention ready after your first 100 events",
      "Every metric links to the sessions behind it",
    ],
    stat: { value: "9 min", label: "median time to first insight" },
  },
  {
    eyebrow: "Issue tracking",
    title: "Bugs that arrive with their own evidence",
    body: "When something breaks, Lumen opens the issue for you and attaches the session, the release and the affected users. Triage takes a glance instead of a meeting.",
    points: [
      "Issues grouped by cause, so one bug is one ticket",
      "Each issue shows how many users it touched",
      "Close the loop: see the fix land in the metrics",
    ],
    stat: { value: "62%", label: "fewer duplicate tickets" },
  },
  {
    eyebrow: "Built for small teams",
    title: "Quiet by design, clear by default",
    body: "Lumen is priced and shaped for teams of two to twenty. Sensible defaults, a short settings page, and data that stays in the EU, encrypted at rest.",
    points: [
      "Set up in an afternoon, with no analyst required",
      "Per-seat pricing with no event-volume surprises",
      "EU data residency with encryption at rest",
    ],
    stat: { value: "2–20", label: "people on the typical Lumen team" },
  },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For a side project or a first look at Lumen.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For product teams who ship every week.",
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
    highlight: true,
    cta: "Start Team trial",
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For teams that need control and fast answers.",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Talk to sales",
  },
];

export const comparison: ComparisonRow[] = [
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  {
    feature: "History",
    free: "7 days",
    team: "1 year",
    business: "Unlimited",
  },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO and audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
];

export const faq: FaqItem[] = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades apply at once; downgrades at the end of the billing period.",
  },
  {
    q: "Do you offer a discount for non-profits?",
    a: "Yes, 50% off Team and Business for registered non-profits.",
  },
  {
    q: "Where is my data stored?",
    a: "In the EU, encrypted at rest.",
  },
];

/** Yearly billing is two months free: pay for 10 months. */
export const YEARLY_MONTHS_PAID = 10;

export function yearlyPrice(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export function yearlyPerMonth(priceMonth: number): number {
  return (priceMonth * YEARLY_MONTHS_PAID) / 12;
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Lumen brand tokens.
 * Everything visual about the brand lives here so that components stay
 * free of one-off colours, radii and fonts.
 */
const BRAND = "#E8590C";
// Darker brand shade used for text/links on light surfaces (>= 4.5:1 on stone-50).
const BRAND_ON_LIGHT = "#B8440A";
// Lighter brand shade used for text/links on dark surfaces (>= 4.5:1 on stone-900).
const BRAND_LIGHT = "#F4813F";

const HEADING_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = "ui-sans-serif, system-ui, sans-serif";

const RADIUS = 4;

// Warm stone-grey scale.
const stone = {
  50: "#FAFAF9",
  100: "#F5F5F4",
  200: "#E7E5E4",
  300: "#D6D3D1",
  400: "#A8A29E",
  500: "#78716C",
  600: "#57534E",
  700: "#44403C",
  800: "#292524",
  900: "#1C1917",
  950: "#0C0A09",
};

const headingStyle = {
  fontFamily: HEADING_FONT,
  fontWeight: 700,
  letterSpacing: "-0.01em",
} as const;

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: "#C2410C",
          // Near-black text on the brand orange is 5.6:1; white would be 3.6:1.
          contrastText: stone[950],
        },
        secondary: {
          main: stone[300],
          contrastText: stone[900],
        },
        grey: stone,
        background: { default: stone[900], paper: stone[800] },
        text: {
          primary: stone[50],
          secondary: stone[300],
          disabled: stone[500],
        },
        divider: "rgba(214, 211, 209, 0.16)",
        action: {
          active: stone[300],
          hover: "rgba(214, 211, 209, 0.08)",
          selected: "rgba(232, 89, 12, 0.16)",
          disabled: stone[500],
          disabledBackground: "rgba(214, 211, 209, 0.12)",
        },
      },
    },
    light: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: BRAND_ON_LIGHT,
          contrastText: stone[950],
        },
        secondary: {
          main: stone[700],
          contrastText: stone[50],
        },
        grey: stone,
        background: { default: stone[50], paper: "#FFFFFF" },
        text: {
          primary: stone[900],
          secondary: stone[600],
          disabled: stone[400],
        },
        divider: stone[200],
        action: {
          active: stone[600],
          hover: "rgba(87, 83, 78, 0.06)",
          selected: "rgba(232, 89, 12, 0.12)",
          disabled: stone[400],
          disabledBackground: stone[200],
        },
      },
    },
  },
  shape: { borderRadius: RADIUS },
  // Brand-coloured two-pixel keyboard focus ring on every ButtonBase-derived control.
  focusVisible: { outlineColor: BRAND, outlineOffset: 2 },
  typography: {
    fontFamily: BODY_FONT,
    h1: { ...headingStyle, fontSize: "clamp(2.25rem, 1.4rem + 3.6vw, 4rem)", lineHeight: 1.1 },
    h2: { ...headingStyle, fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.75rem)", lineHeight: 1.15 },
    h3: { ...headingStyle, fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", lineHeight: 1.2 },
    h4: { ...headingStyle, fontSize: "1.5rem", lineHeight: 1.25 },
    h5: { ...headingStyle, fontSize: "1.25rem", lineHeight: 1.3 },
    h6: { ...headingStyle, fontSize: "1.0625rem", lineHeight: 1.35 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: "0.12em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { transition: "background-color 150ms ease, color 150ms ease" },
        "::selection": { backgroundColor: "rgba(232, 89, 12, 0.35)" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS },
        sizeLarge: { padding: "11px 24px", fontSize: "1rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: RADIUS, textTransform: "none" } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiFilledInput: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiInputBase: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: RADIUS },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: RADIUS, border: "1px solid var(--mui-palette-divider)" },
      },
    },
    MuiPopover: {
      styleOverrides: { paper: { borderRadius: RADIUS } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: RADIUS, margin: "0 4px" } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "default" },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "var(--mui-palette-background-default)",
          color: "var(--mui-palette-text-primary)",
          borderBottom: "1px solid var(--mui-palette-divider)",
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid var(--mui-palette-divider)",
          borderRadius: RADIUS,
          "&:not(:last-of-type)": { marginBottom: 8 },
          "&::before": { display: "none" },
          "&.Mui-expanded": { margin: 0, marginBottom: 8 },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: { root: { borderRadius: RADIUS, fontWeight: 600 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontFamily: BODY_FONT },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme: t }) => ({
          // Brand link colour; the darker shade keeps 4.5:1 on light surfaces.
          color: t.vars.palette.primary.main,
          fontWeight: 500,
          borderRadius: 2,
          ...t.applyStyles("light", { color: BRAND_ON_LIGHT }),
        }),
      },
    },
  },
});

export default theme;
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

export const metadata: Metadata = {
  title: {
    default: "Lumen — product analytics and issue tracking for small teams",
    template: "%s · Lumen",
  },
  description:
    "Product analytics and issue tracking that small teams actually read.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Dark is the default theme; the same default is given to the provider below. */}
        <InitColorSchemeScript attribute="class" defaultMode="dark" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="dark">
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

```tsx components/ThemeToggle.tsx
"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";

/**
 * Light/dark switch for the whole site. Both the visible mode and the
 * persisted preference come from the theme's colour-scheme context, so
 * every themed surface updates together.
 */
export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();

  // `mode` is undefined on the server and first client render; render a
  // same-sized placeholder so the header does not shift or mismatch.
  if (!mode) {
    return <Box aria-hidden sx={{ width: 40, height: 40 }} />;
  }

  const resolved = mode === "system" ? (systemMode ?? "dark") : mode;
  const next = resolved === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={() => setMode(next)}
        aria-label={label}
        color="inherit"
      >
        {resolved === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
```

```tsx components/SiteHeader.tsx
"use client";

import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navLinks } from "../lib/data";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <AppBar position="sticky" component="header">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 60, sm: 68 } }}>
          <Link
            href="/"
            underline="none"
            aria-label={`${brand.name} home`}
            sx={{
              fontFamily: "h1.fontFamily",
              typography: "h5",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mr: { sm: 4 },
              color: "text.primary",
            }}
          >
            <Box
              aria-hidden
              component="span"
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "inline-block",
              }}
            />
            {brand.name}
          </Link>

          <Box
            component="nav"
            aria-label="Main"
            sx={{ display: { xs: "none", sm: "flex" }, gap: 0.5, flexGrow: 1 }}
          >
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  href={item.href}
                  color="inherit"
                  aria-current={active ? "page" : undefined}
                  sx={{
                    color: active ? "text.primary" : "text.secondary",
                    boxShadow: active
                      ? "inset 0 -2px 0 var(--mui-palette-primary-main)"
                      : "none",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Button
            href="/pricing"
            variant="contained"
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" }, mr: 1 }}
          >
            Get started
          </Button>

          <ThemeToggle />

          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            aria-controls={menuOpen ? "mobile-nav-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-nav-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {navLinks.map((item) => (
              <MenuItem
                key={item.href}
                component="a"
                href={item.href}
                selected={pathname === item.href}
                onClick={() => setAnchorEl(null)}
              >
                {item.label}
              </MenuItem>
            ))}
            <MenuItem
              component="a"
              href="/pricing"
              onClick={() => setAnchorEl(null)}
            >
              Get started
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
```

```tsx components/SiteFooter.tsx
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { brand, navLinks } from "../lib/data";

const productLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Plans compared", href: "/pricing#compare" },
  { label: "FAQ", href: "/pricing#faq" },
];

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        mt: "auto",
        py: { xs: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 8 }}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="h5" component="p" sx={{ mb: 1 }}>
              {brand.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {brand.tagline}.
            </Typography>
          </Box>

          <Stack direction="row" spacing={{ xs: 6, md: 10 }}>
            <Box component="nav" aria-label="Footer">
              <Typography variant="overline" color="text.secondary">
                Site
              </Typography>
              <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="body2">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Box>
            <Box component="nav" aria-label="Product">
              <Typography variant="overline" color="text.secondary">
                Product
              </Typography>
              <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {productLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="body2">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 5 }}
        >
          © {new Date().getFullYear()} {brand.name}. Your data is stored in the EU,
          encrypted at rest.
        </Typography>
      </Container>
    </Box>
  );
}
```

```tsx components/SiteShell.tsx
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** Shared page chrome: skip link, header, main landmark and footer. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Link
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -64,
          zIndex: "tooltip",
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <SiteHeader />
      <Box component="main" id="main" tabIndex={-1} sx={{ flexGrow: 1, outline: "none" }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
```

```tsx components/Hero.tsx
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { brand } from "../lib/data";

export default function Hero() {
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 14 },
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(60% 60% at 80% 0%, rgba(232, 89, 12, 0.18) 0%, rgba(232, 89, 12, 0) 70%)",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Typography variant="overline" color="primary.light" component="p">
          {brand.name} · for small software teams
        </Typography>
        <Typography
          id="hero-heading"
          variant="h1"
          component="h1"
          sx={{ mt: 1, maxWidth: 860 }}
        >
          {brand.tagline}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mt: 3, maxWidth: 640, fontFamily: "body1.fontFamily", fontWeight: 400, lineHeight: 1.6 }}
        >
          One quiet place for the numbers and the bugs behind your product. Set
          up in an afternoon, read by the whole team every week.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 5 }}
        >
          <Button
            href="/pricing"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Start free
          </Button>
          <Button href="/pricing#compare" variant="outlined" color="inherit" size="large">
            Compare plans
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
```

```tsx components/CustomerLogos.tsx
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { logos } from "../lib/data";

export default function CustomerLogos() {
  return (
    <Box
      component="section"
      aria-labelledby="logos-heading"
      sx={{ py: { xs: 5, md: 6 }, borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Typography
          id="logos-heading"
          variant="overline"
          component="h2"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center" }}
        >
          Trusted by small teams at
        </Typography>
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
            mt: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: { xs: 4, md: 7 },
            rowGap: 2,
          }}
        >
          {logos.map((name) => (
            <Typography
              key={name}
              component="li"
              variant="h5"
              sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              {name}
            </Typography>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
```

```tsx components/FeatureSections.tsx
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { featureSections } from "../lib/data";

export default function FeatureSections() {
  return (
    <Box component="section" aria-label="Features">
      {featureSections.map((feature, index) => {
        const headingId = `feature-${index}-heading`;
        const reversed = index % 2 === 1;
        return (
          <Box
            key={feature.title}
            component="article"
            aria-labelledby={headingId}
            sx={{
              py: { xs: 7, md: 10 },
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: reversed ? "background.paper" : "transparent",
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: "grid",
                  gap: { xs: 4, md: 8 },
                  alignItems: "center",
                  gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
                }}
              >
                <Box sx={{ order: { xs: 0, md: reversed ? 1 : 0 } }}>
                  <Typography variant="overline" color="primary.light" component="p">
                    {feature.eyebrow}
                  </Typography>
                  <Typography id={headingId} variant="h2" component="h2" sx={{ mt: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: "1.0625rem" }}>
                    {feature.body}
                  </Typography>
                  <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", p: 0, m: 0, mt: 3 }}>
                    {feature.points.map((point) => (
                      <Stack
                        key={point}
                        component="li"
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckIcon
                          aria-hidden
                          fontSize="small"
                          sx={{ color: "primary.light", mt: "2px" }}
                        />
                        <Typography>{point}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Card sx={{ order: { xs: 1, md: reversed ? 0 : 1 } }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: "h1.fontFamily",
                        fontWeight: 700,
                        fontSize: "clamp(2.75rem, 2rem + 3vw, 4.5rem)",
                        lineHeight: 1,
                        color: "primary.light",
                      }}
                    >
                      {feature.stat.value}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                      {feature.stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Container>
          </Box>
        );
      })}
    </Box>
  );
}
```

```tsx components/PricingPlans.tsx
"use client";

import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  YEARLY_MONTHS_PAID,
  plans,
  yearlyPerMonth,
  yearlyPrice,
} from "../lib/data";

const visuallyHiddenSx = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <Box component="section" aria-labelledby="pricing-heading" sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.light" component="p">
            Pricing
          </Typography>
          <Typography id="pricing-heading" variant="h1" component="h1" sx={{ mt: 1 }}>
            Simple per-seat pricing
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: "1.0625rem" }}>
            Start free, add your team when you are ready. Pay yearly and get two
            months free.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 4, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography
              component="span"
              aria-hidden
              color={yearly ? "text.secondary" : "text.primary"}
              sx={{ fontWeight: yearly ? 400 : 700 }}
            >
              Monthly
            </Typography>
            <FormControlLabel
              sx={{ m: 0 }}
              label={<Box component="span" sx={visuallyHiddenSx}>Bill yearly</Box>}
              control={
                <Switch
                  checked={yearly}
                  onChange={(event) => setYearly(event.target.checked)}
                />
              }
            />
            <Typography
              component="span"
              aria-hidden
              color={yearly ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: yearly ? 700 : 400 }}
            >
              Yearly
            </Typography>
            <Chip
              size="small"
              color="primary"
              label="2 months free"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          <Typography role="status" variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {yearly
              ? `Showing yearly prices: ${YEARLY_MONTHS_PAID} months billed, 2 free.`
              : "Showing monthly prices."}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 6,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            alignItems: "stretch",
          }}
        >
          {plans.map((plan) => {
            const free = plan.priceMonth === 0;
            const headingId = `plan-${plan.name.toLowerCase()}`;
            return (
              <Card
                key={plan.name}
                component="article"
                aria-labelledby={headingId}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  ...(plan.highlight && {
                    borderColor: "primary.main",
                    borderWidth: 2,
                    bgcolor: "background.paper",
                    boxShadow: "0 0 0 4px rgba(232, 89, 12, 0.14)",
                  }),
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "center", minHeight: 32 }}
                  >
                    <Typography id={headingId} variant="h4" component="h2">
                      {plan.name}
                    </Typography>
                    {plan.highlight && (
                      <Chip size="small" color="primary" label="Most popular" sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {plan.blurb}
                  </Typography>

                  <Box sx={{ mt: 3, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: "h1.fontFamily",
                        fontWeight: 700,
                        fontSize: "3rem",
                        lineHeight: 1,
                      }}
                    >
                      {free
                        ? "$0"
                        : yearly
                          ? formatPrice(yearlyPrice(plan.priceMonth))
                          : formatPrice(plan.priceMonth)}
                    </Typography>
                    <Typography color="text.secondary">
                      {free
                        ? "forever"
                        : yearly
                          ? "per seat / year"
                          : "per seat / month"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 20 }}>
                    {free
                      ? plan.seats
                      : yearly
                        ? `${formatPrice(yearlyPerMonth(plan.priceMonth))} per seat / month, billed yearly`
                        : "Billed monthly, cancel any time"}
                  </Typography>

                  <Stack
                    component="ul"
                    spacing={1.25}
                    sx={{ listStyle: "none", p: 0, m: 0, mt: 3 }}
                  >
                    {plan.features.map((feature) => (
                      <Stack
                        key={feature}
                        component="li"
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckIcon aria-hidden fontSize="small" sx={{ color: "primary.light", mt: "2px" }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    size="large"
                    href="#"
                    variant={plan.highlight ? "contained" : "outlined"}
                    color={plan.highlight ? "primary" : "inherit"}
                    onClick={(event) => event.preventDefault()}
                    aria-label={`${plan.cta}, ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
```

```tsx components/ComparisonTable.tsx
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { comparison, plans } from "../lib/data";

const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <>
        <CheckIcon aria-hidden fontSize="small" sx={{ color: "primary.light" }} />
        <Box component="span" sx={visuallyHidden}>
          Included
        </Box>
      </>
    ) : (
      <>
        <RemoveIcon aria-hidden fontSize="small" sx={{ color: "text.disabled" }} />
        <Box component="span" sx={visuallyHidden}>
          Not included
        </Box>
      </>
    );
  }
  return <>{value}</>;
}

export default function ComparisonTable() {
  return (
    <Box
      component="section"
      id="compare"
      aria-labelledby="compare-heading"
      sx={{ py: { xs: 6, md: 9 }, borderTop: 1, borderColor: "divider", scrollMarginTop: 72 }}
    >
      <Container maxWidth="lg">
        <Typography id="compare-heading" variant="h2" component="h2" sx={{ mb: 4 }}>
          Compare plans
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 560 }}>
            <Box component="caption" sx={visuallyHidden}>
              Feature comparison of the Free, Team and Business plans
            </Box>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Feature</TableCell>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.name}
                    scope="col"
                    align="center"
                    sx={plan.highlight ? { color: "primary.light" } : undefined}
                  >
                    {plan.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.feature} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.feature}
                  </TableCell>
                  <TableCell align="center">
                    <Cell value={row.free} />
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: "action.hover" }}>
                    <Cell value={row.team} />
                  </TableCell>
                  <TableCell align="center">
                    <Cell value={row.business} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
```

```tsx components/FaqAccordion.tsx
"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useId, useState } from "react";
import { faq } from "../lib/data";

export default function FaqAccordion() {
  const baseId = useId();
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box
      component="section"
      id="faq"
      aria-labelledby="faq-heading"
      sx={{ py: { xs: 6, md: 9 }, borderTop: 1, borderColor: "divider", scrollMarginTop: 72 }}
    >
      <Container maxWidth="md">
        <Typography id="faq-heading" variant="h2" component="h2" sx={{ mb: 4 }}>
          Frequently asked questions
        </Typography>
        {faq.map((item, index) => (
          <Accordion
            key={item.q}
            expanded={expanded === index}
            onChange={(_event, isExpanded) => setExpanded(isExpanded ? index : false)}
            slotProps={{ heading: { component: "h3" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${baseId}-${index}-content`}
              id={`${baseId}-${index}-header`}
            >
              {item.q}
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
```

```tsx app/page.tsx
import CustomerLogos from "../components/CustomerLogos";
import FeatureSections from "../components/FeatureSections";
import Hero from "../components/Hero";
import SiteShell from "../components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <CustomerLogos />
      <FeatureSections />
    </SiteShell>
  );
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";
import ComparisonTable from "../../components/ComparisonTable";
import FaqAccordion from "../../components/FaqAccordion";
import PricingPlans from "../../components/PricingPlans";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lumen pricing: Free, Team and Business plans. Pay yearly and get two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingPlans />
      <ComparisonTable />
      <FaqAccordion />
    </SiteShell>
  );
}
```