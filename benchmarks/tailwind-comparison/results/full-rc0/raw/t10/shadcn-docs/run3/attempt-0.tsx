"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  Command,
  CreditCard,
  FolderGit2,
  LifeBuoy,
  LogOut,
  MapPin,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

type Status = "online" | "away" | "dnd";

const STATUSES: {
  value: Status;
  label: string;
  dot: string;
}[] = [
  { value: "online", label: "Available", dot: "bg-emerald-500" },
  { value: "away", label: "Away", dot: "bg-amber-500" },
  { value: "dnd", label: "Do not disturb", dot: "bg-red-500" },
];

const USER = {
  name: "Priya Raman",
  handle: "@priya",
  initials: "PR",
  email: "priya.raman@northwind.dev",
  role: "Staff Engineer",
  team: "Platform Infrastructure",
  location: "Lisbon, Portugal",
  joined: "March 2021",
  plan: "Pro",
  bio: "Building the deploy pipeline and keeping the pagers quiet.",
};

const STATS = [
  { label: "Projects", value: "24", icon: FolderGit2 },
  { label: "Followers", value: "1.8k", icon: Users },
  { label: "Reviews", value: "312", icon: BookOpen },
];

const TEAMMATE = {
  name: "Tomás Ferreira",
  handle: "@tomas",
  initials: "TF",
  role: "Senior SRE",
  bio: "On-call rotation lead. Ask me about incident runbooks.",
  location: "Porto, Portugal",
  joined: "August 2022",
};

type MenuAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  message: string;
};

const MENU_ACTIONS: MenuAction[] = [
  {
    label: "View profile",
    icon: User,
    shortcut: "G P",
    message: "Opening your profile",
  },
  {
    label: "Account settings",
    icon: Settings,
    shortcut: "G S",
    message: "Opening account settings",
  },
  {
    label: "Billing & plan",
    icon: CreditCard,
    shortcut: "G B",
    message: "Opening billing",
  },
  {
    label: "Notifications",
    icon: Bell,
    shortcut: "G N",
    message: "Opening notification preferences",
  },
];

const menuItemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50";

export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("online");
  const currentStatus = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  const handleAction = (message: string) => {
    setOpen(false);
    toast(message);
  };

  const handleStatus = (next: Status) => {
    setStatus(next);
    const label = STATUSES.find((s) => s.value === next)?.label ?? next;
    toast.success(`Status set to “${label}”`);
  };

  const handleSignOut = () => {
    setOpen(false);
    toast.success("You have been signed out", {
      description: "See you next time, Priya.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Northwind
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Console
            </Badge>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {["Overview", "Deployments", "Incidents", "Docs"].map((item, i) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                className={cn(i === 0 && "bg-accent text-accent-foreground")}
                aria-current={i === 0 ? "page" : undefined}
              >
                {item}
              </Button>
            ))}
          </nav>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Account menu for ${USER.name}, status ${currentStatus.label}`}
                className="group rounded-full outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/40"
              >
                <Avatar size="lg" className="transition-opacity group-hover:opacity-90">
                  <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                    {USER.initials}
                  </AvatarFallback>
                  <AvatarBadge className={cn("bg-transparent", currentStatus.dot)}>
                    <span className="sr-only">{currentStatus.label}</span>
                  </AvatarBadge>
                </Avatar>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
              aria-label="User profile"
            >
              <div className="flex items-start gap-3 p-4">
                <Avatar size="lg" className="size-12">
                  <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
                    {USER.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{USER.name}</p>
                    <Badge variant="outline" className="shrink-0">
                      {USER.plan}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {USER.email}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {USER.role} · {USER.team}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-3 border-y bg-muted/40">
                {STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-2 py-3",
                      i > 0 && "border-l"
                    )}
                  >
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <stat.icon className="size-3" aria-hidden="true" />
                      {stat.label}
                    </dt>
                    <dd className="text-base font-semibold tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="p-2">
                <p
                  id="status-label"
                  className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground"
                >
                  Set status
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
                        className={menuItemClass}
                      >
                        <span
                          aria-hidden="true"
                          className={cn("size-2.5 rounded-full", s.dot)}
                        />
                        <span className="flex-1">{s.label}</span>
                        {selected && (
                          <Check className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <ul className="p-2" aria-label="Account actions">
                {MENU_ACTIONS.map((action) => (
                  <li key={action.label}>
                    <button
                      type="button"
                      onClick={() => handleAction(action.message)}
                      className={menuItemClass}
                    >
                      <action.icon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <span
                          aria-hidden="true"
                          className="hidden text-xs tracking-widest text-muted-foreground sm:inline"
                        >
                          {action.shortcut}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="flex flex-col gap-1 p-2">
                <button
                  type="button"
                  onClick={() => handleAction("Opening support center")}
                  className={menuItemClass}
                >
                  <LifeBuoy
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="flex-1">Help & support</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={cn(
                    menuItemClass,
                    "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
                  )}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="flex-1">Sign out</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14"
      >
        <section className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit">
            <Command aria-hidden="true" />
            Profile menu demo
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Good afternoon, Priya
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Select your avatar in the top-right corner to open your profile
            card. You can check your stats, change your availability and jump to
            account settings without leaving the page.
          </p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
            >
              <User aria-hidden="true" />
              Open profile menu
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="activity-heading"
          className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs sm:p-6"
        >
          <h2 id="activity-heading" className="text-base font-semibold">
            Recent activity
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hover or focus a teammate’s name to preview their profile.
          </p>

          <ul className="mt-5 flex flex-col divide-y">
            <li className="py-3 text-sm leading-relaxed">
              <TeammateLink /> approved your pull request{" "}
              <span className="font-medium">
                “Retry failed deploys with backoff”
              </span>
              .
              <span className="mt-0.5 block text-xs text-muted-foreground">
                12 minutes ago
              </span>
            </li>
            <li className="py-3 text-sm leading-relaxed">
              Deployment{" "}
              <span className="font-mono text-xs font-medium">
                api-gateway@v4.18.2
              </span>{" "}
              finished successfully in production.
              <span className="mt-0.5 block text-xs text-muted-foreground">
                1 hour ago
              </span>
            </li>
            <li className="py-3 text-sm leading-relaxed">
              <TeammateLink /> mentioned you in{" "}
              <span className="font-medium">Incident #2041 post-mortem</span>.
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Yesterday at 17:42
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function TeammateLink() {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href="#main"
          onClick={(e) => e.preventDefault()}
          className="rounded-sm font-medium underline decoration-muted-foreground/40 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {TEAMMATE.handle}
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        <div className="flex gap-3">
          <Avatar size="lg" className="size-10">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {TEAMMATE.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div>
              <p className="truncate text-sm font-semibold">{TEAMMATE.name}</p>
              <p className="text-xs text-muted-foreground">
                {TEAMMATE.handle} · {TEAMMATE.role}
              </p>
            </div>
            <p className="text-sm">{TEAMMATE.bio}</p>
            <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3" aria-hidden="true" />
                {TEAMMATE.location}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3" aria-hidden="true" />
                Joined {TEAMMATE.joined}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
