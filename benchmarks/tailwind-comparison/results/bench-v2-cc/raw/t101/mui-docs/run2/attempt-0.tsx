```ts app/theme.ts
"use client";

import { createTheme, type Theme } from "@mui/material/styles";

// Lumen: calm, exact, ledger-like. All of the brand lives here, so every screen follows it.
const headingFont = 'Georgia, "Times New Roman", serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";

// Cool slate neutrals.
const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
};

const BRAND = "#0F766E";
const RADIUS = 2;

const palette = (theme: Theme) => (theme.vars || theme).palette;
const focusRing = (theme: Theme) => ({
  outline: `2px solid ${palette(theme).primary.main}`,
  outlineOffset: 2,
});

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND, contrastText: "#ffffff" },
        secondary: { main: slate[700] },
        success: { main: "#15803d" },
        warning: { main: "#b45309" },
        error: { main: "#b91c1c" },
        info: { main: "#0369a1" },
        grey: slate,
        background: { default: slate[50], paper: "#ffffff" },
        text: { primary: slate[900], secondary: slate[600] },
        divider: slate[200],
      },
    },
    dark: {
      palette: {
        primary: { main: "#2dd4bf", contrastText: "#042f2e" },
        secondary: { main: slate[300] },
        success: { main: "#4ade80" },
        warning: { main: "#fbbf24" },
        error: { main: "#f87171" },
        info: { main: "#38bdf8" },
        grey: slate,
        background: { default: "#0b1220", paper: "#111a2b" },
        text: { primary: slate[100], secondary: slate[400] },
        divider: slate[800],
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: bodyFont,
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.45 },
    caption: { fontSize: "0.75rem" },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.8125rem" },
    h1: { fontFamily: headingFont, fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" },
    h2: { fontFamily: headingFont, fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontFamily: headingFont, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontFamily: headingFont, fontSize: "1rem", fontWeight: 600, lineHeight: 1.35 },
    h5: { fontFamily: headingFont, fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.35 },
    h6: { fontFamily: headingFont, fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.35 },
    overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        ":focus-visible": focusRing(t),
      }),
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": focusRing(t),
        }),
      },
    },
    MuiButton: { defaultProps: { size: "small", disableElevation: true } },
    MuiIconButton: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small", margin: "dense" } },
    MuiFormControl: { defaultProps: { size: "small", margin: "dense" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiLink: { defaultProps: { underline: "always" } },
    MuiAppBar: {
      defaultProps: { color: "inherit", elevation: 0 },
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: palette(t).background.paper,
          backgroundImage: "none",
          color: palette(t).text.primary,
          borderBottom: `1px solid ${palette(t).divider}`,
        }),
      },
    },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: "12px 16px", "&:last-child": { paddingBottom: 12 } },
      },
    },
    MuiList: { defaultProps: { dense: true } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32 } } },
    MuiListItemButton: {
      defaultProps: { dense: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          color: palette(t).text.primary,
          "& .MuiListItemIcon-root": { color: palette(t).text.secondary },
          "&.Mui-selected": {
            backgroundColor: `color-mix(in srgb, ${palette(t).primary.main} 12%, transparent)`,
            color: palette(t).primary.main,
            fontWeight: 600,
            "& .MuiListItemIcon-root": { color: palette(t).primary.main },
            "&:hover": {
              backgroundColor: `color-mix(in srgb, ${palette(t).primary.main} 18%, transparent)`,
            },
          },
        }),
      },
    },
    MuiMenuItem: { defaultProps: { dense: true } },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: RADIUS, fontSize: "0.75rem" } },
    },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "6px 12px", fontVariantNumeric: "tabular-nums" },
        head: ({ theme: t }) => ({
          fontWeight: 600,
          color: palette(t).text.secondary,
          backgroundColor: palette(t).background.default,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: RADIUS, height: 6 } },
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
import AppShell from "@/components/AppShell";
import theme from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Lumen: product analytics and issue tracking for small software teams.",
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

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

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

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active");
export const byRecency = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
export const busiestProject = [...projects].sort((a, b) => b.issues - a.issues)[0];
```

```ts lib/navigation.ts
import type { ElementType } from "react";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SettingsIcon from "@mui/icons-material/Settings";

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
    icon: BarChartIcon,
    items: [
      { label: "Overview", href: "/", icon: DashboardIcon },
      { label: "Reports", href: "/reports", icon: AssessmentIcon },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: BusinessIcon,
    items: [
      { label: "Projects", href: "/projects", icon: FolderOpenIcon },
      { label: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item };
    }
  }
  return undefined;
}
```

