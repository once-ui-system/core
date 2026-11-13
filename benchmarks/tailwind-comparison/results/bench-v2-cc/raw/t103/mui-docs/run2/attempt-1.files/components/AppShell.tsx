"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/icons-material/Menu";
import MenuOpen from "@mui/icons-material/MenuOpen";
import SideNav from "./SideNav";
import { crumbsFor } from "./nav-config";
import { user } from "../lib/data";

const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 68;

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

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const crumbs = crumbsFor(pathname);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          "& .MuiDrawer-paper": {
            width,
            overflowX: "hidden",
            boxSizing: "border-box",
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
          },
        }}
      >
        <SideNav pathname={pathname} collapsed={collapsed} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SideNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: 1,
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <Menu />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <Menu /> : <MenuOpen />}
            </IconButton>

            <Breadcrumbs aria-label="Breadcrumb" sx={{ flex: 1, minWidth: 0 }}>
              <MuiLink component={Link} href="/">
                Lumen
              </MuiLink>
              {crumbs.map((crumb, i) =>
                i === crumbs.length - 1 ? (
                  <Typography key={crumb} color="text.primary" aria-current="page" noWrap>
                    {crumb}
                  </Typography>
                ) : (
                  <Typography key={crumb} color="text.secondary" noWrap>
                    {crumb}
                  </Typography>
                ),
              )}
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <Avatar
                alt={user.name}
                sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14, fontWeight: 700 }}
              >
                {initials(user.name)}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flex: 1, width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 }, outline: "none" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
