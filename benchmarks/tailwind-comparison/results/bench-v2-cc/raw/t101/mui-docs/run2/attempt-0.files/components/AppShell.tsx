"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { Theme } from "@mui/material/styles";
import NavList from "@/components/NavList";
import { findCurrent } from "@/lib/navigation";
import { user } from "@/lib/data";

const HEADER_HEIGHT = 48;
const EXPANDED_WIDTH = 232;
const COLLAPSED_WIDTH = 52;

const widthTransition = (theme: Theme) =>
  theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  });

function Brand() {
  return (
    <Typography
      component={Link}
      href="/"
      variant="h5"
      sx={{ color: "text.primary", textDecoration: "none", letterSpacing: "0.01em", px: 0.5 }}
    >
      Lumen
    </Typography>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const current = findCurrent(pathname);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: -9999,
          top: 8,
          zIndex: "tooltip",
          px: 1.5,
          py: 0.75,
          bgcolor: "background.paper",
          color: "primary.main",
          border: 1,
          borderColor: "primary.main",
          borderRadius: 0.25,
          "&:focus": { left: 8 },
        }}
      >
        Skip to content
      </Box>

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar disableGutters sx={{ minHeight: HEADER_HEIGHT, px: { xs: 1, md: 1.5 }, gap: 1 }}>
          <IconButton
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
          <Brand />
          <Divider orientation="vertical" flexItem sx={{ my: 1.25 }} />
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            {current && (
              <Breadcrumbs
                aria-label="Breadcrumb"
                separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
                sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
              >
                <Typography variant="body2" color="text.secondary" noWrap>
                  {current.group.label}
                </Typography>
                <Typography variant="body2" color="text.primary" aria-current="page" noWrap sx={{ fontWeight: 600 }}>
                  {current.item.label}
                </Typography>
              </Breadcrumbs>
            )}
          </Box>
          <IconButton
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-controls={menuAnchor ? "account-menu" : undefined}
            aria-expanded={menuAnchor ? true : undefined}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "primary.main", color: "primary.contrastText" }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email} · {user.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} href="/settings" onClick={() => setMenuAnchor(null)}>
              Account settings
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open
        sx={(theme) => ({
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          transition: widthTransition(theme),
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: widthTransition(theme),
          },
        })}
      >
        <Box sx={{ height: HEADER_HEIGHT, flexShrink: 0 }} />
        <NavList collapsed={collapsed} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: HEADER_HEIGHT, px: 1.5, justifyContent: "space-between" }}>
          <Brand />
          <IconButton aria-label="Close navigation menu" onClick={() => setMobileOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
        <Divider />
        <NavList onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ height: HEADER_HEIGHT }} />
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ p: { xs: 2, md: 3 }, outline: "none" }}
        >
          <Box sx={{ maxWidth: 1120, mx: "auto" }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
