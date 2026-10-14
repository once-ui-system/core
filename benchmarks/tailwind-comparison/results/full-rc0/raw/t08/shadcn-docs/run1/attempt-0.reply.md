```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDashed,
  Clock,
  PartyPopper,
  RotateCcw,
  Sparkles,
  type LucideIcon,
  Users,
  Link2,
  FolderPlus,
  UserRound,
  Bell,
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
  action: string;
  minutes: number;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    summary: "Add your name, role and a photo so teammates recognise you.",
    detail:
      "Your profile appears next to comments, assignments and mentions. Add a display name, your role on the team and a profile photo. It takes less than a minute.",
    action: "Edit profile",
    minutes: 2,
    icon: UserRound,
  },
  {
    id: "workspace",
    title: "Create your first project",
    summary: "Set up a project called “Q3 Website Relaunch” or start your own.",
    detail:
      "Projects keep tasks, files and discussions in one place. Start from a template such as Product Launch, Sprint Board or Content Calendar, or begin with a blank board.",
    action: "Create project",
    minutes: 3,
    icon: FolderPlus,
  },
  {
    id: "invite",
    title: "Invite your teammates",
    summary: "Bring in at least two colleagues to collaborate with.",
    detail:
      "Send invitations by email or share a magic link. Invited teammates join with the Member role by default, and you can change roles at any time from Settings.",
    action: "Send invites",
    minutes: 2,
    icon: Users,
  },
  {
    id: "integrations",
    title: "Connect Slack or Google Calendar",
    summary: "Get updates where you already work.",
    detail:
      "Connect an integration to post task updates to a Slack channel or sync due dates with Google Calendar. You can disconnect it whenever you like.",
    action: "Browse integrations",
    minutes: 4,
    icon: Link2,
  },
  {
    id: "notifications",
    title: "Choose notification preferences",
    summary: "Decide what’s worth interrupting you for.",
    detail:
      "Pick between instant alerts, a daily digest or weekly summaries for mentions, assignments and due dates. Quiet hours keep evenings and weekends free.",
    action: "Set preferences",
    minutes: 1,
    icon: Bell,
  },
];

type Status = "done" | "current" | "todo";

const CONFETTI_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

// Deterministic pseudo-random layout so server and client markup agree.
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r = seed / 233280;
  return {
    left: Math.round(((i + 0.5) / 28) * 100),
    delay: Math.round(r * 700) / 1000,
    duration: 1.6 + Math.round(r * 1000) / 1000,
    drift: Math.round((r - 0.5) * 120),
    rotate: Math.round(r * 720),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  };
});

function StatusIndicator({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors"
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-primary ring-4 ring-primary/10 transition-colors"
      >
        <span className="size-2.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors"
    >
      <CircleDashed className="size-4" />
    </span>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  done: "Completed",
  current: "Up next",
  todo: "Not started",
};

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set<string>(["profile"]),
  );
  const [openId, setOpenId] = useState<string | null>("workspace");
  const [announcement, setAnnouncement] = useState("");
  const celebrationRef = useRef<HTMLHeadingElement>(null);
  const wasCompleteRef = useRef(false);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const minutesLeft = useMemo(
    () =>
      STEPS.filter((s) => !completed.has(s.id)).reduce(
        (sum, s) => sum + s.minutes,
        0,
      ),
    [completed],
  );

  const statusOf = useCallback(
    (id: string): Status =>
      completed.has(id) ? "done" : id === currentId ? "current" : "todo",
    [completed, currentId],
  );

  const toggleStep = useCallback(
    (step: Step) => {
      const next = new Set(completed);
      const nowDone = !next.has(step.id);
      if (nowDone) {
        next.add(step.id);
      } else {
        next.delete(step.id);
      }
      setCompleted(next);

      const remaining = STEPS.filter((s) => !next.has(s.id));
      if (nowDone) {
        // Move the open panel to the next unfinished step.
        setOpenId(remaining.length > 0 ? remaining[0].id : null);
        setAnnouncement(
          remaining.length === 0
            ? "All steps complete. Your workspace is ready."
            : `${step.title} marked complete. ${next.size} of ${total} steps done.`,
        );
      } else {
        setOpenId(step.id);
        setAnnouncement(
          `${step.title} marked incomplete. ${next.size} of ${total} steps done.`,
        );
      }
    },
    [completed, total],
  );

  const reset = useCallback(() => {
    setCompleted(new Set<string>());
    setOpenId(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 of 5 steps done.");
  }, []);

  // Celebrate once when the final step is completed.
  useEffect(() => {
    if (allDone && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      toast.success("You’re all set!", {
        description: "Your workspace is ready for the team.",
      });
      celebrationRef.current?.focus();
    }
    if (!allDone) {
      wasCompleteRef.current = false;
    }
  }, [allDone]);

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <style>{`
        @keyframes onb-confetti-fall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--onb-drift), 340px, 0) rotate(var(--onb-rot)); opacity: 0; }
        }
        @keyframes onb-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        .onb-confetti { animation: onb-confetti-fall var(--onb-dur) ease-out var(--onb-delay) both; }
        .onb-pop { animation: onb-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .onb-confetti { display: none; }
          .onb-pop { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles aria-hidden="true" />
            Getting started
          </Badge>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to Northwind, Priya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Finish these five quick steps to get your team up and running.
          </p>
        </header>

        <Card className="relative overflow-hidden">
          {allDone && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden"
            >
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    "onb-confetti absolute top-0 block h-3 w-2",
                    c.color,
                    c.round && "rounded-full",
                  )}
                  style={
                    {
                      left: `${c.left}%`,
                      "--onb-delay": `${c.delay}s`,
                      "--onb-dur": `${c.duration}s`,
                      "--onb-drift": `${c.drift}px`,
                      "--onb-rot": `${c.rotate}deg`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          <CardHeader>
            {allDone ? (
              <div className="onb-pop flex flex-col items-center gap-3 py-2 text-center">
                <span
                  aria-hidden="true"
                  className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <PartyPopper className="size-7" />
                </span>
                <CardTitle asChild={false} className="text-xl leading-tight">
                  <h2
                    ref={celebrationRef}
                    tabIndex={-1}
                    className="outline-none"
                  >
                    You’re all set, Priya!
                  </h2>
                </CardTitle>
                <CardDescription className="max-w-sm text-pretty">
                  Your profile, project, team and preferences are ready.
                  Northwind is yours to explore.
                </CardDescription>
              </div>
            ) : (
              <>
                <CardTitle className="text-lg">
                  <h2>Your setup progress</h2>
                </CardTitle>
                <CardDescription>
                  {doneCount === 0
                    ? "Nothing done yet. Start with the first step below."
                    : `${doneCount} of ${total} steps complete · about ${minutesLeft} min left`}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium" id="onb-progress-label">
                  {allDone ? "Setup complete" : "Overall progress"}
                </span>
                <span
                  className="tabular-nums text-muted-foreground"
                  aria-hidden="true"
                >
                  {percent}%
                </span>
              </div>
              <Progress
                value={percent}
                aria-labelledby="onb-progress-label"
                aria-valuetext={`${doneCount} of ${total} steps complete`}
                className="h-2.5"
              />
            </div>

            <ol className="space-y-3">
              {STEPS.map((step, index) => {
                const status = statusOf(step.id);
                const isOpen = openId === step.id;
                const Icon = step.icon;
                const panelId = `onb-panel-${step.id}`;
                const buttonId = `onb-trigger-${step.id}`;

                return (
                  <li
                    key={step.id}
                    className={cn(
                      "rounded-lg border bg-card transition-colors",
                      status === "current" && "border-primary/40 shadow-xs",
                      status === "done" && "bg-muted/40",
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:gap-4 sm:p-4"
                      >
                        <StatusIndicator status={status} />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                              className={cn(
                                "text-sm font-medium sm:text-base",
                                status === "done" &&
                                  "text-muted-foreground line-through decoration-muted-foreground/50",
                              )}
                            >
                              <span className="sr-only">
                                Step {index + 1}:{" "}
                              </span>
                              {step.title}
                            </span>
                            <Badge
                              variant={status === "current" ? "default" : "outline"}
                              className={cn(
                                "text-[0.7rem]",
                                status === "todo" && "text-muted-foreground",
                              )}
                            >
                              <span className="sr-only">Status: </span>
                              {STATUS_LABEL[status]}
                            </Badge>
                          </span>
                          <span className="mt-0.5 block text-sm text-muted-foreground">
                            {step.summary}
                          </span>
                        </span>
                        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {step.minutes} min
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
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
                      className="px-3 pb-3 sm:px-4 sm:pb-4"
                    >
                      <div className="space-y-4 border-t pt-4 sm:ml-12">
                        <div className="flex items-start gap-3">
                          <Icon
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-pretty text-muted-foreground">
                            {step.detail}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          {status !== "done" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toast.info(`${step.action}`, {
                                  description:
                                    "This is a demo, so nothing is changed. Mark the step as done when you’re finished.",
                                })
                              }
                            >
                              {step.action}
                              <ArrowRight aria-hidden="true" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant={status === "done" ? "ghost" : "default"}
                            onClick={() => toggleStep(step)}
                          >
                            {status === "done" ? (
                              <>
                                <RotateCcw aria-hidden="true" />
                                Mark as not done
                              </>
                            ) : (
                              <>
                                <Check aria-hidden="true" />
                                Mark as done
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {allDone
                ? "Nice work. You can revisit any step from Settings."
                : "You can come back to this checklist anytime."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {allDone && (
                <Button type="button" size="sm">
                  Go to dashboard
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={doneCount === 0}
              >
                <RotateCcw aria-hidden="true" />
                Reset checklist
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </main>
  );
}
```