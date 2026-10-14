```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, MouseEvent } from "react";
import {
  Check,
  MessageSquare,
  Send,
  X,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

type Rating = {
  value: number;
  label: string;
  emoji: string;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Very poor", emoji: "😞" },
  { value: 2, label: "Poor", emoji: "🙁" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Excellent", emoji: "😍" },
];

const TOPICS = ["Bug report", "Feature idea", "Design", "Performance", "Other"];

const MAX_LENGTH = 500;

const STATS = [
  {
    label: "Active projects",
    value: "24",
    note: "+3 this month",
    icon: TrendingUp,
  },
  { label: "Team members", value: "18", note: "2 pending invites", icon: Users },
  { label: "Avg. review time", value: "4.2 h", note: "-18 min vs. last week", icon: Clock },
];

const ACTIVITY = [
  { who: "Priya Nair", what: "merged “Billing page refactor”", when: "12 min ago" },
  { who: "Marcus Webb", what: "commented on “Onboarding checklist”", when: "48 min ago" },
  { who: "Elena Rossi", what: "published release v2.14.0", when: "2 h ago" },
  { who: "Tomasz Kowalski", what: "closed 6 stale issues", when: "Yesterday" },
];

export default function Page() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [topic, setTopic] = useState<string>(TOPICS[1]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();
  const ratingLabelId = useId();
  const topicLabelId = useId();
  const messageId = useId();
  const errorId = useId();

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  // Sync state when the dialog closes by any route (Esc, button, form submit).
  const handleClose = useCallback(() => {
    setOpen(false);
    setError(null);
    triggerRef.current?.focus();
  }, []);

  // Clear any pending toast timer on unmount.
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    // Clicks on the <dialog> element itself (not its children) hit the backdrop.
    if (e.target === e.currentTarget) closeDialog();
  };

  const handleRatingKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const current = rating ?? (forward ? 0 : RATINGS.length + 1);
    const next = forward
      ? current >= RATINGS.length
        ? 1
        : current + 1
      : current <= 1
        ? RATINGS.length
        : current - 1;
    setRating(next);
    setError(null);
    const el = e.currentTarget.querySelector<HTMLElement>(
      `[data-rating="${next}"]`,
    );
    el?.focus();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (rating === null) {
      setError("Please choose a rating before sending.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Please add a few more details (at least 10 characters).");
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    setSubmitting(true);
    // Simulate a network round trip without touching the network.
    window.setTimeout(() => {
      setSubmitting(false);
      closeDialog();
      setRating(null);
      setTopic(TOPICS[1]);
      setMessage("");
      showToast("Thanks! Your feedback was sent to the product team.");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              N
            </span>
            <span className="text-lg font-semibold tracking-tight">Northwind</span>
          </div>
          <nav aria-label="Primary" className="hidden gap-6 text-sm text-slate-600 sm:flex">
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600" href="#overview">
              Overview
            </a>
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600" href="#activity">
              Activity
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <section id="overview" aria-labelledby="overview-title">
          <h1 id="overview-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Workspace overview
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            A snapshot of what your team shipped this week. Spotted something
            confusing or missing? Use the feedback button in the corner and
            tell us.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {STATS.map(({ label, value, note, icon: Icon }) => (
              <li
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{label}</span>
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="activity" aria-labelledby="activity-title" className="mt-12">
          <h2 id="activity-title" className="text-lg font-semibold">
            Recent activity
          </h2>
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
            {ACTIVITY.map((item) => (
              <li
                key={item.what}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm">
                  <span className="font-medium">{item.who}</span>{" "}
                  <span className="text-slate-600">{item.what}</span>
                </p>
                <time className="text-xs text-slate-500">{item.when}</time>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95 sm:bottom-6 sm:right-6 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <MessageSquare aria-hidden="true" className="size-5" />
        <span>Feedback</span>
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClose={handleClose}
        onClick={handleBackdropClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm max-sm:mb-4 max-sm:mt-auto"
      >
        <form onSubmit={handleSubmit} noValidate className="flex max-h-[90vh] flex-col overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Share your feedback
              </h2>
              <p id={descId} className="mt-1 text-sm text-slate-600">
                It takes under a minute and goes straight to the product team.
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close feedback dialog"
              className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* Rating chips */}
          <div className="mt-5">
            <p id={ratingLabelId} className="text-sm font-medium">
              How would you rate your experience?
            </p>
            <div
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-required="true"
              onKeyDown={handleRatingKey}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {RATINGS.map((r) => {
                const checked = rating === r.value;
                const tabbable = checked || (rating === null && r.value === 1);
                return (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={`${r.value} of 5: ${r.label}`}
                    data-rating={r.value}
                    tabIndex={tabbable ? 0 : -1}
                    onClick={() => {
                      setRating(r.value);
                      setError(null);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${
                      checked
                        ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span aria-hidden="true" className="text-xl leading-none">
                      {r.emoji}
                    </span>
                    <span aria-hidden="true">{r.value}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 h-4 text-xs text-slate-500" aria-live="polite">
              {rating !== null ? RATINGS[rating - 1].label : "Select 1 (low) to 5 (high)"}
            </p>
          </div>

          {/* Topic chips */}
          <div className="mt-4">
            <p id={topicLabelId} className="text-sm font-medium">
              What is it about?
            </p>
            <div
              role="radiogroup"
              aria-labelledby={topicLabelId}
              className="mt-2 flex flex-wrap gap-2"
            >
              {TOPICS.map((t) => {
                const checked = topic === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setTopic(t)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${
                      checked
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div className="mt-4">
            <label htmlFor={messageId} className="text-sm font-medium">
              Tell us more
            </label>
            <textarea
              ref={textareaRef}
              id={messageId}
              value={message}
              maxLength={MAX_LENGTH}
              rows={4}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error !== null && message.trim().length < 10}
              aria-describedby={error ? errorId : undefined}
              placeholder="e.g. The export button is hard to find on the reports page."
              className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          <p
            id={errorId}
            role="alert"
            className={error ? "mt-2 text-sm text-red-600" : "sr-only"}
          >
            {error ?? ""}
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
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send aria-hidden="true" className="size-4" />
              {submitting ? "Sending…" : "Send feedback"}
            </button>
          </div>
        </form>
      </dialog>

      {/* Toast live region (always mounted so announcements are reliable) */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-24 sm:justify-end sm:px-6"
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500"
            >
              <Check className="size-3.5" />
            </span>
            <p className="flex-1">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="-mr-1 grid size-6 shrink-0 place-items-center rounded text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```