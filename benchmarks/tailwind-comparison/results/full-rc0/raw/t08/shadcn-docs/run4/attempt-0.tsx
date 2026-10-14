"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDashed,
  PartyPopper,
  RotateCcw,
  Sparkles,
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
  detail: string;
  action: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and a photo so teammates recognise you.",
    detail:
      "Your profile appears next to comments, assignments and mentions. Add your job title and time zone so colleagues know when you are online.",
    action: "Edit profile",
    minutes: 2,
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description: "Pick a name and URL for the Northwind Studio workspace.",
    detail:
      "The workspace URL is used for invite links and the public status page. You can change the display name later, but the URL is permanent.",
    action: "Open workspace settings",
    minutes: 1,
  },
  {
    id: "invite",
    title: "Invite your teammates",
    description: "Send invitations to at least two people on your team.",
    detail:
      "Invite by email or share a link restricted to your company domain. Teammates get access to every project you add them to.",
    action: "Invite teammates",
    minutes: 3,
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from a template such as Product Launch or Sprint Board.",
    detail:
      "Templates include pre-built columns, labels and automations. Choose one and customise it, or start with a blank board.",
    action: "Browse templates",
    minutes: 4,
  },
  {
    id: "integrations",
    title: "Connect an integration",
    description: "Link Slack, GitHub or Google Calendar to keep work in sync.",
    detail:
      "Integrations post updates to your channels and link pull requests to tasks automatically. You can disconnect them at any time.",
    action: "View integrations",
    minutes: 3,
  },
];

