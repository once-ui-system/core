```tsx app/theme.ts
"use client";

import NextLink from "next/link";
import { createTheme } from "@mui/material/styles";
import type { LinkProps } from "@mui/material/Link";

// Lumen brand tokens. Everything below is carried by the theme so that every
// screen follows it without one-off styles on elements.
const BODY_FONT = 'ui-sans-serif, system-ui, sans-serif';
const HEADING_FONT = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const RADIUS = 16;

const heading = {
  fontFamily: HEADING_FONT,
  fontWeight: 700,
  letterSpacing: "-0.015em",
} as const;

const v = (token: string) => `var(--mui-palette-${token})`;

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#DB2777",
          light: "#F472B6",
          dark: "#BE185D",
          contrastText: "#FFFFFF",
        },
        secondary: { main: "#8A6A3F", contrastText: "#FFFFFF" },
        background: { default: "#FAF5EC", paper: "#FFFEFB" },
        text: { primary: "#3A2E22", secondary: "#6B5B49" },
        divider: "#E8DCC6",
        grey: {
          50: "#FBF7F0",
          100: "#F4EDE0",
          200: "#E8DCC6",
          300: "#D8C9AE",
          400: "#B9A687",
          500: "#968568",
          600: "#74664E",
          700: "#574B39",
          800: "#3A2E22",
          900: "#241C14",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#F472B6",
          light: "#F9A8D4",
          dark: "#EC4899",
          contrastText: "#2B0A1A",
        },
        secondary: { main: "#D9B98A", contrastText: "#241C14" },
        background: { default: "#1C1712", paper: "#262019" },
        text: { primary: "#F5EDE0", secondary: "#CDBDA4" },
        divider: "#3D3326",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: BODY_FONT,
    h1: {
      ...heading,
      fontSize: "clamp(1.875rem, 1.5rem + 1.6vw, 2.5rem)",
      lineHeight: 1.15,
    },
    h2: { ...heading, fontSize: "2rem", lineHeight: 1.2 },
    h3: { ...heading, fontSize: "2.25rem", lineHeight: 1.15 },
    h4: { ...heading, fontSize: "1.75rem", lineHeight: 1.2 },
    h5: { ...heading, fontSize: "1.375rem", lineHeight: 1.3 },
    h6: { ...heading, fontSize: "1.125rem", lineHeight: 1.35 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: { fontFamily: BODY_FONT, fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "a:focus-visible, button:focus-visible, [role='button']:focus-visible, [tabindex='0']:focus-visible":
          {
            outline: `3px solid ${v("primary-main")}`,
            outlineOffset: "2px",
          },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { LinkComponent: NextLink },
    },
    MuiLink: {
      defaultProps: { component: NextLink, underline: "always" } as LinkProps,
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 48,
          paddingInline: 24,
          fontWeight: 700,
          textTransform: "none",
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "large" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: RADIUS, backgroundColor: v("background-paper") } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { borderRadius: RADIUS, backgroundImage: "none" },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 24, "&:last-child": { paddingBottom: 24 } },
      },
    },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 12,
          fontSize: "0.875rem",
          padding: "8px 12px",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: "inherit", elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: v("background-default"),
          color: v("text-primary"),
          backgroundImage: "none",
          borderBottom: `1px solid ${v("divider")}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 52,
          paddingInline: 16,
          "&.Mui-selected": {
            backgroundColor: v("primary-main"),
            color: v("primary-contrastText"),
            "&:hover, &.Mui-focusVisible": {
              backgroundColor: v("primary-dark"),
            },
            "& .MuiListItemIcon-root": { color: "inherit" },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 44 } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 48,
          paddingInline: 20,
          fontWeight: 700,
          textTransform: "none",
          "&.Mui-selected": {
            backgroundColor: v("primary-main"),
            color: v("primary-contrastText"),
            "&:hover": { backgroundColor: v("primary-dark") },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 10, borderRadius: 8 } },
    },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
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
import AppShell from "@/components/AppShell";
import theme from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="light" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="light">
            <CssBaseline />
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

