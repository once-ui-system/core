"use client";

/*
 * A stand-in for the Databuddy Overview (bench/results/compare-original-vs-once-slice.md
 * in the private databuddy-once-ui fork), so core's CSS and chart work can be
 * measured without its backend: KPI tiles with sparklines, a traffic LineChart,
 * seven breakdown cards with tables, one `loading` flag for all of them.
 *
 * ?load=<ms>   how long the first load shows skeletons (default 6000)
 * ?switch=<ms> how long a range switch loads (default 600)
 */

import { Button } from "@once-ui-system/core/components/Button";
import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { SegmentedControl } from "@once-ui-system/core/components/SegmentedControl";
import { Skeleton } from "@once-ui-system/core/components/Skeleton";
import { Table, type TableColumn } from "@once-ui-system/core/components/Table";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { LineChart, Sparkline } from "@once-ui-system/core/data";
import { useEffect, useMemo, useState } from "react";

type Range = "30d" | "7d";

interface BRow {
  name: string;
  visitors: number;
  pageviews: number;
  percentage: number;
  [key: string]: unknown;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function makeData(range: Range) {
  const days = range === "30d" ? 30 : 7;
  const r = rng(days * 7);
  const chart = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.UTC(2026, 9, 1 + i));
    return {
      date: d.toISOString().slice(0, 10),
      pageviews: Math.round(800 + r() * 600),
      visitors: Math.round(300 + r() * 300),
      sessions: Math.round(400 + r() * 300),
      bounce_rate: Math.round(30 + r() * 30),
      median_session_duration: Math.round(60 + r() * 120),
    };
  });
  const breakdown = (prefix: string, n: number): BRow[] =>
    Array.from({ length: n }, (_, i) => {
      const visitors = Math.round(2000 / (i + 1) + r() * 50);
      return {
        name: `${prefix} ${i + 1}`,
        visitors,
        pageviews: Math.round(visitors * (1.5 + r())),
        percentage: Math.round((100 / (i + 2)) * 10) / 10,
      };
    });
  return {
    chart,
    kpis: ["Visitors", "Sessions", "Pageviews", "Bounce rate", "Session duration"].map(
      (title, k) => ({
        id: title,
        title,
        value: String(Math.round(1000 + r() * 9000)),
        change: Math.round((r() - 0.5) * 400) / 10,
        spark: chart.map((p) => ({ date: p.date, value: (p.pageviews * (k + 1)) % 997 })),
      }),
    ),
    cards: [
      { title: "Traffic sources", tabs: ["Referrers", "UTM sources", "UTM mediums"] },
      { title: "Pages", tabs: ["Top pages", "Entry pages", "Exit pages"] },
      { title: "Events & links", tabs: ["Events", "Outbound links"] },
      { title: "Countries", tabs: ["Countries", "Regions"] },
      { title: "Browsers", tabs: ["Browsers"] },
      { title: "Operating systems", tabs: ["Operating systems"] },
      { title: "Devices", tabs: ["Devices"] },
    ].map((card) => ({
      ...card,
      data: Object.fromEntries(card.tabs.map((t) => [t, breakdown(t, 12)])),
    })),
  };
}

const columns: TableColumn<BRow>[] = [
  {
    key: "name",
    header: "Name",
    cell: (row) => (
      <Text textVariant="label-default-s" truncate>
        {row.name}
      </Text>
    ),
  },
  { key: "visitors", header: "Visitors", align: "right", sortable: true },
  { key: "pageviews", header: "Views", align: "right", sortable: true },
  {
    key: "percentage",
    header: "Share",
    align: "right",
    cell: (row) => (
      <Tag size="s" tone={row.percentage >= 20 ? "warning" : "neutral"}>
        {`${row.percentage.toFixed(1)}%`}
      </Tag>
    ),
  },
];

