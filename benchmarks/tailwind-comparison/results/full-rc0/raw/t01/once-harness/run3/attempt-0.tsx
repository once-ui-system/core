"use client";

import {
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  type IconName,
  Row,
  SegmentedControl,
  StatusIndicator,
  Tag,
  Text,
  VisuallyHidden,
  useInViewport,
} from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useMemo, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

interface RangeOption {
  value: RangeKey;
  label: string;
  period: string;
  previous: string;
}

const ranges: RangeOption[] = [
  { value: "7d", label: "7 days", period: "Last 7 days", previous: "previous 7 days" },
  { value: "30d", label: "30 days", period: "Last 30 days", previous: "previous 30 days" },
  { value: "90d", label: "90 days", period: "Last 90 days", previous: "previous 90 days" },
];

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
  /** Whether that movement is good news for the business. */
  good: boolean;
  caption: string;
  icon: IconName;
}

const kpisByRange: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 28460,
      prefix: "$",
      change: "12.4%",
      direction: "up",
      good: true,
      caption: "vs. $25,320 previous period",
      icon: "banknotes",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: 18240,
      change: "8.1%",
      direction: "up",
      good: true,
      caption: "vs. 16,872 previous period",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.2,
      suffix: "%",
      decimals: 1,
      change: "0.4 pts",
      direction: "down",
      good: false,
      caption: "vs. 3.6% previous period",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 1.8,
      suffix: "%",
      decimals: 1,
      change: "0.3 pts",
      direction: "down",
      good: true,
      caption: "vs. 2.1% previous period",
      icon: "personRemove",
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 124800,
      prefix: "$",
      change: "9.7%",
      direction: "up",
      good: true,
      caption: "vs. $113,760 previous period",
      icon: "banknotes",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: 79310,
      change: "5.6%",
      direction: "up",
      good: true,
      caption: "vs. 75,100 previous period",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.5,
      suffix: "%",
      decimals: 1,
      change: "0.2 pts",
      direction: "up",
      good: true,
      caption: "vs. 3.3% previous period",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 2.1,
      suffix: "%",
      decimals: 1,
      change: "0.2 pts",
      direction: "up",
      good: false,
      caption: "vs. 1.9% previous period",
      icon: "personRemove",
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Revenue",
      value: 361200,
      prefix: "$",
      change: "17.3%",
      direction: "up",
      good: true,
      caption: "vs. $307,950 previous period",
      icon: "banknotes",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: 231870,
      change: "11.9%",
      direction: "up",
      good: true,
      caption: "vs. 207,200 previous period",
      icon: "person",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: 3.4,
      suffix: "%",
      decimals: 1,
      change: "0.1 pts",
      direction: "up",
      good: true,
      caption: "vs. 3.3% previous period",
      icon: "trend",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: 2.4,
      suffix: "%",
      decimals: 1,
      change: "0.5 pts",
      direction: "down",
      good: true,
      caption: "vs. 2.9% previous period",
      icon: "personRemove",
    },
  ],
};

const revenueSeries = [
  { key: "Current period", color: "blue" },
  { key: "Previous period", color: "gray" },
];

const revenueByRange: Record<
  RangeKey,
  { date: string; "Current period": number; "Previous period": number }[]
> = {
  "7d": [
    { date: "2025-03-03", "Current period": 3620, "Previous period": 3210 },
    { date: "2025-03-04", "Current period": 3980, "Previous period": 3540 },
    { date: "2025-03-05", "Current period": 4210, "Previous period": 3480 },
    { date: "2025-03-06", "Current period": 3890, "Previous period": 3720 },
    { date: "2025-03-07", "Current period": 4570, "Previous period": 3910 },
    { date: "2025-03-08", "Current period": 4130, "Previous period": 3650 },
    { date: "2025-03-09", "Current period": 4060, "Previous period": 3810 },
  ],
  "30d": [
    { date: "2025-02-08", "Current period": 3210, "Previous period": 2890 },
    { date: "2025-02-12", "Current period": 3480, "Previous period": 3120 },
    { date: "2025-02-16", "Current period": 3950, "Previous period": 3340 },
    { date: "2025-02-20", "Current period": 3720, "Previous period": 3510 },
    { date: "2025-02-24", "Current period": 4180, "Previous period": 3690 },
    { date: "2025-02-28", "Current period": 4390, "Previous period": 3820 },
    { date: "2025-03-04", "Current period": 4120, "Previous period": 3970 },
    { date: "2025-03-09", "Current period": 4650, "Previous period": 4040 },
  ],
  "90d": [
    { date: "2024-12-10", "Current period": 2840, "Previous period": 2510 },
    { date: "2024-12-24", "Current period": 3120, "Previous period": 2690 },
    { date: "2025-01-07", "Current period": 3390, "Previous period": 2880 },
    { date: "2025-01-21", "Current period": 3610, "Previous period": 3040 },
    { date: "2025-02-04", "Current period": 3870, "Previous period": 3260 },
    { date: "2025-02-18", "Current period": 4090, "Previous period": 3450 },
    { date: "2025-03-04", "Current period": 4380, "Previous period": 3610 },
    { date: "2025-03-09", "Current period": 4650, "Previous period": 3780 },
  ],
};

