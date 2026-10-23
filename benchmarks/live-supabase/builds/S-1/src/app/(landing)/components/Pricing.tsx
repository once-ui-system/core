import { Button, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    unit: "",
    note: "Up to 3 members",
    features: ["Shared notebooks", "Instant search", "Roles and permissions"],
  },
  {
    name: "Team",
    price: "$8",
    unit: "per member per month",
    note: "For teams of any size",
    features: ["Everything in Free", "Unlimited members", "Invite people by link"],
  },
];

export const Pricing: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => (
  <Column fillWidth gap="32" {...flex}>
    <Heading as="h2" variant="display-strong-xs" align="center">
      Pricing
    </Heading>
    <Grid columns="2" s={{ columns: 1 }} gap="16" fillWidth>
      {PLANS.map((plan) => (
        <Column
          key={plan.name}
          gap="20"
          padding="24"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <Heading as="h3" variant="heading-strong-l">
            {plan.name}
          </Heading>
          <Column gap="4">
            <Row gap="8" vertical="end">
              <Heading as="p" variant="display-strong-s">
                {plan.price}
              </Heading>
              {plan.unit && (
                <Text variant="body-default-s" onBackground="neutral-weak" paddingBottom="8">
                  {plan.unit}
                </Text>
              )}
            </Row>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {plan.note}
            </Text>
          </Column>
          <Column gap="8" flex={1}>
            {plan.features.map((feature) => (
              <Row key={feature} gap="8" vertical="center">
                <Icon name="check" size="xs" onBackground="brand-medium" />
                <Text variant="body-default-s">{feature}</Text>
              </Row>
            ))}
          </Column>
          <Button href="/auth" variant={plan.name === "Team" ? "primary" : "secondary"} fillWidth>
            Get started
          </Button>
        </Column>
      ))}
    </Grid>
  </Column>
);
