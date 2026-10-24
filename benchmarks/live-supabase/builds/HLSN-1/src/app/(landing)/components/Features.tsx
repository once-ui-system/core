import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { features } from "@/content/landing";

export function Features() {
  return (
    <Grid as="section" fillWidth maxWidth="l" columns={3} s={{ columns: 1 }} m={{ columns: 1 }} gap="16">
      {features.map((feature) => (
        <Column key={feature.title} gap="12" padding="24" radius="l" border="neutral-alpha-weak" background="surface">
          <Heading as="h2" variant="heading-strong-s">
            {feature.title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {feature.description}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}
