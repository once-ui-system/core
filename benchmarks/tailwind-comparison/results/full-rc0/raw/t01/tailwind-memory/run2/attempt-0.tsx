"use client";

import { useId, useMemo, useState } from "react";
import type { ComponentType, SVGProps } from "react";
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
  AlertTriangle,
  Percent,
} from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number; // percent
  goodWhenUp: boolean;
  note: string;
  icon: IconType;
  spark: number[];
};

const KPIS: Kpi[] = [
  {
    id: "revenue",
    label: "Total revenue",
    value: "$128,430",
    change: 12.4,
    goodWhenUp: true,
    note: "vs. previous 30 days",
    icon: DollarSign,
    spark: [32, 35, 33, 38, 41, 40, 46, 49, 52, 58],
  },
  {
    id: "users",
    label: "Active users",
    value: "24,861",
    change: 8.1,
    goodWhenUp: true,
    note: "vs. previous 30 days",
    icon: Users,
    spark: [20, 22, 21, 24, 26, 25, 28, 29, 31, 33],
  },
  {
    id: "conversion",
    label: "Conversion rate",
    value: "3.82%",
    change: -0.6,
    goodWhenUp: true,
    note: "vs. previous 30 days",
    icon: Percent,
    spark: [42, 41, 43, 40, 41, 39, 40, 38, 39, 37],
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "1.9%",
    change: -0.3,
    goodWhenUp: false,
    note: "vs. previous 30 days",
    icon: RefreshCw,
    spark: [30, 31, 29, 30, 28, 27, 28, 26, 25, 24],
  },
];

type RangeKey = "7d" | "30d" | "90d";

type Point = { label: string; visitors: number; signups: number };

const SERIES: Record<RangeKey, Point[]> = {
  "7d": [
    { label: "Mon", visitors: 4120, signups: 182 },
    { label: "Tue", visitors: 4580, signups: 205 },
    { label: "Wed", visitors: 4310, signups: 191 },
    { label: "Thu", visitors: 5040, signups: 238 },
    { label: "Fri", visitors: 5420, signups: 251 },
    { label: "Sat", visitors: 3890, signups: 164 },
    { label: "Sun", visitors: 3620, signups: 149 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 28400, signups: 1210 },
    { label: "Wk 2", visitors: 30150, signups: 1342 },
    { label: "Wk 3", visitors: 29320, signups: 1275 },
    { label: "Wk 4", visitors: 33880, signups: 1498 },
    { label: "Wk 5", visitors: 35210, signups: 1587 },
  ],
  "90d": [
    { label: "Jan", visitors: 104200, signups: 4420 },
    { label: "Feb", visitors: 112600, signups: 4890 },
    { label: "Mar", visitors: 126300, signups: 5610 },
  ],
};

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

type Channel = { name: string; revenue: number };

const CHANNELS: Channel[] = [
  { name: "Organic search", revenue: 42800 },
  { name: "Direct", revenue: 31200 },
  { name: "Paid ads", revenue: 24600 },
  { name: "Email", revenue: 17900 },
  { name: "Referral", revenue: 8700 },
  { name: "Social", revenue: 3230 },
];

type ActivityTone = "success" | "info" | "warning" | "neutral";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: ActivityTone;
  icon: IconType;
};

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    title: "New enterprise subscription",
    detail: "Northwind Logistics upgraded to the Scale plan — $1,490/mo",
    time: "4 min ago",
    tone: "success",
    icon: CreditCard,
  },
  {
    id: "a2",
    title: "New user signed up",
    detail: "Priya Raman joined from the spring webinar campaign",
    time: "18 min ago",
    tone: "info",
    icon: UserPlus,
  },
  {
    id: "a3",
    title: "Order #48213 completed",
    detail: "3 items · $342.00 · paid with Visa ending 4417",
    time: "42 min ago",
    tone: "success",
    icon: ShoppingCart,
  },
  {
    id: "a4",
    title: "Payment failed",
    detail: "Brightside Studio — card declined on renewal, retry scheduled",
    time: "1 hr ago",
    tone: "warning",
    icon: AlertTriangle,
  },
  {
    id: "a5",
    title: "Weekly report generated",
    detail: "Acquisition summary for 12–18 May is ready to download",
    time: "3 hr ago",
    tone: "neutral",
    icon: BarChart3,
  },
  {
    id: "a6",
    title: "Traffic spike detected",
    detail: "Organic visits up 38% on /pricing after newsletter send",
    time: "5 hr ago",
    tone: "info",
    icon: Activity,
  },
];

const TONE_STYLES: Record<ActivityTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  info: "bg-sky-100 text-sky-700",
  warning: "bg-amber-100 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
};

