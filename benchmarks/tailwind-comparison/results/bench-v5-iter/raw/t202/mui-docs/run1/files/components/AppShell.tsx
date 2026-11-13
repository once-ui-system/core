"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import { initials, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--mui-palette-primary-main)" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="var(--mui-palette-primary-contrastText)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        return (
          <circle
            key={i}
            cx={(16 + Math.cos(a) * 9.5).toFixed(2)}
            cy={(16 + Math.sin(a) * 9.5).toFixed(2)}
            r="1.8"
            fill="var(--mui-palette-primary-contrastText)"
          />
        );
      })}
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode } = useColorScheme();
  const dark = mode === "dark";

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
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
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
          <Box
            component={Link}
            href="/"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none" }}
            aria-label="Seatwise home"
          >
            <Mark />
            <Typography variant="h6" component="span" sx={{ fontWeight: 750, letterSpacing: "-0.02em", display: { xs: "none", sm: "inline" } }}>
              Seatwise
            </Typography>
          </Box>
          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5, ml: { sm: 2 } }}>
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    px: { xs: 1.25, sm: 2 },
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? "action.selected" : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.label}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={dark ? "Switch to light theme" : "Switch to dark theme"}>
            <IconButton
              onClick={() => setMode(dark ? "light" : "dark")}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {dark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
              {initials(planner.name)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: "none", md: "block" } }}>
              {planner.name}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