```tsx components/NavList.tsx
"use client";

import { Fragment, useId, useState } from "react";
import Link from "next/link";
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
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { isActive, navGroups } from "@/lib/navigation";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const baseId = useId();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g) => [g.id, true])),
  );

  if (collapsed) {
    return (
      <Box component="nav" aria-label="Primary" sx={{ px: 0.75, py: 1 }}>
        {navGroups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <List disablePadding aria-label={group.label}>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <ListItem key={item.href} disablePadding sx={{ display: "block", mb: 0.25 }}>
                    <Tooltip title={item.label} placement="right">
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${group.label}: ${item.label}`}
                        onClick={onNavigate}
                        sx={{ justifyContent: "center", px: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Primary" sx={{ px: 0.75, py: 1 }}>
      {navGroups.map((group) => {
        const isOpen = open[group.id] ?? true;
        const GroupIcon = group.icon;
        const panelId = `${baseId}-${group.id}`;
        return (
          <Box key={group.id} sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !(prev[group.id] ?? true) }))}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <ListItemIcon>
                <GroupIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={group.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" id={panelId}>
              <List disablePadding aria-label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ display: "block", mt: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavigate}
                        sx={{ pl: 3 }}
                      >
                        <ListItemIcon>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { Theme } from "@mui/material/styles";
import NavList from "@/components/NavList";
import { findCurrent } from "@/lib/navigation";
import { user } from "@/lib/data";

const HEADER_HEIGHT = 48;
const EXPANDED_WIDTH = 232;
const COLLAPSED_WIDTH = 52;

const widthTransition = (theme: Theme) =>
  theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  });

function Brand() {
  return (
    <Typography
      component={Link}
      href="/"
      variant="h5"
      sx={{ color: "text.primary", textDecoration: "none", letterSpacing: "0.01em", px: 0.5 }}
    >
      Lumen
    </Typography>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const current = findCurrent(pathname);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: -9999,
          top: 8,
          zIndex: "tooltip",
          px: 1.5,
          py: 0.75,
          bgcolor: "background.paper",
          color: "primary.main",
          border: 1,
          borderColor: "primary.main",
          borderRadius: 0.25,
          "&:focus": { left: 8 },
        }}
      >
        Skip to content
      </Box>

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar disableGutters sx={{ minHeight: HEADER_HEIGHT, px: { xs: 1, md: 1.5 }, gap: 1 }}>
          <IconButton
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
          <Brand />
          <Divider orientation="vertical" flexItem sx={{ my: 1.25 }} />
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            {current && (
              <Breadcrumbs
                aria-label="Breadcrumb"
                separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
                sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
              >
                <Typography variant="body2" color="text.secondary" noWrap>
                  {current.group.label}
                </Typography>
                <Typography variant="body2" color="text.primary" aria-current="page" noWrap sx={{ fontWeight: 600 }}>
                  {current.item.label}
                </Typography>
              </Breadcrumbs>
            )}
          </Box>
          <IconButton
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-controls={menuAnchor ? "account-menu" : undefined}
            aria-expanded={menuAnchor ? true : undefined}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "primary.main", color: "primary.contrastText" }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email} · {user.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} href="/settings" onClick={() => setMenuAnchor(null)}>
              Account settings
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open
        sx={(theme) => ({
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          transition: widthTransition(theme),
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: widthTransition(theme),
          },
        })}
      >
        <Box sx={{ height: HEADER_HEIGHT, flexShrink: 0 }} />
        <NavList collapsed={collapsed} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: HEADER_HEIGHT, px: 1.5, justifyContent: "space-between" }}>
          <Brand />
          <IconButton aria-label="Close navigation menu" onClick={() => setMobileOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
        <Divider />
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ height: HEADER_HEIGHT }} />
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ p: { xs: 2, md: 3 }, outline: "none" }}
        >
          <Box sx={{ maxWidth: 1120, mx: "auto" }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/PageHeader.tsx
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 1,
        mb: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
```

```tsx components/DashboardView.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import {
  activeProjects,
  busiestProject,
  byRecency,
  formatDate,
  projects,
  totalIssues,
  user,
} from "@/lib/data";

const summary = [
  { label: "Issues", value: String(totalIssues), note: `across ${projects.length} projects` },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: `of ${projects.length} in the workspace`,
  },
  {
    label: "Most issues",
    value: busiestProject.key,
    note: `${busiestProject.name}, ${busiestProject.issues} issues`,
  },
  {
    label: "Last update",
    value: formatDate(byRecency[0].updated),
    note: byRecency[0].name,
  },
];

