"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import GroupsIcon from "@mui/icons-material/Groups";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { app, planner } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const nav = [
  { href: "/", label: "Plan", icon: <TableRestaurantIcon fontSize="small" /> },
  { href: "/guests", label: "Guests", icon: <GroupsIcon fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { notice, dismissNotice } = usePlan();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
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
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: { xs: 0, sm: 2 } }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <EventSeatIcon fontSize="small" />
            </Box>
            <Typography variant="h2" component="span" sx={{ display: { xs: "none", sm: "block" } }}>
              {app.name}
            </Typography>
          </Box>
          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: 0.5 }}>
            {nav.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.href}
                  startIcon={n.icon}
                  aria-current={active ? "page" : undefined}
                  color={active ? "primary" : "inherit"}
                  variant={active ? "contained" : "text"}
                  sx={{ minHeight: 40, ...(active ? {} : { color: "text.secondary" }) }}
                >
                  {n.label}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {planner.name}
          </Typography>
          <Avatar
            aria-label={planner.name}
            sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "#fff" }}
          >
            HB
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" sx={{ flex: 1, px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
      <Snackbar
        key={notice?.id}
        open={notice !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") dismissNotice();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice?.severity ?? "info"}
          variant="filled"
          onClose={dismissNotice}
          sx={{ width: "100%" }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
