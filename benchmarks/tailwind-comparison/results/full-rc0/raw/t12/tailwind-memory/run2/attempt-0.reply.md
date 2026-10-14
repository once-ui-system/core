I'll use the native `<dialog>` element with `showModal()` for focus trapping and Escape handling, and a live region for the toast.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Frown,
  Meh,
  MessageSquare,
  Smile,
  SmilingFace,
  X,
} from "lucide-react";

type Rating = {
  value: number;
  label: string;
  Icon: typeof Smile;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Frustrating", Icon: Frown },
  { value: 2, label: "Confusing", Icon: Meh },
  { value: 3, label: "Okay", Icon: Meh },
  { value: 4, label: "Good", Icon: Smile },
  { value: 5, label: "Delightful", Icon: SmilingFace },
];

const MAX_LENGTH = 500;

const RECENT_RELEASES = [
  {
    version: "2.14",
    title: "Faster project switching",
    body: "Jump between workspaces with Cmd+K. Recent projects now load in under 200 ms.",
    date: "Mar 4",
  },
  {
    version: "2.13",
    title: "Shared dashboards",
    body: "Invite teammates to view live dashboards with read-only links and expiry dates.",
    date: "Feb 18",
  },
  {
    version: "2.12",
    title: "CSV export improvements",
    body: "Exports now keep your column order and support up to 250,000 rows.",
    date: "Jan 30",
  },
];

export default function Page() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const ids = useId();
  const titleId = `${ids}-title`;
  const descId = `${ids}-desc`;
  const ratingLabelId = `${ids}-rating`;
  const messageId = `${ids}-message`;
  const errorId = `${ids}-error`;
  const countId = `${ids}-count`;

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Return focus to the trigger once the dialog closes (Esc, backdrop, button).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
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
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating === null) {
      setError("Please choose a rating before sending.");
      return;
    }
    setError(null);
    const chosen = RATINGS.find((r) => r.value === rating);
    closeDialog();
    showToast(
      `Thanks! Your "${chosen?.label ?? ""}" feedback was sent to the team.`,
    );
    setRating(null);
    setMessage("");
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // Clicks on the <dialog> element itself (not its content) hit the backdrop.
    if (event.target === event.currentTarget) closeDialog();
  };

  const handleRatingKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const current = rating ?? (forward ? 0 : 6);
    const next = forward
      ? current >= 5
        ? 1
        : current + 1
      : current <= 1
        ? 5
        : current - 1;
    setRating(next);
    setError(null);
    const buttons =
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons[next - 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              F
            </span>
            Fieldnote
          </div>
          <nav aria-label="Primary" className="hidden gap-6 text-sm text-slate-600 sm:flex">
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600" href="#releases">
              Releases
            </a>
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600" href="#releases">
              Docs
            </a>
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600" href="#releases">
              Support
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-700">Product updates</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            What&apos;s new in Fieldnote
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            We ship improvements every two weeks. Tried something recently?
            Tell us how it went using the feedback button in the corner — every
            message is read by the product team.
          </p>
        </section>

        <section
          id="releases"
          aria-labelledby="releases-heading"
          className="mt-12"
        >
          <h2 id="releases-heading" className="text-lg font-semibold">
            Recent releases
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECENT_RELEASES.map((release) => (
              <li
                key={release.version}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                    v{release.version}
                  </span>
                  <time>{release.date}</time>
                </div>
                <h3 className="mt-3 font-semibold">{release.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {release.body}
                </p>
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
        className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:right-6 sm:bottom-6"
      >
        <MessageSquare className="size-5" aria-hidden="true" />
        Feedback
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={handleBackdropClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Send feedback
              </h2>
              <p id={descId} className="mt-1 text-sm text-slate-600">
                How is Fieldnote working for you?
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close feedback dialog"
              className="-m-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            <span
              id={ratingLabelId}
              className="text-sm font-medium text-slate-800"
            >
              Your rating
            </span>
            <div
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-required="true"
              aria-describedby={error ? errorId : undefined}
              onKeyDown={handleRatingKeyDown}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {RATINGS.map(({ value, label, Icon }) => {
                const selected = rating === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${value} – ${label}`}
                    tabIndex={
                      selected || (rating === null && value === 1) ? 0 : -1
                    }
                    onClick={() => {
                      setRating(value);
                      setError(null);
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      selected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span aria-hidden="true">{value}</span>
                  </button>
                );
              })}
            </div>
            <p
              className="mt-2 h-5 text-sm text-slate-600"
              aria-live="polite"
            >
              {rating !== null
                ? RATINGS.find((r) => r.value === rating)?.label
                : ""}
            </p>
            {error && (
              <p
                id={errorId}
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-sm text-red-700"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor={messageId}
              className="text-sm font-medium text-slate-800"
            >
              Anything you&apos;d like to add?{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id={messageId}
              ref={textareaRef}
              value={message}
              maxLength={MAX_LENGTH}
              rows={4}
              onChange={(e) => setMessage(e.target.value)}
              aria-describedby={countId}
              placeholder="e.g. The new project switcher is great, but I can't find archived boards."
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
            />
            <p
              id={countId}
              className="mt-1 text-right text-xs text-slate-500"
            >
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

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
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
        className="pointer-events-none fixed inset-x-4 bottom-20 z-40 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-24"
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <p className="flex-1">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="-m-1 rounded p-1 text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```