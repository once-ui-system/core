"use client";

import {
  Background,
  BlobFx,
  Button,
  Column,
  CountFx,
  Heading,
  Icon,
  Mask,
  MatrixFx,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type BillingPeriod = "monthly" | "annual";

interface Tier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo builders launching their first product.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["1 project", "Core components", "Community support"],
    cta: "Start free",
    href: "#",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For teams shipping production apps with Pro blocks.",
    monthlyPrice: 29,
    annualPrice: 24,
    features: ["Unlimited projects", "147+ Pro blocks", "Priority support", "Stack access"],
    cta: "Start trial",
    href: "#",
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For agencies and startups with multiple workspaces.",
    monthlyPrice: 79,
    annualPrice: 66,
    features: ["Everything in Pro", "Shared workspaces", "Team billing", "SSO on request"],
    cta: "Contact sales",
    href: "#",
  },
];

function TierCard({ tier, billing }: { tier: Tier; billing: BillingPeriod }) {
  const price = billing === "monthly" ? tier.monthlyPrice : tier.annualPrice;
  const period = billing === "monthly" ? "/mo" : "/mo, billed yearly";

  return (
    <Column
      fillWidth
      flex={1}
      padding="l"
      gap="16"
      radius="l"
      border={tier.featured ? "brand-alpha-strong" : "neutral-alpha-weak"}
      background={tier.featured ? "brand-alpha-weak" : "transparent"}
      overflow="hidden"
      position="relative"
    >
      {tier.featured && (
        <>
          <BlobFx
            position="absolute"
            top="0"
            right="0"
            data-solid="inverse"
            translateX="30%"
            translateY="-30%"
          />
          <Mask position="absolute" fill left="0" top="0" x={100} y={0} radius={50}>
            <MatrixFx
              data-solid="color"
              pointerEvents="none"
              position="absolute"
              fill
              colors={["brand-solid-strong"]}
              spacing={3}
              size={1.5}
              flicker
              bulge={{
                type: "wave",
                duration: 4,
                intensity: 15,
                repeat: true,
              }}
            />
          </Mask>
          <Tag
            position="absolute"
            top="0"
            left="l"
            translateY="-50%"
            data-border="rounded"
            scheme="brand"
          >
            Best value
          </Tag>
        </>
      )}
      <Background
        pointerEvents="none"
        position="absolute"
        radius="l"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 100,
          y: 0,
          colorStart: tier.featured ? "page-background" : "static-transparent",
        }}
      />
      <Column gap="8">
        <Text
          variant="label-default-s"
          onBackground={tier.featured ? "brand-weak" : "neutral-weak"}
        >
          {tier.name}
        </Text>
        <Row vertical="end" gap="4">
          <Heading as="h3" variant="display-strong-xs">
            $<CountFx value={price} />
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak" paddingBottom="4">
            {period}
          </Text>
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {tier.description}
        </Text>
      </Column>
      <Column fillWidth flex={1} gap="8" paddingY="12">
        {tier.features.map((feature) => (
          <Row key={feature} vertical="center" gap="8">
            <Icon name="check" size="xs" onBackground="brand-weak" />
            <Text variant="label-default-s">{feature}</Text>
          </Row>
        ))}
      </Column>
      <Button
        fillWidth
        rounded
        href={tier.href}
        variant={tier.featured ? "primary" : "secondary"}
        weight="default"
      >
        {tier.cta}
      </Button>
    </Column>
  );
}

export const Plans7 = (flex: React.ComponentProps<typeof Column>) => {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Column fillWidth maxWidth={48} gap="12" horizontal="center" align="center">
        <Tag size="s" scheme="brand" data-border="rounded">
          Pricing
        </Tag>
        <Heading as="h2" variant="display-strong-m" align="center" wrap="balance">
          Plans that grow with your product
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" align="center" wrap="balance">
          Switch billing anytime. Save 20% when you pay annually.
        </Text>
        <Row gap="12" vertical="center" wrap horizontal="center">
          <SegmentedControl
            buttons={[
              { label: "Monthly", value: "monthly" },
              { label: "Annual", value: "annual" },
            ]}
            value={billing}
            onChange={(value) => setBilling(value as BillingPeriod)}
          />
          {billing === "annual" && (
            <Tag size="s" scheme="success" data-border="rounded">
              Save 20%
            </Tag>
          )}
        </Row>
      </Column>

      <Row fillWidth gap="16" s={{ direction: "column" }}>
        {tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} billing={billing} />
        ))}
      </Row>
    </Column>
  );
};
