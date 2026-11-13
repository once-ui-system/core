"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

interface Props {
  name: string;
  email: string;
  role: string;
}

export function SettingsForm({ name, email, role }: Props) {
  const uid = useId();
  const [fullName, setFullName] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
  }

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30";

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <section
        aria-labelledby={`${uid}-profile`}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id={`${uid}-profile`} className="text-base font-semibold text-slate-900">
          Profile
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-role`} className="text-sm font-medium text-slate-700">
              Role
            </label>
            <input
              id={`${uid}-role`}
              type="text"
              value={role}
              readOnly
              aria-describedby={`${uid}-role-help`}
              className={`${inputClass} bg-slate-50 text-slate-600`}
            />
            <p id={`${uid}-role-help`} className="mt-1 text-xs text-slate-500">
              Only workspace owners can change roles.
            </p>
          </div>
        </div>
      </section>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <legend className="px-1 text-base font-semibold text-slate-900">Notifications</legend>
        <div className="mt-2 space-y-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => {
                setWeekly(e.target.checked);
                setSaved(false);
              }}
              className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Weekly summary</span>
              <span className="block text-sm text-slate-500">
                A Monday email with issue activity across your projects.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={mentions}
              onChange={(e) => {
                setMentions(e.target.checked);
                setSaved(false);
              }}
              className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Mentions and assignments</span>
              <span className="block text-sm text-slate-500">
                Get notified when someone mentions you or assigns you an issue.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          Save changes
        </button>
        <p role="status" aria-live="polite" className="text-sm text-emerald-700">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}
