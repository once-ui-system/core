"use client";

import {
  Avatar,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  type IconName,
  Line,
  RevealFx,
  Row,
  SegmentedControl,
  Tag,
  Text,
  VisuallyHidden,
  useInViewport,
} from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useMemo, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
};

interface Kpi {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  /** Direction the metric moved. */
  direction: "up" | "down";
  /** Whether that movement is good news. */
  good: boolean;
  icon: IconName;
}

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Revenue", value: 48210, prefix: "$", change: "12.4%", direction: "up", good: true, icon: "banknotes" },
    { id: "users", label: "Active users", value: 8934, change: "8.1%", direction: "up", good: true, icon: "person" },
    { id: "conversion", label: "Conversion rate", value: 3.8, suffix: "%", decimals: 1, change: "0.4%", direction: "down", good: false, icon: "trend" },
    { id: "churn", label: "Churn rate", value: 2.1, suffix: "%", decimals: 1, change: "0.3%", direction: "down", good: true, icon: "refresh" },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", value: 203650, prefix: "$", change: "9.7%", direction: "up", good: true, icon: "banknotes" },
    { id: "users", label: "Active users", value: 31420, change: "14.2%", direction: "up", good: true, icon: "person" },
    { id: "conversion", label: "Conversion rate", value: 4.1, suffix: "%", decimals: 1, change: "0.2%", direction: "up", good: true, icon: "trend" },
    { id: "churn", label: "Churn rate", value: 2.6, suffix: "%", decimals: 1, change: "0.5%", direction: "up", good: false, icon: "refresh" },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", value: 611800, prefix: "$", change: "18.9%", direction: "up", good: true, icon: "banknotes" },
    { id: "users", label: "Active users", value: 74205, change: "22.6%", direction: "up", good: true, icon: "person" },
    { id: "conversion", label: "Conversion rate", value: 3.9, suffix: "%", decimals: 1, change: "0.1%", direction: "down", good: false, icon: "trend" },
    { id: "churn", label: "Churn rate", value: 2.3, suffix: "%", decimals: 1, change: "0.4%", direction: "down", good: true, icon: "refresh" },
  ],
};

interface RevenuePoint {
  label: string;
  date: string;
  "This period": number;
  "Previous period": number;
}

const REVENUE: Record<RangeKey, RevenuePoint[]> = {
  "7d": [
    { label: "Mon", date: "2025-03-03", "This period": 6120, "Previous period": 5480 },
    { label: "Tue", date: "2025-03-04", "This period": 6890, "Previous period": 5920 },
    { label: "Wed", date: "2025-03-05", "This period": 7240, "Previous period": 6310 },
    { label: "Thu", date: "2025-03-06", "This period": 6710, "Previous period": 6580 },
    { label: "Fri", date: "2025-03-07", "This period": 8120, "Previous period": 6940 },
    { label: "Sat", date: "2025-03-08", "This period": 6430, "Previous period": 5870 },
    { label: "Sun", date: "2025-03-09", "This period": 6700, "Previous period": 6020 },
  ],
  "30d": [
    { label: "Week 1", date: "2025-02-10", "This period": 46200, "Previous period": 41800 },
    { label: "Week 2", date: "2025-02-17", "This period": 49850, "Previous period": 44100 },
    { label: "Week 3", date: "2025-02-24", "This period": 52300, "Previous period": 47900 },
    { label: "Week 4", date: "2025-03-03", "This period": 55300, "Previous period": 48650 },
  ],
  "90d": [
    { label: "Dec", date: "2024-12-01", "This period": 171400, "Previous period": 142900 },
    { label: "Jan", date: "2025-01-01", "This period": 198200, "Previous period": 163500 },
    { label: "Feb", date: "2025-02-01", "This period": 242200, "Previous period": 201300 },
  ],
};

interface ChannelPoint {
  label: string;
  Signups: number;
}

const CHANNELS: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { label: "Organic", Signups: 412 },
    { label: "Paid", Signups: 286 },
    { label: "Referral", Signups: 198 },
    { label: "Email", Signups: 154 },
    { label: "Social", Signups: 121 },
  ],
  "30d": [
    { label: "Organic", Signups: 1760 },
    { label: "Paid", Signups: 1215 },
    { label: "Referral", Signups: 842 },
    { label: "Email", Signups: 688 },
    { label: "Social", Signups: 503 },
  ],
  "90d": [
    { label: "Organic", Signups: 5120 },
    { label: "Paid", Signups: 3640 },
    { label: "Referral", Signups: 2475 },
    { label: "Email", Signups: 1980 },
    { label: "Social", Signups: 1432 },
  ],
};

