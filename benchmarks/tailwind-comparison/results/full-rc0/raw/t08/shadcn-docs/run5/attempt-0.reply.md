```tsx
"use client";

import * as React from "react";
import {
  BellRing,
  Check,
  ChevronDown,
  CircleDashed,
  FolderKanban,
  PartyPopper,
  PlugZap,
  RotateCcw,
  Rocket,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  actionLabel: string;
  minutes: number;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    summary: "Add your name, role and a photo so teammates recognise you.",
    detail:
      "Your profile appears next to every comment, task and mention. Add your full name, job title and time zone so collaborators know when you're online.",
    actionLabel: "Mark profile complete",
    minutes: 2,
    icon: UserRound,
  },
  {
    id: "workspace",
    title: "Create your first project",
    summary: "Set up a project called “Q3 Website Relaunch” to organise work.",
    detail:
      "Projects group tasks, files and discussions in one place. Start from the Product Launch template to get a ready-made board with To do, In progress and Done columns.",
    actionLabel: "Mark project created",
    minutes: 4,
    icon: FolderKanban,
  },
  {
    id: "team",
    title: "Invite your teammates",
    summary: "Send invites to at least two colleagues by email.",
    detail:
      "Teammates can be invited as Admins, Members or Guests. Invitations expire after 7 days, and you can resend or revoke them from the People page at any time.",
    actionLabel: "Mark invites sent",
    minutes: 3,
    icon: Users,
  },
  {
    id: "integrations",
    title: "Connect your tools",
    summary: "Link Slack, GitHub or Google Calendar to sync activity.",
    detail:
      "Connected tools keep your project up to date automatically: pull requests update task status, and calendar events show up on your timeline.",
    actionLabel: "Mark tools connected",
    minutes: 5,
    icon: PlugZap,
  },
  {
    id: "notifications",
    title: "Choose notification settings",
    summary: "Decide what you hear about and how often.",
    detail:
      "Pick between instant alerts, a daily digest or a weekly summary. You can always mute a single project without leaving it.",
    actionLabel: "Mark notifications set",
    minutes: 1,
    icon: BellRing,
  },
];

const CONFETTI_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

// Deterministic pseudo-random layout so server and client markup match.
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: ((i * 53) % 100) / 100,
  duration: 1.8 + ((i * 29) % 15) / 10,
  size: 6 + ((i * 11) % 6),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}));

type Status = "done" | "current" | "upcoming";

function StatusIndicator({ status, index }: { status: Status; index: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-300",
        status === "done" &&
          "border-primary bg-primary text-primary-foreground",
        status === "current" &&
          "border-primary bg-background text-primary ring-4 ring-primary/15",
        status === "upcoming" &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {status === "done" ? (
        <Check className="size-4 animate-in zoom-in-50 duration-300" />
      ) : status === "current" ? (
        <CircleDashed className="size-4" />
      ) : (
        index + 1
      )}
    </span>
  );
}

export default function Page() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set(["profile"]),
  );
  const [openId, setOpenId] = React.useState<string | null>("workspace");
  const [announcement, setAnnouncement] = React.useState("");
  const celebrationRef = React.useRef<HTMLDivElement>(null);
  const hasCelebrated = React.useRef(false);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentId = STEPS.find((s) => !completed.has(s.id))?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  const statusOf = (id: string): Status =>
    completed.has(id) ? "done" : id === currentId ? "current" : "upcoming";

  function completeStep(id: string) {
    const next = new Set(completed);
    next.add(id);
    setCompleted(next);

    const step = STEPS.find((s) => s.id === id);
    const nextStep = STEPS.find((s) => !next.has(s.id));
    setOpenId(nextStep ? nextStep.id : null);

    if (next.size === total) {
      setAnnouncement("All steps complete. You're ready to go!");
      if (!hasCelebrated.current) {
        hasCelebrated.current = true;
        toast.success("Onboarding complete!", {
          description: "Your workspace is ready. Welcome aboard.",
        });
      }
    } else if (step) {
      setAnnouncement(
        `${step.title} completed. ${next.size} of ${total} steps done.`,
      );
    }
  }

  function undoStep(id: string) {
    const next = new Set(completed);
    next.delete(id);
    setCompleted(next);
    setOpenId(id);
    const step = STEPS.find((s) => s.id === id);
    setAnnouncement(
      `${step?.title ?? "Step"} marked as not done. ${next.size} of ${total} steps done.`,
    );
  }

  function restart() {
    hasCelebrated.current = false;
    setCompleted(new Set());
    setOpenId(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 steps done.");
  }

  React.useEffect(() => {
    if (allDone) celebrationRef.current?.focus();
  }, [allDone]);

  return (
    <main className="min-h-dvh bg-muted/40 px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            <Rocket aria-hidden="true" />
            Getting started
          </Badge>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to Northwind, Priya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Finish these five quick steps to get your team up and running. It
            takes about 15 minutes in total.
          </p>
        </header>

        {allDone ? (
          <div
            ref={celebrationRef}
            tabIndex={-1}
            className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 animate-in fade-in zoom-in-95 duration-500"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 motion-reduce:hidden"
            >
              {CONFETTI.map((c) => (
                <span
                  key={c.id}
                  className={cn(
                    "absolute -top-3 block animate-[confetti-fall_linear_forwards]",
                    c.color,
                    c.round ? "rounded-full" : "rounded-[2px]",
                  )}
                  style={{
                    left: `${c.left}%`,
                    width: c.size,
                    height: c.size,
                    animation: `confetti-fall ${c.duration}s ${c.delay}s ease-in forwards`,
                  }}
                />
              ))}
            </div>
            <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PartyPopper aria-hidden="true" className="size-7" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-semibold sm:text-2xl">
                  You&apos;re all set!
                </h2>
                <p className="mx-auto max-w-md text-pretty text-muted-foreground">
                  Your profile, project, team, tools and notifications are
                  ready. Northwind is now set up for Priya&apos;s team.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  size="lg"
                  onClick={() =>
                    toast("Opening your dashboard…", {
                      description: "This is a demo, so there's nowhere to go.",
                    })
                  }
                >
                  Go to dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={restart}>
                  <RotateCcw aria-hidden="true" />
                  Restart checklist
                </Button>
              </div>
            </div>
            <style>{`
              @keyframes confetti-fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
              }
            `}</style>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your progress</CardTitle>
            <CardDescription>
              {allDone
                ? "Everything is complete."
                : `About ${remainingMinutes} min left to finish setup.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">
                {doneCount} of {total} steps complete
              </span>
              <span className="tabular-nums text-muted-foreground">
                {percent}%
              </span>
            </div>
            <Progress
              value={percent}
              aria-label="Onboarding progress"
              aria-valuetext={`${doneCount} of ${total} steps complete`}
              className="h-3"
            />
          </CardContent>
          <CardContent>
            <ol className="flex flex-col gap-2">
              {STEPS.map((step, index) => {
                const status = statusOf(step.id);
                const isOpen = openId === step.id;
                const panelId = `panel-${step.id}`;
                const buttonId = `trigger-${step.id}`;
                const Icon = step.icon;
                return (
                  <li
                    key={step.id}
                    className={cn(
                      "rounded-lg border transition-colors",
                      status === "current" && "border-primary/40 bg-accent/40",
                      status === "done" && "bg-muted/30",
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-4"
                      >
                        <StatusIndicator status={status} index={index} />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span
                            className={cn(
                              "font-medium",
                              status === "done" &&
                                "text-muted-foreground line-through decoration-muted-foreground/50",
                            )}
                          >
                            {step.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {step.summary}
                          </span>
                        </span>
                        <span className="sr-only">
                          {status === "done"
                            ? "Status: completed."
                            : status === "current"
                              ? "Status: up next."
                              : "Status: not started."}
                        </span>
                        <Badge
                          variant={status === "done" ? "default" : "outline"}
                          className="hidden shrink-0 sm:inline-flex"
                          aria-hidden="true"
                        >
                          {status === "done"
                            ? "Done"
                            : status === "current"
                              ? "Up next"
                              : `${step.minutes} min`}
                        </Badge>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                      className="px-3 pb-4 sm:px-4"
                    >
                      <div className="flex flex-col gap-4 sm:pl-11">
                        <div className="flex items-start gap-3 rounded-md bg-background/70 p-3 text-sm text-muted-foreground">
                          <Icon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-foreground"
                          />
                          <p className="text-pretty">{step.detail}</p>
                        </div>
                        {status === "done" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-fit"
                            onClick={() => undoStep(step.id)}
                          >
                            <RotateCcw aria-hidden="true" />
                            Mark as not done
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full sm:w-fit"
                            onClick={() => completeStep(step.id)}
                          >
                            <Check aria-hidden="true" />
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Need a hand? Our team replies within an hour on weekdays.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={restart}
              disabled={doneCount === 0}
            >
              <RotateCcw aria-hidden="true" />
              Reset progress
            </Button>
          </CardFooter>
        </Card>

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </main>
  );
}
```