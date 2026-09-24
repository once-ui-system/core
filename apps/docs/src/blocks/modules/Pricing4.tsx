"use client";

import { Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";

type PlanKey = "starter" | "pro" | "enterprise";

interface ComparisonRow {
  category: string;
  description: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const plans: Record<PlanKey, { label: string; price: string; highlight?: boolean }> = {
  starter: { label: "Starter", price: "$0" },
  pro: { label: "Pro", price: "$49", highlight: true },
  enterprise: { label: "Enterprise", price: "Custom" },
};

const comparisonData: ComparisonRow[] = [
  {
    category: "Core components",
    description: "Pre-styled UI primitives and layout system",
    starter: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "Theme tokens",
    description: "Semantic colors, spacing, and typography",
    starter: true,
    pro: true,
    enterprise: true,
  },
  {
    category: "Pro blocks",
    description: "Copy-paste sections and full page layouts",
    starter: false,
    pro: true,
    enterprise: true,
  },
  {
    category: "Team seats",
    description: "Collaborators with shared design tokens",
    starter: "1",
    pro: "5",
    enterprise: "Unlimited",
  },
  {
    category: "Priority support",
    description: "Direct access to the core team",
    starter: false,
    pro: false,
    enterprise: true,
  },
  {
    category: "Custom onboarding",
    description: "Guided setup for your design system",
    starter: false,
    pro: false,
    enterprise: true,
  },
];

const renderCell = (value: boolean | string) => {
  if (value === true) {
    return <Icon onBackground="brand-medium" name="check" size="s" />;
  }
  if (value === false) {
    return <Icon onBackground="neutral-weak" name="close" size="s" />;
  }
  return (
    <Text variant="label-default-s" onBackground="neutral-strong">
      {value}
    </Text>
  );
};

export const Pricing4 = (flex: React.ComponentProps<typeof Column>) => {
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("pro");

  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <Column maxWidth={40} gap="12" horizontal="center">
        <Tag scheme="brand" size="s">
          Compare plans
        </Tag>
        <Heading as="h2" align="center" variant="display-strong-m" wrap="balance">
          Everything included, side by side
        </Heading>
        <Text align="center" onBackground="neutral-medium" variant="body-default-l" wrap="balance">
          A full-width feature matrix with sticky tier headers and mobile plan switching.
        </Text>
      </Column>

      <Column maxWidth="l" translateY={-2} border radius="xl" background="page" fillWidth>
        <Row
          hide
          s={{ hide: false }}
          fillWidth
          borderBottom="neutral-alpha-medium"
          paddingX="20"
          paddingY="12"
          vertical="center"
          horizontal="between"
          background="page"
          position="sticky"
          topRadius="xl"
          top="0"
          zIndex={1}
        >
          <Row gap="4">
            {(Object.keys(plans) as PlanKey[]).map((key) => (
              <Button
                key={key}
                size="s"
                variant={mobilePlan === key ? "primary" : "tertiary"}
                onClick={() => setMobilePlan(key)}
                style={{ opacity: mobilePlan === key ? 1 : 0.7 }}
              >
                {plans[key].label}
              </Button>
            ))}
          </Row>
          <Text variant="label-default-m" onBackground="neutral-weak">
            {plans[mobilePlan].price}
          </Text>
        </Row>

        <Row
          s={{ hide: true }}
          fillWidth
          borderBottom="neutral-alpha-medium"
          topRadius="xl"
          background="page"
          position="sticky"
          top="0"
          zIndex={2}
        >
          <Column flex={2} padding="24" />
          <Row flex={3}>
            {(Object.keys(plans) as PlanKey[]).map((key) => (
              <Row
                key={key}
                fillWidth
                padding="24"
                vertical="center"
                horizontal="between"
                borderLeft="neutral-alpha-medium"
              >
                <Text
                  variant="heading-strong-xs"
                  onBackground={plans[key].highlight ? "brand-strong" : "neutral-strong"}
                >
                  {plans[key].label}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {plans[key].price}
                </Text>
              </Row>
            ))}
          </Row>
        </Row>

        {comparisonData.map((item, index) => (
          <Row
            key={item.category}
            fillWidth
            borderBottom={index !== comparisonData.length - 1 ? "neutral-alpha-medium" : undefined}
          >
            <Column flex={2} padding="24" vertical="center">
              <Text variant="label-strong-m" onBackground="neutral-strong">
                {item.category}
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {item.description}
              </Text>
            </Column>

            <Row flex={3} s={{ hide: true }}>
              {(Object.keys(plans) as PlanKey[]).map((key) => (
                <Column
                  key={key}
                  fillWidth
                  padding="24"
                  vertical="center"
                  horizontal="center"
                  borderLeft="neutral-alpha-medium"
                >
                  {renderCell(item[key])}
                </Column>
              ))}
            </Row>

            <Row hide s={{ hide: false }} flex={1}>
              <Column
                flex={1}
                padding="20"
                center
                borderLeft="neutral-alpha-medium"
                style={{ minWidth: 0 }}
              >
                {renderCell(item[mobilePlan])}
              </Column>
            </Row>
          </Row>
        ))}
      </Column>
    </Column>
  );
};
