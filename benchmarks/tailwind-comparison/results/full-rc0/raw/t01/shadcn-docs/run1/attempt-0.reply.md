I have what I need. I'll use Tabs for the time-range switch, which drives the line chart data. Cards, Badge, Avatar, and the chart primitives cover the rest.

```tsx
"use client";

import * as React from "react";
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
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Stat = {
  id: string;
  label: string;
  value: string;
  change: number; // percent, signed
  caption: string;
  icon: LucideIcon;
  /** Whether an increase is good (e.g. churn/refunds would be false). */
  upIsGood: boolean;
};

const stats: Stat[] = [
  {
    id: "revenue",
    label: "Total revenue",
    value: "$48,290",
    change: 12.4,
    caption: "vs. previous 30 days",
    icon: DollarSign,
    upIsGood: true,
  },
  {
    id: "subscribers",
    label: "Active subscribers",
    value: "3,842",
    change: 5.8,
    caption: "vs. previous 30 days",
    icon: Users,
    upIsGood: true,
  },
  {
    id: "orders",
    label: "Orders",
    value: "1,206",
    change: -3.2,
    caption: "vs. previous 30 days",
    icon: ShoppingCart,
    upIsGood: true,
  },
  {
    id: "refunds",
    label: "Refund rate",
    value: "1.9%",
    change: -0.6,
    caption: "vs. previous 30 days",
    icon: RefreshCw,
    upIsGood: false,
  },
];

type RangeKey = "7d" | "30d" | "90d";

type TrafficPoint = { label: string; visitors: number; signups: number };

const trafficByRange: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 2840, signups: 214 },
    { label: "Tue", visitors: 3120, signups: 238 },
    { label: "Wed", visitors: 3460, signups: 261 },
    { label: "Thu", visitors: 3290, signups: 247 },
    { label: "Fri", visitors: 3710, signups: 289 },
    { label: "Sat", visitors: 2480, signups: 176 },
    { label: "Sun", visitors: 2260, signups: 158 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 18240, signups: 1320 },
    { label: "Wk 2", visitors: 19870, signups: 1465 },
    { label: "Wk 3", visitors: 21410, signups: 1590 },
    { label: "Wk 4", visitors: 23060, signups: 1742 },
  ],
  "90d": [
    { label: "Jan", visitors: 61200, signups: 4380 },
    { label: "Feb", visitors: 66850, signups: 4920 },
    { label: "Mar", visitors: 74320, signups: 5610 },
  ],
};

const rangeDescriptions: Record<RangeKey, string> = {
  "7d": "Daily visitors and signups over the last 7 days",
  "30d": "Weekly visitors and signups over the last 30 days",
  "90d": "Monthly visitors and signups over the last 90 days",
};

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelData = [
  { channel: "Organic", revenue: 18400 },
  { channel: "Paid", revenue: 12750 },
  { channel: "Email", revenue: 9620 },
  { channel: "Referral", revenue: 5130 },
  { channel: "Social", revenue: 2390 },
];

const channelConfig = {
  revenue: { label: "Revenue ($)", color: "var(--chart-3)" },
} satisfies ChartConfig;

type ActivityKind = "signup" | "payment" | "upgrade" | "refund";

type Activity = {
  id: string;
  name: string;
  initials: string;
  description: string;
  time: string;
  amount?: string;
  kind: ActivityKind;
};

const kindMeta: Record<ActivityKind, { label: string; icon: LucideIcon }> = {
  signup: { label: "Signup", icon: UserPlus },
  payment: { label: "Payment", icon: CreditCard },
  upgrade: { label: "Upgrade", icon: Activity },
  refund: { label: "Refund", icon: RefreshCw },
};

const activities: Activity[] = [
  {
    id: "a1",
    name: "Priya Raman",
    initials: "PR",
    description: "Upgraded to the Team plan",
    time: "4 min ago",
    amount: "+$348.00",
    kind: "upgrade",
  },
  {
    id: "a2",
    name: "Marcus Oyelaran",
    initials: "MO",
    description: "Paid invoice #INV-2041",
    time: "22 min ago",
    amount: "+$129.00",
    kind: "payment",
  },
  {
    id: "a3",
    name: "Elena Vasquez",
    initials: "EV",
    description: "Created a new account",
    time: "1 hr ago",
    kind: "signup",
  },
  {
    id: "a4",
    name: "Tomasz Kowalski",
    initials: "TK",
    description: "Refund issued for order #8832",
    time: "2 hr ago",
    amount: "-$59.00",
    kind: "refund",
  },
  {
    id: "a5",
    name: "Aiko Tanaka",
    initials: "AT",
    description: "Paid invoice #INV-2038",
    time: "3 hr ago",
    amount: "+$899.00",
    kind: "payment",
  },
  {
    id: "a6",
    name: "Daniel Okafor",
    initials: "DO",
    description: "Created a new account",
    time: "5 hr ago",
    kind: "signup",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function isRangeKey(value: string): value is RangeKey {
  return value === "7d" || value === "30d" || value === "90d";
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ stat }: { stat: Stat }) {
  const positive = stat.change >= 0;
  const good = positive === stat.upIsGood;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
  const Icon = stat.icon;
  const direction = positive ? "up" : "down";
  const magnitude = Math.abs(stat.change).toFixed(1);

  return (
    <Card role="group" aria-labelledby={`stat-${stat.id}-label`}>
      <CardHeader>
        <CardDescription
          id={`stat-${stat.id}-label`}
          className="flex items-center gap-2"
        >
          <Icon className="size-4" aria-hidden="true" />
          {stat.label}
        </CardDescription>
        <CardTitle className="text-3xl leading-tight font-semibold tabular-nums">
          {stat.value}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={
              good
                ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-600/30 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300"
            }
          >
            <TrendIcon aria-hidden="true" />
            <span aria-hidden="true">
              {positive ? "+" : "-"}
              {magnitude}%
            </span>
            <span className="sr-only">
              {good ? "Improved" : "Worsened"}, {direction} {magnitude} percent
            </span>
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{stat.caption}</p>
      </CardContent>
    </Card>
  );
}

function TrafficCard() {
  const [range, setRange] = React.useState<RangeKey>("7d");
  const data = trafficByRange[range];

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle id="traffic-title">Traffic &amp; signups</CardTitle>
        <CardDescription>{rangeDescriptions[range]}</CardDescription>
        <CardAction>
          <Tabs
            value={range}
            onValueChange={(v) => {
              if (isRangeKey(v)) setRange(v);
            }}
          >
            <TabsList aria-label="Select time range">
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={trafficConfig}
          className="aspect-auto h-72 w-full"
          role="img"
          aria-label={`Line chart. ${rangeDescriptions[range]}.`}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
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
              tickMargin={8}
              width={44}
              tickFormatter={(v: number) => compact.format(v)}
            />
            <YAxis
              yAxisId="signups"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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

function ChannelCard() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Revenue by channel</CardTitle>
        <CardDescription>Last 30 days, by acquisition source</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={channelConfig}
          className="aspect-auto h-72 w-full"
          role="img"
          aria-label="Bar chart of revenue by acquisition channel over the last 30 days. Organic leads with $18,400, followed by Paid, Email, Referral and Social."
        >
          <BarChart
            accessibilityLayer
            data={channelData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="channel"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              tickFormatter={(v: number) => `$${compact.format(v)}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {channelConfig.revenue.label}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {typeof value === "number"
                          ? currency.format(value)
                          : String(value)}
                      </span>
                      <span className="sr-only">{String(name)}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
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
        <CardTitle id="activity-title">Recent activity</CardTitle>
        <CardDescription>Latest events across your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <ul aria-labelledby="activity-title" className="divide-y">
          {activities.map((item) => {
            const meta = kindMeta[item.kind];
            const KindIcon = meta.icon;
            const isNegative = item.amount?.startsWith("-");
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4"
              >
                <Avatar className="size-10">
                  <AvatarFallback className="text-xs font-medium">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.amount ? (
                    <span
                      className={
                        isNegative
                          ? "text-sm font-medium text-red-700 tabular-nums dark:text-red-300"
                          : "text-sm font-medium tabular-nums"
                      }
                    >
                      {item.amount}
                    </span>
                  ) : (
                    <Badge variant="secondary">
                      <KindIcon aria-hidden="true" />
                      {meta.label}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analytics overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance summary for Northwind Studio, updated a few minutes ago.
          </p>
        </header>

        <section
          aria-label="Key metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </section>

        <section
          aria-label="Charts"
          className="grid grid-cols-1 gap-4 lg:grid-cols-7"
        >
          <TrafficCard />
          <ChannelCard />
        </section>

        <section aria-label="Recent activity">
          <ActivityCard />
        </section>
      </main>
    </div>
  );
}
```