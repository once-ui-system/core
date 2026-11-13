"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { findCrumbs } from "../lib/nav";
import SidebarContent, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = findCrumbs(pathname);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = mode === "system" ? systemMode : mode;
  const isLight = resolved === "light";

  const width = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
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
          transition: (t) =>
            t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
            transition: (t) =>
              t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            overflowX: "hidden",
          },
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: "background.default",
            backgroundImage: "none",
            borderBottom: 1,
            borderColor: "divider",
          }}
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
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>

            <Breadcrumbs aria-label="Breadcrumb" sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Lumen
              </Typography>
              {crumbs && (
                <Typography variant="body2" color="text.secondary">
                  {crumbs.group}
                </Typography>
              )}
              {crumbs && (
                <Typography variant="body2" color="text.primary" aria-current="page" noWrap>
                  {crumbs.page}
                </Typography>
              )}
            </Breadcrumbs>

            <Tooltip title={isLight ? "Switch to dark theme" : "Switch to light theme"}>
              <IconButton
                aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
                onClick={() => setMode(isLight ? "dark" : "light")}
              >
                {isLight ? <DarkModeOutlined /> : <LightModeOutlined />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, maxWidth: 1200, width: "100%", mx: "auto", outline: "none" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
