"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  FolderPlus,
  Link2,
  PartyPopper,
  RotateCcw,
  Rocket,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description:
      "Add your name, role and a photo so teammates know who they're working with.",
    action: "Edit profile",
    minutes: 2,
    icon: UserRound,
  },
  {
    id: "workspace",
    title: "Create your first workspace",
    description:
      "Workspaces keep projects, files and conversations for a team in one place.",
    action: "Create workspace",
    minutes: 3,
    icon: FolderPlus,
  },
  {
    id: "invite",
    title: "Invite your teammates",
    description:
      "Send invites to at least two colleagues. Collaborators join with a single click.",
    action: "Invite people",
    minutes: 2,
    icon: Users,
  },
  {
    id: "integrations",
    title: "Connect Slack or GitHub",
    description:
      "Get deploy notifications and pull request updates right where your team already talks.",
    action: "Connect an app",
    minutes: 4,
    icon: Link2,
  },
  {
    id: "launch",
    title: "Publish your first project",
    description:
      "Ship a draft to your staging URL and share the preview link with your team.",
    action: "Publish project",
    minutes: 5,
    icon: Rocket,
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
  drift: number;
  rotate: number;
  color: string;
  tall: boolean;
};

// Deterministic pseudo-random layout so server and client markup never diverge.
const CONFETTI: ConfettiPiece[] = Array.from({ length: 36 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: r(1) * 100,
    delay: r(2) * 0.6,
    duration: 2.2 + r(3) * 1.6,
    drift: (r(4) - 0.5) * 120,
    rotate: 360 + r(5) * 540,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    tall: r(6) > 0.5,
  };
});

