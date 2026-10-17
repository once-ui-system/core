```tsx
"use client";

import * as React from "react";
import {
  Bell,
  BellOff,
  Bookmark,
  CalendarDays,
  CreditCard,
  FolderKanban,
  LifeBuoy,
  LogOut,
  MapPin,
  Settings,
  UserRound,
  UserPlus,
  UserCheck,
  Users,
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Stat = { label: string; value: string };

type MenuAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  hint?: string;
  message: string;
};

const currentUser = {
  name: "Maya Okonkwo",
  handle: "@maya.okonkwo",
  email: "maya@northwind.studio",
  initials: "MO",
  role: "Design Lead",
  plan: "Pro",
  location: "Lisbon, Portugal",
  stats: [
    { label: "Projects", value: "24" },
    { label: "Followers", value: "1.8k" },
    { label: "Reviews", value: "312" },
  ] satisfies Stat[],
};

const menuActions: MenuAction[] = [
  {
    id: "profile",
    label: "View profile",
    icon: UserRound,
    hint: "G P",
    message: "Opening your public profile",
  },
  {
    id: "projects",
    label: "My projects",
    icon: FolderKanban,
    hint: "G J",
    message: "Opening your projects",
  },
  {
    id: "saved",
    label: "Saved items",
    icon: Bookmark,
    message: "Opening saved items",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    message: "Opening billing settings",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    hint: "G S",
    message: "Opening account settings",
  },
  {
    id: "support",
    label: "Help & support",
    icon: LifeBuoy,
    message: "Connecting you to support",
  },
];

const teammate = {
  name: "Daniel Reyes",
  handle: "@danreyes",
  initials: "DR",
  role: "Senior Frontend Engineer",
  bio: "Building accessible component systems. Currently migrating the Northwind design tokens to Tailwind v4.",
  location: "Mexico City",
  joined: "Joined March 2022",
  stats: [
    { label: "Projects", value: "17" },
    { label: "Followers", value: "946" },
  ] satisfies Stat[],
};

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl
      className="grid divide-x rounded-lg border bg-muted/40"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-0.5 px-2 py-2.5"
        >
          <dd className="text-base font-semibold tabular-nums leading-none">
            {stat.value}
          </dd>
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function ProfileMenu() {
  const [open, setOpen] = React.useState(false);
  const [dnd, setDnd] = React.useState(false);

  const runAction = (action: MenuAction) => {
    setOpen(false);
    toast(action.message);
  };

  const signOut = () => {
    setOpen(false);
    toast.success("You have been signed out", {
      description: "See you soon, Maya.",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${currentUser.name}`}
          className="rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/30"
        >
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {currentUser.initials}
            </AvatarFallback>
            <AvatarBadge
              className={
                dnd
                  ? "bg-amber-500 dark:bg-amber-500"
                  : "bg-emerald-500 dark:bg-emerald-500"
              }
            >
              <span className="sr-only">
                {dnd ? "Do not disturb" : "Online"}
              </span>
            </AvatarBadge>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-1.5rem))] p-0"
      >
        <div className="flex items-center gap-3 p-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold">
                {currentUser.name}
              </h2>
              <Badge variant="secondary" className="shrink-0">
                {currentUser.plan}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {currentUser.role} · {currentUser.location}
              </span>
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <StatGrid stats={currentUser.stats} />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <label
            htmlFor="dnd-switch"
            className="flex min-w-0 cursor-pointer items-center gap-2 text-sm"
          >
            {dnd ? (
              <BellOff
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <Bell
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span className="truncate">Do not disturb</span>
          </label>
          <Switch
            id="dnd-switch"
            checked={dnd}
            onCheckedChange={(checked) => {
              setDnd(checked);
              toast(
                checked
                  ? "Notifications paused"
                  : "Notifications are back on",
              );
            }}
          />
        </div>

        <Separator />

        <ul className="flex flex-col p-1.5" aria-label="Account actions">
          {menuActions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => runAction(action)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              >
                <action.icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{action.label}</span>
                {action.hint ? (
                  <span
                    className="hidden text-xs tracking-widest text-muted-foreground sm:inline"
                    aria-hidden="true"
                  >
                    {action.hint}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="p-1.5">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TeammateMention() {
  const [following, setFollowing] = React.useState(false);

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    toast(next ? `You are now following ${teammate.name}` : `Unfollowed ${teammate.name}`);
  };

  return (
    <HoverCard openDelay={150} closeDelay={150}>
      <HoverCardTrigger asChild>
        <a
          href="#daniel-reyes"
          onClick={(event) => event.preventDefault()}
          className="rounded-sm font-medium text-foreground underline decoration-muted-foreground/50 underline-offset-4 outline-none transition-colors hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {teammate.handle}
        </a>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-[min(20rem,calc(100vw-1.5rem))] space-y-3"
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
              {teammate.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{teammate.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {teammate.handle}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {teammate.role}
            </p>
          </div>
          <Button
            size="sm"
            variant={following ? "outline" : "default"}
            onClick={toggleFollow}
            aria-pressed={following}
          >
            {following ? (
              <UserCheck aria-hidden="true" />
            ) : (
              <UserPlus aria-hidden="true" />
            )}
            {following ? "Following" : "Follow"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{teammate.bio}</p>

        <StatGrid stats={teammate.stats} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" />
            {teammate.location}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" aria-hidden="true" />
            {teammate.joined}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

const activity = [
  {
    id: "a1",
    title: "Checkout redesign moved to review",
    detail: "12 comments from the payments team",
    time: "12 min ago",
  },
  {
    id: "a2",
    title: "Design tokens v2.4 published",
    detail: "Spacing and radius scales are now fully aligned",
    time: "2 hours ago",
  },
  {
    id: "a3",
    title: "Quarterly research readout scheduled",
    detail: "Thursday at 15:00 in the Atlas room",
    time: "Yesterday",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Users className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Northwind Studio
            </span>
          </div>

          <nav aria-label="Primary" className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => toast("You have 3 unread notifications")}
            >
              <Bell aria-hidden="true" />
            </Button>
            <ProfileMenu />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Tuesday overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Good morning, Maya
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Select your avatar in the top right to open your account menu, or
            hover over a teammate&apos;s handle to preview their profile.
          </p>
        </div>

        <section
          aria-labelledby="activity-heading"
          className="rounded-xl border bg-card text-card-foreground shadow-xs"
        >
          <div className="border-b px-4 py-4 sm:px-6">
            <h2 id="activity-heading" className="text-base font-semibold">
              Recent activity
            </h2>
            <p className="text-sm text-muted-foreground">
              What your team has been up to since yesterday.
            </p>
          </div>

          <ul className="divide-y">
            <li className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              <p className="text-sm">
                <TeammateMention /> requested your review on{" "}
                <span className="font-medium">Navigation refactor</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Touches 18 files across the shared component library · 38 min
                ago
              </p>
            </li>
            {activity.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {item.time}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
```