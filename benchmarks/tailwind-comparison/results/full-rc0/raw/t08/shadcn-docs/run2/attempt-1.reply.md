```tsx
"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
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
  detail: string;
  actionLabel: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    description: "Add your team name, logo and time zone.",
    detail:
      "A complete profile helps teammates recognise your workspace in invitations and notification emails. You can change any of this later in Settings.",
    actionLabel: "Edit profile",
    minutes: 2,
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    description: "Bring in at least two people to collaborate with.",
    detail:
      "Send invitations by email or share a join link. Invited members can be assigned the Admin, Editor or Viewer role before they accept.",
    actionLabel: "Invite people",
    minutes: 3,
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from a template or from a blank board.",
    detail:
      "Projects keep tasks, files and discussions together. Try the 'Product launch' template to see how milestones and owners are laid out.",
    actionLabel: "New project",
    minutes: 4,
  },
  {
    id: "integrations",
    title: "Connect Slack or Google Calendar",
    description: "Get updates where your team already works.",
    detail:
      "Connected apps post task updates to a channel and sync due dates to your calendar. Permissions can be revoked at any time.",
    actionLabel: "Browse integrations",
    minutes: 3,
  },
  {
    id: "notifications",
    title: "Set your notification preferences",
    description: "Choose what is worth interrupting you for.",
    detail:
      "Pick between instant, daily digest or mentions-only. Quiet hours are respected on every device you are signed in on.",
    actionLabel: "Open preferences",
    minutes: 1,
  },
];

const CONFETTI_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

// Deterministic pieces so server and client markup always match.
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  const distance = 90 + ((i * 37) % 70);
  return {
    id: i,
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance) - 30,
    rotate: (i * 53) % 360,
    delay: (i % 7) * 40,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  };
});

function ConfettiBurst() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-10 flex justify-center motion-reduce:hidden"
    >
      <div className="relative size-0">
        {CONFETTI.map((piece) => (
          <span
            key={piece.id}
            className={cn(
              "confetti-piece absolute block h-2 w-1.5",
              piece.color,
              piece.round && "rounded-full",
            )}
            style={
              {
                "--x": `${piece.x}px`,
                "--y": `${piece.y}px`,
                "--r": `${piece.rotate}deg`,
                animationDelay: `${piece.delay}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

type StatusProps = {
  state: "done" | "current" | "upcoming";
  index: number;
};

function StatusIndicator({ state, index }: StatusProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
        state === "done" &&
          "border-primary bg-primary text-primary-foreground",
        state === "current" &&
          "border-primary bg-background text-foreground ring-4 ring-primary/15",
        state === "upcoming" &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {state === "done" ? <Check className="size-4" /> : index + 1}
    </span>
  );
}

