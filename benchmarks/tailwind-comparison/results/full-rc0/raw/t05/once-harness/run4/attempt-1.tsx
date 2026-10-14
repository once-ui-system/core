"use client";

import {
  Background,
  Badge,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  LetterFx,
  Line,
  RevealFx,
  Row,
  Text,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Customer = {
  name: string;
  icon: IconName;
};

const customers: Customer[] = [
  { name: "Northwind", icon: "globe" },
  { name: "Lumen Labs", icon: "bolt" },
  { name: "Foundry", icon: "organization" },
  { name: "Parcel", icon: "inbox" },
  { name: "Quillbase", icon: "book" },
  { name: "Tidewater", icon: "world" },
];

const stats: { value: string; label: string }[] = [
  { value: "4.9/5", label: "average rating on 2,100+ reviews" },
  { value: "38%", label: "faster release cycles in the first quarter" },
  { value: "99.99%", label: "uptime across the last 12 months" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: ambient layer lives outside the maxWidth column */}
      <Column fillWidth horizontal="center" paddingTop="104" paddingBottom="80" paddingX="24">
        <Background
          aria-hidden="true"
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
            width: 160,
            height: 90,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />

        <Column zIndex={1} fillWidth maxWidth="l" horizontal="center" gap="64">
          <Column horizontal="center" gap="40" maxWidth={48}>
            <RevealFx translateY="16">
              <Column horizontal="center" gap="24">
                <Badge
                  href="#changelog"
                  arrow
                  background="brand-alpha-weak"
                  onBackground="brand-medium"
                  textVariant="label-default-s"
                  paddingX="16"
                  paddingY="4"
                >
                  Release 3.2: automated rollbacks are live
                </Badge>
                <Heading
                  as="h1"
                  variant="display-strong-l"
                  align="center"
                  aria-label="Ship every release with confidence, not crossed fingers"
                >
                  <span aria-hidden="true">
                    Ship every release with{" "}
                    <Text as="span" onBackground="brand-medium">
                      <LetterFx trigger="instant" speed="medium">
                        confidence
                      </LetterFx>
                    </Text>
                    , not crossed fingers
                  </span>
                </Heading>
                <Text variant="body-default-l" onBackground="neutral-weak" align="center">
                  Meridian watches every deploy, catches regressions before your customers do, and
                  rolls back on its own when something looks wrong. Your team keeps shipping, and
                  your pager stays quiet.
                </Text>
              </Column>
            </RevealFx>

            <RevealFx delay={100} translateY="16">
              <Column horizontal="center" gap="16">
                <Row gap="12" horizontal="center" s={{ direction: "column", fillWidth: true }}>
                  <Button href="#start" size="l" arrowIcon fillWidth>
                    Start free for 14 days
                  </Button>
                  <Button
                    href="#demo"
                    size="l"
                    variant="secondary"
                    prefixIcon="play"
                    fillWidth
                  >
                    Watch the 2-minute demo
                  </Button>
                </Row>
                <Row
                  gap="8"
                  vertical="center"
                  horizontal="center"
                  wrap
                  textVariant="label-default-s"
                  onBackground="neutral-weak"
                >
                  <Icon name="check" size="xs" onBackground="brand-medium" />
                  <Text>No credit card required</Text>
                  <Text aria-hidden="true">·</Text>
                  <Text>SOC 2 Type II certified</Text>
                </Row>
              </Column>
            </RevealFx>
          </Column>

          {/* Social proof */}
          <RevealFx delay={200} translateY="16" fillWidth>
            <Column
              as="section"
              aria-labelledby="proof-heading"
              fillWidth
              horizontal="center"
              gap="32"
            >
              <Line width="40" />
              <Text
                as="h2"
                id="proof-heading"
                variant="label-default-s"
                onBackground="neutral-weak"
                align="center"
              >
                Trusted by 1,800+ engineering teams, from seed-stage startups to the Fortune 500
              </Text>

              <Grid
                as="ul"
                fillWidth
                columns="6"
                gap="16"
                l={{ columns: 3 }}
                s={{ columns: 2 }}
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {customers.map((customer) => (
                  <Row
                    as="li"
                    key={customer.name}
                    center
                    gap="8"
                    paddingY="12"
                    paddingX="16"
                    radius="m"
                    background="surface"
                    border
                    onBackground="neutral-medium"
                    textVariant="heading-strong-s"
                  >
                    <Icon name={customer.icon} size="s" onBackground="neutral-weak" />
                    <Text as="span">{customer.name}</Text>
                  </Row>
                ))}
              </Grid>

              <Grid
                as="dl"
                fillWidth
                maxWidth={56}
                columns="3"
                gap="24"
                paddingTop="16"
                s={{ columns: 1 }}
                style={{ margin: 0 }}
              >
                {stats.map((stat) => (
                  <Column key={stat.label} horizontal="center" gap="4" align="center">
                    <Text
                      as="dd"
                      variant="display-strong-xs"
                      onBackground="neutral-strong"
                      style={{ margin: 0, order: 1 }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      as="dt"
                      variant="body-default-s"
                      onBackground="neutral-weak"
                      style={{ order: 2 }}
                    >
                      {stat.label}
                    </Text>
                  </Column>
                ))}
              </Grid>
            </Column>
          </RevealFx>
        </Column>
      </Column>
    </Column>
  );
}
