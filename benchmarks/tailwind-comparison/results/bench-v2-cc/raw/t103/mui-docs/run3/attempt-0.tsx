```tsx app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const SANS = "ui-sans-serif, system-ui, sans-serif";
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const BRAND = "#E8590C";
const BRAND_DARK = "#C2410C";
const BRAND_LIGHT = "#F97316";
const ON_BRAND = "#1C1917";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" };

// Lumen: a control room for engineers. Brand orange on warm stone neutrals,
// 4px corners, monospace headings, dark by default.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: BRAND, light: BRAND_LIGHT, dark: BRAND_DARK, contrastText: ON_BRAND },
        background: { default: "#1C1917", paper: "#292524" },
        divider: "#44403C",
        text: { primary: "#FAFAF9", secondary: "#A8A29E" },
        grey: {
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
        },
      },
    },
    light: {
      palette: {
        primary: { main: BRAND, light: BRAND_LIGHT, dark: BRAND_DARK, contrastText: ON_BRAND },
        background: { default: "#FAFAF9", paper: "#FFFFFF" },
        divider: "#D6D3D1",
        text: { primary: "#1C1917", secondary: "#57534E" },
        grey: {
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
        },
      },
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: { ...heading, fontSize: "2rem" },
    h2: { ...heading, fontSize: "1.75rem" },
    h3: { ...heading, fontSize: "1.5rem" },
    h4: { ...heading, fontSize: "1.375rem" },
    h5: { ...heading, fontSize: "1.125rem" },
    h6: { ...heading, fontSize: "1rem" },
    overline: { fontFamily: MONO, letterSpacing: "0.08em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiLink: { defaultProps: { underline: "always" } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&:focus-visible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => {
          const p = (t.vars || t).palette.primary;
          return {
            "&.Mui-selected": {
              backgroundColor: p.main,
              color: p.contrastText,
              "&:hover": { backgroundColor: p.dark },
            },
            "&.Mui-focusVisible": {
              outline: `2px solid ${p.main}`,
              outlineOffset: 2,
            },
          };
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.04em", textTransform: "uppercase" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontFamily: MONO, fontSize: "0.75rem" } } },
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
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="dark" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="dark">
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

export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

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

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx lib/nav.ts
import type { ElementType } from "react";
import AnalyticsOutlined from "@mui/icons-material/AnalyticsOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";

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
    icon: AnalyticsOutlined,
    items: [
      { label: "Overview", href: "/", icon: SpaceDashboardOutlined },
      { label: "Reports", href: "/reports", icon: AssessmentOutlined },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderOutlined,
    items: [
      { label: "Projects", href: "/projects", icon: FolderOutlined },
      { label: "Settings", href: "/settings", icon: SettingsOutlined },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumbs(pathname: string): { group: string; page: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return null;
}
```

```tsx components/Sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { user } from "../lib/data";
import { isActive, navGroups, type NavItem } from "../lib/nav";

export const DRAWER_WIDTH = 248;
export const DRAWER_WIDTH_COLLAPSED = 68;

function NavLink({
  item,
  active,
  collapsed,
  nested,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  nested: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const button = (
    <ListItemButton
      component={Link}
      href={item.href}
      selected={active}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      sx={{
        minHeight: 40,
        mx: 1,
        my: 0.25,
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 1 : 2,
        pl: nested && !collapsed ? 4 : undefined,
      }}
    >
      <ListItemIcon
        sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, justifyContent: "center", color: "inherit" }}
      >
        <Icon fontSize="small" />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText primary={item.label} slotProps={{ primary: { variant: "body2" } }} />
      )}
    </ListItemButton>
  );
  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export default function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ display: "flex", flexDirection: "column", height: "100%", overflowX: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          height: 64,
          px: collapsed ? 0 : 2.5,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
          }}
        >
          L
        </Box>
        {!collapsed && (
          <Typography variant="h6" component="span" sx={{ letterSpacing: "0.12em" }}>
            LUMEN
          </Typography>
        )}
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
        {navGroups.map((group, index) => {
          const isOpen = open[group.id] ?? true;
          if (collapsed) {
            return (
              <React.Fragment key={group.id}>
                {index > 0 && <Divider sx={{ my: 1, mx: 1.5 }} />}
                <List disablePadding aria-label={group.label}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed
                      nested={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </List>
              </React.Fragment>
            );
          }
          return (
            <List key={group.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setOpen((o) => ({ ...o, [group.id]: !isOpen }))}
                aria-expanded={isOpen}
                aria-controls={`nav-group-${group.id}`}
                sx={{ mx: 1, px: 2, minHeight: 36 }}
              >
                <ListItemText
                  primary={group.label}
                  slotProps={{
                    primary: { variant: "overline", color: "text.secondary", lineHeight: 2 },
                  }}
                />
                {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto">
                <List id={`nav-group-${group.id}`} component="div" disablePadding>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed={false}
                      nested
                      onNavigate={onNavigate}
                    />
                  ))}
                </List>
              </Collapse>
            </List>
          );
        })}
      </Box>

      <Divider />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Tooltip title={collapsed ? `${user.name}, ${user.role}` : ""} placement="right">
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14 }}>
            MO
          </Avatar>
        </Tooltip>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {user.role}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { findCrumbs } from "../lib/nav";
import SidebarContent, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = findCrumbs(pathname);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = mode === "system" ? systemMode : mode;
  const isLight = resolved === "light";

  const width = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
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
          width,
          flexShrink: 0,
          transition: (t) =>
            t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
            transition: (t) =>
              t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            overflowX: "hidden",
          },
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: "background.default",
            backgroundImage: "none",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((c) => !c)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>

            <Breadcrumbs aria-label="Breadcrumb" sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Lumen
              </Typography>
              {crumbs && (
                <Typography variant="body2" color="text.secondary">
                  {crumbs.group}
                </Typography>
              )}
              {crumbs && (
                <Typography variant="body2" color="text.primary" aria-current="page" noWrap>
                  {crumbs.page}
                </Typography>
              )}
            </Breadcrumbs>

            <Tooltip title={isLight ? "Switch to dark theme" : "Switch to light theme"}>
              <IconButton
                aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
                onClick={() => setMode(isLight ? "dark" : "light")}
              >
                {isLight ? <DarkModeOutlined /> : <LightModeOutlined />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 1200, width: "100%", mx: "auto", outline: "none" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/PageHeader.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom={Boolean(description)}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions}
    </Box>
  );
}
```

