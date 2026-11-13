"use client";

import { useId, useState } from "react";

import { user } from "@/lib/data";

function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        <p id={`${id}-desc`} className="text-sm text-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-md border transition-colors",
          checked ? "border-brand bg-brand" : "border-line bg-raised",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute top-0.5 size-4.5 rounded-sm transition-all",
            checked ? "left-[1.375rem] bg-on-brand" : "left-0.5 bg-muted",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby="profile-heading" className="card p-4 md:p-5">
        <h2 id="profile-heading" className="text-lg font-semibold">
          Profile
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              className="field"
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              value={user.email}
              readOnly
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-xs text-muted">
              Contact your workspace owner to change the sign-in email.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <input id="role" name="role" className="field" value={user.role} readOnly />
          </div>
        </div>
      </section>

      <section aria-labelledby="notify-heading" className="card p-4 md:p-5">
        <h2 id="notify-heading" className="text-lg font-semibold">
          Notifications
        </h2>
        <div className="mt-2 divide-y divide-line">
          <Switch
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            checked={digest}
            onChange={(value) => {
              setDigest(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Issue alerts"
            description="Email me when an issue assigned to me changes status."
            checked={alerts}
            onChange={(value) => {
              setAlerts(value);
              setSaved(false);
            }}
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary">
          Save changes
        </button>
        <p role="status" className="text-sm text-muted">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}
