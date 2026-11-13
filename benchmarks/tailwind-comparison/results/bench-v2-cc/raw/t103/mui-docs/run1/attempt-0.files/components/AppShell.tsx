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
