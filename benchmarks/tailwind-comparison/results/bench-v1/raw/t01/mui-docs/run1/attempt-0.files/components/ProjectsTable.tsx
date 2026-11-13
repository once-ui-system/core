"use client";

import * as React from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

const columns: GridColDef<(typeof projects)[number]>[] = [
  { field: "key", headerName: "Key", width: 90 },
  { field: "name", headerName: "Project", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.value as ProjectStatus}
        color={statusColor[params.value as ProjectStatus]}
        variant="outlined"
      />
    ),
  },
  {
    field: "issues",
    headerName: "Open issues",
    type: "number",
    width: 130,
  },
  {
    field: "updated",
    headerName: "Last updated",
    width: 150,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export default function ProjectsTable() {
  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={projects}
        columns={columns}
        getRowId={(row) => row.key}
        disableRowSelectionOnClick
        hideFooter
        autoHeight
        aria-label="Projects"
      />
    </Box>
  );
}
