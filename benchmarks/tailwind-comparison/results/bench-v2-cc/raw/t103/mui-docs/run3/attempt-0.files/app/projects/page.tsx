"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import PageHeader from "../../components/PageHeader";
import { formatDate, projects, type ProjectStatus } from "../../lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | ProjectStatus>("All");

  const rows = projects.filter((p) => {
    const q = query.trim().toLowerCase();
    const matches = !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
    return matches && (status === "All" || p.status === status);
  });

  return (
    <>
      <PageHeader title="Projects" description="Every project in the Acme Labs workspace and where it stands." />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          label="Search projects"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: "1 1 220px", maxWidth: { sm: 320 } }}
        />
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value as "All" | ProjectStatus)}
          sx={{ flex: "0 1 160px", minWidth: 140 }}
        >
          {["All", "Active", "Paused", "Archived"].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Issues</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.key}</TableCell>
                <TableCell component="th" scope="row">
                  {p.name}
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" color={statusColor[p.status]} label={p.status} />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No projects match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