export default function DashboardView() {
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your projects stand."
      />

      <Grid container spacing={1.5} component="section" aria-label="Summary">
        {summary.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" component="p">
                  {item.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ my: 0.25 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.note}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card component="section" aria-labelledby="recent-heading" sx={{ mt: 1.5 }}>
        <CardContent sx={{ pb: 0 }}>
          <Typography id="recent-heading" variant="h3" component="h2">
            Recently updated
          </Typography>
        </CardContent>
        <List disablePadding sx={{ pb: 0.5 }}>
          {byRecency.map((project) => (
            <ListItem key={project.key} disablePadding>
              <ListItemButton
                component={Link}
                href="/projects"
                sx={{ px: 2, gap: 1.5, borderRadius: 0 }}
                aria-label={`${project.name}, ${project.issues} issues, updated ${formatDate(project.updated)}`}
              >
                <Chip label={project.key} variant="outlined" sx={{ minWidth: 48, fontWeight: 600 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.status} · {formatDate(project.updated)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {project.issues} {project.issues === 1 ? "issue" : "issues"}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}
```

```tsx components/ProjectsView.tsx
"use client";

import { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "@/components/PageHeader";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

type StatusFilter = "All" | ProjectStatus;

const statusOptions: StatusFilter[] = ["All", "Active", "Paused", "Archived"];
const statusColor: Record<ProjectStatus, "primary" | "warning" | "default"> = {
  Active: "primary",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (status === "All" || project.status === status) &&
        `${project.key} ${project.name}`.toLowerCase().includes(needle),
    );
  }, [query, status]);

  return (
    <>
      <PageHeader title="Projects" description="Every project in the workspace, with its open issues." />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "flex-end", mb: 1 }}>
        <TextField
          id="project-filter"
          label="Filter projects"
          placeholder="Name or key"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 280px" }, my: 0 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          id="project-status"
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          sx={{ flex: { xs: "1 1 100%", sm: "0 0 160px" }, my: 0 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Typography role="status" variant="caption" color="text.secondary" sx={{ pb: 1 }}>
          Showing {filtered.length} of {projects.length} projects
        </Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table aria-label="Projects" sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell align="right">Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.key} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {project.key}
                  </TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <Chip label={project.status} color={statusColor[project.status]} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{project.issues}</TableCell>
                  <TableCell align="right">{formatDate(project.updated)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No projects match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
```

```tsx components/ReportsView.tsx
"use client";

import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PageHeader from "@/components/PageHeader";
import { projects, totalIssues } from "@/lib/data";

export default function ReportsView() {
  const ranked = [...projects].sort((a, b) => b.issues - a.issues);
  return (
    <>
      <PageHeader
        title="Reports"
        description={`Issues by project, ${totalIssues} in total.`}
      />
      <Card>
        <TableContainer>
          <Table aria-label="Issues by project" sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell align="right">Share</TableCell>
                <TableCell sx={{ width: "40%" }}>
                  <span style={{ position: "absolute", left: -9999 }}>Share as a bar</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranked.map((project) => {
                const share = totalIssues === 0 ? 0 : Math.round((project.issues / totalIssues) * 100);
                return (
                  <TableRow key={project.key}>
                    <TableCell component="th" scope="row">
                      {project.name}
                    </TableCell>
                    <TableCell align="right">{project.issues}</TableCell>
                    <TableCell align="right">{share}%</TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={share}
                        aria-label={`${project.name} share of issues`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
```

```tsx components/SettingsView.tsx
"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import { user } from "@/lib/data";

interface Notifications {
  digest: boolean;
  assigned: boolean;
  status: boolean;
}

const initialNotifications: Notifications = { digest: true, assigned: true, status: false };

export default function SettingsView() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notifications, setNotifications] = useState<Notifications>(initialNotifications);
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
    setNotifications(initialNotifications);
    setSaved(false);
  };

  return (
    <>
      <PageHeader title="Settings" description="Your profile and how Lumen contacts you." />

      <Box component="form" onSubmit={handleSubmit} onReset={handleReset} noValidate>
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent>
            <Typography id="profile-heading" variant="h3" component="h2" sx={{ mb: 1 }}>
              Profile
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-name"
                  label="Full name"
                  fullWidth
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    touch();
                  }}
                  autoComplete="name"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    touch();
                  }}
                  autoComplete="email"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-role"
                  label="Role"
                  fullWidth
                  value={user.role}
                  helperText="Only another owner can change your role."
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notifications-heading" sx={{ mt: 1.5 }}>
          <CardContent>
            <Typography id="notifications-heading" variant="h3" component="h2" sx={{ mb: 0.5 }}>
              Notifications
            </Typography>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ position: "absolute", left: -9999 }}>
                Email notifications
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.digest}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, digest: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Weekly summary email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.assigned}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, assigned: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Email me when an issue is assigned to me"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.status}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, status: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Email me when a project is paused or archived"
                />
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.5 }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Button type="reset" variant="outlined" color="secondary">
            Reset
          </Button>
          {saved && (
            <Alert severity="success" variant="outlined" role="status" sx={{ py: 0 }}>
              Settings saved.
            </Alert>
          )}
        </Box>
      </Box>
    </>
  );
}
```

```tsx app/page.tsx
import DashboardView from "@/components/DashboardView";

export default function Page() {
  return <DashboardView />;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import ReportsView from "@/components/ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsView />;
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import SettingsView from "@/components/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
```
