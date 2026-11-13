"use client";

import {
  type Billing,
  comparisonHeaders,
  comparisonRows,
  faq,
  monthlyEquivalent,
  plans,
  yearlyTotal,
} from "@/lib/data";
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

const formatPrice = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

export function PricingContent() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <Column fillWidth horizontal="center" gap="104" paddingBottom="104">
      {/* Intro and plans */}
      <Column fillWidth horizontal="center" paddingX="24" paddingTop="80">
        <Column maxWidth="l" gap="40">
          <Column gap="16" maxWidth={40}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Pricing
            </Text>
            <Heading as="h1" variant="display-strong-l">
              Start free. Pay when your team grows.
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Every plan includes the dashboards. Choose yearly billing and get two months free.
            </Text>
          </Column>

          <Row horizontal="start">
            <SegmentedControl
              aria-label="Billing period"
              value={billing}
              onChange={(value) => setBilling(value as Billing)}
              buttons={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly, 2 months free" },
              ]}
            />
          </Row>

          <Grid columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }}>
            {plans.map((plan) => {
              const perMonth = monthlyEquivalent(plan.priceMonth, billing);
              const isFree = plan.priceMonth === 0;
              return (
                <Column
                  key={plan.name}
                  as="section"
                  aria-label={`${plan.name} plan`}
                  background="surface"
                  border={plan.highlight ? "brand-alpha-strong" : true}
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
                        x: 50,
                        y: 0,
                        width: 200,
                        height: 60,
                        opacity: 50,
                      }}
                    />
                  )}
                  <Column zIndex={1} fill gap="24">
                    <Row fillWidth horizontal="between" vertical="center">
                      <Heading as="h2" variant="heading-strong-l">
                        {plan.name}
                      </Heading>
                      {plan.highlight && <Tag scheme="brand" size="s" label="Most popular" />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {plan.description}
                    </Text>
                    <Column gap="4">
                      <Row gap="4" style={{ alignItems: "baseline" }}>
                        <Text variant="display-strong-s">${formatPrice(perMonth)}</Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {isFree ? "forever" : "/ seat / month"}
                        </Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                        {isFree
                          ? "1 seat"
                          : billing === "yearly"
                            ? `Billed $${yearlyTotal(plan.priceMonth)} per seat each year`
                            : "Billed monthly"}
                      </Text>
                    </Column>
                    <Column as="ul" flex={1} gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                      {plan.features.map((feature) => (
                        <Row as="li" key={feature} gap="12" vertical="center">
                          <Icon name="check" size="xs" onBackground="brand-medium" />
                          <Text variant="body-default-s">{feature}</Text>
                        </Row>
                      ))}
                    </Column>
                    <Button
                      fillWidth
                      href="/pricing"
                      variant={plan.highlight ? "primary" : "secondary"}
                      label={plan.cta}
                    />
                  </Column>
                </Column>
              );
            })}
          </Grid>
        </Column>
      </Column>

      {/* Feature comparison */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" gap="32">
          <Heading as="h2" variant="display-strong-xs">
            Compare the plans
          </Heading>
          <Table
            fillWidth
            data={{
              headers: comparisonHeaders.map((header) => ({
                content: header,
                key: header.toLowerCase(),
              })),
              rows: comparisonRows,
            }}
          />
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="32">
          <Heading as="h2" variant="display-strong-xs">
            Questions, answered
          </Heading>
          <AccordionGroup
            fillWidth
            items={faq.map((item) => ({
              title: item.q,
              content: (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.a}
                </Text>
              ),
            }))}
          />
        </Column>
      </Column>
    </Column>
  );
}
