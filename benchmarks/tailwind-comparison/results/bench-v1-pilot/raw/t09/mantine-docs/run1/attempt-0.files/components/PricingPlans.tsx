"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  List,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { plans, yearlyPerMonth, yearlyTotal, type Plan } from "@/lib/data";
import classes from "./PricingPlans.module.css";

type Billing = "monthly" | "yearly";

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const yearly = billing === "yearly";
  const perMonth = yearly ? yearlyPerMonth(plan.priceMonth) : plan.priceMonth;
  const isFree = plan.priceMonth === 0;
  const unit = isFree ? "1 seat" : plan.seats;
  const titleId = `plan-${plan.name.toLowerCase()}`;

  return (
    <Card
      className={classes.card}
      data-highlight={plan.highlight || undefined}
      aria-labelledby={titleId}
      component="article"
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} id={titleId}>
            {plan.name}
          </Title>
          {plan.highlight ? <Badge variant="filled">Most popular</Badge> : null}
        </Group>

        <div>
          <Group gap={6} align="baseline" wrap="nowrap">
            <Text className={classes.price} aria-label={`${formatPrice(perMonth)} per month`}>
              {formatPrice(perMonth)}
            </Text>
            <Text c="dimmed" size="sm">
              / month · {unit}
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mt={4} mih={20} aria-live="polite">
            {isFree
              ? "Free forever"
              : yearly
                ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly`
                : "Billed monthly"}
          </Text>
        </div>

        <List
          spacing="xs"
          size="sm"
          center
          icon={<IconCheck size={16} stroke={2.25} className={classes.check} aria-hidden="true" />}
          className={classes.features}
        >
          {plan.features.map((feature) => (
            <List.Item key={feature}>{feature}</List.Item>
          ))}
        </List>

        <Button
          component={Link}
          href="/pricing"
          variant={plan.highlight ? "filled" : "default"}
          fullWidth
          aria-label={`${isFree ? "Start free with" : "Choose"} the ${plan.name} plan`}
        >
          {isFree ? "Start free" : `Choose ${plan.name}`}
        </Button>
      </Stack>
    </Card>
  );
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section aria-label="Plans and prices" className={classes.section}>
      <Container>
        <Group justify="center" mb="xl">
          <SegmentedControl
            value={billing}
            onChange={(value) => setBilling(value as Billing)}
            aria-label="Billing period"
            data={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · 2 months free" },
            ]}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} billing={billing} />
          ))}
        </SimpleGrid>

        <Text size="sm" c="dimmed" ta="center" mt="lg">
          {billing === "yearly"
            ? "Yearly prices are shown per month and include two months free."
            : "Switch to yearly billing to get two months free."}
        </Text>
      </Container>
    </section>
  );
}
