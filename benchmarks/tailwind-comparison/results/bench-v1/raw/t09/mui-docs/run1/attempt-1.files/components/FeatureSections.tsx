import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { featureSections } from "../lib/data";

export default function FeatureSections() {
  return (
    <Box component="section" aria-label="Features">
      {featureSections.map((feature, index) => {
        const headingId = `feature-${index}-heading`;
        const reversed = index % 2 === 1;
        return (
          <Box
            key={feature.title}
            component="article"
            aria-labelledby={headingId}
            sx={{
              py: { xs: 7, md: 10 },
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: reversed ? "background.paper" : "transparent",
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: "grid",
                  gap: { xs: 4, md: 8 },
                  alignItems: "center",
                  gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
                }}
              >
                <Box sx={{ order: { xs: 0, md: reversed ? 1 : 0 } }}>
                  <Typography variant="overline" color="primary.light" component="p">
                    {feature.eyebrow}
                  </Typography>
                  <Typography id={headingId} variant="h2" component="h2" sx={{ mt: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: "1.0625rem" }}>
                    {feature.body}
                  </Typography>
                  <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", p: 0, m: 0, mt: 3 }}>
                    {feature.points.map((point) => (
                      <Stack
                        key={point}
                        component="li"
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckIcon
                          aria-hidden
                          fontSize="small"
                          sx={{ color: "primary.light", mt: "2px" }}
                        />
                        <Typography>{point}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Card sx={{ order: { xs: 1, md: reversed ? 0 : 1 } }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: "h1.fontFamily",
                        fontWeight: 700,
                        fontSize: "clamp(2.75rem, 2rem + 3vw, 4.5rem)",
                        lineHeight: 1,
                        color: "primary.light",
                      }}
                    >
                      {feature.stat.value}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                      {feature.stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Container>
          </Box>
        );
      })}
    </Box>
  );
}
