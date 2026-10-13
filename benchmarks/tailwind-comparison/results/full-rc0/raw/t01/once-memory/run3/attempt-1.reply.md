The two errors came from props I guessed: `tabletColumns` on `Grid` and `variant` on `Tag`. I removed both and replaced them with safer approaches. The KPI grid now relies on its `auto-fit` inline style and no longer uses `columns`, `tabletColumns` or `s`. The tag tone now uses `background` and `onBackground` color props, which I'm assuming `Tag` accepts as a standard Flex-based component. I couldn't read the package, so none of this has been type-checked.

```tsx
"use client";

import { useId, useState } from "react";
import {
  Avatar,
  Badge,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Text,
} from "@once-ui-system/core";

/* ----------------------------- Data ----------------------------- */

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number; // percent
  hint: string;
  spark: number[];
  invertGood?: boolean; // lower is better
};

const KPIS: Kpi[] = [
  {
    id: "revenue",
    label: "Monthly revenue",
    value: "$48,290",
    change: 12.4,
    hint: "vs. previous 30 days",
    spark: [31, 34, 33, 38, 36, 42, 45, 44, 48],
  },
  {
    id: "users",
    label: "Active users",
    value: "12,846",
    change: 8.1,
    hint: "vs. previous 30 days",
    spark: [9, 10, 10, 11, 10, 12, 12, 13, 13],
  },
  {
    id: "conversion",
    label: "Conversion rate",
    value: "3.62%",
    change: -0.4,
    hint: "vs. previous 30 days",
    spark: [3.9, 3.8, 3.9, 3.7, 3.8, 3.6, 3.7, 3.6, 3.6],
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "1.9%",
    change: -0.3,
    hint: "lower is better",
    spark: [2.4, 2.3, 2.3, 2.2, 2.1, 2.1, 2.0, 1.9, 1.9],
    invertGood: true,
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const VISITS = [18.2, 19.6, 21.4, 20.8, 24.1, 26.7, 25.9, 29.3, 31.8, 30.4, 34.6, 38.2];
const SIGNUPS = [6.1, 6.8, 7.2, 7.9, 8.4, 9.6, 9.1, 10.8, 11.5, 11.9, 13.2, 14.6];

const CHANNELS = [
  { name: "Organic search", value: 4820 },
  { name: "Direct", value: 3560 },
  { name: "Email", value: 2940 },
  { name: "Referral", value: 2175 },
  { name: "Social", value: 1610 },
  { name: "Paid ads", value: 1285 },
];

type Tone = "brand" | "success" | "warning" | "neutral";

type Activity = {
  id: string;
  name: string;
  action: string;
  target: string;
  time: string;
  tag: string;
  tone: Tone;
};

const ACTIVITY: Activity[] = [
  {
    id: "a1",
    name: "Priya Raman",
    action: "upgraded to the",
    target: "Business plan",
    time: "4 min ago",
    tag: "Upgrade",
    tone: "success",
  },
  {
    id: "a2",
    name: "Marcus Lindqvist",
    action: "exported the report",
    target: "Q3 Retention Cohorts",
    time: "18 min ago",
    tag: "Export",
    tone: "neutral",
  },
  {
    id: "a3",
    name: "Hannah Okafor",
    action: "invited 5 teammates to",
    target: "Growth workspace",
    time: "42 min ago",
    tag: "Team",
    tone: "brand",
  },
  {
    id: "a4",
    name: "Diego Marquez",
    action: "cancelled the subscription for",
    target: "Northwind Traders",
    time: "1 hr ago",
    tag: "Churn",
    tone: "warning",
  },
  {
    id: "a5",
    name: "Sofia Bianchi",
    action: "created the dashboard",
    target: "Holiday campaign tracker",
    time: "2 hr ago",
    tag: "Created",
    tone: "brand",
  },
  {
    id: "a6",
    name: "Tomás Weber",
    action: "connected the integration",
    target: "Stripe payments",
    time: "3 hr ago",
    tag: "Integration",
    tone: "neutral",
  },
];

/* --------------------------- Helpers ---------------------------- */

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const TONE_STYLE: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: "var(--brand-alpha-weak)", fg: "var(--brand-on-background-strong)" },
  success: { bg: "var(--success-alpha-weak)", fg: "var(--success-on-background-strong)" },
  warning: { bg: "var(--warning-alpha-weak)", fg: "var(--warning-on-background-strong)" },
  neutral: { bg: "var(--neutral-alpha-weak)", fg: "var(--neutral-on-background-strong)" },
};

/* ------------------------- Sparkline ---------------------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((v - min) / range) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------- KPI card --------------------------- */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = kpi.invertGood ? !up : up;
  const color = good ? "var(--success-solid-strong)" : "var(--danger-solid-strong)";
  const sign = up ? "+" : "−";
  const abs = Math.abs(kpi.change);
  const trendText = `${up ? "Up" : "Down"} ${abs}% ${kpi.hint}`;

  return (
    <li style={{ listStyle: "none", display: "flex", minWidth: 0 }}>
      <Column
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
        padding="20"
        gap="12"
        fillWidth
      >
        <Text as="h3" variant="label-default-s" onBackground="neutral-weak">
          {kpi.label}
        </Text>
        <Row horizontal="between" vertical="end" gap="12">
          <Heading as="p" variant="display-strong-xs">
            {kpi.value}
          </Heading>
          <Sparkline data={kpi.spark} color={color} />
        </Row>
        <Row gap="8" vertical="center" wrap>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              background: good ? "var(--success-alpha-weak)" : "var(--danger-alpha-weak)",
              color: good
                ? "var(--success-on-background-strong)"
                : "var(--danger-on-background-strong)",
            }}
          >
            <Icon name={up ? "chevronUp" : "chevronDown"} size="xs" />
            <Text variant="label-strong-xs">
              <span aria-hidden="true">
                {sign}
                {abs}%
              </span>
              <span style={visuallyHidden}>{trendText}</span>
            </Text>
          </span>
          <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
            {kpi.hint}
          </Text>
        </Row>
      </Column>
    </li>
  );
}

/* --------------------------- Line chart ------------------------- */

function LineChart() {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 28, left: 40 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = 40;
  const ticks = [0, 10, 20, 30, 40];

  const x = (i: number) => m.left + (i / (MONTHS.length - 1)) * iw;
  const y = (v: number) => m.top + ih - (v / yMax) * ih;

  const path = (d: number[]) =>
    d.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const area = `${path(VISITS)} L${x(MONTHS.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const handleKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => (a === null ? 0 : Math.min(MONTHS.length - 1, a + 1)));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => (a === null ? MONTHS.length - 1 : Math.max(0, a - 1)));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  const tipW = 118;
  const tipX =
    active === null ? 0 : Math.min(Math.max(x(active) - tipW / 2, m.left), W - m.right - tipW);

  return (
    <Column gap="12" fillWidth>
      <Row gap="16" wrap vertical="center">
        <Row gap="8" vertical="center">
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 3,
              borderRadius: 2,
              background: "var(--brand-solid-strong)",
              display: "inline-block",
            }}
          />
          <Text variant="label-default-s">Site visits</Text>
        </Row>
        <Row gap="8" vertical="center">
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 0,
              borderTop: "3px dashed var(--accent-solid-strong)",
              display: "inline-block",
            }}
          />
          <Text variant="label-default-s">Signups</Text>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          In thousands
        </Text>
      </Row>

      <div style={{ width: "100%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="group"
          aria-labelledby={`${uid}-title ${uid}-desc`}
          tabIndex={0}
          onKeyDown={handleKey}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
          style={{ display: "block", height: "auto", overflow: "visible" }}
        >
          <title id={`${uid}-title`}>Site visits and signups by month</title>
          <desc id={`${uid}-desc`}>
            Line chart, January to December. Site visits grew from 18.2 thousand to 38.2 thousand and
            signups from 6.1 thousand to 14.6 thousand. Use the left and right arrow keys to read
            individual months.
          </desc>
          <defs>
            <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-solid-strong)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--brand-solid-strong)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t} aria-hidden="true">
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
                y={y(t) + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--neutral-on-background-weak)"
              >
                {t}
              </text>
            </g>
          ))}

          {MONTHS.map((mo, i) => (
            <text
              key={mo}
              aria-hidden="true"
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--neutral-on-background-weak)"
            >
              {mo}
            </text>
          ))}

          <path d={area} fill={`url(#${uid}-grad)`} aria-hidden="true" />
          <path
            d={path(VISITS)}
            fill="none"
            stroke="var(--brand-solid-strong)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
          />
          <path
            d={path(SIGNUPS)}
            fill="none"
            stroke="var(--accent-solid-strong)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
          />

          {MONTHS.map((mo, i) => (
            <rect
              key={mo}
              aria-hidden="true"
              x={x(i) - iw / (MONTHS.length - 1) / 2}
              y={m.top}
              width={iw / (MONTHS.length - 1)}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onTouchStart={() => setActive(i)}
            />
          ))}

          {active !== null && (
            <g pointerEvents="none" aria-hidden="true">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={m.top}
                y2={m.top + ih}
                stroke="var(--neutral-alpha-strong)"
              />
              <circle cx={x(active)} cy={y(VISITS[active])} r={5} fill="var(--brand-solid-strong)" />
              <circle cx={x(active)} cy={y(SIGNUPS[active])} r={5} fill="var(--accent-solid-strong)" />
              <rect
                x={tipX}
                y={2}
                width={tipW}
                height={46}
                rx={8}
                fill="var(--surface-background)"
                stroke="var(--neutral-alpha-strong)"
              />
              <text
                x={tipX + 10}
                y={18}
                fontSize={11}
                fontWeight={700}
                fill="var(--neutral-on-background-strong)"
              >
                {MONTHS[active]}
              </text>
              <text x={tipX + 10} y={31} fontSize={11} fill="var(--neutral-on-background-strong)">
                Visits: {VISITS[active]}k
              </text>
              <text x={tipX + 10} y={43} fontSize={11} fill="var(--neutral-on-background-strong)">
                Signups: {SIGNUPS[active]}k
              </text>
            </g>
          )}
        </svg>
      </div>

      <div aria-live="polite" style={visuallyHidden}>
        {active !== null
          ? `${MONTHS[active]}: ${VISITS[active]} thousand visits, ${SIGNUPS[active]} thousand signups`
          : ""}
      </div>
    </Column>
  );
}