interface ActivityItem {
  id: string;
  name: string;
  action: string;
  detail: string;
  time: string;
  icon: IconName;
  tag: { label: string; scheme: "success" | "brand" | "danger" | "warning" | "info" };
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    name: "Priya Raman",
    action: "upgraded to the Pro plan",
    detail: "Northwind Labs · $588/yr",
    time: "2 min ago",
    icon: "sparkle",
    tag: { label: "Upgrade", scheme: "success" },
  },
  {
    id: "a2",
    name: "Marcus Webb",
    action: "started a 14-day trial",
    detail: "Webb & Sons · Team plan",
    time: "18 min ago",
    icon: "plus",
    tag: { label: "New trial", scheme: "brand" },
  },
  {
    id: "a3",
    name: "Elena Kowalski",
    action: "had a payment fail",
    detail: "Kowalski Design · Card ending 4417",
    time: "1 hr ago",
    icon: "warning",
    tag: { label: "Action needed", scheme: "danger" },
  },
  {
    id: "a4",
    name: "Tomás Herrera",
    action: "invited 6 teammates",
    detail: "Herrera Logistics · Business plan",
    time: "3 hr ago",
    icon: "person",
    tag: { label: "Expansion", scheme: "info" },
  },
  {
    id: "a5",
    name: "Aiko Tanaka",
    action: "requested a plan downgrade",
    detail: "Tanaka Studio · Pro to Starter",
    time: "5 hr ago",
    icon: "trendDown",
    tag: { label: "At risk", scheme: "warning" },
  },
  {
    id: "a6",
    name: "Samuel Osei",
    action: "exported the Q1 revenue report",
    detail: "Osei Capital · CSV, 12,480 rows",
    time: "Yesterday",
    icon: "download",
    tag: { label: "Export", scheme: "info" },
  },
];

