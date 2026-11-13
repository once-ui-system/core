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
