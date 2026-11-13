import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { logos } from "../lib/data";

export default function CustomerLogos() {
  return (
    <Box
      component="section"
      aria-labelledby="logos-heading"
      sx={{ py: { xs: 5, md: 6 }, borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Typography
          id="logos-heading"
          variant="overline"
          component="h2"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center" }}
        >
          Trusted by small teams at
        </Typography>
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
            mt: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: { xs: 4, md: 7 },
            rowGap: 2,
          }}
        >
          {logos.map((name) => (
            <Typography
              key={name}
              component="li"
              variant="h5"
              sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              {name}
            </Typography>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
