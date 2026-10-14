"use client";

import {
  Column,
  CountFx,
  Grid,
  Icon,
  Line,
  RevealFx,
  Row,
  SegmentedControl,
  Skeleton,
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
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 48260, prefix: "$", change: 12.4, upIsGood: true },
    { id: "users", label: "Active users", icon: "person", value: 2847, change: 8.1, upIsGood: true },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 2.1, suffix: "%", decimals: 1, change: -0.3, upIsGood: false },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 34, change: 11.5, upIsGood: false },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 196840, prefix: "$", change: 9.7, upIsGood: true },
    { id: "users", label: "Active users", icon: "person", value: 9412, change: 14.2, upIsGood: true },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 2.6, suffix: "%", decimals: 1, change: -0.5, upIsGood: false },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 118, change: -6.3, upIsGood: false },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", icon: "banknotes", value: 571300, prefix: "$", change: 18.9, upIsGood: true },
    { id: "users", label: "Active users", icon: "person", value: 21630, change: 22.4, upIsGood: true },
    { id: "churn", label: "Churn rate", icon: "trendDown", value: 3.2, suffix: "%", decimals: 1, change: 0.4, upIsGood: false },
    { id: "tickets", label: "Open tickets", icon: "inbox", value: 342, change: 3.1, upIsGood: false },
  ],
};

type RevenuePoint = { label: string; Revenue: number; Target: number };
type ChannelPoint = { label: string; Signups: number };

