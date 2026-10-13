```tsx
"use client";

import {
  Background,
  Badge,
  Button,
  Column,
  Heading,
  Icon,
  LetterFx,
  Line,
  RevealFx,
  Row,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Customer = {
  name: string;
  icon: IconName;
};

// Social proof: wordmarks built from registered icons + text, so nothing is loaded from the network.
const customers: Customer[] = [
  { name: "Northwind", icon: "globe" },
  { name: "Lumenly", icon: "sparkle" },
  { name: "Brightpath", icon: "trend" },
  { name: "Harborline", icon: "organization" },
  { name: "Quillbase", icon: "document" },
  { name: "Tessera", icon: "symbol" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      <VisuallyHidden as="a" focusable>
        <a href="#social-proof">Skip to customers</a>
      </VisuallyHidden>

      {/* Full-bleed hero: ambient layer sits outside any maxWidth column */}
      <Column
        as="section"
        aria-labelledby="hero-title"
        fillWidth
        horizontal="center"
        paddingTop="104"
        paddingBottom="80"
        paddingX="24"
        s={{ paddingTop: "64", paddingBottom: "56", paddingX: "16" }}
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

        <Column zIndex={1} horizontal="center" gap="32" maxWidth={52}>
          <RevealFx translateY="16">
            <Column horizontal="center" gap="24">
              <Badge
                href="#social-proof"
                icon="sparkle"
                title="New: Forecast 2.0 with automated scenario planning"
              />
              <Heading as="h1" id="hero-title" variant="display-strong-l" align="center">
                Close your books in days, not weeks, with{" "}
                <Text as="span" onBackground="brand-strong">
                  <LetterFx trigger="instant" speed="medium">
                    finance that runs itself
                  </LetterFx>
                </Text>
              </Heading>
            </Column>
          </RevealFx>

          <RevealFx delay={100} translateY="16">
            <Text variant="body-default-l" onBackground="neutral-weak" align="center">
              Ledgerly reconciles transactions, flags anomalies and drafts your month-end
              reports automatically, so your finance team can spend its time on decisions
              instead of spreadsheets.
            </Text>
          </RevealFx>

          <RevealFx delay={200} translateY="16">
            <Row gap="12" horizontal="center" s={{ direction: "column", fillWidth: true }}>
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
          </RevealFx>

          <Row
            gap="8"
            vertical="center"
            horizontal="center"
            wrap
            textVariant="label-default-s"
            onBackground="neutral-weak"
          >
            <Icon name="check" size="xs" onBackground="success-medium" />
            <span>No credit card required</span>
            <Icon name="check" size="xs" onBackground="success-medium" />
            <span>14-day free trial</span>
            <Icon name="check" size="xs" onBackground="success-medium" />
            <span>SOC 2 Type II certified</span>
          </Row>
        </Column>
      </Column>

      {/* Social proof */}
      <Column
        as="section"
        id="social-proof"
        aria-labelledby="social-proof-title"
        fillWidth
        horizontal="center"
        paddingX="24"
        s={{ paddingX: "16" }}
      >
        <Column maxWidth="l" gap="32" horizontal="center">
          <Text
            as="h2"
            id="social-proof-title"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by finance teams at 2,400+ growing companies
          </Text>

          <Row
            as="ul"
            fillWidth
            wrap
            horizontal="center"
            gap="32"
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {customers.map((customer) => (
              <Row
                as="li"
                key={customer.name}
                gap="8"
                vertical="center"
                onBackground="neutral-medium"
                opacity={80}
              >
                <Icon name={customer.icon} size="m" />
                <Text variant="heading-strong-m" onBackground="neutral-medium">
                  {customer.name}
                </Text>
              </Row>
            ))}
          </Row>

          <Line width="40" />
        </Column>
      </Column>
    </Column>
  );
}
```