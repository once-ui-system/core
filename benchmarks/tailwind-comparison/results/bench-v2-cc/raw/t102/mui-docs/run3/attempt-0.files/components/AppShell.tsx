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