export default function Page() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set(["profile"]),
  );
  const [expandedId, setExpandedId] = React.useState<string | null>("invite");
  const [announcement, setAnnouncement] = React.useState("");

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentId = STEPS.find((s) => !completed.has(s.id))?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  function setStepDone(step: Step, done: boolean) {
    const next = new Set(completed);
    if (done) next.add(step.id);
    else next.delete(step.id);
    setCompleted(next);

    const nextDone = next.size;
    if (done) {
      if (nextDone === total) {
        setAnnouncement("All steps complete. Your workspace is ready.");
        toast.success("Your workspace is ready!", {
          description: "Onboarding complete. Nice work.",
        });
        setExpandedId(null);
      } else {
        setAnnouncement(
          `${step.title} marked complete. ${nextDone} of ${total} steps done.`,
        );
        const following = STEPS.find((s) => !next.has(s.id));
        setExpandedId(following ? following.id : null);
      }
    } else {
      setAnnouncement(
        `${step.title} marked incomplete. ${nextDone} of ${total} steps done.`,
      );
      setExpandedId(step.id);
    }
  }

  function reset() {
    setCompleted(new Set());
    setExpandedId(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 steps done.");
  }

  return (
    <main className="min-h-dvh bg-muted/40 px-4 py-8 sm:py-12">
      <style>{`
        @keyframes confetti-burst {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(0.6); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--x), calc(var(--y) + 80px)) rotate(calc(var(--r) + 540deg)) scale(1); }
        }
        .confetti-piece {
          animation: confetti-burst 1500ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        .pop-in { animation: pop-in 400ms cubic-bezier(0.3, 1.4, 0.5, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece, .pop-in { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <Card className="relative overflow-hidden">
          {allDone && <ConfettiBurst />}

          <CardHeader>
            {allDone ? (
              <div className="flex flex-col items-center gap-3 pt-2 text-center">
                <span className="pop-in flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <PartyPopper className="size-7" aria-hidden="true" />
                </span>
                <CardTitle className="text-2xl leading-tight">
                  <h1>You&apos;re all set, Maya!</h1>
                </CardTitle>
                <CardDescription className="max-w-md text-balance">
                  Northwind Studio is ready to go. Your team can start planning,
                  tracking and shipping together.
                </CardDescription>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles aria-hidden="true" />
                  Getting started
                </Badge>
                <CardTitle className="text-2xl leading-tight">
                  <h1>Set up Northwind Studio</h1>
                </CardTitle>
                <CardDescription>
                  Finish these {total} steps to get the most out of your
                  workspace. About {remainingMinutes} min left.
                </CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">
                  {allDone ? "Setup complete" : "Your progress"}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {doneCount} of {total} steps · {percent}%
                </span>
              </div>
              <Progress
                value={percent}
                aria-label="Onboarding progress"
                aria-valuetext={`${doneCount} of ${total} steps complete`}
                className="h-2.5"
              />
            </div>

            <ol className="flex flex-col gap-3" aria-label="Onboarding steps">
              {STEPS.map((step, index) => {
                const isDone = completed.has(step.id);
                const state: StatusProps["state"] = isDone
                  ? "done"
                  : step.id === currentId
                    ? "current"
                    : "upcoming";
                const expanded = expandedId === step.id;
                const panelId = `step-panel-${step.id}`;
                const buttonId = `step-button-${step.id}`;

                return (
                  <li
                    key={step.id}
                    aria-current={state === "current" ? "step" : undefined}
                    className={cn(
                      "rounded-lg border bg-card transition-colors",
                      state === "current" && "border-primary/40 shadow-xs",
                      isDone && "bg-muted/40",
                    )}
                  >
                    <h2 className="m-0">
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() =>
                          setExpandedId(expanded ? null : step.id)
                        }
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-4"
                      >
                        <StatusIndicator state={state} index={index} />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span
                            className={cn(
                              "text-sm leading-snug font-medium sm:text-base",
                              isDone &&
                                "text-muted-foreground line-through decoration-muted-foreground/50",
                            )}
                          >
                            {step.title}
                          </span>
                          <span className="text-xs text-muted-foreground sm:text-sm">
                            {step.description}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={state === "done" ? "default" : "outline"}
                            className={cn(
                              "hidden sm:inline-flex",
                              state === "upcoming" && "text-muted-foreground",
                            )}
                          >
                            {state === "done"
                              ? "Done"
                              : state === "current"
                                ? "Up next"
                                : `${step.minutes} min`}
                          </Badge>
                          <span className="sr-only sm:hidden">
                            {state === "done"
                              ? "Done"
                              : state === "current"
                                ? "Up next"
                                : `${step.minutes} minutes`}
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              "size-4 text-muted-foreground transition-transform motion-reduce:transition-none",
                              expanded && "rotate-180",
                            )}
                          />
                        </span>
                      </button>
                    </h2>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!expanded}
                      className="px-3 pb-3 sm:px-4 sm:pb-4"
                    >
                      <div className="flex flex-col gap-3 sm:pl-11">
                        <p className="text-sm text-muted-foreground">
                          {step.detail}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {!isDone && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toast.info(`${step.actionLabel}`, {
                                  description:
                                    "This is a demo, so nothing was opened.",
                                })
                              }
                            >
                              {step.actionLabel}
                              <ArrowRight aria-hidden="true" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant={isDone ? "ghost" : "default"}
                            onClick={() => setStepDone(step, !isDone)}
                          >
                            {isDone ? (
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
            {allDone ? (
              <>
                <p className="text-center text-sm text-muted-foreground sm:text-left">
                  Tip: you can revisit any step from Settings at any time.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" onClick={reset}>
                    <RotateCcw aria-hidden="true" />
                    Restart checklist
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      toast.success("Welcome aboard!", {
                        description: "Taking you to your dashboard (demo).",
                      })
                    }
                  >
                    Go to dashboard
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {total - doneCount}{" "}
                  {total - doneCount === 1 ? "step" : "steps"} remaining
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast("Reminder set", {
                      description: "We'll nudge you again tomorrow morning.",
                    })
                  }
                >
                  Remind me later
                </Button>
              </>
            )}
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