```tsx
"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  CircleDashed,
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
  action: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description:
      "Add your name, role and a photo so teammates know who they're working with.",
    action: "Edit profile",
    minutes: 2,
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description:
      "Pick a workspace name and URL, like northwind.acme.app, for your team.",
    action: "Open settings",
    minutes: 1,
  },
  {
    id: "invite",
    title: "Invite two teammates",
    description:
      "Projects move faster together. Send invites by email or share a join link.",
    action: "Invite people",
    minutes: 3,
  },
  {
    id: "project",
    title: "Create your first project",
    description:
      "Start from a template such as Product Launch or Sprint Planning, or begin from scratch.",
    action: "New project",
    minutes: 4,
  },
  {
    id: "integration",
    title: "Connect Slack or GitHub",
    description:
      "Get updates where your team already works and link pull requests to tasks.",
    action: "Browse integrations",
    minutes: 3,
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description:
      "Choose what lands in your inbox and what stays quiet so you can focus.",
    action: "Manage alerts",
    minutes: 1,
  },
];

const CONFETTI = [
  { left: "6%", color: "bg-chart-1", delay: "0ms", duration: "2600ms", size: "size-2" },
  { left: "14%", color: "bg-chart-2", delay: "150ms", duration: "3000ms", size: "size-1.5" },
  { left: "22%", color: "bg-chart-4", delay: "50ms", duration: "2800ms", size: "size-2.5" },
  { left: "31%", color: "bg-chart-5", delay: "300ms", duration: "3200ms", size: "size-1.5" },
  { left: "40%", color: "bg-chart-3", delay: "100ms", duration: "2700ms", size: "size-2" },
  { left: "49%", color: "bg-chart-1", delay: "250ms", duration: "3100ms", size: "size-2.5" },
  { left: "58%", color: "bg-chart-2", delay: "0ms", duration: "2900ms", size: "size-1.5" },
  { left: "67%", color: "bg-chart-4", delay: "200ms", duration: "2600ms", size: "size-2" },
  { left: "76%", color: "bg-chart-5", delay: "120ms", duration: "3000ms", size: "size-2.5" },
  { left: "84%", color: "bg-chart-3", delay: "350ms", duration: "2800ms", size: "size-1.5" },
  { left: "92%", color: "bg-chart-1", delay: "80ms", duration: "3200ms", size: "size-2" },
];

function ConfettiBurst() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden motion-reduce:hidden"
    >
      <style>{`
        @keyframes onboarding-confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          className={cn("absolute top-0 rounded-[2px]", piece.color, piece.size)}
          style={{
            left: piece.left,
            opacity: 0,
            animation: `onboarding-confetti-fall ${piece.duration} ease-out ${piece.delay} 1 forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set(["profile", "workspace"]),
  );
  const wasCompleteRef = React.useRef(false);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const isComplete = doneCount === total;
  const currentId = STEPS.find((s) => !completed.has(s.id))?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  React.useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      toast.success("Onboarding complete!", {
        description: "Your workspace is ready to go.",
      });
    }
    wasCompleteRef.current = isComplete;
  }, [isComplete]);

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function reset() {
    setCompleted(new Set());
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles aria-hidden="true" />
            Getting started
          </Badge>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to Acme, Priya
          </h1>
          <p className="text-pretty text-muted-foreground">
            Finish these six steps to get your team set up. It only takes a few
            minutes, and you can come back anytime.
          </p>
        </header>

        <Card className="relative overflow-hidden">
          {isComplete && <ConfettiBurst />}
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 text-base">
              <span>Your setup progress</span>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {doneCount} of {total} complete
              </span>
            </CardTitle>
            <CardDescription>
              {isComplete
                ? "Everything is done. Nice work!"
                : `About ${remainingMinutes} min left`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress
              value={percent}
              aria-label="Onboarding progress"
              aria-valuetext={`${percent}% complete, ${doneCount} of ${total} steps done`}
              className={cn("h-3", isComplete && "bg-emerald-500/20")}
            />
            <div
              className="flex justify-between text-xs tabular-nums text-muted-foreground"
              aria-hidden="true"
            >
              <span>0%</span>
              <span className="font-medium text-foreground">{percent}%</span>
              <span>100%</span>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {isComplete
                ? "All onboarding steps are complete."
                : `${doneCount} of ${total} steps complete.`}
            </p>
          </CardContent>
        </Card>

        {isComplete && (
          <Card className="relative overflow-hidden border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
            <ConfettiBurst />
            <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white motion-safe:animate-bounce"
              >
                <PartyPopper className="size-7" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold">You&apos;re all set!</h2>
                <p className="text-sm text-muted-foreground">
                  Your workspace is configured and your team is ready to ship.
                  Head to your dashboard to see what&apos;s next.
                </p>
              </div>
              <Button
                onClick={() =>
                  toast("Opening your dashboard…", {
                    description: "This is a demo, so there's nowhere to go yet.",
                  })
                }
              >
                Go to dashboard
                <ArrowRight aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist</CardTitle>
            <CardDescription>
              Mark steps done as you go. You can undo any of them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {STEPS.map((step, index) => {
                const done = completed.has(step.id);
                const current = step.id === currentId;
                const status = done ? "Completed" : current ? "Up next" : "To do";
                const titleId = `step-title-${step.id}`;
                const descId = `step-desc-${step.id}`;

                return (
                  <li
                    key={step.id}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "flex gap-3 rounded-lg border p-3 transition-colors sm:gap-4 sm:p-4",
                      done && "bg-muted/50",
                      current && "border-primary/50 bg-accent/60 shadow-xs",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(step.id)}
                      aria-pressed={done}
                      aria-labelledby={titleId}
                      aria-describedby={descId}
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        done
                          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                          : current
                            ? "border-primary text-primary hover:bg-primary/10"
                            : "border-muted-foreground/40 text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                      ) : current ? (
                        <span className="text-xs font-semibold tabular-nums" aria-hidden="true">
                          {index + 1}
                        </span>
                      ) : (
                        <CircleDashed className="size-4" aria-hidden="true" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3
                          id={titleId}
                          className={cn(
                            "text-sm font-medium sm:text-base",
                            done && "text-muted-foreground line-through decoration-1",
                          )}
                        >
                          {step.title}
                        </h3>
                        <Badge
                          variant={current ? "default" : "outline"}
                          className={cn(
                            done &&
                              "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
                            !done && !current && "text-muted-foreground",
                          )}
                        >
                          {status}
                        </Badge>
                      </div>
                      <p id={descId} className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {!done && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button
                            size="sm"
                            variant={current ? "default" : "outline"}
                            onClick={() => toggle(step.id)}
                          >
                            {step.action}
                            <span className="sr-only">
                              {" "}
                              and mark &ldquo;{step.title}&rdquo; as done
                            </span>
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            ~{step.minutes} min
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Progress is kept for this session only.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={doneCount === 0}
            >
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
```