The globals only import Tailwind, so I'll keep all styling in utility classes and use inline `<style>` for the confetti keyframes.

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Circle,
  Loader2,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Clock,
} from "lucide-react";

type Status = "todo" | "in-progress" | "done";

type Step = {
  id: string;
  title: string;
  description: string;
  detail: string;
  minutes: number;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    description: "Add your team name, logo colour and time zone.",
    detail:
      "Your workspace profile appears on invoices, shared reports and email notifications. Pick a name your teammates will recognise and set the time zone your team works in.",
    minutes: 2,
    actionLabel: "Edit profile",
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    description: "Bring in at least two people to collaborate with.",
    detail:
      "Invite colleagues by email or share a join link. Admins can manage billing, members can create and edit projects, and viewers get read-only access.",
    minutes: 3,
    actionLabel: "Invite people",
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from a template or build from scratch.",
    detail:
      "Projects keep tasks, files and discussions in one place. The 'Product launch' template includes a timeline, a task board and a weekly status report.",
    minutes: 4,
    actionLabel: "New project",
  },
  {
    id: "integrations",
    title: "Connect Slack or Google Calendar",
    description: "Get updates where your team already works.",
    detail:
      "Connect an integration to post project updates to a Slack channel or sync due dates with Google Calendar. You can disconnect at any time from Settings.",
    minutes: 3,
    actionLabel: "Browse integrations",
  },
  {
    id: "notifications",
    title: "Choose your notification preferences",
    description: "Decide what lands in your inbox and what stays quiet.",
    detail:
      "Pick between instant, daily digest or weekly summary emails, and set quiet hours so you are not pinged outside of working time.",
    minutes: 1,
    actionLabel: "Open preferences",
  },
];

const CONFETTI_COLORS = [
  "bg-emerald-400",
  "bg-sky-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-teal-400",
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="size-4" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500">
        <Loader2
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      </span>
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-300">
      <Circle className="size-3" aria-hidden="true" />
    </span>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  done: "Completed",
  "in-progress": "In progress",
  todo: "Not started",
};

