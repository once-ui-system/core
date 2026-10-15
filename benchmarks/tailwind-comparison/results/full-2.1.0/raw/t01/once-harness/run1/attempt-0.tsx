"use client";

import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  SegmentedControl,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { BarChart, LineChart } from "@once-ui-system/core/data";
import { useMemo, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

interface Kpi {
  id: string;
  label: string;
  value: string;
  change: string;
  /** Whether the metric moved up (true) or down (false). */
  up: boolean;
  /** Whether that movement is good for the business. */
  good: boolean;
  icon: IconName;
  comparison: string;
}

interface ActivityEntry {
  id: string;
  name: string;
  action: string;
  detail: string;
  time: string;
  icon: IconName;
  tag: { label: string; scheme: "success" | "brand" | "danger" | "warning" | "info" };
}

const RANGES: { value: RangeKey; label: string; days: number; previous: string }[] = [
  { value: "7d", label: "7 days", days: 7, previous: "previous 7 days" },
  { value: "30d", label: "30 days", days: 30, previous: "previous 30 days" },
  { value: "90d", label: "90 days", days: 90, previous: "previous 90 days" },
];

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenue",
      value: "$48,920",
      change: "+12.4%",
      up: true,
      good: true,
      icon: "banknotes",
      comparison: "vs previous 7 days",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: "18,452",
      change: "+8.1%",
      up: true,
      good: true,
      icon: "person",
      comparison: "vs previous 7 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: "3.42%",
      change: "-0.3%",
      up: false,
      good: false,
      icon: "trend",
      comparison: "vs previous 7 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "1.8%",
      change: "-0.4%",
      up: false,
      good: true,
      icon: "personRemove",
      comparison: "vs previous 7 days",
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Revenue",
      value: "$211,300",
      change: "+9.7%",
      up: true,
      good: true,
      icon: "banknotes",
      comparison: "vs previous 30 days",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: "74,036",
      change: "+14.2%",
      up: true,
      good: true,
      icon: "person",
      comparison: "vs previous 30 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: "3.55%",
      change: "+0.2%",
      up: true,
      good: true,
      icon: "trend",
      comparison: "vs previous 30 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.1%",
      change: "+0.3%",
      up: true,
      good: false,
      icon: "personRemove",
      comparison: "vs previous 30 days",
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Revenue",
      value: "$624,780",
      change: "+18.9%",
      up: true,
      good: true,
      icon: "banknotes",
      comparison: "vs previous 90 days",
    },
    {
      id: "visitors",
      label: "Unique visitors",
      value: "212,904",
      change: "+21.5%",
      up: true,
      good: true,
      icon: "person",
      comparison: "vs previous 90 days",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: "3.61%",
      change: "+0.5%",
      up: true,
      good: true,
      icon: "trend",
      comparison: "vs previous 90 days",
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.4%",
      change: "-0.2%",
      up: false,
      good: true,
      icon: "personRemove",
      comparison: "vs previous 90 days",
    },
  ],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isoDate(base: Date, offsetDays: number): string {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Deterministic pseudo-wave so server and client render identical data. */
function wave(i: number, base: number, amp: number, phase: number): number {
  const v = base + Math.sin(i / 2.3 + phase) * amp + Math.cos(i / 5.1 + phase * 2) * (amp / 2) + i * (amp / 14);
  return Math.round(v);
}

const START = new Date(Date.UTC(2025, 0, 1));

interface RevenuePoint {
  date: string;
  "This period": number;
  "Previous period": number;
  [key: string]: string | number;
}

function buildRevenue(days: number): RevenuePoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: isoDate(START, i),
    "This period": wave(i, 5200, 900, 0.4),
    "Previous period": wave(i, 4500, 800, 1.7),
  }));
}

interface ChannelPoint {
  date: string;
  Organic: number;
  Referral: number;
  Paid: number;
  [key: string]: string | number;
}

/** Signups by channel for the last 6 months, using the first of each month as the date key. */
const CHANNELS: ChannelPoint[] = [
  { date: "2025-01-01", Organic: 1240, Referral: 620, Paid: 410 },
  { date: "2025-02-01", Organic: 1385, Referral: 702, Paid: 455 },
  { date: "2025-03-01", Organic: 1510, Referral: 688, Paid: 520 },
  { date: "2025-04-01", Organic: 1472, Referral: 790, Paid: 498 },
  { date: "2025-05-01", Organic: 1690, Referral: 845, Paid: 560 },
  { date: "2025-06-01", Organic: 1820, Referral: 912, Paid: 604 },
];

