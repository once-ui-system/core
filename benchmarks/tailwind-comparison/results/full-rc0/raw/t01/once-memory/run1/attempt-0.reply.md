```tsx
"use client";

import { useState } from "react";
import { Avatar, Column, Flex, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";

type Range = "7d" | "30d" | "90d";

interface Kpi {
  id: string;
  label: string;
  value: string;
  change: number;
  note: string;
  invertGood?: boolean;
}

interface Activity {
  id: string;
  name: string;
  action: string;
  target: string;
  time: string;
  tag: string;
  tagColor: "brand" | "accent" | "success" | "warning" | "danger" | "neutral";
}

const RANGES: { id: Range; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

const KPIS: Record<Range, Kpi[]> = {
  "7d": [
    { id: "rev", label: "Revenue", value: "$48,230", change: 6.4, note: "vs previous 7 days" },
    { id: "users", label: "Active users", value: "12,480", change: 3.1, note: "vs previous 7 days" },
    { id: "conv", label: "Conversion rate", value: "3.82%", change: -0.4, note: "vs previous 7 days" },
    { id: "churn", label: "Churn rate", value: "1.9%", change: -0.2, note: "vs previous 7 days", invertGood: true },
  ],
  "30d": [
    { id: "rev", label: "Revenue", value: "$212,940", change: 12.8, note: "vs previous 30 days" },
    { id: "users", label: "Active users", value: "38,902", change: 8.5, note: "vs previous 30 days" },
    { id: "conv", label: "Conversion rate", value: "3.64%", change: 0.7, note: "vs previous 30 days" },
    { id: "churn", label: "Churn rate", value: "2.3%", change: 0.3, note: "vs previous 30 days", invertGood: true },
  ],
  "90d": [
    { id: "rev", label: "Revenue", value: "$631,507", change: 18.2, note: "vs previous 90 days" },
    { id: "users", label: "Active users", value: "74,615", change: 14.9, note: "vs previous 90 days" },
    { id: "conv", label: "Conversion rate", value: "3.41%", change: -1.1, note: "vs previous 90 days" },
    { id: "churn", label: "Churn rate", value: "2.6%", change: -0.5, note: "vs previous 90 days", invertGood: true },
  ],
};

const LINE_DATA: Record<Range, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 6200 },
    { label: "Tue", value: 6900 },
    { label: "Wed", value: 6500 },
    { label: "Thu", value: 7400 },
    { label: "Fri", value: 8100 },
    { label: "Sat", value: 6800 },
    { label: "Sun", value: 6330 },
  ],
  "30d": [
    { label: "Wk 1", value: 46200 },
    { label: "Wk 2", value: 51800 },
    { label: "Wk 3", value: 49300 },
    { label: "Wk 4", value: 58400 },
    { label: "Wk 5", value: 62100 },
  ],
  "90d": [
    { label: "Jan", value: 189000 },
    { label: "Feb", value: 201500 },
    { label: "Mar", value: 241007 },
  ],
};

const BAR_DATA: { label: string; value: number }[] = [
  { label: "Organic", value: 14200 },
  { label: "Direct", value: 9800 },
  { label: "Referral", value: 6400 },
  { label: "Social", value: 4900 },
  { label: "Email", value: 7600 },
  { label: "Paid", value: 5300 },
];

const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    name: "Priya Raman",
    action: "upgraded to the",
    target: "Business plan",
    time: "4 min ago",
    tag: "Upgrade",
    tagColor: "success",
  },
  {
    id: "a2",
    name: "Tomás Herrera",
    action: "opened a support ticket about",
    target: "SSO configuration",
    time: "21 min ago",
    tag: "Support",
    tagColor: "warning",
  },
  {
    id: "a3",
    name: "Lena Fischer",
    action: "invited 5 teammates to",
    target: "Northwind Labs",
    time: "1 hr ago",
    tag: "Team",
    tagColor: "brand",
  },
  {
    id: "a4",
    name: "Marcus Odum",
    action: "cancelled the subscription for",
    target: "Brightside Studio",
    time: "3 hr ago",
    tag: "Churn",
    tagColor: "danger",
  },
  {
    id: "a5",
    name: "Aiko Tanaka",
    action: "exported the report",
    target: "Q1 retention cohorts",
    time: "5 hr ago",
    tag: "Export",
    tagColor: "neutral",
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(n);
}

function formatFull(n: number): string {
  return n.toLocaleString("en-US");
}

function niceMax(max: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const step = pow / 2;
  return Math.ceil(max / step) * step;
}

function TrendBadge({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = kpi.invertGood ? !up : up;
  const color = good ? "var(--success-on-background-strong)" : "var(--danger-on-background-strong)";
  const bg = good ? "var(--success-alpha-weak)" : "var(--danger-alpha-weak)";
  const sign = up ? "+" : "−";
  const abs = Math.abs(kpi.change).toFixed(1);
  const direction = up ? "up" : "down";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path
          d={up ? "M6 2 L10 8 L2 8 Z" : "M6 10 L10 4 L2 4 Z"}
          fill="currentColor"
        />
      </svg>
      <span aria-hidden="true">
        {sign}
        {abs}%
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
        {`${direction} ${abs} percent, ${good ? "favorable" : "unfavorable"}, ${kpi.note}`}
      </span>
    </span>
  );
}

function StatCard({ kpi }: { kpi: Kpi }) {
  return (
    <Column
      as="li"
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="12"
      style={{ listStyle: "none", minWidth: 0 }}
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {kpi.label}
      </Text>
      <Heading as="p" variant="display-strong-s">
        {kpi.value}
      </Heading>
      <Row gap="8" vertical="center" wrap>
        <TrendBadge kpi={kpi} />
        <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
          {kpi.note}
        </Text>
      </Row>
    </Column>
  );
}

function Panel({
  title,
  description,
  children,
  headingId,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  headingId: string;
}) {
  return (
    <Column
      as="section"
      aria-labelledby={headingId}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="16"
      style={{ minWidth: 0 }}
    >
      <Column gap="4">
        <Heading as="h2" id={headingId} variant="heading-strong-m">
          {title}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      {children}
    </Column>
  );
}

function LineChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 32, left: 48 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const x = (i: number) => m.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => m.top + ih - (v / max) * ih;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(data.length - 1).toFixed(1)} ${(m.top + ih).toFixed(1)} L${x(0).toFixed(1)} ${(m.top + ih).toFixed(1)} Z`;
  const summary = data.map((d) => `${d.label}: $${formatFull(d.value)}`).join("; ");
  const activePoint = active !== null ? data[active] : null;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}. ${summary}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="line-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-solid-strong)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-solid-strong)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={m.left}
              x2={W - m.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--neutral-alpha-medium)"
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text
              x={m.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--neutral-on-background-weak)"
            >
              ${formatNumber(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#line-area-gradient)" />
        <path
          d={path}
          fill="none"
          stroke="var(--brand-solid-strong)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <g key={d.label}>
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--neutral-on-background-weak)"
            >
              {d.label}
            </text>
            <circle
              cx={x(i)}
              cy={y(d.value)}
              r={active === i ? 6 : 4}
              fill="var(--surface-background)"
              stroke="var(--brand-solid-strong)"
              strokeWidth="2.5"
            />
            <rect
              x={x(i) - iw / data.length / 2}
              y={m.top}
              width={iw / data.length}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          </g>
        ))}
      </svg>
      <div aria-live="polite" style={{ minHeight: 20, marginTop: 8 }}>
        {activePoint ? (
          <Text variant="body-default-s" onBackground="neutral-strong">
            {activePoint.label}: <strong>${formatFull(activePoint.value)}</strong>
          </Text>
        ) : (
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Hover a point for exact revenue.
          </Text>
        )}
      </div>
    </div>
  );
}

function BarChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 32, left: 48 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const slot = iw / data.length;
  const barW = Math.min(44, slot * 0.6);
  const y = (v: number) => m.top + ih - (v / max) * ih;
  const summary = data.map((d) => `${d.label}: ${formatFull(d.value)} visitors`).join("; ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${title}. ${summary}`}
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={m.left}
            x2={W - m.right}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--neutral-alpha-medium)"
            strokeDasharray={t === 0 ? undefined : "3 4"}
          />
          <text
            x={m.left - 8}
            y={y(t)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--neutral-on-background-weak)"
          >
            {formatNumber(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = m.left + slot * i + slot / 2;
        const top = y(d.value);
        return (
          <g key={d.label}>
            <rect
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={m.top + ih - top}
              rx="4"
              fill="var(--accent-solid-strong)"
            >
              <title>{`${d.label}: ${formatFull(d.value)} visitors`}</title>
            </rect>
            <text
              x={cx}
              y={top - 6}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="var(--neutral-on-background-strong)"
            >
              {formatNumber(d.value)}
            </text>
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--neutral-on-background-weak)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RangeSwitch({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div
      role="group"
      aria-label="Date range"
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        borderRadius: 10,
        border: "1px solid var(--neutral-alpha-weak)",
        background: "var(--surface-background)",
      }}
    >
      {RANGES.map((r) => {
        const selected = r.id === value;
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(r.id)}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              minHeight: 36,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              background: selected ? "var(--brand-solid-strong)" : "transparent",
              color: selected ? "var(--brand-on-solid-strong)" : "var(--neutral-on-background-strong)",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Page() {
  const [range, setRange] = useState<Range>("30d");
  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? "";

  return (
    <Flex as="main" fillWidth horizontal="center" padding="16" style={{ minHeight: "100vh" }}>
      <Column fillWidth maxWidth={72} gap="24" paddingY="16">
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Heading as="h1" variant="display-strong-s">
              Analytics overview
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Performance for the last {rangeLabel.toLowerCase()} across all workspaces.
            </Text>
          </Column>
          <RangeSwitch value={range} onChange={setRange} />
        </Row>

        <section aria-label="Key metrics">
          <Grid
            as="ul"
            fillWidth
            gap="16"
            columns="4"
            m={{ columns: 2 }}
            s={{ columns: 1 }}
            style={{ margin: 0, padding: 0, listStyle: "none" }}
          >
            {KPIS[range].map((kpi) => (
              <StatCard key={kpi.id} kpi={kpi} />
            ))}
          </Grid>
        </section>

        <Grid fillWidth gap="16" columns="2" m={{ columns: 1 }} s={{ columns: 1 }}>
          <Panel
            headingId="revenue-heading"
            title="Revenue trend"
            description={`Gross revenue, last ${rangeLabel.toLowerCase()}`}
          >
            <LineChart data={LINE_DATA[range]} title="Revenue trend" />
          </Panel>
          <Panel
            headingId="traffic-heading"
            title="Visitors by channel"
            description="Unique visitors by acquisition source"
          >
            <BarChart data={BAR_DATA} title="Visitors by channel" />
          </Panel>
        </Grid>

        <Panel
          headingId="activity-heading"
          title="Recent activity"
          description="Latest events from customers and your team"
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ACTIVITIES.map((a, i) => (
              <li
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--neutral-alpha-weak)",
                  flexWrap: "wrap",
                }}
              >
                <Avatar size="m" value={initials(a.name)} />
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <Text variant="body-default-s" onBackground="neutral-strong">
                    <strong>{a.name}</strong> {a.action} <strong>{a.target}</strong>
                  </Text>
                </div>
                <Row gap="12" vertical="center">
                  <Tag size="s" background={`${a.tagColor}-alpha-weak`}>
                    {a.tag}
                  </Tag>
                  <Text variant="body-default-xs" onBackground="neutral-weak" style={{ whiteSpace: "nowrap" }}>
                    {a.time}
                  </Text>
                </Row>
              </li>
            ))}
          </ul>
        </Panel>
      </Column>
    </Flex>
  );
}
```