"use client";

import { useId, useState } from "react";
import type { ComponentType, KeyboardEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  RefreshCw,
  ShoppingCart,
  UserPlus,
  Users,
  Eye,
  AlertTriangle,
  Download,
} from "lucide-react";

/* ----------------------------- Data ----------------------------- */

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

interface Kpi {
  id: string;
  label: string;
  value: string;
  change: number;
  /** When true, a negative change is the good direction (e.g. churn). */
  invert?: boolean;
  comparison: string;
  icon: IconType;
  spark: number[];
}

const KPIS: Kpi[] = [
  {
    id: "revenue",
    label: "Monthly revenue",
    value: "$48,290",
    change: 12.4,
    comparison: "vs. $42,960 last month",
    icon: CircleDollarSign,
    spark: [32, 35, 33, 38, 41, 40, 44, 43, 46, 48],
  },
  {
    id: "users",
    label: "Active users",
    value: "12,847",
    change: 8.1,
    comparison: "vs. 11,883 last month",
    icon: Users,
    spark: [9.8, 10.2, 10.1, 10.9, 11.3, 11.6, 11.9, 12.2, 12.5, 12.8],
  },
  {
    id: "conversion",
    label: "Conversion rate",
    value: "3.62%",
    change: -2.3,
    comparison: "vs. 3.71% last month",
    icon: ShoppingCart,
    spark: [3.9, 3.8, 3.85, 3.75, 3.8, 3.7, 3.72, 3.68, 3.65, 3.62],
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "1.8%",
    change: -0.6,
    invert: true,
    comparison: "vs. 2.4% last month",
    icon: RefreshCw,
    spark: [2.6, 2.5, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8],
  },
];

interface LinePoint {
  label: string;
  visitors: number;
}

const VISITORS: LinePoint[] = [
  { label: "Jan", visitors: 18200 },
  { label: "Feb", visitors: 19800 },
  { label: "Mar", visitors: 22400 },
  { label: "Apr", visitors: 21100 },
  { label: "May", visitors: 24900 },
  { label: "Jun", visitors: 27300 },
  { label: "Jul", visitors: 26200 },
  { label: "Aug", visitors: 29800 },
  { label: "Sep", visitors: 32100 },
  { label: "Oct", visitors: 31400 },
  { label: "Nov", visitors: 35600 },
  { label: "Dec", visitors: 38900 },
];

interface BarPoint {
  label: string;
  value: number;
}

const CHANNELS: BarPoint[] = [
  { label: "Organic search", value: 14820 },
  { label: "Direct", value: 9640 },
  { label: "Email", value: 7310 },
  { label: "Social", value: 5490 },
  { label: "Referral", value: 3875 },
  { label: "Paid ads", value: 2960 },
];

type ActivityTone = "success" | "info" | "warning";

interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: ActivityTone;
  icon: IconType;
}

const ACTIVITY: Activity[] = [
  {
    id: "a1",
    title: "New enterprise subscription",
    detail: "Northwind Logistics upgraded to the Enterprise plan",
    time: "4 min ago",
    tone: "success",
    icon: CreditCard,
  },
  {
    id: "a2",
    title: "New team member joined",
    detail: "Priya Raman accepted an invite to the Growth workspace",
    time: "26 min ago",
    tone: "info",
    icon: UserPlus,
  },
  {
    id: "a3",
    title: "Payment failed",
    detail: "Invoice #INV-2041 for Lumen Studio was declined",
    time: "1 hr ago",
    tone: "warning",
    icon: AlertTriangle,
  },
  {
    id: "a4",
    title: "Report exported",
    detail: "Marcus Lee exported the Q3 acquisition report as CSV",
    time: "2 hr ago",
    tone: "info",
    icon: Download,
  },
  {
    id: "a5",
    title: "Dashboard shared",
    detail: "Sofia Alvarez shared “Retention overview” with 6 people",
    time: "3 hr ago",
    tone: "info",
    icon: Eye,
  },
  {
    id: "a6",
    title: "Subscription renewed",
    detail: "Harbor & Pine renewed their annual Pro plan",
    time: "5 hr ago",
    tone: "success",
    icon: RefreshCw,
  },
];

