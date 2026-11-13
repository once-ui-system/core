"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
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
import PageHeading from "@/components/PageHeading";
import { formatDate, projects } from "@/lib/data";

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));

  return (
    <Box>
      <PageHeading title="Projects" subtitle={`${projects.length} projects in the Acme Labs workspace`} />
      <TextField
        label="Filter projects"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 1.5, width: { xs: "100%", sm: 280 } }}
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
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    variant={p.status === "Active" ? "filled" : "outlined"}
                    color={p.status === "Active" ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.issues}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No projects match &ldquo;{query}&rdquo;.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
