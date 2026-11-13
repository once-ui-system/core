"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PatientSearch from "./PatientSearch";
import { CLINIC, CLINIC_FULL, USER } from "@/lib/data";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  return (
    <Box sx={{ minHeight: "100vh" }}>
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
          p: 1.5,
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
        sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 }, py: 1.25 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1.5, md: 3 } }}>
            <Box
              component={Link}
              href="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", minHeight: 44 }}
            >
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: "1.15rem" }}>{CLINIC}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  {CLINIC_FULL}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ order: { xs: 3, md: 0 }, flex: { xs: "1 1 100%", md: "1 1 auto" }, display: "flex", justifyContent: { md: "center" } }}>
              <PatientSearch />
            </Box>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                aria-label={effective === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setMode(effective === "dark" ? "light" : "dark")}
              >
                {effective === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {USER.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {USER.role}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }} aria-label={USER.name}>
                RL
              </Avatar>
            </Box>
          </Box>
        </Container>
      </AppBar>
      <Container component="main" id="main" maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
