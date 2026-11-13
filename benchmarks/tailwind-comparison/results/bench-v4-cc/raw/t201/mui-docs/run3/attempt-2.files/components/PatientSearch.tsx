"use client";

import SearchIcon from "@mui/icons-material/Search";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { PATIENTS, ownerOf, type Patient } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete
      options={PATIENTS}
      value={null}
      blurOnSelect
      clearOnBlur
      autoHighlight
      fullWidth
      noOptionsText="No patient or owner with that name"
      getOptionLabel={(p: Patient) => p.name}
      filterOptions={(options, state) => {
        const q = state.inputValue.trim().toLowerCase();
        if (!q) return options;
        return options.filter((p) => p.name.toLowerCase().includes(q) || ownerOf(p).name.toLowerCase().includes(q));
      }}
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...optionProps } = props;
        const owner = ownerOf(p);
        return (
          <Box component="li" key={key} {...optionProps} sx={{ gap: 1.5, py: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {p.species}, {p.breed} · Owner {owner.name}
              </Typography>
              {p.alerts.length > 0 && (
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}>
                  <WarningAmberRounded fontSize="inherit" sx={{ color: "error.main" }} />
                  Alert: {p.alerts.join("; ")}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search patient or owner"
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
        />
      )}
    />
  );
}
