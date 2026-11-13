"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui";
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
    <div className="flex min-h-14 items-center justify-between gap-6">
      <div>
        <p id={`${id}-label`} className="font-semibold text-sand-900">{label}</p>
        <p id={`${id}-desc`} className="text-sm text-sand-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-sand-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-ui border border-sand-300 bg-white px-4 text-base text-sand-900 placeholder:text-sand-500";

export function SettingsForm() {
  const nameId = useId();
  const emailId = useId();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="grid max-w-3xl gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Card>
        <h2 className="text-xl font-bold">Profile</h2>
        <div className="mt-6 grid gap-6">
          <div>
            <label htmlFor={nameId} className="font-semibold text-sand-900">Full name</label>
            <input
              id={nameId}
              value={name}
              autoComplete="name"
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={emailId} className="font-semibold text-sand-900">Email</label>
            <input
              id={emailId}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <p className="text-sm text-sand-600">Your role in this workspace: {user.role}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="mt-4 grid gap-4">
          <Switch
            label="Weekly digest"
            description="A friendly summary of what moved across your projects."
            checked={digest}
            onChange={(v) => {
              setDigest(v);
              setSaved(false);
            }}
          />
          <Switch
            label="Mentions"
            description="Tell me when a teammate mentions me on an issue."
            checked={mentions}
            onChange={(v) => {
              setMentions(v);
              setSaved(false);
            }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="min-h-12 rounded-ui bg-brand-600 px-8 text-base font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
        >
          Save changes
        </button>
        <p role="status" aria-live="polite" className="font-semibold text-sand-700">
          {saved ? "Saved. Looking good!" : ""}
        </p>
      </div>
    </form>
  );
}