function BreakdownCard({
  title,
  tabs,
  data,
  isLoading,
}: {
  title: string;
  tabs: string[];
  data: Record<string, BRow[]>;
  isLoading: boolean;
}) {
  const [active, setActive] = useState(tabs[0]);
  const rows = data[active] ?? [];
  return (
    <Column background="surface" border fillWidth gap="12" padding="16" radius="l">
      <Column gap="4">
        <Heading as="h3" textVariant="heading-strong-s">
          {title}
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-xs">
          {title} breakdown
        </Text>
      </Column>
      {tabs.length > 1 ? (
        <Row fillWidth>
          <SegmentedControl
            buttons={tabs.map((t) => ({ value: t, label: `${t} ${data[t]?.length ?? 0}`, size: "s" }))}
            compact
            onValueChange={setActive}
            value={active}
          />
        </Row>
      ) : null}
      <Table<BRow>
        aria-label={`${title}: ${active}`}
        columns={columns}
        compact
        defaultPerPage={8}
        defaultSort={{ key: "visitors", direction: "desc" }}
        getRowId={(row, i) => `${row.name}-${i}`}
        key={active}
        loading={isLoading}
        paginated={rows.length > 8}
        rows={rows}
      />
    </Column>
  );
}

function param(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const v = new URLSearchParams(window.location.search).get(name);
  return v ? Number(v) : fallback;
}

export default function BenchOverview() {
  const [range, setRange] = useState<Range>("30d");
  const [isLoading, setLoading] = useState(true);
  const data = useMemo(() => makeData(range), [range]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      document.documentElement.dataset.settled = "1";
    }, param("load", 6000));
    return () => clearTimeout(t);
  }, []);

  const switchRange = (next: Range) => {
    document.documentElement.dataset.settled = "0";
    setRange(next);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      document.documentElement.dataset.settled = "1";
    }, param("switch", 600));
  };

  return (
    <Column fillWidth gap="16" maxWidth="xl">
      <Row gap="8" vertical="center" horizontal="between" fillWidth>
        <Heading textVariant="heading-strong-l">Overview</Heading>
        <Row gap="4">
          <Button
            id="range-7d"
            size="s"
            variant={range === "7d" ? "primary" : "secondary"}
            onClick={() => switchRange("7d")}
          >
            7d
          </Button>
          <Button
            id="range-30d"
            size="s"
            variant={range === "30d" ? "primary" : "secondary"}
            onClick={() => switchRange("30d")}
          >
            30d
          </Button>
        </Row>
      </Row>
      <Grid columns="5" gap="8" m={{ columns: 3 }} s={{ columns: 1 }}>
        {data.kpis.map((kpi) => (
          <Column background="surface" border gap="12" key={kpi.id} overflow="hidden" radius="l">
            <Column fillWidth height="64">
              {isLoading ? null : (
                <Sparkline
                  aria-label={`${kpi.title} over time`}
                  color="indigo"
                  data={kpi.spark}
                  height="64px"
                  valueKey="value"
                  variant="area"
                />
              )}
            </Column>
            <Column gap="4" padding="16">
              {isLoading ? (
                <Skeleton height="24" shape="line" width="80" />
              ) : (
                <Row fillWidth horizontal="between" vertical="center">
                  <Text textVariant="heading-strong-m">{kpi.value}</Text>
                  <Text onBackground={kpi.change >= 0 ? "success-medium" : "danger-medium"} textVariant="label-default-s">
                    {kpi.change}%
                  </Text>
                </Row>
              )}
              <Text onBackground="neutral-weak" textVariant="label-default-s">
                {kpi.title}
              </Text>
            </Column>
          </Column>
        ))}
      </Grid>
      <LineChart
        background="surface"
        radius="l"
        axis="both"
        curve="monotone"
        data={data.chart}
        description="Daily traffic data"
        legend={{ display: true, position: "bottom-center" }}
        loading={isLoading}
        series={[
          { key: "pageviews", label: "Pageviews", color: "indigo" },
          { key: "visitors", label: "Visitors", color: "cyan" },
          { key: "sessions", label: "Sessions", color: "violet" },
          { key: "bounce_rate", label: "Bounce rate", color: "orange" },
          { key: "median_session_duration", label: "Session duration", color: "green" },
        ]}
        title="Traffic trends"
        valueFormat="compact"
      />
      <Grid columns="2" fillWidth gap="16" m={{ columns: 1 }}>
        {data.cards.map((card) => (
          <BreakdownCard
            data={card.data}
            isLoading={isLoading}
            key={card.title}
            tabs={card.tabs}
            title={card.title}
          />
        ))}
      </Grid>
    </Column>
  );
}
