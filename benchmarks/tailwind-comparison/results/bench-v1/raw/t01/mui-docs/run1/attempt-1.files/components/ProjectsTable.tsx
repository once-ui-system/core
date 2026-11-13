"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDate, projects, type Project, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

const columns: GridColDef<Project>[] = [
  { field: "key", headerName: "Key", width: 90 },
  { field: "name", headerName: "Project", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.row.status}
        color={statusColor[params.row.status]}
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
    <Box sx={{ width: "100%", height: 400 }}>
      <DataGrid
        rows={projects}
        columns={columns}
        getRowId={(row) => row.key}
        disableRowSelectionOnClick
        hideFooter
      />
    </Box>
  );
}