const REVENUE_SERIES: Record<RangeKey, RevenuePoint[]> = {
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

const CHANNEL_SERIES: Record<RangeKey, ChannelPoint[]> = {
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

const numberFormatter = new Intl.NumberFormat("en-US");

function describeChange(kpi: Kpi): { text: string; good: boolean; icon: IconName } {
  const rising = kpi.change >= 0;
  return {
    text: `${rising ? "+" : "−"}${Math.abs(kpi.change).toFixed(1)}%`,
    good: rising === kpi.upIsGood,
    icon: rising ? "trendUp" : "trendDown",
  };
}

function formatKpi(kpi: Kpi): string {
  if (kpi.prefix === "$") return currencyFormatter.format(kpi.value);
  const digits = kpi.decimals ?? 0;
  const formatted = kpi.value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${formatted}${kpi.suffix ?? ""}`;
}

const nowrap = { whiteSpace: "nowrap" } as const;
const noMarker = { listStyle: "none", margin: 0, padding: 0 } as const;
const resetHeading = { margin: 0 } as const;

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [mounted, setMounted] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const revenueSummary = `Line chart of revenue against target for ${rangeMeta.long}. ${revenueData
    .map((d) => `${d.label}: ${currencyFormatter.format(d.Revenue)} against a target of ${currencyFormatter.format(d.Target)}`)
    .join("; ")}.`;
  const channelSummary = `Bar chart of signups by channel for ${rangeMeta.long}. ${channelData
    .map((d) => `${d.label}: ${numberFormatter.format(d.Signups)}`)
    .join("; ")}.`;

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingY: "24", paddingX: "16" }}
    >
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
            <h1 style={resetHeading}>
              <Text variant="display-strong-s">Performance overview</Text>
            </h1>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Showing {rangeMeta.long} compared with the previous period.
            </Text>
          </Column>
          <Column gap="8" s={{ fillWidth: true }}>
            <span id="range-label">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Time range
              </Text>
            </span>
            <div role="group" aria-labelledby="range-label">
              <SegmentedControl
                value={range}
                onChange={(value: string) => {
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
            <h2 id="kpi-heading" style={resetHeading}>
              <Text variant="heading-strong-m">Key metrics</Text>
            </h2>
            <Grid ref={statsRef} columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
              {kpis.map((kpi, index) => {
                const change = describeChange(kpi);
                return (
                  <RevealFx key={kpi.id} fill revealed={seen} translateY="8" delay={index * 100}>
                    <Column fill background="surface" border radius="l" padding="24" gap="16">
                      <Row fillWidth horizontal="between" vertical="center" gap="8">
                        <Row vertical="center" gap="8">
                          <Icon name={kpi.icon} size="s" onBackground="neutral-weak" />
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            {kpi.label}
                          </Text>
                        </Row>
                        <StatusIndicator
                          size="s"
                          color={change.good ? "green" : "orange"}
                          ariaLabel={change.good ? "Favourable trend" : "Needs attention"}
                        />
                      </Row>
                      <Row vertical="end" gap="4">
                        {/* Animated figure is decorative; the exact value is announced below. */}
                        <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: 4 }}>
                          {kpi.prefix && <Text variant="display-strong-xs">{kpi.prefix}</Text>}
                          <CountFx
                            variant="display-strong-xs"
                            value={seen ? kpi.value : 0}
                            speed={1200}
                            separator=","
                            decimals={kpi.decimals}
                          />
                          {kpi.suffix && <Text variant="display-strong-xs">{kpi.suffix}</Text>}
                        </span>
                        <span
                          style={{
                            position: "absolute",
                            width: 1,
                            height: 1,
                            overflow: "hidden",
                            clip: "rect(0 0 0 0)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {kpi.label}: {formatKpi(kpi)}
                        </span>
                      </Row>
                      <Row vertical="center" gap="8" wrap>
                        <Row
                          vertical="center"
                          gap="4"
                          onBackground={change.good ? "success-medium" : "warning-medium"}
                        >
                          <Icon name={change.icon} size="xs" />
                          <Text variant="label-strong-s">{change.text}</Text>
                        </Row>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          vs previous period
                        </Text>
                        <span
                          style={{
                            position: "absolute",
                            width: 1,
                            height: 1,
                            overflow: "hidden",
                            clip: "rect(0 0 0 0)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {change.good ? "Favourable" : "Unfavourable"} trend
                        </span>
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
            <h2 id="charts-heading" style={resetHeading}>
              <Text variant="heading-strong-m">Trends</Text>
            </h2>
            <Grid columns="2" gap="24" m={{ columns: 1 }}>
              <Column background="surface" border radius="l" padding="24" gap="16" fillWidth>
                <Column gap="4">
                  <h3 style={resetHeading}>
                    <Text variant="heading-strong-s">Revenue vs target</Text>
                  </h3>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Peak: {currencyFormatter.format(revenuePeak.Revenue)} ({revenuePeak.label})
                  </Text>
                </Column>
                <div role="img" aria-label={revenueSummary}>
                  <Column fillWidth minHeight={20}>
                    {mounted ? (
                      <LineChart
                        key={`line-${range}`}
                        fillWidth
                        data={revenueData}
                        series={[{ key: "Revenue" }, { key: "Target" }]}
                        curve="monotone"
                        grid="y"
                        legend={{ display: true, position: "top-right" }}
                        border="transparent"
                      />
                    ) : (
                      <Skeleton shape="block" fillWidth minHeight={20} />
                    )}
                  </Column>
                </div>
              </Column>

              <Column background="surface" border radius="l" padding="24" gap="16" fillWidth>
                <Column gap="4">
                  <h3 style={resetHeading}>
                    <Text variant="heading-strong-s">Signups by channel</Text>
                  </h3>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {numberFormatter.format(totalSignups)} total · {topChannel.label} leads with{" "}
                    {numberFormatter.format(topChannel.Signups)}
                  </Text>
                </Column>
                <div role="img" aria-label={channelSummary}>
                  <Column fillWidth minHeight={20}>
                    {mounted ? (
                      <BarChart
                        key={`bar-${range}`}
                        fillWidth
                        data={channelData}
                        series={[{ key: "Signups" }]}
                        legend={{ display: false }}
                        border="transparent"
                      />
                    ) : (
                      <Skeleton shape="block" fillWidth minHeight={20} />
                    )}
                  </Column>
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
                <h2 id="activity-heading" style={resetHeading}>
                  <Text variant="heading-strong-m">Recent activity</Text>
                </h2>
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
            <ul style={noMarker}>
              {ACTIVITY.map((item, index) => (
                <li key={item.id} style={noMarker}>
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
                        width="40"
                        height="40"
                        minWidth="40"
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
                      <span style={nowrap}>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {item.time}
                        </Text>
                      </span>
                    </Row>
                  </Row>
                  {index < ACTIVITY.length - 1 && <Line />}
                </li>
              ))}
            </ul>
          </Column>
        </section>
      </Column>
    </Column>
  );
}
