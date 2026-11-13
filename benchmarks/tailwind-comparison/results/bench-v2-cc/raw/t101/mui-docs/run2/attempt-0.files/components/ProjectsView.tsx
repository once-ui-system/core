"use client";

import { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "@/components/PageHeader";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

type StatusFilter = "All" | ProjectStatus;

const statusOptions: StatusFilter[] = ["All", "Active", "Paused", "Archived"];
const statusColor: Record<ProjectStatus, "primary" | "warning" | "default"> = {
  Active: "primary",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (status === "All" || project.status === status) &&
        `${project.key} ${project.name}`.toLowerCase().includes(needle),
    );
  }, [query, status]);

  return (
    <>
      <PageHeader title="Projects" description="Every project in the workspace, with its open issues." />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "flex-end", mb: 1 }}>
        <TextField
          id="project-filter"
          label="Filter projects"
          placeholder="Name or key"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 280px" }, my: 0 }}
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
          id="project-status"
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          sx={{ flex: { xs: "1 1 100%", sm: "0 0 160px" }, my: 0 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Typography role="status" variant="caption" color="text.secondary" sx={{ pb: 1 }}>
          Showing {filtered.length} of {projects.length} projects
        </Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table aria-label="Projects" sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell align="right">Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.key} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {project.key}
                  </TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <Chip label={project.status} color={statusColor[project.status]} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{project.issues}</TableCell>
                  <TableCell align="right">{formatDate(project.updated)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No projects match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
