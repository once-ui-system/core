"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
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
  RefreshCw,
  ShoppingCart,
  UserPlus,
  Users,
  Activity as ActivityIcon,
  TriangleAlert,
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
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type RangeKey = "7d" | "30d" | "90d";

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number; // percent, signed
  /** For metrics where a decrease is good (e.g. churn, refunds). */
  invertGood?: boolean;
  hint: string;
  icon: LucideIcon;
};

type TrafficPoint = {
  label: string;
  visitors: number;
  signups: number;
};

type ChannelPoint = {
  channel: string;
  revenue: number;
};

type ActivityItem = {
  id: string;
  name: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: "default" | "success" | "warning";
};

/* -------------------------------------------------------------------------- */
/*                               Placeholder data                             */
/* -------------------------------------------------------------------------- */

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$48,290",
      change: 8.2,
      hint: "vs. previous 7 days",
      icon: DollarSign,
    },
    {
      id: "customers",
      label: "New customers",
      value: "412",
      change: 4.6,
      hint: "vs. previous 7 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "Orders",
      value: "1,284",
      change: -2.1,
      hint: "vs. previous 7 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.4%",
      change: -0.6,
      invertGood: true,
      hint: "vs. previous 7 days",
      icon: ActivityIcon,
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$214,830",
      change: 12.5,
      hint: "vs. previous 30 days",
      icon: DollarSign,
    },
    {
      id: "customers",
      label: "New customers",
      value: "1,846",
      change: 9.3,
      hint: "vs. previous 30 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "Orders",
      value: "5,972",
      change: 3.8,
      hint: "vs. previous 30 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.9%",
      change: 0.4,
      invertGood: true,
      hint: "vs. previous 30 days",
      icon: ActivityIcon,
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$631,470",
      change: 18.9,
      hint: "vs. previous 90 days",
      icon: DollarSign,
    },
    {
      id: "customers",
      label: "New customers",
      value: "5,214",
      change: 14.2,
      hint: "vs. previous 90 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "Orders",
      value: "17,408",
      change: 6.7,
      hint: "vs. previous 90 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "3.1%",
      change: -0.2,
      invertGood: true,
      hint: "vs. previous 90 days",
      icon: ActivityIcon,
    },
  ],
};

const TRAFFIC: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 4120, signups: 182 },
    { label: "Tue", visitors: 4580, signups: 214 },
    { label: "Wed", visitors: 4390, signups: 201 },
    { label: "Thu", visitors: 5230, signups: 248 },
    { label: "Fri", visitors: 5610, signups: 273 },
    { label: "Sat", visitors: 3470, signups: 149 },
    { label: "Sun", visitors: 3180, signups: 131 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 24800, signups: 1120 },
    { label: "Wk 2", visitors: 27350, signups: 1294 },
    { label: "Wk 3", visitors: 26100, signups: 1187 },
    { label: "Wk 4", visitors: 29940, signups: 1436 },
    { label: "Wk 5", visitors: 31260, signups: 1519 },
  ],
  "90d": [
    { label: "Jan", visitors: 86400, signups: 3920 },
    { label: "Feb", visitors: 92150, signups: 4310 },
    { label: "Mar", visitors: 104700, signups: 5086 },
  ],
};

const CHANNELS: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { channel: "Organic", revenue: 14200 },
    { channel: "Paid", revenue: 11850 },
    { channel: "Email", revenue: 9640 },
    { channel: "Referral", revenue: 7120 },
    { channel: "Social", revenue: 5480 },
  ],
  "30d": [
    { channel: "Organic", revenue: 66400 },
    { channel: "Paid", revenue: 52900 },
    { channel: "Email", revenue: 41350 },
    { channel: "Referral", revenue: 29800 },
    { channel: "Social", revenue: 24380 },
  ],
  "90d": [
    { channel: "Organic", revenue: 194200 },
    { channel: "Paid", revenue: 158700 },
    { channel: "Email", revenue: 121400 },
    { channel: "Referral", revenue: 85900 },
    { channel: "Social", revenue: 71270 },
  ],
};

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    name: "Priya Raman",
    initials: "PR",
    action: "upgraded to the Business plan",
    detail: "$1,188 / year",
    time: "4 min ago",
    icon: CreditCard,
    tone: "success",
  },
  {
    id: "a2",
    name: "Marcus Webb",
    initials: "MW",
    action: "created a new workspace",
    detail: "Northwind Logistics",
    time: "18 min ago",
    icon: UserPlus,
    tone: "default",
  },
  {
    id: "a3",
    name: "Elena Fischer",
    initials: "EF",
    action: "requested a refund",
    detail: "Order #48213 · $249.00",
    time: "42 min ago",
    icon: RefreshCw,
    tone: "warning",
  },
  {
    id: "a4",
    name: "Tomasz Kowalski",
    initials: "TK",
    action: "placed an order",
    detail: "Order #48212 · $86.40",
    time: "1 hr ago",
    icon: ShoppingCart,
    tone: "default",
  },
  {
    id: "a5",
    name: "Amara Okafor",
    initials: "AO",
    action: "payment failed on renewal",
    detail: "Card ending 4417",
    time: "2 hr ago",
    icon: TriangleAlert,
    tone: "warning",
  },
  {
    id: "a6",
    name: "Daniel Park",
    initials: "DP",
    action: "invited 6 teammates",
    detail: "Brightside Studio",
    time: "3 hr ago",
    icon: UserPlus,
    tone: "default",
  },
];

/* -------------------------------------------------------------------------- */
/*                                Chart configs                               */
/* -------------------------------------------------------------------------- */

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Sign-ups", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelConfig = {
  revenue: { label: "Revenue", color: "var(--chart-3)" },
} satisfies ChartConfig;