const nf = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-8 w-24 shrink-0 ${positive ? "text-emerald-500" : "text-rose-500"}`}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = up === kpi.goodWhenUp;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const Icon = kpi.icon;
  const sign = up ? "+" : "−";
  const abs = Math.abs(kpi.change);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-500">{kpi.label}</h3>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" focusable="false" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
            <span>
              {sign}
              {abs}%
            </span>
            <span className="sr-only">
              {up ? "increase" : "decrease"}, {good ? "favorable" : "unfavorable"}
            </span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500">{kpi.note}</p>
        </div>
        <Sparkline data={kpi.spark} positive={good} />
      </div>
    </article>
  );
}

function niceMax(v: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function LineChart({ data, rangeLabel }: { data: Point[]; rangeLabel: string }) {
  const gradId = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 640;
  const H = 280;
  const pad = { top: 16, right: 16, bottom: 8, left: 8 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const max = niceMax(Math.max(...data.map((d) => d.visitors)) * 1.05);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const coords = useMemo(
    () =>
      data.map((d, i) => ({
        x: pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
        y: pad.top + innerH - (d.visitors / max) * innerH,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, max],
  );

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${pad.top + innerH} L${coords[0].x.toFixed(
    1,
  )},${pad.top + innerH} Z`;

  const activePoint = active !== null ? data[active] : null;
  const activeCoord = active !== null ? coords[active] : null;

  const peak = data.reduce((a, b) => (b.visitors > a.visitors ? b : a));

  return (
    <div>
      <p id="line-desc" className="sr-only">
        Line chart of visitors for {rangeLabel.toLowerCase()}. Peak was {nf.format(peak.visitors)} visitors
        in {peak.label}. A full data table follows the chart.
      </p>
      <div className="flex">
        <div
          className="flex w-10 shrink-0 flex-col-reverse justify-between pb-2 pt-4 text-right text-[11px] text-slate-500 sm:w-12"
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span key={t} className="-my-1.5 pr-2 leading-none">
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-56 w-full sm:h-72"
            role="img"
            aria-labelledby="line-title line-desc"
          >
            <title id="line-title">Visitors over time</title>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => {
              const y = pad.top + innerH - (t / max) * innerH;
              return (
                <line
                  key={t}
                  x1={pad.left}
                  x2={W - pad.right}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={t === 0 ? undefined : "3 4"}
                />
              );
            })}
            <path d={area} fill={`url(#${gradId})`} />
            <path
              d={line}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {activeCoord && (
              <line
                x1={activeCoord.x}
                x2={activeCoord.x}
                y1={pad.top}
                y2={pad.top + innerH}
                stroke="#94a3b8"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* HTML markers so circles are not distorted by non-uniform scaling */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {coords.map((c, i) => (
              <span
                key={data[i].label}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-500 bg-white transition-all ${
                  active === i ? "h-3.5 w-3.5" : "h-2 w-2"
                }`}
                style={{ left: `${(c.x / W) * 100}%`, top: `${(c.y / H) * 100}%` }}
              />
            ))}
          </div>

          {/* Interactive hit areas (keyboard + pointer) */}
          <div className="absolute inset-0 flex" role="group" aria-label="Chart data points">
            {data.map((d, i) => (
              <button
                key={d.label}
                type="button"
                className="h-full flex-1 cursor-crosshair rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600"
                aria-label={`${d.label}: ${nf.format(d.visitors)} visitors, ${nf.format(d.signups)} sign-ups`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}
          </div>

          {activePoint && activeCoord && (
            <div
              className="pointer-events-none absolute z-10 w-36 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
              style={{
                left: `clamp(4.5rem, ${(activeCoord.x / W) * 100}%, calc(100% - 4.5rem))`,
                top: `${Math.max((activeCoord.y / H) * 100 - 6, 0)}%`,
                transform: "translate(-50%, -100%)",
              }}
              aria-hidden="true"
            >
              <p className="font-semibold">{activePoint.label}</p>
              <p className="mt-0.5 text-slate-300">{nf.format(activePoint.visitors)} visitors</p>
              <p className="text-slate-300">{nf.format(activePoint.signups)} sign-ups</p>
            </div>
          )}
        </div>
      </div>
      <div className="ml-10 mt-2 flex justify-between text-[11px] text-slate-500 sm:ml-12" aria-hidden="true">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Visitors and sign-ups, {rangeLabel.toLowerCase()}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Visitors</th>
            <th scope="col">Sign-ups</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{nf.format(d.visitors)}</td>
              <td>{nf.format(d.signups)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarChart({ data }: { data: Channel[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const top = data.reduce((a, b) => (b.revenue > a.revenue ? b : a));

  return (
    <div>
      <p id="bar-desc" className="sr-only">
        Bar chart of revenue by acquisition channel. {top.name} leads with {usd.format(top.revenue)} of{" "}
        {usd.format(total)} total.
      </p>
      <ul className="space-y-3" aria-labelledby="bar-title" aria-describedby="bar-desc">
        {data.map((d, i) => {
          const pct = (d.revenue / max) * 100;
          const share = Math.round((d.revenue / total) * 100);
          const isActive = active === i;
          return (
            <li
              key={d.name}
              className="group"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{d.name}</span>
                <span className="shrink-0 tabular-nums text-slate-600">
                  {usd.format(d.revenue)} <span className="text-xs text-slate-500">· {share}%</span>
                </span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
                role="meter"
                aria-label={`${d.name} revenue`}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={d.revenue}
                aria-valuetext={`${usd.format(d.revenue)}, ${share}% of total`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isActive || i === 0 ? "bg-indigo-600" : "bg-indigo-400"
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

function VerticalBars({ data }: { data: Channel[] }) {
  // Compact column chart used on wider screens alongside the ranked list.
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  return (
    <div className="hidden items-end gap-2 sm:flex sm:h-28" aria-hidden="true">
      {data.map((d) => (
        <div key={d.name} className="flex h-full flex-1 flex-col justify-end">
          <div
            className="w-full rounded-t-md bg-indigo-200"
            style={{ height: `${(d.revenue / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [range, setRange] = useState<RangeKey>("30d");
  const data = SERIES[range];
  const ranges: RangeKey[] = ["7d", "30d", "90d"];

  const totalVisitors = data.reduce((s, d) => s + d.visitors, 0);
  const totalSignups = data.reduce((s, d) => s + d.signups, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-2 focus:outline-indigo-600"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BarChart3 className="h-5 w-5" aria-hidden="true" focusable="false" />
            </span>
            <span className="text-base font-semibold tracking-tight">Lumen Analytics</span>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">Updated today at 09:42 UTC</p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Performance overview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Track revenue, audience growth and acquisition across all your products.
            </p>
          </div>
          <div role="group" aria-label="Chart date range" className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {ranges.map((r) => {
              const selected = r === range;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    selected ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
                </button>
              );
            })}
          </div>
        </div>

        <section aria-labelledby="kpi-heading" className="mt-6">
          <h2 id="kpi-heading" className="sr-only">
            Key metrics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPIS.map((k) => (
              <StatCard key={k.id} kpi={k} />
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section
            aria-labelledby="traffic-heading"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="traffic-heading" className="text-base font-semibold">
                  Visitors
                </h2>
                <p className="text-sm text-slate-500">{RANGE_LABELS[range]}</p>
              </div>
              <dl className="flex gap-6 text-right">
                <div>
                  <dt className="text-xs text-slate-500">Total visitors</dt>
                  <dd className="text-lg font-semibold tabular-nums">{nf.format(totalVisitors)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Sign-ups</dt>
                  <dd className="text-lg font-semibold tabular-nums">{nf.format(totalSignups)}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-5">
              <LineChart key={range} data={data} rangeLabel={RANGE_LABELS[range]} />
            </div>
          </section>

          <section
            aria-labelledby="activity-heading"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 id="activity-heading" className="text-base font-semibold">
              Recent activity
            </h2>
            <p className="text-sm text-slate-500">Latest events across your workspace</p>
            <ol className="mt-4 divide-y divide-slate-100">
              {ACTIVITY.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[a.tone]}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{a.title}</p>
                        <p className="shrink-0 text-xs text-slate-500">{a.time}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{a.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <section
          aria-labelledby="bar-title"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="bar-title" className="text-base font-semibold">
                Revenue by channel
              </h2>
              <p className="text-sm text-slate-500">Last 30 days · all products</p>
            </div>
            <p className="text-sm text-slate-600">
              Total <span className="font-semibold tabular-nums text-slate-900">{usd.format(CHANNELS.reduce((s, c) => s + c.revenue, 0))}</span>
            </p>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              <BarChart data={CHANNELS} />
            </div>
            <div className="flex flex-col justify-end lg:col-span-2">
              <p className="mb-2 hidden text-xs font-medium uppercase tracking-wide text-slate-500 sm:block">
                Distribution
              </p>
              <VerticalBars data={CHANNELS} />
              <p className="mt-3 text-sm text-slate-600">
                Organic search and direct traffic generate{" "}
                <span className="font-semibold text-slate-900">58%</span> of revenue, while paid ads
                contribute a further 19%.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">
        Figures are sample data for demonstration purposes.
      </footer>
    </div>
  );
}
