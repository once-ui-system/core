No `node_modules` is available to verify icon names, so I'll use only the most stable ones.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Angry,
  CheckCircle2,
  Frown,
  Laugh,
  Meh,
  MessageSquare,
  Send,
  Smile,
  X,
} from "lucide-react";

type Rating = {
  value: number;
  label: string;
  Icon: typeof Smile;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Very poor", Icon: Angry },
  { value: 2, label: "Poor", Icon: Frown },
  { value: 3, label: "Okay", Icon: Meh },
  { value: 4, label: "Good", Icon: Smile },
  { value: 5, label: "Excellent", Icon: Laugh },
];

const MAX_LENGTH = 500;

const STATS = [
  { label: "Active projects", value: "12", note: "+2 this month" },
  { label: "Tasks completed", value: "148", note: "+23 vs last week" },
  { label: "Team members", value: "9", note: "3 online now" },
];

const ACTIVITY = [
  { who: "Priya Nair", what: "closed 4 tasks in Atlas Redesign", when: "12 min ago" },
  { who: "Marcus Lindqvist", what: "commented on Billing Migration", when: "47 min ago" },
  { who: "Sofia Alvarez", what: "shared the Q3 roadmap with Design", when: "2 hours ago" },
  { who: "Daniel Okafor", what: "created the Mobile Onboarding project", when: "Yesterday" },
];

export default function Page() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formId = useId();
  const titleId = `${formId}-title`;
  const descId = `${formId}-desc`;
  const textareaId = `${formId}-message`;
  const errorId = `${formId}-error`;

  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Return focus to the trigger whenever the dialog closes (Esc, button, submit).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => triggerRef.current?.focus();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 5000);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating === null) {
      setError("Please choose a rating before sending.");
      return;
    }
    setError(null);
    closeDialog();
    setRating(null);
    setMessage("");
    showToast();
  };

  // Close when clicking the backdrop (the dialog element itself, outside the panel).
  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  const handleRatingKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const current = rating ?? (forward ? 0 : RATINGS.length + 1);
    const next = forward
      ? (current % RATINGS.length) + 1
      : current - 1 < 1
        ? RATINGS.length
        : current - 1;
    setRating(next);
    setError(null);
    const buttons =
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons[next - 1]?.focus();
  };

  const activeLabel = RATINGS.find((r) => r.value === rating)?.label;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              T
            </span>
            <span className="text-lg font-semibold tracking-tight">Tideline</span>
          </div>
          <nav aria-label="Primary" className="hidden gap-6 text-sm text-slate-600 sm:flex">
            <a href="#overview" className="hover:text-slate-900">Overview</a>
            <a href="#activity" className="hover:text-slate-900">Activity</a>
            <a href="#overview" className="hover:text-slate-900">Settings</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Good morning, Priya
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Here is what your team has been working on. We are always improving
            Tideline, so tell us what is working and what is not using the
            feedback button in the corner.
          </p>
        </div>

        <section id="overview" aria-label="Overview" className="mt-8">
          <ul className="grid gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <li
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-1 text-sm text-emerald-700">{stat.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="activity" aria-labelledby="activity-heading" className="mt-8">
          <h2 id="activity-heading" className="text-lg font-semibold">
            Recent activity
          </h2>
          <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
            {ACTIVITY.map((item) => (
              <li
                key={item.who + item.when}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm sm:text-base">
                  <span className="font-medium">{item.who}</span>{" "}
                  <span className="text-slate-600">{item.what}</span>
                </p>
                <p className="text-sm text-slate-500">{item.when}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:bottom-6 sm:right-6 sm:px-5"
      >
        <MessageSquare className="size-5" aria-hidden="true" />
        <span>Feedback</span>
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={handleDialogClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-transparent p-0 text-slate-900 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                Send us feedback
              </h2>
              <p id={descId} className="mt-1 text-sm text-slate-600">
                How is your experience with Tideline so far?
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close feedback dialog"
              className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            <span id={`${formId}-rating-label`} className="text-sm font-medium">
              Your rating
            </span>
            <div
              role="radiogroup"
              aria-labelledby={`${formId}-rating-label`}
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onKeyDown={handleRatingKeyDown}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {RATINGS.map(({ value, label, Icon }, index) => {
                const selected = rating === value;
                const focusable = rating === null ? index === 0 : selected;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${value} – ${label}`}
                    tabIndex={focusable ? 0 : -1}
                    onClick={() => {
                      setRating(value);
                      setError(null);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                    <span aria-hidden="true" className="tabular-nums">
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 min-h-5 text-sm text-slate-600" aria-live="polite">
              {activeLabel ?? "Select a rating from 1 to 5"}
            </p>
          </div>

          <div className="mt-3">
            <label htmlFor={textareaId} className="text-sm font-medium">
              Tell us more <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id={textareaId}
              ref={textareaRef}
              value={message}
              maxLength={MAX_LENGTH}
              rows={4}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you like, or what could we do better?"
              className="mt-2 block w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600"
            />
            <p className="mt-1 text-right text-xs text-slate-500 tabular-nums">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          <p
            id={errorId}
            role="alert"
            className={error ? "mt-2 text-sm font-medium text-red-700" : "sr-only"}
          >
            {error}
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Send className="size-4" aria-hidden="true" />
              Send feedback
            </button>
          </div>
        </form>
      </dialog>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-40 flex justify-center sm:inset-x-auto sm:bottom-24 sm:right-6"
      >
        {toastVisible && (
          <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-slate-900 p-4 text-white shadow-xl">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">Thanks for your feedback!</p>
              <p className="mt-0.5 text-sm text-slate-300">
                Our product team reads every submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastVisible(false)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
```