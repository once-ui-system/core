```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";
const BRAND = "#E8590C";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" };

// Lumen: technical, focused. Brand orange on warm stone neutrals, 4px corners, dark by default.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: BRAND, light: "#F2793A", dark: "#C2410C", contrastText: "#1c1917" },
        secondary: { main: "#a8a29e" },
        background: { default: "#1c1917", paper: "#292524" },
        text: { primary: "#fafaf9", secondary: "#a8a29e" },
        divider: "#44403c",
      },
    },
    light: {
      palette: {
        primary: { main: BRAND, light: "#F2793A", dark: "#C2410C", contrastText: "#1c1917" },
        secondary: { main: "#57534e" },
        background: { default: "#fafaf9", paper: "#ffffff" },
        text: { primary: "#1c1917", secondary: "#57534e" },
        divider: "#e7e5e4",
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
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: 2,
        },
      },
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
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 4 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme.vars || theme).palette.primary.main,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused": { color: (theme.vars || theme).palette.primary.main },
        }),
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 4, backgroundImage: "none" } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" }, rounded: { borderRadius: 4 } },
    },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 4 } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: 4 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme }) => ({
          color: (theme.vars || theme).palette.primary.main,
          ...theme.applyStyles("light", { color: (theme.vars || theme).palette.primary.dark }),
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: { switchBase: { "&.Mui-focusVisible": { outline: "none" } } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          "&.Mui-selected": {
            color: (theme.vars || theme).palette.primary.main,
            backgroundColor: "rgba(232, 89, 12, 0.16)",
            boxShadow: `inset 3px 0 0 ${(theme.vars || theme).palette.primary.main}`,
            ...theme.applyStyles("light", { color: (theme.vars || theme).palette.primary.dark }),
            "&:hover": { backgroundColor: "rgba(232, 89, 12, 0.24)" },
          },
          "&.Mui-selected .MuiListItemIcon-root": { color: "inherit" },
        }),
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 40 } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none" } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "default" } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 4 } } },
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
export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

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
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BoltIcon from "@mui/icons-material/Bolt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuIcon from "@mui/icons-material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SettingsIcon from "@mui/icons-material/Settings";
import { user } from "@/lib/data";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactElement;
}
interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: <InsightsIcon /> },
      { label: "Reports", href: "/#reports", icon: <AssessmentIcon /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <FolderIcon /> },
      { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
    ],
  },
];

const EXPANDED = 264;
const COLLAPSED = 68;

function crumbsFor(pathname: string): { group: string; page: string } {
  if (pathname.startsWith("/projects")) return { group: "Workspace", page: "Projects" };
  if (pathname.startsWith("/settings")) return { group: "Workspace", page: "Settings" };
  return { group: "Analytics", page: "Overview" };
}

function isCurrent(item: NavItem, pathname: string): boolean {
  if (item.href.includes("#")) return false;
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

function NavContent({
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

  const renderItem = (item: NavItem) => {
    const current = isCurrent(item, pathname);
    const button = (
      <ListItemButton
        component={NextLink}
        href={item.href}
        selected={current}
        aria-current={current ? "page" : undefined}
        onClick={onNavigate}
        sx={{
          minHeight: 44,
          mb: 0.5,
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 1 : 2,
          pl: collapsed ? 1 : 3,
        }}
      >
        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: "inherit", justifyContent: "center" }}>
          {item.icon}
        </ListItemIcon>
        {!collapsed && <ListItemText primary={item.label} />}
      </ListItemButton>
    );
    return collapsed ? (
      <Tooltip key={item.label} title={item.label} placement="right">
        {button}
      </Tooltip>
    ) : (
      <React.Fragment key={item.label}>{button}</React.Fragment>
    );
  };

  return (
    <Box component="nav" aria-label="Main navigation" sx={{ px: 1, py: 1 }}>
      {groups.map((group, index) =>
        collapsed ? (
          <List key={group.id} disablePadding aria-label={group.label}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            {group.items.map(renderItem)}
          </List>
        ) : (
          <List key={group.id} disablePadding aria-label={group.label}>
            <ListItemButton
              onClick={() => setOpen((o) => ({ ...o, [group.id]: !o[group.id] }))}
              aria-expanded={open[group.id]}
              sx={{ mb: 0.5 }}
            >
              <ListItemText
                primary={group.label}
                slotProps={{
                  primary: {
                    variant: "overline",
                    sx: { color: "text.secondary", fontFamily: "ui-monospace, Menlo, monospace" },
                  },
                }}
              />
              {open[group.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={open[group.id]} timeout="auto" unmountOnExit>
              <List disablePadding>{group.items.map(renderItem)}</List>
            </Collapse>
          </List>
        ),
      )}
    </Box>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Toolbar
      sx={{
        gap: 1,
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <BoltIcon color="primary" aria-hidden />
      {!collapsed && (
        <Typography variant="h5" component="span">
          Lumen
        </Typography>
      )}
    </Toolbar>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const crumbs = crumbsFor(pathname);
  const width = collapsed ? COLLAPSED : EXPANDED;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Link
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "background.paper",
          p: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: 1,
            borderColor: "divider",
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          },
        }}
      >
        <Brand collapsed={collapsed} />
        <NavContent collapsed={collapsed} pathname={pathname} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: false }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED, maxWidth: "85vw", boxSizing: "border-box" },
        }}
      >
        <Brand collapsed={false} />
        <NavContent collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" sx={{ borderBottom: 1, borderColor: "divider", backgroundImage: "none" }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            <Breadcrumbs
              aria-label="Breadcrumb"
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              <Typography color="text.secondary" variant="body2">
                {crumbs.group}
              </Typography>
              <Typography color="text.primary" variant="body2" aria-current="page" noWrap>
                {crumbs.page}
              </Typography>
            </Breadcrumbs>
            <Tooltip title={`${user.name} (${user.role})`}>
              <Avatar
                alt={user.name}
                sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14 }}
              >
                MO
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" id="main" tabIndex={-1} sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, outline: "none" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

```tsx components/Dashboard.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { formatDate, projects, user } from "@/lib/data";

