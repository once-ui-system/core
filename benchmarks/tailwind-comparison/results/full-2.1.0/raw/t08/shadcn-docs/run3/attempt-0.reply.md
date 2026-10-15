```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  PartyPopper,
  RotateCcw,
  Sparkles,
  UserRound,
  Users,
  PlugZap,
  FolderKanban,
  Bell,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Step = {
  id: string;
  title: string;
  description: string;
  hint: string;
  cta: string;
  icon: LucideIcon;
  estimate: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and a photo so teammates recognise you.",
    hint: "Head to Settings → Profile and fill in your display name and job title.",
    cta: "Edit profile",
    icon: UserRound,
    estimate: "1 min",
  },
  {
    id: "workspace",
    title: "Create your first project",
    description: "Projects keep tasks, files and conversations in one place.",
    hint: "Try a template like “Product launch” to get a prefilled board.",
    cta: "New project",
    icon: FolderKanban,
    estimate: "2 min",
  },
  {
    id: "invite",
    title: "Invite your teammates",
    description: "Collaboration works best together. Invite up to 5 people for free.",
    hint: "Paste email addresses separated by commas, or share an invite link.",
    cta: "Invite people",
    icon: Users,
    estimate: "1 min",
  },
  {
    id: "integrations",
    title: "Connect an integration",
    description: "Sync Slack, GitHub or Google Calendar to keep everything in sync.",
    hint: "Pick the tool your team uses most — you can add more later.",
    cta: "Browse integrations",
    icon: PlugZap,
    estimate: "3 min",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description: "Choose how and when you want to hear about updates.",
    hint: "We recommend a daily digest plus instant alerts for @mentions.",
    cta: "Open preferences",
    icon: Bell,
    estimate: "1 min",
  },
];

const CONFETTI_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  color: string;
  round: boolean;
};

// Deterministic pseudo-random layout (no Math.random → no hydration mismatch)
const CONFETTI: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: ((i * 53) % 90) / 100,
  duration: 1.8 + ((i * 29) % 12) / 10,
  size: 6 + ((i * 7) % 6),
  rotate: (i * 47) % 360,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}));

function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      <style>{`
        @keyframes onboarding-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          className={cn(
            "absolute top-0 block opacity-0",
            piece.color,
            piece.round ? "rounded-full" : "rounded-[2px]"
          )}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.6,
            rotate: `${piece.rotate}deg`,
            animation: `onboarding-fall ${piece.duration}s ease-in ${piece.delay}s 1 forwards`,
          }}
        />
      ))}
    </div>
  );
}

type Status = "done" | "current" | "todo";

function StatusIndicator({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <Badge
        variant="secondary"
        className="gap-1 text-emerald-700 dark:text-emerald-400"
      >
        <CheckCircle2 aria-hidden="true" />
        Done
      </Badge>
    );
  }
  if (status === "current") {
    return (
      <Badge variant="default" className="gap-1">
        <CircleDot aria-hidden="true" />
        Up next
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Circle aria-hidden="true" />
      To do
    </Badge>
  );
}

