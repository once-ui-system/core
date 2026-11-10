"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ownerById, patients, user, type Patient } from "@/lib/data";
import { visuallyHidden } from "./ui";

function Search() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      getOptionLabel={(p) => p.name}
      noOptionsText="No patient or owner found"
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter(
          (p) => p.name.toLowerCase().includes(q) || (ownerById(p.owner)?.name.toLowerCase().includes(q) ?? false),
        );
      }}
      onChange={(_e, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {p.species}, {p.breed} · Owner {ownerById(p.owner)?.name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <>
                <WarningAmberIcon color="error" aria-hidden />
                <Box component="span" sx={visuallyHidden}>
                  Has medical alerts
                </Box>
              </>
            )}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search patient or owner"
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patients and owners" },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      sx={{ width: "100%" }}
    />
  );
}

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  return (
    <IconButton
      aria-label="Switch between light and dark appearance"
      onClick={() => setMode(effective === "dark" ? "light" : "dark")}
      sx={{ width: 44, height: 44 }}
    >
      {effective === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            component={Link}
            href="/"
            aria-label="Pawpoint, today's schedule"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none", mr: { md: 2 } }}
          >
            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
              <PetsIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: "1.25rem" }}>Pawpoint</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                Hillside Veterinary Clinic
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: "1 1 280px", order: { xs: 3, sm: 0 }, minWidth: 0, maxWidth: { sm: 520 }, width: { xs: "100%", sm: "auto" } }}>
            <Search />
          </Box>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
            <ModeToggle />
            <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role}
              </Typography>
            </Box>
            <Avatar aria-label={`${user.name}, ${user.role}`} sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
              RL
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
