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
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const HEADING_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = "ui-sans-serif, system-ui, sans-serif";
const RADIUS = 2;

const heading = { fontFamily: HEADING_FONT, fontWeight: 600, letterSpacing: "-0.005em" };

// Lumen: calm, exact, trustworthy. Teal brand, cool slate neutrals, 2px corners, compact density.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0F766E", dark: "#115E59", light: "#14B8A6", contrastText: "#FFFFFF" },
        secondary: { main: "#475569" },
        background: { default: "#F8FAFC", paper: "#FFFFFF" },
        text: { primary: "#0F172A", secondary: "#475569" },
        divider: "#E2E8F0",
        grey: {
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
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#2DD4BF", dark: "#14B8A6", light: "#5EEAD4", contrastText: "#042F2E" },
        secondary: { main: "#94A3B8" },
        background: { default: "#0B1220", paper: "#111A2B" },
        text: { primary: "#F1F5F9", secondary: "#A5B4C8" },
        divider: "#26334A",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  spacing: 8,
  typography: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    h1: { ...heading, fontSize: "1.75rem" },
    h2: { ...heading, fontSize: "1.5rem" },
    h3: { ...heading, fontSize: "1.3rem" },
    h4: { ...heading, fontSize: "1.2rem" },
    h5: { ...heading, fontSize: "1.1rem" },
    h6: { ...heading, fontSize: "1rem" },
    subtitle1: { fontSize: "0.9rem" },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600 },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8125rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${(t.vars || t).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { size: "small", disableElevation: true },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiIconButton: { defaultProps: { size: "small" }, styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiInputBase: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: (t.vars || t).palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiCheckbox: { defaultProps: { size: "small" } },
    MuiChip: { defaultProps: { size: "small" }, styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiLink: { defaultProps: { underline: "hover", color: "primary" } },
    MuiPaper: { styleOverrides: { root: { borderRadius: RADIUS, backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 12, "&:last-child": { paddingBottom: 12 } } },
    },
    MuiCardHeader: { styleOverrides: { root: { padding: "10px 12px" } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { defaultProps: { dense: true } },
    MuiList: { defaultProps: { dense: true } },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "4px 12px" },
        head: { fontWeight: 600, whiteSpace: "nowrap" },
      },
    },
    MuiToolbar: { defaultProps: { variant: "dense" } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: RADIUS } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, color: "inherit" } } },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          paddingTop: 3,
          paddingBottom: 3,
          "&.Mui-selected": {
            backgroundColor: (t.vars || t).palette.primary.main,
            color: (t.vars || t).palette.primary.contrastText,
            "&:hover": { backgroundColor: (t.vars || t).palette.primary.dark },
          },
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
import MuiLink from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsightsIcon from "@mui/icons-material/Insights";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { user } from "@/lib/data";

