"use client";

import { useId, useMemo, useState } from "react";
import {
  ArrowRight,
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
  summary: string;
  detail: string;
  action: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    summary: "Add your name, role and a photo so teammates recognise you.",
    detail:
      "Your profile appears next to comments, assignments and mentions. Add a display name, your role and a profile photo. It takes less than a minute.",
    action: "Edit profile",
    minutes: 1,
  },
  {
    id: "workspace",
    title: "Create your first workspace",
    summary: "Workspaces keep projects, files and conversations together.",
    detail:
      "Name your workspace after your team or company, such as “Northwind Design”. You can create more later and switch between them from the sidebar.",
    action: "Create workspace",
    minutes: 2,
  },
  {
    id: "invite",
    title: "Invite two teammates",
    summary: "Projects move faster when the right people are in the room.",
    detail:
      "Send invites by email or share a link. Invited teammates can view the workspace immediately, and you choose whether they can edit or only comment.",
    action: "Invite teammates",
    minutes: 2,
  },
  {
    id: "integration",
    title: "Connect Slack or Google Calendar",
    summary: "Get updates where you already work, without switching tabs.",
    detail:
      "Connect Slack to receive task updates in a channel of your choice, or Google Calendar to see due dates alongside your meetings.",
    action: "Browse integrations",
    minutes: 3,
  },
  {
    id: "project",
    title: "Launch your first project",
    summary: "Start from a template or build a board from scratch.",
    detail:
      "Pick a template such as “Product launch” or “Sprint planning”, assign an owner to each task and set a due date to get the board moving.",
    action: "Start a project",
    minutes: 4,
  },
];

const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const palette = [
    "bg-emerald-400",
    "bg-amber-400",
    "bg-sky-400",
    "bg-rose-400",
    "bg-violet-400",
  ];
  return {
    id: i,
    left: `${(i * 37) % 100}%`,
    delay: `${((i * 53) % 90) / 100}s`,
    duration: `${2.2 + ((i * 29) % 14) / 10}s`,
    color: palette[i % palette.length],
    rotate: `${(i * 47) % 360}deg`,
  };
});

export default function Page() {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set(["profile"]));
  const [openId, setOpenId] = useState<string | null>("workspace");
  const baseId = useId();

  const total = STEPS.length;
  const count = done.size;
  const percent = Math.round((count / total) * 100);
  const complete = count === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !done.has(s.id))?.id ?? null,
    [done],
  );

  const remainingMinutes = useMemo(
    () =>
      STEPS.filter((s) => !done.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [done],
  );

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Move focus of attention to the next unfinished step.
        const nextStep = STEPS.find((s) => s.id !== id && !next.has(s.id));
        setOpenId(nextStep ? nextStep.id : null);
      }
      return next;
    });
  }

  function reset() {
    setDone(new Set());
    setOpenId(STEPS[0].id);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:py-16">
      <style>{`
        @keyframes ob-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
        @keyframes ob-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 sm:mb-8">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Getting started
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to Tidewell, Maya
          </h1>
          <p className="mt-2 text-pretty text-slate-600">
            Finish these five steps to get your team set up. It takes about ten
            minutes, and your progress is saved as you go.
          </p>
        </header>

        <section
          aria-labelledby={`${baseId}-progress-label`}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id={`${baseId}-progress-label`}
              className="text-sm font-medium text-slate-700"
            >
              Setup progress
            </h2>
            <p className="text-sm tabular-nums text-slate-500">
              {count} of {total} complete
            </p>
          </div>

          <div
            role="progressbar"
            aria-labelledby={`${baseId}-progress-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${count} of ${total} steps complete, ${percent} percent`}
            className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                complete ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-sm text-slate-600"
          >
            {complete
              ? "All steps complete. You’re ready to go!"
              : `${percent}% done · about ${remainingMinutes} min left`}
          </p>
        </section>

        {complete && (
          <section
            aria-labelledby={`${baseId}-celebrate`}
            className="relative mt-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-sm motion-safe:[animation:ob-pop_450ms_ease-out_both] sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 motion-reduce:hidden"
            >
              {CONFETTI.map((c) => (
                <span
                  key={c.id}
                  className={`absolute top-0 block h-3 w-1.5 rounded-sm ${c.color}`}
                  style={{
                    left: c.left,
                    rotate: c.rotate,
                    animation: `ob-fall ${c.duration} ${c.delay} ease-in infinite`,
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <PartyPopper className="size-7" aria-hidden="true" />
              </div>
              <h2
                id={`${baseId}-celebrate`}
                className="mt-4 text-xl font-semibold text-emerald-900 sm:text-2xl"
              >
                You’re all set, Maya!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-pretty text-emerald-800">
                Your workspace is ready, your team is invited and your first
                project is live. Nice work.
              </p>
              <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  Go to dashboard
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Restart checklist
                </button>
              </div>
            </div>
          </section>
        )}

        <ol className="mt-4 space-y-3" aria-label="Onboarding steps">
          {STEPS.map((step, index) => {
            const isDone = done.has(step.id);
            const isCurrent = step.id === currentId;
            const isOpen = openId === step.id;
            const panelId = `${baseId}-panel-${step.id}`;
            const buttonId = `${baseId}-button-${step.id}`;

            return (
              <li
                key={step.id}
                className={`rounded-xl border bg-white shadow-sm transition-colors ${
                  isCurrent
                    ? "border-indigo-300 ring-1 ring-indigo-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark “${step.title}” as ${
                      isDone ? "not done" : "done"
                    }`}
                    onClick={() => toggle(step.id)}
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isCurrent
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                    ) : isCurrent ? (
                      <CircleDot className="size-4" aria-hidden="true" />
                    ) : (
                      <Circle className="size-3" aria-hidden="true" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium">
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                        className="flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <span
                          className={
                            isDone ? "text-slate-500 line-through" : "text-slate-900"
                          }
                        >
                          <span className="sr-only">Step {index + 1}: </span>
                          {step.title}
                        </span>
                        <ChevronDown
                          className={`mt-0.5 size-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          isDone
                            ? "bg-emerald-100 text-emerald-700"
                            : isCurrent
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isDone ? "Done" : isCurrent ? "Up next" : "To do"}
                      </span>
                      <span className="text-slate-500">
                        {step.minutes} min
                      </span>
                    </div>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                      className="mt-3"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {step.summary}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {step.detail}
                      </p>
                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => toggle(step.id)}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
                        >
                          {step.action}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {!complete && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-500 transition hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset progress
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
