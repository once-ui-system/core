"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import TableRestaurant from "@mui/icons-material/TableRestaurant";
import { planner } from "@/lib/data";
import { initials } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <IconButton
      aria-label="Switch between light and dark colour scheme"
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      color="inherit"
    >
      <Box
        component="span"
        sx={(theme) => ({ display: "inline-flex", ...theme.applyStyles("dark", { display: "none" }) })}
      >
        <DarkModeOutlined />
      </Box>
      <Box
        component="span"
        sx={(theme) => ({ display: "none", ...theme.applyStyles("dark", { display: "inline-flex" }) })}
      >
        <LightModeOutlined />
      </Box>
    </IconButton>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/guests") ? "/guests" : "/";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
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
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", backgroundImage: "none" }}
      >
        <Toolbar sx={{ flexWrap: "wrap", gap: 1, px: { xs: 2, md: 3 }, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            component={NextLink}
            href="/"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none", mr: { md: 3 } }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TableRestaurant fontSize="small" />
            </Box>
            <Typography component="span" sx={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" }}>
              Seatwise
            </Typography>
          </Box>

          <Tabs
            value={current}
            aria-label="Main"
            sx={{
              order: { xs: 3, sm: 0 },
              width: { xs: "100%", sm: "auto" },
              flexGrow: { sm: 1 },
              minHeight: 48,
              "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            }}
          >
            {NAV.map((n) => (
              <Tab
                key={n.href}
                component={NextLink}
                href={n.href}
                value={n.href}
                label={n.label}
                aria-current={current === n.href ? "page" : undefined}
              />
            ))}
          </Tabs>

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />
          <ModeToggle />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pl: 0.5 }}>
            <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right", lineHeight: 1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {planner.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wedding planner
              </Typography>
            </Box>
            <Avatar
              alt={planner.name}
              sx={{ width: 34, height: 34, bgcolor: "secondary.main", color: "secondary.contrastText", fontSize: 14, fontWeight: 700 }}
            >
              {initials(planner.name)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        id="main"
        sx={{ flexGrow: 1, width: "100%", maxWidth: 1680, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}
      >
        {children}
      </Box>
    </Box>
  );
}
