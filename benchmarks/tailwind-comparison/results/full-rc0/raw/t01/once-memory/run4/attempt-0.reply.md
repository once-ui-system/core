```tsx
"use client";

import { useId, useState } from "react";
import { Column, Flex, Grid, Heading, Row, Text } from "@once-ui-system/core";

/* ---------- Data ---------- */

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number;
  note: string;
  goodWhenUp: boolean;
};

const KPIS: Kpi[] = [
  { id: "revenue", label: "Monthly revenue", value: "$84,230", change: 12.4, note: "vs. last month", goodWhenUp: true },
  { id: "users", label: "Active users", value: "18,942", change: 6.8, note: "vs. last month", goodWhenUp: true },
  { id: "conversion", label: "Conversion rate", value: "3.42%", change: -0.6, note: "vs. last month", goodWhenUp: true },
  { id: "churn", label: "Churn rate", value: "1.9%", change: -0.3, note: "vs. last month", goodWhenUp: false },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VISITORS = [12400, 13800, 13100, 15600, 16900, 16200, 18400, 19700, 19100, 21300, 22800, 24500];
const SIGNUPS = [820, 910, 880, 1040, 1180, 1120, 1290, 1410, 1360, 1520, 1640, 1780];

const CHANNELS = [
  { name: "Organic search", value: 9420 },
  { name: "Direct", value: 6180 },
  { name: "Referral", value: 4310 },
  { name: "Email", value: 3250 },
  { name: "Social", value: 2740 },
  { name: "Paid ads", value: 1980 },
];

type Activity = {
  id: string;
  initials: string;
  name: string;
  action: string;
  target: string;
  time: string;
};

const ACTIVITY: Activity[] = [
  { id: "a1", initials: "MC", name: "Maria Chen", action: "upgraded to", target: "Business plan", time: "4 min ago" },
  { id: "a2", initials: "DO", name: "Daniel Okafor", action: "exported report", target: "Q3 Revenue Summary", time: "22 min ago" },
  { id: "a3", initials: "SP", name: "Sofia Petrova", action: "invited 3 teammates to", target: "Growth workspace", time: "1 hr ago" },
  { id: "a4", initials: "LB", name: "Liam Brooks", action: "cancelled subscription for", target: "Starter plan", time: "2 hr ago" },
  { id: "a5", initials: "AN", name: "Aisha Nasser", action: "created dashboard", target: "Retention cohorts", time: "3 hr ago" },
  { id: "a6", initials: "TK", name: "Tomás Keller", action: "connected integration", target: "Stripe", time: "Yesterday" },
];

/* ---------- Helpers ---------- */

const nf = new Intl.NumberFormat("en-US");
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n));

const COLORS = {
  line1: "var(--brand-solid-strong, #3b82f6)",
  line2: "var(--accent-solid-strong, #8b5cf6)",
  grid: "var(--neutral-alpha-medium, rgba(128,128,128,0.25))",
  axis: "var(--neutral-on-background-weak, #888)",
  bar: "var(--brand-solid-strong, #3b82f6)",
  good: "var(--success-on-background-strong, #16a34a)",
  bad: "var(--danger-on-background-strong, #dc2626)",
};

function niceMax(max: number, step: number) {
  return Math.ceil(max / step) * step;
}

/* ---------- Trend indicator ---------- */

function Trend({ change, goodWhenUp }: { change: number; goodWhenUp: boolean }) {
  const up = change >= 0;
  const good = up === goodWhenUp;
  const color = good ? COLORS.good : COLORS.bad;
  const label = `${up ? "Up" : "Down"} ${Math.abs(change)}%, ${good ? "favorable" : "unfavorable"}`;
  return (
    <Row gap="4" vertical="center">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        <path
          d={up ? "M7 11V3M3 6.5L7 2.5l4 4" : "M7 3v8M3 7.5l4 4 4-4"}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: "0.875rem" }}>
        <span className="sr-only-trend" style={srOnly}>
          {label}
        </span>
        <span aria-hidden="true">
          {up ? "+" : "−"}
          {Math.abs(change)}%
        </span>
      </span>
    </Row>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* ---------- Line chart ---------- */

function LineChart() {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 640;
  const H = 280;
  const m = { top: 16, right: 16, bottom: 28, left: 44 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = niceMax(Math.max(...VISITORS), 5000);
  const x = (i: number) => m.left + (i / (MONTHS.length - 1)) * iw;
  const y = (v: number) => m.top + ih - (v / yMax) * ih;

  const path = VISITORS.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(MONTHS.length - 1)} ${m.top + ih} L${x(0)} ${m.top + ih} Z`;
  const ticks = Array.from({ length: yMax / 5000 + 1 }, (_, i) => i * 5000);

  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => (a === null ? 0 : Math.min(a + 1, MONTHS.length - 1)));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => (a === null ? MONTHS.length - 1 : Math.max(a - 1, 0)));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  return (
    <Column fillWidth gap="12">
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", touchAction: "pan-y" }}
          role="img"
          aria-labelledby={`${uid}-t ${uid}-d`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
        >
          <title id={`${uid}-t`}>Monthly visitors line chart</title>
          <desc id={`${uid}-d`}>
            Visitors grew from {nf.format(VISITORS[0])} in January to {nf.format(VISITORS[VISITORS.length - 1])} in
            December. Use left and right arrow keys to inspect each month.
          </desc>
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.line1} stopOpacity="0.28" />
              <stop offset="100%" stopColor={COLORS.line1} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke={COLORS.grid} strokeWidth="1" />
              <text x={m.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={COLORS.axis}>
                {compact(t)}
              </text>
            </g>
          ))}
          {MONTHS.map((mo, i) => (
            <text key={mo} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={COLORS.axis}>
              {mo}
            </text>
          ))}
          <path d={area} fill={`url(#${uid}-g)`} />
          <path d={path} fill="none" stroke={COLORS.line1} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {VISITORS.map((v, i) => (
            <g key={MONTHS[i]}>
              <circle cx={x(i)} cy={y(v)} r={active === i ? 6 : 3.5} fill={COLORS.line1} stroke="var(--page-background, #fff)" strokeWidth="2" />
              <rect
                x={x(i) - iw / (MONTHS.length - 1) / 2}
                y={m.top}
                width={iw / (MONTHS.length - 1)}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onTouchStart={() => setActive(i)}
              />
            </g>
          ))}
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={m.top} y2={m.top + ih} stroke={COLORS.axis} strokeDasharray="4 4" />
          )}
        </svg>
      </div>
      <div aria-live="polite" style={{ minHeight: "1.5rem" }}>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {active === null
            ? "Hover, tap or use arrow keys on the chart to see monthly values."
            : `${MONTHS[active]}: ${nf.format(VISITORS[active])} visitors, ${nf.format(SIGNUPS[active])} signups`}
        </Text>
      </div>
    </Column>
  );
}