const EXPANDED_WIDTH = 224;
const COLLAPSED_WIDTH = 52;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Reports", href: "/reports", icon: <AssessmentOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <FolderOutlinedIcon fontSize="small" /> },
      { label: "Settings", href: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Box component="nav" aria-label="Main" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ gap: 1, px: collapsed ? 1.25 : 2, minHeight: 48 }}>
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "2px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <InsightsIcon sx={{ fontSize: 18 }} />
        </Box>
        {!collapsed && (
          <Typography variant="h6" component="span" sx={{ fontSize: "1.15rem" }}>
            Lumen
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 1 }}>
        {navGroups.map((group, gi) => {
          const expanded = collapsed || open[group.id];
          return (
            <Box key={group.id} sx={{ mb: 0.5 }}>
              {collapsed ? (
                gi > 0 && <Divider sx={{ my: 0.75 }} />
              ) : (
                <ListItemButton
                  onClick={() => setOpen((o) => ({ ...o, [group.id]: !o[group.id] }))}
                  aria-expanded={Boolean(open[group.id])}
                  aria-controls={`nav-group-${group.id}`}
                  sx={{ color: "text.secondary", mt: gi > 0 ? 1 : 0 }}
                >
                  <ListItemText
                    primary={group.label}
                    slotProps={{
                      primary: {
                        variant: "caption",
                        sx: { fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
                      },
                    }}
                  />
                  {open[group.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>
              )}
              <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
                <List id={`nav-group-${group.id}`} disablePadding aria-label={group.label}>
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const button = (
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        sx={{ mb: 0.25, justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 1 : 1.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32 }}>{item.icon}</ListItemIcon>
                        {!collapsed && <ListItemText primary={item.label} />}
                      </ListItemButton>
                    );
                    return (
                      <Box component="li" key={item.href} sx={{ listStyle: "none" }}>
                        {collapsed ? (
                          <Tooltip title={`${group.label}: ${item.label}`} placement="right">
                            {button}
                          </Tooltip>
                        ) : (
                          button
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: false });
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const current = React.useMemo(() => {
    for (const group of navGroups) {
      const item = group.items.find((i) => isActive(pathname, i.href));
      if (item) return { group: group.label, label: item.label };
    }
    return { group: "Lumen", label: "Page" };
  }, [pathname]);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const paperSx = {
    width,
    boxSizing: "border-box",
    borderRight: 1,
    borderColor: "divider",
    overflowX: "hidden",
    transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
  } as const;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <MuiLink
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "background.paper",
          px: 1.5,
          py: 0.75,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </MuiLink>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <NavContent pathname={pathname} collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen && !isDesktop}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <NavContent pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}
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
              {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
            <Breadcrumbs aria-label="Breadcrumb" sx={{ flex: 1, minWidth: 0, fontSize: "0.8125rem" }}>
              <MuiLink component={Link} href="/" color="text.secondary" underline="hover">
                Lumen
              </MuiLink>
              <Typography variant="body2" color="text.secondary">
                {current.group}
              </Typography>
              <Typography variant="body2" color="text.primary" aria-current="page" sx={{ fontWeight: 600 }}>
                {current.label}
              </Typography>
            </Breadcrumbs>
            <Tooltip title={`${user.name} (${user.role})`}>
              <Avatar
                alt={user.name}
                sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "primary.main", color: "primary.contrastText" }}
              >
                MO
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, p: { xs: 2, md: 3 }, outline: "none" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/PageHeading.tsx
"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 1, mb: 2 }}>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
```

```tsx app/page.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const count = (s: string) => projects.filter((p) => p.status === s).length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const summaries = [
    { label: "Open issues", value: openIssues, note: `Across ${projects.length} projects` },
    { label: "Active projects", value: count("Active"), note: `${count("Paused")} paused` },
    { label: "Archived", value: count("Archived"), note: "No open issues" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open` },
  ];

  return (
    <Box>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here is where your workspace stands today."
      />
      <Box
        component="ul"
        aria-label="Summary"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {summaries.map((s) => (
          <li key={s.label}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </Typography>
                <Typography variant="h3" component="p" sx={{ my: 0.25 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.note}
                </Typography>
              </CardContent>
            </Card>
          </li>
        ))}
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h2">
              Recent activity
            </Typography>
          }
          action={
            <MuiLink component={Link} href="/projects" variant="body2">
              All projects
            </MuiLink>
          }
        />
        <Divider />
        <List disablePadding>
          {latest.slice(0, 4).map((p, i) => (
            <Box key={p.key}>
              {i > 0 && <Divider component="li" />}
              <ListItem
                secondaryAction={<Chip label={p.status} color={p.status === "Active" ? "primary" : "default"} variant="outlined" />}
                sx={{ pr: 14 }}
              >
                <ListItemText
                  primary={`${p.key} · ${p.name}`}
                  secondary={`Updated ${formatDate(p.updated)}, ${p.issues} open issues`}
                />
              </ListItem>
            </Box>
          ))}
        </List>
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
import PageHeading from "@/components/PageHeading";
import { formatDate, projects } from "@/lib/data";

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));

  return (
    <Box>
      <PageHeading title="Projects" subtitle={`${projects.length} projects in the Acme Labs workspace`} />
      <TextField
        label="Filter projects"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 1.5, width: { xs: "100%", sm: 280 } }}
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
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    variant={p.status === "Active" ? "filled" : "outlined"}
                    color={p.status === "Active" ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.issues}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No projects match &ldquo;{query}&rdquo;.
                  </Typography>
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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeading from "@/components/PageHeading";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Box>
      <PageHeading title="Reports" subtitle="Open issues by project" />
      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <List disablePadding aria-label="Open issues by project">
            {projects.map((p) => (
              <ListItem key={p.key} disableGutters divider>
                <ListItemText primary={`${p.key} · ${p.name}`} />
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.issues}
                </Typography>
              </ListItem>
            ))}
            <ListItem disableGutters>
              <ListItemText primary="Total" slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
              <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {total}
              </Typography>
            </ListItem>
          </List>
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
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PageHeading from "@/components/PageHeading";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [releases, setReleases] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <Box>
      <PageHeading title="Settings" subtitle="Your profile, notifications and appearance." />
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "grid", gap: 2, maxWidth: 640 }}
        aria-label="Settings"
      >
        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Profile</Typography>} />
          <Divider />
          <CardContent sx={{ display: "grid", gap: 1.5 }}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Role" value={user.role} fullWidth disabled helperText="Only another owner can change roles." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Notifications</Typography>} />
          <Divider />
          <CardContent>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly analytics digest"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Email me when I am mentioned on an issue"
              />
              <FormControlLabel
                control={<Switch checked={releases} onChange={(e) => setReleases(e.target.checked)} />}
                label="Product release notes"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Appearance</Typography>} />
          <Divider />
          <CardContent>
            <TextField
              select
              label="Theme"
              value={mode ?? "light"}
              onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
              sx={{ width: { xs: "100%", sm: 240 } }}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">Match system</MenuItem>
            </TextField>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Settings saved"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </Box>
  );
}
```
