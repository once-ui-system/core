"use client"

import * as React from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  RefreshCw,
  UserPlus,
  Users,
  Activity,
  ShoppingCart,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

type RangeKey = "7d" | "30d" | "90d"

type Kpi = {
  id: string
  label: string
  value: string
  change: number
  /** When true, a negative change is good (e.g. churn). */
  invert?: boolean
  note: string
  icon: LucideIcon
}

const RANGES: { value: RangeKey; label: string; long: string }[] = [
  { value: "7d", label: "7 days", long: "the last 7 days" },
  { value: "30d", label: "30 days", long: "the last 30 days" },
  { value: "90d", label: "90 days", long: "the last 90 days" },
]

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Total revenue", value: "$48,230", change: 8.2, note: "vs. previous 7 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,486", change: 3.1, note: "vs. previous 7 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.84%", change: -0.6, note: "vs. previous 7 days", icon: ShoppingCart },
    { id: "churn", label: "Churn rate", value: "1.92%", change: -0.3, invert: true, note: "vs. previous 7 days", icon: Activity },
  ],
  "30d": [
    { id: "revenue", label: "Total revenue", value: "$214,870", change: 12.4, note: "vs. previous 30 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,486", change: 9.7, note: "vs. previous 30 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.91%", change: 1.2, note: "vs. previous 30 days", icon: ShoppingCart },
    { id: "churn", label: "Churn rate", value: "2.14%", change: 0.4, invert: true, note: "vs. previous 30 days", icon: Activity },
  ],
  "90d": [
    { id: "revenue", label: "Total revenue", value: "$631,405", change: 18.9, note: "vs. previous 90 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,486", change: 21.3, note: "vs. previous 90 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "3.67%", change: -0.2, note: "vs. previous 90 days", icon: ShoppingCart },
    { id: "churn", label: "Churn rate", value: "2.31%", change: -0.5, invert: true, note: "vs. previous 90 days", icon: Activity },
  ],
}

const TRAFFIC: Record<RangeKey, { label: string; visitors: number; signups: number }[]> = {
  "7d": [
    { label: "Mon", visitors: 4120, signups: 182 },
    { label: "Tue", visitors: 4580, signups: 205 },
    { label: "Wed", visitors: 4390, signups: 196 },
    { label: "Thu", visitors: 5010, signups: 231 },
    { label: "Fri", visitors: 5320, signups: 247 },
    { label: "Sat", visitors: 3640, signups: 138 },
    { label: "Sun", visitors: 3290, signups: 121 },
  ],
  "30d": [
    { label: "Wk 1", visitors: 28400, signups: 1210 },
    { label: "Wk 2", visitors: 30150, signups: 1342 },
    { label: "Wk 3", visitors: 29620, signups: 1288 },
    { label: "Wk 4", visitors: 33780, signups: 1507 },
  ],
  "90d": [
    { label: "Jan", visitors: 112400, signups: 4820 },
    { label: "Feb", visitors: 118900, signups: 5190 },
    { label: "Mar", visitors: 131250, signups: 5874 },
  ],
}

const CHANNELS: Record<RangeKey, { channel: string; current: number; previous: number }[]> = {
  "7d": [
    { channel: "Organic", current: 9400, previous: 8700 },
    { channel: "Paid", current: 6100, previous: 6400 },
    { channel: "Referral", current: 3800, previous: 3300 },
    { channel: "Email", current: 4700, previous: 4100 },
    { channel: "Social", current: 2350, previous: 2500 },
  ],
  "30d": [
    { channel: "Organic", current: 41200, previous: 36800 },
    { channel: "Paid", current: 27500, previous: 28900 },
    { channel: "Referral", current: 15900, previous: 13700 },
    { channel: "Email", current: 19800, previous: 17300 },
    { channel: "Social", current: 10300, previous: 11100 },
  ],
  "90d": [
    { channel: "Organic", current: 122000, previous: 104500 },
    { channel: "Paid", current: 81300, previous: 79800 },
    { channel: "Referral", current: 47200, previous: 39600 },
    { channel: "Email", current: 58400, previous: 50200 },
    { channel: "Social", current: 31700, previous: 33900 },
  ],
}

type ActivityTone = "positive" | "neutral" | "warning"

