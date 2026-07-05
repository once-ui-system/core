"use client";

/**
 * Gold example: pricing
 * Target: three tiers, highlighted middle, comparison table, split FAQ, ambient CTA
 */
import { useEffect, useRef, useState } from "react";
import {
  AccordionGroup,
  Background,
  BlobFx,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  MatrixFx,
  RevealFx,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";

type Billing = "monthly" | "yearly";

const tiers = [
  {
    name: "Starter",
    description: "For solo builders shipping their first product.",
    price: { monthly: 19, yearly: 15 },
    features: ["3 projects", "5 team members", "Core analytics"],
    cta: "Start with Starter",
  },
  {
    name: "Pro",
    description: "For growing teams that need speed and depth.",
    price: { monthly: 49, yearly: 39 },
    features: ["Unlimited projects", "25 team members", "API access", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with security and scale requirements.",
    features: ["Unlimited everything", "SSO / SAML", "Dedicated success manager"],
    cta: "Talk to sales",
  },
];

export function PricingExample() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const tiersRef = useRef<HTMLDivElement>(null);
  const tiersInViewport = useInViewport(tiersRef);
  const [tiersSeen, setTiersSeen] = useState(false);
  useEffect(() => {
    if (tiersInViewport) setTiersSeen(true);
  }, [tiersInViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      <Column fillWidth center overflow="hidden" paddingY="80">
        <MatrixFx
          position="absolute"
          top="0"
          left="0"
          fill
          flicker
          size={1.5}
          spacing={8}
          colors={["brand-solid-strong"]}
          bulge={{ type: "wave", duration: 3, intensity: 20, repeat: true }}
        />
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{ display: true, colorStart: "page-background", x: 0, y: 50, width: 150, height: 300 }}
        />
        <Column zIndex={1} center gap="24" padding="48" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-xl" align="center">
            Pay for momentum, not seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free, scale when you're ready.
          </Text>
        </Column>
      </Column>

      <Column fillWidth horizontal="center">
        <Column fillWidth maxWidth="l" gap="40">
          <Row fillWidth horizontal="between" vertical="end" gap="24" s={{ direction: "column", horizontal: "start" }}>
            <Heading as="h2" variant="display-strong-xs">
              Three plans, one decision
            </Heading>
            <SegmentedControl
              selected={billing}
              onToggle={(value) => setBilling(value as Billing)}
              buttons={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly −20%" },
              ]}
            />
          </Row>

          <Grid ref={tiersRef} columns="3" gap="24" s={{ columns: 1 }}>
            {tiers.map((tier, index) => (
              <RevealFx key={tier.name} fill trigger={tiersSeen} translateY="8" delay={index * 0.1}>
                <Column
                  fill
                  background="surface"
                  border={tier.highlighted ? "brand-alpha-medium" : "neutral-alpha-weak"}
                  radius="l"
                  padding="32"
                  overflow="hidden"
                >
                  {tier.highlighted && (
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
                      <Heading as="h3" variant="heading-strong-m">
                        {tier.name}
                      </Heading>
                      {tier.highlighted && <Tag variant="brand" size="s" label="Most popular" />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {tier.description}
                    </Text>
                    {tier.price ? (
                      <Row vertical="end" gap="2">
                        <Text variant="display-strong-s">$</Text>
                        <CountFx variant="display-strong-s" value={tier.price[billing]} effect="wheel" speed={400} />
                        <Text variant="label-default-s" onBackground="neutral-weak" paddingBottom="4" paddingLeft="4">
                          / mo
                        </Text>
                      </Row>
                    ) : (
                      <Text variant="display-strong-s">Custom</Text>
                    )}
                    <Column flex={1} gap="12">
                      {tier.features.map((feature) => (
                        <Row key={feature} gap="12" vertical="center">
                          <Icon name="checkbox" size="xs" onBackground="brand-medium" />
                          <Text variant="body-default-s">{feature}</Text>
                        </Row>
                      ))}
                    </Column>
                    <Button fillWidth variant={tier.highlighted ? "primary" : "secondary"} arrowIcon={tier.highlighted}>
                      {tier.cta}
                    </Button>
                  </Column>
                </Column>
              </RevealFx>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" background="neutral-alpha-weak" paddingY="80" paddingX="24">
        <Column fillWidth maxWidth="l" gap="40">
          <Heading as="h2" variant="display-strong-xs">
            Every feature, side by side
          </Heading>
          <Table
            fillWidth
            data={{
              headers: [
                { content: "Feature", key: "feature" },
                { content: "Starter", key: "starter" },
                { content: "Pro", key: "pro" },
              ],
              rows: [
                ["Projects", "3", "Unlimited"],
                ["API access", "—", "✓"],
              ],
            }}
          />
        </Column>
      </Column>

      <Column fillWidth horizontal="center">
        <Column fillWidth maxWidth="l" radius="xl" border="neutral-alpha-weak" overflow="hidden" padding="64" center>
          <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
          <Column zIndex={1} center gap="24" maxWidth={40}>
            <Heading as="h2" variant="display-strong-s" align="center">
              Ship your next launch on Pro
            </Heading>
            <Button arrowIcon>Start free trial</Button>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
