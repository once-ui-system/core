```tsx app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const serif = 'Georgia, "Times New Roman", serif';
const sans = "ui-sans-serif, system-ui, sans-serif";

// Cool slate neutrals.
const slate = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
};

const brand = "#0F766E";

const headingBase = { fontFamily: serif, fontWeight: 600, letterSpacing: 0 };

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand, contrastText: "#FFFFFF" },
        grey: slate,
        background: { default: slate[50], paper: "#FFFFFF" },
        text: { primary: slate[900], secondary: slate[600] },
        divider: slate[200],
      },
    },
    dark: {
      palette: {
        primary: { main: "#2DD4BF", contrastText: "#042F2E" },
        grey: slate,
        background: { default: slate[900], paper: slate[800] },
        text: { primary: slate[100], secondary: slate[400] },
        divider: slate[700],
      },
    },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: sans,
    fontSize: 13,
    h1: { ...headingBase, fontSize: "1.5rem", lineHeight: 1.25 },
    h2: { ...headingBase, fontSize: "1.25rem", lineHeight: 1.3 },
    h3: { ...headingBase, fontSize: "1.125rem", lineHeight: 1.3 },
    h4: { ...headingBase, fontSize: "1rem", lineHeight: 1.35 },
    h5: { ...headingBase, fontSize: "0.9375rem", lineHeight: 1.35 },
    h6: { ...headingBase, fontSize: "0.875rem", lineHeight: 1.35 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: { defaultProps: { size: "small", disableElevation: true } },
    MuiIconButton: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiToggleButton: { defaultProps: { size: "small" } },
    MuiToolbar: { defaultProps: { variant: "dense" } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiCardContent: {
      styleOverrides: { root: { padding: 12, "&:last-child": { paddingBottom: 12 } } },
    },
    MuiLink: { defaultProps: { underline: "hover" } },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 2 } },
    },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "6px 12px" },
        head: { fontWeight: 600 },
      },
    },
    MuiListItemButton: {
      defaultProps: { dense: true },
      styleOverrides: {
        root: ({ theme }) => {
          const channel = theme.vars?.palette.primary.mainChannel ?? "15 118 110";
          return {
            borderRadius: 2,
            paddingTop: 4,
            paddingBottom: 4,
            "&.Mui-selected": {
              backgroundColor: `rgba(${channel} / 0.12)`,
              color: (theme.vars || theme).palette.primary.main,
              "& .MuiListItemIcon-root": { color: "inherit" },
              "& .MuiListItemText-primary": { fontWeight: 600 },
            },
            "&.Mui-selected:hover": { backgroundColor: `rgba(${channel} / 0.18)` },
          };
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32 } } },
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

export const metadata: Metadata = { title: "Lumen" };

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
export interface Project {
  key: string;
  name: string;
  status: "Active" | "Paused" | "Archived";
  issues: number;
  updated: string;
}

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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { user } from "@/lib/data";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: <InsightsIcon fontSize="small" />,
    items: [
      { label: "Overview", href: "/", icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Reports", href: "/reports", icon: <DescriptionOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: <WorkOutlineIcon fontSize="small" />,
    items: [
      { label: "Projects", href: "/projects", icon: <FolderOutlinedIcon fontSize="small" /> },
      { label: "Settings", href: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
    ],
  },
];

const EXPANDED = 232;
const COLLAPSED = 52;

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Typography
      component="span"
      variant="h4"
      sx={{ color: "primary.main", fontSize: collapsed ? "1.125rem" : "1.25rem", lineHeight: 1 }}
    >
      {collapsed ? "L" : "Lumen"}
    </Typography>
  );
}

function NavList({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  if (collapsed) {
    return (
      <Box component="nav" aria-label="Primary" sx={{ px: 0.5, py: 1 }}>
        {NAV.map((group, gi) => (
          <React.Fragment key={group.id}>
            {gi > 0 && <Divider sx={{ my: 1 }} />}
            <List disablePadding aria-label={group.label}>
              {group.items.map((item) => (
                <Tooltip key={item.href} title={item.label} placement="right">
                  <ListItemButton
                    component={NextLink}
                    href={item.href}
                    selected={pathname === item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    aria-label={item.label}
                    onClick={onNavigate}
                    sx={{ justifyContent: "center", px: 0, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>{item.icon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </React.Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Primary" sx={{ px: 1, py: 1 }}>
      <List disablePadding>
        {NAV.map((group) => {
          const isOpen = open[group.id];
          const listId = `nav-group-${group.id}`;
          return (
            <li key={group.id}>
              <ListItemButton
                onClick={() => setOpen((s) => ({ ...s, [group.id]: !s[group.id] }))}
                aria-expanded={isOpen}
                aria-controls={listId}
              >
                <ListItemIcon>{group.icon}</ListItemIcon>
                <ListItemText
                  primary={group.label}
                  slotProps={{ primary: { variant: "overline", sx: { lineHeight: 1.8 } } }}
                />
                {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto">
                <List id={listId} disablePadding aria-label={group.label}>
                  {group.items.map((item) => (
                    <ListItemButton
                      key={item.href}
                      component={NextLink}
                      href={item.href}
                      selected={pathname === item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      onClick={onNavigate}
                      sx={{ pl: 3, mb: 0.25 }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </li>
          );
        })}
      </List>
    </Box>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const crumbs = React.useMemo(() => {
    for (const group of NAV) {
      const item = group.items.find((i) => i.href === pathname);
      if (item) return { group: group.label, page: item.label };
    }
    return { group: "Workspace", page: "Page" };
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "background.paper",
          color: "primary.main",
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? COLLAPSED : EXPANDED,
          flexShrink: 0,
          transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width: collapsed ? COLLAPSED : EXPANDED,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: collapsed ? "center" : "space-between",
            px: collapsed ? 0 : 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {!collapsed && <Brand collapsed={false} />}
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <IconButton
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <NavList collapsed={collapsed} pathname={pathname} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box" },
        }}
      >
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Brand collapsed={false} />
        </Toolbar>
        <NavList collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
            <Breadcrumbs aria-label="Breadcrumb" sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Lumen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {crumbs.group}
              </Typography>
              <Typography variant="body2" color="text.primary" aria-current="page" sx={{ fontWeight: 600 }}>
                {crumbs.page}
              </Typography>
            </Breadcrumbs>
            <Tooltip title={`${user.name}, ${user.role}`}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorEl)}
              >
                <Avatar
                  sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main", color: "primary.contrastText" }}
                >
                  {initials}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled dense sx={{ opacity: "1 !important", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem dense component={NextLink} href="/settings" onClick={() => setAnchorEl(null)}>
                Settings
              </MenuItem>
              <MenuItem dense onClick={() => setAnchorEl(null)}>
                Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          id="main"
          tabIndex={-1}
          sx={{ p: { xs: 2, md: 3 }, width: "100%", maxWidth: 1200, outline: "none" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx app/page.tsx
import { Fragment } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "@/lib/data";

const open = projects.reduce((n, p) => n + p.issues, 0);
const stats = [
  { label: "Active projects", value: projects.filter((p) => p.status === "Active").length },
  { label: "Open issues", value: open },
  { label: "Paused projects", value: projects.filter((p) => p.status === "Paused").length },
  { label: "Archived projects", value: projects.filter((p) => p.status === "Archived").length },
];

const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

export default function Page() {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Here is where your workspace stands across {projects.length} projects.
      </Typography>

      <Grid container spacing={1.5} component="section" aria-label="Summary">
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ mt: 0.5 }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 1.5 }}>
        <CardContent>
          <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
            Recently updated
          </Typography>
          {recent.map((p, i) => (
            <Fragment key={p.key}>
              {i > 0 && <Divider />}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", width: 40 }}>
                  {p.key}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {p.name}
                </Typography>
                <Chip label={p.status} variant="outlined" color={p.status === "Active" ? "primary" : "default"} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(p.updated)}
                </Typography>
              </Box>
            </Fragment>
          ))}
          <Box sx={{ mt: 1 }}>
            <Link component={NextLink} href="/projects" variant="body2">
              View all projects
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
```

