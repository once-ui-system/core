"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  dark: boolean;
}

export function InviteDialog(props: Props) {
  if (!props.open) return null;
  return <InviteInner {...props} />;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InviteInner({ onClose, dark }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const errorId = `${uid}-error`;
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    emailRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), a[href]",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address, like name@company.com.");
      emailRef.current?.focus();
      return;
    }
    setError("");
    setSent(value);
  }

  const panel = dark
    ? "bg-slate-900 text-slate-100 border-slate-700"
    : "bg-white text-slate-900 border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md rounded-xl border p-5 shadow-2xl ${panel}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              Invite member
            </h2>
            <p className={`mt-1 text-sm ${muted}`}>
              They’ll get an email with a link to join Acme Labs on Lumen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`rounded-md p-1.5 focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              dark ? "hover:bg-slate-800" : "hover:bg-slate-100"
            }`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="mt-5">
            <p role="status" className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <span>
                Invitation sent to <strong>{sent}</strong>.
              </span>
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-5">
            <label htmlFor={`${uid}-email`} className="block text-sm font-medium">
              Email address
            </label>
            <input
              ref={emailRef}
              id={`${uid}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@acmelabs.io"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                dark
                  ? "border-slate-600 bg-slate-950 placeholder:text-slate-500"
                  : "border-slate-300 bg-white placeholder:text-slate-400"
              }`}
            />
            {error && (
              <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-500">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  dark ? "border-slate-600 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Send invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
