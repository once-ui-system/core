"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDate, type Project } from "@/lib/data";

const statusColor = { Active: "success", Paused: "warning", Archived: "default" } as const;

const columns: GridColDef<Project>[] = [
  { field: "key", headerName: "Key", width: 90 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <Chip size="small" label={params.value as string} color={statusColor[params.row.status]} variant="outlined" />
    ),
  },
  { field: "issues", headerName: "Open issues", type: "number", width: 130 },
  {
    field: "updated",
    headerName: "Updated",
    width: 140,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export default function ProjectsTable({ rows }: { rows: Project[] }) {
  return (
    <Box sx={{ height: 380, width: "100%", minWidth: 0 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.key}
        hideFooter
        disableRowSelectionOnClick
        aria-label="Projects"
        sx={{ borderRadius: 1 }}
      />
    </Box>
  );
}
