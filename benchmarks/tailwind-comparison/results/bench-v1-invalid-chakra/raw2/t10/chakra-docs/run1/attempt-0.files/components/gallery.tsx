import { Box, Grid } from "@chakra-ui/react";
import { Placeholder } from "@/components/placeholder";

const LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export function Gallery({ id, title }: { id: string; title: string }) {
  return (
    <Box as="section" aria-label={`Photo gallery for ${title}`}>
      <Grid
        gap={2}
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        templateRows={{ md: "repeat(2, 130px)" }}
      >
        <Box gridColumn={{ base: "span 2", md: "span 2" }} gridRow={{ md: "span 2" }}>
          <Placeholder id={id} variant={0} height={{ base: "200px", md: "100%" }} label={`${title}: ${LABELS[0]} (placeholder)`} />
        </Box>
        {LABELS.slice(1).map((label, i) => (
          <Box key={label}>
            <Placeholder id={id} variant={i + 1} height={{ base: "100px", md: "100%" }} label={`${title}: ${label} (placeholder)`} />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
