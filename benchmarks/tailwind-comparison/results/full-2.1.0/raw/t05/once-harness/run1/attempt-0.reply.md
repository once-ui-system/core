```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Background,
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
  useInViewport,
} from "@once-ui-system/core";

/* -------------------------------------------------------------------------- */
/* Inline content                                                             */
/* -------------------------------------------------------------------------- */

type Customer = {
  name: string;
  mark: React.ReactNode;
};

/* Simple geometric marks drawn with currentColor so they follow the theme. */
const customers: Customer[] = [
  {
    name: "Northwind Freight",
    mark: (
      <>
        <path d="M3 20 L12 4 L21 20 Z" fill="currentColor" />
        <path d="M8 20 L12 12 L16 20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
  },
  {
    name: "Lumen Health",
    mark: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </>
    ),
  },
  {
    name: "Cobalt Labs",
    mark: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12 H16 M12 8 V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "Harbor & Pine",
    mark: (
      <>
        <path d="M4 17 Q8 9 12 17 T20 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12 Q8 4 12 12 T20 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "Ostrich Capital",
    mark: (
      <>
        <path d="M12 3 L20 8 V16 L12 21 L4 16 V8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8 V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "Vantage Robotics",
    mark: (
      <>
        <path d="M4 5 L12 19 L20 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ),
  },
];

const stats = [
  { value: "4.9/5", label: "average rating from 2,300+ reviews" },
  { value: "12 min", label: "median time to first published report" },
  { value: "38%", label: "faster month-end close, on average" },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const logosRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(logosRef);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: one ambient layer, outside the maxWidth column */}
      <Column fillWidth horizontal="center" paddingTop="80" paddingBottom="64" paddingX="16">
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
          <Row
            as="p"
            center
            gap="8"
            paddingX="12"
            paddingY="4"
            radius="full"
            background="brand-alpha-weak"
            border="brand-alpha-medium"
            textVariant="label-default-s"
            onBackground="brand-strong"
            margin="0"
          >
            <Icon name="sparkle" size="xs" onBackground="brand-medium" />
            New: automated variance commentary
          </Row>

          <Column horizontal="center" gap="24">
            <Heading as="h1" variant="display-strong-l" align="center">
              Close the books in days, not{" "}
              <Text as="span" onBackground="brand-medium" variant="display-strong-l">
                <LetterFx trigger="instant" speed="fast">
                  weeks
                </LetterFx>
              </Text>
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" align="center" wrap="balance">
              Ledgerline reconciles every account, flags anomalies and drafts your management
              reports automatically, so your finance team can spend its time on decisions instead
              of spreadsheets.
            </Text>
          </Column>

          <Row gap="12" horizontal="center" wrap>
            <Button href="#start" size="l" arrowIcon>
              Start free trial
            </Button>
            <Button href="#demo" size="l" variant="secondary" prefixIcon="play">
              Watch 2-min demo
            </Button>
          </Row>

          <Text variant="body-default-s" onBackground="neutral-weak" align="center">
            14-day free trial · No credit card required · SOC 2 Type II certified
          </Text>
        </Column>
      </Column>

      {/* Social proof */}
      <Column fillWidth horizontal="center" paddingX="16">
        <Column maxWidth="l" gap="40" ref={logosRef}>
          <Column horizontal="center" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak" align="center">
              Trusted by finance teams at 1,800+ growing companies
            </Text>
          </Column>

          <Grid
            as="ul"
            columns="6"
            gap="16"
            fillWidth
            margin="0"
            padding="0"
            m={{ columns: 3 }}
            s={{ columns: 2 }}
            aria-label="Customers"
            style={{ listStyle: "none" }}
          >
            {customers.map((customer, index) => (
              <RevealFx
                key={customer.name}
                as="li"
                revealed={seen}
                speed="fast"
                translateY="8"
                delay={index * 100}
                fillWidth
              >
                <Row
                  fillWidth
                  center
                  gap="8"
                  paddingY="16"
                  paddingX="12"
                  radius="m"
                  onBackground="neutral-medium"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                    style={{ flexShrink: 0 }}
                  >
                    {customer.mark}
                  </svg>
                  <Text variant="label-strong-m" onBackground="neutral-medium">
                    {customer.name}
                  </Text>
                </Row>
              </RevealFx>
            ))}
          </Grid>

          <Column fillWidth horizontal="center">
            <Line width="40" />
          </Column>

          <Grid
            as="dl"
            columns="3"
            gap="24"
            fillWidth
            margin="0"
            s={{ columns: 1 }}
          >
            {stats.map((stat) => (
              <Column
                key={stat.label}
                horizontal="center"
                gap="4"
                paddingY="8"
              >
                <Text as="dd" variant="display-strong-xs" onBackground="neutral-strong" align="center" style={{ margin: 0 }}>
                  {stat.value}
                </Text>
                <Text as="dt" variant="body-default-s" onBackground="neutral-weak" align="center" style={{ order: 2 }}>
                  {stat.label}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>
    </Column>
  );
}
```