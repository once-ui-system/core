"use client";

import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import Pets from "@mui/icons-material/Pets";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import NextLink from "next/link";
import * as React from "react";
import PatientSearch from "@/components/PatientSearch";
import { CLINIC_NAME, USER } from "@/lib/data";

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const resolved = mode === "system" ? systemMode : mode;
  const dark = resolved === "dark";
  if (!mounted) return <Box sx={{ width: 40, height: 40 }} />;
  return (
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setMode(dark ? "light" : "dark")}>
        {dark ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const initials = USER.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
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
        Skip to main content
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: { xs: 1, md: 3 }, flexWrap: "wrap", py: { xs: 1, md: 1.25 }, px: { xs: 2, md: 3 } }}>
          <Box
            component={NextLink}
            href="/"
            aria-label="Pawpoint, today's schedule"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", mr: "auto" }}
          >
            <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
              <Pets />
            </Avatar>
            <Box>
              <Typography variant="h6" component="span" sx={{ display: "block", lineHeight: 1.1 }}>
                Pawpoint
              </Typography>
              <Typography variant="caption" sx={{ display: "block", lineHeight: 1.2, color: "text.secondary" }}>
                {CLINIC_NAME}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ order: { xs: 3, md: 0 }, width: { xs: "100%", md: 420 } }}>
            <PatientSearch />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <ModeToggle />
            <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", color: "background.paper", fontSize: 14 }}>{initials}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                {USER.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {USER.role}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" tabIndex={-1} sx={{ outline: "none" }}>
        {children}
      </Box>
    </Box>
  );
}
