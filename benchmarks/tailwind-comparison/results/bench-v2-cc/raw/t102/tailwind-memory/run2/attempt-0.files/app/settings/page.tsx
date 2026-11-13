"use client";

import { useState } from "react";
import { user } from "@/lib/data";

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
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p id={`${id}-label`} className="font-semibold text-sand-900">{label}</p>
        <p id={`${id}-desc`} className="text-sm text-sand-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-sand-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-7 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "mt-2 block min-h-14 w-full rounded-ui border border-sand-300 bg-white px-4 text-base text-sand-900 placeholder:text-sand-500";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">Settings</h1>
        <p className="mt-3 text-lg text-sand-700">
          Make Lumen feel like home for you and your team.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="flex max-w-3xl flex-col gap-8"
      >
        <section
          aria-labelledby="profile-heading"
          className="rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 id="profile-heading" className="font-heading text-xl font-bold text-sand-900">
            Profile
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="font-semibold text-sand-900">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="font-semibold text-sand-900">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className="font-semibold text-sand-900">Role</label>
              <input
                id="role"
                name="role"
                type="text"
                value={user.role}
                readOnly
                className={`${inputClass} bg-sand-100 text-sand-700`}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="notify-heading"
          className="rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 id="notify-heading" className="font-heading text-xl font-bold text-sand-900">
            Notifications
          </h2>
          <div className="mt-2 divide-y divide-sand-200">
            <Switch
              id="digest"
              label="Weekly digest"
              description="A Monday summary of what your team shipped."
              checked={digest}
              onChange={(v) => {
                setDigest(v);
                setSaved(false);
              }}
            />
            <Switch
              id="mentions"
              label="Mentions"
              description="Get an email when someone mentions you on an issue."
              checked={mentions}
              onChange={(v) => {
                setMentions(v);
                setSaved(false);
              }}
            />
            <Switch
              id="releases"
              label="Product news"
              description="Hear about new Lumen features as they land."
              checked={releases}
              onChange={(v) => {
                setReleases(v);
                setSaved(false);
              }}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="inline-flex min-h-14 items-center rounded-ui bg-brand-600 px-8 text-base font-semibold text-white hover:bg-brand-700"
          >
            Save changes
          </button>
          <p role="status" aria-live="polite" className="text-sand-700">
            {saved ? "All saved. Nice work!" : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
