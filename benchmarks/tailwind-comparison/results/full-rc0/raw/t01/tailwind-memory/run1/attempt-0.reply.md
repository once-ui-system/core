```tsx
"use client";

import { useId, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  UserPlus,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";

type RangeKey = "7d" | "30d" | "90d";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

interface Kpi {
  id: string;
  label: string;
  value: string;
  change: number;
  hint: string;
  icon: IconType;
  /** When true a decrease is good news (e.g. bounce rate). */
  invert?: boolean;
}

interface RangeData {
  label: string;
  kpis: Kpi[];
  visitors: { label: string; value: number }[];
  revenue: { label: string; value: number }[];
}

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: IconType;
  tone: "emerald" | "indigo" | "amber" | "rose" | "sky";
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

const DATA: Record<RangeKey, RangeData> = {
  "7d": {
    label: "last 7 days",
    kpis: [
      { id: "rev", label: "Revenue", value: "$48,230", change: 8.4, hint: "vs. previous 7 days", icon: DollarSign },
      { id: "users", label: "Active users", value: "12,480", change: 5.1, hint: "vs. previous 7 days", icon: Users },
      { id: "orders", label: "Orders", value: "1,842", change: -2.3, hint: "vs. previous 7 days", icon: ShoppingCart },
      { id: "bounce", label: "Bounce rate", value: "38.2%", change: -3.6, hint: "vs. previous 7 days", icon: Activity, invert: true },
    ],
    visitors: [
      { label: "Mon", value: 1820 },
      { label: "Tue", value: 2140 },
      { label: "Wed", value: 1960 },
      { label: "Thu", value: 2480 },
      { label: "Fri", value: 2310 },
      { label: "Sat", value: 1710 },
      { label: "Sun", value: 1590 },
    ],
    revenue: [
      { label: "Mon", value: 6400 },
      { label: "Tue", value: 7250 },
      { label: "Wed", value: 6800 },
      { label: "Thu", value: 8900 },
      { label: "Fri", value: 8150 },
      { label: "Sat", value: 5600 },
      { label: "Sun", value: 5130 },
    ],
  },
  "30d": {
    label: "last 30 days",
    kpis: [
      { id: "rev", label: "Revenue", value: "$196,540", change: 12.7, hint: "vs. previous 30 days", icon: DollarSign },
      { id: "users", label: "Active users", value: "48,915", change: 9.8, hint: "vs. previous 30 days", icon: Users },
      { id: "orders", label: "Orders", value: "7,306", change: 4.2, hint: "vs. previous 30 days", icon: ShoppingCart },
      { id: "bounce", label: "Bounce rate", value: "39.7%", change: 1.4, hint: "vs. previous 30 days", icon: Activity, invert: true },
    ],
    visitors: [
      { label: "Wk 1", value: 10950 },
      { label: "Wk 2", value: 12310 },
      { label: "Wk 3", value: 11780 },
      { label: "Wk 4", value: 13875 },
    ],
    revenue: [
      { label: "Wk 1", value: 42100 },
      { label: "Wk 2", value: 47800 },
      { label: "Wk 3", value: 45300 },
      { label: "Wk 4", value: 61340 },
    ],
  },
  "90d": {
    label: "last 90 days",
    kpis: [
      { id: "rev", label: "Revenue", value: "$574,880", change: 18.3, hint: "vs. previous 90 days", icon: DollarSign },
      { id: "users", label: "Active users", value: "131,206", change: 14.5, hint: "vs. previous 90 days", icon: Users },
      { id: "orders", label: "Orders", value: "21,094", change: 10.9, hint: "vs. previous 90 days", icon: ShoppingCart },
      { id: "bounce", label: "Bounce rate", value: "40.9%", change: -0.8, hint: "vs. previous 90 days", icon: Activity, invert: true },
    ],
    visitors: [
      { label: "Jan", value: 38200 },
      { label: "Feb", value: 41650 },
      { label: "Mar", value: 51356 },
    ],
    revenue: [
      { label: "Jan", value: 164200 },
      { label: "Feb", value: 178900 },
      { label: "Mar", value: 231780 },
    ],
  },
};

const ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "New enterprise subscription", detail: "Northwind Logistics upgraded to the Enterprise plan", time: "4 min ago", icon: CreditCard, tone: "emerald" },
  { id: "a2", title: "New user signed up", detail: "Priya Raman joined from the spring referral campaign", time: "18 min ago", icon: UserPlus, tone: "indigo" },
  { id: "a3", title: "Traffic spike detected", detail: "/pricing received 3x its usual hourly visits", time: "42 min ago", icon: Zap, tone: "amber" },
  { id: "a4", title: "Payment failed", detail: "Invoice #INV-2087 for Bluebird Studio was declined", time: "1 hr ago", icon: AlertTriangle, tone: "rose" },
  { id: "a5", title: "Monthly report generated", detail: "March performance summary is ready to download", time: "3 hrs ago", icon: BarChart3, tone: "sky" },
  { id: "a6", title: "Order refunded", detail: "Order #48213 refunded $129.00 at customer request", time: "5 hrs ago", icon: RefreshCw, tone: "amber" },
];

const TONES: Record<ActivityItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  indigo: "bg-indigo-100 text-indigo-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  sky: "bg-sky-100 text-sky-700",
};

const numberFmt = new Intl.NumberFormat("en-US");
const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function compact(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}k`;
  }
  return String(n);
}

