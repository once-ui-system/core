```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

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

export const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export const reports = [
  {
    title: "Weekly digest",
    description: "Issues opened, closed and carried over, project by project.",
  },
  {
    title: "Issue ageing",
    description: "How long open issues have been waiting, grouped by project.",
  },
  {
    title: "Team activity",
    description: "Who closed what this month, and where help is needed.",
  },
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
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";
const radius = 16;

// Lumen: friendly, upbeat, generous. Brand pink #DB2777, warm sand neutrals,
// 16px corners and airy density, all carried by the theme.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#DB2777",
          dark: "#BE185D",
          light: "#F472B6",
          contrastText: "#FFFFFF",
        },
        secondary: { main: "#B45309" },
        background: { default: "#FBF7F0", paper: "#FFFDF9" },
        text: { primary: "#3A2E24", secondary: "#6B5B4B" },
        divider: "#E9DFCE",
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#F472B6",
          dark: "#EC4899",
          light: "#F9A8D4",
          contrastText: "#2B0A19",
        },
        secondary: { main: "#F5B26B" },
        background: { default: "#17130F", paper: "#211B15" },
        text: { primary: "#F5EDE0", secondary: "#C9BBA8" },
        divider: "#3A3027",
      },
    },
  },
  shape: { borderRadius: radius },
  spacing: 8,
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: headingFont, fontWeight: 700 },
    h2: { fontFamily: headingFont, fontWeight: 700 },
    h3: { fontFamily: headingFont, fontWeight: 700 },
    h4: { fontFamily: headingFont, fontWeight: 700 },
    h5: { fontFamily: headingFont, fontWeight: 700 },
    h6: { fontFamily: headingFont, fontWeight: 700 },
    button: { fontWeight: 700, fontSize: "1rem", textTransform: "none" },
    body1: { fontSize: "1.0625rem", lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ":focus-visible": {
          outline: `3px solid ${(theme.vars || theme).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius, minHeight: 48, paddingInline: 24 },
        sizeSmall: { minHeight: 40, paddingInline: 16 },
        sizeLarge: { minHeight: 56, paddingInline: 32 },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { padding: 12, borderRadius: radius } },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme }) => ({
          color: (theme.vars || theme).palette.primary.main,
          fontWeight: 600,
          ...theme.applyStyles("light", {
            color: (theme.vars || theme).palette.primary.dark,
          }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          "& .MuiOutlinedInput-input": { paddingBlock: 16, paddingInline: 18 },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: radius } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 28, "&:last-child": { paddingBottom: 28 } } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: radius } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: radius } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: radius } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 44 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 52,
          borderRadius: radius,
          marginBlock: 2,
          "&.Mui-selected": {
            backgroundColor: (theme.vars || theme).palette.primary.main,
            color: (theme.vars || theme).palette.primary.contrastText,
            "& .MuiListItemIcon-root": { color: "inherit" },
            "&:hover": { backgroundColor: (theme.vars || theme).palette.primary.dark },
            ...theme.applyStyles("dark", {
              "&:hover": { backgroundColor: (theme.vars || theme).palette.primary.light },
            }),
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { paddingBlock: 20, paddingInline: 20 } },
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
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
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

```tsx components/nav.tsx
"use client";

import type { ReactNode } from "react";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import WorkspacesRounded from "@mui/icons-material/WorkspacesRounded";

export type NavItem = { label: string; href: string; icon: ReactNode };
export type NavGroup = { id: string; label: string; icon: ReactNode; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: <InsightsRounded />,
    items: [
      { label: "Overview", href: "/", icon: <SpaceDashboardRounded /> },
      { label: "Reports", href: "/reports", icon: <AssessmentRounded /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: <WorkspacesRounded />,
    items: [
      { label: "Projects", href: "/projects", icon: <FolderRounded /> },
      { label: "Settings", href: "/settings", icon: <SettingsRounded /> },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumbs(pathname: string): { group: string; page: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group: group.label, page: item.label };
    }
  }
  return null;
}
```

