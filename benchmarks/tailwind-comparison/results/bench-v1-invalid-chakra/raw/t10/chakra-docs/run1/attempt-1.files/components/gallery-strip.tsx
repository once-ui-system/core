import { Box, Grid } from "@chakra-ui/react";
import { HomeVisual } from "./home-visual";

const CAPTIONS = [
  "Living room",
  "Kitchen",
  "Main bedroom",
  "Bathroom",
  "Outlook",
];

export function GalleryStrip({ id, title }: { id: string; title: string }) {
  return (
    <Box as="section" aria-label={`Photo gallery for ${title}`}>
      <Grid
        templateColumns={{ base: "1fr 1fr", md: "2fr 1fr 1fr" }}
        templateRows={{ base: "180px 100px", md: "170px 170px" }}
        gap="2"
      >
        <Box
          gridColumn={{ base: "1 / span 2", md: "1" }}
          gridRow={{ base: "1", md: "1 / span 2" }}
          rounded="lg"
          overflow="hidden"
        >
          <HomeVisual
            id={id}
            variant={0}
            label={`${CAPTIONS[0]} of ${title} (placeholder)`}
          />
        </Box>
        {CAPTIONS.slice(1, 5).map((caption, i) => (
          <Box
            key={caption}
            rounded="lg"
            overflow="hidden"
            display={{ base: i < 2 ? "block" : "none", md: "block" }}
          >
            <HomeVisual
              id={id}
              variant={i + 1}
              label={`${caption} of ${title} (placeholder)`}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
