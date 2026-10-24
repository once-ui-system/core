import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";
import { SectionHeader } from "./SectionHeader";

const { steps } = landingCopy;

export const Steps = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader
      label={steps.label}
      title={steps.title}
    />
    <Grid fillWidth columns={3} m={{ columns: 1 }} gap="12">
      {steps.items.map((step, index) => (
        <Column key={step.title} fillWidth gap="12" padding="32" radius="xl" border="neutral-alpha-weak">
          <Row fillWidth horizontal="between" vertical="center" marginBottom="16">
            <Icon name={step.icon} size="s" onBackground="brand-medium" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {String(index + 1).padStart(2, "0")}
            </Text>
          </Row>
          <Heading as="h3" variant="heading-strong-m">
            {step.title}
          </Heading>
          <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
            {step.description}
          </Text>
        </Column>
      ))}
    </Grid>
  </Column>
);