/** Round a max value up to a "nice" axis ceiling and return ticks. */
function niceScale(max: number, steps = 4): { ceiling: number; ticks: number[] } {
  const rough = max / steps;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  const step = nice * pow;
  const ceiling = step * steps;
  return { ceiling, ticks: Array.from({ length: steps + 1 }, (_, i) => step * i) };
}

function Card({
  title,
  description,
  children,
  id,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <h2 id={id} className="text-base font-semibold text-slate-900">
        {title}
      </h2>
      {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const up = kpi.change >= 0;
  const good = kpi.invert ? !up : up;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const pct = `${up ? "+" : "−"}${Math.abs(kpi.change).toFixed(1)}%`;
  const spoken = `${up ? "Up" : "Down"} ${Math.abs(kpi.change).toFixed(1)} percent ${kpi.hint}${
    good ? ", an improvement" : ", a decline"
  }`;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{kpi.value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
            good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          <TrendIcon className="size-4" aria-hidden="true" />
          <span aria-hidden="true">{pct}</span>
          <span className="sr-only">{spoken}</span>
        </span>
        <span className="text-slate-500" aria-hidden="true">
          {kpi.hint}
        </span>
      </div>
    </li>
  );
}

const W = 640;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function LineChart({
  data,
  ariaLabel,
  formatValue,
}: {
  data: { label: string; value: number }[];
  ariaLabel: string;
  formatValue: (n: number) => string;
}) {
  const gradId = useId();
  const [active, setActive] = useState<number | null>(null);

  const { ceiling, ticks } = useMemo(() => niceScale(Math.max(...data.map((d) => d.value))), [data]);

  const points = data.map((d, i) => ({
    x: PAD.left + (data.length === 1 ? PLOT_W / 2 : (i / (data.length - 1)) * PLOT_W),
    y: PAD.top + PLOT_H - (d.value / ceiling) * PLOT_H,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} ${PAD.top + PLOT_H} L${points[0].x.toFixed(1)} ${PAD.top + PLOT_H} Z`;

  const activePoint = active !== null ? points[active] : null;
  const activeDatum = active !== null ? data[active] : null;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={ariaLabel}
          className="h-auto w-full"
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => {
            const y = PAD.top + PLOT_H - (t / ceiling) * PLOT_H;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : "3 4"} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                  {compact(t)}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <text key={d.label} x={points[i].x} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">
              {d.label}
            </text>
          ))}
          {activePoint ? (
            <line x1={activePoint.x} x2={activePoint.x} y1={PAD.top} y2={PAD.top + PLOT_H} stroke="#a5b4fc" strokeDasharray="3 3" />
          ) : null}
          {points.map((p, i) => (
            <g key={data[i].label}>
              <circle cx={p.x} cy={p.y} r={active === i ? 6 : 4} fill="#fff" stroke="#6366f1" strokeWidth="2.5" />
              <rect
                x={p.x - PLOT_W / data.length / 2}
                y={PAD.top}
                width={PLOT_W / data.length}
                height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
              />
            </g>
          ))}
        </svg>
        {activePoint && activeDatum ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${(activePoint.x / W) * 100}%`,
              top: `${(activePoint.y / H) * 100}%`,
              marginTop: -10,
            }}
          >
            <span className="text-slate-300">{activeDatum.label}: </span>
            <span className="font-semibold tabular-nums">{formatValue(activeDatum.value)}</span>
          </div>
        ) : null}
      </div>
      <DataTable data={data} caption={ariaLabel} formatValue={formatValue} />
    </div>
  );
}

