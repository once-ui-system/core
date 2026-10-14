I'll write the page using Tabs for the range switch, since that is semantically clean.

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
  RefreshCw,
  ShoppingCart,
  UserPlus,
  Users,
  Activity,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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

/* ----------------------------- Data ----------------------------- */

type Kpi = {
  id: string;
  label: string;
  value: string;
  change: number;
  /** For metrics where a decrease is good (e.g. churn). */
  invertGood?: boolean;
  caption: string;
  icon: LucideIcon;
};

const KPIS: Kpi[] = [
  {
    id: "revenue",
    label: "Total revenue",
    value: "$48,290",
    change: 12.4,
    caption: "vs. previous 30 days",
    icon: DollarSign,
  },
  {
    id: "subscribers",
    label: "Active subscribers",
    value: "2,847",
    change: 8.1,
    caption: "vs. previous 30 days",
    icon: Users,
  },
  {
    id: "orders",
    label: "Orders",
    value: "1,326",
    change: -3.2,
    caption: "vs. previous 30 days",
    icon: ShoppingCart,
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "2.4%",
    change: -0.6,
    invertGood: true,
    caption: "vs. previous 30 days",
    icon: Activity,
  },
];

type RangeKey = "7d" | "30d" | "90d";

type TrafficPoint = { label: string; visitors: number; signups: number };

const TRAFFIC: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 3120, signups: 142 },
    { label: "Tue", visitors: 3480, signups: 168 },
    { label: "Wed", visitors: 3290, signups: 151 },
    { label: "Thu", visitors: 3910, signups: 187 },
    { label: "Fri", visitors: 4230, signups: 214 },
    { label: "Sat", visitors: 2760, signups: 119 },
    { label: "Sun", visitors: 2540, signups: 108 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 21400, signups: 980 },
    { label: "Wk 2", visitors: 23150, signups: 1075 },
    { label: "Wk 3", visitors: 22380, signups: 1012 },
    { label: "Wk 4", visitors: 25720, signups: 1204 },
    { label: "Wk 5", visitors: 27310, signups: 1291 },
  ],
  "90d": [
    { label: "Jan", visitors: 82400, signups: 3720 },
    { label: "Feb", visitors: 91250, signups: 4180 },
    { label: "Mar", visitors: 103900, signups: 4890 },
  ],
};

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
};

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Sign-ups", color: "var(--chart-2)" },
} satisfies ChartConfig;

const CHANNELS = [
  { channel: "Organic", revenue: 18400 },
  { channel: "Paid", revenue: 12750 },
  { channel: "Email", revenue: 8920 },
  { channel: "Referral", revenue: 5310 },
  { channel: "Social", revenue: 2910 },
];

const channelConfig = {
  revenue: { label: "Revenue", color: "var(--chart-3)" },
} satisfies ChartConfig;

type ActivityType = "signup" | "payment" | "order" | "refund" | "alert";

type ActivityItem = {
  id: string;
  name: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  type: ActivityType;
};

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    name: "Priya Raman",
    initials: "PR",
    action: "upgraded to the Team plan",
    detail: "+$79.00 / month",
    time: "4 min ago",
    type: "payment",
  },
  {
    id: "a2",
    name: "Daniel Okafor",
    initials: "DO",
    action: "placed order #10482",
    detail: "3 items · $214.50",
    time: "18 min ago",
    type: "order",
  },
  {
    id: "a3",
    name: "Marta Lindqvist",
    initials: "ML",
    action: "created a new account",
    detail: "Referred by newsletter",
    time: "42 min ago",
    type: "signup",
  },
  {
    id: "a4",
    name: "Tomás Herrera",
    initials: "TH",
    action: "requested a refund",
    detail: "Order #10461 · $59.00",
    time: "1 hr ago",
    type: "refund",
  },
  {
    id: "a5",
    name: "Billing system",
    initials: "BS",
    action: "flagged a failed payment",
    detail: "Card ending 4417 · retry scheduled",
    time: "2 hr ago",
    type: "alert",
  },
  {
    id: "a6",
    name: "Aiko Tanaka",
    initials: "AT",
    action: "renewed annual subscription",
    detail: "+$590.00",
    time: "3 hr ago",
    type: "payment",
  },
];

