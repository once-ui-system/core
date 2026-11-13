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
  type NavIconName,
  type NavItem,
} from "@/lib/data";

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 68;

function ItemIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case "overview":
      return <DashboardOutlinedIcon />;
    case "reports":
      return <AssessmentOutlinedIcon />;
    case "projects":
      return <FolderOutlinedIcon />;
    case "settings":
      return <SettingsOutlinedIcon />;
  }
}

function GroupIcon({ id }: { id: string }) {
  return id === "analytics" ? <InsightsIcon /> : <WorkspacesOutlinedIcon />;
}

function isCurrent(item: NavItem, pathname: string): boolean {
  // Reports points at an anchor on the dashboard and is never "current" by path.
  if (item.href.includes("#")) return false;
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

interface NavListProps {
  pathname: string;
  collapsed: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}

function NavLinkItem({
  item,
  current,
  collapsed,
  nested,
  onNavigate,
}: {
  item: NavItem;
  current: boolean;
  collapsed: boolean;
  nested: boolean;
  onNavigate?: () => void;
}) {
  const button = (
    <ListItemButton
      component={NextLink}
      href={item.href}
      selected={current}
      aria-current={current ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
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
        <ItemIcon name={item.icon} />
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
    <li>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          <Box component="span" sx={{ display: "block" }}>
            {button}
          </Box>
        </Tooltip>
      ) : (
        button
      )}
    </li>
  );
}

function NavGroupBlock({
  group,
  pathname,
  collapsed,
  idPrefix,
  open,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  idPrefix: string;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const listId = `${idPrefix}-group-${group.id}`;

  if (collapsed) {
    return (
      <li>
        <Divider sx={{ my: 1, mx: 2 }} />
        <List disablePadding aria-label={group.label}>
          {group.items.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              current={isCurrent(item, pathname)}
              collapsed
              nested={false}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </li>
    );
  }

  return (
    <li>
      <ListItemButton
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={listId}
        sx={{ mx: 1, borderRadius: 1, minHeight: 40 }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
          <GroupIcon id={group.id} />
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
        <List id={listId} disablePadding aria-label={group.label}>
          {group.items.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              current={isCurrent(item, pathname)}
              collapsed={false}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </li>
  );
}

function NavList({ pathname, collapsed, idPrefix, onNavigate }: NavListProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  return (
    <List sx={{ py: 1 }}>
      {navGroups.map((group) => (
        <NavGroupBlock
          key={group.id}
          group={group}
          pathname={pathname}
          collapsed={collapsed}
          idPrefix={idPrefix}
          open={openGroups[group.id] ?? true}
          onToggle={() =>
            setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
          }
          onNavigate={onNavigate}
        />
      ))}
    </List>
  );
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
  idPrefix,
  navLabel,
  onNavigate,
}: NavListProps & { navLabel: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <Brand collapsed={collapsed} />
      <Divider />
      <Box
        component="nav"
        aria-label={navLabel}
        sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}
      >
        <NavList
          pathname={pathname}
          collapsed={collapsed}
          idPrefix={idPrefix}
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
          sx={{
            "& .MuiDrawer-paper": {
              width: sidebarWidth,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: (theme) =>
                theme.transitions.create("width", {
                  duration: theme.transitions.duration.shorter,
                }),
            },
          }}
        >
          <SidebarContent
            pathname={pathname}
            collapsed={collapsed}
            idPrefix="desktop"
            navLabel="Primary"
          />
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              p: 1,
            }}
          >
            <IconButton
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        </Drawer>
      </Box>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, maxWidth: "85vw" },
        }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          idPrefix="mobile"
          navLabel="Mobile"
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
                ) : (
                  <Typography
                    key={crumb.label}
                    sx={{ color: "text.secondary" }}
                    noWrap
                  >
                    {crumb.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                textAlign: "right",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role}
              </Typography>
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
