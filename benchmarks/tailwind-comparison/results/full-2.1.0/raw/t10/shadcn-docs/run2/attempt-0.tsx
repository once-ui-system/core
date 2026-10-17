"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Stat = { label: string; value: string };

type MenuAction = {
  label: string;
  icon: LucideIcon;
  hint?: string;
  message: string;
};

const user = {
  name: "Priya Raman",
  handle: "@priya",
  email: "priya.raman@northwind.example",
  initials: "PR",
  role: "Staff Designer",
  plan: "Team",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  storageUsed: 68,
};

const stats: Stat[] = [
  { label: "Projects", value: "24" },
  { label: "Followers", value: "1.2k" },
  { label: "Reviews", value: "318" },
];

const actions: MenuAction[] = [
  {
    label: "View profile",
    icon: UserRound,
    hint: "G P",
    message: "Opening your public profile",
  },
  {
    label: "Account settings",
    icon: Settings,
    hint: "G S",
    message: "Opening account settings",
  },
  {
    label: "Billing & plan",
    icon: CreditCard,
    message: "Opening billing",
  },
  {
    label: "Keyboard shortcuts",
    icon: Keyboard,
    hint: "?",
    message: "Shortcuts reference opened",
  },
  {
    label: "Help & documentation",
    icon: LifeBuoy,
    message: "Opening the help center",
  },
];

const activity = [
  {
    id: 1,
    who: "Marcus Oyelaran",
    handle: "@marcus",
    initials: "MO",
    role: "Engineering Manager",
    bio: "Shipping the design system rollout across web and mobile. Coffee, then code review.",
    location: "Toronto, Canada",
    since: "January 2020",
    followers: "864",
    text: "requested your review on",
    target: "Checkout flow redesign",
    time: "12 minutes ago",
  },
  {
    id: 2,
    who: "Hana Kobayashi",
    handle: "@hana",
    initials: "HK",
    role: "Product Researcher",
    bio: "Turning interview notes into decisions. Currently studying how teams onboard.",
    location: "Osaka, Japan",
    since: "August 2022",
    followers: "421",
    text: "commented on",
    target: "Onboarding research synthesis",
    time: "1 hour ago",
  },
  {
    id: 3,
    who: "Tomás Beltrán",
    handle: "@tomas",
    initials: "TB",
    role: "Front-end Engineer",
    bio: "Accessibility advocate. Believes every component deserves a keyboard story.",
    location: "Mexico City, Mexico",
    since: "May 2023",
    followers: "237",
    text: "merged",
    target: "Dropdown focus management fix",
    time: "Yesterday",
  },
];

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(true);
  const [notifications, setNotifications] = useState(true);

  function runAction(message: string) {
    setOpen(false);
    toast(message);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${user.name}`}
          className="rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/30"
        >
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {user.initials}
            </AvatarFallback>
            <AvatarBadge
              className={available ? "bg-emerald-500" : "bg-muted-foreground"}
            >
              <span className="sr-only">
                {available ? "Available" : "Away"}
              </span>
            </AvatarBadge>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        aria-label="User profile"
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
      >
        <div className="flex items-start gap-3 p-4">
          <Avatar size="lg" className="size-12">
            <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-sm font-semibold leading-none">
                {user.name}
              </p>
              <Badge variant="secondary">{user.plan}</Badge>
            </div>
            <p className="mt-1.5 truncate text-sm text-muted-foreground">
              {user.role}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 border-y bg-muted/40 text-center">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-2 py-3 ${index > 0 ? "border-l" : ""}`}
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="text-base font-semibold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="status-switch"
              className="text-sm font-medium leading-none"
            >
              Available for reviews
            </label>
            <Switch
              id="status-switch"
              checked={available}
              onCheckedChange={(checked) => {
                setAvailable(checked);
                toast(checked ? "Status set to available" : "Status set to away");
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="notify-switch"
              className="flex items-center gap-1.5 text-sm font-medium leading-none"
            >
              <Bell className="size-3.5 text-muted-foreground" aria-hidden />
              Push notifications
            </label>
            <Switch
              id="notify-switch"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span id="storage-label">Storage</span>
              <span>{user.storageUsed}% of 50 GB</span>
            </div>
            <Progress
              value={user.storageUsed}
              aria-labelledby="storage-label"
              className="h-1.5"
            />
          </div>
        </div>

        <Separator />

        <ul className="p-1.5">
          {actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                onClick={() => runAction(action.message)}
                className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              >
                <action.icon
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                <span className="flex-1">{action.label}</span>
                {action.hint ? (
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {action.hint}
                  </kbd>
                ) : (
                  <ChevronRight
                    className="size-4 text-muted-foreground/60"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="p-1.5">
          <button
            type="button"
            onClick={() => runAction("You have been signed out")}
            className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PersonHoverCard({ person }: { person: (typeof activity)[number] }) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href={`#${person.handle.slice(1)}`}
          onClick={(event) => event.preventDefault()}
          className="rounded-sm font-medium underline decoration-muted-foreground/40 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {person.who}
        </a>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-[min(20rem,calc(100vw-1.5rem))]"
        align="start"
      >
        <div className="flex gap-3">
          <Avatar size="lg" className="size-11">
            <AvatarFallback className="text-sm font-medium">
              {person.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold leading-none">
              {person.who}
            </p>
            <p className="text-xs text-muted-foreground">
              {person.handle} · {person.role}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm">{person.bio}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden />
            {person.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden />
            Joined {person.since}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {person.followers}
          </span>{" "}
          followers
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <BookOpen className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Northwind Studio
            </span>
          </div>
          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="sm">
              Projects
            </Button>
            <Button variant="ghost" size="sm">
              Reviews
            </Button>
            <Button variant="ghost" size="sm">
              Library
            </Button>
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Good morning, Priya
          </h1>
          <p className="text-muted-foreground">
            Select your avatar in the top-right corner to open your profile
            menu, or hover a teammate&apos;s name to preview their profile.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                What your teammates have been up to since yesterday.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Avatar>
                      <AvatarFallback className="text-xs font-medium">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-sm">
                      <p>
                        <PersonHoverCard person={item} />{" "}
                        <span className="text-muted-foreground">
                          {item.text}
                        </span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                {user.handle} · {user.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-3 gap-2 text-center md:grid-cols-1 md:text-left">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col md:flex-row md:items-baseline md:justify-between"
                  >
                    <dt className="text-xs text-muted-foreground md:text-sm">
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Member since {user.joined}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
