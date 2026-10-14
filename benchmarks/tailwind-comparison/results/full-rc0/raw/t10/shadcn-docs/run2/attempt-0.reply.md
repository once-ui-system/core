I have what I need. The design is a header with a Popover-triggered avatar, which opens a profile card with stats, a status selector, and menu actions. A HoverCard on the byline gives a quick preview of the same person. The page itself shows a small activity feed so the header makes sense in context.

```tsx
"use client";

import * as React from "react";
import {
  BookOpen,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  GitPullRequest,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type StatusId = "available" | "focus" | "away";

const STATUSES: {
  id: StatusId;
  label: string;
  hint: string;
  dot: string;
}[] = [
  {
    id: "available",
    label: "Available",
    hint: "Notifications on",
    dot: "bg-emerald-500",
  },
  {
    id: "focus",
    label: "Focus mode",
    hint: "Muted until 3:00 PM",
    dot: "bg-amber-500",
  },
  {
    id: "away",
    label: "Away",
    hint: "Back tomorrow",
    dot: "bg-muted-foreground",
  },
];

const USER = {
  name: "Priya Raman",
  handle: "@priya",
  email: "priya.raman@northwind.dev",
  initials: "PR",
  role: "Staff Engineer",
  team: "Platform Infrastructure",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  bio: "Building the deploy pipeline and keeping CI under ten minutes.",
  plan: "Team",
  seatsUsed: 18,
  seatsTotal: 25,
};

const STATS = [
  { label: "Merged PRs", value: "148", icon: GitPullRequest },
  { label: "Reviews", value: "312", icon: MessageSquare },
  { label: "Teammates", value: "24", icon: Users },
];

const ACTIVITY = [
  {
    id: 1,
    title: "Cache layer for build artifacts",
    meta: "Merged into main · 12 minutes ago",
    tag: "Merged",
  },
  {
    id: 2,
    title: "Retry flaky integration suite on runner pool B",
    meta: "Review requested · 1 hour ago",
    tag: "Review",
  },
  {
    id: 3,
    title: "Document the rollback runbook",
    meta: "Opened · yesterday",
    tag: "Open",
  },
  {
    id: 4,
    title: "Bump Node runtime to 22 across services",
    meta: "Commented · 2 days ago",
    tag: "Discussion",
  },
];

const MENU_ITEMS: {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  shortcut?: string;
}[] = [
  { label: "View profile", icon: UserRound, shortcut: "G P" },
  { label: "Notifications", icon: Bell, shortcut: "G N" },
  { label: "Billing & plan", icon: CreditCard },
  { label: "Settings", icon: Settings, shortcut: "G S" },
];

const HELP_ITEMS: {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { label: "Documentation", icon: BookOpen },
  { label: "Support", icon: LifeBuoy },
];

function UserMenuItem({
  icon: Icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span className="flex-1">{label}</span>
      {shortcut ? (
        <span
          className="hidden text-xs tracking-widest text-muted-foreground sm:inline"
          aria-hidden
        >
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

function UserAvatar({
  status,
  size = "default",
  className,
}: {
  status: StatusId;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const current = STATUSES.find((s) => s.id === status) ?? STATUSES[0];
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className="bg-primary/10 font-medium text-primary">
        {USER.initials}
      </AvatarFallback>
      <AvatarBadge className={cn(current.dot, "text-transparent")} />
    </Avatar>
  );
}

function ProfileMenu({
  status,
  onStatusChange,
}: {
  status: StatusId;
  onStatusChange: (next: StatusId) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const current = STATUSES.find((s) => s.id === status) ?? STATUSES[0];
  const seatPercent = Math.round((USER.seatsUsed / USER.seatsTotal) * 100);

  const act = (message: string) => {
    setOpen(false);
    toast(message);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setStatusOpen(false);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${USER.name}, status ${current.label}`}
          className="rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/30"
        >
          <UserAvatar status={status} size="lg" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
        aria-label="Account menu"
      >
        <div className="flex items-start gap-3 p-4">
          <UserAvatar status={status} size="lg" className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{USER.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {USER.email}
            </p>
            <Badge variant="secondary" className="mt-2">
              {USER.role}
            </Badge>
          </div>
        </div>

        <dl className="grid grid-cols-3 border-y bg-muted/40">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-3 text-center",
                index > 0 && "border-l"
              )}
            >
              <dt className="order-2 text-[11px] text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="order-1 text-base font-semibold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{USER.plan} plan</span>
            <span className="text-muted-foreground tabular-nums">
              {USER.seatsUsed} of {USER.seatsTotal} seats
            </span>
          </div>
          <Progress
            value={seatPercent}
            aria-label={`${USER.seatsUsed} of ${USER.seatsTotal} seats used`}
            className="h-1.5"
          />
        </div>

        <Separator />

        <div className="p-1.5">
          <button
            type="button"
            aria-expanded={statusOpen}
            aria-controls="status-options"
            onClick={() => setStatusOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span
              className={cn("ml-1 size-2.5 rounded-full", current.dot)}
              aria-hidden
            />
            <span className="flex-1">
              <span className="block leading-tight">{current.label}</span>
              <span className="block text-xs text-muted-foreground">
                {current.hint}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                statusOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {statusOpen ? (
            <div
              id="status-options"
              role="radiogroup"
              aria-label="Set your status"
              className="mt-1 space-y-0.5 pl-3"
            >
              {STATUSES.map((s) => {
                const selected = s.id === status;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      onStatusChange(s.id);
                      setStatusOpen(false);
                      toast.success(`Status set to ${s.label}`);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span
                      className={cn("size-2 rounded-full", s.dot)}
                      aria-hidden
                    />
                    <span className="flex-1">{s.label}</span>
                    {selected ? (
                      <Check className="size-4" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="p-1.5">
          {MENU_ITEMS.map((item) => (
            <UserMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              shortcut={item.shortcut}
              onSelect={() => act(`${item.label} opened`)}
            />
          ))}
        </div>

        <Separator />

        <div className="p-1.5">
          {HELP_ITEMS.map((item) => (
            <UserMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              onSelect={() => act(`${item.label} opened`)}
            />
          ))}
        </div>

        <Separator />

        <div className="p-1.5">
          <button
            type="button"
            onClick={() => act("You have been signed out")}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-destructive/30"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AuthorPreview() {
  return (
    <HoverCard openDelay={200} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="rounded-sm font-medium underline decoration-dotted underline-offset-4 outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {USER.handle}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="flex gap-3">
          <Avatar size="lg" className="size-12">
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {USER.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold">{USER.name}</p>
            <p className="text-sm text-muted-foreground">{USER.bio}</p>
            <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {USER.team}
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {USER.location}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                Joined {USER.joined}
              </li>
            </ul>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusId>("available");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden
            >
              N
            </span>
            <span className="text-sm font-semibold sm:text-base">
              Northwind Console
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => toast("You're all caught up")}
            >
              <Bell aria-hidden />
            </Button>
            <ProfileMenu status={status} onStatusChange={setStatus} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="page-title" className="space-y-2">
          <h1
            id="page-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Good afternoon, Priya
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
            Select your avatar in the top right corner to open the account
            menu. Hover or focus the handle in the feed below for a quick
            profile preview.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest updates from <AuthorPreview /> across your repositories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {ACTIVITY.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                  <Badge variant="outline" className="self-start sm:self-auto">
                    {item.tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```