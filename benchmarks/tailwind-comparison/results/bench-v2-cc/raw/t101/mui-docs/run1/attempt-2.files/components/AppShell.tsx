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
import WorkIcon from "@mui/icons-material/Work";
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
    icon: <WorkIcon fontSize="small" />,
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
