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
