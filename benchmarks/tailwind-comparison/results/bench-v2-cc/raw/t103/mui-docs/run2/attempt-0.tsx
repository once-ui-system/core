```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";
const BRAND = "#E8590C";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" } as const;

// Lumen: technical and focused. Brand orange on warm stone neutrals, 4px corners,
// monospace headings. Everything is carried by tokens, not per-element styles.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND, dark: "#C2410C", contrastText: "#1c1917" },
        background: { default: "#fafaf9", paper: "#ffffff" },
        text: { primary: "#1c1917", secondary: "#57534e" },
        divider: "#e7e5e4",
        grey: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: BRAND, dark: "#C2410C", light: "#F4722B", contrastText: "#1c1917" },
        background: { default: "#1c1917", paper: "#262321" },
        text: { primary: "#fafaf9", secondary: "#a8a29e" },
        divider: "#44403c",
        grey: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: { ...heading, fontSize: "2rem" },
    h2: { ...heading, fontSize: "1.625rem" },
    h3: { ...heading, fontSize: "1.375rem" },
    h4: { ...heading, fontSize: "1.25rem" },
    h5: { ...heading, fontSize: "1.0625rem" },
    h6: { ...heading, fontSize: "0.9375rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: "2px",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        containedPrimary: { "&:hover": { backgroundColor: "#F4722B" } },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme: t }) => ({
          color: "var(--mui-palette-primary-main)",
          ...t.applyStyles("light", { color: "#C2410C" }),
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-selected": {
            color: "var(--mui-palette-primary-main)",
            backgroundColor: "rgba(232, 89, 12, 0.16)",
            "&:hover": { backgroundColor: "rgba(232, 89, 12, 0.24)" },
            ...t.applyStyles("light", { color: "#C2410C" }),
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: MONO, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" },
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
import AppShell from "../components/AppShell";
import theme from "./theme";

export const metadata: Metadata = { title: "Lumen" };

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
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx components/nav-config.tsx
import type { ReactNode } from "react";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";
import SummarizeOutlined from "@mui/icons-material/SummarizeOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: <SpaceDashboardOutlined fontSize="small" /> },
      { label: "Reports", href: "/reports", icon: <SummarizeOutlined fontSize="small" /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <FolderOutlined fontSize="small" /> },
      { label: "Settings", href: "/settings", icon: <SettingsOutlined fontSize="small" /> },
    ],
  },
];

export function crumbsFor(pathname: string): string[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return [group.label, item.label];
    }
  }
  return [];
}
```

