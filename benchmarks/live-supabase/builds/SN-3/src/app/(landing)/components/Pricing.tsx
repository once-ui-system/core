import { landingCopy } from "@/content";
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { SectionHeader } from "./SectionHeader";

const copy = landingCopy.pricing;

export const Pricing = ({ ...flex }: React.ComponentProps<typeof Column>) => (
  <Column fillWidth horizontal="center" gap="48" {...flex}>
    <SectionHeader label={copy.label} title={copy.title} description={copy.description} />
    <Row fillWidth maxWidth="m" gap="12" s={{ direction: "column" }}>
      {copy.plans.map((plan) => (
        <Column
          key={plan.name}
          fillWidth
          gap="24"
          padding="32"
          radius="xl"
          border={plan.highlight ? "brand-alpha-medium" : "neutral-alpha-medium"}
          background="page"
        >
          <Column gap="4">
            <Heading as="h3" variant="heading-default-xl" onBackground={plan.highlight ? "brand-medium" : "neutral-medium"}>
              {plan.name}
            </Heading>
            <Text variant="heading-default-s">
              {plan.price}{" "}
              {plan.unit && (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {plan.unit}
                </Text>
              )}
            </Text>
          </Column>
          <Column flex={1} gap="12">
            {plan.features.map((feature) => (
              <Row key={feature} vertical="center" gap="12">
                <Icon name="check" size="s" onBackground="brand-medium" />
                <Text onBackground="neutral-medium" variant="body-default-s">
                  {feature}
                </Text>
              </Row>
            ))}
          </Column>
          <Button href="/auth" variant={plan.highlight ? "primary" : "secondary"} fillWidth arrowIcon>
            Get started
          </Button>
        </Column>
      ))}
    </Row>
  </Column>
);
