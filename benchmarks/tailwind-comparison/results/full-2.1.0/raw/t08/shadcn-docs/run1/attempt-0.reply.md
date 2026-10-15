```tsx
"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  PartyPopper,
  RotateCcw,
  Sparkles,
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
  description: string;
  actionLabel: string;
  estimate: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description:
      "Add your name, role and a profile photo so teammates can recognise you in comments and mentions.",
    actionLabel: "Edit profile",
    estimate: "2 min",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description:
      "Choose a workspace name and URL. You can change these later from Settings, so don't overthink it.",
    actionLabel: "Open workspace settings",
    estimate: "1 min",
  },
  {
    id: "invite",
    title: "Invite your team",
    description:
      "Projects move faster together. Send invites by email and pick a default role for each person.",
    actionLabel: "Invite teammates",
    estimate: "3 min",
  },
  {
    id: "project",
    title: "Create your first project",
    description:
      "Start from a template such as Product Launch or Sprint Planning, or begin with a blank board.",
    actionLabel: "Browse templates",
    estimate: "4 min",
  },
  {
    id: "integrations",
    title: "Connect an integration",
    description:
      "Link Slack, GitHub or Google Calendar to get updates where you already work.",
    actionLabel: "View integrations",
    estimate: "2 min",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description:
      "Decide what is worth an email, what belongs in your inbox, and when to stay quiet.",
    actionLabel: "Manage notifications",
    estimate: "1 min",
  },
];

const CONFETTI_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.696 0.17 162.48)",
];

type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  color: string;
  round: boolean;
};

// Deterministic pseudo-random layout so server/client markup never diverges.
const CONFETTI: ConfettiPiece[] = Array.from({ length: 32 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const r = seed / 233280;
  return {
    left: (i * 100) / 32 + (r * 3 - 1.5),
    delay: ((i * 37) % 10) * 0.07,
    duration: 2.2 + ((i * 13) % 8) * 0.18,
    drift: Math.round((r - 0.5) * 120),
    rotate: 360 + Math.round(r * 540),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  };
});

function StatusIndicator({
  status,
}: {
  status: "done" | "current" | "upcoming";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
        status === "done" &&
          "border-primary bg-primary text-primary-foreground",
        status === "current" && "border-primary bg-background text-primary",
        status === "upcoming" &&
          "border-muted-foreground/30 bg-background text-muted-foreground/50",
      )}
    >
      {status === "done" ? (
        <Check className="size-4 animate-in zoom-in-50 duration-300" strokeWidth={3} />
      ) : status === "current" ? (
        <span className="size-2.5 rounded-full bg-primary" />
      ) : (
        <Circle className="size-3 opacity-0" />
      )}
    </span>
  );
}

export default function OnboardingPage() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(
    STEPS[0].id,
  );
  const [celebrating, setCelebrating] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const firstIncompleteId =
    STEPS.find((s) => !completed.has(s.id))?.id ?? null;

  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + parseInt(s.estimate, 10),
    0,
  );

  const toggleStep = (id: string, title: string) => {
    const next = new Set(completed);
    const wasDone = next.has(id);
    if (wasDone) {
      next.delete(id);
      setExpandedId(id);
    } else {
      next.add(id);
      const upcoming = STEPS.find((s) => !next.has(s.id));
      setExpandedId(upcoming ? upcoming.id : null);
    }
    setCompleted(next);

    if (next.size === total) {
      setCelebrating(true);
      toast.success("Onboarding complete!", {
        description: "Your workspace is ready to go.",
      });
    } else {
      setCelebrating(false);
      if (!wasDone) {
        toast(`“${title}” done`, {
          description: `${next.size} of ${total} steps complete.`,
        });
      }
    }
  };

  const reset = () => {
    setCompleted(new Set<string>());
    setExpandedId(STEPS[0].id);
    setCelebrating(false);
  };

  // Move focus to the celebration heading so screen-reader and keyboard users land on it.
  React.useEffect(() => {
    if (allDone) headingRef.current?.focus();
  }, [allDone]);

  return (
    <main className="min-h-dvh bg-muted/40 px-4 py-8 sm:py-12 lg:py-16">
      <style>{`
        @keyframes onb-confetti-fall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--onb-drift), 420px, 0) rotate(var(--onb-rotate)); opacity: 0; }
        }
        .onb-confetti {
          animation: onb-confetti-fall var(--onb-duration) cubic-bezier(0.2, 0.6, 0.4, 1) var(--onb-delay) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .onb-confetti { display: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <Card className="relative gap-0 overflow-hidden py-0">
          {celebrating && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[420px] overflow-hidden"
            >
              {CONFETTI.map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    "onb-confetti absolute top-0 block h-3 w-2",
                    p.round && "rounded-full",
                  )}
                  style={
                    {
                      left: `${p.left}%`,
                      backgroundColor: p.color,
                      "--onb-delay": `${p.delay}s`,
                      "--onb-duration": `${p.duration}s`,
                      "--onb-drift": `${p.drift}px`,
                      "--onb-rotate": `${p.rotate}deg`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          <CardHeader className="gap-3 border-b px-5 py-6 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <Badge variant="secondary" className="mb-1">
                  <Sparkles /> Getting started
                </Badge>
                <CardTitle className="text-2xl leading-tight">
                  Welcome to Northwind, Priya
                </CardTitle>
                <CardDescription>
                  Finish these six steps to get your team up and running.
                </CardDescription>
              </div>
              <div
                className="shrink-0 text-right"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="text-3xl leading-none font-semibold tabular-nums">
                  {percent}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {doneCount} of {total} done
                </p>
              </div>
            </div>

            <Progress
              value={percent}
              aria-label="Onboarding progress"
              aria-valuetext={`${doneCount} of ${total} steps complete`}
              className="h-2.5"
            />
          </CardHeader>

          {allDone ? (
            <CardContent className="px-5 py-10 sm:px-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in-50 duration-500">
                  <PartyPopper className="size-8" aria-hidden="true" />
                </div>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl font-semibold outline-none"
                >
                  You&apos;re all set!
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Your profile, workspace, team and integrations are ready.
                  Nice work, that was quicker than most teams manage.
                </p>
                <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button size="lg" onClick={() => toast("Opening your dashboard…")}>
                    Go to dashboard <ArrowRight />
                  </Button>
                  <Button size="lg" variant="outline" onClick={reset}>
                    <RotateCcw /> Start over
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="px-0">
              <ol className="divide-y">
                {STEPS.map((step, index) => {
                  const isDone = completed.has(step.id);
                  const isCurrent = step.id === firstIncompleteId;
                  const status = isDone
                    ? "done"
                    : isCurrent
                      ? "current"
                      : "upcoming";
                  const isOpen = expandedId === step.id;
                  const panelId = `panel-${step.id}`;
                  const buttonId = `trigger-${step.id}`;

                  return (
                    <li
                      key={step.id}
                      className={cn(
                        "transition-colors",
                        isCurrent && "bg-accent/50",
                      )}
                    >
                      <h3 className="m-0">
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() =>
                            setExpandedId(isOpen ? null : step.id)
                          }
                          className="flex w-full items-center gap-3 px-5 py-4 text-left outline-none focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset sm:gap-4 sm:px-8"
                        >
                          <StatusIndicator status={status} />
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                isDone &&
                                  "text-muted-foreground line-through decoration-muted-foreground/50",
                              )}
                            >
                              <span className="sr-only">
                                Step {index + 1}:{" "}
                              </span>
                              {step.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              <span className="sr-only">Status: </span>
                              {isDone
                                ? "Completed"
                                : isCurrent
                                  ? `Up next · about ${step.estimate}`
                                  : `About ${step.estimate}`}
                            </span>
                          </span>
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
                        className="px-5 pb-5 sm:px-8 sm:pl-[4.75rem]"
                      >
                        <p className="text-sm text-muted-foreground sm:pl-0 pl-10">
                          {step.description}
                        </p>
                        <div className="mt-4 flex flex-col gap-2 pl-10 sm:flex-row sm:pl-0">
                          {!isDone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toast.info(`${step.actionLabel}…`, {
                                  description:
                                    "In the real product this opens the relevant screen.",
                                })
                              }
                            >
                              {step.actionLabel}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={isDone ? "ghost" : "default"}
                            aria-pressed={isDone}
                            onClick={() => toggleStep(step.id, step.title)}
                          >
                            {isDone ? (
                              <>
                                <RotateCcw /> Mark as not done
                              </>
                            ) : (
                              <>
                                <Check /> Mark as done
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          )}

          {!allDone && (
            <CardFooter className="flex-col items-start justify-between gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:px-8">
              <p className="text-sm text-muted-foreground">
                {doneCount === 0
                  ? `About ${remainingMinutes} minutes to finish setup.`
                  : `Only about ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"} left. Keep going!`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={doneCount === 0}
              >
                <RotateCcw /> Reset progress
              </Button>
            </CardFooter>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need a hand? Our support team replies in under an hour on weekdays.
        </p>
      </div>
    </main>
  );
}
```