/* -------------------------------------------------------------------------- */
/*                                  Formatters                                */
/* -------------------------------------------------------------------------- */

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

function TrendBadge({
  change,
  invertGood = false,
}: {
  change: number;
  invertGood?: boolean;
}) {
  const up = change >= 0;
  const good = invertGood ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const magnitude = `${Math.abs(change).toFixed(1)}%`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-0.5 tabular-nums",
        good
          ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-600/30 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300",
      )}
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">{up ? "+" : "−"}{magnitude}</span>
      <span className="sr-only">
        {up ? "Up" : "Down"} {magnitude}, {good ? "favorable" : "unfavorable"}
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
          <TrendBadge change={kpi.change} invertGood={kpi.invertGood} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{kpi.hint}</p>
      </CardFooter>
    </Card>
  );
}

const toneClasses: Record<ActivityItem["tone"], string> = {
  default: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.icon;
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="relative shrink-0">
        <Avatar>
          <AvatarFallback className="text-xs font-medium">
            {item.initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full ring-2 ring-card",
            toneClasses[item.tone],
          )}
          aria-hidden="true"
        >
          <Icon className="size-2.5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="font-medium">{item.name}</span>{" "}
          <span className="text-muted-foreground">{item.action}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
      </div>
      <time className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
        {item.time}
      </time>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d");

  const kpis = KPIS[range];
  const traffic = TRAFFIC[range];
  const channels = CHANNELS[range];

  const totalChannelRevenue = React.useMemo(
    () => channels.reduce((sum, c) => sum + c.revenue, 0),
    [channels],
  );
  const topChannel = React.useMemo(
    () =>
      channels.reduce((best, c) => (c.revenue > best.revenue ? c : best)),
    [channels],
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Analytics overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance for Acme Storefront · Updated today at 9:41 AM
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={range}
            onValueChange={(value) => {
              if (value === "7d" || value === "30d" || value === "90d") {
                setRange(value);
              }
            }}
            aria-label="Select time range"
            className="self-start sm:self-auto"
          >
            <ToggleGroupItem value="7d" aria-label={RANGE_LABELS["7d"]}>
              7D
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" aria-label={RANGE_LABELS["30d"]}>
              30D
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" aria-label={RANGE_LABELS["90d"]}>
              90D
            </ToggleGroupItem>
          </ToggleGroup>
        </header>

        {/* KPI cards */}
        <section
          aria-labelledby="kpi-heading"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <h2 id="kpi-heading" className="sr-only">
            Key metrics, {RANGE_LABELS[range].toLowerCase()}
          </h2>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        {/* Charts */}
        <section
          aria-labelledby="charts-heading"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <h2 id="charts-heading" className="sr-only">
            Traffic and revenue charts
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>
                <h3>Traffic &amp; sign-ups</h3>
              </CardTitle>
              <CardDescription>
                {RANGE_LABELS[range]} · visitors and new sign-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={trafficConfig}
                className="aspect-auto h-64 w-full sm:h-72"
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
                    minTickGap={16}
                  />
                  <YAxis
                    yAxisId="visitors"
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) => compactNumber.format(v)}
                  />
                  <YAxis
                    yAxisId="signups"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v: number) => compactNumber.format(v)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="visitors"
                    dataKey="visitors"
                    type="monotone"
                    stroke="var(--color-visitors)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="signups"
                    dataKey="signups"
                    type="monotone"
                    stroke="var(--color-signups)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h3>Revenue by channel</h3>
              </CardTitle>
              <CardDescription>
                {RANGE_LABELS[range]} · {currency.format(totalChannelRevenue)}{" "}
                total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={channelConfig}
                className="aspect-auto h-64 w-full sm:h-72"
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
                    minTickGap={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v: number) => `$${compactNumber.format(v)}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              {channelConfig[
                                name as keyof typeof channelConfig
                              ]?.label ?? name}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {typeof value === "number"
                                ? currency.format(value)
                                : String(value)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  {topChannel.channel}
                </span>{" "}
                leads with{" "}
                {Math.round((topChannel.revenue / totalChannelRevenue) * 100)}%
                of revenue.
              </p>
            </CardFooter>
          </Card>
        </section>

        {/* Activity + secondary area chart */}
        <section
          aria-labelledby="activity-heading"
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2 id="activity-heading">Recent activity</h2>
              </CardTitle>
              <CardDescription>
                Latest customer and billing events across your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {ACTIVITY.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Sign-up momentum</h2>
              </CardTitle>
              <CardDescription>
                Cumulative sign-ups, {RANGE_LABELS[range].toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cumulative: {
                    label: "Cumulative sign-ups",
                    color: "var(--chart-2)",
                  },
                }}
                className="aspect-auto h-48 w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={traffic.reduce<{ label: string; cumulative: number }[]>(
                    (acc, point) => {
                      const prev = acc.length
                        ? acc[acc.length - 1].cumulative
                        : 0;
                      acc.push({
                        label: point.label,
                        cumulative: prev + point.signups,
                      });
                      return acc;
                    },
                    [],
                  )}
                  margin={{ left: 4, right: 4, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={16}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="cumulative"
                    type="monotone"
                    stroke="var(--color-cumulative)"
                    fill="var(--color-cumulative)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <Separator className="mx-6 w-auto" />
            <CardFooter className="justify-between text-sm">
              <span className="text-muted-foreground">Period total</span>
              <span className="font-semibold tabular-nums">
                {traffic
                  .reduce((sum, p) => sum + p.signups, 0)
                  .toLocaleString("en-US")}
              </span>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
