I have what I need: Tailwind v4 with a bare global stylesheet, so I can't rely on custom theme tokens or keyframes. For the celebration animation I'll use an inline `<style>` tag with `prefers-reduced-motion` handling.

```tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Circle,
  CircleDot,
  PartyPopper,
  RotateCcw,
  Sparkles,
} from "lucide-react";

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
    description: "Add your team name, logo initials and time zone.",
    detail:
      "Your workspace name appears in invites, email notifications and shared links. Pick a time zone so scheduled reports land at the right hour for your team.",
    minutes: 2,
    actionLabel: "Edit profile",
  },
  {
    id: "invite",
    title: "Invite your teammates",
    description: "Bring in at least two collaborators to get started.",
    detail:
      "Invite people by email or share a join link. Admins can manage billing and integrations, while members can create and edit projects.",
    minutes: 3,
    actionLabel: "Send invites",
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from a template or build from a blank board.",
    detail:
      "Templates for product launches, sprint planning and client onboarding are ready to use. You can rename, reorder and archive anything later.",
    minutes: 4,
    actionLabel: "Browse templates",
  },
  {
    id: "integrations",
    title: "Connect an integration",
    description: "Sync with Slack, GitHub or Google Calendar.",
    detail:
      "Connected tools push updates into your project timeline automatically. You can disconnect any integration from Settings at any time.",
    minutes: 3,
    actionLabel: "View integrations",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description: "Choose what you hear about and how often.",
    detail:
      "Pick between instant alerts, a daily digest or a weekly summary. Mentions and assigned tasks can always notify you immediately.",
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
  "bg-teal-300",
];

type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  drift: number;
  round: boolean;
};

function buildConfetti(count: number): ConfettiPiece[] {
  // Deterministic pseudo-random so output is stable between renders.
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const r2 = ((i * 7919 + 1237) % 1000) / 1000;
    return {
      left: Math.round(r * 100),
      delay: Math.round(r2 * 700) / 1000,
      duration: 1.8 + r * 1.4,
      size: 6 + Math.round(r2 * 6),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      drift: Math.round((r2 - 0.5) * 120),
      round: i % 3 === 0,
    };
  });
}

export default function Page() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    profile: true,
  });
  const [expandedId, setExpandedId] = useState<string | null>("invite");
  const [celebrating, setCelebrating] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const wasCompleteRef = useRef(false);
  const baseId = useId();

  const doneCount = STEPS.filter((s) => completed[s.id]).length;
  const total = STEPS.length;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentStepId = STEPS.find((s) => !completed[s.id])?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed[s.id]).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  const confetti = useMemo(() => buildConfetti(36), []);

  useEffect(() => {
    if (allDone && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setCelebrating(true);
      setAnnouncement("All steps complete. Your workspace is ready!");
      const t = window.setTimeout(() => setCelebrating(false), 4200);
      return () => window.clearTimeout(t);
    }
    if (!allDone) {
      wasCompleteRef.current = false;
    }
  }, [allDone]);

  function toggleStep(step: Step) {
    const nowDone = !completed[step.id];
    const next = { ...completed, [step.id]: nowDone };
    setCompleted(next);
    if (nowDone) {
      const nextOpen = STEPS.find((s) => !next[s.id]);
      setExpandedId(nextOpen ? nextOpen.id : null);
      if (!STEPS.every((s) => next[s.id])) {
        setAnnouncement(`${step.title} marked complete.`);
      }
    } else {
      setExpandedId(step.id);
      setAnnouncement(`${step.title} marked incomplete.`);
    }
  }

  function reset() {
    setCompleted({});
    setExpandedId(STEPS[0].id);
    setCelebrating(false);
    setAnnouncement("Checklist reset.");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <style>{`
        @keyframes ob-fall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(var(--ob-drift, 0px), 105vh, 0) rotate(720deg); opacity: 0; }
        }
        @keyframes ob-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ob-check {
          0% { transform: scale(0.4); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .ob-confetti { animation: ob-fall var(--ob-dur, 2.5s) cubic-bezier(0.2, 0.6, 0.4, 1) var(--ob-delay, 0s) both; }
        .ob-pop { animation: ob-pop 0.5s ease-out both; }
        .ob-check { animation: ob-check 0.3s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .ob-confetti { display: none; }
          .ob-pop, .ob-check { animation: none; }
        }
      `}</style>

      {celebrating && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {confetti.map((p, i) => (
            <span
              key={i}
              className={`ob-confetti absolute top-0 block ${p.color} ${p.round ? "rounded-full" : "rounded-[2px]"}`}
              style={
                {
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.round ? p.size : p.size * 1.6,
                  "--ob-delay": `${p.delay}s`,
                  "--ob-dur": `${p.duration}s`,
                  "--ob-drift": `${p.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Getting started
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to Northwind, Priya
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-slate-600">
            Finish these five quick steps to get your team up and running. It
            takes about {STEPS.reduce((s, x) => s + x.minutes, 0)} minutes in
            total, and your progress is saved as you go.
          </p>
        </header>

        <section
          aria-labelledby={`${baseId}-progress`}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2
                id={`${baseId}-progress`}
                className="text-sm font-semibold text-slate-900"
              >
                Your progress
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                {allDone
                  ? "Everything is set up."
                  : `${doneCount} of ${total} steps complete · about ${remainingMinutes} min left`}
              </p>
            </div>
            <p
              className="text-3xl font-bold tabular-nums text-emerald-600"
              aria-hidden="true"
            >
              {percent}%
            </p>
          </div>
          <div
            role="progressbar"
            aria-labelledby={`${baseId}-progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>

        {allDone && (
          <section
            aria-labelledby={`${baseId}-done`}
            className="ob-pop mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <PartyPopper className="size-7" aria-hidden="true" />
            </div>
            <h2
              id={`${baseId}-done`}
              className="text-xl font-bold text-emerald-900 sm:text-2xl"
            >
              You&apos;re all set!
            </h2>
            <p className="mx-auto mt-1 max-w-md text-pretty text-emerald-800">
              Your workspace is ready. Your team can start collaborating right
              away, and we&apos;ve unlocked your 14-day Pro trial as a thank
              you.
            </p>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Go to dashboard
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Restart checklist
              </button>
            </div>
          </section>
        )}

        <section aria-label="Onboarding steps">
          <ol className="space-y-3">
            {STEPS.map((step, index) => {
              const done = Boolean(completed[step.id]);
              const isCurrent = step.id === currentStepId;
              const expanded = expandedId === step.id;
              const panelId = `${baseId}-panel-${step.id}`;
              const buttonId = `${baseId}-btn-${step.id}`;
              const statusText = done
                ? "Completed"
                : isCurrent
                  ? "Up next"
                  : "Not started";

              return (
                <li
                  key={step.id}
                  className={`rounded-2xl border bg-white shadow-sm transition-colors ${
                    isCurrent
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`Mark "${step.title}" as ${done ? "incomplete" : "complete"}`}
                      onClick={() => toggleStep(step)}
                      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    >
                      {done ? (
                        <span className="ob-check flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : isCurrent ? (
                        <CircleDot
                          className="size-8 text-emerald-600"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="size-8 text-slate-300"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() =>
                          setExpandedId(expanded ? null : step.id)
                        }
                        className="group flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                      >
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-slate-500">
                            Step {index + 1} · {step.minutes} min ·{" "}
                            <span
                              className={
                                done
                                  ? "text-emerald-700"
                                  : isCurrent
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                              }
                            >
                              {statusText}
                            </span>
                          </span>
                          <span
                            className={`mt-0.5 block text-base font-semibold ${
                              done
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
                        <ChevronDown
                          className={`mt-1 size-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${
                            expanded ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!expanded}
                        className="mt-3"
                      >
                        <p className="text-sm leading-relaxed text-slate-600">
                          {step.detail}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {!done && (
                            <button
                              type="button"
                              onClick={() => toggleStep(step)}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                            >
                              {step.actionLabel}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleStep(step)}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                          >
                            {done ? "Mark as incomplete" : "Mark as done"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {!allDone && doneCount > 0 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset progress
            </button>
          </div>
        )}

        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </main>
  );
}
```