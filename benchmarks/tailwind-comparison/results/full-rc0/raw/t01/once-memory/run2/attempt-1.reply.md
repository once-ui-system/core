I can't confirm the exact `IconName` union without the package installed, so I'll avoid depending on it. I'll drop the Once UI `Icon` and render small inline SVG icons that I define myself, which also keeps the page free of icon-registry issues at runtime. I'll also remove the leftover no-op span in the KPI card.

```tsx
"use client";

import { useId, useState } from "react";
import { Avatar, Badge, Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

/* ----------------------------- Data ----------------------------- */

type Trend = "up" | "down";
type IconKey = "revenue" | "users" | "conversion" | "bounce" | "upgrade" | "order" | "review" | "report" | "invite" | "cancel";

interface Kpi {
  label: string;
  value: string;
  change: string;
  trend: Trend;
  /** Whether the trend direction is good news (e.g. bounce rate going down is good). */
  positive: boolean;
  icon: IconKey;
  note: string;
}

const KPIS: Kpi[] = [
  { label: "Total revenue", value: "$48,920", change: "12.4%", trend: "up", positive: true, icon: "revenue", note: "vs. previous 30 days" },
  { label: "Active users", value: "12,486", change: "8.1%", trend: "up", positive: true, icon: "users", note: "vs. previous 30 days" },
  { label: "Conversion rate", value: "3.62%", change: "0.4%", trend: "down", positive: false, icon: "conversion", note: "vs. previous 30 days" },
  { label: "Bounce rate", value: "38.2%", change: "2.7%", trend: "down", positive: true, icon: "bounce", note: "vs. previous 30 days" },
];

interface Point {
  label: string;
  value: number;
}

const VISITS: Point[] = [
  { label: "Mon", value: 3240 },
  { label: "Tue", value: 3880 },
  { label: "Wed", value: 3520 },
  { label: "Thu", value: 4410 },
  { label: "Fri", value: 4960 },
  { label: "Sat", value: 3790 },
  { label: "Sun", value: 4230 },
];

const VISITS_PREV: Point[] = [
  { label: "Mon", value: 2910 },
  { label: "Tue", value: 3120 },
  { label: "Wed", value: 3340 },
  { label: "Thu", value: 3690 },
  { label: "Fri", value: 4020 },
  { label: "Sat", value: 3300 },
  { label: "Sun", value: 3580 },
];

const SIGNUPS: Point[] = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 510 },
  { label: "Mar", value: 480 },
  { label: "Apr", value: 640 },
  { label: "May", value: 720 },
  { label: "Jun", value: 690 },
];

const CHANNELS: Point[] = [
  { label: "Organic", value: 4820 },
  { label: "Direct", value: 3150 },
  { label: "Referral", value: 2210 },
  { label: "Social", value: 1640 },
  { label: "Email", value: 980 },
];

interface Activity {
  id: string;
  name: string;
  action: string;
  target: string;
  time: string;
  icon: IconKey;
}

const ACTIVITY: Activity[] = [
  { id: "a1", name: "Priya Raman", action: "upgraded to", target: "Business plan", time: "4 min ago", icon: "upgrade" },
  { id: "a2", name: "Marcus Lindqvist", action: "completed checkout for", target: "Order #10482", time: "18 min ago", icon: "order" },
  { id: "a3", name: "Elena Duarte", action: "left a review on", target: "Onboarding flow", time: "42 min ago", icon: "review" },
  { id: "a4", name: "Tomasz Kowalski", action: "created the report", target: "Q2 Retention", time: "1 hr ago", icon: "report" },
  { id: "a5", name: "Aisha Bello", action: "invited 3 teammates to", target: "Growth workspace", time: "2 hr ago", icon: "invite" },
  { id: "a6", name: "Daniel Okafor", action: "cancelled", target: "Starter plan", time: "3 hr ago", icon: "cancel" },
];

const RANGES = ["7 days", "30 days", "90 days"] as const;
type Range = (typeof RANGES)[number];

/* --------------------------- Helpers ---------------------------- */

const nf = new Intl.NumberFormat("en-US");

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function niceMax(v: number): number {
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / step) * step;
}

/* ----------------------------- Icons ---------------------------- */

const ICON_PATHS: Record<IconKey, string> = {
  revenue: "M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.9 7 7c0 4.5 10 2.5 10 7 0 2.1-2.2 3.5-5 3.5s-5-1.1-5-3",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6",
  conversion: "M3 17l6-6 4 4 8-8M15 7h6v6",
  bounce: "M4 12a8 8 0 1 0 8-8M4 4v5h5",
  upgrade: "M12 19V5M5 12l7-7 7 7",
  order: "M5 12.5l4.5 4.5L19 7.5",
  review: "M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  report: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  invite: "M12 5v14M5 12h14",
  cancel: "M6 6l12 12M18 6L6 18",
};

function GlyphIcon({ name, size = 16 }: { name: IconKey; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ------------------------- Chart styling ------------------------ */

const AXIS = "var(--neutral-on-background-weak)";
const GRID = "var(--neutral-alpha-medium)";
const PRIMARY = "var(--brand-solid-strong)";
const SECONDARY = "var(--neutral-solid-medium)";

const W = 640;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/* --------------------------- Line chart ------------------------- */

function LineChart({ data, previous }: { data: Point[]; previous: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), ...previous.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const x = (i: number) => PAD.left + (data.length === 1 ? IW / 2 : (i / (data.length - 1)) * IW);
  const y = (v: number) => PAD.top + IH - (v / max) * IH;
  const path = (pts: Point[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path(data)} L${x(data.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const gradId = useId();
  const titleId = useId();
  const descId = useId();
  const total = data.reduce((s, d) => s + d.value, 0);
  const hitW = data.length > 1 ? IW / (data.length - 1) : IW;
  const activePoint = active !== null ? data[active] : null;
  const activePrev = active !== null ? previous[active] : null;

  return (
    <Column fillWidth gap="12">
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        >
          <title id={titleId}>Daily visits, this week versus last week</title>
          <desc id={descId}>
            {`Line chart. This week totals ${nf.format(total)} visits. ` +
              data.map((d) => `${d.label}: ${nf.format(d.value)}`).join(", ") +
              "."}
          </desc>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.28" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t} aria-hidden="true">
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={AXIS}>
                {t >= 1000 ? `${t / 1000}k` : t}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#${gradId})`} aria-hidden="true" />
          <path d={path(previous)} fill="none" stroke={SECONDARY} strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" aria-hidden="true" />
          <path d={path(data)} fill="none" stroke={PRIMARY} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" />
          {data.map((d, i) => (
            <g key={d.label} aria-hidden="true">
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS}>
                {d.label}
              </text>
              <circle cx={x(i)} cy={y(d.value)} r={active === i ? 6 : 4} fill={PRIMARY} stroke="var(--page-background)" strokeWidth="2" />
              <rect
                x={x(i) - hitW / 2}
                y={PAD.top}
                width={hitW}
                height={IH}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onTouchStart={() => setActive(i)}
              />
            </g>
          ))}
        </svg>
        {active !== null && activePoint && activePrev && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: `${Math.min(Math.max((x(active) / W) * 100, 14), 86)}%`,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              background: "var(--surface-background)",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              whiteSpace: "nowrap",
              color: "var(--neutral-on-background-strong)",
            }}
          >
            <strong>{activePoint.label}</strong>: {nf.format(activePoint.value)} visits
            <br />
            <span style={{ color: "var(--neutral-on-background-weak)" }}>Last week: {nf.format(activePrev.value)}</span>
          </div>
        )}
      </div>
      <Row gap="24" wrap horizontal="center">
        <Row gap="8" vertical="center">
          <span aria-hidden="true" style={{ width: 16, height: 3, borderRadius: 2, background: PRIMARY, display: "inline-block" }} />
          <Text variant="label-default-s" onBackground="neutral-weak">This week</Text>
        </Row>
        <Row gap="8" vertical="center">
          <span aria-hidden="true" style={{ width: 16, height: 0, borderTop: `3px dashed ${SECONDARY}`, display: "inline-block" }} />
          <Text variant="label-default-s" onBackground="neutral-weak">Last week</Text>
        </Row>
      </Row>
    </Column>
  );
}

