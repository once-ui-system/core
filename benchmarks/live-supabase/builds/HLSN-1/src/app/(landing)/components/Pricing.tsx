import { Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import plans from "@/resources/plans.json";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Pricing() {
  const free = plans.free;
  const team = plans.team;

  return (
    <Grid as="section" fillWidth maxWidth="m" columns={2} s={{ columns: 1 }} gap="16">
      <Column gap="16" padding="32" radius="l" border="neutral-alpha-weak" background="surface">
        <Heading as="h2" variant="heading-strong-m">
          {free.name}
        </Heading>
        <Row vertical="end" gap="4">
          <Text variant="display-strong-s">{money.format(free.amount / 100)}</Text>
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {free.description} Up to {free.members} members.
        </Text>
        <Button variant="secondary" label="Get started" href="/auth" />
      </Column>
      <Column gap="16" padding="32" radius="l" border="brand-alpha-medium" background="surface">
        <Heading as="h2" variant="heading-strong-m">
          {team.name}
        </Heading>
        <Row vertical="end" gap="4">
          <Text variant="display-strong-s">{money.format(team.amount / 100)}</Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            per member per month
          </Text>
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {team.description}
        </Text>
        <Button variant="primary" label="Get started" href="/auth" />
      </Column>
    </Grid>
  );
}
