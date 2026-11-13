import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { comparison, plans } from "../lib/data";

const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <>
        <CheckIcon aria-hidden fontSize="small" sx={{ color: "primary.light" }} />
        <Box component="span" sx={visuallyHidden}>
          Included
        </Box>
      </>
    ) : (
      <>
        <RemoveIcon aria-hidden fontSize="small" sx={{ color: "text.disabled" }} />
        <Box component="span" sx={visuallyHidden}>
          Not included
        </Box>
      </>
    );
  }
  return <>{value}</>;
}

export default function ComparisonTable() {
  return (
    <Box
      component="section"
      id="compare"
      aria-labelledby="compare-heading"
      sx={{ py: { xs: 6, md: 9 }, borderTop: 1, borderColor: "divider", scrollMarginTop: 72 }}
    >
      <Container maxWidth="lg">
        <Typography id="compare-heading" variant="h2" component="h2" sx={{ mb: 4 }}>
          Compare plans
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 560 }}>
            <Box component="caption" sx={visuallyHidden}>
              Feature comparison of the Free, Team and Business plans
            </Box>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Feature</TableCell>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.name}
                    scope="col"
                    align="center"
                    sx={plan.highlight ? { color: "primary.light" } : undefined}
                  >
                    {plan.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.feature} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.feature}
                  </TableCell>
                  <TableCell align="center">
                    <Cell value={row.free} />
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: "action.hover" }}>
                    <Cell value={row.team} />
                  </TableCell>
                  <TableCell align="center">
                    <Cell value={row.business} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