export default function OnboardingPage() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set(["profile"])
  );
  const [justFinished, setJustFinished] = React.useState(false);
  const celebrationRef = React.useRef<HTMLDivElement>(null);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentId = STEPS.find((s) => !completed.has(s.id))?.id ?? null;

  const toggle = React.useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(completed);
      if (checked) next.add(id);
      else next.delete(id);
      setCompleted(next);

      if (next.size === total) {
        setJustFinished(true);
        toast.success("Onboarding complete!", {
          description: "You’re all set to start collaborating.",
        });
      } else {
        setJustFinished(false);
      }
    },
    [completed, total]
  );

  const reset = () => {
    setCompleted(new Set());
    setJustFinished(false);
  };

  // Move focus to the celebration so screen-reader users hear it
  React.useEffect(() => {
    if (justFinished) celebrationRef.current?.focus();
  }, [justFinished]);

  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + parseInt(s.estimate, 10),
    0
  );

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2 text-center sm:text-left">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
            Welcome to Northwind
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Let’s get your workspace ready, Priya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Finish these five quick steps to unlock the full experience.
          </p>
        </header>

        <Card className="relative overflow-hidden">
          {allDone && <Confetti />}

          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span id="checklist-title">Getting started</span>
              <Badge variant={allDone ? "default" : "secondary"}>
                {doneCount} of {total} complete
              </Badge>
            </CardTitle>
            <CardDescription>
              {allDone
                ? "Everything is set up."
                : `About ${remainingMinutes} min left`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="tabular-nums text-muted-foreground">
                  {percent}%
                </span>
              </div>
              <Progress
                value={percent}
                aria-labelledby="checklist-title"
                aria-valuetext={`${doneCount} of ${total} steps complete`}
                className="h-2.5"
              />
            </div>

            {allDone && (
              <div
                ref={celebrationRef}
                tabIndex={-1}
                role="status"
                className="relative flex flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in-0 motion-safe:duration-500"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white motion-safe:animate-bounce">
                  <PartyPopper className="size-6" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold">
                  You’re all set — nice work!
                </h2>
                <p className="max-w-sm text-pretty text-sm text-muted-foreground">
                  Your profile, project, team and integrations are ready.
                  Jump in and ship something great.
                </p>
                <Button
                  onClick={() =>
                    toast("Opening your dashboard…", {
                      description: "This is a demo, so nothing will load.",
                    })
                  }
                >
                  <Rocket aria-hidden="true" />
                  Go to dashboard
                </Button>
              </div>
            )}

            <ol className="space-y-3" aria-labelledby="checklist-title">
              {STEPS.map((step, index) => {
                const isDone = completed.has(step.id);
                const status: Status = isDone
                  ? "done"
                  : step.id === currentId
                    ? "current"
                    : "todo";
                const Icon = step.icon;
                const checkboxId = `step-${step.id}`;
                const descId = `step-${step.id}-desc`;

                return (
                  <li
                    key={step.id}
                    data-status={status}
                    className={cn(
                      "rounded-lg border p-4 transition-colors",
                      status === "current" &&
                        "border-primary/40 bg-accent/60 shadow-xs",
                      status === "done" && "bg-muted/40",
                      status === "todo" && "bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={checkboxId}
                        aria-describedby={descId}
                        checked={isDone}
                        onCheckedChange={(value) =>
                          toggle(step.id, value === true)
                        }
                        className="mt-1 size-5 rounded-full data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-emerald-600"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <label
                            htmlFor={checkboxId}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 text-sm font-medium leading-snug",
                              isDone && "text-muted-foreground line-through"
                            )}
                          >
                            <Icon
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Step {index + 1}: </span>
                            {step.title}
                          </label>
                          <StatusIndicator status={status} />
                        </div>

                        <p
                          id={descId}
                          className="text-sm text-muted-foreground"
                        >
                          {step.description}
                          <span className="sr-only">
                            {" "}
                            Estimated time {step.estimate}.
                          </span>
                        </p>

                        {status === "current" && (
                          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                              {step.hint}
                            </p>
                            <Button
                              size="sm"
                              className="w-full shrink-0 sm:w-auto"
                              onClick={() =>
                                toast.info(step.cta, {
                                  description:
                                    "Demo only — mark the step as done with the checkbox.",
                                })
                              }
                            >
                              {step.cta}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              You can come back to this checklist anytime from the Help menu.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={doneCount === 0}
            >
              <RotateCcw aria-hidden="true" />
              Reset checklist
            </Button>
          </CardFooter>
        </Card>

        {/* Polite live announcement of progress for assistive tech */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {allDone
            ? "All onboarding steps complete. Congratulations!"
            : `${doneCount} of ${total} onboarding steps complete, ${percent} percent.`}
        </p>
      </div>
    </main>
  );
}
```