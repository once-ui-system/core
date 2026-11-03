import { Container, List, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { Feature } from "@/lib/data";
import classes from "./FeatureSection.module.css";

interface FeatureSectionProps {
  feature: Feature;
  reversed?: boolean;
}

export function FeatureSection({ feature, reversed = false }: FeatureSectionProps) {
  const titleId = `feature-${feature.id}-title`;

  return (
    <section aria-labelledby={titleId} className={classes.section}>
      <Container>
        <div className={classes.grid} data-reversed={reversed || undefined}>
          <div className={classes.copy}>
            <Text className={classes.eyebrow}>{feature.eyebrow}</Text>
            <Title order={2} id={titleId} mb="md">
              {feature.title}
            </Title>
            <Text c="dimmed" size="lg" lh={1.6}>
              {feature.body}
            </Text>
          </div>

          <div className={classes.panel}>
            <List
              spacing="md"
              size="md"
              icon={
                <IconCheck
                  size={18}
                  stroke={2.25}
                  className={classes.check}
                  aria-hidden="true"
                />
              }
            >
              {feature.points.map((point) => (
                <List.Item key={point}>{point}</List.Item>
              ))}
            </List>
          </div>
        </div>
      </Container>
    </section>
  );
}
