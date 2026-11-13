"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, projects } from "@/lib/data";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All");

  const rows = projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      `${p.key} ${p.name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {rows.length} of {projects.length} projects shown.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <TextField
          label="Search projects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 240 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {["All", "Active", "Paused", "Archived"].map((s) => (
            <MenuItem key={s} value={s} dense>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Open issues</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace" }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    variant="outlined"
                    color={p.status === "Active" ? "primary" : p.status === "Paused" ? "warning" : "default"}
                  />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                  No projects match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
