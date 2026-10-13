Plain Tailwind v4, so I'll build everything with utility classes. lucide-react v1 may have renamed some icons, so I'll stick to long-standing ones (User, Bell, Shield, CreditCard, Palette, Camera, Trash2, Check, AlertTriangle, X).

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  CreditCard,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";

type SectionId = "profile" | "notifications" | "security" | "billing";

const SECTIONS: { id: SectionId; label: string; description: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", description: "Your public information", icon: User },
  { id: "notifications", label: "Notifications", description: "Email and push alerts", icon: Bell },
  { id: "security", label: "Security", description: "Password and sessions", icon: Shield },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
];

const TIMEZONES = [
  "America/Los_Angeles (UTC−08:00)",
  "America/New_York (UTC−05:00)",
  "Europe/London (UTC+00:00)",
  "Europe/Berlin (UTC+01:00)",
  "Asia/Kolkata (UTC+05:30)",
  "Asia/Tokyo (UTC+09:00)",
];

const LANGUAGES = ["English (US)", "English (UK)", "Deutsch", "Español", "Français", "日本語"];

const ROLES = ["Product designer", "Software engineer", "Product manager", "Founder", "Other"];

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-800";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function initials(first: string, last: string): string {
  return `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase() || "?";
}

function ComingSoon({ title }: { title: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        This section is not part of the demo. Switch back to Profile to see the full form.
      </p>
    </section>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>("profile");

  const [firstName, setFirstName] = useState("Amara");
  const [lastName, setLastName] = useState("Okafor");
  const [email, setEmail] = useState("amara.okafor@northwind.example");
  const [username, setUsername] = useState("amara.okafor");
  const [role, setRole] = useState(ROLES[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[1]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [bio, setBio] = useState(
    "Designing calm, accessible interfaces for logistics teams. Based in Brooklyn, coffee-powered."
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  // Revoke object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Auto-hide the saved notice.
  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 3500);
    return () => window.clearTimeout(t);
  }, [saved]);

  // Close dialog on Escape.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or GIF).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
    setSaved(false);
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    setAvatarError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  const canDelete = confirmText.trim() === username;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account details, preferences and workspace access.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:px-8 lg:py-10">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map(({ id: sid, label, description, icon: Icon }) => {
              const active = section === sid;
              return (
                <li key={sid} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setSection(sid)}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                      active
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span>{label}</span>
                      <span className="hidden text-xs font-normal text-slate-500 lg:block">
                        {description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 space-y-6">
          {section !== "profile" ? (
            <ComingSoon title={SECTIONS.find((s) => s.id === section)?.label ?? ""} />
          ) : (
            <>
              <form
                onSubmit={onSubmit}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
                aria-labelledby={id("profile-title")}
              >
                <div className="border-b border-slate-200 p-6 sm:px-8">
                  <h2 id={id("profile-title")} className="text-lg font-semibold">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This information appears on your public profile and in shared projects.
                  </p>
                </div>

                <div className="space-y-6 p-6 sm:px-8">
                  {/* Avatar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700 ring-4 ring-white shadow"
                      role="img"
                      aria-label={
                        avatarUrl ? "Your profile photo" : `Initials avatar for ${firstName} ${lastName}`
                      }
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span aria-hidden="true">{initials(firstName, lastName)}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={fileRef}
                          id={id("avatar")}
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          onChange={onAvatarChange}
                          className="sr-only"
                          aria-describedby={id("avatar-hint")}
                        />
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                        >
                          <Camera className="h-4 w-4" aria-hidden="true" />
                          Upload photo
                        </button>
                        {avatarUrl ? (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <p id={id("avatar-hint")} className="mt-2 text-xs text-slate-500">
                        PNG, JPG or GIF. Maximum size 2 MB.
                      </p>
                      {avatarError ? (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {avatarError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First name" htmlFor={id("first")}>
                      <input
                        id={id("first")}
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last name" htmlFor={id("last")}>
                      <input
                        id={id("last")}
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="Email address"
                        htmlFor={id("email")}
                        hint="We'll send receipts and security alerts here."
                      >
                        <input
                          id={id("email")}
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-describedby={`${id("email")}-hint`}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <Field
                      label="Username"
                      htmlFor={id("username")}
                      hint="Used in your profile URL."
                    >
                      <input
                        id={id("username")}
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        pattern="[a-zA-Z0-9._\-]+"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-describedby={`${id("username")}-hint`}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Role" htmlFor={id("role")}>
                      <select
                        id={id("role")}
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={inputClass}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Time zone" htmlFor={id("tz")}>
                      <select
                        id={id("tz")}
                        name="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={inputClass}
                      >
                        {TIMEZONES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Language" htmlFor={id("lang")}>
                      <select
                        id={id("lang")}
                        name="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={inputClass}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field
                        label="Bio"
                        htmlFor={id("bio")}
                        hint={`${bio.length}/200 characters`}
                      >
                        <textarea
                          id={id("bio")}
                          name="bio"
                          rows={4}
                          maxLength={200}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          aria-describedby={`${id("bio")}-hint`}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                  <p role="status" aria-live="polite" className="text-sm text-emerald-700 sm:mr-auto">
                    {saved ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Profile changes saved.
                      </span>
                    ) : null}
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                  >
                    Save changes
                  </button>
                </div>
              </form>

              {/* Danger zone */}
              <section
                aria-labelledby={id("danger-title")}
                className="rounded-xl border border-red-200 bg-white shadow-sm"
              >
                <div className="border-b border-red-200 bg-red-50 p-6 sm:px-8 rounded-t-xl">
                  <h2
                    id={id("danger-title")}
                    className="flex items-center gap-2 text-lg font-semibold text-red-800"
                  >
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    Danger zone
                  </h2>
                  <p className="mt-1 text-sm text-red-700">
                    These actions are permanent and cannot be undone.
                  </p>
                </div>
                <div className="p-6 sm:px-8">
                  {deleted ? (
                    <p role="status" className="text-sm font-medium text-slate-700">
                      Deletion requested. Your account will be removed within 24 hours. (Demo only —
                      nothing was deleted.)
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Delete account</h3>
                        <p className="mt-1 max-w-prose text-sm text-slate-600">
                          Permanently remove your profile, 14 projects and all associated data from
                          Northwind Studio.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmText("");
                          setConfirmOpen(true);
                        }}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete account
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={id("dlg-title")}
            aria-describedby={id("dlg-desc")}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id={id("dlg-title")} className="text-lg font-semibold text-slate-900">
              Delete your account?
            </h2>
            <p id={id("dlg-desc")} className="mt-2 text-sm text-slate-600">
              This will permanently delete your account and all of its data. To confirm, type your
              username <strong className="font-semibold text-slate-900">{username}</strong> below.
            </p>
            <div className="mt-4">
              <label htmlFor={id("confirm")} className={labelClass}>
                Username
              </label>
              <input
                id={id("confirm")}
                type="text"
                autoFocus
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => {
                  setConfirmOpen(false);
                  setDeleted(true);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```