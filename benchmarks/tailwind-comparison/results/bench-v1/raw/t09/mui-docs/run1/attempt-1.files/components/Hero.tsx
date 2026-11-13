import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { brand } from "../lib/data";

export default function Hero() {
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 14 },
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(60% 60% at 80% 0%, rgba(232, 89, 12, 0.18) 0%, rgba(232, 89, 12, 0) 70%)",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Typography variant="overline" color="primary.light" component="p">
          {brand.name} · for small software teams
        </Typography>
        <Typography
          id="hero-heading"
          variant="h1"
          component="h1"
          sx={{ mt: 1, maxWidth: 860 }}
        >
          {brand.tagline}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mt: 3, maxWidth: 640, fontFamily: "body1.fontFamily", fontWeight: 400, lineHeight: 1.6 }}
        >
          One quiet place for the numbers and the bugs behind your product. Set
          up in an afternoon, read by the whole team every week.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 5 }}
        >
          <Button
            href="/pricing"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Start free
          </Button>
          <Button href="/pricing#compare" variant="outlined" color="inherit" size="large">
            Compare plans
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
