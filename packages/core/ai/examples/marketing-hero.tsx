"use client";

/**
 * Gold example: marketing-hero
 * Target: once-ui.com homepage — glow + dots, display headline, feature grid, CTAs
 */
import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  RevealFx,
  Row,
  Text,
} from "@once-ui-system/core";

const features = [
  {
    icon: "document" as const,
    title: "Contexts",
    description: "App-level state for themes, toasts, icons and layouts.",
  },
  {
    icon: "sparkle" as const,
    title: "Basics",
    description: "Wrappers and utilities that make complex functionality approachable.",
  },
  {
    icon: "radialGauge" as const,
    title: "Form controls",
    description: "Interactive elements for forms and data entry.",
  },
  {
    icon: "document" as const,
    title: "Static elements",
    description: "Feedbacks, badges, tags, skeletons and more.",
  },
  {
    icon: "linearGauge" as const,
    title: "Data visualization",
    description: "Responsive, interactive charts and gauges.",
  },
  {
    icon: "sparkle" as const,
    title: "Modules",
    description: "High functionality, minimal syntax: megamenu, command palette.",
  },
];

export function MarketingHeroExample() {
  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      {/* Full-bleed hero — ambient layer outside maxWidth */}
      <Column fillWidth horizontal="center" paddingY="80">
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
        <Column zIndex={1} horizontal="center" gap="24" maxWidth={48}>
          <RevealFx translateY="16">
            <Column horizontal="center" gap="16">
              <Text variant="label-default-s" onBackground="brand-medium">
                v1.7 — Discover what's new
              </Text>
              <Heading as="h1" variant="display-strong-l" align="center">
                Write 70% less code with human-readable, machine-writable syntax
              </Heading>
            </Column>
          </RevealFx>
          <RevealFx delay={0.1} translateY="16">
            <Text variant="body-default-l" onBackground="neutral-weak" align="center">
              Build semantic layouts with Row, Column and Grid. Add 100+ pre-styled components.
              Manage themes in a single file.
            </Text>
          </RevealFx>
          <RevealFx delay={0.2} translateY="16">
            <Row gap="12" s={{ direction: "column" }}>
              <Button arrowIcon>View docs</Button>
              <Button variant="secondary" suffixIcon="arrowUpRight">
                Discover Pro
              </Button>
            </Row>
          </RevealFx>
        </Column>
      </Column>

      {/* Feature grid — left-aligned section header, not repeated centered blocks */}
      <Column fillWidth horizontal="center">
        <Column fillWidth maxWidth="l" gap="40">
          <Column gap="12" maxWidth={32}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Components
            </Text>
            <Heading as="h2" variant="display-strong-xs">
              Copy and paste. Insert from 100+ open-source, pre-styled components.
            </Heading>
          </Column>
          <Grid columns="3" gap="24" m={{ columns: 2 }} s={{ columns: 1 }}>
            {features.map((feature) => (
              <Column
                key={feature.title}
                background="surface"
                border="neutral-alpha-weak"
                radius="l"
                padding="24"
                gap="16"
              >
                <Row
                  center
                  width={10}
                  height={10}
                  radius="m"
                  background="brand-alpha-weak"
                  border="brand-alpha-medium"
                >
                  <Icon name={feature.icon} size="s" onBackground="brand-medium" />
                </Row>
                <Heading as="h3" variant="heading-strong-s">
                  {feature.title}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {feature.description}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column fillWidth horizontal="center">
        <Line width="40" />
      </Column>
    </Column>
  );
}
