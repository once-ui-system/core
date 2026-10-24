import { Column, Grid, Heading, Icon, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";
import { SectionHeader } from "./SectionHeader";

const { features } = landingCopy;

export const Features = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label={features.label}
      title={features.title}
      description={features.description}
    />
    <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
      {features.items.map((feature) => (
        <Column
          key={feature.title}
          fillWidth
          gap="8"
          padding="32"
          radius="xl"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Icon
            name={feature.icon}
            size="s"
            padding="8"
            radius="m"
            border="brand-alpha-weak"
            background="brand-alpha-weak"
            onBackground="brand-medium"
            marginBottom="16"
          />
          <Heading as="h3" variant="heading-strong-m">
            {feature.title}
          </Heading>
          <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
            {feature.description}
          </Text>
        </Column>
      ))}
    </Grid>
  </Column>
);
