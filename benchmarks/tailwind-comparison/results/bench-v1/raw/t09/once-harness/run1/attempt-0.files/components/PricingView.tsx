"use client";

import {
  AccordionGroup,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { comparison, faq, formatPrice, monthlyPrice, plans, yearlyTotal } from "../lib/data";

type Billing = "monthly" | "yearly";

const columns = [
  { key: "feature", header: "Feature" },
  { key: "free", header: "Free" },
  { key: "team", header: "Team" },
  { key: "business", header: "Business" },
];

export function PricingView() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const yearly = billing === "yearly";

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingTop="80" paddingBottom="104" gap="104">
      {/* Intro + plans */}
      <Column maxWidth="l" gap="40">
        <Column gap="16" horizontal="center" maxWidth="40rem" marginX="auto">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" textVariant="display-strong-l" align="center">
            Simple plans for small teams
          </Heading>
          <Text as="p" textVariant="body-default-l" onBackground="neutral-weak" align="center">
            Start free. Pay yearly and get two months free.
          </Text>
        </Column>

        <Column gap="8" horizontal="center" maxWidth="20rem" marginX="auto">
          <SegmentedControl
            aria-label="Billing period"
            value={billing}
            onValueChange={(value) => setBilling(value as Billing)}
            buttons={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Text
            as="p"
            textVariant="label-default-s"
            onBackground={yearly ? "brand-medium" : "neutral-weak"}
            aria-live="polite"
            align="center"
          >
            {yearly ? "Two months free, billed yearly" : "Switch to yearly for two months free"}
          </Text>
        </Column>

        <Grid as="ul" columns="3" m={{ columns: 1 }} gap="24">
          {plans.map((plan) => {
            const price = monthlyPrice(plan, yearly);
            const free = plan.priceMonth === 0;
            return (
              <Column
                as="li"
                key={plan.name}
                background="surface"
                border={plan.highlight ? "brand-alpha-medium" : true}
                radius="l"
                padding="32"
                overflow="hidden"
              >
                {plan.highlight && (
                  <Background
                    position="absolute"
                    top="0"
                    left="0"
                    fill
                    pointerEvents="none"
                    gradient={{
                      display: true,
                      colorStart: "brand-alpha-medium",
                      colorEnd: "static-transparent",
                      x: "50%",
                      y: 0,
                      width: "200%",
                      height: "60%",
                      opacity: 50,
                    }}
                  />
                )}
                <Column zIndex={1} fill gap="24">
                  <Row horizontal="between" vertical="center" gap="8">
                    <Heading as="h2" textVariant="heading-strong-l">
                      {plan.name}
                    </Heading>
                    {plan.highlight && <Tag tone="brand" size="s" label="Most popular" />}
                  </Row>
                  <Text as="p" textVariant="body-default-s" onBackground="neutral-weak">
                    {plan.blurb}
                  </Text>
                  <Column gap="4">
                    <Row gap="8" style={{ alignItems: "baseline" }}>
                      <Text textVariant="display-strong-s">${formatPrice(price)}</Text>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {free ? "forever" : `/ month, ${plan.seats}`}
                      </Text>
                    </Row>
                    <Text
                      as="p"
                      textVariant="body-default-xs"
                      onBackground="neutral-weak"
                      aria-live="polite"
                    >
                      {free
                        ? plan.seats
                        : yearly
                          ? `$${yearlyTotal(plan)} per seat, billed yearly`
                          : "Billed monthly"}
                    </Text>
                  </Column>
                  <Column as="ul" flex={1} gap="12">
                    {plan.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" />
                        <Text textVariant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    href="/pricing"
                    variant={plan.highlight ? "primary" : "secondary"}
                    data-border="rounded"
                  >
                    {plan.cta}
                  </Button>
                </Column>
              </Column>
            );
          })}
        </Grid>
      </Column>

      {/* Comparison table */}
      <Column maxWidth="l" gap="32">
        <Heading as="h2" id="compare-title" textVariant="display-strong-xs">
          Compare plans, feature by feature
        </Heading>
        <Table
          fillWidth
          aria-labelledby="compare-title"
          columns={columns}
          rows={[...comparison]}
          getRowId={(row) => row.feature}
        />
      </Column>

      {/* FAQ */}
      <Column maxWidth="m" gap="32">
        <Heading as="h2" textVariant="display-strong-xs">
          Questions, answered
        </Heading>
        <AccordionGroup
          items={faq.map((item) => ({
            title: item.q,
            content: (
              <Text as="p" textVariant="body-default-m" onBackground="neutral-weak">
                {item.a}
              </Text>
            ),
          }))}
        />
      </Column>
    </Column>
  );
}