```tsx components/SidebarNav.tsx
"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { isActive, navGroups, type NavItem } from "./nav";

type SidebarNavProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  iconOnly: boolean;
  nested?: boolean;
  onNavigate?: () => void;
};

function NavLink({ item, active, iconOnly, nested, onNavigate }: NavLinkProps) {
  const button = (
    <ListItemButton
      component={NextLink}
      href={item.href}
      selected={active}
      aria-current={active ? "page" : undefined}
      aria-label={iconOnly ? item.label : undefined}
      onClick={onNavigate}
      sx={{ pl: nested ? 4.5 : undefined, justifyContent: iconOnly ? "center" : undefined }}
    >
      <ListItemIcon sx={iconOnly ? { minWidth: 0 } : undefined}>{item.icon}</ListItemIcon>
      {!iconOnly && <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />}
    </ListItemButton>
  );
  return iconOnly ? (
    <Tooltip title={item.label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export default function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g) => [g.id, true])),
  );

  return (
    <Box component="nav" aria-label="Main navigation" sx={{ px: collapsed ? 1.5 : 2, py: 2 }}>
      {navGroups.map((group, index) => {
        const panelId = `nav-group-${group.id}`;
        const isOpen = open[group.id];

        if (collapsed) {
          return (
            <Box key={group.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <List disablePadding aria-label={group.label}>
                {group.items.map((item) => (
                  <ListItem key={item.href} disablePadding>
                    <NavLink item={item} active={isActive(item.href, pathname)} iconOnly />
                  </ListItem>
                ))}
              </List>
            </Box>
          );
        }

        return (
          <List key={group.id} disablePadding sx={{ mb: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <ListItemIcon>{group.icon}</ListItemIcon>
                <ListItemText
                  primary={group.label}
                  slotProps={{ primary: { sx: { fontWeight: 700, color: "text.secondary" } } }}
                />
                {isOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />}
              </ListItemButton>
            </ListItem>
            <Box component="li" sx={{ listStyle: "none" }}>
              <Collapse in={isOpen} timeout="auto" id={panelId}>
                <List disablePadding>
                  {group.items.map((item) => (
                    <ListItem key={item.href} disablePadding>
                      <NavLink
                        item={item}
                        active={isActive(item.href, pathname)}
                        iconOnly={false}
                        nested
                        onNavigate={onNavigate}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          </List>
        );
      })}
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";
import { findCrumbs } from "./nav";
import SidebarNav from "./SidebarNav";

const EXPANDED_WIDTH = 288;
const COLLAPSED_WIDTH = 96;
const MOBILE_WIDTH = 308;
const HEADER_HEIGHT = 80;

function Brand({ showName }: { showName: boolean }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        justifyContent: showName ? "flex-start" : "center",
        height: HEADER_HEIGHT,
        px: showName ? 3 : 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          flexShrink: 0,
        }}
      >
        <AutoAwesomeRounded />
      </Box>
      {showName && (
        <Typography variant="h5" component="span">
          Lumen
        </Typography>
      )}
    </Stack>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const crumbs = findCrumbs(pathname);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const openAccount = (event: MouseEvent<HTMLElement>) => setAccountAnchor(event.currentTarget);
  const closeAccount = () => setAccountAnchor(null);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 16,
          top: -80,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 3,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 700,
          textDecoration: "none",
          "&:focus": { top: 16 },
        }}
      >
        Skip to content
      </Box>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            backgroundImage: "none",
            transition: (theme) =>
              theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          },
        }}
      >
        <Brand showName={!collapsed} />
        <Divider />
        <SidebarNav collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: MOBILE_WIDTH, maxWidth: "88vw", backgroundImage: "none" },
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          <Brand showName />
        </Stack>
        <Divider />
        <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          component="header"
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Toolbar sx={{ minHeight: HEADER_HEIGHT, gap: 1, px: { xs: 2, md: 4 } }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuRounded />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((value) => !value)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>

            <Breadcrumbs
              aria-label="Breadcrumb"
              separator={<NavigateNextRounded fontSize="small" />}
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {crumbs && (
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  {crumbs.group}
                </Typography>
              )}
              <Typography color="text.primary" aria-current="page" sx={{ fontWeight: 700 }}>
                {crumbs ? crumbs.page : "Lumen"}
              </Typography>
            </Breadcrumbs>

            <IconButton
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={accountAnchor ? true : undefined}
              onClick={openAccount}
              edge="end"
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {initials(user.name)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={closeAccount}>
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem component={NextLink} href="/settings" onClick={closeAccount}>
                Settings
              </MenuItem>
              <MenuItem onClick={closeAccount}>Sign out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main"
          tabIndex={-1}
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 1240,
            mx: "auto",
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 4, md: 6 },
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
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: { xs: 4, md: 5 },
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
```

```tsx components/SummaryCard.tsx
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type SummaryCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export default function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography component="h2" variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h3" component="p" sx={{ fontSize: "2.5rem" }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}
```