function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className={cn(
            "confetti-piece absolute -top-4 block rounded-[2px]",
            p.color,
            p.tall ? "h-3 w-1.5" : "h-2 w-2.5",
          )}
          style={
            {
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

type Status = "done" | "current" | "upcoming";

function StatusIndicator({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-4" aria-hidden="true" />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
        <CircleDot className="size-4" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-background text-muted-foreground">
      <Circle className="size-3.5" aria-hidden="true" />
    </span>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  done: "Completed",
  current: "Up next",
  upcoming: "Not started",
};

export default function OnboardingPage() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(["profile"]),
  );
  const [announcement, setAnnouncement] = React.useState("");
  const [celebrating, setCelebrating] = React.useState(false);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentId = STEPS.find((s) => !completed.has(s.id))?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed.has(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  function completeStep(step: Step) {
    if (completed.has(step.id)) return;
    const next = new Set(completed);
    next.add(step.id);
    setCompleted(next);

    if (next.size === total) {
      setCelebrating(true);
      setAnnouncement("All steps complete. Your workspace is ready.");
      toast.success("You're all set!", {
        description: "Onboarding complete. Welcome aboard.",
      });
      // Move focus to the celebration heading for keyboard and screen reader users.
      requestAnimationFrame(() => headingRef.current?.focus());
    } else {
      setAnnouncement(
        `${step.title} completed. ${next.size} of ${total} steps done.`,
      );
    }
  }

  function undoStep(step: Step) {
    if (!completed.has(step.id)) return;
    const next = new Set(completed);
    next.delete(step.id);
    setCompleted(next);
    setAnnouncement(
      `${step.title} marked as not done. ${next.size} of ${total} steps done.`,
    );
  }

  function reset() {
    setCompleted(new Set());
    setCelebrating(false);
    setAnnouncement("Checklist reset. 0 steps done.");
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate3d(var(--drift), 420px, 0) rotate(var(--rotate)); opacity: 0; }
        }
        .confetti-piece {
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.25, 0.6, 0.4, 1);
          animation-fill-mode: both;
          animation-iteration-count: 1;
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pop-in { animation: pop-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .pop-in { animation: none; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            Welcome to Northwind Studio
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s get your team set up
          </h1>
        </header>

        {allDone ? (
          <Card className="relative overflow-hidden" aria-labelledby="done-title">
            {celebrating && <Confetti />}
            <CardContent className="relative flex flex-col items-center gap-4 py-6 text-center">
              <span className="pop-in flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PartyPopper className="size-8" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <h2
                  id="done-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-xl font-semibold tracking-tight outline-none sm:text-2xl"
                >
                  You&apos;re all set, nice work!
                </h2>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  All {total} onboarding steps are done. Your workspace is live
                  and your team is ready to start shipping together.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <Progress
                  value={100}
                  aria-label="Onboarding progress"
                  aria-valuetext="100% complete"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() =>
                    toast("Opening your dashboard…", {
                      description: "This is a demo, so nothing will load.",
                    })
                  }
                >
                  <Sparkles aria-hidden="true" />
                  Go to dashboard
                </Button>
                <Button size="lg" variant="outline" onClick={reset}>
                  <RotateCcw aria-hidden="true" />
                  Restart checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Your progress</CardTitle>
                <Badge variant="secondary">
                  <Clock aria-hidden="true" />
                  About {remainingMinutes} min left
                </Badge>
              </div>
              <CardDescription>
                {doneCount === 0
                  ? "Complete these steps to get the most out of Northwind."
                  : `${doneCount} of ${total} steps done. Keep going, you're ${
                      percent >= 50 ? "past the halfway mark" : "off to a good start"
                    }.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Progress
                value={percent}
                aria-label="Onboarding progress"
                aria-valuetext={`${doneCount} of ${total} steps complete, ${percent}%`}
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>
                  {doneCount} of {total} complete
                </span>
                <span>{percent}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup steps</CardTitle>
            <CardDescription>
              Mark a step as done once you&apos;ve finished it. You can undo any
              step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col">
              {STEPS.map((step, index) => {
                const isDone = completed.has(step.id);
                const status: Status = isDone
                  ? "done"
                  : step.id === currentId
                    ? "current"
                    : "upcoming";
                const Icon = step.icon;
                const isLast = index === STEPS.length - 1;

                return (
                  <li
                    key={step.id}
                    aria-current={status === "current" ? "step" : undefined}
                    className="relative flex gap-3 sm:gap-4"
                  >
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-9 bottom-0 left-4 w-px -translate-x-1/2",
                          isDone ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                    <div className="relative z-10 pt-3">
                      <StatusIndicator status={status} />
                    </div>
                    <div
                      className={cn(
                        "mb-2 flex min-w-0 flex-1 flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4",
                        status === "current" && "border-primary/40 bg-accent/50",
                        status === "done" && "bg-muted/40",
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Icon
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <h3
                            className={cn(
                              "text-sm font-medium",
                              isDone && "text-muted-foreground line-through",
                            )}
                          >
                            {step.title}
                          </h3>
                          <Badge
                            variant={status === "current" ? "default" : "outline"}
                            className={cn(
                              status === "done" && "text-muted-foreground",
                            )}
                          >
                            {STATUS_LABEL[status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {!isDone && (
                          <p className="text-xs text-muted-foreground">
                            ~{step.minutes} min
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {isDone ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => undoStep(step)}
                            aria-label={`Undo: ${step.title}`}
                            className="w-full sm:w-auto"
                          >
                            <RotateCcw aria-hidden="true" />
                            Undo
                          </Button>
                        ) : (
                          <Button
                            variant={status === "current" ? "default" : "outline"}
                            size="sm"
                            onClick={() => completeStep(step)}
                            aria-label={`${step.action}: ${step.title}`}
                            className="w-full sm:w-auto"
                          >
                            {step.action}
                            <ArrowRight aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
          <CardFooter className="justify-between gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Progress is saved to this page only in this demo.
            </span>
            {doneCount > 0 && !allDone && (
              <Button variant="link" size="sm" onClick={reset} className="h-auto p-0 text-xs">
                Reset
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </div>
    </main>
  );
}
