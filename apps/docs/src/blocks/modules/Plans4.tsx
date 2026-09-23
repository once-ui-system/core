"use client";

import { Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type React from "react";

const plans = {
  free: {
    name: "Free",
    href: "#",
    color: "neutral" as "neutral" | "brand" | "accent",
    gradient: false,
    price: {
      original: "0",
      discounted: "0",
    },
    features: ["Comprehensive variables", "Fluid component system"],
  },
  pro: {
    name: "Pro",
    href: "#",
    color: "brand" as "neutral" | "brand" | "accent",
    gradient: false,
    price: {
      original: "120",
      discounted: "80",
    },
    features: [
      "Comprehensive variables",
      "Fluid component system",
      "Landing page examples",
      "Marketing resources",
      "Data viz module",
      "Social module",
      "Regular updates",
    ],
  },
  team: {
    name: "Team",
    href: "#",
    color: "neutral" as "neutral" | "brand" | "accent",
    gradient: false,
    price: {
      original: "240",
      discounted: "160",
    },
    features: [
      "Comprehensive variables",
      "Fluid component system",
      "Landing page examples",
      "Marketing resources",
    ],
  },
};

interface PlanCardProps extends React.ComponentProps<typeof Row> {
  id: string;
  plan: (typeof plans)[keyof typeof plans];
}

const PlanCard: React.FC<PlanCardProps> = ({ id, plan, ...rest }) => {
  const textColor = `${plan.color}-weak` as const;

  return (
    <Column id={plan.name} border minWidth={16} fillWidth {...rest}>
      <Column fill>
        <Column paddingX="l" paddingY="24" gap="4" fillWidth borderBottom>
          <Heading as="h3" align="left" onBackground={textColor} variant="heading-default-xs">
            {plan.name}
          </Heading>
          <Text align="left" variant="heading-default-xl">
            {plan.price.original !== plan.price.discounted && (
              <Text onBackground="neutral-weak" style={{ textDecoration: "line-through" }}>
                ${plan.price.original}
              </Text>
            )}{" "}
            ${plan.price.discounted}{" "}
            <Text onBackground="neutral-strong" variant="body-default-s">
              / year
            </Text>
          </Text>
        </Column>
        <Column paddingX="l" paddingY="24" fill overflowY="auto" gap="12" borderBottom>
          {plan.features.map((feature, index) => (
            <Row key={index} vertical="center" gap="12">
              <Icon name="check" size="s" onBackground={textColor} />
              <Text align="left" onBackground="neutral-medium" variant="body-default-s">
                {feature}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
      <Flex fillWidth padding="24">
        <Button
          id={`${id}-button-4`}
          href={plan.href}
          variant="secondary"
          weight="default"
          arrowIcon
        >
          Get started
        </Button>
      </Flex>
    </Column>
  );
};

export const Plans4: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row fillWidth gap="-1" overflowX="auto" style={{ isolation: "isolate" }} {...flex}>
      <PlanCard id="free" plan={plans.free} />
      <PlanCard id="pro" plan={plans.pro} zIndex={1} />
      <PlanCard id="team" plan={plans.team} />
    </Row>
  );
};