```tsx app/page.tsx
import BugReportRounded from "@mui/icons-material/BugReportRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import PauseCircleRounded from "@mui/icons-material/PauseCircleRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your projects stand today. Nice work keeping things moving."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(openIssues)}
            hint="Across all projects"
            icon={<BugReportRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(active)}
            hint="Currently being worked on"
            icon={<FolderRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Paused projects"
            value={String(paused)}
            hint="Waiting for their moment"
            icon={<PauseCircleRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.name}
            hint={`${busiest.issues} open issues`}
            icon={<TrendingUpRounded />}
          />
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Recently updated
              </Typography>
              <List disablePadding sx={{ mt: 1 }}>
                {recent.map((project, index) => (
                  <div key={project.key}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      disableGutters
                      sx={{ py: 2, gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}
                    >
                      <ListItemText
                        sx={{ flex: "1 1 220px" }}
                        primary={project.name}
                        secondary={`${project.key} · Updated ${formatDate(project.updated)}`}
                        slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                      />
                      <Chip label={project.status} color={statusColor[project.status]} variant="outlined" />
                    </ListItem>
                  </div>
                ))}
              </List>
              <Link href="/projects" sx={{ display: "inline-block", mt: 2 }}>
                See all projects
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
```

```tsx app/reports/page.tsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Ready-made summaries of how your team is doing."
      />
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid key={report.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                  {report.title}
                </Typography>
                <Typography color="text.secondary">{report.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { useState } from "react";
import SearchRounded from "@mui/icons-material/SearchRounded";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatDate, projects, statusColor, type ProjectStatus } from "@/lib/data";

type Filter = "All" | ProjectStatus;
const filters: Filter[] = ["All", "Active", "Paused", "Archived"];

export default function ProjectsTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const needle = query.trim().toLowerCase();
  const visible = projects.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      (needle === "" || p.name.toLowerCase().includes(needle) || p.key.toLowerCase().includes(needle)),
  );

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
        <TextField
          label="Search projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ flex: 1, maxWidth: { md: 420 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1} role="group" aria-label="Filter by status" useFlexGap sx={{ flexWrap: "wrap" }}>
          {filters.map((name) => (
            <Chip
              key={name}
              label={name}
              clickable
              aria-pressed={filter === name}
              color={filter === name ? "primary" : "default"}
              variant={filter === name ? "filled" : "outlined"}
              onClick={() => setFilter(name)}
              sx={{ height: 44, px: 1, fontSize: "0.975rem" }}
            />
          ))}
        </Stack>
      </Stack>

      <Typography role="status" variant="body2" color="text.secondary">
        {visible.length === 1 ? "1 project" : `${visible.length} projects`}
      </Typography>

      <Card>
        <TableContainer>
          <Table aria-label="Projects">
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Key</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((project) => (
                <TableRow key={project.key} hover>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, fontWeight: 700 }}>
                    {project.key}
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <Chip label={project.status} color={statusColor[project.status]} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">{project.issues}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {formatDate(project.updated)}
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No projects match. Try a different search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
```

```tsx app/projects/page.tsx
import PageHeader from "@/components/PageHeader";
import ProjectsTable from "@/components/ProjectsTable";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and open issues."
      />
      <ProjectsTable />
    </>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useColorScheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

type Mode = "light" | "dark" | "system";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notify, setNotify] = useState({ digest: true, mentions: true, assigned: false });
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Stack component="form" spacing={3} onSubmit={onSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Profile
          </Typography>
          <Stack spacing={3} sx={{ maxWidth: 520 }}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField label="Role" value={user.role} disabled helperText="Only another owner can change this." />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, color: "text.primary", fontFamily: "inherit" }}>
              <Typography variant="h5" component="span">
                Appearance
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              aria-label="Colour theme"
              value={(mode ?? "light") as Mode}
              onChange={(event) => setMode(event.target.value as Mode)}
            >
              <FormControlLabel value="light" control={<Radio />} label="Light" sx={{ mr: 4 }} />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" sx={{ mr: 4 }} />
              <FormControlLabel value="system" control={<Radio />} label="Match my device" />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, color: "text.primary" }}>
              <Typography variant="h5" component="span">
                Notifications
              </Typography>
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.digest}
                    onChange={(e) => setNotify((n) => ({ ...n, digest: e.target.checked }))}
                  />
                }
                label="Weekly digest email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.mentions}
                    onChange={(e) => setNotify((n) => ({ ...n, mentions: e.target.checked }))}
                  />
                }
                label="When someone mentions me"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.assigned}
                    onChange={(e) => setNotify((n) => ({ ...n, assigned: e.target.checked }))}
                  />
                }
                label="When an issue is assigned to me"
              />
            </FormGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Stack direction="row" sx={{ justifyContent: "flex-start" }}>
        <Button type="submit" variant="contained" size="large">
          Save changes
        </Button>
      </Stack>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)} sx={{ width: "100%" }}>
          Settings saved. Looking good!
        </Alert>
      </Snackbar>
    </Stack>
  );
}
```

```tsx app/settings/page.tsx
import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Update your profile, pick a look you like and choose what we tell you about."
      />
      <SettingsForm />
    </>
  );
}
```
