Now the data module.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export const product = {
  name: "Lumen",
  description:
    "Product analytics and issue tracking for small software teams",
};

export const user: User = {
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
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

export interface NavItem {
  label: string;
  href: string;
  icon: "overview" | "reports" | "projects" | "settings";
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
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", href: "/#reports", icon: "reports" },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail for each route. The last crumb is the current screen. */
export const breadcrumbs: Record<string, Crumb[]> = {
  "/": [{ label: "Analytics" }, { label: "Overview" }],
  "/projects": [{ label: "Workspace" }, { label: "Projects" }],
  "/settings": [{ label: "Workspace" }, { label: "Settings" }],
};

export const weeklyActivity = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  opened: [14, 18, 11, 22, 17, 5, 3],
  closed: [9, 13, 15, 16, 19, 6, 2],
};

export const reports = [
  { title: "Weekly issue throughput", detail: "Opened vs. closed issues across all active projects", updated: "2026-10-14" },
  { title: "Release health", detail: "Crash-free sessions for the customer app and public API", updated: "2026-10-13" },
  { title: "Team workload", detail: "Open issues per assignee, grouped by project", updated: "2026-10-11" },
];
```

The shell:

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
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuIcon from "@mui/icons-material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import {
  breadcrumbs,
  navGroups,
  product,
  user,
  type NavGroup,
  type NavItem,
} from "@/lib/data";

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 68;

const itemIcons: Record<NavItem["icon"], React.ReactElement> = {
  overview: <DashboardOutlinedIcon />,
  reports: <AssessmentOutlinedIcon />,
  projects: <FolderOutlinedIcon />,
  settings: <SettingsOutlinedIcon />,
};

const groupIcons: Record<string, React.ReactElement> = {
  analytics: <InsightsIcon />,
  workspace: <WorkspacesOutlinedIcon />,
};

function isCurrent(item: NavItem, pathname: string): boolean {
  // Reports points at an anchor on the dashboard and is never "current" by path.
  if (item.href.includes("#")) return false;
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

interface NavListProps {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

function NavList({ pathname, collapsed, onNavigate }: NavListProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  const toggle = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderItem = (item: NavItem, nested: boolean) => {
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
          borderRadius: 1,
          mx: 1,
          px: collapsed ? 0 : 2,
          pl: !collapsed && nested ? 4 : undefined,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 2,
            justifyContent: "center",
            color: current ? "primary.main" : "inherit",
          }}
        >
          {itemIcons[item.icon]}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                variant: "body2",
                sx: { fontWeight: current ? 600 : 400 },
              },
            }}
          />
        )}
      </ListItemButton>
    );

    return (
      <li key={item.href}>
        {collapsed ? (
          <Tooltip title={item.label} placement="right">
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </li>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const open = openGroups[group.id];
    const listId = `nav-group-${group.id}`;

    if (collapsed) {
      // Icon rail: a divider and the group's items, no headings.
      return (
        <li key={group.id}>
          <Divider sx={{ my: 1, mx: 2 }} />
          <List component="ul" disablePadding aria-label={group.label}>
            {group.items.map((item) => renderItem(item, false))}
          </List>
        </li>
      );
    }

    return (
      <li key={group.id}>
        <ListItemButton
          onClick={() => toggle(group.id)}
          aria-expanded={open}
          aria-controls={listId}
          sx={{ mx: 1, borderRadius: 1, minHeight: 40 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
            {groupIcons[group.id]}
          </ListItemIcon>
          <ListItemText
            primary={group.label}
            slotProps={{
              primary: {
                variant: "overline",
                sx: { lineHeight: 1.6, color: "text.secondary" },
              },
            }}
          />
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List
            id={listId}
            component="ul"
            disablePadding
            aria-label={group.label}
          >
            {group.items.map((item) => renderItem(item, true))}
          </List>
        </Collapse>
      </li>
    );
  };

  return (
    <List component="ul" sx={{ py: 1 }}>
      {navGroups.map(renderGroup)}
    </List>
  );
}

interface SidebarContentProps extends NavListProps {
  showBrand?: boolean;
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Box
      component={NextLink}
      href="/"
      aria-label={`${product.name} home`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: collapsed ? 0 : 2.5,
        justifyContent: collapsed ? "center" : "flex-start",
        height: 64,
        color: "text.primary",
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
        }}
      >
        L
      </Box>
      {!collapsed && (
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {product.name}
        </Typography>
      )}
    </Box>
  );
}

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
  showBrand = true,
}: SidebarContentProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {showBrand && <Brand collapsed={collapsed} />}
      <Divider />
      <Box
        component="nav"
        aria-label="Primary"
        sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}
      >
        <NavList
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </Box>
    </Box>
  );
}

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

  const crumbs = breadcrumbs[pathname] ?? breadcrumbs["/"];
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <Drawer
          variant="permanent"
          open
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                boxSizing: "border-box",
                overflowX: "hidden",
                transition: (theme) =>
                  theme.transitions.create("width", {
                    duration: theme.transitions.duration.shorter,
                  }),
              },
            },
          }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <SidebarContent pathname={pathname} collapsed={collapsed} />
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              p: 1,
            }}
          >
            <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={collapsed}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>
      </Box>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        slotProps={{
          paper: {
            sx: { width: EXPANDED_WIDTH, maxWidth: "85vw" },
            "aria-label": "Navigation drawer",
          },
        }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Breadcrumbs
              aria-label="Breadcrumb"
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {crumbs.map((crumb, i) =>
                i === crumbs.length - 1 ? (
                  <Typography
                    key={crumb.label}
                    aria-current="page"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                    noWrap
                  >
                    {crumb.label}
                  </Typography>
                ) : crumb.href ? (
                  <Link
                    key={crumb.label}
                    component={NextLink}
                    href={crumb.href}
                    underline="hover"
                    color="inherit"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <Typography key={crumb.label} sx={{ color: "text.secondary" }} noWrap>
                    {crumb.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
            </Box>
            <Avatar
              alt={user.name}
              sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontSize: 14 }}
            >
              {initials(user.name)}
            </Avatar>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 1280, width: "100%" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

The dashboard view:

```tsx components/DashboardView.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  formatDate,
  projects,
  reports,
  user,
  weeklyActivity,
} from "@/lib/data";

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardView() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const lastUpdated = [...projects].sort((a, b) =>
    b.updated.localeCompare(a.updated),
  )[0];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here is where things stand across your workspace today.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(openIssues)}
            hint={`Across ${projects.length} projects`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(active.length)}
            hint={`${projects.length - active.length} paused or archived`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.key}
            hint={`${busiest.name}, ${busiest.issues} open issues`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Last activity"
            value={formatDate(lastUpdated.updated)}
            hint={lastUpdated.name}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Issues this week
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Opened and closed per day, all active projects
              </Typography>
              <Box sx={{ width: "100%", height: 280 }}>
                <BarChart
                  height={280}
                  xAxis={[{ scaleType: "band", data: weeklyActivity.days }]}
                  series={[
                    { data: weeklyActivity.opened, label: "Opened" },
                    { data: weeklyActivity.closed, label: "Closed" },
                  ]}
                  hideLegend={false}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            variant="outlined"
            id="reports"
            component="section"
            aria-labelledby="reports-heading"
            sx={{ height: "100%", scrollMarginTop: 80 }}
          >
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                id="reports-heading"
                gutterBottom
              >
                Reports
              </Typography>
              <List disablePadding>
                {reports.map((report) => (
                  <ListItem key={report.title} disableGutters divider>
                    <ListItemText
                      primary={report.title}
                      secondary={`${report.detail}. Updated ${formatDate(report.updated)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                component={NextLink}
                href="/projects"
                size="small"
                sx={{ mt: 1 }}
              >
                View all projects
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

`app/page.tsx` is the dashboard route and wraps itself in the shell, since it sits outside the `(app)` group:

```tsx app/page.tsx
import AppShell from "@/components/AppShell";
import DashboardView from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
```

The shared layout for the other two routes:

```tsx app/(app)/layout.tsx
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

The projects screen:

```tsx components/ProjectsTable.tsx
"use client";

import * as React from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

const columns: GridColDef<(typeof projects)[number]>[] = [
  { field: "key", headerName: "Key", width: 90 },
  { field: "name", headerName: "Project", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.value as ProjectStatus}
        color={statusColor[params.value as ProjectStatus]}
        variant="outlined"
      />
    ),
  },
  {
    field: "issues",
    headerName: "Open issues",
    type: "number",
    width: 130,
  },
  {
    field: "updated",
    headerName: "Last updated",
    width: 150,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export default function ProjectsTable() {
  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={projects}
        columns={columns}
        getRowId={(row) => row.key}
        disableRowSelectionOnClick
        hideFooter
        autoHeight
        aria-label="Projects"
      />
    </Box>
  );
}
```

```tsx app/(app)/projects/page.tsx
import Typography from "@mui/material/Typography";
import ProjectsTable from "@/components/ProjectsTable";

export const metadata = { title: "Projects | Lumen" };

export default function ProjectsPage() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every project in the Acme Labs workspace and where its issues stand.
      </Typography>
      <ProjectsTable />
    </>
  );
}
```

The settings screen:

```tsx components/SettingsForm.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

export default function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [weekly, setWeekly] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [releases, setReleases] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const markDirty = () => setSaved(false);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        <Card variant="outlined" component="section" aria-labelledby="profile-heading">
          <CardContent>
            <Typography variant="h6" component="h2" id="profile-heading" gutterBottom>
              Profile
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markDirty();
                }}
                fullWidth
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Role"
                value={user.role}
                fullWidth
                disabled
                helperText="Only another owner can change your role."
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          component="section"
          aria-labelledby="notifications-heading"
        >
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              id="notifications-heading"
              gutterBottom
            >
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={weekly}
                    onChange={(e) => {
                      setWeekly(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Weekly summary email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={mentions}
                    onChange={(e) => {
                      setMentions(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Notify me when I am mentioned on an issue"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={releases}
                    onChange={(e) => {
                      setReleases(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Release announcements"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Box role="status" aria-live="polite">
            {saved && (
              <Alert severity="success" sx={{ py: 0 }}>
                Settings saved.
              </Alert>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
```

```tsx app/(app)/settings/page.tsx
import Typography from "@mui/material/Typography";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings | Lumen" };

export default function SettingsPage() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile and how Lumen keeps you informed.
      </Typography>
      <SettingsForm />
    </>
  );
}
```