/* ---------------------------- Bar chart ------------------------- */

function BarChart() {
  const uid = useId();
  const max = Math.max(...CHANNELS.map((c) => c.value));
  const total = CHANNELS.reduce((s, c) => s + c.value, 0);

  const W = 640;
  const rowH = 40;
  const m = { top: 4, right: 56, bottom: 4, left: 112 };
  const H = m.top + m.bottom + CHANNELS.length * rowH;
  const iw = W - m.left - m.right;

  return (
    <Column gap="12" fillWidth>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        Sessions per channel, last 30 days · {fmt(total)} total
      </Text>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-labelledby={`${uid}-title ${uid}-desc`}
        style={{ display: "block", height: "auto" }}
      >
        <title id={`${uid}-title`}>Sessions by acquisition channel</title>
        <desc id={`${uid}-desc`}>
          Horizontal bar chart. {CHANNELS.map((c) => `${c.name}: ${fmt(c.value)} sessions`).join(". ")}.
        </desc>
        {CHANNELS.map((c, i) => {
          const bw = (c.value / max) * iw;
          const cy = m.top + i * rowH;
          return (
            <g key={c.name}>
              <text
                x={m.left - 10}
                y={cy + rowH / 2 + 4}
                textAnchor="end"
                fontSize={12}
                fill="var(--neutral-on-background-strong)"
              >
                {c.name}
              </text>
              <rect
                x={m.left}
                y={cy + 8}
                width={iw}
                height={rowH - 16}
                rx={6}
                fill="var(--neutral-alpha-weak)"
              />
              <rect
                x={m.left}
                y={cy + 8}
                width={bw}
                height={rowH - 16}
                rx={6}
                fill={i === 0 ? "var(--brand-solid-strong)" : "var(--brand-solid-medium)"}
              />
              <text
                x={m.left + bw + 8}
                y={cy + rowH / 2 + 4}
                fontSize={12}
                fontWeight={600}
                fill="var(--neutral-on-background-strong)"
              >
                {fmt(c.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </Column>
  );
}

/* ----------------------------- Panels --------------------------- */

function Panel({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Column
      as="section"
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="16"
      fillWidth
      aria-labelledby={id}
    >
      <Column gap="4">
        <Heading as="h2" id={id} variant="heading-strong-m">
          {title}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {subtitle}
        </Text>
      </Column>
      {children}
    </Column>
  );
}

/* ------------------------------ Page ---------------------------- */

export default function Page() {
  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="24"
      style={{ boxSizing: "border-box" }}
    >
      <Column fillWidth gap="24" style={{ maxWidth: 1200 }}>
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Column gap="4">
            <Heading as="h1" variant="display-strong-s">
              Analytics overview
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Performance for the last 30 days · updated today at 09:41
            </Text>
          </Column>
          <Badge title="Live data" icon="check" arrow={false} />
        </Row>

        <ul
          aria-label="Key metrics"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            width: "100%",
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
          }}
        >
          {KPIS.map((k) => (
            <KpiCard key={k.id} kpi={k} />
          ))}
        </ul>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            width: "100%",
          }}
        >
          <Panel
            id="visits-heading"
            title="Traffic and signups"
            subtitle="Monthly site visits compared with new account signups"
          >
            <LineChart />
          </Panel>
          <Panel
            id="channels-heading"
            title="Acquisition channels"
            subtitle="Where your sessions are coming from"
          >
            <BarChart />
          </Panel>
        </div>

        <Panel
          id="activity-heading"
          title="Recent activity"
          subtitle="Latest actions across your workspace"
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
            {ACTIVITY.map((a, i) => (
              <li key={a.id} style={{ listStyle: "none" }}>
                {i > 0 && <Line background="neutral-alpha-weak" />}
                <Row gap="12" paddingY="12" vertical="center" fillWidth>
                  <Avatar size="m" value={initials(a.name)} />
                  <Column flex={1} gap="2" style={{ minWidth: 0 }}>
                    <Text variant="body-default-s" onBackground="neutral-strong">
                      <strong>{a.name}</strong> {a.action} <strong>{a.target}</strong>
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {a.time}
                    </Text>
                  </Column>
                  <span
                    style={{
                      flexShrink: 0,
                      padding: "2px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: TONE_STYLE[a.tone].bg,
                      color: TONE_STYLE[a.tone].fg,
                    }}
                  >
                    {a.tag}
                  </span>
                </Row>
              </li>
            ))}
          </ul>
        </Panel>
      </Column>
    </Column>
  );
}
```