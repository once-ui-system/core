"use client";

import {
  Background,
  Badge,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  RevealFx,
  Row,
  ShineFx,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Customer = {
  name: string;
  icon: IconName;
};

// Wordmarks are composed from registered icons + text: no network or image assets needed.
const customers: Customer[] = [
  { name: "Northwind", icon: "globe" },
  { name: "Lumenly", icon: "bolt" },
  { name: "Harborline", icon: "organization" },
  { name: "Quillbase", icon: "edit" },
  { name: "Meridian", icon: "trendUp" },
  { name: "Fieldnote", icon: "book" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      <VisuallyHidden as="a" focusable>
        {/* Skip link target is the hero content */}
      </VisuallyHidden>

      {/* Full-bleed hero: ambient layer sits outside the maxWidth column, no overflow clipping */}
      <Column
        as="section"
        aria-labelledby="hero-heading"
        fillWidth
        horizontal="center"
        paddingTop="80"
        paddingBottom="64"
        paddingX="16"
        gap="64"
      >
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
            width: 160,
            height: 80,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />

        <Column zIndex={1} fillWidth horizontal="center" gap="32" maxWidth={52}>
          {/* One coherent reveal set: three stacked chunks, increasing delay */}
          <RevealFx translateY="16" fillWidth horizontal="center">
            <Column fillWidth horizontal="center" gap="24">
              <Badge
                href="#changelog"
                icon="sparkle"
                arrow
                title="Release 4.0: shared workspaces and live cursors"
              />
              <Heading
                as="h1"
                id="hero-heading"
                variant="display-strong-l"
                align="center"
                wrap="balance"
              >
                Ship product specs your whole team{" "}
                <ShineFx as="span" speed={2400} baseOpacity={0.5}>
                  actually reads
                </ShineFx>
              </Heading>
            </Column>
          </RevealFx>

          <RevealFx translateY="16" delay={100} fillWidth horizontal="center">
            <Text
              variant="body-default-l"
              onBackground="neutral-weak"
              align="center"
              wrap="balance"
            >
              Draft, review and publish specs in one shared workspace. Comments, approvals
              and version history stay attached to the page, so decisions never get lost in
              a chat thread.
            </Text>
          </RevealFx>

          <RevealFx translateY="16" delay={200} fillWidth horizontal="center">
            <Column fillWidth horizontal="center" gap="16">
              <Row gap="12" horizontal="center" wrap s={{ direction: "column", fillWidth: true }}>
                <Button href="#start" size="l" arrowIcon s={{ fillWidth: true }}>
                  Start free trial
                </Button>
                <Button
                  href="#demo"
                  size="l"
                  variant="secondary"
                  prefixIcon="play"
                  s={{ fillWidth: true }}
                >
                  Watch 2-minute demo
                </Button>
              </Row>
              <Text variant="label-default-s" onBackground="neutral-weak" align="center">
                14 days free · No credit card required · Cancel anytime
              </Text>
            </Column>
          </RevealFx>
        </Column>

        {/* Social proof, part of the same hero so it reveals with it */}
        <Column zIndex={1} fillWidth horizontal="center" maxWidth="l" gap="24">
          <Line maxWidth={24} />
          <Text
            as="p"
            id="proof-heading"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by product teams at 2,400+ companies
          </Text>
          <Grid
            as="ul"
            aria-labelledby="proof-heading"
            fillWidth
            columns="6"
            gap="16"
            l={{ columns: 3 }}
            s={{ columns: 2 }}
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {customers.map((customer) => (
              <Row
                as="li"
                key={customer.name}
                center
                gap="8"
                paddingY="12"
                paddingX="8"
                onBackground="neutral-medium"
              >
                <Icon name={customer.icon} size="s" onBackground="neutral-medium" />
                <Text variant="heading-strong-s" onBackground="neutral-medium">
                  {customer.name}
                </Text>
              </Row>
            ))}
          </Grid>
        </Column>
      </Column>
    </Column>
  );
}
