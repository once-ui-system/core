"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Card, buttonPrimary, inputClasses } from "@/components/ui";
import { user, workspaceName } from "@/lib/data";

function Switch({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
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
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-ui border transition-colors ${
          checked ? "border-brand bg-brand" : "border-line-strong bg-raised"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-4.5 rounded-[2px] transition-all motion-reduce:transition-none ${
            checked ? "left-[1.375rem] bg-on-brand" : "left-0.5 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [workspace, setWorkspace] = useState(workspaceName);
  const [digest, setDigest] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function touch<T>(setter: (value: T) => void) {
    return (value: T) => {
      setSaved(false);
      setter(value);
    };
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-4 text-lg font-semibold">
          Profile
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => touch(setName)(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input id="email" name="email" type="email" value={user.email} readOnly aria-describedby="email-help" className={inputClasses} />
            <p id="email-help" className="mt-1.5 text-xs text-muted">
              Contact an owner to change the sign-in email.
            </p>
          </div>
          <div>
            <label htmlFor="workspace" className="mb-1.5 block text-sm font-medium">
              Workspace name
            </label>
            <input
              id="workspace"
              name="workspace"
              value={workspace}
              onChange={(e) => touch(setWorkspace)(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
              Role
            </label>
            <input id="role" name="role" value={user.role} readOnly className={inputClasses} />
          </div>
        </div>
      </Card>

      <Card aria-labelledby="notify-heading">
        <h2 id="notify-heading" className="text-lg font-semibold">
          Notifications
        </h2>
        <div className="mt-2 divide-y divide-line">
          <Switch
            id="digest"
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            checked={digest}
            onChange={touch(setDigest)}
          />
          <Switch
            id="assigned"
            label="Issue assigned to me"
            description="Email me when someone assigns an issue to me."
            checked={assigned}
            onChange={touch(setAssigned)}
          />
          <Switch
            id="releases"
            label="Product updates"
            description="Occasional notes about new Lumen features."
            checked={releases}
            onChange={touch(setReleases)}
          />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button type="submit" className={buttonPrimary}>
          Save changes
        </button>
        <p role="status" className="flex items-center gap-1.5 text-sm text-muted">
          {saved ? (
            <>
              <Check aria-hidden="true" className="size-4 text-emerald-300" />
              Settings saved
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