const ACTIVITY: ActivityEntry[] = [
  {
    id: "a1",
    name: "Priya Raman",
    action: "upgraded to the Scale plan",
    detail: "$480 / month, billed annually",
    time: "2 min ago",
    icon: "sparkle",
    tag: { label: "Upgrade", scheme: "success" },
  },
  {
    id: "a2",
    name: "Marcus Oyelaran",
    action: "created a workspace",
    detail: "Northwind Logistics · 14 seats",
    time: "18 min ago",
    icon: "plus",
    tag: { label: "New", scheme: "brand" },
  },
  {
    id: "a3",
    name: "Hannah Berg",
    action: "had a payment fail",
    detail: "Card ending 4417 was declined",
    time: "47 min ago",
    icon: "warning",
    tag: { label: "Action needed", scheme: "danger" },
  },
  {
    id: "a4",
    name: "Diego Alvarez",
    action: "exported the Q2 funnel report",
    detail: "CSV · 12,408 rows",
    time: "1 hour ago",
    icon: "download",
    tag: { label: "Export", scheme: "info" },
  },
  {
    id: "a5",
    name: "Sofia Lindqvist",
    action: "requested a plan downgrade",
    detail: "Scale to Team, effective Jul 1",
    time: "3 hours ago",
    icon: "trendDown",
    tag: { label: "At risk", scheme: "warning" },
  },
  {
    id: "a6",
    name: "Kenji Watanabe",
    action: "invited 6 teammates",
    detail: "Hanabi Studio",
    time: "Yesterday",
    icon: "mail",
    tag: { label: "Invite", scheme: "brand" },
  },
];

function formatRangeLabel(days: number): string {
  const end = new Date(START.getTime());
  end.setUTCDate(end.getUTCDate() + days - 1);
  const fmt = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  return `${fmt(START)} – ${fmt(end)}, ${end.getUTCFullYear()}`;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = kpi.good ? "success-medium" : "danger-medium";
  const direction = kpi.up ? "up" : "down";
  const sentiment = kpi.good ? "favorable" : "unfavorable";

  return (
    <Column
      as="li"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="16"
      style={{ listStyle: "none" }}
    >
      <Row fillWidth horizontal="between" vertical="center" gap="12">
        <Text as="h3" variant="label-default-s" onBackground="neutral-weak">
          {kpi.label}
        </Text>
        <Row
          center
          width={32}
          height={32}
          radius="m"
          background="neutral-alpha-weak"
          aria-hidden="true"
        >
          <Icon name={kpi.icon} size="s" onBackground="neutral-medium" />
        </Row>
      </Row>
      <Heading as="p" variant="display-strong-xs">
        {kpi.value}
      </Heading>
      <Row vertical="center" gap="8" wrap>
        <Row vertical="center" gap="4" onBackground={tone}>
          <Icon name={kpi.up ? "trendUp" : "trendDown"} size="xs" />
          <Text variant="label-strong-s">{kpi.change}</Text>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {kpi.comparison}
        </Text>
        <VisuallyHidden>
          {`Trending ${direction}, ${sentiment} change.`}
        </VisuallyHidden>
      </Row>
    </Column>
  );
}