const channelSeries = [{ key: "Signups", color: "indigo" }];

const channelsByRange: Record<RangeKey, { label: string; Signups: number }[]> = {
  "7d": [
    { label: "Organic", Signups: 412 },
    { label: "Paid", Signups: 286 },
    { label: "Referral", Signups: 198 },
    { label: "Email", Signups: 164 },
    { label: "Social", Signups: 121 },
  ],
  "30d": [
    { label: "Organic", Signups: 1740 },
    { label: "Paid", Signups: 1195 },
    { label: "Referral", Signups: 860 },
    { label: "Email", Signups: 702 },
    { label: "Social", Signups: 531 },
  ],
  "90d": [
    { label: "Organic", Signups: 5120 },
    { label: "Paid", Signups: 3480 },
    { label: "Referral", Signups: 2615 },
    { label: "Email", Signups: 2090 },
    { label: "Social", Signups: 1610 },
  ],
};

type ActivityTone = "success" | "brand" | "danger" | "warning" | "neutral";

interface Activity {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  time: string;
  status: string;
  tone: ActivityTone;
  dot: "green" | "blue" | "red" | "orange" | "gray";
}

const activity: Activity[] = [
  {
    id: "a1",
    icon: "payment",
    title: "Plan upgraded to Business",
    detail: "Northwind Traders · $1,188 / year",
    time: "4 min ago",
    status: "Completed",
    tone: "success",
    dot: "green",
  },
  {
    id: "a2",
    icon: "person",
    title: "New team signup",
    detail: "Priya Raman · Lumen Studio (12 seats)",
    time: "21 min ago",
    status: "New",
    tone: "brand",
    dot: "blue",
  },
  {
    id: "a3",
    icon: "warning",
    title: "Payment failed on renewal",
    detail: "Harbor & Finch · card ending 4417",
    time: "1 hr ago",
    status: "Needs action",
    tone: "danger",
    dot: "red",
  },
  {
    id: "a4",
    icon: "chat",
    title: "Support ticket escalated",
    detail: "#3182 · SSO login loop for Okta users",
    time: "2 hrs ago",
    status: "In review",
    tone: "warning",
    dot: "orange",
  },
  {
    id: "a5",
    icon: "download",
    title: "Quarterly report exported",
    detail: "Marcus Lindqvist · Q1 revenue summary (CSV)",
    time: "Yesterday",
    status: "Completed",
    tone: "success",
    dot: "green",
  },
  {
    id: "a6",
    icon: "personRemove",
    title: "Subscription cancelled",
    detail: "Delta Freight · Starter plan, reason: budget",
    time: "Yesterday",
    status: "Churned",
    tone: "neutral",
    dot: "gray",
  },
];

