"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  List,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { plans, yearlyPrice, type Plan } from "@/lib/data";
import classes from "./Pricing.module.css";

function priceFor(plan: Plan, yearly: boolean): number {
  return yearly ? yearlyPrice(plan.priceMonth) : plan.priceMonth;
}

function unitLabel(plan: Plan, yearly: boolean): string {
  if (plan.priceMonth === 0) return "forever";
  const period = yearly ? "year" : "month";
  return plan.seats === "per seat" ? `per seat / ${period}` : `/ ${period}`;
}

export function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <Container className={classes.section}>
      <Stack gap="lg">
        <Group gap="sm" align="center">
          <Switch
            size="md"
            checked={yearly}
            onChange={(event) => setYearly(event.currentTarget.checked)}
            label="Bill yearly"
            aria-describedby="yearly-note"
          />
          <Badge variant="light" size="lg" id="yearly-note">
            2 months free
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" role="status" aria-live="polite">
          Showing {yearly ? "yearly" : "monthly"} prices
          {yearly ? ": pay for 10 months, get 12." : "."}
        </Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              padding="xl"
              className={classes.card}
              data-highlight={plan.highlight ? "" : undefined}
              aria-labelledby={`plan-${plan.name}`}
            >
              <Stack gap="md" style={{ flex: 1 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Title order={2} fz="h3" id={`plan-${plan.name}`}>
                    {plan.name}
                  </Title>
                  {plan.highlight ? <Badge>Most popular</Badge> : null}
                </Group>

                <div>
                  <Group gap="xs" align="baseline">
                    <span className={classes.price}>
                      ${priceFor(plan, yearly)}
                    </span>
                    <Text size="sm" c="dimmed">
                      {unitLabel(plan, yearly)}
                    </Text>
                  </Group>
                  {yearly && plan.priceMonth > 0 ? (
                    <Text size="xs" c="dimmed" mt={4}>
                      Instead of ${plan.priceMonth * 12} billed monthly
                    </Text>
                  ) : null}
                </div>

                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <IconCheck
                      size={16}
                      stroke={2}
                      className={classes.check}
                      aria-hidden="true"
                    />
                  }
                  style={{ flex: 1 }}
                >
                  {plan.features.map((feature) => (
                    <List.Item key={feature}>{feature}</List.Item>
                  ))}
                </List>

                <Button
                  component={Link}
                  href="/"
                  variant={plan.highlight ? "filled" : "default"}
                  fullWidth
                >
                  {plan.priceMonth === 0 ? "Start free" : `Choose ${plan.name}`}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
