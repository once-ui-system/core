"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import SidebarNav from "@/components/SidebarNav";
import { appName, initials, user } from "@/lib/data";
import { findNav } from "@/lib/navigation";

const EXPANDED_WIDTH = 288;
const COLLAPSED_WIDTH = 96;

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      underline="none"
      color="inherit"
      aria-label={`${appName} home`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minHeight: 48,
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AutoAwesomeRounded />
      </Box>
      {collapsed ? null : (
        <Typography component="span" variant="h5">
          {appName}
        </Typography>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = findNav(pathname);
  const { mode, setMode } = useColorScheme();

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          px: 2.5,
          py: 1.5,
          borderRadius: 1,
          fontWeight: 700,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          textDecoration: "none",
          transform: "translateY(-200%)",
          "&:focus": { transform: "translateY(0)" },
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
          width: sidebarWidth,
          flexShrink: 0,
          transition: "width 200ms ease",
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 200ms ease",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ px: collapsed ? 1.5 : 3.5, pt: 3, pb: 1 }}>
          <Brand collapsed={collapsed} />
        </Box>
        <SidebarNav collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        slotProps={{
          paper: {
            sx: { width: "min(320px, 86vw)", bgcolor: "background.paper" },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Brand />
          <IconButton
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Box>
        <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 1, minHeight: { xs: 72, md: 80 }, px: { xs: 2, md: 4 } }}>
            <IconButton
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, ml: -1 }}
            >
              <MenuRounded />
            </IconButton>
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              sx={{ display: { xs: "none", md: "inline-flex" }, ml: -1 }}
            >
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>

            <Breadcrumbs
              aria-label="Breadcrumb"
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {current ? (
                <Typography variant="body2" color="text.secondary">
                  {current.group.label}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {appName}
                </Typography>
              )}
              {current ? (
                <Typography
                  variant="body2"
                  color="text.primary"
                  aria-current="page"
                  sx={{ fontWeight: 700 }}
                >
                  {current.item.label}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.primary" aria-current="page" sx={{ fontWeight: 700 }}>
                  Page not found
                </Typography>
              )}
            </Breadcrumbs>

            <Tooltip title={`Switch to ${nextMode} mode`}>
              <IconButton
                aria-label={`Switch to ${nextMode} mode`}
                onClick={() => setMode(nextMode)}
              >
                {mode === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
              </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", pl: 1 }}>
              <Avatar aria-hidden sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                {initials(user.name)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.3 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 3, sm: 5, md: 6 },
            outline: "none",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
