"use client";

import {
  Avatar,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  SegmentedControl,
  StatusIndicator,
  Tag,
  Text,
  VisuallyHidden,
  useInViewport,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

type Kpi = {
  id: string;
  label: string;
  icon: IconName;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  /** direction of the movement */
  direction: "up" | "down";
  /** whether that movement is good news */
  good: boolean;
  caption: string;
};

const kpisByRange: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenue",
      icon: "banknotes",
      value: 38420,
      prefix: "$",
      change: "12.4%",
      direction: "up",
      good: true,
      caption: "vs. previous 7 days",
    },
    {
      id: "users",
      label: "Active users",
      icon: "person",
      value: 2847,
      change: "8.1%",
      direction: "up",
      good: true,
      caption: "vs. previous 7 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 3.8,
      suffix: "%",
      decimals: 1,
      change: "0.4 pts",
      direction: "down",
      good: false,
      caption: "vs. previous 7 days",
    },
    {
      id: "tickets",
      label: "Open tickets",
      icon: "inbox",
      value: 34,
      change: "6 fewer",
      direction: "down",
      good: true,
      caption: "vs. previous 7 days",
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Revenue",
      icon: "banknotes",
      value: 164900,
      prefix: "$",
      change: "9.7%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
    },
    {
      id: "users",
      label: "Active users",
      icon: "person",
      value: 11260,
      change: "5.3%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 4.1,
      suffix: "%",
      decimals: 1,
      change: "0.2 pts",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
    },
    {
      id: "tickets",
      label: "Open tickets",
      icon: "inbox",
      value: 128,
      change: "11 more",
      direction: "up",
      good: false,
      caption: "vs. previous 30 days",
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Revenue",
      icon: "banknotes",
      value: 471300,
      prefix: "$",
      change: "18.2%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
    },
    {
      id: "users",
      label: "Active users",
      icon: "person",
      value: 29540,
      change: "14.6%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 3.9,
      suffix: "%",
      decimals: 1,
      change: "0.1 pts",
      direction: "down",
      good: false,
      caption: "vs. previous 90 days",
    },
    {
      id: "tickets",
      label: "Open tickets",
      icon: "inbox",
      value: 362,
      change: "4.2%",
      direction: "down",
      good: true,
      caption: "vs. previous 90 days",
    },
  ],
};

const visitorsByRange: Record<RangeKey, { label: string; visitors: number; signups: number }[]> = {
  "7d": [
    { label: "Mon", visitors: 4120, signups: 212 },
    { label: "Tue", visitors: 4580, signups: 241 },
    { label: "Wed", visitors: 4390, signups: 228 },
    { label: "Thu", visitors: 5010, signups: 267 },
    { label: "Fri", visitors: 5320, signups: 289 },
    { label: "Sat", visitors: 3870, signups: 176 },
    { label: "Sun", visitors: 3640, signups: 164 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 28400, signups: 1310 },
    { label: "Wk 2", visitors: 30150, signups: 1422 },
    { label: "Wk 3", visitors: 29320, signups: 1385 },
    { label: "Wk 4", visitors: 33780, signups: 1634 },
  ],
  "90d": [
    { label: "Jan", visitors: 112300, signups: 5120 },
    { label: "Feb", visitors: 121800, signups: 5740 },
    { label: "Mar", visitors: 134600, signups: 6485 },
  ],
};

const channelsByRange: Record<RangeKey, { label: string; signups: number }[]> = {
  "7d": [
    { label: "Organic", signups: 412 },
    { label: "Paid", signups: 286 },
    { label: "Referral", signups: 194 },
    { label: "Email", signups: 158 },
    { label: "Social", signups: 97 },
  ],
  "30d": [
    { label: "Organic", signups: 1810 },
    { label: "Paid", signups: 1240 },
    { label: "Referral", signups: 862 },
    { label: "Email", signups: 703 },
    { label: "Social", signups: 436 },
  ],
  "90d": [
    { label: "Organic", signups: 5290 },
    { label: "Paid", signups: 3710 },
    { label: "Referral", signups: 2460 },
    { label: "Email", signups: 2105 },
    { label: "Social", signups: 1180 },
  ],
};

type ActivityTone = "success" | "brand" | "danger" | "warning" | "info";

type Activity = {
  id: string;
  name: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  status: string;
  tone: ActivityTone;
};

const activity: Activity[] = [
  {
    id: "a1",
    name: "Priya Nair",
    initials: "PN",
    action: "upgraded to the Business plan",
    detail: "Annual billing · $2,280",
    time: "2 min ago",
    status: "Upgrade",
    tone: "success",
  },
  {
    id: "a2",
    name: "Marcus Lindqvist",
    initials: "ML",
    action: "created a workspace",
    detail: "Lindqvist Studio · 4 seats invited",
    time: "14 min ago",
    status: "New",
    tone: "brand",
  },
  {
    id: "a3",
    name: "Harbor & Pine Co.",
    initials: "HP",
    action: "had a payment fail",
    detail: "Card ending 4417 · retry scheduled",
    time: "42 min ago",
    status: "Needs action",
    tone: "danger",
  },
  {
    id: "a4",
    name: "Aiko Tanaka",
    initials: "AT",
    action: "opened a support ticket",
    detail: "“CSV export times out on large reports”",
    time: "1 hr ago",
    status: "Open",
    tone: "warning",
  },
  {
    id: "a5",
    name: "Diego Ramirez",
    initials: "DR",
    action: "connected the Slack integration",
    detail: "#growth-alerts channel",
    time: "3 hr ago",
    status: "Integration",
    tone: "info",
  },
  {
    id: "a6",
    name: "Sofia Bergström",
    initials: "SB",
    action: "cancelled a subscription",
    detail: "Starter plan · reason: switched tools",
    time: "5 hr ago",
    status: "Churned",
    tone: "danger",
  },
];