```tsx lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const appName = "Lumen";

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

export function issueLabel(count: number): string {
  if (count === 0) return "No open issues";
  return count === 1 ? "1 open issue" : `${count} open issues`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```tsx lib/navigation.ts
import type { ElementType } from "react";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import WorkspacesRounded from "@mui/icons-material/WorkspacesRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: ElementType;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: InsightsRounded,
    items: [
      { label: "Overview", href: "/", icon: DashboardRounded },
      { label: "Reports", href: "/reports", icon: BarChartRounded },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: WorkspacesRounded,
    items: [
      { label: "Projects", href: "/projects", icon: FolderRounded },
      { label: "Settings", href: "/settings", icon: SettingsRounded },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNav(
  pathname: string,
): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
}
```

```tsx components/SidebarNav.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { isActive, navGroups } from "@/lib/navigation";

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ px: collapsed ? 1.5 : 2, py: 2 }}
    >
      {navGroups.map((group, index) => {
        const isOpen = collapsed || !closedGroups[group.id];
        const listId = `nav-group-${group.id}`;
        const GroupIcon = group.icon;
        return (
          <Box key={group.id} sx={{ mb: 1 }}>
            {collapsed ? (
              index > 0 ? <Divider sx={{ my: 1.5 }} /> : null
            ) : (
              <ListItemButton
                onClick={() =>
                  setClosedGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
                aria-controls={listId}
                sx={{ color: "text.secondary", minHeight: 48 }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText
                  primary={group.label}
                  slotProps={{ primary: { variant: "subtitle2" } }}
                />
                {isOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />}
              </ListItemButton>
            )}
            <Collapse in={isOpen} timeout="auto" id={listId}>
              <List disablePadding sx={{ pl: collapsed ? 0 : 1.5 }}>
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const Icon = item.icon;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ display: "block", mt: 0.5 }}>
                      <Tooltip
                        title={collapsed ? item.label : ""}
                        placement="right"
                        arrow
                      >
                        <ListItemButton
                          href={item.href}
                          selected={active}
                          aria-current={active ? "page" : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          onClick={onNavigate}
                          sx={
                            collapsed
                              ? {
                                  justifyContent: "center",
                                  px: 0,
                                  "& .MuiListItemIcon-root": { minWidth: 0 },
                                }
                              : undefined
                          }
                        >
                          <ListItemIcon>
                            <Icon />
                          </ListItemIcon>
                          {collapsed ? null : (
                            <ListItemText
                              primary={item.label}
                              slotProps={{
                                primary: { sx: { fontWeight: active ? 700 : 600 } },
                              }}
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import SidebarNav from "@/components/SidebarNav";
import { appName, initials, user } from "@/lib/data";
import { findNav } from "@/lib/navigation";

const EXPANDED_WIDTH = 288;
const COLLAPSED_WIDTH = 96;

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      underline="none"
      color="inherit"
      aria-label={`${appName} home`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minHeight: 48,
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AutoAwesomeRounded />
      </Box>
      {collapsed ? null : (
        <Typography component="span" variant="h5">
          {appName}
        </Typography>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = findNav(pathname);
  const { mode, setMode } = useColorScheme();

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          px: 2.5,
          py: 1.5,
          borderRadius: 1,
          fontWeight: 700,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          textDecoration: "none",
          transform: "translateY(-200%)",
          "&:focus": { transform: "translateY(0)" },
        }}
      >
        Skip to content
      </Box>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          transition: "width 200ms ease",
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 200ms ease",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ px: collapsed ? 1.5 : 3.5, pt: 3, pb: 1 }}>
          <Brand collapsed={collapsed} />
        </Box>
        <SidebarNav collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        slotProps={{
          paper: {
            sx: { width: "min(320px, 86vw)", bgcolor: "background.paper" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Brand />
          <IconButton
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Box>
        <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 1, minHeight: { xs: 72, md: 80 }, px: { xs: 2, md: 4 } }}>
            <IconButton
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, ml: -1 }}
            >
              <MenuRounded />
            </IconButton>
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              sx={{ display: { xs: "none", md: "inline-flex" }, ml: -1 }}
            >
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>

            <Breadcrumbs
              aria-label="Breadcrumb"
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {current ? (
                <Typography variant="body2" color="text.secondary">
                  {current.group.label}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {appName}
                </Typography>
              )}
              {current ? (
                <Typography
                  variant="body2"
                  color="text.primary"
                  aria-current="page"
                  sx={{ fontWeight: 700 }}
                >
                  {current.item.label}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.primary" aria-current="page" sx={{ fontWeight: 700 }}>
                  Page not found
                </Typography>
              )}
            </Breadcrumbs>

            <Tooltip title={`Switch to ${nextMode} mode`}>
              <IconButton
                aria-label={`Switch to ${nextMode} mode`}
                onClick={() => setMode(nextMode)}
              >
                {mode === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
              </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", pl: 1 }}>
              <Avatar aria-hidden sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                {initials(user.name)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.3 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 3, sm: 5, md: 6 },
            outline: "none",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/PageHeader.tsx
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography variant="h1">{title}</Typography>
      {description ? (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
}
```

```tsx components/SummaryCard.tsx
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface SummaryCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export default function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" component="p" sx={{ mt: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hint}
            </Typography>
          </Box>
          <Box
            aria-hidden
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.selected",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

```tsx components/ProjectBars.tsx
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { issueLabel, type Project } from "@/lib/data";

export default function ProjectBars({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => b.issues - a.issues);
  const max = Math.max(1, ...sorted.map((project) => project.issues));

  return (
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 3 }}
    >
      {sorted.map((project) => (
        <li key={project.key}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="subtitle1">{project.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {issueLabel(project.issues)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(project.issues / max) * 100}
            aria-label={`${project.name} open issues`}
            aria-valuetext={issueLabel(project.issues)}
          />
        </li>
      ))}
    </Box>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BugReportRounded from "@mui/icons-material/BugReportRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import UpdateRounded from "@mui/icons-material/UpdateRounded";
import PageHeader from "@/components/PageHeader";
import ProjectBars from "@/components/ProjectBars";
import SummaryCard from "@/components/SummaryCard";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const totalIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const activeCount = projects.filter((project) => project.status === "Active").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your team's projects stand today. Nice work keeping things moving."
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(totalIssues)}
            hint={`Across ${projects.length} projects`}
            icon={<BugReportRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(activeCount)}
            hint={`${projects.length} in the workspace`}
            icon={<FolderRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.name}
            hint={`${busiest.issues} open issues`}
            icon={<LocalFireDepartmentRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Latest update"
            value={formatDate(latest.updated)}
            hint={latest.name}
            icon={<UpdateRounded />}
          />
        </Grid>

        <Grid size={12}>
          <Card component="section" aria-labelledby="where-work-is">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                  mb: 4,
                }}
              >
                <Typography id="where-work-is" variant="h5" component="h2">
                  Where the work is
                </Typography>
                <Button href="/projects" variant="contained">
                  See all projects
                </Button>
              </Stack>
              <ProjectBars projects={projects} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
```

```tsx components/ProjectsList.tsx
"use client";

import { Fragment, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {
  formatDate,
  issueLabel,
  projects,
  type ProjectStatus,
} from "@/lib/data";

type Filter = "All" | ProjectStatus;

const filters: Filter[] = ["All", "Active", "Paused", "Archived"];

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsList() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible =
    filter === "All"
      ? projects
      : projects.filter((project) => project.status === filter);

  return (
    <>
      <Box sx={{ overflowX: "auto", pb: 0.5, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          value={filter}
          onChange={(_, value: Filter | null) => {
            if (value) setFilter(value);
          }}
          aria-label="Filter projects by status"
        >
          {filters.map((item) => (
            <ToggleButton key={item} value={item}>
              {item}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ mb: 2 }}
      >
        Showing {visible.length} of {projects.length} projects
      </Typography>

      <Card component="section" aria-label="Projects">
        <List disablePadding>
          {visible.map((project, index) => (
            <Fragment key={project.key}>
              {index > 0 ? <Divider component="li" /> : null}
              <ListItem
                sx={{
                  py: 2.5,
                  px: { xs: 2, sm: 3 },
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <ListItemAvatar sx={{ minWidth: 0 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: "0.875rem",
                      bgcolor: "action.selected",
                      color: "text.primary",
                    }}
                  >
                    {project.key}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{ flex: "1 1 180px", minWidth: 0, m: 0 }}
                  primary={project.name}
                  secondary={`Updated ${formatDate(project.updated)}`}
                  slotProps={{ primary: { variant: "subtitle1" } }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={project.status}
                    color={statusColor[project.status]}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {issueLabel(project.issues)}
                  </Typography>
                </Box>
              </ListItem>
            </Fragment>
          ))}
        </List>
      </Card>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProjectsList from "@/components/ProjectsList";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and what is still open."
      />
      <ProjectsList />
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import ProjectBars from "@/components/ProjectBars";
import { projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="A snapshot of open issues and project status across the workspace."
      />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card component="section" aria-labelledby="issues-by-project" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography id="issues-by-project" variant="h5" component="h2" sx={{ mb: 4 }}>
                Open issues by project
              </Typography>
              <ProjectBars projects={projects} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card component="section" aria-labelledby="projects-by-status" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography id="projects-by-status" variant="h5" component="h2" sx={{ mb: 2 }}>
                Projects by status
              </Typography>
              <List disablePadding>
                {statuses.map((status) => {
                  const count = projects.filter((project) => project.status === status).length;
                  return (
                    <ListItem
                      key={status}
                      disableGutters
                      sx={{ py: 1.5, justifyContent: "space-between" }}
                    >
                      <ListItemText primary={status} slotProps={{ primary: { variant: "subtitle1" } }} sx={{ flex: "0 1 auto" }} />
                      <Chip label={count} variant="outlined" />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "@/lib/data";

type Pref = "weekly" | "assigned" | "mentions" | "product";

const prefLabels: { id: Pref; title: string; hint: string }[] = [
  { id: "weekly", title: "Weekly summary", hint: "A Monday note with what moved last week." },
  { id: "assigned", title: "Issues assigned to me", hint: "Hear about it as soon as something lands on you." },
  { id: "mentions", title: "Mentions and replies", hint: "When a teammate tags you in a thread." },
  { id: "product", title: "Product news", hint: "New features and tips from the Lumen team." },
];

type Mode = "light" | "dark" | "system";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<Pref, boolean>>({
    weekly: true,
    assigned: true,
    mentions: true,
    product: false,
  });
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 760 }}
    >
      <Card component="section" aria-labelledby="profile-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="profile-heading" variant="h5" component="h2" sx={{ mb: 3 }}>
            Profile
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
              required
            />
            <TextField
              label="Role"
              value={user.role}
              helperText="Roles are managed by the workspace owner."
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
          </Stack>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="appearance-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="appearance-heading" variant="h5" component="h2" sx={{ mb: 1 }}>
            Appearance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how Lumen looks for you.
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={mode ?? "light"}
            onChange={(_, value: Mode | null) => {
              if (value) setMode(value);
            }}
            aria-label="Colour mode"
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="system">System</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="notifications-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="notifications-heading" variant="h5" component="h2" sx={{ mb: 2 }}>
            Notifications
          </Typography>
          <Stack>
            {prefLabels.map((pref) => (
              <FormControlLabel
                key={pref.id}
                labelPlacement="start"
                sx={{ mx: 0, py: 1.5, width: "100%", justifyContent: "space-between", gap: 2 }}
                control={
                  <Switch
                    checked={prefs[pref.id]}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, [pref.id]: event.target.checked }))
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">{pref.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pref.hint}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button type="submit" variant="contained" size="large">
          Save changes
        </Button>
      </Box>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSaved(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Your settings are saved.
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Update your profile, pick a look you like and choose what lands in your inbox."
      />
      <SettingsForm />
    </>
  );
}
```
