"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LightModeIcon from "@mui/icons-material/LightMode";
import { event, planner } from "@/lib/data";
import { formatEventDate, initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  if (!mode) return <Box sx={{ width: 40, height: 40 }} />;
  const resolved = mode === "system" ? systemMode : mode;
  const dark = resolved === "dark";
  return (
    <IconButton
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(dark ? "light" : "dark")}
    >
      {dark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { notice, clearNotice, undo, canUndo } = usePlan();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          "&:focus": { left: 8, top: 8, zIndex: 2000, bgcolor: "background.paper", p: 1.5, borderRadius: 1 },
        }}
      >
        Skip to content
      </Box>
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          "@media print": { display: "none" },
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1600 }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 3 }} sx={{ py: 1.25, flexWrap: "wrap", rowGap: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 34, height: 34 }} variant="rounded">
                <EventSeatIcon fontSize="small" />
              </Avatar>
              <Typography component="span" sx={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
                Seatwise
              </Typography>
            </Stack>
            <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {event.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="div">
                {formatEventDate()} · {event.venue}
              </Typography>
            </Box>
            <Box sx={{ flex: { xs: 1, md: "none" } }} />
            <Box component="nav" aria-label="Main">
              <Stack direction="row" spacing={0.5}>
                {NAV.map((n) => {
                  const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                  return (
                    <Button
                      key={n.href}
                      component={Link}
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      variant={active ? "contained" : "text"}
                      color={active ? "primary" : "inherit"}
                      sx={{ minHeight: 40 }}
                    >
                      {n.label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ModeToggle />
              <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }} aria-label={planner.name}>
                {initials(planner.name)}
              </Avatar>
            </Stack>
          </Stack>
          <Box sx={{ display: { xs: "block", md: "none" }, pb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {event.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatEventDate()} · {event.venue}
            </Typography>
          </Box>
        </Container>
      </Box>
      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        {children}
      </Box>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") clearNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ alignItems: "center" }}
          action={
            <Stack direction="row" spacing={0.5}>
              {notice?.undo && canUndo ? (
                <Button color="inherit" size="small" onClick={undo}>
                  Undo
                </Button>
              ) : null}
              <Button color="inherit" size="small" onClick={clearNotice}>
                Dismiss
              </Button>
            </Stack>
          }
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
