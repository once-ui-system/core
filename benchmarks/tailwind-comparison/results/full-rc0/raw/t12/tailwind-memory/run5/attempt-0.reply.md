```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  FileText,
  FolderKanban,
  Loader2,
  MessageSquareHeart,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";

type Rating = {
  value: number;
  label: string;
  emoji: string;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Frustrating", emoji: "😣" },
  { value: 2, label: "Poor", emoji: "🙁" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Excellent", emoji: "🤩" },
];

const MAX_COMMENT = 500;

const NAV_ITEMS = [
  { label: "Projects", icon: FolderKanban, active: true },
  { label: "Documents", icon: FileText, active: false },
  { label: "Team", icon: Users, active: false },
  { label: "Reports", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const PROJECTS = [
  {
    name: "Harbor Street Renovation",
    status: "On track",
    due: "Mar 28",
    progress: 72,
    tone: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Q2 Field Survey",
    status: "Needs review",
    due: "Apr 04",
    progress: 48,
    tone: "bg-amber-100 text-amber-800",
  },
  {
    name: "Riverside Permit Package",
    status: "On track",
    due: "Apr 16",
    progress: 31,
    tone: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Westgate Soil Report",
    status: "Blocked",
    due: "Apr 22",
    progress: 15,
    tone: "bg-rose-100 text-rose-800",
  },
];

const STATS = [
  { label: "Active projects", value: "12" },
  { label: "Notes this week", value: "248" },
  { label: "Open reviews", value: "7" },
];

type ToastState = { id: number; message: string } | null;

export default function Page() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const ids = {
    title: useId(),
    desc: useId(),
    ratingLabel: useId(),
    ratingError: useId(),
    comment: useId(),
    counter: useId(),
  };

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Clean up any pending submit timer on unmount.
  const submitTimer = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (submitTimer.current !== null) window.clearTimeout(submitTimer.current);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (rating === null) {
      setRatingError(true);
      return;
    }
    setSubmitting(true);
    // Simulated network request.
    submitTimer.current = window.setTimeout(() => {
      const chosen = RATINGS.find((r) => r.value === rating);
      setSubmitting(false);
      setRating(null);
      setComment("");
      setRatingError(false);
      closeDialog();
      setToast({
        id: Date.now(),
        message: `Thanks! Your "${chosen?.label ?? "feedback"}" rating was sent to the Fieldnotes team.`,
      });
    }, 900);
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // Clicking the backdrop (the dialog element itself) closes it.
    if (event.target === event.currentTarget && !submitting) closeDialog();
  };

  const remaining = MAX_COMMENT - comment.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              F
            </span>
            <span className="text-lg">Fieldnotes</span>
          </div>
          <div className="relative ml-auto hidden w-full max-w-xs sm:block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <label htmlFor="search" className="sr-only">
              Search projects
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search projects"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-0"
          >
            <Bell aria-hidden="true" className="size-5" />
          </button>
          <div
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700"
          >
            MR
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Sidebar */}
        <nav aria-label="Primary" className="hidden w-52 shrink-0 md:block">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
              <li key={label}>
                <a
                  href="#"
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main */}
        <main className="min-w-0 flex-1 pb-24">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-slate-600">
            Good morning, Maya. Four projects need your attention this week.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <dt className="text-sm text-slate-600">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="recent-heading" className="mt-8">
            <h2 id="recent-heading" className="text-lg font-semibold">
              Recent projects
            </h2>
            <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {PROJECTS.map((project) => (
                <li
                  key={project.name}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="text-sm text-slate-600">Due {project.due}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:w-64">
                    <div
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.progress}
                      className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                    >
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-sm tabular-nums text-slate-600">
                      {project.progress}%
                    </span>
                  </div>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${project.tone}`}
                  >
                    {project.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:bottom-6 sm:right-6"
      >
        <MessageSquareHeart aria-hidden="true" className="size-5" />
        <span>Feedback</span>
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby={ids.title}
        aria-describedby={ids.desc}
        onClick={handleDialogClick}
        onCancel={(e) => {
          if (submitting) e.preventDefault();
        }}
        onClose={() => {
          setRatingError(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={ids.title} className="text-xl font-semibold tracking-tight">
                Share your feedback
              </h2>
              <p id={ids.desc} className="mt-1 text-sm text-slate-600">
                Tell us how Fieldnotes is working for you. It takes under a
                minute.
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              aria-label="Close feedback dialog"
              className="-mr-2 -mt-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <fieldset className="mt-5 min-w-0">
            <legend
              id={ids.ratingLabel}
              className="text-sm font-medium text-slate-800"
            >
              How would you rate your experience?
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {RATINGS.map((r) => {
                const checked = rating === r.value;
                return (
                  <label
                    key={r.value}
                    className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-3 text-center transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600 ${
                      checked
                        ? "border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={r.value}
                      checked={checked}
                      onChange={() => {
                        setRating(r.value);
                        setRatingError(false);
                      }}
                      aria-describedby={ratingError ? ids.ratingError : undefined}
                      className="sr-only"
                    />
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {r.emoji}
                    </span>
                    <span className="text-[11px] font-medium leading-tight sm:text-xs">
                      <span aria-hidden="true">{r.value}</span>
                      <span className="sr-only">
                        {r.value} of 5,{" "}
                      </span>
                      <span className="hidden sm:inline"> · </span>
                      <span className="hidden sm:inline">{r.label}</span>
                      <span className="sr-only sm:hidden">{r.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p
              id={ids.ratingError}
              role={ratingError ? "alert" : undefined}
              className={`mt-2 text-sm text-rose-700 ${ratingError ? "" : "hidden"}`}
            >
              Please choose a rating before sending.
            </p>
          </fieldset>

          <div className="mt-5">
            <label
              htmlFor={ids.comment}
              className="text-sm font-medium text-slate-800"
            >
              Anything you&apos;d like to add?{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              ref={textareaRef}
              id={ids.comment}
              value={comment}
              maxLength={MAX_COMMENT}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              aria-describedby={ids.counter}
              placeholder="e.g. Offline sync dropped a few of my site notes yesterday."
              className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p
              id={ids.counter}
              className={`mt-1 text-right text-xs tabular-nums ${
                remaining < 50 ? "text-amber-700" : "text-slate-600"
              }`}
            >
              {remaining} characters left
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {submitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send feedback"
              )}
            </button>
          </div>
        </form>
      </dialog>

      {/* Toast live region (always mounted so announcements are reliable) */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-30 flex justify-center sm:inset-x-auto sm:bottom-24 sm:right-6 sm:justify-end"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-xl"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-emerald-600"
            />
            <p className="flex-1 text-sm text-slate-800">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
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