type ActivityItem = {
  id: string
  initials: string
  name: string
  action: string
  detail: string
  time: string
  icon: LucideIcon
  tone: ActivityTone
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    initials: "MO",
    name: "Maya Okafor",
    action: "upgraded to the Business plan",
    detail: "+$149/mo",
    time: "4 min ago",
    icon: CreditCard,
    tone: "positive",
  },
  {
    id: "a2",
    initials: "LH",
    name: "Lukas Hoffmann",
    action: "started a 14-day trial",
    detail: "Team plan",
    time: "22 min ago",
    icon: UserPlus,
    tone: "neutral",
  },
  {
    id: "a3",
    initials: "PS",
    name: "Priya Sharma",
    action: "payment failed for invoice #INV-2093",
    detail: "$89.00",
    time: "1 hr ago",
    icon: TriangleAlert,
    tone: "warning",
  },
  {
    id: "a4",
    initials: "DC",
    name: "Daniel Costa",
    action: "renewed annual subscription",
    detail: "+$1,188",
    time: "3 hr ago",
    icon: RefreshCw,
    tone: "positive",
  },
  {
    id: "a5",
    initials: "EN",
    name: "Elena Novak",
    action: "invited 5 teammates to the workspace",
    detail: "Business plan",
    time: "5 hr ago",
    icon: Users,
    tone: "neutral",
  },
  {
    id: "a6",
    initials: "JW",
    name: "Jamal Williams",
    action: "requested a refund for order #8841",
    detail: "$49.00",
    time: "Yesterday",
    icon: TriangleAlert,
    tone: "warning",
  },
]

const TONE_STYLES: Record<ActivityTone, string> = {
  positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Sign-ups", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  current: { label: "Current period", color: "var(--chart-1)" },
  previous: { label: "Previous period", color: "var(--chart-3)" },
} satisfies ChartConfig

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change > 0
  const good = kpi.invert ? !up : up
  const TrendIcon = up ? ArrowUpRight : ArrowDownRight
  const Icon = kpi.icon
  const magnitude = Math.abs(kpi.change)
  const trendText = `${up ? "Up" : "Down"} ${magnitude}% ${kpi.note}${good ? ", favorable" : ", unfavorable"}`

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {kpi.label}
        </CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className={cn(
              "gap-0.5 tabular-nums",
              good
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            <TrendIcon aria-hidden="true" />
            <span aria-hidden="true">{up ? "+" : "-"}{magnitude}%</span>
            <span className="sr-only">{trendText}</span>
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{kpi.value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{kpi.note}</p>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d")
  const rangeMeta = RANGES.find((r) => r.value === range) ?? RANGES[1]

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics overview</h1>
            <p className="text-sm text-muted-foreground">
              Performance for {rangeMeta.long}. Last synced today at 09:41.
            </p>
          </div>
          <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <TabsList aria-label="Select time range">
              {RANGES.map((r) => (
                <TabsTrigger key={r.value} value={r.value} className="px-3">
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>

        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Key metrics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPIS[range].map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </section>

        <section aria-labelledby="charts-heading" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <h2 id="charts-heading" className="sr-only">
            Charts
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Traffic &amp; sign-ups</CardTitle>
              <CardDescription>Visitors and new sign-ups over {rangeMeta.long}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={trafficConfig}
                className="aspect-auto h-72 w-full"
                role="img"
                aria-label={`Line chart of visitors and sign-ups over ${rangeMeta.long}`}
              >
                <LineChart accessibilityLayer data={TRAFFIC[range]} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) => formatCompact(v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) => formatCompact(v)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="left"
                    dataKey="visitors"
                    type="monotone"
                    stroke="var(--color-visitors)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
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
              <CardTitle>Visitors by channel</CardTitle>
              <CardDescription>Current vs. previous period over {rangeMeta.long}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={channelConfig}
                className="aspect-auto h-72 w-full"
                role="img"
                aria-label={`Bar chart comparing visitors by acquisition channel over ${rangeMeta.long}`}
              >
                <BarChart accessibilityLayer data={CHANNELS[range]} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="channel" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) => formatCompact(v)}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="previous" fill="var(--color-previous)" radius={4} />
                  <Bar dataKey="current" fill="var(--color-current)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="activity-heading">
          <Card>
            <CardHeader>
              <CardTitle id="activity-heading">Recent activity</CardTitle>
              <CardDescription>Latest customer and billing events across your workspace</CardDescription>
              <CardAction>
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {ACTIVITY.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 sm:items-center">
                      <Avatar size="lg" className="hidden sm:flex">
                        <AvatarFallback aria-hidden="true">{item.initials}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full sm:hidden",
                          TONE_STYLES[item.tone]
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          <span className="font-medium">{item.name}</span>{" "}
                          <span className="text-muted-foreground">{item.action}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <time>{item.time}</time>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 tabular-nums", TONE_STYLES[item.tone], "border-transparent")}
                      >
                        <Icon aria-hidden="true" className="hidden sm:block" />
                        {item.detail}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