function ActivityRow({ entry, last }: { entry: ActivityEntry; last: boolean }) {
  const initials = entry.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);

  return (
    <Row
      as="li"
      fillWidth
      gap="16"
      vertical="center"
      paddingY="16"
      borderBottom={last ? "transparent" : true}
      style={{ listStyle: "none" }}
    >
      <Avatar size="m" value={initials} aria-hidden="true" />
      <Column flex={1} gap="4">
        <Text variant="body-default-s">
          <Text as="span" variant="body-strong-s">
            {entry.name}
          </Text>{" "}
          {entry.action}
        </Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {entry.detail}
        </Text>
      </Column>
      <Column horizontal="end" gap="8" s={{ hide: false }}>
        <Tag size="s" scheme={entry.tag.scheme}>
          {entry.tag.label}
        </Tag>
        <Row vertical="center" gap="4" onBackground="neutral-weak">
          <Icon name="time" size="xs" />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {entry.time}
          </Text>
        </Row>
      </Column>
    </Row>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");

  const active = RANGES.find((r) => r.value === range) ?? RANGES[1];
  const kpis = KPIS[range];
  const revenue = useMemo(() => buildRevenue(active.days), [active.days]);

  const revenueTotal = useMemo(
    () => revenue.reduce((sum, p) => sum + p["This period"], 0),
    [revenue],
  );
  const previousTotal = useMemo(
    () => revenue.reduce((sum, p) => sum + p["Previous period"], 0),
    [revenue],
  );

  const channelTotals = useMemo(
    () =>
      CHANNELS.reduce(
        (acc, p) => ({
          Organic: acc.Organic + p.Organic,
          Referral: acc.Referral + p.Referral,
          Paid: acc.Paid + p.Paid,
        }),
        { Organic: 0, Referral: 0, Paid: 0 },
      ),
    [],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <Column maxWidth="l" fillWidth gap="32">
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
              {formatRangeLabel(active.days)} · compared with the {active.previous}
            </Text>
          </Column>
          <Column gap="8" s={{ fillWidth: true }}>
            <VisuallyHidden as="span" id="range-label">
              Reporting period
            </VisuallyHidden>
            <SegmentedControl
              aria-labelledby="range-label"
              fillWidth={false}
              s={{ fillWidth: true }}
              value={range}
              onChange={(value) => {
                if (value === "7d" || value === "30d" || value === "90d") setRange(value);
              }}
              buttons={RANGES.map((r) => ({ value: r.value, label: r.label }))}
            />
          </Column>
        </Row>

        <Column as="section" gap="16" aria-labelledby="kpi-heading">
          <VisuallyHidden as="h2" id="kpi-heading">
            Key metrics
          </VisuallyHidden>
          <Grid
            as="ul"
            columns="4"
            gap="16"
            l={{ columns: 2 }}
            s={{ columns: 1 }}
            style={{ margin: 0, padding: 0, listStyle: "none" }}
          >
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </Grid>
        </Column>

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
          <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
            <Column gap="4">
              <Heading as="h2" id="revenue-heading" variant="heading-strong-m">
                Revenue trend
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Daily revenue in USD, this period against the one before it
              </Text>
            </Column>
            <Row gap="24" wrap>
              <Column gap="4">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  This period
                </Text>
                <Text variant="heading-strong-s">${revenueTotal.toLocaleString("en-US")}</Text>
              </Column>
              <Column gap="4">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Previous period
                </Text>
                <Text variant="heading-strong-s" onBackground="neutral-medium">
                  ${previousTotal.toLocaleString("en-US")}
                </Text>
              </Column>
            </Row>
          </Row>
          <div
            role="img"
            aria-label={`Line chart of daily revenue over the last ${active.days} days. This period totals $${revenueTotal.toLocaleString("en-US")} compared with $${previousTotal.toLocaleString("en-US")} in the ${active.previous}.`}
            style={{ width: "100%" }}
          >
            <LineChart
              key={range}
              fillWidth
              minHeight={20}
              border="transparent"
              axis="both"
              grid="y"
              curve="monotone"
              date={{ format: "MMM dd" }}
              legend={{ display: true, position: "top-right" }}
              series={[
                { key: "This period", color: "blue" },
                { key: "Previous period", color: "gray" },
              ]}
              data={revenue}
            />
          </div>
        </Column>

        <Grid columns="2" gap="24" l={{ columns: 1 }}>
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
                Monthly new accounts, January to June 2025
              </Text>
            </Column>
            <div
              role="img"
              aria-label={`Bar chart of monthly signups by channel. Six month totals: organic ${channelTotals.Organic.toLocaleString("en-US")}, referral ${channelTotals.Referral.toLocaleString("en-US")}, paid ${channelTotals.Paid.toLocaleString("en-US")}.`}
              style={{ width: "100%" }}
            >
              <BarChart
                fillWidth
                minHeight={20}
                border="transparent"
                axis="both"
                grid="y"
                barWidth="m"
                date={{ format: "MMM" }}
                legend={{ display: true, position: "top-right" }}
                series={[
                  { key: "Organic", color: "blue" },
                  { key: "Referral", color: "green" },
                  { key: "Paid", color: "orange" },
                ]}
                data={CHANNELS}
              />
            </div>
          </Column>

          <Column
            as="section"
            aria-labelledby="activity-heading"
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
            s={{ padding: "16" }}
          >
            <Row fillWidth horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Heading as="h2" id="activity-heading" variant="heading-strong-m">
                  Recent activity
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Latest account events
                </Text>
              </Column>
              <Button
                variant="tertiary"
                size="s"
                suffixIcon="arrowRight"
                label="View all"
                aria-label="View all recent activity"
              />
            </Row>
            <Line />
            <Column as="ul" fillWidth style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {ACTIVITY.map((entry, index) => (
                <ActivityRow key={entry.id} entry={entry} last={index === ACTIVITY.length - 1} />
              ))}
            </Column>
          </Column>
        </Grid>
      </Column>
    </Column>
  );
}
