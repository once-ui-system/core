"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleDashed,
  Clock,
  PartyPopper,
  RotateCcw,
  Sparkles,
  UserRound,
  Users,
  Plug,
  FolderKanban,
  Bell,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    summary: "Add your name, role and a photo.",
    detail:
      "Teammates see your profile in comments, mentions and assignments. Adding a role helps new collaborators know who to ask about what.",
    action: "Edit profile",
    minutes: 2,
    icon: UserRound,
  },
  {
    id: "workspace",
    title: "Create your first project",
    summary: "Set up a project for Q3 Website Relaunch.",
    detail:
      "Projects keep tasks, files and discussions together. Start from the Product Launch template to get a ready-made board with sensible columns.",
    action: "Create project",
    minutes: 4,
    icon: FolderKanban,
  },
  {
    id: "invite",
    title: "Invite your team",
    summary: "Bring in at least two collaborators.",
    detail:
      "Invite people by email or share a join link. Invited teammates get access only to the projects you choose, and you can change roles at any time.",
    action: "Send invites",
    minutes: 3,
    icon: Users,
  },
  {
    id: "integrations",
    title: "Connect Slack and Google Calendar",
    summary: "Get updates where you already work.",
    detail:
      "Sync due dates to your calendar and post project activity to a Slack channel. You can disconnect either integration from Settings later.",
    action: "Connect apps",
    minutes: 3,
    icon: Plug,
  },
  {
    id: "notifications",
    title: "Choose notification preferences",
    summary: "Pick a daily digest or instant alerts.",
    detail:
      "Decide what is worth an interruption. Most teams choose instant alerts for mentions and a morning digest for everything else.",
    action: "Set preferences",
    minutes: 1,
    icon: Bell,
  },
  {
    id: "launch",
    title: "Publish your first update",
    summary: "Share a kickoff note with your team.",
    detail:
      "Post a short status update to let everyone know what the project is about and what happens first. It is the quickest way to get the team engaged.",
    action: "Write update",
    minutes: 2,
    icon: Rocket,
  },
];

