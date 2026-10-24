import { Button, Card, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";

/** Two plans: Free at $0, Team at $8 per member per month. */
export const Pricing: React.FC<React.ComponentProps<typeof Column>> = (props) => {
  const { pricing } = landingCopy;
  return (
    <Column fillWidth gap="32" {...props}>
      <Column gap="8" horizontal="center" align="center">
        <Heading as="h2" variant="heading-strong-xl" align="center">
          {pricing.title}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" align="center">
          {pricing.description}
        </Text>
      </Column>
      <Grid fillWidth columns={2} m={{ columns: 1 }} s={{ columns: 1 }} gap="16">
        {pricing.plans.map((plan) => (
          <Card
            key={plan.name}
            direction="column"
            padding="32"
            gap="20"
            radius="l"
            border={plan.highlighted ? "brand-medium" : "neutral-alpha-weak"}
            fillWidth
          >
            <Heading as="h3" variant="heading-strong-l">
              {plan.name}
            </Heading>
            <Row vertical="end" gap="8">
              <Heading as="p" variant="display-strong-s">
                {plan.price}
              </Heading>
              {plan.period && (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {plan.period}
                </Text>
              )}
            </Row>
            <Column as="ul" gap="8" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {plan.features.map((feature) => (
                <Row as="li" key={feature} gap="8" vertical="center">
                  <Icon name="check" size="xs" onBackground="brand-weak" />
                  <Text variant="body-default-m">{feature}</Text>
                </Row>
              ))}
            </Column>
            <Button
              fillWidth
              label={plan.cta.label}
              href={plan.cta.href}
              variant={plan.highlighted ? "primary" : "secondary"}
            />
          </Card>
        ))}
      </Grid>
    </Column>
  );
};