```tsx components/SideNav.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Bolt from "@mui/icons-material/Bolt";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { navGroups } from "./nav-config";

interface SideNavProps {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function SideNav({ pathname, collapsed = false, onNavigate }: SideNavProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 64,
          px: collapsed ? 0 : 2.5,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <Bolt color="primary" aria-hidden />
        {!collapsed && (
          <Typography variant="h5" component="span">
            Lumen
          </Typography>
        )}
      </Box>
      <Divider />
      <List component="nav" aria-label="Main navigation" sx={{ px: 1, py: 1.5, flex: 1 }}>
        {navGroups.map((group, index) => {
          const expanded = collapsed || open[group.id];
          const listId = `nav-group-${group.id}`;
          return (
            <Box key={group.id} component="div" sx={{ mb: 1 }}>
              {collapsed ? (
                index > 0 && <Divider sx={{ my: 1 }} />
              ) : (
                <ListItemButton
                  onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  aria-expanded={expanded}
                  aria-controls={listId}
                  sx={{ px: 1.5, py: 0.5 }}
                >
                  <ListItemText
                    primary={group.label}
                    slotProps={{
                      primary: {
                        variant: "caption",
                        sx: {
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.secondary",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                  {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
              )}
              <Collapse in={expanded} timeout="auto">
                <List component="div" id={listId} disablePadding>
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const button = (
                      <ListItemButton
                        key={item.href}
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        sx={{
                          minHeight: 40,
                          mb: 0.25,
                          px: 1.5,
                          pl: collapsed ? 1.5 : 2.5,
                          justifyContent: collapsed ? "center" : "flex-start",
                        }}
                      >
                        <ListItemIcon
                          sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={item.label}
                            slotProps={{
                              primary: { variant: "body2", sx: { fontWeight: active ? 600 : 400 } },
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                    return collapsed ? (
                      <Tooltip key={item.href} title={item.label} placement="right">
                        {button}
                      </Tooltip>
                    ) : (
                      button
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/icons-material/Menu";
import MenuOpen from "@mui/icons-material/MenuOpen";
import SideNav from "./SideNav";
import { crumbsFor } from "./nav-config";
import { user } from "../lib/data";

const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 68;

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const crumbs = crumbsFor(pathname);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width,
            overflowX: "hidden",
            boxSizing: "border-box",
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          },
        }}
      >
        <SideNav pathname={pathname} collapsed={collapsed} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SideNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: 1,
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <Menu />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <Menu /> : <MenuOpen />}
            </IconButton>

            <Breadcrumbs aria-label="Breadcrumb" sx={{ flex: 1, minWidth: 0 }}>
              <MuiLink component={Link} href="/">
                Lumen
              </MuiLink>
              {crumbs.map((crumb, i) =>
                i === crumbs.length - 1 ? (
                  <Typography key={crumb} color="text.primary" aria-current="page" noWrap>
                    {crumb}
                  </Typography>
                ) : (
                  <Typography key={crumb} color="text.secondary" noWrap>
                    {crumb}
                  </Typography>
                ),
              )}
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <Avatar
                alt={user.name}
                sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14, fontWeight: 700 }}
              >
                {initials(user.name)}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flex: 1, width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 }, outline: "none" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx app/page.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const archived = projects.filter((p) => p.status === "Archived").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

  const stats = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused", value: paused, note: "waiting to resume" },
    { label: "Archived", value: archived, note: "read-only" },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Signed in as {user.email}. Here is where your projects stand.
      </Typography>

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
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h3" component="p" sx={{ my: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography id="recent-heading" variant="h4" component="h2">
              Recently updated
            </Typography>
            <Button component={Link} href="/projects" variant="contained">
              View all projects
            </Button>
          </Box>
          <List disablePadding sx={{ mt: 1 }}>
            {recent.map((p) => (
              <ListItem
                key={p.key}
                divider
                disableGutters
                secondaryAction={
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(p.updated)}
                  </Typography>
                }
                sx={{ pr: 14 }}
              >
                <Chip label={p.key} size="small" variant="outlined" sx={{ mr: 2, fontFamily: "ui-monospace, monospace" }} />
                <ListItemText primary={p.name} secondary={`${p.issues} open issues`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatDate, projects, type ProjectStatus } from "../../lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
  );

  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {projects.length} projects in your workspace.
      </Typography>

      <TextField
        label="Filter projects"
        placeholder="Name or key"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, width: { xs: "100%", sm: 320 } }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Open issues</TableCell>
              <TableCell>Last updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 600 }}>
                  {p.key}
                </TableCell>
                <TableCell component="th" scope="row">
                  {p.name}
                </TableCell>
                <TableCell>
                  <Chip label={p.status} size="small" color={statusColor[p.status]} variant="outlined" />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No projects match "{query}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Reports
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Open issues by project.
      </Typography>
      <Card>
        <CardContent sx={{ display: "grid", gap: 2.5 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  {p.key} · {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.issues}
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
    </Box>
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
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [saved, setSaved] = React.useState(false);
  const [notify, setNotify] = React.useState({ assigned: true, digest: true, product: false });

  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile, appearance and notifications.
      </Typography>

      <Box sx={{ display: "grid", gap: 3, maxWidth: 720 }}>
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              setSaved(true);
            }}
            sx={{ display: "grid", gap: 2 }}
          >
            <Typography id="profile-heading" variant="h4" component="h2">
              Profile
            </Typography>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              autoComplete="name"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              autoComplete="email"
              fullWidth
            />
            <TextField label="Role" value={user.role} disabled fullWidth />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Button type="submit" variant="contained">
                Save changes
              </Button>
              {saved && (
                <Alert severity="success" role="status" sx={{ py: 0 }}>
                  Profile saved.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="appearance-heading" variant="h4" component="h2">
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={mode ?? null}
              onChange={(_, value) => {
                if (value) setMode(value);
              }}
              aria-label="Color mode"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h4" component="h2">
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
                    checked={notify.product}
                    onChange={(e) => setNotify((n) => ({ ...n, product: e.target.checked }))}
                  />
                }
                label="Product updates and release notes"
              />
            </FormGroup>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
```
