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
  Row,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Customer = {
  name: string;
  icon: IconName;
};

const customers: Customer[] = [
  { name: "Northwind", icon: "globe" },
  { name: "Lumen Labs", icon: "bolt" },
  { name: "Fieldstone", icon: "organization" },
  { name: "Harborline", icon: "store" },
  { name: "Ostrander", icon: "barChart" },
  { name: "Kestrel", icon: "paw" },
];

const stats = [
  { value: "4.9/5", label: "average rating on G2" },
  { value: "2,400+", label: "teams shipping with Relay" },
  { value: "38%", label: "faster release cycles" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: one ambient layer, outside the maxWidth column */}
      <Column fillWidth horizontal="center" paddingTop="80" paddingBottom="64" paddingX="24">
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

        <Column zIndex={1} horizontal="center" gap="40" maxWidth="m">
          <Column horizontal="center" gap="24">
            <Badge
              title="New in Relay 3.0"
              icon="sparkle"
              href="#changelog"
              onBackground="brand-medium"
              background="brand-alpha-weak"
              border="brand-alpha-medium"
            />

            <Heading as="h1" variant="display-strong-l" align="center">
              Ship every release with{" "}
              <span style={{ whiteSpace: "nowrap" }}>
                <VisuallyHidden>total confidence</VisuallyHidden>
                <span aria-hidden="true">
                  <LetterFx trigger="instant" speed="medium">
                    total confidence
                  </LetterFx>
                </span>
              </span>
            </Heading>

            <Text
              variant="body-default-l"
              onBackground="neutral-weak"
              align="center"
              wrap="balance"
            >
              Relay turns pull requests into safe, observable rollouts. Preview every change,
              roll out gradually, and roll back in one click, without waiting on a release
              manager.
            </Text>
          </Column>

          <Row gap="12" horizontal="center" s={{ direction: "column", fillWidth: true }}>
            <Button href="#start" size="l" arrowIcon>
              Start free trial
            </Button>
            <Button href="#demo" size="l" variant="secondary" prefixIcon="play">
              Watch 2-minute demo
            </Button>
          </Row>

          <Text variant="body-default-s" onBackground="neutral-weak" align="center">
            14-day trial · No credit card required · SOC 2 Type II certified
          </Text>
        </Column>
      </Column>

      {/* Social proof */}
      <Column fillWidth horizontal="center" paddingX="24" gap="40">
        <Column maxWidth="l" gap="40" horizontal="center">
          <Text
            as="h2"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by platform teams at fast-moving companies
          </Text>

          <Grid
            as="ul"
            columns="6"
            gap="16"
            m={{ columns: 3 }}
            s={{ columns: 2 }}
            aria-label="Customers using Relay"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {customers.map((customer) => (
              <Row
                as="li"
                key={customer.name}
                center
                gap="8"
                paddingY="16"
                onBackground="neutral-weak"
              >
                <Icon name={customer.icon} size="s" />
                <Text variant="heading-strong-s">{customer.name}</Text>
              </Row>
            ))}
          </Grid>

          <Line maxWidth={40} />

          <Grid
            as="dl"
            columns="3"
            gap="24"
            fillWidth
            s={{ columns: 1 }}
            style={{ margin: 0 }}
          >
            {stats.map((stat) => (
              <Column
                key={stat.label}
                horizontal="center"
                gap="4"
                style={{ flexDirection: "column-reverse" }}
              >
                <Text as="dt" variant="body-default-s" onBackground="neutral-weak" align="center">
                  {stat.label}
                </Text>
                <Text as="dd" variant="display-strong-xs" align="center" style={{ margin: 0 }}>
                  {stat.value}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>
    </Column>
  );
}