function trendLabel(kpi: Kpi): string {
  const dir = kpi.direction === "up" ? "up" : "down";
  const sentiment = kpi.good ? "favourable" : "unfavourable";
  return `${kpi.label} is ${dir} ${kpi.change}, ${sentiment}`;
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");
  const activeRange = ranges.find((r) => r.value === range) ?? ranges[1];

  const kpiRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(kpiRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const kpis = kpisByRange[range];
  const revenueData = revenueByRange[range];
  const channelData = channelsByRange[range];

  const topChannel = useMemo(
    () => channelData.reduce((a, b) => (b.Signups > a.Signups ? b : a)),
    [channelData],
  );
  const totalSignups = useMemo(
    () => channelData.reduce((sum, c) => sum + c.Signups, 0),
    [channelData],
  );

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
            <Text variant="body-default-m" onBackground="neutral-medium">
              {activeRange.period}, compared with the {activeRange.previous}.
            </Text>
          </Column>
          <Column s={{ fillWidth: true }} fitWidth>
            <SegmentedControl
              fillWidth={false}
              value={range}
              onChange={(value) => {
                const next = ranges.find((r) => r.value === value);
                if (next) setRange(next.value);
              }}
              buttons={ranges.map((r) => ({ value: r.value, label: r.label }))}
            />
          </Column>
        </Row>

        <Column as="section" aria-labelledby="kpi-heading" gap="16">
          <VisuallyHidden as="h2" >
            <span id="kpi-heading">Key metrics</span>
          </VisuallyHidden>
          <Grid ref={kpiRef} as="ul" columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
            {kpis.map((kpi) => {
              const TrendIcon: IconName = kpi.direction === "up" ? "trendUp" : "trendDown";
              return (
                <Column
                  as="li"
                  key={kpi.id}
                  background="surface"
                  border
                  radius="l"
                  padding="24"
                  gap="16"
                >
                  <Row fillWidth horizontal="between" vertical="center" gap="12">
                    <Text variant="label-default-s" onBackground="neutral-medium">
                      {kpi.label}
                    </Text>
                    <Row
                      center
                      padding="8"
                      radius="m"
                      background="neutral-alpha-weak"
                      onBackground="neutral-medium"
                    >
                      <Icon name={kpi.icon} size="s" />
                    </Row>
                  </Row>
                  <Row vertical="end" gap="2">
                    {kpi.prefix && <Text variant="display-strong-xs">{kpi.prefix}</Text>}
                    <CountFx
                      variant="display-strong-xs"
                      value={seen ? kpi.value : 0}
                      speed={1000}
                      separator=","
                      decimals={kpi.decimals}
                    />
                    {kpi.suffix && <Text variant="display-strong-xs">{kpi.suffix}</Text>}
                  </Row>
                  <Column gap="4">
                    <Row
                      gap="4"
                      vertical="center"
                      onBackground={kpi.good ? "success-medium" : "danger-medium"}
                    >
                      <Icon name={TrendIcon} size="xs" />
                      <Text variant="label-strong-s">
                        {kpi.direction === "up" ? "+" : "−"}
                        {kpi.change}
                      </Text>
                      <VisuallyHidden>{trendLabel(kpi)}</VisuallyHidden>
                    </Row>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {kpi.caption}
                    </Text>
                  </Column>
                </Column>
              );
            })}
          </Grid>
        </Column>

        <Grid columns="2" gap="16" m={{ columns: 1 }}>
          <Column
            as="section"
            aria-labelledby="revenue-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
          >
            <Column gap="4">
              <Heading as="h2" id="revenue-heading" variant="heading-strong-m">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                Daily revenue in USD, {activeRange.period.toLowerCase()} against the{" "}
                {activeRange.previous}.
              </Text>
            </Column>
            <div role="img" aria-label={`Line chart of daily revenue for the ${activeRange.period.toLowerCase()} compared with the ${activeRange.previous}. Revenue ended at ${revenueData[revenueData.length - 1]["Current period"].toLocaleString("en-US")} dollars per day.`}>
              <LineChart
                key={`line-${range}`}
                fillWidth
                height={20}
                border="transparent"
                axis="both"
                grid="y"
                curve="monotone"
                legend={{ display: true, position: "bottom-center" }}
                series={revenueSeries}
                data={revenueData}
                date={{ format: "MMM d" }}
              />
            </div>
            <VisuallyHidden>
              <table>
                <caption>Revenue by date</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Current period</th>
                    <th scope="col">Previous period</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((row) => (
                    <tr key={row.date}>
                      <th scope="row">{row.date}</th>
                      <td>{row["Current period"]}</td>
                      <td>{row["Previous period"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </VisuallyHidden>
          </Column>

          <Column
            as="section"
            aria-labelledby="channel-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
          >
            <Column gap="4">
              <Heading as="h2" id="channel-heading" variant="heading-strong-m">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                {totalSignups.toLocaleString("en-US")} new accounts. {topChannel.label} leads with{" "}
                {topChannel.Signups.toLocaleString("en-US")}.
              </Text>
            </Column>
            <div role="img" aria-label={`Bar chart of signups by channel. ${channelData.map((c) => `${c.label}: ${c.Signups.toLocaleString("en-US")}`).join(", ")}.`}>
              <BarChart
                key={`bar-${range}`}
                fillWidth
                height={20}
                border="transparent"
                axis="both"
                grid="y"
                barWidth="l"
                legend={{ display: false }}
                series={channelSeries}
                data={channelData}
              />
            </div>
            <VisuallyHidden>
              <table>
                <caption>Signups by channel</caption>
                <thead>
                  <tr>
                    <th scope="col">Channel</th>
                    <th scope="col">Signups</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.Signups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </VisuallyHidden>
          </Column>
        </Grid>

        <Column
          as="section"
          aria-labelledby="activity-heading"
          background="surface"
          border
          radius="l"
          overflow="hidden"
        >
          <Row
            fillWidth
            horizontal="between"
            vertical="center"
            gap="12"
            padding="24"
            paddingBottom="16"
            wrap
          >
            <Column gap="4">
              <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-medium">
                The latest account and billing events across your workspace.
              </Text>
            </Column>
            <Row gap="8" vertical="center" onBackground="neutral-medium">
              <StatusIndicator color="green" ariaLabel="Live" />
              <Text variant="label-default-s">Live feed</Text>
            </Row>
          </Row>
          <Column as="ul" fillWidth>
            {activity.map((item) => (
              <Row
                as="li"
                key={item.id}
                fillWidth
                borderTop
                paddingX="24"
                paddingY="16"
                gap="16"
                vertical="center"
                s={{ direction: "column", vertical: "start", gap: "12" }}
              >
                <Row fillWidth gap="16" vertical="center">
                  <Row
                    center
                    padding="12"
                    radius="full"
                    background="neutral-alpha-weak"
                    onBackground="neutral-medium"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column fillWidth gap="4">
                    <Text variant="label-strong-m">{item.title}</Text>
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {item.detail}
                    </Text>
                  </Column>
                </Row>
                <Row gap="16" vertical="center" horizontal="end" s={{ fillWidth: true, horizontal: "between" }}>
                  <Tag size="s" scheme={item.tone}>
                    {item.status}
                  </Tag>
                  <Text variant="label-default-s" onBackground="neutral-weak" wrap="nowrap">
                    <time>{item.time}</time>
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
