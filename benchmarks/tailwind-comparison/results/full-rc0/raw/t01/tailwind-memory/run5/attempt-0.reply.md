I'll build this with hand-rolled SVG charts and a small client component for the range selector and chart tooltips.

```tsx
"use client";

import { useId, useMemo, useState } from "react";
import type { ComponentType, KeyboardEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  DollarSign,
  RefreshCw,
  UserPlus,
  Users,
  Activity,
  TriangleAlert,
  ShoppingCart,
  Percent,
  type LucideProps,
} from "lucide-react";

type RangeKey = "7d" | "30d" | "12m";

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number;
  hint: string;
  icon: ComponentType<LucideProps>;
  /** When true, a negative change is a good thing (e.g. churn). */
  invert?: boolean;
};

type Point = { label: string; value: number };

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "emerald" | "sky" | "amber" | "rose" | "violet";
  icon: ComponentType<LucideProps>;
};

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "12m", label: "12 months" },
];

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "rev", label: "Revenue", value: "$48,230", change: 8.2, hint: "vs. previous 7 days", icon: DollarSign },
    { id: "users", label: "Active users", value: "12,486", change: 3.1, hint: "vs. previous 7 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.42%", change: -0.6, hint: "vs. previous 7 days", icon: Percent },
    { id: "churn", label: "Churn rate", value: "1.8%", change: -0.3, hint: "vs. previous 7 days", icon: Activity, invert: true },
  ],
  "30d": [
    { id: "rev", label: "Revenue", value: "$212,904", change: 12.4, hint: "vs. previous 30 days", icon: DollarSign },
    { id: "users", label: "Active users", value: "38,917", change: 6.8, hint: "vs. previous 30 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.61%", change: 0.4, hint: "vs. previous 30 days", icon: Percent },
    { id: "churn", label: "Churn rate", value: "2.1%", change: 0.2, hint: "vs. previous 30 days", icon: Activity, invert: true },
  ],
  "12m": [
    { id: "rev", label: "Revenue", value: "$2.41M", change: 24.7, hint: "vs. previous 12 months", icon: DollarSign },
    { id: "users", label: "Active users", value: "94,302", change: 18.2, hint: "vs. previous 12 months", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.28%", change: 1.1, hint: "vs. previous 12 months", icon: Percent },
    { id: "churn", label: "Churn rate", value: "2.6%", change: -0.5, hint: "vs. previous 12 months", icon: Activity, invert: true },
  ],
};

const REVENUE: Record<RangeKey, Point[]> = {
  "7d": [
    { label: "Mon", value: 6120 },
    { label: "Tue", value: 6840 },
    { label: "Wed", value: 6480 },
    { label: "Thu", value: 7390 },
    { label: "Fri", value: 8020 },
    { label: "Sat", value: 6710 },
    { label: "Sun", value: 6670 },
  ],
  "30d": [
    { label: "Wk 1", value: 46200 },
    { label: "Wk 2", value: 51800 },
    { label: "Wk 3", value: 49300 },
    { label: "Wk 4", value: 56400 },
    { label: "Wk 5", value: 59100 },
  ],
  "12m": [
    { label: "Jan", value: 148000 },
    { label: "Feb", value: 156000 },
    { label: "Mar", value: 171000 },
    { label: "Apr", value: 168000 },
    { label: "May", value: 184000 },
    { label: "Jun", value: 193000 },
    { label: "Jul", value: 187000 },
    { label: "Aug", value: 205000 },
    { label: "Sep", value: 214000 },
    { label: "Oct", value: 226000 },
    { label: "Nov", value: 241000 },
    { label: "Dec", value: 263000 },
  ],
};

const CHANNELS: Point[] = [
  { label: "Organic search", value: 14820 },
  { label: "Direct", value: 9640 },
  { label: "Email", value: 7310 },
  { label: "Paid ads", value: 5980 },
  { label: "Referral", value: 3470 },
  { label: "Social", value: 2760 },
];

const ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "New enterprise subscription", detail: "Northwind Logistics upgraded to Enterprise (annual)", time: "4 min ago", tone: "emerald", icon: CreditCard },
  { id: "a2", title: "New user signed up", detail: "Priya Raman joined via the Q3 webinar campaign", time: "17 min ago", tone: "sky", icon: UserPlus },
  { id: "a3", title: "Order #20418 placed", detail: "3 items · $284.50 · Standard shipping", time: "42 min ago", tone: "violet", icon: ShoppingCart },
  { id: "a4", title: "Payment failed", detail: "Invoice INV-3092 for Brightside Studio was declined", time: "1 hr ago", tone: "rose", icon: TriangleAlert },
  { id: "a5", title: "Refund processed", detail: "$59.00 returned to Daniel Okafor", time: "2 hr ago", tone: "amber", icon: RefreshCw },
  { id: "a6", title: "Weekly report generated", detail: "Traffic and revenue summary is ready to review", time: "3 hr ago", tone: "sky", icon: BarChart3 },
];

const TONES: Record<ActivityItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function niceMax(v: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * exp;
}

function StatCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const up = kpi.change >= 0;
  const good = kpi.invert ? !up : up;
  const Trend = up ? ArrowUpRight : ArrowDownRight;
  const sign = up ? "+" : "−";
  const abs = Math.abs(kpi.change).toFixed(1);
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-600">{kpi.label}</h3>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
            good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          <Trend className="size-4" aria-hidden="true" />
          <span aria-hidden="true">
            {sign}
            {abs}%
          </span>
          <span className="sr-only">
            {up ? "Up" : "Down"} {abs} percent, {good ? "favorable" : "unfavorable"}
          </span>
        </span>
        <span className="text-slate-500">{kpi.hint}</span>
      </p>
    </article>
  );
}

function LineChart({ data, title }: { data: Point[]; title: string }) {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);
  const W = 640;
  const H = 280;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  const geo = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => d.value)));
    const x = (i: number) => pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
    const y = (v: number) => pad.t + ih - (v / max) * ih;
    const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${pad.t + ih} L${pts[0].x.toFixed(1)},${pad.t + ih} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: max * f, y: y(max * f) }));
    return { pts, line, area, ticks };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => (a === null ? 0 : Math.min(a + 1, data.length - 1)));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => (a === null ? data.length - 1 : Math.max(a - 1, 0)));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  const a = active !== null ? data[active] : null;
  const ap = active !== null ? geo.pts[active] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        role="img"
        aria-label={`${title}. Use left and right arrow keys to inspect values.`}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {geo.ticks.map((t) => (
          <g key={t.v}>
            <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="#e2e8f0" strokeDasharray={t.v === 0 ? undefined : "3 4"} />
            <text x={pad.l - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              ${compact.format(t.v)}
            </text>
          </g>
        ))}
        <path d={geo.area} fill={`url(#${uid}-fill)`} />
        <path d={geo.line} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const showLabel = data.length <= 7 || i % 2 === 0 || i === data.length - 1;
          return showLabel ? (
            <text key={d.label} x={geo.pts[i].x} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">
              {d.label}
            </text>
          ) : null;
        })}
        {ap && (
          <line x1={ap.x} x2={ap.x} y1={pad.t} y2={pad.t + ih} stroke="#94a3b8" strokeDasharray="3 3" />
        )}
        {geo.pts.map((p, i) => (
          <g key={data[i].label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={active === i ? 6 : 3.5}
              fill="#fff"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />
            <rect
              x={p.x - iw / data.length / 2}
              y={pad.t}
              width={iw / data.length}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onTouchStart={() => setActive(i)}
            />
          </g>
        ))}
      </svg>
      <div className="mt-2 min-h-6 text-sm text-slate-600" aria-live="polite">
        {a ? (
          <span>
            <span className="font-medium text-slate-900">{a.label}</span>: {currency.format(a.value)}
          </span>
        ) : (
          <span className="text-slate-400">Hover or focus the chart to see exact values.</span>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{currency.format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarChart({ data, title }: { data: Point[]; title: string }) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <ul className="space-y-3" aria-label={title}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <li key={d.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-slate-700">{d.label}</span>
                <span className="tabular-nums text-slate-900">
                  <span className="font-medium">{d.value.toLocaleString("en-US")}</span>
                  <span className="ml-2 text-slate-500">{((d.value / total) * 100).toFixed(1)}%</span>
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-slate-100"
                role="meter"
                aria-label={`${d.label} visits`}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={d.value}
                aria-valuetext={`${d.value.toLocaleString("en-US")} visits`}
              >
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VerticalBars({ data, title }: { data: Point[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 480;
  const H = 240;
  const pad = { t: 12, r: 8, b: 28, l: 40 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const slot = iw / data.length;
  const bw = Math.min(40, slot * 0.6);
  const ticks = [0, 0.5, 1].map((f) => max * f);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title}>
        {ticks.map((t) => {
          const y = pad.t + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {compact.format(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = pad.l + slot * i + (slot - bw) / 2;
          return (
            <g key={d.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <rect
                x={x}
                y={pad.t + ih - h}
                width={bw}
                height={h}
                rx="4"
                fill={active === i ? "#4338ca" : "#818cf8"}
              />
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.label.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");
  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? "";
  const revenue = REVENUE[range];
  const revenueTotal = revenue.reduce((s, d) => s + d.value, 0);

  const onRangeKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = RANGES.findIndex((r) => r.key === range);
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % RANGES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + RANGES.length) % RANGES.length;
    else return;
    e.preventDefault();
    setRange(RANGES[next].key);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next];
    btn?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Analytics overview</h1>
              <p className="text-sm text-slate-500">Acme Store · Updated today at 9:41 AM</p>
            </div>
          </div>
          <div
            role="radiogroup"
            aria-label="Date range"
            onKeyDown={onRangeKey}
            className="inline-flex self-start rounded-lg border border-slate-200 bg-slate-100 p-1 sm:self-auto"
          >
            {RANGES.map((r) => {
              const selected = r.key === range;
              return (
                <button
                  key={r.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRange(r.key)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Key metrics for the last {rangeLabel}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPIS[range].map((k) => (
              <StatCard key={k.id} kpi={k} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section
            aria-labelledby="rev-heading"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="rev-heading" className="text-base font-semibold">
                  Revenue over time
                </h2>
                <p className="text-sm text-slate-500">Last {rangeLabel}</p>
              </div>
              <p className="text-right">
                <span className="block text-2xl font-semibold tabular-nums">{currency.format(revenueTotal)}</span>
                <span className="text-xs text-slate-500">total in period</span>
              </p>
            </div>
            <LineChart data={revenue} title={`Revenue over the last ${rangeLabel}`} />
          </section>

          <section
            aria-labelledby="activity-heading"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="activity-heading" className="text-base font-semibold">
              Recent activity
            </h2>
            <p className="mb-4 text-sm text-slate-500">Latest events across your store</p>
            <ul className="divide-y divide-slate-100">
              {ACTIVITY.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONES[item.tone]}`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.detail}</p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{item.time}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="channel-heading"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="channel-heading" className="text-base font-semibold">
              Visits by channel
            </h2>
            <p className="mb-4 text-sm text-slate-500">Share of sessions by acquisition source</p>
            <BarChart data={CHANNELS} title="Visits by acquisition channel" />
          </section>

          <section
            aria-labelledby="orders-heading"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="orders-heading" className="text-base font-semibold">
              Orders by weekday
            </h2>
            <p className="mb-4 text-sm text-slate-500">Average orders placed per day of the week</p>
            <VerticalBars
              title="Average orders by weekday: Monday 182, Tuesday 205, Wednesday 196, Thursday 231, Friday 264, Saturday 148, Sunday 121"
              data={[
                { label: "Mon", value: 182 },
                { label: "Tue", value: 205 },
                { label: "Wed", value: 196 },
                { label: "Thu", value: 231 },
                { label: "Fri", value: 264 },
                { label: "Sat", value: 148 },
                { label: "Sun", value: 121 },
              ]}
            />
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">
        Sample data for demonstration purposes only.
      </footer>
    </div>
  );
}
```