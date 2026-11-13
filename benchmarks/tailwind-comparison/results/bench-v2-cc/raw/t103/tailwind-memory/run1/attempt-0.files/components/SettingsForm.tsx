"use client";

import { useId, useState } from "react";
import { user } from "@/lib/data";

interface Toggles {
  digest: boolean;
  assigned: boolean;
  regressions: boolean;
}

const toggleLabels: { id: keyof Toggles; label: string; hint: string }[] = [
  { id: "digest", label: "Weekly digest", hint: "A Monday summary of open issues and usage trends." },
  { id: "assigned", label: "Issue assignments", hint: "Email me when an issue is assigned to me." },
  { id: "regressions", label: "Regression alerts", hint: "Notify me when an error rate rises after a release." },
];

const inputClass =
  "mt-1.5 block w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-fg placeholder:text-muted disabled:cursor-not-allowed disabled:text-muted";

export default function SettingsForm() {
  const baseId = useId();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [toggles, setToggles] = useState<Toggles>({ digest: true, assigned: true, regressions: false });
  const [saved, setSaved] = useState(false);

  function flip(id: keyof Toggles) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby={`${baseId}-profile`} className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id={`${baseId}-profile`} className="text-lg font-semibold">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted">How you appear to your team in Lumen.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${baseId}-name`} className="text-sm font-medium">
              Full name
            </label>
            <input
              id={`${baseId}-name`}
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
            <label htmlFor={`${baseId}-email`} className="text-sm font-medium">
              Email
            </label>
            <input
              id={`${baseId}-email`}
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
            <label htmlFor={`${baseId}-role`} className="text-sm font-medium">
              Role
            </label>
            <input id={`${baseId}-role`} className={inputClass} value={user.role} disabled readOnly />
          </div>
        </div>
      </section>

      <section aria-labelledby={`${baseId}-notify`} className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id={`${baseId}-notify`} className="text-lg font-semibold">
          Notifications
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {toggleLabels.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p id={`${baseId}-${t.id}`} className="text-sm font-medium">
                  {t.label}
                </p>
                <p id={`${baseId}-${t.id}-hint`} className="text-sm text-muted">
                  {t.hint}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[t.id]}
                aria-labelledby={`${baseId}-${t.id}`}
                aria-describedby={`${baseId}-${t.id}-hint`}
                onClick={() => flip(t.id)}
                className={`relative h-6 w-11 shrink-0 rounded-md border transition-colors ${
                  toggles[t.id] ? "border-brand-500 bg-brand-500" : "border-line bg-raised"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 size-4.5 rounded-sm transition-all ${
                    toggles[t.id] ? "left-5.5 bg-on-brand" : "left-0.5 bg-muted"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-400"
        >
          Save changes
        </button>
        <p role="status" className="text-sm text-muted">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}