const TONE_STYLES: Record<ActivityTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  info: "bg-indigo-100 text-indigo-700",
  warning: "bg-amber-100 text-amber-700",
};

const nf = new Intl.NumberFormat("en-US");

/* --------------------------- Helpers ---------------------------- */

function niceMax(max: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function formatCompact(n: number): string {
  if (n >= 1000) return `${Math.round((n / 1000) * 10) / 10}k`;
  return String(n);
}

/* ------------------------- Sparkline ---------------------------- */

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
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
      viewBox={`0 0 ${w} ${h}`}
      className={`h-8 w-24 ${positive ? "text-emerald-500" : "text-rose-500"}`}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------- KPI card ---------------------------- */

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = kpi.invert ? !up : up;
  const Icon = kpi.icon;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const direction = up ? "up" : "down";
  const sentiment = good ? "improvement" : "decline";

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
              good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            <TrendIcon className="h-4 w-4" aria-hidden="true" />
            <span aria-hidden="true">{Math.abs(kpi.change)}%</span>
            <span className="sr-only">
              {`${direction} ${Math.abs(kpi.change)} percent, an ${sentiment}`.replace(
                "an decline",
                "a decline",
              )}
            </span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500">{kpi.comparison}</p>
        </div>
        <Sparkline data={kpi.spark} positive={good} />
      </div>
    </li>
  );
}

/* ------------------------- Line chart --------------------------- */

