"use client";

import { useState } from "react";
import SearchRounded from "@mui/icons-material/SearchRounded";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatDate, projects, statusColor, type ProjectStatus } from "@/lib/data";

type Filter = "All" | ProjectStatus;
const filters: Filter[] = ["All", "Active", "Paused", "Archived"];

export default function ProjectsTable() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const needle = query.trim().toLowerCase();
  const visible = projects.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      (needle === "" || p.name.toLowerCase().includes(needle) || p.key.toLowerCase().includes(needle)),
  );

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" } }}>
        <TextField
          label="Search projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ flex: 1, maxWidth: { md: 420 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1} role="group" aria-label="Filter by status" useFlexGap sx={{ flexWrap: "wrap" }}>
          {filters.map((name) => (
            <Chip
              key={name}
              label={name}
              clickable
              aria-pressed={filter === name}
              color={filter === name ? "primary" : "default"}
              variant={filter === name ? "filled" : "outlined"}
              onClick={() => setFilter(name)}
              sx={{ height: 44, px: 1, fontSize: "0.975rem" }}
            />
          ))}
        </Stack>
      </Stack>

      <Typography role="status" variant="body2" color="text.secondary">
        {visible.length === 1 ? "1 project" : `${visible.length} projects`}
      </Typography>

      <Card>
        <TableContainer>
          <Table aria-label="Projects">
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Key</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((project) => (
                <TableRow key={project.key} hover>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, fontWeight: 700 }}>
                    {project.key}
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <Chip label={project.status} color={statusColor[project.status]} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell align="right">{project.issues}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {formatDate(project.updated)}
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No projects match. Try a different search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
