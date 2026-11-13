"use client";

import { useState } from "react";
import { user } from "@/lib/data";

const inputClass =
  "h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500";

export default function SettingsPage() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-0.5 text-slate-600">Your profile and notification preferences.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="max-w-xl space-y-4"
      >
        <section aria-labelledby="profile-heading" className="rounded-md border border-slate-200 bg-white p-3">
          <h2 id="profile-heading" className="mb-3 text-base font-semibold">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                autoComplete="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-xs font-medium text-slate-700">
                Role
              </label>
              <input id="role" className={inputClass} value={user.role} disabled readOnly />
            </div>
          </div>
        </section>

        <section aria-labelledby="notify-heading" className="rounded-md border border-slate-200 bg-white p-3">
          <h2 id="notify-heading" className="mb-3 text-base font-semibold">
            Notifications
          </h2>
          <ul className="space-y-2">
            {[
              { id: "digest", label: "Weekly digest email", value: digest, set: setDigest },
              { id: "alerts", label: "Alert when an issue is assigned to me", value: alerts, set: setAlerts },
            ].map((opt) => (
              <li key={opt.id} className="flex items-center justify-between gap-3">
                <span id={`${opt.id}-label`}>{opt.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={opt.value}
                  aria-labelledby={`${opt.id}-label`}
                  onClick={() => {
                    opt.set(!opt.value);
                    setSaved(false);
                  }}
                  className={`relative h-5 w-9 shrink-0 rounded-md border ${
                    opt.value ? "border-brand-700 bg-brand-700" : "border-slate-300 bg-slate-200"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 size-3.5 rounded-xs bg-white ${
                      opt.value ? "left-[1.125rem]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="h-8 rounded-md bg-brand-700 px-3 text-sm font-medium text-white hover:bg-brand-800"
          >
            Save changes
          </button>
          <p role="status" className="text-sm text-slate-600">
            {saved ? "Settings saved." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