function LineChart({ data }: { data: LinePoint[] }) {
  const gradId = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 720;
  const H = 300;
  const m = { top: 16, right: 20, bottom: 32, left: 48 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = niceMax(Math.max(...data.map((d) => d.visitors)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);

  const x = (i: number) => m.left + (i / (data.length - 1)) * iw;
  const y = (v: number) => m.top + ih - (v / yMax) * ih;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${m.top + ih} L${x(0).toFixed(1)},${m.top + ih} Z`;

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => (a === null ? 0 : Math.min(a + 1, data.length - 1)));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => (a === null ? data.length - 1 : Math.max(a - 1, 0)));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(data.length - 1);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  const activePoint = active !== null ? data[active] : null;
  const tipLeft = active !== null ? (x(active) / W) * 100 : 0;
  const tipTop = activePoint ? (y(activePoint.visitors) / H) * 100 : 0;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          role="group"
          aria-label="Line chart of monthly visitors from January to December. Use left and right arrow keys to inspect each month."
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={1} />
              <text x={m.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748b">
                {formatCompact(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <text key={d.label} x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="#64748b">
              {d.label}
            </text>
          ))}

          <path d={area} fill={`url(#${gradId})`} />
          <path d={line} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {active !== null && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={m.top}
              y2={m.top + ih}
              stroke="#94a3b8"
              strokeDasharray="4 4"
            />
          )}

          {data.map((d, i) => (
            <g key={d.label}>
              <circle
                cx={x(i)}
                cy={y(d.visitors)}
                r={active === i ? 6 : 3.5}
                fill="#fff"
                stroke="#6366f1"
                strokeWidth={2}
              />
              {/* Wide invisible hit area for pointer interaction */}
              <rect
                x={x(i) - iw / (data.length - 1) / 2}
                y={m.top}
                width={iw / (data.length - 1)}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onMouseMove={() => setActive(i)}
                onClick={() => setActive(i)}
              />
            </g>
          ))}
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{ left: `${Math.min(Math.max(tipLeft, 10), 90)}%`, top: `calc(${tipTop}% - 12px)` }}
          >
            <span className="font-medium">{activePoint.label}</span>
            <span className="ml-2 tabular-nums">{nf.format(activePoint.visitors)} visitors</span>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {activePoint ? `${activePoint.label}: ${nf.format(activePoint.visitors)} visitors` : ""}
      </p>

      <details className="mt-3 text-sm text-slate-600">
        <summary className="cursor-pointer rounded font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          View data as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <caption className="sr-only">Monthly visitors</caption>
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th scope="col" className="py-1.5 pr-4 font-medium">
                  Month
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Visitors
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-1.5 pr-4 font-normal">
                    {d.label}
                  </th>
                  <td className="py-1.5 text-right tabular-nums">{nf.format(d.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/* ------------------------- Bar chart ---------------------------- */

function BarChart({ data }: { data: BarPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <ul className="space-y-3" aria-label="Sessions by acquisition channel">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const share = Math.round((d.value / total) * 100);
          const dim = active !== null && active !== i;
          return (
            <li
              key={d.label}
              className="group"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{d.label}</span>
                <span className="tabular-nums text-slate-500">
                  {nf.format(d.value)} <span className="text-slate-400">· {share}%</span>
                </span>
              </div>
              <div
                className="h-3 rounded-full bg-slate-100"
                role="img"
                aria-label={`${d.label}: ${nf.format(d.value)} sessions, ${share} percent of total`}
                tabIndex={0}
              >
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    dim ? "bg-indigo-300" : "bg-indigo-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------- Vertical bars ---------------------- */

interface WeekDay {
  label: string;
  signups: number;
}

const SIGNUPS: WeekDay[] = [
  { label: "Mon", signups: 142 },
  { label: "Tue", signups: 188 },
  { label: "Wed", signups: 215 },
  { label: "Thu", signups: 198 },
  { label: "Fri", signups: 176 },
  { label: "Sat", signups: 94 },
  { label: "Sun", signups: 81 },
];

function ColumnChart({ data }: { data: WeekDay[] }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 480;
  const H = 220;
  const m = { top: 12, right: 8, bottom: 28, left: 36 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  const yMax = niceMax(Math.max(...data.map((d) => d.signups)));
  const ticks = [0, 0.5, 1].map((t) => t * yMax);
  const slot = iw / data.length;
  const bw = slot * 0.55;
  const y = (v: number) => m.top + ih - (v / yMax) * ih;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Bar chart of signups by weekday. ${data.map((d) => `${d.label}: ${d.signups}`).join(", ")}.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
            <text x={m.left - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748b">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = m.left + slot * i + slot / 2;
          const top = y(d.signups);
          const isActive = active === i;
          return (
            <g
              key={d.label}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={m.top + ih - top}
                rx={4}
                fill={isActive ? "#4338ca" : "#818cf8"}
              />
              {isActive && (
                <text x={cx} y={top - 5} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1e293b">
                  {d.signups}
                </text>
              )}
              <text x={cx} y={H - 9} textAnchor="middle" fontSize={11} fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* --------------------------- Card shell ------------------------- */

function Card({
  title,
  description,
  headingId,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  headingId: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <h2 id={headingId} className="text-base font-semibold text-slate-900">
        {title}
      </h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Pulse Analytics</span>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">
            Last updated <time dateTime="2025-12-15T09:42:00">Dec 15, 2025 at 9:42 AM</time>
          </p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Performance across all products for the last 30 days compared with the previous period.
          </p>
        </div>

        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Key metrics
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPIS.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </ul>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card
            title="Visitors over time"
            description="Unique monthly visitors, January to December 2025"
            headingId="visitors-heading"
            className="lg:col-span-2"
          >
            <LineChart data={VISITORS} />
          </Card>

          <Card
            title="Traffic by channel"
            description="Sessions this month"
            headingId="channels-heading"
          >
            <BarChart data={CHANNELS} />
          </Card>

          <Card
            title="Signups by weekday"
            description="New accounts created last week"
            headingId="signups-heading"
          >
            <ColumnChart data={SIGNUPS} />
          </Card>

          <Card
            title="Recent activity"
            description="Latest events across your workspace"
            headingId="activity-heading"
            className="lg:col-span-2"
          >
            <ul className="divide-y divide-slate-100">
              {ACTIVITY.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[a.tone]}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-600">{a.detail}</p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-500">{a.time}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
