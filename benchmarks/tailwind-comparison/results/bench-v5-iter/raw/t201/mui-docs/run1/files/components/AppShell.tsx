"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PatientSearch from "./PatientSearch";
import { useClinic } from "@/lib/clinic-store";
import { CLINIC, CLINIC_SITE, TODAY, USER, formatDate, fromMin } from "@/lib/data";

function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  if (!effective) return <Box sx={{ width: 40, height: 40 }} />;
  const next = effective === "dark" ? "light" : "dark";
  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton aria-label={`Switch to ${next} mode`} onClick={() => setMode(next)}>
        {effective === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { now } = useClinic();
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
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: { xs: 1.5, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" }, py: { xs: 1, md: 0 }, minHeight: { md: 68 } }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", order: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center" }}>
              <PetsIcon />
            </Box>
            <Box>
              <Typography component="span" sx={{ display: "block", fontWeight: 800, lineHeight: 1.1, fontSize: "1.1rem" }}>
                {CLINIC}
              </Typography>
              <Typography component="span" variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                {CLINIC_SITE}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: { md: 1 }, maxWidth: { md: 520 }, width: { xs: "100%", md: "auto" }, order: { xs: 4, md: 2 } }}>
            <PatientSearch />
          </Box>
          <Box sx={{ flex: 1, order: 3, display: { md: "none" } }} />
          <Box sx={{ ml: { md: "auto" }, order: 3, textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {fromMin(now)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(TODAY, false)}
            </Typography>
          </Box>
          <Box sx={{ order: 3 }}>
            <ThemeToggle />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, order: 3 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontSize: "0.9rem" }} aria-hidden>
              RL
            </Avatar>
            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {USER.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {USER.role}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" id="main" maxWidth="xl" tabIndex={-1} sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
