```tsx
"use client";

import { useId, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  RefreshCcw,
  ShoppingCart,
  UserPlus,
  Users,
  Eye,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RangeKey = "7d" | "30d" | "90d";

interface Kpi {
  id: string;
  label: string;
  value: string;
  change: number; // percent
  hint: string;
  icon: LucideIcon;
  // when lower is better (e.g. churn), a negative change is good
  lowerIsBetter?: boolean;
}

interface RangeData {
  label: string;
  kpis: Kpi[];
  line: { label: string; value: number }[];
  bars: { label: string; value: number }[];
}

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: "emerald" | "sky" | "violet" | "amber" | "rose";
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
      { id: "rev", label: "Revenue", value: "$48,230", change: 8.2, hint: "vs. previous 7 days", icon: CircleDollarSign },
      { id: "users", label: "Active users", value: "12,486", change: 4.6, hint: "vs. previous 7 days", icon: Users },
      { id: "conv", label: "Conversion rate", value: "3.84%", change: -0.7, hint: "vs. previous 7 days", icon: TrendingUp },
      { id: "churn", label: "Churn rate", value: "1.92%", change: -0.3, hint: "vs. previous 7 days", icon: RefreshCcw, lowerIsBetter: true },
    ],
    line: [
      { label: "Mon", value: 5820 },
      { label: "Tue", value: 6240 },
      { label: "Wed", value: 6010 },
      { label: "Thu", value: 7130 },
      { label: "Fri", value: 8420 },
      { label: "Sat", value: 7460 },
      { label: "Sun", value: 7150 },
    ],
    bars: [
      { label: "Organic", value: 4120 },
      { label: "Paid", value: 2860 },
      { label: "Referral", value: 1740 },
      { label: "Email", value: 2310 },
      { label: "Social", value: 1180 },
    ],
  },
  "30d": {
    label: "last 30 days",
    kpis: [
      { id: "rev", label: "Revenue", value: "$212,904", change: 12.4, hint: "vs. previous 30 days", icon: CircleDollarSign },
      { id: "users", label: "Active users", value: "48,215", change: 9.1, hint: "vs. previous 30 days", icon: Users },
      { id: "conv", label: "Conversion rate", value: "3.61%", change: 0.4, hint: "vs. previous 30 days", icon: TrendingUp },
      { id: "churn", label: "Churn rate", value: "2.14%", change: 0.2, hint: "vs. previous 30 days", icon: RefreshCcw, lowerIsBetter: true },
    ],
    line: [
      { label: "Wk 1", value: 41200 },
      { label: "Wk 2", value: 46800 },
      { label: "Wk 3", value: 44300 },
      { label: "Wk 4", value: 52100 },
      { label: "Wk 5", value: 58900 },
      { label: "Wk 6", value: 54200 },
      { label: "Wk 7", value: 61800 },
      { label: "Wk 8", value: 66400 },
    ],
    bars: [
      { label: "Organic", value: 17420 },
      { label: "Paid", value: 12860 },
      { label: "Referral", value: 7340 },
      { label: "Email", value: 9810 },
      { label: "Social", value: 5180 },
    ],
  },
  "90d": {
    label: "last 90 days",
    kpis: [
      { id: "rev", label: "Revenue", value: "$631,470", change: 18.9, hint: "vs. previous 90 days", icon: CircleDollarSign },
      { id: "users", label: "Active users", value: "121,903", change: 15.3, hint: "vs. previous 90 days", icon: Users },
      { id: "conv", label: "Conversion rate", value: "3.47%", change: 1.1, hint: "vs. previous 90 days", icon: TrendingUp },
      { id: "churn", label: "Churn rate", value: "2.41%", change: -0.5, hint: "vs. previous 90 days", icon: RefreshCcw, lowerIsBetter: true },
    ],
    line: [
      { label: "Jan", value: 168000 },
      { label: "Feb", value: 175400 },
      { label: "Mar", value: 190200 },
      { label: "Apr", value: 184900 },
      { label: "May", value: 206300 },
      { label: "Jun", value: 241000 },
    ],
    bars: [
      { label: "Organic", value: 52400 },
      { label: "Paid", value: 38100 },
      { label: "Referral", value: 21900 },
      { label: "Email", value: 29700 },
      { label: "Social", value: 15600 },
    ],
  },
};

const ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "New subscription — Growth plan", detail: "Harbor & Pine Co. upgraded from Starter", time: "4 min ago", icon: CreditCard, tone: "emerald" },
  { id: "a2", title: "Order #20418 completed", detail: "3 items · $286.40 · Lena Fischer", time: "18 min ago", icon: ShoppingCart, tone: "sky" },
  { id: "a3", title: "New user signed up", detail: "Mateo Alvarez joined via referral link", time: "42 min ago", icon: UserPlus, tone: "violet" },
  { id: "a4", title: "Traffic spike detected", detail: "Organic sessions up 38% on /pricing", time: "1 hr ago", icon: Eye, tone: "amber" },
  { id: "a5", title: "Refund issued", detail: "Order #20391 · $54.00 · Priya Raman", time: "2 hr ago", icon: RefreshCcw, tone: "rose" },
  { id: "a6", title: "Monthly report generated", detail: "June performance summary is ready", time: "3 hr ago", icon: BarChart3, tone: "sky" },
];

const TONES: Record<ActivityItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 100) / 10}k`;
  return String(n);
}

