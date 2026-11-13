"use client";

import { useState } from "react";
import { user } from "@/lib/data";

function Switch({
  checked,
  onChange,
  labelId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelId: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-sm border transition-colors ${
        checked ? "border-primary bg-primary" : "border-line-strong bg-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-xs bg-white transition-[left] ${
          checked ? "left-[1.1rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-soft">Your profile and notification preferences.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <section aria-labelledby="profile-heading" className="card">
          <h2 id="profile-heading" className="border-b border-line px-3 py-2 text-lg">
            Profile
          </h2>
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-medium text-ink-soft">
                Full name
              </label>
              <input
                id="name"
                className="field"
                value={name}
                autoComplete="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-ink-soft">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-xs font-medium text-ink-soft">
                Role
              </label>
              <input id="role" className="field bg-canvas text-ink-soft" value={user.role} readOnly />
            </div>
          </div>
        </section>

        <section aria-labelledby="notif-heading" className="card">
          <h2 id="notif-heading" className="border-b border-line px-3 py-2 text-lg">
            Notifications
          </h2>
          <ul className="divide-y divide-line">
            {[
              { id: "n-weekly", label: "Weekly analytics summary", hint: "Sent every Monday morning.", value: weekly, set: setWeekly },
              { id: "n-mentions", label: "Mentions and assignments", hint: "When someone assigns you an issue or mentions you.", value: mentions, set: setMentions },
              { id: "n-digest", label: "Daily issue digest", hint: "A short list of what changed overnight.", value: digest, set: setDigest },
            ].map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p id={row.id} className="text-sm font-medium text-ink">
                    {row.label}
                  </p>
                  <p className="text-xs text-ink-faint">{row.hint}</p>
                </div>
                <Switch
                  checked={row.value}
                  labelId={row.id}
                  onChange={(v) => {
                    row.set(v);
                    setSaved(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
          <p role="status" className="text-sm text-ink-soft">
            {saved ? "Settings saved." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
