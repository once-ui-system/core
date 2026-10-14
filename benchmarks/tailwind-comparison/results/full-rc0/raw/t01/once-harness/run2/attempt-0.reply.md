I have the patterns now. Writing the page.

```tsx
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
  useInViewport,
} from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useEffect, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

interface Kpi {
  id: string;
  label: string;
  icon: IconName;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  /** Direction the metric moved. */
  direction: "up" | "down";
  /** Whether that movement is good for the business. */
  good: boolean;
  caption: string;
}

const kpisByRange: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenue",
      icon: "banknotes",
      value: 48250,
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
      value: 8421,
      change: "8.1%",
      direction: "up",
      good: true,
      caption: "vs. previous 7 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 3.42,
      suffix: "%",
      decimals: 2,
      change: "0.6%",
      direction: "down",
      good: false,
      caption: "vs. previous 7 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      icon: "personRemove",
      value: 1.9,
      suffix: "%",
      decimals: 1,
      change: "0.3%",
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
      value: 196480,
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
      value: 21934,
      change: "14.2%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 3.71,
      suffix: "%",
      decimals: 2,
      change: "0.2%",
      direction: "up",
      good: true,
      caption: "vs. previous 30 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      icon: "personRemove",
      value: 2.4,
      suffix: "%",
      decimals: 1,
      change: "0.5%",
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
      value: 571900,
      prefix: "$",
      change: "21.3%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
    },
    {
      id: "users",
      label: "Active users",
      icon: "person",
      value: 38760,
      change: "19.8%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      icon: "trend",
      value: 3.58,
      suffix: "%",
      decimals: 2,
      change: "0.4%",
      direction: "up",
      good: true,
      caption: "vs. previous 90 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      icon: "personRemove",
      value: 2.1,
      suffix: "%",
      decimals: 1,
      change: "0.2%",
      direction: "down",
      good: true,
      caption: "vs. previous 90 days",
    },
  ],
};

const revenueSeries = [
  { key: "This period", color: "blue" },
  { key: "Previous period", color: "gray" },
];

const revenueByRange: Record<RangeKey, { label: string; [key: string]: string | number }[]> = {
  "7d": [
    { label: "Mon", "This period": 6120, "Previous period": 5410 },
    { label: "Tue", "This period": 6840, "Previous period": 5920 },
    { label: "Wed", "This period": 7210, "Previous period": 6300 },
    { label: "Thu", "This period": 6590, "Previous period": 6710 },
    { label: "Fri", "This period": 8030, "Previous period": 6450 },
    { label: "Sat", "This period": 7260, "Previous period": 5880 },
    { label: "Sun", "This period": 6200, "Previous period": 5320 },
  ],
  "30d": [
    { label: "Wk 1", "This period": 43200, "Previous period": 39800 },
    { label: "Wk 2", "This period": 46850, "Previous period": 41300 },
    { label: "Wk 3", "This period": 51420, "Previous period": 44100 },
    { label: "Wk 4", "This period": 55010, "Previous period": 47750 },
  ],
  "90d": [
    { label: "Jan", "This period": 168400, "Previous period": 142300 },
    { label: "Feb", "This period": 187200, "Previous period": 155900 },
    { label: "Mar", "This period": 216300, "Previous period": 171800 },
  ],
};

const signupSeries = [{ key: "Signups", color: "violet" }];

const signupsByChannel = [
  { label: "Organic", Signups: 1840 },
  { label: "Referral", Signups: 1215 },
  { label: "Paid ads", Signups: 960 },
  { label: "Email", Signups: 730 },
  { label: "Social", Signups: 485 },
];

interface Activity {
  id: string;
  name: string;
  action: string;
  target: string;
  time: string;
  icon: IconName;
  tag: { label: string; scheme: "success" | "brand" | "danger" | "warning" | "info" };
}

const activities: Activity[] = [
  {
    id: "a1",
    name: "Priya Nair",
    action: "upgraded to",
    target: "Business plan",
    time: "4 minutes ago",
    icon: "sparkle",
    tag: { label: "Upgrade", scheme: "success" },
  },
  {
    id: "a2",
    name: "Marcus Webb",
    action: "started a trial of",
    target: "Team plan",
    time: "22 minutes ago",
    icon: "play",
    tag: { label: "Trial", scheme: "brand" },
  },
  {
    id: "a3",
    name: "Hana Okafor",
    action: "had a failed payment on",
    target: "Invoice #4821",
    time: "1 hour ago",
    icon: "warning",
    tag: { label: "Needs action", scheme: "danger" },
  },
  {
    id: "a4",
    name: "Tomás Rivera",
    action: "opened a support ticket about",
    target: "SSO configuration",
    time: "3 hours ago",
    icon: "chat",
    tag: { label: "Support", scheme: "info" },
  },
  {
    id: "a5",
    name: "Elin Johansson",
    action: "requested a refund for",
    target: "Invoice #4793",
    time: "Yesterday",
    icon: "return",
    tag: { label: "Pending", scheme: "warning" },
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");

  const kpiRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(kpiRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  const handleRangeChange = (value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") setRange(value);
  };

  const kpis = kpisByRange[range];
  const rangeLabel = range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days";

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" gap="40">
      <Column maxWidth="l" gap="32">
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
              Revenue, growth and customer activity across your workspace.
            </Text>
          </Column>
          <Column minWidth={16} s={{ fillWidth: true }}>
            <SegmentedControl
              aria-label="Time range"
              value={range}
              onChange={handleRangeChange}
              buttons={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />
          </Column>
        </Row>

        <Column as="section" gap="16" aria-labelledby="kpi-heading">
          <Heading as="h2" id="kpi-heading" variant="heading-strong-m">
            Key metrics
            <Text as="span" variant="body-default-s" onBackground="neutral-weak" marginLeft="12">
              {rangeLabel}
            </Text>
          </Heading>
          <Grid
            ref={kpiRef}
            as="ul"
            columns="4"
            gap="16"
            m={{ columns: 2 }}
            s={{ columns: 1 }}
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {kpis.map((kpi, index) => {
              const trendColor = kpi.good ? "success-medium" : "danger-medium";
              const directionWord = kpi.direction === "up" ? "Up" : "Down";
              const sentiment = kpi.good ? "favourable" : "unfavourable";
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
                      <Row
                        center
                        background="neutral-alpha-weak"
                        radius="m"
                        padding="8"
                        aria-hidden="true"
                      >
                        <Icon name={kpi.icon} size="s" onBackground="neutral-medium" />
                      </Row>
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
                    <Row vertical="center" gap="8" wrap>
                      <Row vertical="center" gap="4" onBackground={trendColor}>
                        <Icon
                          name={kpi.direction === "up" ? "trendUp" : "trendDown"}
                          size="xs"
                        />
                        <Text variant="label-strong-s">{kpi.change}</Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {kpi.caption}
                      </Text>
                    </Row>
                    <VisuallyHiddenText>
                      {`${directionWord} ${kpi.change}, a ${sentiment} change ${kpi.caption}.`}
                    </VisuallyHiddenText>
                  </Column>
                </RevealFx>
              );
            })}
          </Grid>
        </Column>

        <Grid
          as="section"
          aria-label="Charts"
          columns="2"
          gap="24"
          m={{ columns: 1 }}
          fillWidth
        >
          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            role="figure"
            aria-label={`Revenue over time, ${rangeLabel.toLowerCase()}, compared with the previous period`}
          >
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {rangeLabel} compared with the previous period, in USD.
              </Text>
            </Column>
            <LineChart
              key={`line-${range}`}
              minHeight={20}
              border="transparent"
              axis="both"
              grid="y"
              curve="monotone"
              series={revenueSeries}
              data={revenueByRange[range]}
              legend={{ display: true, position: "top-left" }}
            />
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            role="figure"
            aria-label="New signups by acquisition channel"
          >
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Signups by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Organic search drives the largest share of new accounts.
              </Text>
            </Column>
            <BarChart
              minHeight={20}
              border="transparent"
              axis="both"
              grid="y"
              barWidth="m"
              series={signupSeries}
              data={signupsByChannel}
              legend={{ display: false }}
            />
          </Column>
        </Grid>

        <Column as="section" aria-labelledby="activity-heading" background="surface" border radius="l">
          <Row
            fillWidth
            horizontal="between"
            vertical="center"
            gap="16"
            padding="24"
            wrap
          >
            <Column gap="4">
              <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                Recent activity
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Latest customer and billing events.
              </Text>
            </Column>
            <Button
              variant="secondary"
              size="s"
              weight="default"
              suffixIcon="arrowRight"
              label="View all activity"
            />
          </Row>
          <Line />
          <Column
            as="ul"
            fillWidth
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {activities.map((item, index) => (
              <Column as="li" key={item.id} fillWidth>
                <Row
                  fillWidth
                  gap="16"
                  vertical="center"
                  paddingX="24"
                  paddingY="16"
                  s={{ direction: "column", vertical: "start" }}
                >
                  <Row fillWidth gap="16" vertical="center">
                    <Avatar size="m" value={initials(item.name)} />
                    <Column fillWidth gap="4">
                      <Text variant="body-default-s">
                        <Text as="span" variant="body-strong-s">
                          {item.name}
                        </Text>{" "}
                        {item.action}{" "}
                        <Text as="span" variant="body-strong-s">
                          {item.target}
                        </Text>
                      </Text>
                      <Row vertical="center" gap="8" onBackground="neutral-weak">
                        <Icon name={item.icon} size="xs" />
                        <Text variant="label-default-s">{item.time}</Text>
                      </Row>
                    </Column>
                  </Row>
                  <Tag size="s" scheme={item.tag.scheme}>
                    {item.tag.label}
                  </Tag>
                </Row>
                {index < activities.length - 1 && <Line />}
              </Column>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}

/** Screen-reader-only text, so trend meaning is not carried by colour or icon alone. */
function VisuallyHiddenText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}
```