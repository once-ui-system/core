"use client";

import * as React from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ReportIcon from "@mui/icons-material/ReportProblem";
import { getOwner, patients, searchPatients, user, today, formatShortWeekday } from "@/lib/data";
import type { Patient } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [input, setInput] = React.useState("");

  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      inputValue={input}
      onInputChange={(_, v, reason) => setInput(reason === "reset" ? "" : v)}
      onChange={(_, option) => {
        if (option) router.push(`/patients/${option.id}`);
      }}
      filterOptions={(_, state) => searchPatients(state.inputValue)}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText="No patient or owner matches that name"
      blurOnSelect
      fullWidth
      slotProps={{ paper: { sx: { mt: 0.5 } } }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        const owner = getOwner(option.owner);
        return (
          <li key={key} {...rest}>
            <Stack sx={{ width: 1, py: 0.5 }} spacing={0.25}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700 }}>{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.species}, {option.breed}
                </Typography>
                {option.alerts.length > 0 && (
                  <ReportIcon color="error" fontSize="small" titleAccess={`Medical alert: ${option.alerts.join(", ")}`} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Owner: {owner.name}
                {option.alerts.length > 0 && (
                  <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                    {" "}
                    · {option.alerts.join(" · ")}
                  </Box>
                )}
              </Typography>
            </Stack>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search patient or owner"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              sx: { borderRadius: 3, minHeight: 44, bgcolor: "background.default" },
            },
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patient or owner by name" },
          }}
        />
      )}
    />
  );
}

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const resolved = mode === "system" ? systemMode : mode;
  const dark = mounted && resolved === "dark";
  return (
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setMode(dark ? "light" : "dark")}>
        {dark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
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
          borderRadius: 2,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              gap: { xs: 1, sm: 3 },
              py: 1,
              gridTemplateColumns: { xs: "1fr auto", sm: "auto minmax(0, 1fr) auto" },
              gridTemplateAreas: { xs: '"brand actions" "search search"', sm: '"brand search actions"' },
            }}
          >
            <Box component={NextLink} href="/" sx={{ gridArea: "brand", display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none" }}>
              <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography component="span" sx={{ display: "block", fontWeight: 800, fontSize: 20, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  Pawpoint
                </Typography>
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                  Hillside Veterinary Clinic
                </Typography>
              </Box>
            </Box>
            <Box sx={{ gridArea: "search", maxWidth: 560, width: 1, justifySelf: { sm: "center" } }}>
              <PatientSearch />
            </Box>
            <Stack direction="row" spacing={1} sx={{ gridArea: "actions", alignItems: "center", justifySelf: "end" }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", lg: "block" }, mr: 1 }}>
                {formatShortWeekday(today)}
              </Typography>
              <ModeToggle />
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", width: 36, height: 36, fontSize: 14, fontWeight: 700 }} aria-hidden>
                  RL
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </AppBar>
      <Container component="main" id="main" tabIndex={-1} maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
