"use client";

import {
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  type IconName,
  Line,
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

type Stat = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  /** Direction the metric moved. */
  direction: "up" | "down";
  /** Whether that movement is good news (lower churn is good). */
  good: boolean;
  caption: string;
};

type RangeConfig = {
  label: string;
  description: string;
  stats: Stat[];
};

const RANGES: Record<RangeKey, RangeConfig> = {
  "7d": {
    label: "Last 7 days",
    description: "Mar 24 – Mar 30",
    stats: [
      { id: "revenue", label: "Revenue", value: 48210, prefix: "$", change: "12.4%", direction: "up", good: true, caption: "vs. previous 7 days" },
      { id: "users", label: "Active users", value: 2847, change: "8.1%", direction: "up", good: true, caption: "vs. previous 7 days" },
      { id: "churn", label: "Churn rate", value: 2.1, suffix: "%", decimals: 1, change: "0.3 pts", direction: "down", good: true, caption: "vs. previous 7 days" },
      { id: "tickets", label: "Open tickets", value: 34, change: "4", direction: "up", good: false, caption: "vs. previous 7 days" },
    ],
  },
  "30d": {
    label: "Last 30 days",
    description: "Mar 1 – Mar 30",
    stats: [
      { id: "revenue", label: "Revenue", value: 196480, prefix: "$", change: "9.7%", direction: "up", good: true, caption: "vs. previous 30 days" },
      { id: "users", label: "Active users", value: 11932, change: "5.6%", direction: "up", good: true, caption: "vs. previous 30 days" },
      { id: "churn", label: "Churn rate", value: 2.4, suffix: "%", decimals: 1, change: "0.1 pts", direction: "down", good: true, caption: "vs. previous 30 days" },
      { id: "tickets", label: "Open tickets", value: 41, change: "6", direction: "down", good: true, caption: "vs. previous 30 days" },
    ],
  },
  "90d": {
    label: "Last 90 days",
    description: "Jan 1 – Mar 30",
    stats: [
      { id: "revenue", label: "Revenue", value: 574920, prefix: "$", change: "18.2%", direction: "up", good: true, caption: "vs. previous 90 days" },
      { id: "users", label: "Active users", value: 34108, change: "14.9%", direction: "up", good: true, caption: "vs. previous 90 days" },
      { id: "churn", label: "Churn rate", value: 2.8, suffix: "%", decimals: 1, change: "0.4 pts", direction: "up", good: false, caption: "vs. previous 90 days" },
      { id: "tickets", label: "Open tickets", value: 58, change: "11", direction: "up", good: false, caption: "vs. previous 90 days" },
    ],
  },
};

const RANGE_BUTTONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

// A type alias (not an interface) so the shape is assignable to the chart's
// string-indexed DataPoint type.
type RevenueRow = {
  date: string;
  "This period": number;
  "Previous period": number;
};

type ChannelRow = {
  name: string;
  Signups: number;
};

/** Deterministic series so server and client render the same data. */
function buildRevenueSeries(days: number, base: number, amplitude: number): RevenueRow[] {
  const start = new Date(Date.UTC(2025, 2, 30));
  const rows: RevenueRow[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() - i);
    const step = days - 1 - i;
    const wave = Math.sin(step / 2.3) * amplitude;
    const drift = step * (base * 0.006);
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6 ? -amplitude * 0.6 : 0;
    const current = Math.round(base + wave + drift + weekend);
    const previous = Math.round(base * 0.88 + Math.cos(step / 2.9) * amplitude * 0.8 + weekend);
    rows.push({
      date: day.toISOString().slice(0, 10),
      "This period": current,
      "Previous period": previous,
    });
  }
  return rows;
}

const REVENUE_DATA: Record<RangeKey, RevenueRow[]> = {
  "7d": buildRevenueSeries(7, 6800, 900),
  "30d": buildRevenueSeries(30, 6500, 1100),
  "90d": buildRevenueSeries(90, 6200, 1300),
};

