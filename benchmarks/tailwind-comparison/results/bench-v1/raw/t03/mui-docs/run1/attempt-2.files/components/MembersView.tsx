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
import { formatDate, members } from "@/lib/data";

export default function MembersView() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Members
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {members.length} people have access to this workspace. Use the command palette to invite more.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Members" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell component="th" scope="row">
                  {m.name}
                </TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  <StatusChip status={m.status} />
                </TableCell>
                <TableCell>{formatDate(m.joined)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
