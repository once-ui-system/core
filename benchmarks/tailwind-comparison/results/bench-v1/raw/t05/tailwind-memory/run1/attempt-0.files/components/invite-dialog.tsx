"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { INVITE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({ open, onClose, onInvite }: InviteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!EMAIL_RE.test(trimmed)) next.email = "Enter a valid email address, like name@company.com.";
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (next.email) {
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    if (next.role) {
      document.getElementById(`${uid}-role`)?.focus();
      return;
    }
    onInvite(email.trim(), role as Role);
    reset();
    onClose();
  }

  function handleClose() {
    // Fires for Escape, form close and programmatic close.
    reset();
    onClose();
  }

  const fieldBase =
    "mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-desc`}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
    >
      <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${uid}-title`} className="text-lg font-semibold">
              Invite member
            </h2>
            <p id={`${uid}-desc`} className="mt-1 text-sm text-slate-600">
              They&apos;ll get an email with a link to join the Acme Labs workspace on Lumen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dialog"
            className="-m-1.5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor={`${uid}-email`} className="text-sm font-medium text-slate-800">
              Email <span aria-hidden="true" className="text-rose-600">*</span>
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@acmelabs.io"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              className={`${fieldBase} ${errors.email ? "border-rose-500" : "border-slate-300"}`}
            />
            {errors.email && (
              <p id={`${uid}-email-err`} className="mt-1.5 text-sm text-rose-700">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-role`} className="text-sm font-medium text-slate-800">
              Role <span aria-hidden="true" className="text-rose-600">*</span>
            </label>
            <select
              id={`${uid}-role`}
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={errors.role ? `${uid}-role-err` : `${uid}-role-hint`}
              className={`${fieldBase} ${errors.role ? "border-rose-500" : "border-slate-300"}`}
            >
              <option value="">Select a role…</option>
              {INVITE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role ? (
              <p id={`${uid}-role-err`} className="mt-1.5 text-sm text-rose-700">
                {errors.role}
              </p>
            ) : (
              <p id={`${uid}-role-hint`} className="mt-1.5 text-xs text-slate-500">
                {role ? ROLE_DESCRIPTIONS[role as Role] : "Roles control what someone can see and change."}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-message`} className="text-sm font-medium text-slate-800">
              Message <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id={`${uid}-message`}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! We're tracking the launch issues in Lumen — come join us."
              className={`${fieldBase} border-slate-300 resize-none`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Send invite
          </button>
        </div>
      </form>
    </dialog>
  );
}
