"use client";

import type { ReactNode } from "react";
import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  LetterFx,
  Line,
  Row,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";

type Customer = {
  name: string;
  mark: ReactNode;
};

const svgProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const customers: Customer[] = [
  {
    name: "Northwind Freight",
    mark: (
      <svg {...svgProps}>
        <path d="M3 12h12M11 6l6 6-6 6" />
        <path d="M19 5v14" />
      </svg>
    ),
  },
  {
    name: "Lumen Health",
    mark: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    name: "Parcelwise",
    mark: (
      <svg {...svgProps}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  {
    name: "Fieldstone Capital",
    mark: (
      <svg {...svgProps}>
        <path d="M4 20V10l8-6 8 6v10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    name: "Halcyon Labs",
    mark: (
      <svg {...svgProps}>
        <path d="M5 4v16M19 4v16M5 12h14" />
      </svg>
    ),
  },
  {
    name: "Tidewater Energy",
    mark: (
      <svg {...svgProps}>
        <path d="M2 9c3-3 5-3 8 0s5 3 8 0M2 15c3-3 5-3 8 0s5 3 8 0" />
      </svg>
    ),
  },
];

const highlights = [
  { icon: "check" as const, label: "No credit card required" },
  { icon: "check" as const, label: "SOC 2 Type II certified" },
  { icon: "check" as const, label: "Set up in under 10 minutes" },
];

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingBottom="104">
      {/* Full-bleed hero: one ambient layer, outside the maxWidth column, no overflow clipping */}
      <Column as="section" fillWidth horizontal="center" paddingX="24" paddingTop="80" paddingBottom="64" aria-labelledby="hero-title">
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
          <Column horizontal="center" gap="16">
            <Tag scheme="brand" size="m" prefixIcon="sparkle">
              New: Live carrier tracking is here
            </Tag>

            <Heading as="h1" id="hero-title" variant="display-strong-l" align="center">
              <VisuallyHidden>Ship every order on time with logistics that run themselves</VisuallyHidden>
              <span aria-hidden="true">
                Ship every order on time with{" "}
                <Text as="span" onBackground="brand-medium">
                  <LetterFx trigger="instant" speed="medium">
                    logistics that run themselves
                  </LetterFx>
                </Text>
              </span>
            </Heading>
          </Column>

          <Text variant="body-default-l" onBackground="neutral-weak" align="center" wrap="balance">
            Meridian connects your warehouses, carriers and customers in one workspace. Route
            smarter, catch delays before your customers do, and cut average delivery time by 23%.
          </Text>

          <Column horizontal="center" gap="16">
            <Row gap="12" horizontal="center" s={{ direction: "column", fillWidth: true }}>
              <Button href="#start" size="l" arrowIcon>
                Start free trial
              </Button>
              <Button href="#demo" size="l" variant="secondary" prefixIcon="play">
                Watch 2-min demo
              </Button>
            </Row>

            <Row as="ul" gap="8" horizontal="center" wrap paddingX="0" margin="0" style={{ listStyle: "none" }}>
              {highlights.map((item) => (
                <Row
                  as="li"
                  key={item.label}
                  gap="8"
                  vertical="center"
                  paddingX="8"
                  textVariant="label-default-s"
                  onBackground="neutral-weak"
                >
                  <Icon name={item.icon} size="xs" onBackground="brand-medium" />
                  {item.label}
                </Row>
              ))}
            </Row>
          </Column>
        </Column>
      </Column>

      {/* Social proof */}
      <Column as="section" fillWidth horizontal="center" paddingX="24" aria-labelledby="proof-title">
        <Column maxWidth="l" gap="32" horizontal="center">
          <Text
            as="h2"
            id="proof-title"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by 1,800+ operations teams shipping 4 million parcels a month
          </Text>

          <Grid
            as="ul"
            fillWidth
            columns="6"
            gap="16"
            l={{ columns: 3 }}
            s={{ columns: 2 }}
            paddingX="0"
            margin="0"
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
                textVariant="label-strong-m"
              >
                {customer.mark}
                <span>{customer.name}</span>
              </Row>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingTop="64">
        <Line width="40" />
      </Column>
    </Column>
  );
}
