I'll write the page using Popover (avatar trigger) with the profile content inside.

```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bell,
  Check,
  CreditCard,
  LifeBuoy,
  LogOut,
  MapPin,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type StatusId = "available" | "focus" | "away";

type StatusOption = {
  id: StatusId;
  label: string;
  hint: string;
  dot: string;
};

const STATUSES: StatusOption[] = [
  {
    id: "available",
    label: "Available",
    hint: "Open to reviews and pings",
    dot: "bg-emerald-500",
  },
  {
    id: "focus",
    label: "Focusing",
    hint: "Notifications are muted",
    dot: "bg-amber-500",
  },
  {
    id: "away",
    label: "Away",
    hint: "Back tomorrow morning",
    dot: "bg-zinc-400",
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
};

const STATS = [
  { label: "Merged PRs", value: "1,284" },
  { label: "Reviews", value: "932" },
  { label: "Streak", value: "47d" },
];

type ActionItem = {
  label: string;
  icon: LucideIcon;
  message: string;
  shortcut?: string;
};

const ACTIONS: ActionItem[] = [
  {
    label: "View profile",
    icon: UserRound,
    message: "Opening your public profile…",
    shortcut: "G P",
  },
  {
    label: "Notifications",
    icon: Bell,
    message: "You have 3 unread notifications.",
    shortcut: "G N",
  },
  {
    label: "Billing & plan",
    icon: CreditCard,
    message: "Team plan renews on 14 July.",
  },
  {
    label: "Settings",
    icon: Settings,
    message: "Opening account settings…",
    shortcut: "G S",
  },
  {
    label: "Help & support",
    icon: LifeBuoy,
    message: "Support usually replies within two hours.",
  },
];

export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [statusId, setStatusId] = React.useState<StatusId>("available");
  const [following, setFollowing] = React.useState(false);

  const status = STATUSES.find((s) => s.id === statusId) ?? STATUSES[0];
  const followers = following ? 2418 : 2417;

  function handleAction(action: ActionItem) {
    setOpen(false);
    toast.info(action.label, { description: action.message });
  }

  function handleStatus(next: StatusOption) {
    setStatusId(next.id);
    toast.success(`Status set to ${next.label}`, {
      description: next.hint,
    });
  }

  function handleSignOut() {
    setOpen(false);
    toast("Signed out", {
      description: "This is a demo, so you are still here.",
    });
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            >
              N
            </span>
            <span>Northwind</span>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Account menu for ${USER.name}, status ${status.label}`}
                className="rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/30"
              >
                <Avatar size="lg" className="size-10 cursor-pointer">
                  <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                    {USER.initials}
                  </AvatarFallback>
                  <AvatarBadge className={cn("size-3", status.dot)} />
                </Avatar>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={10}
              collisionPadding={12}
              className="w-[min(22rem,calc(100vw-1.5rem))] gap-0 p-0"
              aria-label={`${USER.name} profile`}
            >
              {/* Identity */}
              <div className="flex items-start gap-3 p-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
                    {USER.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-semibold leading-tight">
                      {USER.name}
                    </h2>
                    <BadgeCheck
                      className="size-4 shrink-0 text-sky-500"
                      aria-label="Verified"
                      role="img"
                    />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {USER.handle} · {USER.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{USER.role}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden="true" />
                      {USER.location}
                    </span>
                  </div>
                </div>
              </div>

              <p className="px-4 pb-3 text-xs leading-relaxed text-muted-foreground">
                Leads the {USER.team} team. Member since {USER.joined}.
              </p>

              {/* Stats */}
              <dl className="grid grid-cols-3 border-y bg-muted/40">
                {STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-2 py-3 text-center",
                      i > 0 && "border-l"
                    )}
                  >
                    <dd className="text-base font-semibold tabular-nums leading-none">
                      {stat.value}
                    </dd>
                    <dt className="text-[11px] text-muted-foreground">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>

              {/* Follow row */}
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p
                  className="text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  <span className="font-semibold tabular-nums text-foreground">
                    {followers.toLocaleString("en-US")}
                  </span>{" "}
                  followers · 186 following
                </p>
                <Button
                  size="sm"
                  variant={following ? "secondary" : "default"}
                  aria-pressed={following}
                  onClick={() => {
                    const next = !following;
                    setFollowing(next);
                    toast.success(
                      next
                        ? `You are now following ${USER.name}`
                        : `Unfollowed ${USER.name}`
                    );
                  }}
                >
                  {following ? (
                    <>
                      <Check aria-hidden="true" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>

              <Separator />

              {/* Status */}
              <div
                role="radiogroup"
                aria-label="Set your status"
                className="flex flex-col gap-0.5 p-2"
              >
                <p
                  aria-hidden="true"
                  className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Status
                </p>
                {STATUSES.map((option) => {
                  const selected = option.id === statusId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleStatus(option)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("size-2.5 rounded-full", option.dot)}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium leading-tight">
                          {option.label}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {option.hint}
                        </span>
                      </span>
                      {selected && (
                        <Check
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Actions */}
              <nav aria-label="Account" className="flex flex-col p-2">
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleAction(action)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </nav>

              <Separator />

              <div className="p-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-destructive/30"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Good afternoon, Priya
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Platform Infrastructure overview
          </h1>
          <p className="max-w-prose text-pretty text-sm text-muted-foreground sm:text-base">
            Select your avatar in the top right corner to open your profile
            card. From there you can check your contribution stats, change your
            status and jump to account settings.
          </p>
        </div>

        <section
          aria-label="This week"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              title: "Deploys this week",
              value: "38",
              note: "4 more than last week",
            },
            {
              title: "Median review time",
              value: "2h 14m",
              note: "Down from 3h 40m",
            },
            {
              title: "Open incidents",
              value: "0",
              note: "Last one resolved Tuesday",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-1 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
            >
              <h2 className="text-sm font-medium text-muted-foreground">
                {card.title}
              </h2>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.note}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
```