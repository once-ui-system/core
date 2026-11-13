"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import DarkMode from "@mui/icons-material/DarkMode";
import EventSeat from "@mui/icons-material/EventSeat";
import Groups from "@mui/icons-material/Groups";
import LightMode from "@mui/icons-material/LightMode";
import Place from "@mui/icons-material/Place";
import TableRestaurant from "@mui/icons-material/TableRestaurant";
import { EVENT, EVENT_DATE_LABEL, PLANNER } from "@/lib/data";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Seating plan", icon: <TableRestaurant fontSize="small" /> },
  { href: "/guests", label: "Guest list", icon: <Groups fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = mode === "dark" || (mode === "system" && systemMode === "dark");
  const notice = plan.state.notice;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
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

      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", backgroundImage: "none" }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 2 }, minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: { xs: 0.5, sm: 2 } }}>
            <Box
              aria-hidden
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <EventSeat fontSize="small" />
            </Box>
            <Typography variant="h6" component="span" sx={{ letterSpacing: "-0.01em", display: { xs: "none", sm: "block" } }}>
              Seatwise
            </Typography>
          </Stack>

          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5, flex: 1, minWidth: 0 }}>
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  startIcon={item.icon}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    bgcolor: active ? tint("primary-main", 12) : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    px: { xs: 1.25, sm: 2 },
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
            Planner: <strong>{PLANNER.name}</strong>
          </Typography>
          <IconButton
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setMode(isDark ? "light" : "dark")}
            edge="end"
          >
            <DarkMode sx={(theme) => ({ display: "block", ...theme.applyStyles("dark", { display: "none" }) })} />
            <LightMode sx={(theme) => ({ display: "none", ...theme.applyStyles("dark", { display: "block" }) })} />
          </IconButton>
        </Toolbar>

        <Stack
          direction="row"
          spacing={{ xs: 1.5, md: 3 }}
          alignItems="center"
          useFlexGap
          sx={{
            px: { xs: 2, sm: 3 },
            py: 0.75,
            flexWrap: "wrap",
            borderTop: 1,
            borderColor: "divider",
            bgcolor: tint("primary-main", 5),
          }}
        >
          <Typography variant="subtitle2" component="p" sx={{ fontWeight: 700 }}>
            {EVENT.name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
            <CalendarMonth sx={{ fontSize: 16 }} />
            <Typography variant="caption">{EVENT_DATE_LABEL}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary", display: { xs: "none", sm: "flex" } }}>
            <Place sx={{ fontSize: 16 }} />
            <Typography variant="caption">{EVENT.venue}</Typography>
          </Stack>
        </Stack>
      </AppBar>

      <Box component="main" id="main" tabIndex={-1} sx={{ flex: 1, outline: "none" }}>
        {children}
      </Box>

      <Snackbar
        key={notice ? notice.id : 0}
        open={notice ? notice.open : false}
        autoHideDuration={7000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          plan.dismissNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice ? notice.severity : "info"}
          variant="filled"
          sx={{ width: "100%", alignItems: "center" }}
          action={
            notice && notice.undoable && plan.state.prev ? (
              <Button color="inherit" size="small" onClick={plan.undo}>
                Undo
              </Button>
            ) : undefined
          }
          onClose={plan.dismissNotice}
        >
          {notice ? notice.message : ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