const CONFETTI_COLORS = [
  "bg-indigo-500",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-sky-400",
  "bg-fuchsia-400",
];

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: ((i * 53) % 90) / 100,
  duration: 2.2 + ((i * 29) % 16) / 10,
  size: 6 + ((i * 7) % 6),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}));

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(["profile"]),
  );
  const [openId, setOpenId] = useState<string | null>("workspace");
  const [announcement, setAnnouncement] = useState("");

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const remainingMinutes = useMemo(
    () =>
      STEPS.filter((s) => !completed.has(s.id)).reduce(
        (sum, s) => sum + s.minutes,
        0,
      ),
    [completed],
  );

  function setStepDone(step: Step, done: boolean) {
    const next = new Set(completed);
    if (done) next.add(step.id);
    else next.delete(step.id);
    setCompleted(next);

    if (done) {
      const nextStep = STEPS.find((s) => !next.has(s.id));
      setOpenId(nextStep ? nextStep.id : null);
      setAnnouncement(
        next.size === total
          ? "All steps complete. Your workspace is ready."
          : `${step.title} marked complete. ${next.size} of ${total} steps done.`,
      );
    } else {
      setOpenId(step.id);
      setAnnouncement(
        `${step.title} marked incomplete. ${next.size} of ${total} steps done.`,
      );
    }
  }

  function reset() {
    setCompleted(new Set());
    setOpenId(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 of " + total + " steps done.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/60 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <style>{`
        @keyframes ob-fall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(var(--ob-drift), 340px, 0) rotate(540deg); opacity: 0; }
        }
        @keyframes ob-pop {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ob-check {
          0% { transform: scale(0.4); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .ob-confetti { animation: ob-fall var(--ob-dur) ease-in var(--ob-delay) 1 both; }
        .ob-pop { animation: ob-pop 500ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
        .ob-check { animation: ob-check 300ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .ob-confetti { display: none; }
          .ob-pop, .ob-check { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Getting started
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to Northwind, Priya
          </h1>
          <p className="mt-2 text-pretty text-slate-600">
            Finish these six steps to get your team up and running. It takes
            about {STEPS.reduce((s, x) => s + x.minutes, 0)} minutes in total,
            and your progress is saved as you go.
          </p>
        </header>

        <section
          aria-labelledby="progress-heading"
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 id="progress-heading" className="text-sm font-semibold text-slate-500">
                Your progress
              </h2>
              <p className="mt-0.5 text-2xl font-bold tabular-nums">
                {doneCount} of {total}{" "}
                <span className="text-base font-medium text-slate-500">
                  steps complete
                </span>
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums text-indigo-600">
              {percent}%
            </p>
          </div>

          <div
            role="progressbar"
            aria-labelledby="progress-heading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                allDone
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {allDone
              ? "Nothing left to do."
              : `About ${remainingMinutes} min remaining`}
          </p>
        </section>

        {allDone && (
          <section
            aria-labelledby="done-heading"
            className="ob-pop relative mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center shadow-sm sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {CONFETTI.map((c) => (
                <span
                  key={c.id}
                  className={`ob-confetti absolute top-0 block ${c.color} ${
                    c.round ? "rounded-full" : "rounded-[2px]"
                  }`}
                  style={
                    {
                      left: `${c.left}%`,
                      width: c.size,
                      height: c.size * (c.round ? 1 : 1.6),
                      "--ob-delay": `${c.delay}s`,
                      "--ob-dur": `${c.duration}s`,
                      "--ob-drift": `${(c.id % 2 === 0 ? 1 : -1) * (10 + (c.id % 5) * 8)}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <PartyPopper className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 id="done-heading" className="text-2xl font-bold tracking-tight">
                You&rsquo;re all set!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-pretty text-slate-600">
                Your workspace is ready and your team is on board. Nice work
                finishing setup &mdash; time to ship something great.
              </p>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  Go to my dashboard
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Restart checklist
                </button>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="sr-only">
            Setup steps
          </h2>
          <ol className="space-y-3">
            {STEPS.map((step, index) => {
              const isDone = completed.has(step.id);
              const isCurrent = step.id === currentId;
              const isOpen = openId === step.id;
              const Icon = step.icon;
              const panelId = `panel-${step.id}`;
              const buttonId = `trigger-${step.id}`;
              const statusLabel = isDone
                ? "Completed"
                : isCurrent
                  ? "Up next"
                  : "Not started";

              return (
                <li
                  key={step.id}
                  className={`rounded-2xl border bg-white shadow-sm transition-colors ${
                    isCurrent
                      ? "border-indigo-300 ring-1 ring-indigo-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => setStepDone(step, !isDone)}
                      aria-pressed={isDone}
                      aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${step.title}`}
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                          : isCurrent
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Check
                          key="done"
                          className="ob-check h-4 w-4"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      ) : isCurrent ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-indigo-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <CircleDashed className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3>
                        <button
                          type="button"
                          id={buttonId}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpenId(isOpen ? null : step.id)}
                          className="group flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-medium text-slate-500">
                              Step {index + 1}
                              <span aria-hidden="true"> &middot; </span>
                              <span className="sr-only">, </span>
                              <span
                                className={
                                  isDone
                                    ? "text-emerald-700"
                                    : isCurrent
                                      ? "text-indigo-700"
                                      : ""
                                }
                              >
                                {statusLabel}
                              </span>
                            </span>
                            <span
                              className={`mt-0.5 block text-base font-semibold ${
                                isDone ? "text-slate-500 line-through decoration-slate-300" : ""
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-600">
                              {step.summary}
                            </span>
                          </span>
                          <ChevronDown
                            className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                      >
                        <div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                          <Icon
                            className="mt-0.5 hidden h-5 w-5 shrink-0 text-indigo-500 sm:block"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-sm leading-relaxed text-slate-700">
                              {step.detail}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              {isDone ? (
                                <button
                                  type="button"
                                  onClick={() => setStepDone(step, false)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                  Mark as not done
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setStepDone(step, true)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  {step.action}
                                </button>
                              )}
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                {step.minutes} min
                              </span>
                            </div>
                          </div>
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
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
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