function niceMax(max: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = kpi.lowerIsBetter ? !up : up;
  const Icon = kpi.icon;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const sign = up ? "+" : "−";
  const abs = Math.abs(kpi.change).toFixed(1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600">{kpi.label}</h3>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
            good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
          {sign}
          {abs}%
          <span className="sr-only">
            {up ? " increase" : " decrease"}, {good ? "favorable" : "unfavorable"}
          </span>
        </span>
        <span className="text-slate-500">{kpi.hint}</span>
      </p>
    </div>
  );
}

function LineChart({ data, rangeLabel }: { data: { label: string; value: number }[]; rangeLabel: string }) {
  const uid = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 640;
  const H = 280;
  const pad = { top: 16, right: 16, bottom: 32, left: 48 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const points = data.map((d, i) => ({
    x: pad.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw),
    y: pad.top + ih - (d.value / max) * ih,
    ...d,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${points[points.length - 1].x.toFixed(1)},${pad.top + ih} L${points[0].x.toFixed(1)},${pad.top + ih} Z`;
  const gradId = `${uid}-grad`;
  const activePoint = active !== null ? points[active] : null;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Line chart of revenue over the ${rangeLabel}. Values: ${data
            .map((d) => `${d.label} $${d.value.toLocaleString("en-US")}`)
            .join(", ")}.`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => {
            const y = pad.top + ih - (t / max) * ih;
            return (
              <g key={t}>
                <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : "3 4"} />
                <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                  ${formatCompact(t)}
                </text>
              </g>
            );
          })}
          <path d={area} fill={`url(#${gradId})`} />
          <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {activePoint && (
            <line x1={activePoint.x} x2={activePoint.x} y1={pad.top} y2={pad.top + ih} stroke="#a5b4fc" strokeDasharray="3 3" />
          )}
          {points.map((p, i) => (
            <g key={p.label}>
              <text x={p.x} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">
                {p.label}
              </text>
              <circle
                cx={p.x}
                cy={p.y}
                r={active === i ? 6 : 4}
                fill="#fff"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
              {/* larger invisible hit target */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${p.label}: $${p.value.toLocaleString("en-US")}`}
                className="cursor-pointer outline-none focus-visible:stroke-indigo-600 focus-visible:stroke-2"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          ))}
        </svg>
        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
            style={{
              left: `${(Math.min(Math.max(activePoint.x, 50), W - 50) / W) * 100}%`,
              top: `${(activePoint.y / H) * 100}%`,
              marginTop: -10,
            }}
            aria-hidden="true"
          >
            {activePoint.label}: ${activePoint.value.toLocaleString("en-US")}
          </div>
        )}
      </div>
    </div>
  );
}

function BarChart({ data, rangeLabel }: { data: { label: string; value: number }[]; rangeLabel: string }) {
  const [active, setActive] = useState<number | null>(null);

  const W = 480;
  const H = 280;
  const pad = { top: 16, right: 12, bottom: 32, left: 44 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const slot = iw / data.length;
  const barW = Math.min(44, slot * 0.6);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Bar chart of sessions by traffic source over the ${rangeLabel}. ${data
          .map((d) => `${d.label} ${d.value.toLocaleString("en-US")}`)
          .join(", ")}.`}
      >
        {ticks.map((t) => {
          const y = pad.top + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : "3 4"} />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                {formatCompact(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = pad.left + slot * i + (slot - barW) / 2;
          const y = pad.top + ih - h;
          const isActive = active === i;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={5}
                fill={isActive ? "#4f46e5" : "#818cf8"}
              />
              <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">
                {d.label}
              </text>
              <rect
                x={pad.left + slot * i}
                y={pad.top}
                width={slot}
                height={ih}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${d.value.toLocaleString("en-US")} sessions, ${((d.value / total) * 100).toFixed(1)}% of total`}
                className="cursor-pointer outline-none focus-visible:stroke-indigo-600 focus-visible:stroke-2"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{
            left: `${((pad.left + slot * active + slot / 2) / W) * 100}%`,
            top: `${((pad.top + ih - (data[active].value / max) * ih) / H) * 100}%`,
            marginTop: -8,
          }}
          aria-hidden="true"
        >
          {data[active].label}: {data[active].value.toLocaleString("en-US")}
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  description,
  children,
  className = "",
  headingId,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headingId: string;
}) {
  return (
    <section aria-labelledby={headingId} className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 id={headingId} className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");
  const data = DATA[range];
  const rangeTabsId = useId();

  const lineTotal = useMemo(() => data.line.reduce((s, d) => s + d.value, 0), [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-indigo-600"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Analytics overview</h1>
              <p className="text-sm text-slate-500">Northwind Store · Updated today at 09:41</p>
            </div>
          </div>

          <div role="group" aria-label="Time range" id={rangeTabsId} className="inline-flex self-start rounded-lg bg-slate-100 p-1 sm:self-auto">
            {RANGES.map((r) => {
              const selected = r.key === range;
              return (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange(r.key)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
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

      <main id="main" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section aria-label={`Key metrics, ${data.label}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card
            headingId="revenue-heading"
            title="Revenue over time"
            description={`Total ${"$" + lineTotal.toLocaleString("en-US")} in the ${data.label}`}
            className="lg:col-span-3"
          >
            <LineChart key={range} data={data.line} rangeLabel={data.label} />
          </Card>

          <Card
            headingId="sources-heading"
            title="Sessions by source"
            description={`Where visitors came from in the ${data.label}`}
            className="lg:col-span-2"
          >
            <BarChart key={range} data={data.bars} rangeLabel={data.label} />
          </Card>
        </div>

        <Card headingId="activity-heading" title="Recent activity" description="Latest events across your store">
          <ul className="divide-y divide-slate-100">
            {ACTIVITY.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONES[a.tone]}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                    <p className="truncate text-sm text-slate-500">{a.detail}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">{a.time}</span>
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