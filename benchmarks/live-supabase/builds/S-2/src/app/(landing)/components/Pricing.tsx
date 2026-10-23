import { Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";

const plans = [
  {
    name: "Free",
    price: "$0",
    unit: "",
    detail: "Up to 3 members",
    cta: "Start for free",
  },
  {
    name: "Team",
    price: "$8",
    unit: "per member per month",
    detail: "For teams of any size",
    cta: "Get Team",
  },
];

export function Pricing(props: React.ComponentProps<typeof Column>) {
  return (
    <Column fillWidth gap="32" {...props}>
      <Heading as="h2" variant="display-strong-xs" align="center">
        Pricing
      </Heading>
      <Grid columns="2" s={{ columns: 1 }} gap="16" fillWidth maxWidth="m" style={{ alignSelf: "center" }}>
        {plans.map((plan) => (
          <Column key={plan.name} gap="16" padding="24" radius="l" border="neutral-alpha-medium" fillWidth>
            <Heading as="h3" variant="heading-strong-l">
              {plan.name}
            </Heading>
            <Row vertical="end" gap="8" wrap>
              <Heading as="p" variant="display-strong-s">
                {plan.price}
              </Heading>
              {plan.unit && (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {plan.unit}
                </Text>
              )}
            </Row>
            <Text variant="body-default-m" onBackground="neutral-medium">
              {plan.detail}
            </Text>
            <Button href="/auth" variant={plan.name === "Team" ? "primary" : "secondary"} fillWidth>
              {plan.cta}
            </Button>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