const ACTIVITY_META: Record<
  ActivityType,
  { icon: LucideIcon; label: string; className: string }
> = {
  signup: {
    icon: UserPlus,
    label: "Sign-up",
    className: "bg-chart-2/15 text-chart-2",
  },
  payment: {
    icon: CreditCard,
    label: "Payment",
    className: "bg-chart-1/15 text-chart-1",
  },
  order: {
    icon: ShoppingCart,
    label: "Order",
    className: "bg-muted text-foreground",
  },
  refund: {
    icon: RefreshCw,
    label: "Refund",
    className: "bg-muted text-foreground",
  },
  alert: {
    icon: TriangleAlert,
    label: "Alert",
    className: "bg-destructive/10 text-destructive",
  },
};

/* --------------------------- Components --------------------------- */

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatChange(change: number): string {
  const abs = Math.abs(change);
  return `${abs.toFixed(1)}%`;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change >= 0;
  const good = kpi.invertGood ? !up : up;
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
  const Icon = kpi.icon;

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {kpi.label}
        </CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className={cn(
              "gap-0.5",
              good
                ? "border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                : "border-destructive/30 text-destructive"
            )}
          >
            <TrendIcon aria-hidden="true" />
            <span aria-hidden="true">{formatChange(kpi.change)}</span>
            <span className="sr-only">
              {up ? "Up" : "Down"} {formatChange(kpi.change)},{" "}
              {good ? "favorable" : "unfavorable"}
            </span>
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-5">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{kpi.caption}</p>
      </CardContent>
    </Card>
  );
}

function TrafficChartCard() {
  const [range, setRange] = React.useState<RangeKey>("30d");
  const data = TRAFFIC[range];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          <h2>Traffic &amp; sign-ups</h2>
        </CardTitle>
        <CardDescription>
          Visitors and new sign-ups over the {RANGE_LABELS[range]}
        </CardDescription>
        <CardAction>
          <Tabs
            value={range}
            onValueChange={(value) => setRange(value as RangeKey)}
          >
            <TabsList aria-label="Select time range">
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={trafficConfig}
          className="aspect-auto h-[280px] w-full sm:h-[320px]"
          role="img"
          aria-label={`Line chart of visitors and sign-ups for the ${RANGE_LABELS[range]}`}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 4, right: 12, top: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              yAxisId="visitors"
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => compact.format(v)}
            />
            <YAxis
              yAxisId="signups"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v: number) => compact.format(v)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
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
  );
}

function ChannelChartCard() {
  const total = CHANNELS.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Revenue by channel</h2>
        </CardTitle>
        <CardDescription>
          {`$${total.toLocaleString("en-US")} total this month`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={channelConfig}
          className="aspect-auto h-[280px] w-full sm:h-[320px]"
          role="img"
          aria-label="Bar chart of revenue by acquisition channel"
        >
          <BarChart
            accessibilityLayer
            data={CHANNELS}
            layout="vertical"
            margin={{ left: 0, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="channel"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${compact.format(v)}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {String(item.payload?.channel ?? name)}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {`$${Number(value).toLocaleString("en-US")}`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={4}
              barSize={22}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Recent activity</h2>
        </CardTitle>
        <CardDescription>Latest events across your workspace</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Activity feed is up to date")}
          >
            <RefreshCw aria-hidden="true" />
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {ACTIVITY.map((item) => {
            const meta = ACTIVITY_META[item.type];
            const Icon = meta.icon;
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar>
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.name}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full",
                      meta.className
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{meta.label}</span>
                  </span>
                  <time className="text-xs whitespace-nowrap text-muted-foreground">
                    {item.time}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analytics overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance summary for the last 30 days, updated a few minutes ago.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("Report export started")}
        >
          Export report
        </Button>
      </header>

      <section aria-label="Key metrics">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((kpi) => (
            <li key={kpi.id}>
              <KpiCard kpi={kpi} />
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Charts"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <TrafficChartCard />
        <ChannelChartCard />
      </section>

      <section aria-label="Recent activity">
        <ActivityCard />
      </section>
    </main>
  );
}
```