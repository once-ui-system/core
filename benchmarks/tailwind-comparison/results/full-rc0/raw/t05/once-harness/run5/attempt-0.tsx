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
  { name: "Lumenly", icon: "sparkle" },
  { name: "Vectorly", icon: "bolt" },
  { name: "Harbor&Co", icon: "organization" },
  { name: "Pinecrest", icon: "security" },
  { name: "Orbitly", icon: "radialGauge" },
];

const stats: { value: string; label: string }[] = [
  { value: "4.9/5", label: "average rating on G2" },
  { value: "12,000+", label: "teams shipping with Fieldnote" },
  { value: "99.99%", label: "uptime over the last 12 months" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: ambient layer sits outside any maxWidth column */}
      <Column as="section" fillWidth horizontal="center" paddingTop="80" paddingBottom="64" paddingX="16" gap="64" aria-labelledby="hero-title">
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
            width: 150,
            height: 80,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />

        <Column zIndex={1} horizontal="center" gap="32" maxWidth={48}>
          <RevealFx translateY="12">
            <Badge
              href="#changelog"
              title="Fieldnote 3.0 is here"
              icon="sparkle"
              arrow
            />
          </RevealFx>

          <RevealFx delay={100} translateY="16">
            <Column horizontal="center" gap="16">
              <Text variant="label-default-s" onBackground="brand-medium">
                Meeting notes that write themselves
              </Text>
              <Heading
                as="h1"
                id="hero-title"
                variant="display-strong-l"
                align="center"
                aria-label="Turn every conversation into clear decisions"
              >
                <span aria-hidden="true">
                  Turn every conversation into{" "}
                  <Text as="span" onBackground="brand-strong">
                    <LetterFx trigger="instant" speed="medium">
                      clear decisions
                    </LetterFx>
                  </Text>
                </span>
              </Heading>
            </Column>
          </RevealFx>

          <RevealFx delay={200} translateY="16">
            <Text
              variant="body-default-l"
              onBackground="neutral-weak"
              align="center"
              wrap="balance"
            >
              Fieldnote joins your calls, captures what was agreed, and sends owners their
              action items before the meeting even ends. No more chasing recaps in Slack.
            </Text>
          </RevealFx>

          <RevealFx delay={300} translateY="16">
            <Column horizontal="center" gap="12">
              <Row gap="12" s={{ direction: "column" }} horizontal="center">
                <Button href="#start" size="l" arrowIcon>
                  Start free for 14 days
                </Button>
                <Button
                  href="#demo"
                  size="l"
                  variant="secondary"
                  prefixIcon="play"
                >
                  Watch the 2-minute demo
                </Button>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                No credit card required. Works with Zoom, Meet and Teams.
              </Text>
            </Column>
          </RevealFx>
        </Column>

        {/* Social proof */}
        <Column zIndex={1} fillWidth horizontal="center" gap="32" maxWidth="l">
          <RevealFx delay={400} translateY="12" fillWidth>
            <Column fillWidth horizontal="center" gap="24">
              <Text
                as="h2"
                variant="label-default-s"
                onBackground="neutral-weak"
                align="center"
              >
                Trusted by product and ops teams at fast-moving companies
              </Text>
              <Grid
                as="ul"
                fillWidth
                columns="6"
                gap="16"
                margin="0"
                padding="0"
                l={{ columns: 3 }}
                s={{ columns: 2 }}
                aria-label="Customer companies"
                style={{ listStyle: "none" }}
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
                  >
                    <Icon name={customer.icon} size="s" onBackground="neutral-medium" />
                    <Text variant="label-strong-m" onBackground="neutral-medium">
                      {customer.name}
                    </Text>
                  </Row>
                ))}
              </Grid>
            </Column>
          </RevealFx>

          <RevealFx delay={500} translateY="12" fillWidth>
            <Column fillWidth horizontal="center" gap="24">
              <Line width="40" />
              <Grid
                as="dl"
                fillWidth
                maxWidth={56}
                columns="3"
                gap="24"
                margin="0"
                s={{ columns: 1 }}
              >
                {stats.map((stat) => (
                  <Column
                    key={stat.label}
                    horizontal="center"
                    gap="4"
                    style={{ flexDirection: "column-reverse" }}
                  >
                    <Text
                      as="dd"
                      variant="body-default-s"
                      onBackground="neutral-weak"
                      align="center"
                      style={{ margin: 0 }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      as="dt"
                      variant="display-strong-xs"
                      onBackground="neutral-strong"
                      align="center"
                    >
                      {stat.value}
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
