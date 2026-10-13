```tsx
"use client";

import { useId, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  FolderPlus,
  Link2,
  PartyPopper,
  RotateCcw,
  Rocket,
  Sparkles,
  UserPlus,
  Palette,
  Bell,
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
      "Teammates see your name and role next to comments and assignments. A clear profile makes handoffs between Design, Engineering and Support much smoother.",
    action: "Edit profile",
    minutes: 2,
    icon: Sparkles,
  },
  {
    id: "workspace",
    title: "Create your first project",
    summary: "Set up a project for the Q3 website relaunch.",
    detail:
      "Projects hold your tasks, files and discussions in one place. Start from the Product Launch template to get a ready-made board with sprint columns and a release checklist.",
    action: "Create project",
    minutes: 3,
    icon: FolderPlus,
  },
  {
    id: "invite",
    title: "Invite your teammates",
    summary: "Bring in at least two people to collaborate.",
    detail:
      "Invite colleagues by email or share a join link. New members can be assigned a Viewer, Editor or Admin role, and you can change it at any time from workspace settings.",
    action: "Send invites",
    minutes: 2,
    icon: UserPlus,
  },
  {
    id: "integrations",
    title: "Connect Slack and GitHub",
    summary: "Get updates where your team already works.",
    detail:
      "Link Slack to receive task updates in a channel, and GitHub to attach pull requests to tasks automatically. Both connections can be removed whenever you like.",
    action: "Connect apps",
    minutes: 4,
    icon: Link2,
  },
  {
    id: "notifications",
    title: "Tune your notifications",
    summary: "Choose what's worth interrupting you for.",
    detail:
      "Pick between instant alerts, a daily digest or a weekly summary. Mentions and assignments always come through, so nothing important gets lost.",
    action: "Open preferences",
    minutes: 1,
    icon: Bell,
  },
  {
    id: "theme",
    title: "Personalise your workspace",
    summary: "Pick an accent colour and a density.",
    detail:
      "Choose a light or dark appearance, an accent colour for your workspace and a compact or comfortable layout. These preferences sync across all of your devices.",
    action: "Customise",
    minutes: 1,
    icon: Palette,
  },
];

const CONFETTI_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-rose-500",
  "bg-sky-500",
  "bg-fuchsia-500",
];

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${((i * 53) % 90) / 100}s`,
  duration: `${2.2 + ((i * 17) % 14) / 10}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 3) * 3,
  rotate: (i * 47) % 360,
}));

export default function Page() {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(STEPS[0].id);
  const baseId = useId();

  const total = STEPS.length;
  const completed = done.size;
  const percent = Math.round((completed / total) * 100);
  const allDone = completed === total;
  const currentId = STEPS.find((s) => !done.has(s.id))?.id ?? null;

  const remainingMinutes = useMemo(
    () =>
      STEPS.filter((s) => !done.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [done],
  );

  function toggleDone(id: string) {
    const next = new Set(done);
    const wasDone = next.has(id);
    if (wasDone) {
      next.delete(id);
      setDone(next);
      setOpenId(id);
      return;
    }
    next.add(id);
    setDone(next);
    const following = STEPS.find((s) => !next.has(s.id));
    setOpenId(following ? following.id : null);
  }

  function reset() {
    setDone(new Set());
    setOpenId(STEPS[0].id);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/60 px-4 py-8 text-slate-900 sm:px-6 sm:py-14">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        .confetti-piece { animation: confetti-fall var(--dur) ease-in var(--delay) both; }
        .pop-in { animation: pop-in 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { display: none; }
          .pop-in { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm font-medium text-indigo-600">Welcome to Tidewave</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s get your workspace ready
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Finish these {total} quick steps to set up your team. You can come back
            to any of them later.
          </p>
        </header>

        <section
          aria-labelledby={`${baseId}-progress-label`}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id={`${baseId}-progress-label`}
              className="text-sm font-semibold text-slate-900"
            >
              Your progress
            </h2>
            <p className="text-sm tabular-nums text-slate-600">
              <span className="font-semibold text-slate-900">{completed}</span> of{" "}
              {total} complete
            </p>
          </div>

          <div
            role="progressbar"
            aria-labelledby={`${baseId}-progress-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${completed} of ${total} steps complete, ${percent} percent`}
            className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100"
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

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">{percent}%</span>
            {!allDone && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                About {remainingMinutes} min left
              </span>
            )}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {allDone
              ? "All steps complete. Your workspace is ready."
              : `${completed} of ${total} steps complete.`}
          </p>
        </section>

        {allDone && (
          <section
            aria-labelledby={`${baseId}-celebrate`}
            className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center shadow-sm sm:p-8"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className={`confetti-piece absolute top-0 block rounded-sm ${c.color}`}
                  style={
                    {
                      left: c.left,
                      width: c.size,
                      height: c.size * 1.6,
                      rotate: `${c.rotate}deg`,
                      "--delay": c.delay,
                      "--dur": c.duration,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <div className="pop-in relative mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <PartyPopper className="size-7" aria-hidden="true" />
            </div>
            <h2
              id={`${baseId}-celebrate`}
              className="relative mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
            >
              You&apos;re all set — nice work!
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
              Your workspace is ready and your team is on board. Head to your
              dashboard to start planning your first sprint.
            </p>
            <div className="relative mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <Rocket className="size-4" aria-hidden="true" />
                Go to dashboard
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Restart checklist
              </button>
            </div>
          </section>
        )}

        <ol className="mt-5 space-y-3" aria-label="Onboarding steps">
          {STEPS.map((step, index) => {
            const isDone = done.has(step.id);
            const isCurrent = step.id === currentId;
            const isOpen = openId === step.id;
            const Icon = step.icon;
            const panelId = `${baseId}-panel-${step.id}`;
            const buttonId = `${baseId}-button-${step.id}`;
            const statusLabel = isDone
              ? "Completed"
              : isCurrent
                ? "Up next"
                : "Not started";

            return (
              <li
                key={step.id}
                className={`rounded-xl border bg-white transition-colors ${
                  isCurrent
                    ? "border-indigo-300 shadow-sm ring-1 ring-indigo-100"
                    : isDone
                      ? "border-emerald-200"
                      : "border-slate-200"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : step.id)}
                    className="flex w-full items-center gap-3 rounded-xl p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isCurrent
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isDone ? <Check className="size-5" strokeWidth={3} /> : index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-semibold sm:text-base ${
                          isDone ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">
                        {step.summary}
                      </span>
                    </span>

                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
                        isDone
                          ? "bg-emerald-50 text-emerald-700"
                          : isCurrent
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <span className="sr-only sm:hidden">{statusLabel}</span>

                    <ChevronDown
                      aria-hidden="true"
                      className={`size-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-slate-100 px-4 pb-4 pt-3 sm:pl-[4.25rem]"
                  >
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <p>{step.detail}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      {isDone ? (
                        <button
                          type="button"
                          onClick={() => toggleDone(step.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                          Mark as not done
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleDone(step.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <Check className="size-4" aria-hidden="true" />
                          {step.action} &amp; mark done
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="size-3.5" aria-hidden="true" />
                        Takes about {step.minutes} min
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {!allDone && completed > 0 && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset progress
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
```