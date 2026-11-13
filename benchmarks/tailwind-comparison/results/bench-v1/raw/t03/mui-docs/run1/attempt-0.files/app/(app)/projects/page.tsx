import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import StatusChip from "@/components/StatusChip";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {projects.length} projects across your workspace.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects" sx={{ minWidth: 520 }}>
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
            {projects.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace" }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <StatusChip status={p.status} />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