export default function Page() {
  const [completed, setCompleted] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(["profile"]),
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
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

  const toggleStep = React.useCallback(
    (step: Step) => {
      const next = new Set(completed);
      const wasDone = next.has(step.id);
      if (wasDone) {
        next.delete(step.id);
      } else {
        next.add(step.id);
      }
      setCompleted(next);

      if (wasDone) {
        setAnnouncement(`${step.title} marked as not done. ${next.size} of ${total} steps complete.`);
      } else if (next.size === total) {
        setAnnouncement("All steps complete. You are ready to go.");
        toast.success("Setup complete!", {
          description: "Your workspace is ready. Welcome aboard.",
        });
      } else {
        setAnnouncement(`${step.title} marked as done. ${next.size} of ${total} steps complete.`);
        toast.success(`${step.title} done`, {
          description: `${next.size} of ${total} steps complete.`,
        });
      }
    },
    [completed, total],
  );

  const reset = () => {
    setCompleted(new Set<string>());
    setExpandedId(null);
    setAnnouncement("Checklist reset. 0 steps complete.");
  };

  return (
    <main className="min-h-dvh bg-muted/40 px-4 py-8 sm:py-12">
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
            Finish these five steps to get your team up and running. It takes
            about 13 minutes, and your progress is saved as you go.
          </p>
        </header>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base">Setup progress</CardTitle>
              <span className="text-sm font-medium tabular-nums" aria-hidden="true">
                {doneCount} of {total} complete
              </span>
            </div>
            <Progress
              value={percent}
              aria-label="Onboarding progress"
              aria-valuetext={`${doneCount} of ${total} steps complete, ${percent}%`}
              className={cn("h-2.5", allDone && "bg-emerald-500/20")}
            />
            <CardDescription>
              {allDone
                ? "Everything is set up."
                : `About ${remainingMinutes} min left. Next up: ${
                    STEPS.find((s) => s.id === currentId)?.title ?? ""
                  }.`}
            </CardDescription>
          </CardHeader>
        </Card>

        {allDone ? (
          <Card
            className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-500"
          >
            <Confetti />
            <CardContent className="relative flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg motion-safe:animate-bounce">
                <PartyPopper className="size-7" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                You&apos;re all set!
              </h2>
              <p className="max-w-md text-pretty text-sm text-muted-foreground">
                Northwind Studio is ready for your team. Head to your dashboard
                to see your first project, or revisit any step whenever you need.
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() =>
                    toast("Taking you to your dashboard…", {
                      description: "This is a demo, so you'll stay here.",
                    })
                  }
                >
                  Go to dashboard
                  <ArrowRight aria-hidden="true" />
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw aria-hidden="true" />
                  Restart checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base" id="steps-heading">
              Your checklist
            </CardTitle>
            <CardDescription>
              Select a step to see details, or mark it done when you&apos;re finished.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol aria-labelledby="steps-heading" className="space-y-2">
              {STEPS.map((step, index) => {
                const isDone = completed.has(step.id);
                const isCurrent = step.id === currentId;
                const isOpen = expandedId === step.id;
                const panelId = `panel-${step.id}`;
                const buttonId = `trigger-${step.id}`;

                return (
                  <li
                    key={step.id}
                    className={cn(
                      "rounded-lg border bg-card transition-colors",
                      isCurrent && "border-primary/40 ring-1 ring-primary/20",
                      isDone && "bg-muted/40",
                    )}
                  >
                    <div className="flex items-start gap-3 p-3 sm:p-4">
                      <StatusIcon done={isDone} current={isCurrent} index={index + 1} />

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          id={buttonId}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setExpandedId(isOpen ? null : step.id)}
                          className="group flex w-full items-start justify-between gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                isDone && "text-muted-foreground line-through",
                              )}
                            >
                              {step.title}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {step.description}
                            </span>
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge done={isDone} current={isCurrent} />
                          <span className="text-xs text-muted-foreground">
                            ~{step.minutes} min
                          </span>
                        </div>

                        {isOpen ? (
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            className="mt-3 space-y-3 border-t pt-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1"
                          >
                            <p className="text-sm text-muted-foreground">{step.detail}</p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  toast(step.action, {
                                    description: "This is a demo action.",
                                  })
                                }
                              >
                                {step.action}
                              </Button>
                              <Button
                                size="sm"
                                variant={isDone ? "ghost" : "default"}
                                onClick={() => toggleStep(step)}
                              >
                                {isDone ? "Mark as not done" : "Mark as done"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {allDone ? "All steps complete" : `${total - doneCount} steps remaining`}
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

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </div>
    </main>
  );
}

function StatusIcon({
  done,
  current,
  index,
}: {
  done: boolean;
  current: boolean;
  index: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
        done && "border-emerald-600 bg-emerald-600 text-white",
        !done && current && "border-primary text-primary",
        !done && !current && "border-dashed text-muted-foreground",
      )}
    >
      {done ? (
        <Check className="size-3.5" strokeWidth={3} />
      ) : current ? (
        index
      ) : (
        <CircleDashed className="size-3.5" />
      )}
    </span>
  );
}

function StatusBadge({ done, current }: { done: boolean; current: boolean }) {
  if (done) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400"
      >
        <Check aria-hidden="true" />
        Done
      </Badge>
    );
  }
  if (current) {
    return <Badge>Up next</Badge>;
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not started
    </Badge>
  );
}

const CONFETTI = [
  { left: "6%", delay: "0s", color: "bg-emerald-500" },
  { left: "16%", delay: "0.15s", color: "bg-amber-400" },
  { left: "27%", delay: "0.3s", color: "bg-sky-500" },
  { left: "38%", delay: "0.05s", color: "bg-pink-500" },
  { left: "50%", delay: "0.25s", color: "bg-emerald-400" },
  { left: "61%", delay: "0.1s", color: "bg-amber-500" },
  { left: "72%", delay: "0.35s", color: "bg-violet-500" },
  { left: "83%", delay: "0.2s", color: "bg-sky-400" },
  { left: "93%", delay: "0.4s", color: "bg-pink-400" },
];

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes onboarding-confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-confetti { display: none; }
        }
      `}</style>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className={cn("onboarding-confetti absolute top-0 h-3 w-1.5 rounded-sm", c.color)}
          style={{
            left: c.left,
            animation: `onboarding-confetti-fall 2.2s ease-in ${c.delay} both`,
          }}
        />
      ))}
    </div>
  );
}