/* --------------------------- Bar chart -------------------------- */

function BarChart({ data, title, unit }: { data: Point[]; title: string; unit: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const slot = IW / data.length;
  const barW = Math.min(slot * 0.58, 56);
  const y = (v: number) => PAD.top + IH - (v / max) * IH;
  const titleId = useId();
  const descId = useId();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{data.map((d) => `${d.label}: ${nf.format(d.value)} ${unit}`).join(", ") + "."}</desc>
      {ticks.map((t) => (
        <g key={t} aria-hidden="true">
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
          <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={AXIS}>
            {t >= 1000 ? `${t / 1000}k` : t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = PAD.left + slot * i + slot / 2;
        const h = (d.value / max) * IH;
        const isActive = active === i;
        return (
          <g
            key={d.label}
            aria-hidden="true"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive(i)}
          >
            <rect x={cx - slot / 2} y={PAD.top} width={slot} height={IH} fill="transparent" />
            <rect
              x={cx - barW / 2}
              y={y(d.value)}
              width={barW}
              height={h}
              rx="6"
              fill={PRIMARY}
              opacity={active === null || isActive ? 1 : 0.45}
            />
            {isActive && (
              <text x={cx} y={y(d.value) - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--neutral-on-background-strong)">
                {nf.format(d.value)}
              </text>
            )}
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------- Cards ----------------------------- */

function Card({
  children,
  as,
  labelledBy,
}: {
  children: React.ReactNode;
  as?: "section" | "article";
  labelledBy?: string;
}) {
  return (
    <Column
      as={as}
      aria-labelledby={labelledBy}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="16"
      fillWidth
      minWidth={0}
    >
      {children}
    </Column>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const verb = kpi.trend === "up" ? "increased" : "decreased";
  return (
    <Card as="article">
      <Row horizontal="between" vertical="center" gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {kpi.label}
        </Text>
        <Row
          center
          background="neutral-alpha-weak"
          radius="m"
          style={{ width: 32, height: 32, flexShrink: 0, color: "var(--neutral-on-background-weak)" }}
          aria-hidden="true"
        >
          <GlyphIcon name={kpi.icon} size={16} />
        </Row>
      </Row>
      <Heading as="p" variant="display-strong-s">
        {kpi.value}
      </Heading>
      <Row gap="8" vertical="center" wrap>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: kpi.positive ? "var(--success-alpha-weak)" : "var(--danger-alpha-weak)",
            color: kpi.positive ? "var(--success-on-background-strong)" : "var(--danger-on-background-strong)",
          }}
        >
          <span aria-hidden="true">{kpi.trend === "up" ? "▲" : "▼"}</span>
          <span aria-hidden="true">{kpi.change}</span>
          <span style={VISUALLY_HIDDEN}>{`${verb} by ${kpi.change}, ${kpi.positive ? "an improvement" : "a decline"}`}</span>
        </span>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {kpi.note}
        </Text>
      </Row>
    </Card>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function Page() {
  const [range, setRange] = useState<Range>("7 days");
  const lineId = useId();
  const barId = useId();
  const channelId = useId();
  const activityId = useId();

  return (
    <Flex as="main" fillWidth horizontal="center" paddingX="16" paddingY="24" style={{ boxSizing: "border-box" }}>
      <Column fillWidth gap="24" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Column gap="4" minWidth={0}>
            <Heading as="h1" variant="heading-strong-xl">
              Analytics overview
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Performance for Northwind Store · updated 6 minutes ago
            </Text>
          </Column>
          <div role="group" aria-label="Date range" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RANGES.map((r) => (
              <Button
                key={r}
                size="s"
                variant={range === r ? "primary" : "secondary"}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
              >
                {r}
              </Button>
            ))}
          </div>
        </Row>

        {/* KPIs */}
        <section aria-label="Key metrics">
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            }}
          >
            {KPIS.map((k) => (
              <KpiCard key={k.label} kpi={k} />
            ))}
          </div>
        </section>

        {/* Charts row */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          }}
        >
          <Card as="section" labelledBy={lineId}>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m" id={lineId}>
                Visits
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Daily sessions, this week compared with last week
              </Text>
            </Column>
            <LineChart data={VISITS} previous={VISITS_PREV} />
          </Card>

          <Card as="section" labelledBy={barId}>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m" id={barId}>
                New sign-ups
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Accounts created per month, January to June
              </Text>
            </Column>
            <BarChart data={SIGNUPS} title="New sign-ups per month" unit="sign-ups" />
          </Card>
        </div>

        {/* Channels + activity */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          }}
        >
          <Card as="section" labelledBy={channelId}>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m" id={channelId}>
                Traffic by channel
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Sessions by acquisition source
              </Text>
            </Column>
            <BarChart data={CHANNELS} title="Sessions by traffic channel" unit="sessions" />
          </Card>

          <Card as="section" labelledBy={activityId}>
            <Row horizontal="between" vertical="center" gap="8">
              <Heading as="h2" variant="heading-strong-m" id={activityId}>
                Recent activity
              </Heading>
              <Badge arrow={false}>{ACTIVITY.length} new</Badge>
            </Row>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {ACTIVITY.map((a, i) => (
                <li
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--neutral-alpha-weak)",
                  }}
                >
                  <Avatar size="m" value={initials(a.name)} />
                  <Column gap="2" minWidth={0} flex={1}>
                    <Text variant="body-default-s" onBackground="neutral-strong">
                      <strong>{a.name}</strong> {a.action} <strong>{a.target}</strong>
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {a.time}
                    </Text>
                  </Column>
                  <span style={{ color: "var(--neutral-on-background-weak)", display: "flex" }}>
                    <GlyphIcon name={a.icon} size={16} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Column>
    </Flex>
  );
}
```