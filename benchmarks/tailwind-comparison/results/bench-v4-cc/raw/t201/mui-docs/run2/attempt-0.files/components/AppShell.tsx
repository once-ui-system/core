"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AlertChips } from "@/components/AlertChips";
import { CLINIC_NAME, USER, ownerById, patients, type Patient } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [input, setInput] = React.useState("");

  return (
    <Autocomplete<Patient>
      fullWidth
      autoHighlight
      openOnFocus
      value={null}
      inputValue={input}
      options={patients}
      onInputChange={(_e, v, reason) => {
        if (reason !== "reset") setInput(v);
      }}
      onChange={(_e, patient) => {
        if (patient) {
          setInput("");
          router.push(`/patients/${patient.id}`);
        }
      }}
      getOptionLabel={(p) => p.name}
      filterOptions={(options, state) => {
        const q = state.inputValue.trim().toLowerCase();
        if (!q) return options;
        return options.filter((p) => {
          const o = ownerById(p.owner);
          return (
            p.name.toLowerCase().includes(q) ||
            o.name.toLowerCase().includes(q) ||
            o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
          );
        });
      }}
      noOptionsText="No patient or owner matches that name"
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        const o = ownerById(p.owner);
        return (
          <li key={key} {...rest}>
            <Stack spacing={0.5} sx={{ width: 1, py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="baseline" useFlexGap flexWrap="wrap">
                <Typography fontWeight={700}>{p.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.species}, {p.breed} · Owner {o.name}
                </Typography>
              </Stack>
              <AlertChips alerts={p.alerts} />
            </Stack>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search patient or owner"
          size="small"
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patient or owner by name" },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ "& .MuiInputBase-root": { minHeight: 44 } }}
        />
      )}
    />
  );
}

function ModeToggle() {
  const { colorScheme, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const dark = mounted && colorScheme === "dark";
  return (
    <IconButton
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(dark ? "light" : "dark")}
      sx={{ width: 44, height: 44 }}
    >
      {dark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Link
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.25 }}>
          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              columnGap: 2,
              rowGap: 1,
              gridTemplateColumns: { xs: "1fr auto", md: "auto minmax(0, 560px) 1fr" },
              gridTemplateAreas: {
                xs: '"brand tools" "search search"',
                md: '"brand search tools"',
              },
            }}
          >
            <Link
              component={NextLink}
              href="/"
              underline="none"
              color="inherit"
              aria-label="Pawpoint, today's schedule"
              sx={{ gridArea: "brand", display: "flex", alignItems: "center", gap: 1.25 }}
            >
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography fontWeight={800} fontSize={20} lineHeight={1.1}>
                  Pawpoint
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  {CLINIC_NAME}
                </Typography>
              </Box>
            </Link>
            <Box sx={{ gridArea: "search" }}>
              <PatientSearch />
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end" sx={{ gridArea: "tools" }}>
              <ModeToggle />
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                  RL
                </Avatar>
                <Box sx={{ display: { xs: "none", lg: "block" } }}>
                  <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                    {USER.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {USER.role}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Container component="main" id="main" tabIndex={-1} maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
