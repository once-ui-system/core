"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, projects, type ProjectStatus } from "../../lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("");
  const term = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) => !term || p.name.toLowerCase().includes(term) || p.key.toLowerCase().includes(term),
  );

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Projects
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Every project your team tracks in Lumen.
        </Typography>
      </Box>

      <TextField
        label="Search projects"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden />
              </InputAdornment>
            ),
          },
        }}
      />

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 640 }}>
            <caption style={{ position: "absolute", left: -9999 }}>Projects and their open issues</caption>
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
                  <TableCell sx={{ fontWeight: 700 }}>{p.key}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color={statusColor[p.status]} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{p.issues}</TableCell>
                  <TableCell>{formatDate(p.updated)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      No projects match &ldquo;{query}&rdquo;.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
