"use client";

import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { ownerById, patients, type Patient } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      autoHighlight
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      noOptionsText="No patient or owner with that name"
      getOptionLabel={(p) => `${p.name} (${ownerById(p.owner).name})`}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter((p) => p.name.toLowerCase().includes(q) || ownerById(p.owner).name.toLowerCase().includes(q));
      }}
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {p.species} · {p.breed} · {ownerById(p.owner).name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main" }}>
                <ReportProblemIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                </Typography>
              </Box>
            )}
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