function formatCompact(n: number): string {
  return n.toLocaleString("en-US");
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");

  const kpiRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(kpiRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const kpis = KPIS[range];
  const revenue = REVENUE[range];
  const channels = CHANNELS[range];

  const revenueTotal = useMemo(
    () => revenue.reduce((sum, p) => sum + p["This period"], 0),
    [revenue],
  );
  const topChannel = useMemo(
    () => channels.reduce((best, c) => (c.Signups > best.Signups ? c : best), channels[0]),
    [channels],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <Column maxWidth="l" gap="40">
        {/* Header */}
        <Row
          as="header"
          fillWidth
          horizontal="between"
          vertical="end"
          gap="24"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Analytics
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Performance overview
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Showing {RANGE_LABELS[range]}, compared with the period before.
            </Text>
          </Column>
          <Column maxWidth={24} s={{ maxWidth: 100 }} fillWidth>
            <SegmentedControl
              value={range}
              onChange={(value) => setRange(value as RangeKey)}
              buttons={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />
          </Column>
        </Row>

        {/* KPI cards */}
        <Column as="section" aria-labelledby="kpi-heading" gap="16">
          <VisuallyHidden as="h2" >
            <span id="kpi-heading">Key metrics</span>
          </VisuallyHidden>
          <Grid ref={kpiRef} as="ul" columns="4" gap="16" l={{ columns: 4 }} m={{ columns: 2 }} s={{ columns: 1 }} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {kpis.map((kpi, index) => {
              const color = kpi.good ? "success-medium" : "danger-medium";
              const directionWord = kpi.direction === "up" ? "Up" : "Down";
              const outcomeWord = kpi.good ? "favorable" : "unfavorable";
              return (
                <RevealFx
                  as="li"
                  key={kpi.id}
                  fill
                  revealed={seen}
                  translateY="8"
                  delay={index * 100}
                >
                  <Column background="surface" border radius="l" padding="24" gap="16" fill>
                    <Row fillWidth horizontal="between" vertical="center" gap="8">
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {kpi.label}
                      </Text>
                      <Icon name={kpi.icon} size="s" onBackground="neutral-weak" />
                    </Row>
                    <Row vertical="end" gap="4">
                      {kpi.prefix && <Text variant="display-strong-xs">{kpi.prefix}</Text>}
                      <CountFx
                        variant="display-strong-xs"
                        value={seen ? kpi.value : 0}
                        speed={1200}
                        separator=","
                        decimals={kpi.decimals}
                      />
                      {kpi.suffix && <Text variant="display-strong-xs">{kpi.suffix}</Text>}
                    </Row>
                    <Row gap="8" vertical="center" onBackground={color}>
                      <Icon name={kpi.direction === "up" ? "trendUp" : "trendDown"} size="xs" />
                      <Text variant="label-default-s">
                        <VisuallyHidden>
                          {directionWord} {kpi.change}, {outcomeWord}, compared with the previous period
                        </VisuallyHidden>
                        <span aria-hidden="true">
                          {kpi.direction === "up" ? "+" : "−"}
                          {kpi.change}
                        </span>
                      </Text>
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        <span aria-hidden="true">vs previous</span>
                      </Text>
                    </Row>
                  </Column>
                </RevealFx>
              );
            })}
          </Grid>
        </Column>

        {/* Charts */}
        <Grid columns="2" gap="24" m={{ columns: 1 }}>
          <Column
            as="section"
            aria-labelledby="revenue-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            s={{ padding: "16" }}
          >
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-s" id="revenue-heading">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                ${formatCompact(revenueTotal)} total across {RANGE_LABELS[range]}
              </Text>
            </Column>
            <div role="img" aria-label={`Line chart of revenue over ${RANGE_LABELS[range]}, comparing this period with the previous period. Total this period: $${formatCompact(revenueTotal)}.`}>
              <LineChart
                key={`line-${range}`}
                minHeight={20}
                border="transparent"
                axis="both"
                grid="y"
                curve="monotone"
                legend={{ position: "top-left" }}
                series={[
                  { key: "This period", color: "blue" },
                  { key: "Previous period", color: "gray" },
                ]}
                data={revenue}
              />
            </div>
          </Column>

          <Column
            as="section"
            aria-labelledby="channels-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            s={{ padding: "16" }}
          >
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-s" id="channels-heading">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {topChannel.label} leads with {formatCompact(topChannel.Signups)} signups
              </Text>
            </Column>
            <div role="img" aria-label={`Bar chart of signups by channel over ${RANGE_LABELS[range]}. ${channels.map((c) => `${c.label}: ${formatCompact(c.Signups)}`).join(", ")}.`}>
              <BarChart
                key={`bar-${range}`}
                minHeight={20}
                border="transparent"
                axis="both"
                grid="y"
                barWidth="l"
                legend={{ display: false }}
                series={[{ key: "Signups", color: "emerald" }]}
                data={channels}
              />
            </div>
          </Column>
        </Grid>

        {/* Recent activity */}
        <Column
          as="section"
          aria-labelledby="activity-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-s" id="activity-heading">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Latest customer events across all plans
              </Text>
            </Column>
            <Button variant="tertiary" size="s" label="View all" suffixIcon="chevronRight" />
          </Row>
          <Line />
          <Column as="ul" fillWidth style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ACTIVITY.map((item, index) => (
              <Column as="li" key={item.id} fillWidth>
                <Row
                  fillWidth
                  vertical="center"
                  gap="16"
                  paddingY="16"
                  s={{ direction: "column", vertical: "start", gap: "12" }}
                >
                  <Row fillWidth vertical="center" gap="16">
                    <Avatar size="m" value={item.name.split(" ").map((p) => p[0]).join("")} />
                    <Column fillWidth gap="4">
                      <Text variant="body-default-s">
                        <Text as="span" variant="body-strong-s">
                          {item.name}
                        </Text>{" "}
                        {item.action}
                      </Text>
                      <Row gap="8" vertical="center">
                        <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {item.detail}
                        </Text>
                      </Row>
                    </Column>
                  </Row>
                  <Row gap="12" vertical="center" s={{ horizontal: "between" }} fitWidth>
                    <Tag size="s" scheme={item.tag.scheme}>
                      {item.tag.label}
                    </Tag>
                    <Text variant="label-default-s" onBackground="neutral-weak" wrap="nowrap">
                      {item.time}
                    </Text>
                  </Row>
                </Row>
                {index < ACTIVITY.length - 1 && <Line />}
              </Column>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