/* ---------- Bar chart ---------- */

function BarChart() {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);

  const max = niceMax(Math.max(...CHANNELS.map((c) => c.value)), 2000);
  const total = CHANNELS.reduce((s, c) => s + c.value, 0);
  const ticks = Array.from({ length: max / 2000 + 1 }, (_, i) => i * 2000);

  return (
    <Column fillWidth gap="16">
      <ul
        aria-label="Sessions by traffic channel"
        style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {CHANNELS.map((c, i) => {
          const pct = (c.value / max) * 100;
          const share = ((c.value / total) * 100).toFixed(1);
          return (
            <li
              key={c.name}
              tabIndex={0}
              aria-label={`${c.name}: ${nf.format(c.value)} sessions, ${share}% of total`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(88px, 140px) 1fr auto",
                alignItems: "center",
                gap: 12,
                borderRadius: 6,
                outlineOffset: 3,
              }}
            >
              <Text variant="body-default-s" onBackground="neutral-strong">
                {c.name}
              </Text>
              <div
                aria-hidden="true"
                style={{
                  position: "relative",
                  height: 20,
                  borderRadius: 4,
                  background: "var(--neutral-alpha-weak, rgba(128,128,128,0.12))",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: COLORS.bar,
                    opacity: active === null || active === i ? 1 : 0.5,
                    transition: "opacity 120ms ease, width 400ms ease",
                  }}
                />
              </div>
              <Text variant="body-strong-s" style={{ minWidth: 48, textAlign: "right" }}>
                {nf.format(c.value)}
              </Text>
            </li>
          );
        })}
      </ul>
      <div
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(88px, 140px) 1fr auto",
          gap: 12,
        }}
      >
        <span />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {ticks
            .filter((_, i) => i % 2 === 0)
            .map((t) => (
              <Text key={`${uid}-${t}`} variant="body-default-xs" onBackground="neutral-weak">
                {compact(t)}
              </Text>
            ))}
        </div>
        <span style={{ minWidth: 48 }} />
      </div>
    </Column>
  );
}

/* ---------- Card wrapper ---------- */

function Card({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Column
      as="section"
      aria-labelledby={id}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="l"
      gap="20"
      fillWidth
    >
      <Column gap="4">
        <Heading as="h2" variant="heading-strong-m" id={id}>
          {title}
        </Heading>
        {description && (
          <Text variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        )}
      </Column>
      {children}
    </Column>
  );
}

/* ---------- Page ---------- */

export default function Page() {
  return (
    <Flex as="main" fillWidth horizontal="center" padding="l" s={{ padding: "m" }}>
      <Column fillWidth gap="24" style={{ maxWidth: 1200 }}>
        <Column as="header" gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Analytics overview
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Performance summary for January – December 2025
          </Text>
        </Column>

        <section aria-label="Key metrics">
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
              <li key={k.id} style={{ display: "flex" }}>
                <Column
                  background="surface"
                  border="neutral-alpha-weak"
                  radius="l"
                  padding="l"
                  gap="12"
                  fillWidth
                >
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {k.label}
                  </Text>
                  <Text variant="display-strong-s" as="p">
                    {k.value}
                  </Text>
                  <Row gap="8" vertical="center" wrap>
                    <Trend change={k.change} goodWhenUp={k.goodWhenUp} />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {k.note}
                    </Text>
                  </Row>
                </Column>
              </li>
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
          <Card id="visitors-title" title="Visitors" description="Unique monthly visitors across all properties">
            <LineChart />
          </Card>
          <Card id="channels-title" title="Traffic by channel" description="Sessions in the last 30 days">
            <BarChart />
          </Card>
        </div>

        <Card id="activity-title" title="Recent activity" description="Latest events across your workspace">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {ACTIVITY.map((a, i) => (
              <li
                key={a.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--neutral-alpha-weak, rgba(128,128,128,0.2))",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    flex: "none",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    background: "var(--brand-alpha-weak, rgba(59,130,246,0.15))",
                    color: "var(--brand-on-background-strong, inherit)",
                  }}
                >
                  {a.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    <strong style={{ fontWeight: 600 }}>{a.name}</strong> {a.action}{" "}
                    <strong style={{ fontWeight: 600 }}>{a.target}</strong>
                  </Text>
                </div>
                <Text variant="body-default-xs" onBackground="neutral-weak" style={{ flex: "none", whiteSpace: "nowrap" }}>
                  {a.time}
                </Text>
              </li>
            ))}
          </ul>
        </Card>
      </Column>
    </Flex>
  );
}
```