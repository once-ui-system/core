```tsx
"use client";

import { useId, useState } from "react";
import { Avatar, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";

type Trend = "up" | "down";

interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  /** Whether an upward trend is good (false for e.g. bounce rate). */
  upIsGood: boolean;
  note: string;
}

const KPIS: Kpi[] = [
  { id: "rev", label: "Monthly revenue", value: "$48,920", delta: "12.4%", trend: "up", upIsGood: true, note: "vs. previous 30 days" },
  { id: "users", label: "Active users", value: "18,342", delta: "6.8%", trend: "up", upIsGood: true, note: "vs. previous 30 days" },
  { id: "conv", label: "Conversion rate", value: "3.62%", delta: "0.4%", trend: "down", upIsGood: true, note: "vs. previous 30 days" },
  { id: "bounce", label: "Bounce rate", value: "38.1%", delta: "2.1%", trend: "down", upIsGood: false, note: "vs. previous 30 days" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VISITORS = [12400, 13250, 12980, 14600, 15900, 15200, 16800, 17450, 17100, 18900, 19800, 21300];
const SIGNUPS = [820, 910, 880, 1040, 1180, 1120, 1260, 1330, 1290, 1480, 1560, 1710];

interface Channel {
  name: string;
  value: number;
}

const CHANNELS: Channel[] = [
  { name: "Organic", value: 8420 },
  { name: "Direct", value: 5130 },
  { name: "Referral", value: 3260 },
  { name: "Social", value: 2480 },
  { name: "Email", value: 1910 },
  { name: "Paid", value: 1540 },
];

interface Activity {
  id: string;
  name: string;
  action: string;
  target: string;
  time: string;
}

const ACTIVITY: Activity[] = [
  { id: "a1", name: "Maya Chen", action: "upgraded to", target: "Business plan", time: "4 min ago" },
  { id: "a2", name: "Daniel Okafor", action: "exported report", target: "Q3 Revenue Summary", time: "22 min ago" },
  { id: "a3", name: "Sofia Alvarez", action: "invited 3 teammates to", target: "Growth workspace", time: "1 hr ago" },
  { id: "a4", name: "Liam Novak", action: "canceled subscription", target: "Starter plan", time: "2 hr ago" },
  { id: "a5", name: "Priya Raman", action: "created dashboard", target: "Campaign Performance", time: "3 hr ago" },
  { id: "a6", name: "Tomás Rivera", action: "connected integration", target: "Stripe", time: "5 hr ago" },
];

const SERIES_COLORS = {
  visitors: "var(--brand-solid-strong, #4f6bed)",
  signups: "var(--accent-solid-strong, #e8833a)",
  bars: "var(--brand-solid-strong, #4f6bed)",
  grid: "var(--neutral-alpha-medium, rgba(128,128,128,0.25))",
  axis: "var(--neutral-on-background-weak, #888)",
};

const fmt = new Intl.NumberFormat("en-US");

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);
}

function niceMax(max: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function Card({
  children,
  label,
  as,
}: {
  children: React.ReactNode;
  label?: string;
  as?: "section" | "div";
}) {
  return (
    <Column
      as={as ?? "div"}
      aria-label={label}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="l"
      gap="16"
      fillWidth
    >
      {children}
    </Column>
  );
}

function TrendBadge({ kpi }: { kpi: Kpi }) {
  const good = kpi.trend === "up" ? kpi.upIsGood : !kpi.upIsGood;
  const color = good ? "#1f9d55" : "#d64545";
  const bg = good ? "rgba(31,157,85,0.14)" : "rgba(214,69,69,0.14)";
  const word = kpi.trend === "up" ? "Up" : "Down";
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
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path
          d={kpi.trend === "up" ? "M6 2 L10.5 8.5 H1.5 Z" : "M6 10 L10.5 3.5 H1.5 Z"}
          fill="currentColor"
        />
      </svg>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {word} {good ? "(favorable)" : "(unfavorable)"}
      </span>
      {kpi.delta}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Column
      as="li"
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="l"
      gap="8"
      fillWidth
      style={{ listStyle: "none" }}
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {kpi.label}
      </Text>
      <Row horizontal="between" vertical="center" gap="12" wrap>
        <Heading as="p" variant="display-strong-xs">
          {kpi.value}
        </Heading>
        <TrendBadge kpi={kpi} />
      </Row>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {kpi.note}
      </Text>
    </Column>
  );
}

function LineChart() {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);
  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 28, left: 44 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = niceMax(Math.max(...VISITORS));
  const x = (i: number) => m.left + (i / (MONTHS.length - 1)) * iw;
  const y = (v: number) => m.top + ih - (v / yMax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const path = (data: number[], scale: number) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v * scale).toFixed(1)}`).join(" ");
  // Signups are ~1/12 of visitors; scale them to share the axis, with a note in the legend.
  const SCALE = 10;
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <Column gap="12" fillWidth>
      <Row gap="16" wrap vertical="center">
        <LegendItem color={SERIES_COLORS.visitors} label="Visitors" />
        <LegendItem color={SERIES_COLORS.signups} label={`Signups (×${SCALE} scale)`} dashed />
      </Row>
      <div style={{ width: "100%", position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        >
          <title id={titleId}>Visitors and signups by month</title>
          <desc id={descId}>
            Line chart. Visitors grew from {fmt.format(VISITORS[0])} in January to{" "}
            {fmt.format(VISITORS[VISITORS.length - 1])} in December. Signups grew from{" "}
            {fmt.format(SIGNUPS[0])} to {fmt.format(SIGNUPS[SIGNUPS.length - 1])}.
          </desc>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={SERIES_COLORS.grid} strokeWidth="1" />
              <text x={m.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={SERIES_COLORS.axis}>
                {compact(t)}
              </text>
            </g>
          ))}
          {MONTHS.map((mo, i) => (
            <text key={mo} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={SERIES_COLORS.axis}>
              {mo}
            </text>
          ))}
          <path d={path(VISITORS, 1)} fill="none" stroke={SERIES_COLORS.visitors} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path
            d={path(SIGNUPS, SCALE)}
            fill="none"
            stroke={SERIES_COLORS.signups}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={m.top} y2={m.top + ih} stroke={SERIES_COLORS.axis} strokeDasharray="3 3" />
          )}
          {MONTHS.map((mo, i) => (
            <g key={`pt-${mo}`}>
              <circle cx={x(i)} cy={y(VISITORS[i])} r={active === i ? 5 : 3} fill={SERIES_COLORS.visitors} />
              <circle cx={x(i)} cy={y(SIGNUPS[i] * SCALE)} r={active === i ? 5 : 3} fill={SERIES_COLORS.signups} />
            </g>
          ))}
          {MONTHS.map((mo, i) => (
            <rect
              key={`hit-${mo}`}
              x={x(i) - iw / (MONTHS.length - 1) / 2}
              y={m.top}
              width={iw / (MONTHS.length - 1)}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
      </div>
      <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {active !== null
          ? `${MONTHS[active]}: ${fmt.format(VISITORS[active])} visitors, ${fmt.format(SIGNUPS[active])} signups`
          : "Hover over the chart for monthly detail."}
      </Text>
      <details>
        <summary style={{ cursor: "pointer", fontSize: 13 }}>View data table</summary>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Monthly visitors and signups
            </caption>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: "4px 8px" }}>Month</th>
                <th scope="col" style={{ textAlign: "right", padding: "4px 8px" }}>Visitors</th>
                <th scope="col" style={{ textAlign: "right", padding: "4px 8px" }}>Signups</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((mo, i) => (
                <tr key={mo}>
                  <th scope="row" style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>{mo}</th>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{fmt.format(VISITORS[i])}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{fmt.format(SIGNUPS[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Column>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <Row gap="8" vertical="center">
      <svg width="24" height="8" aria-hidden="true" focusable="false">
        <line x1="0" x2="24" y1="4" y2="4" stroke={color} strokeWidth="3" strokeDasharray={dashed ? "6 4" : undefined} />
      </svg>
      <Text variant="label-default-s">{label}</Text>
    </Row>
  );
}

function BarChart() {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);
  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 28, left: 44 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = niceMax(Math.max(...CHANNELS.map((c) => c.value)));
  const band = iw / CHANNELS.length;
  const bw = Math.min(56, band * 0.6);
  const y = (v: number) => m.top + ih - (v / yMax) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const total = CHANNELS.reduce((s, c) => s + c.value, 0);
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  return (
    <Column gap="12" fillWidth>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id={titleId}>Sessions by acquisition channel</title>
        <desc id={descId}>
          Bar chart. {CHANNELS.map((c) => `${c.name}: ${fmt.format(c.value)}`).join("; ")}.
        </desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={SERIES_COLORS.grid} strokeWidth="1" />
            <text x={m.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={SERIES_COLORS.axis}>
              {compact(t)}
            </text>
          </g>
        ))}
        {CHANNELS.map((c, i) => {
          const cx = m.left + band * i + band / 2;
          const top = y(c.value);
          return (
            <g key={c.name}>
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={m.top + ih - top}
                rx="4"
                fill={SERIES_COLORS.bars}
                opacity={active === null || active === i ? 1 : 0.45}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={SERIES_COLORS.axis}>
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>
      <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {active !== null
          ? `${CHANNELS[active].name}: ${fmt.format(CHANNELS[active].value)} sessions (${((CHANNELS[active].value / total) * 100).toFixed(1)}%)`
          : `${fmt.format(total)} sessions in total. Hover a bar for its share.`}
      </Text>
      <details>
        <summary style={{ cursor: "pointer", fontSize: 13 }}>View data table</summary>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Sessions by channel
            </caption>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: "4px 8px" }}>Channel</th>
                <th scope="col" style={{ textAlign: "right", padding: "4px 8px" }}>Sessions</th>
                <th scope="col" style={{ textAlign: "right", padding: "4px 8px" }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((c) => (
                <tr key={c.name}>
                  <th scope="row" style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500 }}>{c.name}</th>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{fmt.format(c.value)}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{((c.value / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Column>
  );
}

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="l">
      <Column fillWidth gap="24" style={{ maxWidth: 1200 }}>
        <Column gap="4" as="header">
          <Heading as="h1" variant="heading-strong-xl">
            Analytics overview
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Performance for the last 12 months, updated today at 09:15 UTC.
          </Text>
        </Column>

        <section aria-labelledby="kpi-heading">
          <h2
            id="kpi-heading"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
          >
            Key metrics
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {KPIS.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </ul>
        </section>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          }}
        >
          <Card as="section" label="Traffic trend">
            <Heading as="h2" variant="heading-strong-m">
              Traffic and signups
            </Heading>
            <LineChart />
          </Card>
          <Card as="section" label="Acquisition channels">
            <Heading as="h2" variant="heading-strong-m">
              Sessions by channel
            </Heading>
            <BarChart />
          </Card>
        </div>

        <Card as="section" label="Recent activity">
          <Heading as="h2" variant="heading-strong-m">
            Recent activity
          </Heading>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {ACTIVITY.map((a, i) => (
              <li
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--neutral-alpha-weak, rgba(128,128,128,0.2))",
                }}
              >
                <Avatar size="m" value={a.name.split(" ").map((p) => p[0]).join("")} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body-default-m" as="p">
                    <strong>{a.name}</strong> {a.action} <strong>{a.target}</strong>
                  </Text>
                </div>
                <Text variant="body-default-xs" onBackground="neutral-weak" style={{ whiteSpace: "nowrap" }}>
                  {a.time}
                </Text>
              </li>
            ))}
          </ul>
        </Card>
      </Column>
    </Column>
  );
}
```