```tsx app/page.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeader from "../components/PageHeader";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Active projects", value: String(active), note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: String(openIssues), note: "across all projects" },
    { label: "Paused", value: String(paused), note: "Mobile beta is waiting on review" },
    { label: "Last activity", value: formatDate(latest[0].updated), note: `${latest[0].name} (${latest[0].key})` },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where things stand across Acme Labs. Open issues are counted per project."
      />

      <Box
        component="section"
        aria-label="Summary"
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          mb: 3,
        }}
      >
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" component="h2">
                {c.label}
              </Typography>
              <Typography variant="h4" component="p" sx={{ my: 0.5 }}>
                {c.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2 }}>
            <Typography id="recent-heading" variant="h6" component="h2">
              Recently updated
            </Typography>
            <MuiLink component={Link} href="/projects" variant="body2">
              View all projects
            </MuiLink>
          </Box>
          <List disablePadding>
            {latest.slice(0, 4).map((p) => (
              <ListItem
                key={p.key}
                divider
                disableGutters
                secondaryAction={<Chip size="small" variant="outlined" label={`${p.issues} issues`} />}
              >
                <ListItemText
                  primary={`${p.key} · ${p.name}`}
                  secondary={`Updated ${formatDate(p.updated)}`}
                  sx={{ pr: 10 }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PageHeader from "../../components/PageHeader";
import { formatDate, projects, type ProjectStatus } from "../../lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | ProjectStatus>("All");

  const rows = projects.filter((p) => {
    const q = query.trim().toLowerCase();
    const matches = !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
    return matches && (status === "All" || p.status === status);
  });

  return (
    <>
      <PageHeader title="Projects" description="Every project in the Acme Labs workspace and where it stands." />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          label="Search projects"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: "1 1 220px", maxWidth: { sm: 320 } }}
        />
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value as "All" | ProjectStatus)}
          sx={{ flex: "0 1 160px", minWidth: 140 }}
        >
          {["All", "Active", "Paused", "Archived"].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Issues</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.key}</TableCell>
                <TableCell component="th" scope="row">
                  {p.name}
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" color={statusColor[p.status]} label={p.status} />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No projects match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageHeader from "../../components/PageHeader";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <>
      <PageHeader title="Reports" description="Open issues by project, scaled to the busiest one." />
      <Card>
        <CardContent sx={{ display: "grid", gap: 2.5 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  {p.key} · {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.issues} open
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PageHeader from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [notify, setNotify] = React.useState({
    assigned: true,
    digest: true,
    releases: false,
  });
  const [saved, setSaved] = React.useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Your profile, appearance and notifications." />

      <Box
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          setSaved(true);
        }}
        sx={{ display: "grid", gap: 3, maxWidth: 720 }}
      >
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="profile-heading" variant="h6" component="h2">
              Profile
            </Typography>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={user.email} fullWidth slotProps={{ input: { readOnly: true } }} />
            <TextField label="Role" value={user.role} fullWidth disabled />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="appearance-heading" variant="h6" component="h2">
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-label="Color theme"
              value={mode ?? "dark"}
              onChange={(_, value: "light" | "dark" | "system" | null) => {
                if (value) setMode(value);
              }}
            >
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h6" component="h2">
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.assigned}
                    onChange={(e) => setNotify((n) => ({ ...n, assigned: e.target.checked }))}
                  />
                }
                label="Email me when an issue is assigned to me"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.digest}
                    onChange={(e) => setNotify((n) => ({ ...n, digest: e.target.checked }))}
                  />
                }
                label="Send a weekly project digest"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.releases}
                    onChange={(e) => setNotify((n) => ({ ...n, releases: e.target.checked }))}
                  />
                }
                label="Announce product releases"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
        </Box>
      </Box>

      <Snackbar open={saved} autoHideDuration={4000} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Settings saved.
        </Alert>
      </Snackbar>
    </>
  );
}
```