```tsx app/reports/page.tsx
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { projects } from "@/lib/data";

const max = Math.max(...projects.map((p) => p.issues));

export default function Page() {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Reports
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Open issues by project.
      </Typography>
      <Card>
        <CardContent>
          {projects.map((p) => (
            <Box key={p.key} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
              <Typography variant="body2" sx={{ width: { xs: 110, sm: 160 }, flexShrink: 0 }}>
                {p.name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ flexGrow: 1, height: 6 }}
              />
              <Typography variant="body2" sx={{ width: 24, textAlign: "right" }}>
                {p.issues}
              </Typography>
            </Box>
          ))}
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
import InputAdornment from "@mui/material/InputAdornment";
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
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, projects } from "@/lib/data";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All");

  const rows = projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      `${p.key} ${p.name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {rows.length} of {projects.length} projects shown.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <TextField
          label="Search projects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 240 } }}
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
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {["All", "Active", "Paused", "Archived"].map((s) => (
            <MenuItem key={s} value={s} dense>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects">
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
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace" }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    variant="outlined"
                    color={p.status === "Active" ? "primary" : p.status === "Paused" ? "warning" : "default"}
                  />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                  No projects match your filters.
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
import MenuItem from "@mui/material/MenuItem";
import { useColorScheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

export default function Page() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [role, setRole] = React.useState(user.role);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Manage your profile, notifications and appearance.
      </Typography>

      <Box sx={{ display: "grid", gap: 1.5, maxWidth: 640 }}>
        <Card component="section" aria-labelledby="profile-h">
          <CardContent>
            <Typography id="profile-h" variant="h3" component="h2" sx={{ mb: 1.5 }}>
              Profile
            </Typography>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                setSaved(true);
              }}
              sx={{ display: "grid", gap: 1.5 }}
            >
              <TextField
                label="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                fullWidth
              />
              <TextField label="Email" value={user.email} fullWidth slotProps={{ input: { readOnly: true } }} />
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSaved(false);
                }}
                fullWidth
              >
                {["Owner", "Admin", "Member"].map((r) => (
                  <MenuItem key={r} value={r} dense>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button type="submit" variant="contained">
                  Save changes
                </Button>
                {saved && (
                  <Alert severity="success" role="status" sx={{ py: 0 }}>
                    Profile saved.
                  </Alert>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notif-h">
          <CardContent>
            <Typography id="notif-h" variant="h3" component="h2" sx={{ mb: 1 }}>
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly digest email"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Notify me when I am mentioned"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="look-h">
          <CardContent>
            <Typography id="look-h" variant="h3" component="h2" sx={{ mb: 1 }}>
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={mode ?? "light"}
              onChange={(_, v: "light" | "dark" | "system" | null) => {
                if (v) setMode(v);
              }}
              aria-label="Color theme"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
```
