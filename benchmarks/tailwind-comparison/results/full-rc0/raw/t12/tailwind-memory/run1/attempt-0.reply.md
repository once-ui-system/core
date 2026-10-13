I'll build the page with a native `<dialog>` for focus trapping and Esc handling, and a live-region toast.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  MessageSquarePlus,
  X,
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Laugh,
  Angry,
  ArrowRight,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

type Rating = {
  value: number;
  label: string;
  Icon: typeof Smile;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Terrible", Icon: Angry },
  { value: 2, label: "Poor", Icon: Frown },
  { value: 3, label: "Okay", Icon: Meh },
  { value: 4, label: "Good", Icon: Smile },
  { value: 5, label: "Great", Icon: Laugh },
];

const MAX_LENGTH = 500;

const STATS = [
  { label: "Active projects", value: "128", Icon: BarChart3 },
  { label: "Team members", value: "24", Icon: Users },
  { label: "Deploys this week", value: "312", Icon: Zap },
];

const ACTIVITY = [
  { who: "Priya Nair", what: "merged “Billing page redesign”", when: "12 min ago" },
  { who: "Tomás Herrera", what: "opened a review on “Webhook retries”", when: "1 hr ago" },
  { who: "Aisha Okafor", what: "published release v2.14.0", when: "3 hrs ago" },
  { who: "Jonas Lindqvist", what: "commented on “Onboarding checklist”", when: "Yesterday" },
];

export default function Page() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();
  const ratingLabelId = useId();
  const textId = useId();
  const errorId = useId();

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      setOpen(true);
    }
  }, []);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  // Sync state when the dialog closes (Esc, close button, form submit).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === null) {
      setError("Please choose a rating before sending.");
      return;
    }
    setError(null);
    closeDialog();
    setRating(null);
    setMessage("");
    showToast("Thanks! Your feedback was sent to the team.");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeDialog();
  };

  // Roving keyboard support for the rating radio group.
  const handleRatingKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const current = rating ?? (forward ? 0 : 6);
    const next = forward ? (current % 5) + 1 : current <= 1 ? 5 : current - 1;
    setRating(next);
    setError(null);
    const el = e.currentTarget.querySelector<HTMLButtonElement>(
      `[data-value="${next}"]`,
    );
    el?.focus();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              L
            </span>
            <span className="text-lg font-semibold tracking-tight">Launchpad</span>
          </div>
          <nav aria-label="Primary" className="hidden gap-6 text-sm text-slate-600 sm:flex">
            <a href="#overview" className="hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
              Overview
            </a>
            <a href="#activity" className="hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
              Activity
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section id="overview" aria-labelledby="overview-title">
          <p className="text-sm font-medium text-indigo-600">Workspace · Acme Studio</p>
          <h1
            id="overview-title"
            className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Good morning, Maya
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Here is what your team shipped recently. Tell us how Launchpad is working for you
            using the feedback button in the corner.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {STATS.map(({ label, value, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-semibold leading-none">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="activity" aria-labelledby="activity-title" className="mt-10">
          <h2 id="activity-title" className="text-xl font-semibold">
            Recent activity
          </h2>
          <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {ACTIVITY.map((item) => (
              <li
                key={item.what}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm">
                  <span className="font-medium">{item.who}</span>{" "}
                  <span className="text-slate-600">{item.what}</span>
                </p>
                <span className="text-xs text-slate-500">{item.when}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={openDialog}
            className="mt-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Something not working? Share feedback
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:bottom-6 sm:right-6 motion-reduce:transition-none"
      >
        <MessageSquarePlus className="size-5" aria-hidden="true" />
        <span>Feedback</span>
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={handleBackdropClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Send us feedback
              </h2>
              <p id={descId} className="mt-1 text-sm text-slate-600">
                How is your experience with Launchpad so far?
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close feedback dialog"
              className="-mr-2 -mt-2 grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            <p id={ratingLabelId} className="text-sm font-medium">
              Your rating
            </p>
            <div
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-describedby={error ? errorId : undefined}
              onKeyDown={handleRatingKey}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {RATINGS.map(({ value, label, Icon }) => {
                const selected = rating === value;
                const focusable = selected || (rating === null && value === 1);
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-value={value}
                    tabIndex={focusable ? 0 : -1}
                    onClick={() => {
                      setRating(value);
                      setError(null);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {error && (
              <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label htmlFor={textId} className="text-sm font-medium">
              Tell us more <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id={textId}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
              rows={4}
              maxLength={MAX_LENGTH}
              placeholder="What worked well, or what could be better?"
              className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
            />
            <p className="mt-1 text-right text-xs text-slate-500" aria-live="off">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Send feedback
            </button>
          </div>
        </form>
      </dialog>

      {/* Toast live region (always mounted so announcements are reliable) */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-40 flex justify-center sm:inset-x-auto sm:bottom-24 sm:right-6 sm:justify-end"
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <p className="flex-1">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="-mr-1 grid size-6 shrink-0 place-items-center rounded text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
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