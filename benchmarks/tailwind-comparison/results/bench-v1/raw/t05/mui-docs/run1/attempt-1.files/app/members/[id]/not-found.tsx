import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/LinkButton";

export default function NotFound() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        Member not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This person is not on your team, or they were removed.
      </Typography>
      <LinkButton href="/" variant="contained">
        Back to team
      </LinkButton>
    </Container>
  );
}
