"use client";

import { useId, useState } from "react";
import { user } from "@/lib/data";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p id={`${id}-label`} className="font-semibold">{label}</p>
        <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-sand-400"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 left-1 size-6 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby="profile-title" className="card flex flex-col gap-6 p-6 sm:p-8">
        <h2 id="profile-title" className="text-2xl font-bold">Profile</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">Full name</label>
          <input
            id="name"
            className="field"
            value={name}
            autoComplete="name"
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold">Email</label>
          <input
            id="email"
            type="email"
            className="field"
            value={email}
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="font-semibold">Role</label>
          <input id="role" className="field bg-sunken" value={user.role} readOnly aria-describedby="role-hint" />
          <p id="role-hint" className="text-sm text-muted">Only another owner can change your role.</p>
        </div>
      </section>

      <section aria-labelledby="notify-title" className="card p-6 sm:p-8">
        <h2 id="notify-title" className="text-2xl font-bold">Notifications</h2>
        <div className="mt-2 divide-y divide-line">
          <Toggle
            label="Weekly summary"
            hint="A friendly recap of issues and activity every Monday."
            checked={weekly}
            onChange={(v) => { setWeekly(v); setSaved(false); }}
          />
          <Toggle
            label="Mentions"
            hint="Email me when a teammate mentions me on an issue."
            checked={mentions}
            onChange={(v) => { setMentions(v); setSaved(false); }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary">Save changes</button>
        <p role="status" className="font-medium text-muted">
          {saved ? "Saved. Looking good!" : ""}
        </p>
      </div>
    </form>
  );
}