export default function Page() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(
      STEPS.map((s, i) => [s.id, (i === 0 ? "done" : "todo") as Status]),
    ),
  );
  const [expanded, setExpanded] = useState<string | null>("invite");
  const [announcement, setAnnouncement] = useState("");
  const celebrationRef = useRef<HTMLDivElement>(null);
  const wasComplete = useRef(false);

  const doneCount = STEPS.filter((s) => statuses[s.id] === "done").length;
  const total = STEPS.length;
  const percent = Math.round((doneCount / total) * 100);
  const complete = doneCount === total;

  const remainingMinutes = STEPS.reduce(
    (sum, s) => (statuses[s.id] === "done" ? sum : sum + s.minutes),
    0,
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        delay: ((i * 53) % 100) / 100,
        duration: 1.8 + ((i * 29) % 15) / 10,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: (i * 47) % 360,
        round: i % 3 === 0,
      })),
    [],
  );

  useEffect(() => {
    if (complete && !wasComplete.current) {
      setAnnouncement("All steps complete. You're ready to go!");
      celebrationRef.current?.focus();
    }
    wasComplete.current = complete;
  }, [complete]);

  function setStatus(id: string, status: Status) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    const step = STEPS.find((s) => s.id === id);
    if (step && status !== "done") {
      setAnnouncement(`${step.title}: ${STATUS_LABEL[status]}`);
    } else if (step) {
      setAnnouncement(`${step.title} marked as complete`);
    }
  }

  function startStep(id: string) {
    setStatus(id, "in-progress");
  }

  function toggleDone(id: string) {
    setStatus(id, statuses[id] === "done" ? "todo" : "done");
  }

  function reset() {
    setStatuses(
      Object.fromEntries(
        STEPS.map((s, i) => [s.id, (i === 0 ? "done" : "todo") as Status]),
      ),
    );
    setExpanded("invite");
    setAnnouncement("Checklist reset");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/60 px-4 py-8 text-slate-900 sm:px-6 sm:py-14">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
        @keyframes pop-in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { animation: none !important; opacity: 0 !important; }
          .pop-in { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Getting started
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to Northwind, Priya
          </h1>
          <p className="mt-2 text-slate-600">
            Finish these five steps to get your team set up. It takes about ten
            minutes, and you can pick up where you left off at any time.
          </p>
        </header>

        <section
          aria-labelledby="progress-heading"
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="progress-heading" className="text-sm font-semibold">
              Your progress
            </h2>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {doneCount} of {total}
              </span>{" "}
              steps complete
            </p>
          </div>
          <div
            role="progressbar"
            aria-labelledby="progress-heading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete, ${percent} percent`}
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                complete
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium tabular-nums">{percent}%</span>
            {!complete && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                About {remainingMinutes} min left
              </span>
            )}
          </div>
        </section>

        {complete && (
          <div
            ref={celebrationRef}
            tabIndex={-1}
            className="pop-in relative mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:p-8"
            style={{ animation: "pop-in 0.4s ease-out both" }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              {confetti.map((c) => (
                <span
                  key={c.id}
                  className={`confetti-piece absolute top-0 block size-2.5 ${c.color} ${
                    c.round ? "rounded-full" : "rounded-[2px]"
                  }`}
                  style={{
                    left: `${c.left}%`,
                    transform: `rotate(${c.rotate}deg)`,
                    animation: `confetti-fall ${c.duration}s ease-in ${c.delay}s both`,
                  }}
                />
              ))}
            </div>
            <div className="relative">
              <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                <PartyPopper className="size-7" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold text-emerald-900 sm:text-2xl">
                You&apos;re all set!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-emerald-800">
                Your workspace is ready. Your team can start planning, sharing
                and shipping together right away.
              </p>
              <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  Go to my dashboard
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Restart checklist
                </button>
              </div>
            </div>
          </div>
        )}

        <ol className="space-y-3">
          {STEPS.map((step, index) => {
            const status = statuses[step.id];
            const isOpen = expanded === step.id;
            const panelId = `panel-${step.id}`;
            const buttonId = `trigger-${step.id}`;
            return (
              <li
                key={step.id}
                className={`rounded-2xl border bg-white shadow-sm transition-colors ${
                  status === "in-progress"
                    ? "border-indigo-300"
                    : status === "done"
                      ? "border-emerald-200"
                      : "border-slate-200"
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setExpanded(isOpen ? null : step.id)}
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:gap-4 sm:p-5"
                  >
                    <StatusIcon status={status} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-slate-500">
                        Step {index + 1} of {total}
                        <span className="sr-only">. {STATUS_LABEL[status]}</span>
                      </span>
                      <span
                        className={`block font-semibold ${
                          status === "done"
                            ? "text-slate-500 line-through decoration-slate-300"
                            : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">
                        {step.description}
                      </span>
                    </span>
                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
                        status === "done"
                          ? "bg-emerald-50 text-emerald-700"
                          : status === "in-progress"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                      aria-hidden="true"
                    >
                      {STATUS_LABEL[status]}
                    </span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-slate-100 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pl-[4.5rem]"
                  >
                    <p className="text-sm leading-relaxed text-slate-600">
                      {step.detail}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="size-3.5" aria-hidden="true" />
                      Takes about {step.minutes} min
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      {status !== "done" && (
                        <button
                          type="button"
                          onClick={() => startStep(step.id)}
                          disabled={status === "in-progress"}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                          {status === "in-progress"
                            ? "In progress…"
                            : step.actionLabel}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDone(step.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {status === "done" ? (
                          <>
                            <RotateCcw className="size-4" aria-hidden="true" />
                            Mark as not done
                          </>
                        ) : (
                          <>
                            <Check className="size-4" aria-hidden="true" />
                            Mark as done
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {!complete && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Need a hand? Our team replies to onboarding questions within one
            business hour.
          </p>
        )}

        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </main>
  );
}
```