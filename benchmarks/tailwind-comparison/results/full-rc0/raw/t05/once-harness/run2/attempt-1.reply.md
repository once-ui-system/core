```tsx
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
import type { ReactNode } from "react";

type Customer = {
  name: string;
  mark: ReactNode;
};

/* Inline SVG marks: no network assets. Paint is currentColor so they follow the theme. */
const markProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

const customers: Customer[] = [
  {
    name: "Northwind Labs",
    mark: (
      <svg {...markProps}>
        <path d="M12 2 22 20H2L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Lumen & Co",
    mark: (
      <svg {...markProps}>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Packhorse",
    mark: (
      <svg {...markProps}>
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Fieldnote",
    mark: (
      <svg {...markProps}>
        <path
          d="M4 18c4-1 4-12 8-12s4 11 8 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Orbital Freight",
    mark: (
      <svg {...markProps}>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="currentColor" strokeWidth="2" transform="rotate(-25 12 12)" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Brightside",
    mark: (
      <svg {...markProps}>
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const highlights = ["No credit card required", "14-day free trial", "SOC 2 Type II"] as const;

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: one ambient layer, outside the maxWidth column, no overflow clip */}
      <Column fillWidth horizontal="center" paddingTop="104" paddingX="l" gap="80" s={{ paddingTop: "64" }}>
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

        <Column zIndex={1} horizontal="center" gap="40" maxWidth={48}>
          <Column horizontal="center" gap="24">
            <RevealFx translateY="16" horizontal="center">
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
                  <Icon name="sparkle" size="xs" onBackground="brand-medium" />
                  <Text marginLeft="8">Release 3.2: Scheduled handoffs are live</Text>
                </Badge>

                <Heading as="h1" variant="display-strong-l" align="center">
                  Ship every release without{" "}
                  <Text as="span" onBackground="brand-medium">
                    <LetterFx trigger="instant" speed="medium">
                      the Friday night scramble
                    </LetterFx>
                  </Text>
                </Heading>
              </Column>
            </RevealFx>

            <RevealFx delay={100} translateY="16" horizontal="center">
              <Text variant="body-default-l" onBackground="neutral-weak" align="center" wrap="balance">
                Relay turns pull requests into tested, staged and monitored deployments. Your team gets one
                calm timeline from merge to production, with automatic rollbacks when something looks off.
              </Text>
            </RevealFx>
          </Column>

          <RevealFx delay={200} translateY="16" horizontal="center">
            <Column horizontal="center" gap="16">
              <Row gap="12" horizontal="center" s={{ direction: "column" }} fillWidth>
                <Button href="#start" size="l" arrowIcon fillWidth>
                  Start free trial
                </Button>
                <Button href="#demo" size="l" variant="secondary" prefixIcon="play" fillWidth>
                  Watch 2-minute demo
                </Button>
              </Row>

              <Row as="ul" gap="8" horizontal="center" wrap paddingX="0" margin="0" aria-label="Trial details">
                {highlights.map((item) => (
                  <Row
                    as="li"
                    key={item}
                    gap="8"
                    vertical="center"
                    textVariant="label-default-s"
                    onBackground="neutral-weak"
                    paddingX="8"
                    style={{ listStyle: "none" }}
                  >
                    <Icon name="check" size="xs" onBackground="brand-medium" />
                    {item}
                  </Row>
                ))}
              </Row>
            </Column>
          </RevealFx>
        </Column>

        {/* Social proof */}
        <Column
          as="section"
          aria-labelledby="social-proof-title"
          zIndex={1}
          fillWidth
          maxWidth="l"
          horizontal="center"
          gap="32"
        >
          <Row fillWidth vertical="center" gap="24">
            <Line />
            <Text
              as="h2"
              id="social-proof-title"
              variant="label-default-s"
              onBackground="neutral-weak"
              align="center"
              style={{ whiteSpace: "nowrap" }}
            >
              Trusted by 4,200+ engineering teams
            </Text>
            <Line />
          </Row>

          <Grid
            as="ul"
            fillWidth
            columns="6"
            gap="16"
            paddingX="0"
            margin="0"
            m={{ columns: 3 }}
            s={{ columns: 2 }}
          >
            {customers.map((customer) => (
              <Row
                as="li"
                key={customer.name}
                center
                gap="8"
                paddingY="16"
                paddingX="12"
                radius="m"
                onBackground="neutral-medium"
                textVariant="heading-strong-s"
                style={{ listStyle: "none", opacity: 0.85 }}
              >
                {customer.mark}
                <Text as="span">{customer.name}</Text>
              </Row>
            ))}
          </Grid>

          <Row gap="8" vertical="center" horizontal="center" wrap>
            <Row gap="2" aria-hidden="true" onBackground="brand-medium">
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="starFill" size="xs" />
              ))}
            </Row>
            <Text variant="label-default-s" onBackground="neutral-weak">
              4.9 out of 5 from 1,800+ reviews on G2
            </Text>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```