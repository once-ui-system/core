"use client";

import { Box, Container, List, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { FeaturePanel } from "./FeaturePanel";
import classes from "./Home.module.css";

interface FeatureSectionProps {
  id: string;
  kicker: string;
  title: string;
  body: string;
  points: readonly string[];
  reverse: boolean;
}

export function FeatureSection({
  id,
  kicker,
  title,
  body,
  points,
  reverse,
}: FeatureSectionProps) {
  return (
    <Box
      component="section"
      className={classes.feature}
      aria-labelledby={`feature-${id}`}
    >
      <Container>
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="xl"
          verticalSpacing="xl"
          className={reverse ? classes.reverse : undefined}
        >
          <Stack gap="md" justify="center" className={classes.copy}>
            <Text className={classes.kicker}>{kicker}</Text>
            <Title order={2} id={`feature-${id}`} className={classes.featureTitle}>
              {title}
            </Title>
            <Text c="dimmed">{body}</Text>
            <List spacing="xs" size="sm">
              {points.map((point) => (
                <List.Item key={point}>{point}</List.Item>
              ))}
            </List>
          </Stack>
          <Box className={classes.visual}>
            <FeaturePanel id={id} />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