const CHANNEL_DATA: Record<RangeKey, ChannelRow[]> = {
  "7d": [
    { name: "Organic", Signups: 412 },
    { name: "Paid", Signups: 268 },
    { name: "Referral", Signups: 187 },
    { name: "Email", Signups: 143 },
    { name: "Social", Signups: 96 },
  ],
  "30d": [
    { name: "Organic", Signups: 1740 },
    { name: "Paid", Signups: 1126 },
    { name: "Referral", Signups: 803 },
    { name: "Email", Signups: 612 },
    { name: "Social", Signups: 389 },
  ],
  "90d": [
    { name: "Organic", Signups: 5120 },
    { name: "Paid", Signups: 3388 },
    { name: "Referral", Signups: 2415 },
    { name: "Email", Signups: 1904 },
    { name: "Social", Signups: 1177 },
  ],
};

type ActivityTone = "success" | "brand" | "danger" | "warning" | "neutral";

type Activity = {
  id: string;
  initials: string;
  icon: IconName;
  title: string;
  detail: string;
  status: string;
  tone: ActivityTone;
  time: string;
};

const ACTIVITY: Activity[] = [
  { id: "a1", initials: "JM", icon: "sparkle", title: "Plan upgraded to Business", detail: "Jane Morales · jane@northwind.co", status: "Completed", tone: "success", time: "2 min ago" },
  { id: "a2", initials: "AK", icon: "person", title: "New workspace created", detail: "Alex Kim · alex@studio-aurora.io", status: "New", tone: "brand", time: "14 min ago" },
  { id: "a3", initials: "OP", icon: "payment", title: "Payment failed on renewal", detail: "Ops Team · billing@buildlane.dev", status: "Action needed", tone: "danger", time: "1 hr ago" },
  { id: "a4", initials: "RS", icon: "chat", title: "Support ticket escalated", detail: "Rita Sandhu · #4821 Export timeout", status: "In review", tone: "warning", time: "2 hr ago" },
  { id: "a5", initials: "TB", icon: "download", title: "Monthly report exported", detail: "Tomás Beltrán · Revenue summary (CSV)", status: "Completed", tone: "success", time: "3 hr ago" },
  { id: "a6", initials: "LN", icon: "settings", title: "SSO configuration updated", detail: "Lena Novak · lena@fjordworks.no", status: "Logged", tone: "neutral", time: "5 hr ago" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function isRangeKey(value: string): value is RangeKey {
  return value === "7d" || value === "30d" || value === "90d";
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");
  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const config = RANGES[range];
  const revenueData = REVENUE_DATA[range];
  const channelData = CHANNEL_DATA[range];

  const revenueSummary = useMemo(() => {
    const total = revenueData.reduce((sum, row) => sum + row["This period"], 0);
    const previous = revenueData.reduce((sum, row) => sum + row["Previous period"], 0);
    const delta = ((total - previous) / previous) * 100;
    return `Daily revenue over the ${config.label.toLowerCase()}, totalling ${currency.format(total)}, ${delta >= 0 ? "up" : "down"} ${Math.abs(delta).toFixed(1)} percent against the previous period.`;
  }, [revenueData, config.label]);

  const channelSummary = useMemo(() => {
    const sorted = [...channelData].sort((a, b) => b.Signups - a.Signups);
    const list = sorted.map((c) => `${c.name} ${c.Signups.toLocaleString("en-US")}`).join(", ");
    return `Signups by channel over the ${config.label.toLowerCase()}: ${list}.`;
  }, [channelData, config.label]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" s={{ paddingY: "24" }}>
      <Column maxWidth="l" gap="32">
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
            <Text variant="body-default-m" onBackground="neutral-weak">
              {config.label} · {config.description}
            </Text>
          </Column>
          <Column fitWidth s={{ fillWidth: true }}>
            <SegmentedControl
              fillWidth={false}
              value={range}
              onChange={(value) => {
                if (isRangeKey(value)) setRange(value);
              }}
              buttons={RANGE_BUTTONS}
              aria-label="Reporting period"
            />
          </Column>
        </Row>

        <section aria-labelledby="kpi-heading">
          <VisuallyHidden as="h2" id="kpi-heading">
            Key metrics
          </VisuallyHidden>
          <Grid ref={statsRef} columns="4" gap="16" l={{ columns: 2 }} xs={{ columns: 1 }} fillWidth>
            {config.stats.map((stat) => {
              const tone = stat.good ? "success-medium" : "danger-medium";
              const directionWord = stat.direction === "up" ? "Up" : "Down";
              const sentiment = stat.good ? "favourable" : "unfavourable";
              return (
                <Column
                  key={stat.id}
                  as="article"
                  background="surface"
                  border
                  radius="l"
                  padding="24"
                  gap="16"
                >
                  <Row fillWidth horizontal="between" vertical="center" gap="8">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {stat.label}
                    </Text>
                    <Row
                      vertical="center"
                      gap="4"
                      onBackground={tone}
                      textVariant="label-default-s"
                    >
                      <Icon name={stat.direction === "up" ? "trendUp" : "trendDown"} size="xs" />
                      <span aria-hidden="true">{stat.change}</span>
                    </Row>
                  </Row>
                  <Row vertical="end" gap="4">
                    {stat.prefix ? <Text variant="display-strong-xs">{stat.prefix}</Text> : null}
                    <CountFx
                      variant="display-strong-xs"
                      value={seen ? stat.value : 0}
                      speed={1200}
                      separator=","
                      decimals={stat.decimals}
                    />
                    {stat.suffix ? <Text variant="display-strong-xs">{stat.suffix}</Text> : null}
                  </Row>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {stat.caption}
                  </Text>
                  <VisuallyHidden>
                    {`${stat.label}: ${stat.prefix ?? ""}${stat.value.toLocaleString("en-US")}${stat.suffix ?? ""}. ${directionWord} ${stat.change}, a ${sentiment} change, ${stat.caption}.`}
                  </VisuallyHidden>
                </Column>
              );
            })}
          </Grid>
        </section>

        <Grid columns="2" gap="16" m={{ columns: 1 }} fillWidth>
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
              <Heading as="h2" id="revenue-heading" variant="heading-strong-m">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Daily revenue compared with the previous period
              </Text>
            </Column>
            <div role="img" aria-label={revenueSummary} style={{ width: "100%" }}>
              <LineChart
                key={`line-${range}`}
                fillWidth
                height={20}
                border="transparent"
                axis="both"
                grid="y"
                curve="monotone"
                legend={{ position: "top-right" }}
                series={[
                  { key: "This period", color: "blue" },
                  { key: "Previous period", color: "gray" },
                ]}
                data={revenueData}
                date={{ format: "MMM d" }}
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
              <Heading as="h2" id="channels-heading" variant="heading-strong-m">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Where new accounts are coming from
              </Text>
            </Column>
            <div role="img" aria-label={channelSummary} style={{ width: "100%" }}>
              <BarChart
                key={`bar-${range}`}
                fillWidth
                height={20}
                border="transparent"
                axis="both"
                grid="y"
                legend={{ display: false }}
                series={[{ key: "Signups", color: "aqua" }]}
                data={channelData}
              />
            </div>
          </Column>
        </Grid>

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
          <Row fillWidth horizontal="between" vertical="center" gap="16">
            <Column gap="4">
              <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Latest events across your workspace
              </Text>
            </Column>
            <Tag size="m" scheme="neutral">
              {ACTIVITY.length} events
            </Tag>
          </Row>
          <Line />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ACTIVITY.map((item, index) => (
              <li key={item.id}>
                <Row
                  fillWidth
                  vertical="center"
                  gap="16"
                  paddingY="12"
                  borderTop={index !== 0}
                  s={{ direction: "column", vertical: "start", gap: "8" }}
                >
                  <Row fillWidth vertical="center" gap="16">
                    <Row
                      center
                      width={2.5}
                      height={2.5}
                      radius="full"
                      background="neutral-alpha-weak"
                      textVariant="label-strong-s"
                      onBackground="neutral-strong"
                      aria-hidden="true"
                    >
                      {item.initials}
                    </Row>
                    <Column fillWidth gap="4">
                      <Row vertical="center" gap="8">
                        <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
                        <Text variant="body-strong-s">{item.title}</Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {item.detail}
                      </Text>
                    </Column>
                  </Row>
                  <Row gap="16" vertical="center" horizontal="end" s={{ fillWidth: true, horizontal: "between" }}>
                    <Tag size="s" scheme={item.tone}>
                      {item.status}
                    </Tag>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {item.time}
                    </Text>
                  </Row>
                </Row>
              </li>
            ))}
          </ul>
        </Column>
      </Column>
    </Column>
  );
}