export default function Dashboard() {
  const theme = useTheme();
  const active = projects.filter((p) => p.status === "Active").length;
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Open issues", value: open, hint: "across all projects" },
    { label: "Active projects", value: active, hint: `of ${projects.length} total` },
    { label: "Paused", value: projects.filter((p) => p.status === "Paused").length, hint: "waiting on a decision" },
    { label: "Archived", value: projects.filter((p) => p.status === "Archived").length, hint: "read only" },
  ];

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {active} projects are active and {open} issues are open at Acme Labs.
      </Typography>

      <Grid container spacing={2} component="section" aria-label="Summary">
        {cards.map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {c.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ my: 0.5 }}>
                  {c.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.hint}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Open issues by project
              </Typography>
              <Box role="img" aria-label={`Bar chart of open issues: ${projects.map((p) => `${p.key} ${p.issues}`).join(", ")}`}>
                <BarChart
                  height={260}
                  colors={[theme.palette.primary.main]}
                  xAxis={[{ scaleType: "band", data: projects.map((p) => p.key) }]}
                  series={[{ data: projects.map((p) => p.issues), label: "Open issues" }]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card id="reports" sx={{ height: "100%", scrollMarginTop: 80 }}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Reports: recent activity
              </Typography>
              <List disablePadding>
                {latest.map((p, i) => (
                  <Box key={p.key}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem disableGutters secondaryAction={<Chip size="small" label={p.status} variant="outlined" />}>
                      <ListItemText
                        primary={`${p.key}: ${p.name}`}
                        secondary={`Updated ${formatDate(p.updated)}`}
                        sx={{ pr: 10 }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDate, type Project } from "@/lib/data";

const statusColor = { Active: "success", Paused: "warning", Archived: "default" } as const;

const columns: GridColDef<Project>[] = [
  { field: "key", headerName: "Key", width: 90 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <Chip size="small" label={params.value as string} color={statusColor[params.row.status]} variant="outlined" />
    ),
  },
  { field: "issues", headerName: "Open issues", type: "number", width: 130 },
  {
    field: "updated",
    headerName: "Updated",
    width: 140,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export default function ProjectsTable({ rows }: { rows: Project[] }) {
  return (
    <Box sx={{ height: 380, width: "100%", minWidth: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.key}
        hideFooter
        disableRowSelectionOnClick
        aria-label="Projects"
        sx={{ borderRadius: 1 }}
      />
    </Box>
  );
}
```

```tsx app/page.tsx
import Dashboard from "@/components/Dashboard";

export default function Page() {
  return <Dashboard />;
}
```

```tsx app/projects/page.tsx
import Typography from "@mui/material/Typography";
import ProjectsTable from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata = { title: "Projects | Lumen" };

export default function Page() {
  return (
    <>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Every project in the Acme Labs workspace, with its open issue count.
      </Typography>
      <ProjectsTable rows={projects} />
    </>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "@/lib/data";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
      }}
      sx={{ maxWidth: 720 }}
    >
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Profile
            </Typography>
            <Stack spacing={2}>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField label="Role" value={user.role} fullWidth disabled helperText="Only an owner can change roles." />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly analytics digest"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Email me when I am mentioned on an issue"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              aria-label="Color mode"
              value={mode ?? null}
              onChange={(_, value) => value && setMode(value)}
            >
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
        </Box>
      </Stack>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Settings saved"
      />
    </Box>
  );
}
```

```tsx app/settings/page.tsx
import Typography from "@mui/material/Typography";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings | Lumen" };

export default function Page() {
  return (
    <>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Your profile, notifications and appearance.
      </Typography>
      <SettingsForm />
    </>
  );
}
```
