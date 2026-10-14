"use client";

import * as React from "react";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  CreditCard,
  ExternalLink,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  UserCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/ui/kbd";

const user = {
  name: "Amara Okafor",
  handle: "@amara.okafor",
  initials: "AO",
  role: "Senior Product Designer",
  plan: "Pro",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  bio: "Designing calm, accessible interfaces for logistics teams. Currently shipping the Fleet Console redesign.",
  stats: [
    { label: "Projects", value: 48 },
    { label: "Followers", value: 12840 },
    { label: "Reviews", value: 327 },
  ],
};

type MenuItem = {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  shortcut?: string;
  onSelect: () => void;
};

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function UserProfilePopover() {
  const [open, setOpen] = React.useState(false);
  const [following, setFollowing] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const followers = user.stats[1].value + (following ? 1 : 0);

  const close = () => setOpen(false);

  const menuItems: MenuItem[] = [
    {
      label: "View profile",
      icon: UserRound,
      shortcut: "G P",
      onSelect: () => {
        close();
        toast("Opening profile", { description: user.handle });
      },
    },
    {
      label: "Saved items",
      icon: Bookmark,
      shortcut: "G S",
      onSelect: () => {
        close();
        toast("Opening saved items", { description: "19 items saved" });
      },
    },
    {
      label: "Billing",
      icon: CreditCard,
      onSelect: () => {
        close();
        toast("Opening billing", { description: "Pro plan, renews 14 Jan" });
      },
    },
    {
      label: "Settings",
      icon: Settings,
      shortcut: "G ,",
      onSelect: () => {
        close();
        toast("Opening settings");
      },
    },
    {
      label: "Help & support",
      icon: LifeBuoy,
      onSelect: () => {
        close();
        toast("Opening help center");
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${user.name}`}
          className="group inline-flex items-center gap-2 rounded-full border bg-background py-1 pr-2 pl-1 shadow-xs transition-colors outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent"
        >
          <Avatar>
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              {user.initials}
            </AvatarFallback>
            <AvatarBadge className="bg-emerald-500" aria-hidden="true" />
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
            {user.name}
          </span>
          <ChevronDown
            className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
        aria-label={`${user.name} profile`}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="size-14">
              <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                {user.initials}
              </AvatarFallback>
              <AvatarBadge
                className="size-3.5 bg-emerald-500"
                aria-hidden="true"
              />
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="truncate text-base leading-tight font-semibold">
                  {user.name}
                </h2>
                <BadgeCheck
                  className="size-4 shrink-0 text-sky-500"
                  aria-label="Verified account"
                />
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {user.handle}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant="outline">{user.plan}</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {user.bio}
          </p>

          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {user.location}
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Joined {user.joined}
            </li>
          </ul>
        </div>

        {/* Stats */}
        <dl className="grid grid-cols-3 divide-x border-y bg-muted/40">
          {user.stats.map((stat) => {
            const value = stat.label === "Followers" ? followers : stat.value;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-0.5 px-2 py-3"
              >
                <dd
                  className="order-1 text-base font-semibold tabular-nums"
                  title={value.toLocaleString("en")}
                >
                  {formatCompact(value)}
                </dd>
                <dt className="order-2 text-xs text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            );
          })}
        </dl>

        {/* Primary actions */}
        <div className="flex items-center gap-2 p-3">
          <Button
            type="button"
            size="sm"
            variant={following ? "outline" : "default"}
            className="flex-1"
            aria-pressed={following}
            onClick={() => {
              const next = !following;
              setFollowing(next);
              toast(
                next ? `You're following ${user.name}` : `Unfollowed ${user.name}`,
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
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              close();
              toast("Message draft opened", {
                description: `To ${user.name}`,
              });
            }}
          >
            <MessageSquare aria-hidden="true" />
            Message
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-pressed={notifications}
            aria-label={
              notifications
                ? "Turn off notifications for this user"
                : "Turn on notifications for this user"
            }
            onClick={() => {
              const next = !notifications;
              setNotifications(next);
              toast(next ? "Notifications on" : "Notifications muted");
            }}
          >
            <Bell
              aria-hidden="true"
              className={notifications ? "fill-current" : undefined}
            />
          </Button>
        </div>

        <Separator />

        {/* Menu */}
        <nav aria-label="Account" className="p-1.5">
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={item.onSelect}
                  className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <item.icon
                    className="size-4 text-muted-foreground"
                    aria-hidden={true}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut ? (
                    <Kbd aria-hidden="true" className="hidden sm:inline-flex">
                      {item.shortcut}
                    </Kbd>
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
            onClick={() => {
              close();
              toast.success("Signed out", {
                description: "See you next time, Amara.",
              });
            }}
            className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const activity = [
  {
    title: "Fleet Console: dispatch board",
    meta: "Updated 2 hours ago",
    status: "In review",
  },
  {
    title: "Driver onboarding flow",
    meta: "Updated yesterday",
    status: "Shipped",
  },
  {
    title: "Route planner empty states",
    meta: "Updated 3 days ago",
    status: "Draft",
  },
];

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
              aria-hidden="true"
            >
              F
            </div>
            <span className="text-sm font-semibold">Fleetwise</span>
          </div>
          <UserProfilePopover />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, Amara
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
            Select your avatar in the top right to open the profile popover. It
            shows your stats, quick actions and account shortcuts. Press Escape
            to close it.
          </p>
        </div>

        <section aria-labelledby="recent-heading" className="mt-8">
          <h2 id="recent-heading" className="text-lg font-medium">
            Recent work
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activity.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm leading-snug font-medium">
                    {item.title}
                  </h3>
                  <ExternalLink
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.meta}
                  </span>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
