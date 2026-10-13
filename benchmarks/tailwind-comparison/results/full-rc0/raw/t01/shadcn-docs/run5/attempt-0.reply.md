```tsx
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
  Activity as ActivityIcon,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type RangeKey = "7d" | "30d" | "90d"

type Kpi = {
  id: string
  label: string
  value: string
  change: number
  /** When true, a rising number is bad (e.g. churn). */
  invert?: boolean
  note: string
  icon: LucideIcon
}

const KPIS: Record<RangeKey, Kpi[]> = {
  "7d": [
    { id: "revenue", label: "Revenue", value: "$48,260", change: 8.2, note: "vs. previous 7 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,480", change: 3.1, note: "vs. previous 7 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "4.62%", change: -0.4, note: "vs. previous 7 days", icon: ActivityIcon },
    { id: "churn", label: "Churn rate", value: "1.8%", change: -0.3, invert: true, note: "vs. previous 7 days", icon: RefreshCw },
  ],
  "30d": [
    { id: "revenue", label: "Revenue", value: "$213,940", change: 12.4, note: "vs. previous 30 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,480", change: 9.7, note: "vs. previous 30 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "4.48%", change: 0.9, note: "vs. previous 30 days", icon: ActivityIcon },
    { id: "churn", label: "Churn rate", value: "2.1%", change: 0.2, invert: true, note: "vs. previous 30 days", icon: RefreshCw },
  ],
  "90d": [
    { id: "revenue", label: "Revenue", value: "$631,570", change: 18.9, note: "vs. previous 90 days", icon: DollarSign },
    { id: "subs", label: "Active subscribers", value: "12,480", change: 21.5, note: "vs. previous 90 days", icon: Users },
    { id: "conv", label: "Conversion rate", value: "4.31%", change: -1.2, note: "vs. previous 90 days", icon: ActivityIcon },
    { id: "churn", label: "Churn rate", value: "2.4%", change: 0.5, invert: true, note: "vs. previous 90 days", icon: RefreshCw },
  ],
}

type TrafficPoint = { label: string; visitors: number; signups: number }

const TRAFFIC: Record<RangeKey, TrafficPoint[]> = {
  "7d": [
    { label: "Mon", visitors: 4210, signups: 182 },
    { label: "Tue", visitors: 4680, signups: 205 },
    { label: "Wed", visitors: 5120, signups: 231 },
    { label: "Thu", visitors: 4890, signups: 214 },
    { label: "Fri", visitors: 5430, signups: 248 },
    { label: "Sat", visitors: 3760, signups: 163 },
    { label: "Sun", visitors: 3490, signups: 151 },
  ],
  "30d": [
    { label: "Week 1", visitors: 26400, signups: 1120 },
    { label: "Week 2", visitors: 28950, signups: 1275 },
    { label: "Week 3", visitors: 27310, signups: 1190 },
    { label: "Week 4", visitors: 31820, signups: 1460 },
  ],
  "90d": [
    { label: "Jan", visitors: 104200, signups: 4380 },
    { label: "Feb", visitors: 112600, signups: 4910 },
    { label: "Mar", visitors: 126800, signups: 5640 },
  ],
}

type ChannelPoint = { channel: string; current: number; previous: number }

const CHANNELS: Record<RangeKey, ChannelPoint[]> = {
  "7d": [
    { channel: "Organic", current: 14200, previous: 13100 },
    { channel: "Paid", current: 9800, previous: 10400 },
    { channel: "Referral", current: 6300, previous: 5200 },
    { channel: "Email", current: 5100, previous: 4700 },
    { channel: "Social", current: 3400, previous: 3600 },
  ],
  "30d": [
    { channel: "Organic", current: 61800, previous: 54300 },
    { channel: "Paid", current: 43200, previous: 45100 },
    { channel: "Referral", current: 28700, previous: 24900 },
    { channel: "Email", current: 22400, previous: 19800 },
    { channel: "Social", current: 15600, previous: 16200 },
  ],
  "90d": [
    { channel: "Organic", current: 182400, previous: 151200 },
    { channel: "Paid", current: 129500, previous: 128100 },
    { channel: "Referral", current: 84300, previous: 70800 },
    { channel: "Email", current: 66900, previous: 58300 },
    { channel: "Social", current: 47100, previous: 49800 },
  ],
}

type ActivityKind = "signup" | "payment" | "upgrade" | "refund" | "alert"

type ActivityItem = {
  id: string
  name: string
  initials: string
  action: string
  detail: string
  time: string
  kind: ActivityKind
}

const ACTIVITY: ActivityItem[] = [
  { id: "a1", name: "Priya Raman", initials: "PR", action: "upgraded to Business", detail: "Annual plan · $1,188", time: "4 min ago", kind: "upgrade" },
  { id: "a2", name: "Marcus Lindqvist", initials: "ML", action: "started a free trial", detail: "Referred by Northwind Labs", time: "18 min ago", kind: "signup" },
  { id: "a3", name: "Okafor & Sons", initials: "OS", action: "paid invoice #INV-2084", detail: "$3,450.00 via ACH", time: "42 min ago", kind: "payment" },
  { id: "a4", name: "Hannah Weiss", initials: "HW", action: "requested a refund", detail: "Order #58213 · $79.00", time: "1 hr ago", kind: "refund" },
  { id: "a5", name: "Billing service", initials: "BS", action: "retried a failed charge", detail: "3 cards pending retry", time: "2 hr ago", kind: "alert" },
  { id: "a6", name: "Diego Alvarez", initials: "DA", action: "joined the Team plan", detail: "8 seats · $232 / month", time: "3 hr ago", kind: "signup" },
]

const KIND_META: Record<ActivityKind, { label: string; icon: LucideIcon; className: string }> = {
  signup: { label: "Sign-up", icon: UserPlus, className: "bg-primary/10 text-primary" },
  payment: { label: "Payment", icon: CreditCard, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  upgrade: { label: "Upgrade", icon: ArrowUpRight, className: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  refund: { label: "Refund", icon: RefreshCw, className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  alert: { label: "Alert", icon: TriangleAlert, className: "bg-destructive/15 text-destructive" },
}

const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
}

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  signups: { label: "Sign-ups", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  current: { label: "This period", color: "var(--chart-1)" },
  previous: { label: "Previous period", color: "var(--chart-3)" },
} satisfies ChartConfig

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

function TrendBadge({ change, invert = false }: { change: number; invert?: boolean }) {
  const up = change >= 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  const direction = up ? "Up" : "Down"
  return (
    <Badge
      variant="outline"
      className={
        good
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">
        {up ? "+" : "−"}
        {Math.abs(change).toFixed(1)}%
      </span>
      <span className="sr-only">
        {direction} {Math.abs(change).toFixed(1)} percent, {good ? "favorable" : "unfavorable"}
      </span>
    </Badge>
  )
}

export default function Page() {
  const [range, setRange] = React.useState<RangeKey>("30d")

  const kpis = KPIS[range]
  const traffic = TRAFFIC[range]
  const channels = CHANNELS[range]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Performance overview for Lumen Cloud · updated 2 minutes ago
            </p>
          </div>
          <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <TabsList aria-label="Select reporting period">
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="90d">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Key metrics for {RANGE_LABEL[range]}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon
              return (
                <li key={kpi.id}>
                  <Card className="h-full gap-4">
                    <CardHeader>
                      <CardDescription className="flex items-center gap-2">
                        <Icon className="size-4" aria-hidden="true" />
                        {kpi.label}
                      </CardDescription>
                      <CardAction>
                        <TrendBadge change={kpi.change} invert={kpi.invert} />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="text-3xl font-semibold tracking-tight tabular-nums">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.note}</p>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Charts">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Traffic &amp; sign-ups</h2>
              </CardTitle>
              <CardDescription>Visitors and new sign-ups over {RANGE_LABEL[range]}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficConfig} className="aspect-auto h-72 w-full">
                <LineChart accessibilityLayer data={traffic} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
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
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="signups"
                    dataKey="signups"
                    type="monotone"
                    stroke="var(--color-signups)"
                    strokeWidth={2.5}
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
                <h2>Visitors by channel</h2>
              </CardTitle>
              <CardDescription>This period compared with the previous one</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={channelConfig} className="aspect-auto h-72 w-full">
                <BarChart accessibilityLayer data={channels} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="channel" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) => compact.format(v)}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="current" fill="var(--color-current)" radius={4} />
                  <Bar dataKey="previous" fill="var(--color-previous)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="activity-heading">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 id="activity-heading">Recent activity</h2>
              </CardTitle>
              <CardDescription>Latest customer and billing events</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {ACTIVITY.map((item, index) => {
                  const meta = KIND_META[item.kind]
                  const KindIcon = meta.icon
                  return (
                    <li key={item.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex items-start gap-3">
                        <Avatar size="lg" className="hidden sm:flex">
                          <AvatarFallback aria-hidden="true">{item.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            <span className="font-medium">{item.name}</span>{" "}
                            <span className="text-muted-foreground">{item.action}</span>
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                          <Badge variant="outline" className={`border-transparent ${meta.className}`}>
                            <KindIcon aria-hidden="true" />
                            {meta.label}
                          </Badge>
                          <span className="text-xs whitespace-nowrap text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
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
```