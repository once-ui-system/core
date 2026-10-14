```tsx
"use client"

import * as React from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  MousePointerClick,
  RefreshCcw,
  UserPlus,
  Users,
  Activity as ActivityIcon,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Types & data                                                        */
/* ------------------------------------------------------------------ */

type RangeKey = "7d" | "30d" | "90d"

type Kpi = {
  id: string
  label: string
  value: string
  change: number // percent change vs previous period
  /** When true, a decrease is the desirable direction (e.g. bounce rate). */
  lowerIsBetter?: boolean
  icon: LucideIcon
}

type TrafficPoint = { label: string; visitors: number; sessions: number }
type ChannelPoint = { channel: string; signups: number; conversions: number }

type ActivityItem = {
  id: string
  name: string
  initials: string
  action: string
  detail: string
  time: string
  icon: LucideIcon
  tone: "default" | "success" | "warning"
}

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
}

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Revenue", value: "$18,420", change: 4.2, icon: DollarSign },
    { id: "users", label: "Active users", value: "3,284", change: 2.8, icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.84%", change: -0.6, icon: MousePointerClick },
    { id: "bounce", label: "Bounce rate", value: "41.2%", change: -1.9, lowerIsBetter: true, icon: RefreshCcw },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", value: "$84,930", change: 12.5, icon: DollarSign },
    { id: "users", label: "Active users", value: "12,846", change: 8.1, icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.62%", change: -0.4, icon: MousePointerClick },
    { id: "bounce", label: "Bounce rate", value: "42.7%", change: -3.2, lowerIsBetter: true, icon: RefreshCcw },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", value: "$241,780", change: 18.9, icon: DollarSign },
    { id: "users", label: "Active users", value: "31,052", change: 14.3, icon: Users },
    { id: "conversion", label: "Conversion rate", value: "3.51%", change: 0.9, icon: MousePointerClick },
    { id: "bounce", label: "Bounce rate", value: "44.1%", change: 2.1, lowerIsBetter: true, icon: RefreshCcw },
  ],
}

const TRAFFIC: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 2840, sessions: 3910 },
    { label: "Tue", visitors: 3120, sessions: 4280 },
    { label: "Wed", visitors: 3460, sessions: 4750 },
    { label: "Thu", visitors: 3290, sessions: 4490 },
    { label: "Fri", visitors: 3870, sessions: 5230 },
    { label: "Sat", visitors: 2610, sessions: 3480 },
    { label: "Sun", visitors: 2380, sessions: 3150 },
  ],
  "30d": [
    { label: "Week 1", visitors: 18420, sessions: 25130 },
    { label: "Week 2", visitors: 20180, sessions: 27640 },
    { label: "Week 3", visitors: 19650, sessions: 26810 },
    { label: "Week 4", visitors: 22940, sessions: 31220 },
  ],
  "90d": [
    { label: "Jan", visitors: 61200, sessions: 83400 },
    { label: "Feb", visitors: 66850, sessions: 90120 },
    { label: "Mar", visitors: 74310, sessions: 101560 },
  ],
}

const CHANNELS: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { channel: "Organic", signups: 142, conversions: 38 },
    { channel: "Paid", signups: 96, conversions: 31 },
    { channel: "Referral", signups: 64, conversions: 22 },
    { channel: "Email", signups: 78, conversions: 29 },
    { channel: "Social", signups: 51, conversions: 12 },
  ],
  "30d": [
    { channel: "Organic", signups: 612, conversions: 164 },
    { channel: "Paid", signups: 428, conversions: 141 },
    { channel: "Referral", signups: 276, conversions: 97 },
    { channel: "Email", signups: 334, conversions: 128 },
    { channel: "Social", signups: 219, conversions: 54 },
  ],
  "90d": [
    { channel: "Organic", signups: 1804, conversions: 492 },
    { channel: "Paid", signups: 1262, conversions: 410 },
    { channel: "Referral", signups: 803, conversions: 289 },
    { channel: "Email", signups: 977, conversions: 361 },
    { channel: "Social", signups: 648, conversions: 171 },
  ],
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    name: "Priya Raman",
    initials: "PR",
    action: "upgraded to the Business plan",
    detail: "$588.00 / year",
    time: "4 min ago",
    icon: CreditCard,
    tone: "success",
  },
  {
    id: "a2",
    name: "Marcus Oyelaran",
    initials: "MO",
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
    action: "payment failed",
    detail: "Card ending 4417 was declined",
    time: "42 min ago",
    icon: TriangleAlert,
    tone: "warning",
  },
  {
    id: "a4",
    name: "Tomás Herrera",
    initials: "TH",
    action: "connected the Stripe integration",
    detail: "Production environment",
    time: "1 hr ago",
    icon: ActivityIcon,
    tone: "default",
  },
  {
    id: "a5",
    name: "Aiko Tanaka",
    initials: "AT",
    action: "completed onboarding",
    detail: "Finished all 6 setup steps",
    time: "2 hr ago",
    icon: UserPlus,
    tone: "success",
  },
  {
    id: "a6",
    name: "Daniel Okafor",
    initials: "DO",
    action: "renewed the Starter plan",
    detail: "$144.00 / year",
    time: "3 hr ago",
    icon: CreditCard,
    tone: "success",
  },
]

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  sessions: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  signups: { label: "Sign-ups", color: "var(--chart-1)" },
  conversions: { label: "Conversions", color: "var(--chart-2)" },
} satisfies ChartConfig

const TONE_CLASS: Record<ActivityItem["tone"], string> = {
  default: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
}

const numberFormat = new Intl.NumberFormat("en-US")

function isRangeKey(value: string): value is RangeKey {
  return value === "7d" || value === "30d" || value === "90d"
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function TrendBadge({
  change,
  lowerIsBetter = false,
}: {
  change: number
  lowerIsBetter?: boolean
}) {
  const isUp = change >= 0
  const isGood = lowerIsBetter ? !isUp : isUp
  const Icon = isUp ? ArrowUpRight : ArrowDownRight
  const text = `${isUp ? "+" : "−"}${Math.abs(change).toFixed(1)}%`
  const description = `${isUp ? "Up" : "Down"} ${Math.abs(change).toFixed(1)} percent, ${
    isGood ? "favorable" : "unfavorable"
  } trend`

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-0.5 tabular-nums",
        isGood
          ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
          : "border-red-200 text-red-700 dark:border-red-900 dark:text-red-400"
      )}
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{description}</span>
    </Badge>
  )
}

function KpiCard({ kpi, range }: { kpi: Kpi; range: RangeKey }) {
  const Icon = kpi.icon
  return (
    <Card className="gap-3 py-5">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-4" />
          {kpi.label}
        </CardDescription>
        <CardAction>
          <TrendBadge change={kpi.change} lowerIsBetter={kpi.lowerIsBetter} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          vs. previous period · {RANGE_LABEL[range]}
        </p>
      </CardContent>
    </Card>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.icon
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Avatar aria-hidden="true">
        <AvatarFallback className="text-xs font-medium">
          {item.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="font-medium">{item.name}</span>{" "}
          <span className="text-muted-foreground">{item.action}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full",
            TONE_CLASS[item.tone]
          )}
        >
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
        <time className="text-xs whitespace-nowrap text-muted-foreground">
          {item.time}
        </time>
      </div>
    </li>
  )
}

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d")

  const kpis = KPIS[range]
  const traffic = TRAFFIC[range]
  const channels = CHANNELS[range]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance overview for Lumen, your product analytics workspace.
            </p>
          </div>
          <Tabs
            value={range}
            onValueChange={(value) => {
              if (isRangeKey(value)) setRange(value)
            }}
          >
            <TabsList aria-label="Select reporting period">
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
                <KpiCard kpi={kpi} range={range} />
              </li>
            ))}
          </ul>
        </section>

        {/* Charts + activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2>Traffic</h2>
              </CardTitle>
              <CardDescription>
                Visitors and sessions over the {RANGE_LABEL[range]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={trafficConfig}
                className="aspect-auto h-64 w-full sm:h-72"
                role="img"
                aria-label={`Line chart of visitors and sessions over the ${RANGE_LABEL[range]}`}
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
                    width={44}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
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
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
              <table className="sr-only">
                <caption>
                  Visitors and sessions over the {RANGE_LABEL[range]}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Visitors</th>
                    <th scope="col">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {traffic.map((p) => (
                    <tr key={p.label}>
                      <th scope="row">{p.label}</th>
                      <td>{numberFormat.format(p.visitors)}</td>
                      <td>{numberFormat.format(p.sessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>
                <h2>Recent activity</h2>
              </CardTitle>
              <CardDescription>Latest events across your accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {ACTIVITY.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2>Acquisition by channel</h2>
              </CardTitle>
              <CardDescription>
                Sign-ups and conversions over the {RANGE_LABEL[range]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={channelConfig}
                className="aspect-auto h-64 w-full sm:h-72"
                role="img"
                aria-label={`Bar chart of sign-ups and conversions by channel over the ${RANGE_LABEL[range]}`}
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
                    width={44}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="signups"
                    fill="var(--color-signups)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="conversions"
                    fill="var(--color-conversions)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <table className="sr-only">
                <caption>
                  Sign-ups and conversions by channel over the{" "}
                  {RANGE_LABEL[range]}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Channel</th>
                    <th scope="col">Sign-ups</th>
                    <th scope="col">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((c) => (
                    <tr key={c.channel}>
                      <th scope="row">{c.channel}</th>
                      <td>{numberFormat.format(c.signups)}</td>
                      <td>{numberFormat.format(c.conversions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
```