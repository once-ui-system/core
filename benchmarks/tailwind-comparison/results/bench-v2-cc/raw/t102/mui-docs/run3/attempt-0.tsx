```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const bodyFont = "ui-sans-serif, system-ui, sans-serif";
const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const RADIUS = 16;

const heading = (fontWeight: number) => ({ fontFamily: headingFont, fontWeight, letterSpacing: "-0.01em" });

// Lumen: friendly, upbeat, airy. Brand pink #DB2777, warm sand neutrals, 16px corners.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#DB2777", dark: "#BE185D", light: "#F472B6", contrastText: "#FFFFFF" },
        secondary: { main: "#7A5E3E", contrastText: "#FFFFFF" },
        background: { default: "#F8F2E9", paper: "#FFFCF7" },
        text: { primary: "#33281E", secondary: "#6B5A47" },
        divider: "#E6D9C6",
      },
    },
    dark: {
      palette: {
        primary: { main: "#F472B6", dark: "#DB2777", light: "#F9A8D4", contrastText: "#2A0A18" },
        secondary: { main: "#D9BE98", contrastText: "#241E17" },
        background: { default: "#19140F", paper: "#241E17" },
        text: { primary: "#F6EDE0", secondary: "#C9B9A2" },
        divider: "#3D3326",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: bodyFont,
    h1: { ...heading(800), fontSize: "2.5rem", lineHeight: 1.15 },
    h2: { ...heading(800), fontSize: "2rem", lineHeight: 1.2 },
    h3: { ...heading(700), fontSize: "1.65rem", lineHeight: 1.25 },
    h4: { ...heading(700), fontSize: "1.4rem", lineHeight: 1.3 },
    h5: { ...heading(700), fontSize: "1.2rem", lineHeight: 1.35 },
    h6: { ...heading(700), fontSize: "1.05rem", lineHeight: 1.4 },
    button: { fontFamily: bodyFont, fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":focus-visible": {
          outline: "3px solid var(--mui-palette-primary-main)",
          outlineOffset: "2px",
        },
      },
    },
    MuiLink: {
      defaultProps: { color: "primary", underline: "hover" },
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS, minHeight: 48, padding: "10px 26px", fontSize: "1rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIUS, padding: 12 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: RADIUS, backgroundColor: "var(--mui-palette-background-paper)" },
        input: { padding: "16px 18px" },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: RADIUS, border: "1px solid var(--mui-palette-divider)", boxShadow: "none" },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 28, "&:last-child": { paddingBottom: 28 } } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48, borderRadius: 12 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 56,
          paddingLeft: 16,
          paddingRight: 16,
          "&.Mui-selected": {
            backgroundColor: "var(--mui-palette-primary-main)",
            color: "var(--mui-palette-primary-contrastText)",
            "&:hover": { backgroundColor: "var(--mui-palette-primary-dark)" },
            "& .MuiListItemIcon-root": { color: "inherit" },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 48 } } },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 12, fontWeight: 600, height: 32 } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 12, fontSize: "0.85rem", padding: "8px 14px" } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "20px 24px" },
        head: { fontWeight: 700, color: "var(--mui-palette-text-secondary)" },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { borderRadius: 0 } } },
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

export const metadata: Metadata = {
  title: "Lumen",
  description: "Lumen, product analytics and issue tracking for small software teams.",
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
export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return formatter.format(new Date(`${iso}T00:00:00Z`));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```tsx lib/nav.ts
import type { SvgIconComponent } from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FolderIcon from "@mui/icons-material/Folder";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";

export type NavItem = { label: string; href: string; icon: SvgIconComponent };
export type NavGroup = { id: string; label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: InsightsIcon },
      { label: "Reports", href: "/reports", icon: AssessmentIcon },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderIcon },
      { label: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumb(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
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
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { initials, user } from "../lib/data";
import { findCrumb, isActive, navGroups, type NavItem } from "../lib/nav";

const FULL_WIDTH = 288;
const MINI_WIDTH = 96;
const EASE = "width 200ms ease";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: collapsed ? 0 : 3,
        justifyContent: collapsed ? "center" : "flex-start",
        minHeight: 80,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          borderRadius: 4,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          placeItems: "center",
          fontFamily: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        L
      </Box>
      {!collapsed && (
        <Typography variant="h5" component="span" sx={{ fontWeight: 800 }}>
          Lumen
        </Typography>
      )}
    </Box>
  );
}

