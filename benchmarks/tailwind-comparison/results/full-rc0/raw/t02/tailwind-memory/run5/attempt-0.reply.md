The layout is minimal and the global CSS only imports Tailwind. I'll write the page now.

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

type SectionId = "profile" | "account" | "notifications" | "team" | "billing";

interface NavItem {
  id: SectionId;
  label: string;
  description: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "Profile", description: "Your public details", icon: <User className="size-4" aria-hidden="true" /> },
  { id: "account", label: "Account & security", description: "Password and sign-in", icon: <Lock className="size-4" aria-hidden="true" /> },
  { id: "notifications", label: "Notifications", description: "Email and push alerts", icon: <Bell className="size-4" aria-hidden="true" /> },
  { id: "team", label: "Team", description: "Members and roles", icon: <Users className="size-4" aria-hidden="true" /> },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: <CreditCard className="size-4" aria-hidden="true" /> },
];

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Berlin", label: "(GMT+01:00) Berlin" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) Mumbai" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "manager", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 200;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:bg-slate-100 aria-[invalid=true]:border-rose-500";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface SelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function Select({ id, value, onChange, options }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={`${inputClass} pr-8`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [section, setSection] = useState<SectionId>("profile");

  const [firstName, setFirstName] = useState("Maya");
  const [lastName, setLastName] = useState("Okafor");
  const [email, setEmail] = useState("maya.okafor@northwind.studio");
  const [username, setUsername] = useState("mayaokafor");
  const [role, setRole] = useState("designer");
  const [timezone, setTimezone] = useState("Europe/London");
  const [language, setLanguage] = useState("en");
  const [bio, setBio] = useState(
    "Designing calm, useful tools for small teams. Previously at Northwind Studio and Lumen Labs."
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Revoke object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Auto-hide the saved message.
  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 3500);
    return () => window.clearTimeout(t);
  }, [saved]);

  // Dialog: focus management, Escape, focus trap.
  useEffect(() => {
    if (!confirmOpen) return;
    confirmInputRef.current?.focus();
    const opener = openerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setConfirmText("");
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [confirmOpen]);

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Please choose a PNG, JPG, GIF or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller file.");
      return;
    }
    setAvatarError("");
    setAvatarUrl(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    setAvatarError("");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!/^[a-z0-9_]{3,20}$/.test(username))
      next.username = "Use 3–20 lowercase letters, numbers or underscores.";
    if (bio.length > BIO_LIMIT) next.bio = `Bio must be ${BIO_LIMIT} characters or fewer.`;
    return next;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0];
      document.getElementById(id(firstKey))?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  const describedBy = (name: string, hasHint: boolean) => {
    if (errors[name]) return `${id(name)}-error`;
    return hasHint ? `${id(name)}-hint` : undefined;
  };

  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";
  const activeItem = NAV_ITEMS.find((n) => n.id === section) ?? NAV_ITEMS[0];
  const canDelete = confirmText === "delete my account";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile, security and workspace preferences.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        <nav aria-label="Settings sections" className="lg:w-64 lg:shrink-0">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {NAV_ITEMS.map((item) => {
              const active = item.id === section;
              return (
                <li key={item.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setSection(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors lg:whitespace-normal ${focusRing} ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1" aria-labelledby={id("heading")}>
          {section !== "profile" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 id={id("heading")} className="text-lg font-semibold">
                {activeItem.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{activeItem.description}</p>
              <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                Nothing to configure here yet. Head back to{" "}
                <button
                  type="button"
                  onClick={() => setSection("profile")}
                  className={`rounded font-medium text-indigo-700 underline underline-offset-2 ${focusRing}`}
                >
                  Profile
                </button>{" "}
                to update your details.
              </p>
            </section>
          ) : (
            <div className="space-y-6">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-200 p-5 sm:p-6">
                  <h2 id={id("heading")} className="text-lg font-semibold">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This information appears on your public profile and in comments.
                  </p>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  {/* Avatar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700 ring-4 ring-white shadow"
                      role="img"
                      aria-label={avatarUrl ? "Your profile photo" : `Avatar with initials ${initials}`}
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <span aria-hidden="true">{initials}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={fileRef}
                          id={id("avatar")}
                          type="file"
                          accept={ACCEPTED_TYPES.join(",")}
                          onChange={handleAvatar}
                          className="sr-only"
                          aria-describedby={`${id("avatar")}-hint`}
                          tabIndex={-1}
                        />
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 ${focusRing}`}
                        >
                          <Camera className="size-4" aria-hidden="true" />
                          {avatarUrl ? "Change photo" : "Upload photo"}
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}
                          >
                            <X className="size-4" aria-hidden="true" />
                            Remove
                          </button>
                        )}
                      </div>
                      <p id={`${id("avatar")}-hint`} className="mt-2 text-sm text-slate-500">
                        PNG, JPG, GIF or WebP. Max size 2 MB.
                      </p>
                      <p role="alert" className="mt-1 text-sm text-rose-600">
                        {avatarError}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First name" htmlFor={id("firstName")} error={errors.firstName}>
                      <input
                        id={id("firstName")}
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        aria-invalid={errors.firstName ? true : undefined}
                        aria-describedby={describedBy("firstName", false)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last name" htmlFor={id("lastName")} error={errors.lastName}>
                      <input
                        id={id("lastName")}
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        aria-invalid={errors.lastName ? true : undefined}
                        aria-describedby={describedBy("lastName", false)}
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Email address"
                      htmlFor={id("email")}
                      error={errors.email}
                      hint="We'll send receipts and security alerts here."
                    >
                      <input
                        id={id("email")}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={describedBy("email", true)}
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Username"
                      htmlFor={id("username")}
                      error={errors.username}
                      hint="Your profile lives at northwind.studio/u/username."
                    >
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                          @
                        </span>
                        <input
                          id={id("username")}
                          type="text"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          aria-invalid={errors.username ? true : undefined}
                          aria-describedby={describedBy("username", true)}
                          className={`${inputClass} rounded-l-none`}
                        />
                      </div>
                    </Field>
                    <Field label="Job title" htmlFor={id("role")}>
                      <Select id={id("role")} value={role} onChange={setRole} options={ROLES} />
                    </Field>
                    <Field label="Language" htmlFor={id("language")}>
                      <Select
                        id={id("language")}
                        value={language}
                        onChange={setLanguage}
                        options={LANGUAGES}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Time zone" htmlFor={id("timezone")}>
                        <Select
                          id={id("timezone")}
                          value={timezone}
                          onChange={setTimezone}
                          options={TIMEZONES}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Bio"
                        htmlFor={id("bio")}
                        error={errors.bio}
                        hint={`${bio.length}/${BIO_LIMIT} characters`}
                      >
                        <textarea
                          id={id("bio")}
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          aria-invalid={errors.bio ? true : undefined}
                          aria-describedby={describedBy("bio", true)}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                  <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-700 sm:mr-auto">
                    {saved && (
                      <>
                        <Check className="size-4" aria-hidden="true" />
                        Profile saved
                      </>
                    )}
                  </p>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
                  >
                    {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>

              {/* Danger zone */}
              <section
                aria-labelledby={id("danger")}
                className="rounded-xl border border-rose-200 bg-white"
              >
                <div className="flex items-start gap-3 border-b border-rose-100 p-5 sm:p-6">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
                  <div>
                    <h2 id={id("danger")} className="text-lg font-semibold text-rose-700">
                      Danger zone
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Irreversible actions. Please proceed with care.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Delete this account</h3>
                    <p className="mt-1 max-w-prose text-sm text-slate-500">
                      Permanently remove your profile, 14 projects and all associated files. This
                      cannot be undone.
                    </p>
                  </div>
                  <button
                    ref={openerRef}
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={deleted}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete account
                  </button>
                </div>
                <p role="status" className="px-5 pb-5 text-sm text-rose-700 sm:px-6 empty:hidden">
                  {deleted ? "Your account has been scheduled for deletion." : ""}
                </p>
              </section>
            </div>
          )}
        </main>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={id("dlg-title")}
            aria-describedby={id("dlg-desc")}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id={id("dlg-title")} className="text-base font-semibold">
                  Delete your account?
                </h2>
                <p id={id("dlg-desc")} className="mt-1 text-sm text-slate-500">
                  This will permanently delete all your data. To confirm, type{" "}
                  <span className="font-medium text-slate-800">delete my account</span> below.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor={id("confirm")} className="sr-only">
                Type "delete my account" to confirm
              </label>
              <input
                ref={confirmInputRef}
                id={id("confirm")}
                type="text"
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete my account"
                className={inputClass}
              />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => {
                  setDeleted(true);
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```