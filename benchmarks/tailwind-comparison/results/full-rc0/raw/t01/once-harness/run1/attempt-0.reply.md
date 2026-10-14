```tsx
"use client";

import {
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  List,
  RevealFx,
  Row,
  SegmentedControl,
  StatusIndicator,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useMemo, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

type Kpi = {
  id: string;
  label: string;
  icon: IconName;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Percent change versus the previous period. */
  change: number;
  /** True when a rising number is good news (false for churn, tickets). */
  upIsGood: boolean;
  unit: string;
};

type Activity = {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  time: string;
  status: { label: string; scheme: "success" | "brand" | "danger" | "warning" | "info" };
};

const RANGES: { value: RangeKey; label: string; long: string }[] = [
  { value: "7d", label: "7 days", long: "the last 7 days" },
  { value: "30d", label: "30 days", long: "the last 30 days" },
  { value: "90d", label: "90 days", long: "the last 90 days" },
];

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 48260, prefix: "$", change: 12.4, upIsGood: true, unit: "US dollars" },
    { id: "users", label: "Active users", icon: "person", value: 2847, change: 8.1, upIsGood: true, unit: "users" },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 2.1, suffix: "%", decimals: 1, change: -0.3, upIsGood: false, unit: "percent" },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 34, change: 11.5, upIsGood: false, unit: "tickets" },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 196840, prefix: "$", change: 9.7, upIsGood: true, unit: "US dollars" },
    { id: "users", label: "Active users", icon: "person", value: 9412, change: 14.2, upIsGood: true, unit: "users" },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 2.6, suffix: "%", decimals: 1, change: -0.5, upIsGood: false, unit: "percent" },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 118, change: -6.3, upIsGood: false, unit: "tickets" },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 571300, prefix: "$", change: 18.9, upIsGood: true, unit: "US dollars" },
    { id: "users", label: "Active users", icon: "person", value: 21630, change: 22.4, upIsGood: true, unit: "users" },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 3.2, suffix: "%", decimals: 1, change: 0.4, upIsGood: false, unit: "percent" },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 342, change: 3.1, upIsGood: false, unit: "tickets" },
  ],
};

const REVENUE_SERIES: Record<RangeKey, { label: string; Revenue: number; Target: number }[]> = {
  "7d": [
    { label: "Mon", Revenue: 5800, Target: 6200 },
    { label: "Tue", Revenue: 6400, Target: 6200 },
    { label: "Wed", Revenue: 6100, Target: 6400 },
    { label: "Thu", Revenue: 7300, Target: 6600 },
    { label: "Fri", Revenue: 8200, Target: 6800 },
    { label: "Sat", Revenue: 7500, Target: 7000 },
    { label: "Sun", Revenue: 6960, Target: 7000 },
  ],
  "30d": [
    { label: "Wk 1", Revenue: 41200, Target: 44000 },
    { label: "Wk 2", Revenue: 46800, Target: 46000 },
    { label: "Wk 3", Revenue: 49900, Target: 48000 },
    { label: "Wk 4", Revenue: 58940, Target: 50000 },
  ],
  "90d": [
    { label: "Jan", Revenue: 164200, Target: 170000 },
    { label: "Feb", Revenue: 187400, Target: 180000 },
    { label: "Mar", Revenue: 219700, Target: 200000 },
  ],
};

const CHANNEL_SERIES: Record<RangeKey, { label: string; Signups: number }[]> = {
  "7d": [
    { label: "Organic", Signups: 214 },
    { label: "Paid", Signups: 168 },
    { label: "Referral", Signups: 121 },
    { label: "Email", Signups: 96 },
    { label: "Social", Signups: 73 },
  ],
  "30d": [
    { label: "Organic", Signups: 902 },
    { label: "Paid", Signups: 655 },
    { label: "Referral", Signups: 498 },
    { label: "Email", Signups: 417 },
    { label: "Social", Signups: 288 },
  ],
  "90d": [
    { label: "Organic", Signups: 2710 },
    { label: "Paid", Signups: 1940 },
    { label: "Referral", Signups: 1385 },
    { label: "Email", Signups: 1120 },
    { label: "Social", Signups: 842 },
  ],
};

const ACTIVITY: Activity[] = [
  {
    id: "a1",
    icon: "sparkle",
    title: "Plan upgraded to Business",
    detail: "Priya Raman · Northwind Logistics",
    time: "2 min ago",
    status: { label: "Completed", scheme: "success" },
  },
  {
    id: "a2",
    icon: "person",
    title: "New workspace created",
    detail: "Daniel Okafor · Brightside Studio",
    time: "14 min ago",
    status: { label: "New", scheme: "brand" },
  },
  {
    id: "a3",
    icon: "payment",
    title: "Payment failed — card declined",
    detail: "Marta Kowalski · Fernhill Analytics",
    time: "41 min ago",
    status: { label: "Needs action", scheme: "danger" },
  },
  {
    id: "a4",
    icon: "chat",
    title: "Support ticket escalated",
    detail: "Ticket #4821 · Latency on EU region",
    time: "1 hr ago",
    status: { label: "Escalated", scheme: "warning" },
  },
  {
    id: "a5",
    icon: "download",
    title: "Monthly report exported",
    detail: "Sam Whitfield · Finance team",
    time: "3 hr ago",
    status: { label: "Completed", scheme: "success" },
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function describeChange(kpi: Kpi): { text: string; sentiment: "good" | "bad"; icon: IconName } {
  const rising = kpi.change >= 0;
  const good = rising === kpi.upIsGood;
  const magnitude = Math.abs(kpi.change).toFixed(1);
  return {
    text: `${rising ? "+" : "−"}${magnitude}%`,
    sentiment: good ? "good" : "bad",
    icon: rising ? "trendUp" : "trendDown",
  };
}

function formatKpiForSpeech(kpi: Kpi): string {
  const base =
    kpi.prefix === "$"
      ? currencyFormatter.format(kpi.value)
      : `${kpi.value.toLocaleString("en-US", {
          minimumFractionDigits: kpi.decimals ?? 0,
          maximumFractionDigits: kpi.decimals ?? 0,
        })}${kpi.suffix ?? ""}`;
  return base;
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");

  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const kpis = KPIS[range];
  const rangeMeta = RANGES.find((r) => r.value === range) ?? RANGES[0];
  const revenueData = useMemo(() => REVENUE_SERIES[range], [range]);
  const channelData = useMemo(() => CHANNEL_SERIES[range], [range]);

  const topChannel = channelData.reduce((a, b) => (b.Signups > a.Signups ? b : a));
  const totalSignups = channelData.reduce((sum, d) => sum + d.Signups, 0);
  const revenuePeak = revenueData.reduce((a, b) => (b.Revenue > a.Revenue ? b : a));

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="40">
        {/* Header */}
        <Row
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
              Showing {rangeMeta.long} compared with the previous period.
            </Text>
          </Column>
          <Column gap="8" s={{ fillWidth: true }}>
            <Text as="span" id="range-label" variant="label-default-s" onBackground="neutral-weak">
              Time range
            </Text>
            <div role="group" aria-labelledby="range-label">
              <SegmentedControl
                value={range}
                onChange={(value) => {
                  const next = RANGES.find((r) => r.value === value);
                  if (next) setRange(next.value);
                }}
                buttons={RANGES.map((r) => ({ value: r.value, label: r.label }))}
              />
            </div>
          </Column>
        </Row>

        {/* KPI cards */}
        <section aria-labelledby="kpi-heading">
          <Column gap="16">
            <Heading as="h2" id="kpi-heading" variant="heading-strong-m">
              Key metrics
            </Heading>
            <Grid ref={statsRef} columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
              {kpis.map((kpi, index) => {
                const change = describeChange(kpi);
                const good = change.sentiment === "good";
                return (
                  <RevealFx key={kpi.id} fill revealed={seen} translateY="8" delay={index * 100}>
                    <Column
                      fill
                      background="surface"
                      border
                      radius="l"
                      padding="24"
                      gap="16"
                      role="group"
                      aria-label={`${kpi.label}: ${formatKpiForSpeech(kpi)}, ${change.text} versus previous period, ${
                        good ? "favourable" : "unfavourable"
                      }`}
                    >
                      <Row fillWidth horizontal="between" vertical="center" gap="8">
                        <Row vertical="center" gap="8">
                          <Icon name={kpi.icon} size="s" onBackground="neutral-weak" />
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            {kpi.label}
                          </Text>
                        </Row>
                        <StatusIndicator
                          size="s"
                          color={good ? "green" : "orange"}
                          ariaLabel={good ? "Favourable trend" : "Needs attention"}
                        />
                      </Row>
                      <Row vertical="end" gap="4" aria-hidden="true">
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
                      <Row vertical="center" gap="8" wrap>
                        <Row
                          vertical="center"
                          gap="4"
                          onBackground={good ? "success-medium" : "warning-medium"}
                        >
                          <Icon name={change.icon} size="xs" />
                          <Text variant="label-strong-s">{change.text}</Text>
                        </Row>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          vs previous period
                        </Text>
                      </Row>
                    </Column>
                  </RevealFx>
                );
              })}
            </Grid>
          </Column>
        </section>

        {/* Charts */}
        <section aria-labelledby="charts-heading">
          <Column gap="16">
            <Heading as="h2" id="charts-heading" variant="heading-strong-m">
              Trends
            </Heading>
            <Grid columns="2" gap="24" m={{ columns: 1 }}>
              <Column background="surface" border radius="l" padding="24" gap="16" fillWidth>
                <Column gap="4">
                  <Heading as="h3" variant="heading-strong-s">
                    Revenue vs target
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Peak: {currencyFormatter.format(revenuePeak.Revenue)} ({revenuePeak.label})
                  </Text>
                </Column>
                <div
                  role="img"
                  aria-label={`Line chart of revenue against target for ${rangeMeta.long}. ${revenueData
                    .map((d) => `${d.label}: ${currencyFormatter.format(d.Revenue)} against ${currencyFormatter.format(d.Target)}`)
                    .join("; ")}.`}
                >
                  <LineChart
                    key={`line-${range}`}
                    fillWidth
                    height={22}
                    data={revenueData}
                    series={[{ key: "Revenue" }, { key: "Target" }]}
                    curve="monotone"
                    grid="y"
                    legend={{ display: true, position: "top-right" }}
                    border="transparent"
                  />
                </div>
              </Column>

              <Column background="surface" border radius="l" padding="24" gap="16" fillWidth>
                <Column gap="4">
                  <Heading as="h3" variant="heading-strong-s">
                    Signups by channel
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {totalSignups.toLocaleString("en-US")} total · {topChannel.label} leads with{" "}
                    {topChannel.Signups.toLocaleString("en-US")}
                  </Text>
                </Column>
                <div
                  role="img"
                  aria-label={`Bar chart of signups by channel for ${rangeMeta.long}. ${channelData
                    .map((d) => `${d.label}: ${d.Signups.toLocaleString("en-US")}`)
                    .join("; ")}.`}
                >
                  <BarChart
                    key={`bar-${range}`}
                    fillWidth
                    height={22}
                    data={channelData}
                    series={[{ key: "Signups" }]}
                    legend={{ display: false }}
                    border="transparent"
                  />
                </div>
              </Column>
            </Grid>
          </Column>
        </section>

        {/* Recent activity */}
        <section aria-labelledby="activity-heading">
          <Column background="surface" border radius="l" padding="24" gap="16">
            <Row fillWidth horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                  Recent activity
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Latest events across your workspace
                </Text>
              </Column>
              <Row vertical="center" gap="8" s={{ hide: true }}>
                <StatusIndicator size="s" color="green" ariaLabel="Live" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Live
                </Text>
              </Row>
            </Row>
            <Line />
            <List gap="0" fillWidth>
              {ACTIVITY.map((item, index) => (
                <Column as="li" key={item.id} fillWidth style={{ listStyle: "none" }}>
                  <Row
                    fillWidth
                    vertical="center"
                    gap="16"
                    paddingY="16"
                    s={{ direction: "column", vertical: "start", gap: "12" }}
                  >
                    <Row fillWidth vertical="center" gap="16">
                      <Row
                        center
                        background="neutral-alpha-weak"
                        radius="full"
                        minWidth={2.5}
                        minHeight={2.5}
                        aria-hidden="true"
                      >
                        <Icon name={item.icon} size="s" onBackground="neutral-medium" />
                      </Row>
                      <Column flex={1} gap="4">
                        <Text variant="label-strong-m">{item.title}</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {item.detail}
                        </Text>
                      </Column>
                    </Row>
                    <Row vertical="center" gap="16" s={{ fillWidth: true, horizontal: "between" }}>
                      <Tag size="s" scheme={item.status.scheme}>
                        {item.status.label}
                      </Tag>
                      <Text variant="label-default-s" onBackground="neutral-weak" style={{ whiteSpace: "nowrap" }}>
                        {item.time}
                      </Text>
                    </Row>
                  </Row>
                  {index < ACTIVITY.length - 1 && <Line />}
                </Column>
              ))}
            </List>
          </Column>
        </section>
      </Column>
    </Column>
  );
}
```