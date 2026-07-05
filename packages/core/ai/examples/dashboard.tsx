"use client";

/**
 * Gold example: dashboard
 * Target: KPI stat row, chart placeholders, recent activity table
 */
import { useEffect, useRef, useState } from "react";
import {
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  RevealFx,
  Row,
  SegmentedControl,
  StatusIndicator,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";

const stats = [
  { label: "Revenue", value: 128400, prefix: "$", change: "+12.4%", up: true },
  { label: "Active users", value: 2847, change: "+8.1%", up: true },
  { label: "Churn rate", value: 2.1, suffix: "%", change: "−0.3%", up: true },
  { label: "Support tickets", value: 34, change: "+4", up: false },
];

const activity = {
  headers: [
    { content: "Event", key: "event" },
    { content: "User", key: "user" },
    { content: "Status", key: "status" },
    { content: "Time", key: "time" },
  ],
  rows: [
    ["Plan upgraded to Pro", "jane@acme.co", <Tag size="s" variant="success">Completed</Tag>, "2m ago"],
    ["New signup", "alex@studio.io", <Tag size="s" variant="brand">New</Tag>, "14m ago"],
    ["Payment failed", "ops@build.dev", <Tag size="s" variant="danger">Action</Tag>, "1h ago"],
  ],
};

export function DashboardExample() {
  const [range, setRange] = useState("7d");
  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" gap="40">
      <Column fillWidth maxWidth="l" gap="40">
        <Row fillWidth horizontal="between" vertical="end" gap="24" s={{ direction: "column", horizontal: "start" }}>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Analytics
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Overview
            </Heading>
          </Column>
          <SegmentedControl
            selected={range}
            onToggle={setRange}
            buttons={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ]}
          />
        </Row>

        <Grid ref={statsRef} columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
          {stats.map((stat, index) => (
            <RevealFx key={stat.label} fill trigger={seen} translateY="8" delay={index * 0.1}>
              <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="16">
                <Row fillWidth horizontal="between" vertical="center">
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {stat.label}
                  </Text>
                  <StatusIndicator variant={stat.up ? "success" : "warning"} />
                </Row>
                <Row vertical="end" gap="4">
                  {stat.prefix && (
                    <Text variant="display-strong-xs">{stat.prefix}</Text>
                  )}
                  <CountFx
                    variant="display-strong-xs"
                    value={seen ? stat.value : 0}
                    speed={1200}
                    separator=","
                  />
                  {stat.suffix && (
                    <Text variant="display-strong-xs">{stat.suffix}</Text>
                  )}
                </Row>
                <Text variant="label-default-s" onBackground={stat.up ? "success-medium" : "warning-medium"}>
                  {stat.change}
                </Text>
              </Column>
            </RevealFx>
          ))}
        </Grid>

        <Grid columns="2" gap="24" s={{ columns: 1 }}>
          <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="16" minHeight={32}>
            <Heading as="h2" variant="heading-strong-s">
              Revenue trend
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="linearGauge" size="l" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Chart area — use recharts or your data viz module
              </Text>
            </Column>
          </Column>
          <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="16" minHeight={32}>
            <Heading as="h2" variant="heading-strong-s">
              Signups by channel
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="radialGauge" size="l" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Chart area
              </Text>
            </Column>
          </Column>
        </Grid>

        <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="24">
          <Row fillWidth horizontal="between" vertical="center">
            <Heading as="h2" variant="heading-strong-s">
              Recent activity
            </Heading>
            <Text variant="label-default-s" onBackground="brand-medium" cursor="interactive">
              View all
            </Text>
          </Row>
          <Line />
          <Table fillWidth data={activity} />
        </Column>
      </Column>
    </Column>
  );
}
