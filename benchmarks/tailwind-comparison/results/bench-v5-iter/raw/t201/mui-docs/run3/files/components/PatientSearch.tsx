"use client";

import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Patient, ownerById, patients } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      getOptionLabel={(p) => p.name}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter(
          (p) => p.name.toLowerCase().includes(q) || (ownerById(p.owner)?.name.toLowerCase().includes(q) ?? false),
        );
      }}
      noOptionsText="No patient or owner matches"
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      sx={{ width: "100%", maxWidth: 480 }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ gap: 1.5, minHeight: 52 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {p.name}{" "}
                <Typography component="span" variant="body2" color="text.secondary">
                  {p.species}, {p.breed}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner: {ownerById(p.owner)?.name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <ReportProblemIcon color="error" titleAccess={`Medical alert: ${p.alerts.join("; ")}`} />
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Find a patient or owner"
          size="small"
          slotProps={{
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
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper", minHeight: 44 } }}
        />
      )}
    />
  );
}
