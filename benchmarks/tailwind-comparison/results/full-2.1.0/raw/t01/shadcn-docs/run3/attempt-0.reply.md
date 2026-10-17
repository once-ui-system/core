I have what I need. I'll use Tabs for the range switcher, the chart wrapper with Recharts v3, and Card, Badge and Avatar for the rest.

```tsx
"use client"

import * as React from "react"
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
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  RefreshCcw,
  ShoppingCart,
  Users,
  UserPlus,
  Activity,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

type RangeKey = "7d" | "30d" | "90d"

type Kpi = {
  id: string
  label: string
  value: string
  change: number
  /** When true, a decrease is a good thing (e.g. churn). */
  invertTrend?: boolean
  comparison: string
  icon: LucideIcon
}

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
}

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$48,215",
      change: 4.2,
      comparison: "vs. previous 7 days",
      icon: DollarSign,
    },
    {
      id: "subscribers",
      label: "Active subscribers",
      value: "12,486",
      change: 1.8,
      comparison: "vs. previous 7 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "New orders",
      value: "1,342",
      change: -2.6,
      comparison: "vs. previous 7 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "1.9%",
      change: -0.3,
      invertTrend: true,
      comparison: "vs. previous 7 days",
      icon: RefreshCcw,
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$212,840",
      change: 12.4,
      comparison: "vs. previous 30 days",
      icon: DollarSign,
    },
    {
      id: "subscribers",
      label: "Active subscribers",
      value: "12,486",
      change: 6.1,
      comparison: "vs. previous 30 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "New orders",
      value: "5,879",
      change: 3.7,
      comparison: "vs. previous 30 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.4%",
      change: 0.5,
      invertTrend: true,
      comparison: "vs. previous 30 days",
      icon: RefreshCcw,
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Total revenue",
      value: "$631,972",
      change: 18.9,
      comparison: "vs. previous 90 days",
      icon: DollarSign,
    },
    {
      id: "subscribers",
      label: "Active subscribers",
      value: "12,486",
      change: 14.3,
      comparison: "vs. previous 90 days",
      icon: Users,
    },
    {
      id: "orders",
      label: "New orders",
      value: "17,204",
      change: 9.2,
      comparison: "vs. previous 90 days",
      icon: ShoppingCart,
    },
    {
      id: "churn",
      label: "Churn rate",
      value: "2.7%",
      change: -0.4,
      invertTrend: true,
      comparison: "vs. previous 90 days",
      icon: RefreshCcw,
    },
  ],
}

type TrafficPoint = { label: string; visitors: number; signups: number }

const TRAFFIC: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 4210, signups: 182 },
    { label: "Tue", visitors: 4680, signups: 205 },
    { label: "Wed", visitors: 5120, signups: 231 },
    { label: "Thu", visitors: 4890, signups: 214 },
    { label: "Fri", visitors: 5460, signups: 262 },
    { label: "Sat", visitors: 3720, signups: 148 },
    { label: "Sun", visitors: 3490, signups: 137 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 28450, signups: 1190 },
    { label: "Wk 2", visitors: 31200, signups: 1342 },
    { label: "Wk 3", visitors: 29880, signups: 1276 },
    { label: "Wk 4", visitors: 34760, signups: 1518 },
    { label: "Wk 5", visitors: 36240, signups: 1604 },
  ],
  "90d": [
    { label: "Jan", visitors: 98400, signups: 4120 },
    { label: "Feb", visitors: 104750, signups: 4476 },
    { label: "Mar", visitors: 121300, signups: 5233 },
  ],
}

type ChannelPoint = { channel: string; revenue: number; orders: number }

const CHANNELS: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { channel: "Organic", revenue: 14200, orders: 402 },
    { channel: "Paid", revenue: 11850, orders: 318 },
    { channel: "Email", revenue: 9640, orders: 287 },
    { channel: "Referral", revenue: 7120, orders: 204 },
    { channel: "Social", revenue: 5405, orders: 131 },
  ],
  "30d": [
    { channel: "Organic", revenue: 66400, orders: 1834 },
    { channel: "Paid", revenue: 52900, orders: 1402 },
    { channel: "Email", revenue: 43150, orders: 1291 },
    { channel: "Referral", revenue: 31280, orders: 872 },
    { channel: "Social", revenue: 19110, orders: 480 },
  ],
  "90d": [
    { channel: "Organic", revenue: 198300, orders: 5410 },
    { channel: "Paid", revenue: 158600, orders: 4188 },
    { channel: "Email", revenue: 127450, orders: 3802 },
    { channel: "Referral", revenue: 90240, orders: 2511 },
    { channel: "Social", revenue: 57382, orders: 1293 },
  ],
}

type ActivityKind = "payment" | "signup" | "refund" | "upgrade" | "alert"

type ActivityItem = {
  id: string
  name: string
  initials: string
  description: string
  time: string
  amount?: string
  kind: ActivityKind
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    name: "Priya Raman",
    initials: "PR",
    description: "Upgraded to the Business plan (annual)",
    time: "4 min ago",
    amount: "+$1,188.00",
    kind: "upgrade",
  },
  {
    id: "a2",
    name: "Tomás Herrera",
    initials: "TH",
    description: "Payment received for invoice #INV-20418",
    time: "17 min ago",
    amount: "+$249.00",
    kind: "payment",
  },
  {
    id: "a3",
    name: "Amelia Brooks",
    initials: "AB",
    description: "Created a new workspace account",
    time: "42 min ago",
    kind: "signup",
  },
  {
    id: "a4",
    name: "Kenji Watanabe",
    initials: "KW",
    description: "Refund issued for order #58213",
    time: "1 hr ago",
    amount: "-$79.00",
    kind: "refund",
  },
  {
    id: "a5",
    name: "Billing monitor",
    initials: "BM",
    description: "3 card payments failed and will be retried tonight",
    time: "2 hr ago",
    kind: "alert",
  },
  {
    id: "a6",
    name: "Sofia Lindqvist",
    initials: "SL",
    description: "Payment received for invoice #INV-20411",
    time: "3 hr ago",
    amount: "+$590.00",
    kind: "payment",
  },
]

const ACTIVITY_META: Record<
  ActivityKind,
  { label: string; icon: LucideIcon; badge: "default" | "secondary" | "destructive" | "outline" }
> = {
  payment: { label: "Payment", icon: CreditCard, badge: "secondary" },
  signup: { label: "Sign-up", icon: UserPlus, badge: "outline" },
  refund: { label: "Refund", icon: RefreshCcw, badge: "outline" },
  upgrade: { label: "Upgrade", icon: ArrowUpRight, badge: "default" },
  alert: { label: "Alert", icon: Activity, badge: "destructive" },
}

/* -------------------------------------------------------------------------- */
/*                                Chart configs                               */
/* -------------------------------------------------------------------------- */

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Sign-ups", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

/* -------------------------------------------------------------------------- */
/*                                 Formatters                                 */
/* -------------------------------------------------------------------------- */

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

function TrendBadge({
  change,
  invertTrend = false,
}: {
  change: number
  invertTrend?: boolean
}) {
  const isUp = change >= 0
  const isGood = invertTrend ? !isUp : isUp
  const Icon = isUp ? ArrowUpRight : ArrowDownRight
  const text = `${isUp ? "+" : "−"}${Math.abs(change).toFixed(1)}%`
  const spoken = `${isUp ? "Up" : "Down"} ${Math.abs(change).toFixed(1)} percent, ${
    isGood ? "an improvement" : "a decline"
  }`

  return (
    <Badge
      variant="outline"
      className={
        isGood
          ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-600/30 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300"
      }
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{spoken}</span>
    </Badge>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {kpi.label}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card-header:text-3xl">
          {kpi.value}
        </CardTitle>
        <CardAction>
          <TrendBadge change={kpi.change} invertTrend={kpi.invertTrend} />
        </CardAction>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        {kpi.comparison}
      </CardFooter>
    </Card>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.kind]
  const Icon = meta.icon
  const isNegative = item.amount?.startsWith("-")

  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Avatar>
        <AvatarFallback aria-hidden="true">{item.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <Badge variant={meta.badge} className="text-[11px]">
            <Icon aria-hidden="true" />
            {meta.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {item.description}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {item.amount ? (
          <p
            className={`text-sm font-medium tabular-nums ${
              isNegative ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            {item.amount}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">{item.time}</p>
      </div>
    </li>
  )
}

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d")

  const kpis = KPIS[range]
  const traffic = TRAFFIC[range]
  const channels = CHANNELS[range]

  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0)
  const topChannel = channels.reduce((best, c) =>
    c.revenue > best.revenue ? c : best
  )

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analytics overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Revenue, traffic and customer activity for Northwind Cloud.
          </p>
        </div>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(value as RangeKey)}
        >
          <TabsList aria-label="Select reporting period">
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* KPI cards */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key metrics, {RANGE_LABELS[range].toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
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
            <CardTitle id="traffic-title">Traffic &amp; sign-ups</CardTitle>
            <CardDescription>
              Visitors and new sign-ups, {RANGE_LABELS[range].toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trafficConfig}
              className="aspect-auto h-[280px] w-full"
              role="img"
              aria-labelledby="traffic-title"
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
                  tickMargin={10}
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
                  hide
                  domain={[0, "dataMax + 100"]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  yAxisId="visitors"
                  dataKey="visitors"
                  type="monotone"
                  stroke="var(--color-visitors)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-visitors)" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="signups"
                  dataKey="signups"
                  type="monotone"
                  stroke="var(--color-signups)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-signups)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Sign-ups are plotted on a separate, hidden scale so both trends are
            visible.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle id="channel-title">Revenue by channel</CardTitle>
            <CardDescription>
              {currency.format(totalRevenue)} total · {topChannel.channel} leads
              with {Math.round((topChannel.revenue / totalRevenue) * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={channelConfig}
              className="aspect-auto h-[280px] w-full"
              role="img"
              aria-labelledby="channel-title"
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
                  tickMargin={10}
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
                            {channelConfig[name as keyof typeof channelConfig]
                              ?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {currency.format(Number(value))}
                          </span>
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
          <CardFooter className="text-sm text-muted-foreground">
            Attributed on last-touch, net of refunds.
          </CardFooter>
        </Card>
      </section>

      {/* Recent activity */}
      <section aria-labelledby="activity-heading">
        <Card>
          <CardHeader>
            <CardTitle id="activity-heading" role="heading" aria-level={2}>
              Recent activity
            </CardTitle>
            <CardDescription>
              The latest payments, sign-ups and account events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y" aria-labelledby="activity-heading">
              {ACTIVITY.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
```