function BarChart({
  data,
  ariaLabel,
  formatValue,
}: {
  data: { label: string; value: number }[];
  ariaLabel: string;
  formatValue: (n: number) => string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { ceiling, ticks } = useMemo(() => niceScale(Math.max(...data.map((d) => d.value))), [data]);

  const slot = PLOT_W / data.length;
  const barW = Math.min(56, slot * 0.6);

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={ariaLabel}
          className="h-auto w-full"
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((t) => {
            const y = PAD.top + PLOT_H - (t / ceiling) * PLOT_H;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : "3 4"} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                  {compact(t)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / ceiling) * PLOT_H;
            const x = PAD.left + slot * i + (slot - barW) / 2;
            const y = PAD.top + PLOT_H - h;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={4}
                  fill={active === i ? "#059669" : "#10b981"}
                />
                <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">
                  {d.label}
                </text>
                <rect
                  x={PAD.left + slot * i}
                  y={PAD.top}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setActive(i)}
                />
              </g>
            );
          })}
        </svg>
        {active !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${((PAD.left + slot * active + slot / 2) / W) * 100}%`,
              top: `${((PAD.top + PLOT_H - (data[active].value / ceiling) * PLOT_H) / H) * 100}%`,
              marginTop: -8,
            }}
          >
            <span className="text-slate-300">{data[active].label}: </span>
            <span className="font-semibold tabular-nums">{formatValue(data[active].value)}</span>
          </div>
        ) : null}
      </div>
      <DataTable data={data} caption={ariaLabel} formatValue={formatValue} />
    </div>
  );
}

/** Screen-reader-only table so chart values are available to assistive tech. */
function DataTable({
  data,
  caption,
  formatValue,
}: {
  data: { label: string; value: number }[];
  caption: string;
  formatValue: (n: number) => string;
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label}>
            <th scope="row">{d.label}</th>
            <td>{formatValue(d.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("7d");
  const data = DATA[range];
  const tabsId = useId();

  const totalVisitors = data.visitors.reduce((s, d) => s + d.value, 0);
  const totalRevenue = data.revenue.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-indigo-600"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <BarChart3 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">Lumen Analytics</p>
            <p className="truncate text-xs text-slate-500">Storefront performance</p>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
            <p className="mt-1 text-sm text-slate-500">
              Key metrics for your store over the {data.label}.
            </p>
          </div>

          <div
            role="group"
            aria-labelledby={`${tabsId}-label`}
            className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
          >
            <span id={`${tabsId}-label`} className="sr-only">
              Time range
            </span>
            {RANGES.map((r) => {
              const selected = r.key === range;
              return (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange(r.key)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    selected ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <section aria-label="Key performance indicators" className="mt-6">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </ul>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card
            id="visitors-heading"
            title="Visitors"
            description={`${numberFmt.format(totalVisitors)} total visits, ${data.label}`}
          >
            <LineChart
              data={data.visitors}
              ariaLabel={`Line chart of visitors, ${data.label}`}
              formatValue={(n) => numberFmt.format(n)}
            />
          </Card>

          <Card
            id="revenue-heading"
            title="Revenue"
            description={`${currencyFmt.format(totalRevenue)} total, ${data.label}`}
          >
            <BarChart
              data={data.revenue}
              ariaLabel={`Bar chart of revenue, ${data.label}`}
              formatValue={(n) => currencyFmt.format(n)}
            />
          </Card>
        </div>

        <Card
          id="activity-heading"
          title="Recent activity"
          description="Latest events across your store"
          className="mt-4"
        >
          <ul className="divide-y divide-slate-100">
            {ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONES[item.tone]}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-slate-500">{item.time}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </main>
    </div>
  );
}
```