I have everything I need. Writing the page.

```tsx
"use client";

import {
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  SegmentedControl,
  Tag,
  Text,
  VisuallyHidden,
  useInViewport,
  type IconName,
} from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useMemo, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

interface Kpi {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  /** Direction of the metric itself */
  direction: "up" | "down";
  /** Whether that direction is good for the business */
  good: boolean;
  caption: string;
  icon: IconName;
}

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 48320,
      prefix: "$",
      change: "12.4%",
      direction: "up",
      good: true,
      caption: "vs. previous 7 days",
      icon: "banknotes",
    },
    {
      id: "users",
      label: "Active users",
      value: 8214,
      change: "8.1%",
      direction: "up",
      good: true,
      caption: "vs. previous 7 days",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.4,
      suffix: "%",
      decimals: 1,
      change: "0.3%",
      direction: "down",
      good: false,
      caption: "vs. previous 7 days",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 1.9,
      suffix: "%",
      decimals: 1,
      change: "0.2%",
      direction: "down",
      good: true,
      caption: "vs. previous 7 days",
      icon: "personRemove",
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 212840,
      prefix: "$",
      change: "9.7%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
      icon: "banknotes",
    },
    {
      id: "users",
      label: "Active users",
      value: 21906,
      change: "14.2%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.7,
      suffix: "%",
      decimals: 1,
      change: "0.5%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 2.3,
      suffix: "%",
      decimals: 1,
      change: "0.4%",
      direction: "up",
      good: false,
      caption: "vs. previous 30 days",
      icon: "personRemove",
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 641500,
      prefix: "$",
      change: "18.9%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
      icon: "banknotes",
    },
    {
      id: "users",
      label: "Active users",
      value: 37450,
      change: "22.6%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.9,
      suffix: "%",
      decimals: 1,
      change: "0.8%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 2.1,
      suffix: "%",
      decimals: 1,
      change: "0.1%",
      direction: "down",
      good: true,
      caption: "vs. previous 90 days",
      icon: "personRemove",
    },
  ],
};

interface RevenuePoint {
  date: string;
  Revenue: number;
  "Previous period": number;
}

/** Deterministic pseudo-series so server and client render identically. */
function buildRevenueSeries(days: number, base: number, growth: number): RevenuePoint[] {
  const start = new Date(Date.UTC(2025, 5, 30));
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const points: RevenuePoint[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const weekly = Math.sin((i / 7) * Math.PI * 2) * base * 0.12;
    const wobble = Math.cos(i * 1.7) * base * 0.05;
    const trend = i * growth;
    const current = Math.round(base + trend + weekly + wobble);
    const previous = Math.round(base * 0.88 + trend * 0.6 + weekly * 0.8 - wobble * 0.5);
    points.push({
      date: d.toISOString().slice(0, 10),
      Revenue: current,
      "Previous period": previous,
    });
  }
  return points;
}

const REVENUE_DATA: Record<RangeKey, RevenuePoint[]> = {
  "7d": buildRevenueSeries(7, 6400, 120),
  "30d": buildRevenueSeries(30, 6800, 70),
  "90d": buildRevenueSeries(90, 6900, 40),
};

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

interface ChannelPoint {
  date: string;
  Signups: number;
}

const CHANNEL_DATA: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { date: "Organic", Signups: 412 },
    { date: "Paid", Signups: 286 },
    { date: "Referral", Signups: 194 },
    { date: "Email", Signups: 158 },
    { date: "Social", Signups: 121 },
  ],
  "30d": [
    { date: "Organic", Signups: 1740 },
    { date: "Paid", Signups: 1195 },
    { date: "Referral", Signups: 822 },
    { date: "Email", Signups: 684 },
    { date: "Social", Signups: 503 },
  ],
  "90d": [
    { date: "Organic", Signups: 5120 },
    { date: "Paid", Signups: 3610 },
    { date: "Referral", Signups: 2470 },
    { date: "Email", Signups: 2015 },
    { date: "Social", Signups: 1488 },
  ],
};

type ActivityTone = "success" | "brand" | "danger" | "warning" | "neutral";

interface ActivityItem {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  time: string;
  status: string;
  tone: ActivityTone;
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    icon: "sparkle",
    title: "Priya Nair upgraded to the Business plan",
    detail: "Northwind Logistics · $1,188 / year",
    time: "2 min ago",
    status: "Upgrade",
    tone: "success",
  },
  {
    id: "a2",
    icon: "person",
    title: "New workspace created by Marcus Oyelaran",
    detail: "Brightline Studio · 6 seats invited",
    time: "18 min ago",
    status: "New",
    tone: "brand",
  },
  {
    id: "a3",
    icon: "payment",
    title: "Payment failed for Hollis & Reed LLP",
    detail: "Card ending 4417 · retry scheduled for tomorrow",
    time: "47 min ago",
    status: "Action needed",
    tone: "danger",
  },
  {
    id: "a4",
    icon: "chat",
    title: "Support ticket #4821 escalated",
    detail: "Webhook delivery delays · assigned to Dana Kowalski",
    time: "1 hr ago",
    status: "Escalated",
    tone: "warning",
  },
  {
    id: "a5",
    icon: "download",
    title: "Quarterly report exported by Elena Voss",
    detail: "Q2 2025 revenue summary · CSV, 2.4 MB",
    time: "3 hr ago",
    status: "Completed",
    tone: "neutral",
  },
  {
    id: "a6",
    icon: "personRemove",
    title: "Subscription cancelled by Tomás Ibarra",
    detail: "Fernhill Coffee · reason: switching to in-house tooling",
    time: "5 hr ago",
    status: "Churned",
    tone: "danger",
  },
];

function formatTrend(kpi: Kpi): string {
  const sign = kpi.direction === "up" ? "Up" : "Down";
  const quality = kpi.good ? "favourable" : "unfavourable";
  return `${sign} ${kpi.change}, ${quality}, ${kpi.caption}`;
}

function summariseRevenue(data: RevenuePoint[]): string {
  const first = data[0];
  const last = data[data.length - 1];
  const peak = data.reduce((a, b) => (b.Revenue > a.Revenue ? b : a), first);
  return `Daily revenue from ${first.date} to ${last.date}. Started at $${first.Revenue.toLocaleString(
    "en-US",
  )}, ended at $${last.Revenue.toLocaleString("en-US")}, peaking at $${peak.Revenue.toLocaleString(
    "en-US",
  )} on ${peak.date}.`;
}

function summariseChannels(data: ChannelPoint[]): string {
  return `Signups by channel: ${data
    .map((d) => `${d.Signups.toLocaleString("en-US")} from ${d.date}`)
    .join(", ")}.`;
}

interface KpiCardProps {
  kpi: Kpi;
  active: boolean;
}

function KpiCard({ kpi, active }: KpiCardProps) {
  const tone = kpi.good ? "success-medium" : "danger-medium";
  return (
    <Column
      as="li"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="16"
      fillWidth
      style={{ listStyle: "none" }}
    >
      <Row fillWidth horizontal="between" vertical="center" gap="12">
        <Text as="h3" variant="label-default-s" onBackground="neutral-medium">
          {kpi.label}
        </Text>
        <Row
          center
          radius="m"
          background="neutral-alpha-weak"
          padding="8"
          onBackground="neutral-weak"
        >
          <Icon name={kpi.icon} size="s" />
        </Row>
      </Row>

      <Row vertical="end" gap="4" aria-hidden="true">
        {kpi.prefix && <Text variant="display-strong-s">{kpi.prefix}</Text>}
        <CountFx
          variant="display-strong-s"
          value={active ? kpi.value : 0}
          decimals={kpi.decimals}
          speed={1000}
          separator=","
        />
        {kpi.suffix && <Text variant="display-strong-s">{kpi.suffix}</Text>}
      </Row>
      <VisuallyHidden>
        {kpi.label}: {kpi.prefix ?? ""}
        {kpi.value.toLocaleString("en-US")}
        {kpi.suffix ?? ""}.
      </VisuallyHidden>

      <Row gap="8" vertical="center" wrap>
        <Row gap="4" vertical="center" onBackground={tone}>
          <Icon name={kpi.direction === "up" ? "trendUp" : "trendDown"} size="xs" />
          <Text variant="label-strong-s">{kpi.change}</Text>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {kpi.caption}
        </Text>
        <VisuallyHidden>{formatTrend(kpi)}</VisuallyHidden>
      </Row>
    </Column>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");

  const kpiRef = useRef<HTMLUListElement>(null);
  const inViewport = useInViewport(kpiRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const revenueData = REVENUE_DATA[range];
  const channelData = CHANNEL_DATA[range];
  const revenueSummary = useMemo(() => summariseRevenue(revenueData), [revenueData]);
  const channelSummary = useMemo(() => summariseChannels(channelData), [channelData]);

  const handleRange = (value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") setRange(value);
  };

  const revenueStart = revenueData[0].date;
  const revenueEnd = revenueData[revenueData.length - 1].date;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32" gap="32">
      <Column maxWidth="l" fillWidth gap="32">
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
            <Text variant="body-default-m" onBackground="neutral-medium">
              Revenue, growth and customer activity across Meridian Cloud.
            </Text>
          </Column>
          <Column gap="8" s={{ fillWidth: true }}>
            <VisuallyHidden as="span" id="range-label">
              Select reporting period
            </VisuallyHidden>
            <SegmentedControl
              aria-labelledby="range-label"
              value={range}
              onChange={handleRange}
              fillWidth={false}
              buttons={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />
          </Column>
        </Row>

        {/* KPI cards */}
        <Column as="section" aria-labelledby="kpi-heading" gap="16" fillWidth>
          <VisuallyHidden as="h2" id="kpi-heading">
            Key metrics, {RANGE_LABEL[range].toLowerCase()}
          </VisuallyHidden>
          <Grid
            as="ul"
            ref={kpiRef}
            columns="4"
            gap="16"
            fillWidth
            l={{ columns: 2 }}
            s={{ columns: 1 }}
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {KPIS[range].map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} active={seen} />
            ))}
          </Grid>
        </Column>

        {/* Charts */}
        <Grid columns="2" gap="24" fillWidth l={{ columns: 1 }}>
          <Column
            as="section"
            aria-labelledby="revenue-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            fillWidth
          >
            <Column gap="4">
              <Heading as="h2" id="revenue-heading" variant="heading-strong-m">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Daily revenue compared with the previous period · {RANGE_LABEL[range]}
              </Text>
            </Column>
            <Column fillWidth role="img" aria-label={revenueSummary}>
              <LineChart
                key={`revenue-${range}`}
                fillWidth
                minHeight={20}
                border="transparent"
                axis="x"
                grid="y"
                curve="monotone"
                date={{
                  start: new Date(`${revenueStart}T00:00:00Z`),
                  end: new Date(`${revenueEnd}T00:00:00Z`),
                  format: range === "90d" ? "MMM" : "MMM dd",
                }}
                series={[
                  { key: "Revenue", color: "blue" },
                  { key: "Previous period", color: "gray" },
                ]}
                data={revenueData}
              />
            </Column>
            <VisuallyHidden>{revenueSummary}</VisuallyHidden>
          </Column>

          <Column
            as="section"
            aria-labelledby="channels-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            fillWidth
          >
            <Column gap="4">
              <Heading as="h2" id="channels-heading" variant="heading-strong-m">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                New accounts grouped by acquisition source · {RANGE_LABEL[range]}
              </Text>
            </Column>
            <Column fillWidth role="img" aria-label={channelSummary}>
              <BarChart
                key={`channels-${range}`}
                fillWidth
                minHeight={20}
                border="transparent"
                axis="both"
                grid="y"
                legend={{ display: false }}
                series={[{ key: "Signups", color: "blue" }]}
                data={channelData}
              />
            </Column>
            <VisuallyHidden>{channelSummary}</VisuallyHidden>
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
          fillWidth
        >
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Column gap="4">
              <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Latest account and billing events
              </Text>
            </Column>
            <Row gap="8" vertical="center" onBackground="neutral-weak">
              <Icon name="time" size="xs" />
              <Text variant="label-default-s">Updated just now</Text>
            </Row>
          </Row>
          <Line />
          <Column as="ul" fillWidth style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ACTIVITY.map((item, index) => (
              <Row
                as="li"
                key={item.id}
                fillWidth
                gap="16"
                paddingY="16"
                vertical="center"
                borderBottom={index === ACTIVITY.length - 1 ? undefined : true}
                s={{ direction: "column", vertical: "start", gap: "12" }}
              >
                <Row fillWidth gap="16" vertical="center">
                  <Row
                    center
                    radius="full"
                    background="neutral-alpha-weak"
                    minWidth={2.5}
                    width={2.5}
                    height={2.5}
                    onBackground="neutral-medium"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column fillWidth gap="4">
                    <Text variant="label-strong-m">{item.title}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                  </Column>
                </Row>
                <Row gap="12" vertical="center" horizontal="end" s={{ horizontal: "start" }}>
                  <Tag size="s" scheme={item.tone}>
                    {item.status}
                  </Tag>
                  <Text
                    variant="body-default-xs"
                    onBackground="neutral-weak"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {item.time}
                  </Text>
                </Row>
              </Row>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```