function NavLink({
  item,
  collapsed,
  nested,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(item.href, pathname);
  const Icon = item.icon;
  const button = (
    <ListItemButton
      component={Link}
      href={item.href}
      selected={active}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      sx={{ justifyContent: collapsed ? "center" : "flex-start", pl: nested && !collapsed ? 3 : undefined }}
    >
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 48, color: "inherit" }}>
        <Icon />
      </ListItemIcon>
      {!collapsed && <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: 600 } }} />}
    </ListItemButton>
  );
  return (
    <li>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </li>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Box component="nav" aria-label="Main" sx={{ px: 2, pb: 3 }}>
      {navGroups.map((group, index) => {
        if (collapsed) {
          return (
            <React.Fragment key={group.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <List aria-label={group.label} disablePadding sx={{ display: "grid", gap: 0.5 }}>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed onNavigate={onNavigate} />
                ))}
              </List>
            </React.Fragment>
          );
        }
        const expanded = open[group.id];
        const listId = `nav-group-${group.id}`;
        return (
          <Box key={group.id} sx={{ mb: 1.5 }}>
            <ListItemButton
              onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              aria-expanded={expanded}
              aria-controls={listId}
              sx={{ minHeight: 48 }}
            >
              <ListItemText
                primary={group.label}
                slotProps={{
                  primary: {
                    variant: "overline",
                    fontWeight: 700,
                    color: "text.secondary",
                    sx: { letterSpacing: "0.08em" },
                  },
                }}
              />
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <List id={listId} aria-label={group.label} disablePadding sx={{ display: "grid", gap: 0.5 }}>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={false} nested onNavigate={onNavigate} />
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const crumb = findCrumb(pathname);
  const width = collapsed ? MINI_WIDTH : FULL_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          top: 12,
          zIndex: 2000,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 3,
          py: 1.5,
          borderRadius: 4,
          fontWeight: 700,
          "&:focus": { left: 16 },
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
          transition: EASE,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: EASE,
            bgcolor: "background.paper",
            borderRight: "1px solid var(--mui-palette-divider)",
          },
        }}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 300, maxWidth: "85vw", boxSizing: "border-box", bgcolor: "background.paper" },
        }}
      >
        <Brand collapsed={false} />
        <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: "background.default",
            color: "text.primary",
            borderBottom: "1px solid var(--mui-palette-divider)",
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 72, md: 80 }, gap: 1.5, px: { xs: 2, md: 4 } }}>
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
            <Breadcrumbs aria-label="Breadcrumb" sx={{ flex: 1, minWidth: 0 }}>
              {crumb && (
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  {crumb.group.label}
                </Typography>
              )}
              <Typography color="text.primary" aria-current="page" sx={{ fontWeight: 700 }}>
                {crumb ? crumb.item.label : "Lumen"}
              </Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <Avatar
                alt={user.name}
                sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 48, height: 48, fontWeight: 700 }}
              >
                {initials(user.name)}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          id="main"
          tabIndex={-1}
          sx={{ flex: 1, width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2.5, sm: 4, md: 6 }, outline: "none" }}
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: active.map((p) => p.key).join(", ") },
    { label: "Busiest project", value: busiest.name, note: `${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Box sx={{ display: "grid", gap: 5 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Welcome back, {user.name.split(" ")[0]}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Your team has {openIssues} open issues today. Here is how things look across your workspace.
        </Typography>
      </Box>

      <Box
        component="section"
        aria-label="Summary"
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                {card.label}
              </Typography>
              <Typography variant="h3" component="p" sx={{ mt: 1, color: "primary.main", fontSize: "1.9rem" }}>
                {card.value}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {card.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Typography id="recent-heading" variant="h4" component="h2">
            Recently updated
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 2, display: "grid" }}>
            {[...projects]
              .sort((a, b) => b.updated.localeCompare(a.updated))
              .slice(0, 3)
              .map((p) => (
                <Box
                  component="li"
                  key={p.key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderTop: "1px solid var(--mui-palette-divider)",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {p.name}{" "}
                    <Typography component="span" color="text.secondary">
                      ({p.key})
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">{formatDate(p.updated)}</Typography>
                </Box>
              ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            <MuiLink component={Link} href="/projects">
              See all projects
            </MuiLink>
          </Box>
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
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, projects, type ProjectStatus } from "../../lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const term = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) => !term || p.name.toLowerCase().includes(term) || p.key.toLowerCase().includes(term),
  );

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Projects
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Every project your team tracks in Lumen.
        </Typography>
      </Box>

      <TextField
        label="Search projects"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden />
              </InputAdornment>
            ),
          },
        }}
      />

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 640 }}>
            <caption style={{ position: "absolute", left: -9999 }}>Projects and their open issues</caption>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Open issues</TableCell>
                <TableCell>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.key} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{p.key}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color={statusColor[p.status]} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{p.issues}</TableCell>
                  <TableCell>{formatDate(p.updated)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      No projects match &ldquo;{query}&rdquo;.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
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
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Reports
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Open issues by project.
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ display: "grid", gap: 3 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                <Typography color="text.secondary">{p.issues} open</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ height: 12, borderRadius: 3 }}
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
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Your profile, notifications and appearance.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          setSaved(true);
        }}
        sx={{ display: "grid", gap: 3, maxWidth: 720 }}
      >
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent sx={{ display: "grid", gap: 3 }}>
            <Typography id="profile-heading" variant="h4" component="h2">
              Profile
            </Typography>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField label="Role" value={user.role} fullWidth disabled helperText="Only workspace owners can change roles." />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h4" component="h2">
              Notifications
            </Typography>
            <FormControlLabel
              control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
              label="Weekly digest of project activity"
              sx={{ py: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
              label="Email me when I am mentioned"
              sx={{ py: 1 }}
            />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 3 }}>
            <Typography id="appearance-heading" variant="h4" component="h2">
              Appearance
            </Typography>
            <TextField
              select
              label="Theme"
              value={mode ?? "light"}
              onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
              fullWidth
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">Match my device</MenuItem>
            </TextField>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained" size="large">
            Save changes
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={() => setSaved(false)}
        message="Settings saved"
      />
    </Box>
  );
}
```