const rangeLabels: Record<RangeKey, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
};

function isRangeKey(value: string): value is RangeKey {
  return value === "7d" || value === "30d" || value === "90d";
}

function KpiCard({ kpi, seen }: { kpi: Kpi; seen: boolean }) {
  const trendIcon: IconName = kpi.direction === "up" ? "trendUp" : "trendDown";
  const tone = kpi.good ? "success-medium" : "danger-medium";
  const directionWord = kpi.direction === "up" ? "Up" : "Down";
  const verdict = kpi.good ? "favorable" : "unfavorable";

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
          decimals={kpi.decimals}
          speed={1000}
          separator=","
        />
        {kpi.suffix && <Text variant="display-strong-xs">{kpi.suffix}</Text>}
      </Row>
      <Row vertical="center" gap="8" wrap>
        <Row vertical="center" gap="4" onBackground={tone}>
          <Icon name={trendIcon} size="xs" />
          <Text variant="label-strong-s">{kpi.change}</Text>
        </Row>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {kpi.caption}
        </Text>
        <VisuallyHidden>{`${directionWord} ${kpi.change}, ${verdict} change`}</VisuallyHidden>
      </Row>
    </Column>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");
  const kpiRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(kpiRef);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const kpis = kpisByRange[range];
  const visitors = visitorsByRange[range];
  const channels = channelsByRange[range];

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" gap="40">
      <Column maxWidth="l" gap="40">
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
              How Northwind Cloud is growing across traffic, revenue and support.
            </Text>
          </Column>
          <Column gap="8" s={{ fillWidth: true }}>
            <Text id="range-label" variant="label-default-s" onBackground="neutral-weak">
              Time range
            </Text>
            <SegmentedControl
              aria-labelledby="range-label"
              value={range}
              onChange={(value) => {
                if (isRangeKey(value)) setRange(value);
              }}
              buttons={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />
          </Column>
        </Row>

        <Column as="section" gap="16" aria-labelledby="kpi-heading">
          <VisuallyHidden as="h2" id="kpi-heading">
            Key metrics for the {rangeLabels[range]}
          </VisuallyHidden>
          <Grid
            ref={kpiRef}
            as="ul"
            columns="4"
            gap="16"
            m={{ columns: 2 }}
            s={{ columns: 1 }}
            margin="0"
            padding="0"
          >
            {kpis.map((kpi) => (
              <KpiCard key={`${range}-${kpi.id}`} kpi={kpi} seen={seen} />
            ))}
          </Grid>
        </Column>

        <Grid columns="2" gap="24" m={{ columns: 1 }}>
          <Column
            as="section"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="24"
            aria-labelledby="traffic-heading"
          >
            <Column gap="4">
              <Heading as="h2" id="traffic-heading" variant="heading-strong-m">
                Visitors and signups
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Traffic and new accounts over the {rangeLabels[range]}.
              </Text>
            </Column>
            <div
              role="img"
              aria-label={`Line chart of visitors and signups over the ${rangeLabels[range]}. ${visitors
                .map((d) => `${d.label}: ${d.visitors.toLocaleString("en-US")} visitors, ${d.signups.toLocaleString("en-US")} signups`)
                .join("; ")}.`}
            >
              <LineChart
                key={`line-${range}`}
                fillWidth
                height={22}
                data={visitors}
                series={[{ key: "visitors" }, { key: "signups" }]}
                curve="monotone"
                legend={{ display: true, position: "top-left" }}
                border={false}
              />
            </div>
          </Column>

          <Column
            as="section"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="24"
            aria-labelledby="channel-heading"
          >
            <Column gap="4">
              <Heading as="h2" id="channel-heading" variant="heading-strong-m">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Where new accounts came from in the {rangeLabels[range]}.
              </Text>
            </Column>
            <div
              role="img"
              aria-label={`Bar chart of signups by channel over the ${rangeLabels[range]}. ${channels
                .map((d) => `${d.label}: ${d.signups.toLocaleString("en-US")}`)
                .join("; ")}.`}
            >
              <BarChart
                key={`bar-${range}`}
                fillWidth
                height={22}
                data={channels}
                series={[{ key: "signups" }]}
                legend={{ display: false }}
                border={false}
              />
            </div>
          </Column>
        </Grid>

        <Column
          as="section"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="24"
          aria-labelledby="activity-heading"
        >
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Column gap="4">
              <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Latest account events across your workspace.
              </Text>
            </Column>
            <Row vertical="center" gap="8">
              <StatusIndicator color="green" size="s" ariaLabel="Live" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Updated just now
              </Text>
            </Row>
          </Row>
          <Line />
          <Column as="ul" gap="0" margin="0" padding="0">
            {activity.map((item, index) => (
              <Column
                as="li"
                key={item.id}
                fillWidth
                style={{ listStyle: "none" }}
                borderTop={index === 0 ? false : true}
                paddingY="16"
              >
                <Row fillWidth gap="16" vertical="center" s={{ vertical: "start" }}>
                  <Avatar size="m" value={item.initials} />
                  <Column flex={1} gap="4">
                    <Text variant="body-default-m">
                      <Text as="span" variant="body-strong-m">
                        {item.name}
                      </Text>{" "}
                      {item.action}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.detail}
                    </Text>
                  </Column>
                  <Column horizontal="end" gap="8" s={{ horizontal: "end" }}>
                    <Tag size="s" scheme={item.tone}>
                      {item.status}
                    </Tag>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {item.time}
                    </Text>
                  </Column>
                </Row>
              </Column>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
