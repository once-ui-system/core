"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleUser,
  Keyboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Moon,
  Settings,
  UserPlus,
  UserRoundCheck,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Status = "online" | "focus" | "away";

const STATUSES: {
  value: Status;
  label: string;
  hint: string;
  dot: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "online",
    label: "Available",
    hint: "Notifications on",
    dot: "bg-emerald-500",
    icon: Check,
  },
  {
    value: "focus",
    label: "Focus mode",
    hint: "Pause notifications",
    dot: "bg-amber-500",
    icon: Moon,
  },
  {
    value: "away",
    label: "Away",
    hint: "Back later",
    dot: "bg-muted-foreground",
    icon: Bell,
  },
];

const USER = {
  name: "Maya Okonkwo",
  handle: "@maya.okonkwo",
  initials: "MO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm, fast tools for distributed teams. Currently shipping the new workspace onboarding.",
  plan: "Pro",
  stats: [
    { label: "Projects", value: "24" },
    { label: "Followers", value: "1.8k" },
    { label: "Reviews", value: "312" },
  ],
};

const MENU_ITEMS: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}[] = [
  { label: "View profile", icon: CircleUser, shortcut: "G P" },
  { label: "Account settings", icon: Settings, shortcut: "G S" },
  { label: "Keyboard shortcuts", icon: Keyboard, shortcut: "?" },
];

export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("online");
  const [following, setFollowing] = React.useState(false);

  const current = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  function handleStatus(next: Status) {
    setStatus(next);
    const label = STATUSES.find((s) => s.value === next)?.label ?? next;
    toast.success(`Status set to “${label}”`);
  }

  function handleMenu(label: string) {
    setOpen(false);
    toast(label, { description: "This is a demo action." });
  }

  function handleFollow() {
    const next = !following;
    setFollowing(next);
    toast.success(
      next ? `You're now following ${USER.name}` : `Unfollowed ${USER.name}`,
    );
  }

  function handleSignOut() {
    setOpen(false);
    toast("Signed out", { description: "See you soon, Maya." });
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              L
            </div>
            <span className="text-base font-semibold tracking-tight">
              Lumen Workspace
            </span>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Open profile menu for ${USER.name}, status ${current.label}`}
                className="group flex items-center gap-2 rounded-full p-1 pr-2 outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent"
              >
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 font-medium text-primary">
                    {USER.initials}
                  </AvatarFallback>
                  <AvatarBadge className={cn(current.dot, "text-white")}>
                    <span className="sr-only">{current.label}</span>
                  </AvatarBadge>
                </Avatar>
                <ChevronDown
                  aria-hidden="true"
                  className="hidden size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 sm:block"
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[min(22rem,calc(100vw-1.5rem))] gap-0 p-0"
              aria-label="Profile menu"
            >
              {/* Header */}
              <div className="flex items-start gap-3 p-4">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {USER.initials}
                  </AvatarFallback>
                  <AvatarBadge
                    className={cn(current.dot, "size-3.5 text-white")}
                  >
                    <span className="sr-only">{current.label}</span>
                  </AvatarBadge>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="truncate text-sm font-semibold leading-tight">
                      {USER.name}
                    </h2>
                    <Badge variant="secondary">{USER.plan}</Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {USER.handle}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {USER.role}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">{USER.location}</span>
                  </p>
                </div>
              </div>

              <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                {USER.bio}
              </p>

              {/* Stats */}
              <dl className="grid grid-cols-3 divide-x border-y bg-muted/40">
                {USER.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-0.5 px-2 py-3"
                  >
                    <dd className="order-1 text-base font-semibold tabular-nums">
                      {stat.value}
                    </dd>
                    <dt className="order-2 text-xs text-muted-foreground">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>

              {/* Primary actions */}
              <div className="flex gap-2 p-4">
                <Button
                  size="sm"
                  variant={following ? "outline" : "default"}
                  className="flex-1"
                  aria-pressed={following}
                  onClick={handleFollow}
                >
                  {following ? (
                    <UserRoundCheck aria-hidden="true" />
                  ) : (
                    <UserPlus aria-hidden="true" />
                  )}
                  {following ? "Following" : "Follow"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleMenu("View profile")}
                >
                  <CircleUser aria-hidden="true" />
                  Profile
                </Button>
              </div>

              <Separator />

              {/* Status */}
              <div className="p-2">
                <p
                  id="status-label"
                  className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground"
                >
                  Set your status
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby="status-label"
                  className="flex flex-col"
                >
                  {STATUSES.map((s) => {
                    const selected = s.value === status;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleStatus(s.value)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <span
                          aria-hidden="true"
                          className={cn("size-2.5 shrink-0 rounded-full", s.dot)}
                        />
                        <span className="flex-1">
                          <span className="block font-medium leading-tight">
                            {s.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {s.hint}
                          </span>
                        </span>
                        {selected && (
                          <Check
                            aria-hidden="true"
                            className="size-4 text-foreground"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Menu */}
              <div className="flex flex-col p-2">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleMenu(item.label)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-destructive/30"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="flex-1 text-left">Sign out</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline">Account</Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Good morning, Maya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Select your avatar in the top-right corner to open your profile
            card. You can check your stats, change your status, follow your
            profile, and jump to settings without leaving this page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Onboarding redesign",
              body: "Three files updated since yesterday. Two reviews are waiting on you.",
            },
            {
              icon: Bell,
              title: "7 unread notifications",
              body: "Comments on the pricing page prototype and a new mention from Daniel.",
            },
            {
              icon: LifeBuoy,
              title: "Design system office hours",
              body: "Thursday at 15:00 WEST. Bring your questions about the new tokens.",
            },
          ].map((card) => (
            <section
              key={card.title}
              className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
            >
              <card.icon
                aria-hidden="true"
                className="mb-3 size-5 text-muted-foreground"
              />
              <h2 className="text-sm font-semibold">{card.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
