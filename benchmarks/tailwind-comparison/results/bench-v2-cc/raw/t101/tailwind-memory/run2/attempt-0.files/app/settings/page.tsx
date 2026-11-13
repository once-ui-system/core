"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { user } from "@/lib/data";

const inputClass =
  "h-8 w-full rounded-sm border border-line-strong bg-surface px-2 text-sm text-ink placeholder:text-ink-subtle disabled:bg-slate-100 disabled:text-ink-subtle";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <>
      <PageTitle title="Settings" description="Your profile and notification preferences." />

      <form
        className="flex max-w-xl flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("Settings saved.");
        }}
      >
        <fieldset className="rounded-sm border border-line bg-surface p-3">
          <legend className="px-1 font-serif text-base font-semibold">Profile</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-muted">
                Full name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatus("");
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("");
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-xs font-medium text-ink-muted">
                Role
              </label>
              <input id="role" value={user.role} disabled className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-sm border border-line bg-surface p-3">
          <legend className="px-1 font-serif text-base font-semibold">Notifications</legend>
          <div className="mt-1 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={weekly}
                onChange={(e) => {
                  setWeekly(e.target.checked);
                  setStatus("");
                }}
                className="size-4 rounded-sm accent-brand"
              />
              Weekly summary of project activity
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={assigned}
                onChange={(e) => {
                  setAssigned(e.target.checked);
                  setStatus("");
                }}
                className="size-4 rounded-sm accent-brand"
              />
              Email me when an issue is assigned to me
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="h-8 rounded-sm bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Save changes
          </button>
          <p role="status" aria-live="polite" className="text-sm text-brand">
            {status}
          </p>
        </div>
      </form>
    </>
  );
}
