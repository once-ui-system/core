```tsx
"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  RefreshCcw,
  ShoppingCart,
  UserPlus,
  Users,
  Eye,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type RangeKey = "7d" | "30d" | "90d";

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number; // percent, signed
  /** When true, a negative change is good (e.g. bounce rate). */
  invert?: boolean;
  comparison: string;
  icon: LucideIcon;
};

const KPIS_BY_RANGE: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Revenue", value: "$48,230", change: 8.2, comparison: "vs. previous 7 days", icon: DollarSign },
    { id: "visitors", label: "Active visitors", value: "21,904", change: 4.6, comparison: "vs. previous 7 days", icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.84%", change: 0.3, comparison: "vs. previous 7 days", icon: ShoppingCart },
    { id: "bounce", label: "Bounce rate", value: "41.2%", change: -2.1, invert: true, comparison: "vs. previous 7 days", icon: RefreshCcw },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", value: "$212,480", change: 12.5, comparison: "vs. previous 30 days", icon: DollarSign },
    { id: "visitors", label: "Active visitors", value: "94,317", change: 6.8, comparison: "vs. previous 30 days", icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.62%", change: -0.4, comparison: "vs. previous 30 days", icon: ShoppingCart },
    { id: "bounce", label: "Bounce rate", value: "42.7%", change: -3.4, invert: true, comparison: "vs. previous 30 days", icon: RefreshCcw },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", value: "$631,905", change: 18.9, comparison: "vs. previous 90 days", icon: DollarSign },
    { id: "visitors", label: "Active visitors", value: "278,640", change: 9.3, comparison: "vs. previous 90 days", icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.51%", change: -1.2, comparison: "vs. previous 90 days", icon: ShoppingCart },
    { id: "bounce", label: "Bounce rate", value: "44.0%", change: 1.8, invert: true, comparison: "vs. previous 90 days", icon: RefreshCcw },
  ],
};

type TrafficPoint = { label: string; visitors: number; sessions: number };

const TRAFFIC_BY_RANGE: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 2840, sessions: 3510 },
    { label: "Tue", visitors: 3120, sessions: 3890 },
    { label: "Wed", visitors: 3305, sessions: 4120 },
    { label: "Thu", visitors: 2980, sessions: 3720 },
    { label: "Fri", visitors: 3560, sessions: 4430 },
    { label: "Sat", visitors: 2410, sessions: 2960 },
    { label: "Sun", visitors: 2175, sessions: 2680 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 20150, sessions: 25300 },
    { label: "Wk 2", visitors: 22840, sessions: 28100 },
    { label: "Wk 3", visitors: 23910, sessions: 29650 },
    { label: "Wk 4", visitors: 27417, sessions: 33820 },
  ],
  "90d": [
    { label: "Jan", visitors: 81200, sessions: 99800 },
    { label: "Feb", visitors: 88450, sessions: 109200 },
    { label: "Mar", visitors: 108990, sessions: 134600 },
  ],
};

type ChannelPoint = { channel: string; orders: number; returns: number };

const CHANNELS_BY_RANGE: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { channel: "Organic", orders: 412, returns: 18 },
    { channel: "Paid", orders: 289, returns: 24 },
    { channel: "Email", orders: 236, returns: 9 },
    { channel: "Social", orders: 148, returns: 14 },
    { channel: "Referral", orders: 97, returns: 5 },
  ],
  "30d": [
    { channel: "Organic", orders: 1840, returns: 71 },
    { channel: "Paid", orders: 1295, returns: 102 },
    { channel: "Email", orders: 1022, returns: 38 },
    { channel: "Social", orders: 630, returns: 57 },
    { channel: "Referral", orders: 418, returns: 21 },
  ],
  "90d": [
    { channel: "Organic", orders: 5320, returns: 214 },
    { channel: "Paid", orders: 3780, returns: 301 },
    { channel: "Email", orders: 3105, returns: 112 },
    { channel: "Social", orders: 1895, returns: 170 },
    { channel: "Referral", orders: 1260, returns: 66 },
  ],
};

type ActivityKind = "order" | "signup" | "refund" | "subscription" | "alert" | "review";

type Activity = {
  id: string;
  name: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  kind: ActivityKind;
};

const ACTIVITY_META: Record<
  ActivityKind,
  { icon: LucideIcon; label: string; className: string }
> = {
  order: { icon: ShoppingCart, label: "Order", className: "text-chart-2" },
  signup: { icon: UserPlus, label: "Sign-up", className: "text-chart-3 dark:text-chart-1" },
  refund: { icon: RefreshCcw, label: "Refund", className: "text-destructive" },
  subscription: { icon: CreditCard, label: "Subscription", className: "text-chart-2" },
  alert: { icon: AlertTriangle, label: "Alert", className: "text-chart-5" },
  review: { icon: Eye, label: "Review", className: "text-muted-foreground" },
};

const ACTIVITIES: Activity[] = [
  { id: "a1", name: "Priya Raman", initials: "PR", action: "placed an order", detail: "Order #10482 · $184.00", time: "4 min ago", kind: "order" },
  { id: "a2", name: "Daniel Okafor", initials: "DO", action: "started a Pro subscription", detail: "Annual plan · $290.00", time: "18 min ago", kind: "subscription" },
  { id: "a3", name: "Marta Lindqvist", initials: "ML", action: "requested a refund", detail: "Order #10451 · $62.50", time: "42 min ago", kind: "refund" },
  { id: "a4", name: "Kenji Watanabe", initials: "KW", action: "created an account", detail: "Via email invitation", time: "1 hr ago", kind: "signup" },
  { id: "a5", name: "Checkout service", initials: "CS", action: "reported elevated latency", detail: "p95 at 1.8s in eu-west", time: "2 hr ago", kind: "alert" },
  { id: "a6", name: "Amara Johnson", initials: "AJ", action: "left a 5-star review", detail: "“Fast shipping, great quality.”", time: "3 hr ago", kind: "review" },
];

/* -------------------------------------------------------------------------- */
/* Chart configs                                                              */
/* -------------------------------------------------------------------------- */

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  sessions: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelConfig = {
  orders: { label: "Orders", color: "var(--chart-2)" },
  returns: { label: "Returns", color: "var(--chart-4)" },
} satisfies ChartConfig;

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
};

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function TrendBadge({ change, invert }: { change: number; invert?: boolean }) {
  const up = change >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const text = `${up ? "+" : "−"}${Math.abs(change).toFixed(1)}%`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-0.5 tabular-nums",
        good
          ? "border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-600/30 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">
        {`${up ? "Up" : "Down"} ${Math.abs(change).toFixed(1)} percent, ${good ? "favorable" : "unfavorable"}`}
      </span>
    </Badge>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {kpi.label}
        </CardDescription>
        <CardAction>
          <TrendBadge change={kpi.change} invert={kpi.invert} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{kpi.comparison}</p>
      </CardFooter>
    </Card>
  );
}

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d");

  const kpis = KPIS_BY_RANGE[range];
  const traffic = TRAFFIC_BY_RANGE[range];
  const channels = CHANNELS_BY_RANGE[range];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Analytics overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Store performance for {RANGE_LABEL[range]}. Updated a few minutes ago.
            </p>
          </div>
          <Tabs
            value={range}
            onValueChange={(v) => setRange(v as RangeKey)}
            className="w-full sm:w-auto"
          >
            <TabsList aria-label="Date range" className="w-full sm:w-auto">
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="90d">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* KPI cards */}
        <section aria-label="Key metrics">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <li key={kpi.id}>
                <KpiCard kpi={kpi} />
              </li>
            ))}
          </ul>
        </section>

        {/* Charts */}
        <section
          aria-label="Charts"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Traffic</CardTitle>
              <CardDescription>
                Visitors and sessions over {RANGE_LABEL[range]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={trafficConfig}
                className="aspect-auto h-64 w-full sm:h-72"
                role="img"
                aria-label={`Line chart of visitors and sessions over ${RANGE_LABEL[range]}`}
              >
                <LineChart
                  accessibilityLayer
                  data={traffic}
                  margin={{ left: 4, right: 12, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={44}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="visitors"
                    type="monotone"
                    stroke="var(--color-visitors)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    dataKey="sessions"
                    type="monotone"
                    stroke="var(--color-sessions)"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by channel</CardTitle>
              <CardDescription>
                Orders and returns by acquisition channel over {RANGE_LABEL[range]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={channelConfig}
                className="aspect-auto h-64 w-full sm:h-72"
                role="img"
                aria-label={`Bar chart of orders and returns by channel over ${RANGE_LABEL[range]}`}
              >
                <BarChart
                  accessibilityLayer
                  data={channels}
                  margin={{ left: 4, right: 12, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="channel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={44}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
                  <Bar dataKey="returns" fill="var(--color-returns)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        {/* Recent activity */}
        <section aria-labelledby="recent-activity-heading">
          <Card>
            <CardHeader>
              <CardTitle id="recent-activity-heading">
                <h2>Recent activity</h2>
              </CardTitle>
              <CardDescription>
                The latest orders, sign-ups and system events across your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {ACTIVITIES.map((item) => {
                  const meta = ACTIVITY_META[item.kind];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 sm:items-center sm:gap-4"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs font-medium">
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          <span className="font-medium">{item.name}</span>{" "}
                          <span className="text-muted-foreground">
                            {item.action}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <Badge variant="secondary" className="gap-1">
                          <Icon className={meta.className} aria-hidden="true" />
                          {meta.label}
                        </Badge>
                        <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                          {item.time}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
```