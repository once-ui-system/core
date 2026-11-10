"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PeopleIcon from "@mui/icons-material/People";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { initials, planner } from "@/lib/data";
import { tint } from "@/lib/ui";

const NAV = [
  { href: "/", label: "Plan", icon: <EventSeatIcon fontSize="small" /> },
  { href: "/guests", label: "Guests", icon: <PeopleIcon fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { colorScheme, setMode } = useColorScheme();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          top: 8,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { left: 8 },
        }}
      >
        Skip to content
      </Box>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          displayPrint: "none",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 3 }}
          sx={{ px: { xs: 1.5, md: 3 }, minHeight: 60 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              aria-hidden
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
              <EventSeatIcon fontSize="small" />
            </Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Seatwise
            </Typography>
          </Stack>
          <Box component="nav" aria-label="Main">
            <Stack direction="row" spacing={0.5}>
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Button
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    startIcon={item.icon}
                    aria-current={active ? "page" : undefined}
                    color={active ? "primary" : "inherit"}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      bgcolor: active ? tint("primary-main", 12) : "transparent",
                      color: active ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton
            aria-label="Toggle light and dark mode"
            onClick={() => setMode(colorScheme === "dark" ? "light" : "dark")}
            sx={{ width: 44, height: 44 }}
          >
            <Brightness4Icon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "#fff" }}>
              {initials(planner.name)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {planner.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wedding planner
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Box component="main" id="main" sx={{ flex: 1, px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
