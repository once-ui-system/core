"use client";

import * as React from "react";
import {
  Bell,
  BookmarkCheck,
  CalendarDays,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  UserPlus,
  UserCheck,
  UserRound,
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

type Stat = { label: string; value: string };

const currentUser = {
  name: "Maya Okonkwo",
  handle: "@mayaokonkwo",
  initials: "MO",
  role: "Staff Product Designer",
  plan: "Pro",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  bio: "Designing calm, legible interfaces for data-heavy tools. Currently shipping the Northwind design system.",
  stats: [
    { label: "Projects", value: "48" },
    { label: "Followers", value: "12.4k" },
    { label: "Following", value: "386" },
  ] satisfies Stat[],
};

const teammate = {
  name: "Tomás Ferreira",
  handle: "@tomasf",
  initials: "TF",
  role: "Frontend Engineer",
  bio: "Accessibility advocate. Keeps the component library fast, typed and boring in the best way.",
  joined: "August 2022",
  stats: [
    { label: "Projects", value: "31" },
    { label: "Followers", value: "2.1k" },
  ] satisfies Stat[],
};

const menuItems: {
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { label: "View profile", icon: UserRound },
  { label: "Saved projects", hint: "12", icon: BookmarkCheck },
  { label: "Notifications", hint: "3 new", icon: Bell },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
  { label: "Help & support", icon: LifeBuoy },
];

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl
      className="grid divide-x rounded-lg border bg-muted/40 text-center"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-0.5 px-2 py-2.5">
          <dd className="text-base leading-none font-semibold tabular-nums">
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
  const [following, setFollowing] = React.useState(false);

  const handleMenuItem = (label: string) => {
    setOpen(false);
    toast(label, { description: "This is a demo — no navigation happens." });
  };

  const handleSignOut = () => {
    setOpen(false);
    toast.success("Signed out", {
      description: "You have been signed out of this demo session.",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 rounded-full p-1 pr-2 sm:pr-3"
          aria-label={`Account menu for ${currentUser.name}`}
        >
          <Avatar size="lg">
            <AvatarFallback className="bg-primary font-medium text-primary-foreground">
              {currentUser.initials}
            </AvatarFallback>
            <AvatarBadge
              className="bg-emerald-500 dark:bg-emerald-500"
              aria-hidden="true"
            />
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {currentUser.name}
          </span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
        aria-label="User profile"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-lg font-medium text-primary-foreground">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="truncate text-base leading-tight font-semibold">
                  {currentUser.name}
                </h2>
                <Badge variant="secondary">{currentUser.plan}</Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {currentUser.handle}
              </p>
              <p className="mt-1 truncate text-sm">{currentUser.role}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{currentUser.bio}</p>

          <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-3.5" aria-hidden="true" />
              {currentUser.location}
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Joined {currentUser.joined}
            </li>
          </ul>

          <StatGrid stats={currentUser.stats} />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={following ? "secondary" : "default"}
              size="sm"
              aria-pressed={following}
              onClick={() => {
                setFollowing((value) => !value);
                toast(
                  following
                    ? "Profile unfollowed"
                    : "Profile followed",
                  {
                    description: following
                      ? "You will no longer see updates from this profile."
                      : "You will now see updates from this profile.",
                  },
                );
              }}
            >
              {following ? (
                <UserCheck aria-hidden="true" />
              ) : (
                <UserPlus aria-hidden="true" />
              )}
              {following ? "Following" : "Follow"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                toast("New message", {
                  description: `Draft started to ${currentUser.name}.`,
                });
              }}
            >
              <MessageSquare aria-hidden="true" />
              Message
            </Button>
          </div>
        </div>

        <Separator />

        <nav aria-label="Account" className="p-1.5">
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => handleMenuItem(item.label)}
                  className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <item.icon
                    className="size-4 text-muted-foreground"
                    aria-hidden={true}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.hint ? (
                    <span className="text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <Separator />

        <div className="p-1.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TeammateMention() {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="rounded-sm font-medium text-foreground underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {teammate.handle}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-[min(20rem,calc(100vw-1.5rem))]"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-secondary font-medium text-secondary-foreground">
                {teammate.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{teammate.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {teammate.role}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{teammate.bio}</p>
          <StatGrid stats={teammate.stats} />
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Joined {teammate.joined}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden="true"
            >
              N
            </div>
            <span className="text-base font-semibold tracking-tight">
              Northwind
            </span>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <Badge variant="outline">Design system · Sprint 24</Badge>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, Maya
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Select your avatar in the top-right corner to open your profile,
            review your stats and jump to account settings. Everything is
            reachable from the keyboard: press Enter or Space on the avatar,
            use Tab to move through the menu and Escape to close it.
          </p>
        </div>

        <section
          aria-labelledby="activity-heading"
          className="mt-10 grid gap-4 sm:grid-cols-2"
        >
          <h2 id="activity-heading" className="sr-only">
            Recent activity
          </h2>

          <article className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
            <h3 className="text-sm font-semibold">Review requested</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <TeammateMention /> asked you to review the new focus-ring tokens
              before Thursday&apos;s release. Hover or focus the handle to see
              a quick profile preview.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              <time dateTime="2025-06-10T09:24:00">Today, 9:24 AM</time>
            </p>
          </article>

          <article className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
            <h3 className="text-sm font-semibold">Milestone reached</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your published component library crossed 12,000 followers this
              week, up 4.2% from last Monday.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              <time dateTime="2025-06-09T16:02:00">Yesterday, 4:02 PM</time>
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
