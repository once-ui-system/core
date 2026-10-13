"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  CreditCard,
  Lock,
  Palette,
  Trash2,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type SectionId = "profile" | "account" | "notifications" | "appearance" | "team" | "billing";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", description: "Your public information", icon: User },
  { id: "account", label: "Account & security", description: "Password and sign-in", icon: Lock },
  { id: "notifications", label: "Notifications", description: "Email and push alerts", icon: Bell },
  { id: "appearance", label: "Appearance", description: "Theme and density", icon: Palette },
  { id: "team", label: "Team", description: "Members and roles", icon: Users },
  { id: "billing", label: "Billing", description: "Plans and invoices", icon: CreditCard },
];

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "America/New_York", label: "Eastern Time (UTC−05:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Berlin", label: "Central European Time (UTC+01:00)" },
  { value: "Asia/Kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "design", label: "Product design" },
  { value: "eng", label: "Engineering" },
  { value: "pm", label: "Product management" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  jobTitle: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okonkwo",
  email: "maya.okonkwo@northwind.example",
  username: "mayaok",
  jobTitle: "Senior Product Designer",
  role: "design",
  timezone: "Europe/London",
  language: "en",
  bio: "Designing calm, legible tools for operations teams. Previously at a logistics startup in Lagos.",
};

const BIO_MAX = 200;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:cursor-not-allowed disabled:bg-slate-100";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
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

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={id} className={className}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          className={`${inputClass} appearance-none pr-9`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Field>
  );
}

function Placeholder({ section }: { section: SectionDef }) {
  const Icon = section.icon;
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{section.label}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
        {section.description}. This section isn&apos;t part of the preview — head back to Profile to
        edit your details.
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const dirty =
    avatarUrl !== null || (Object.keys(profile) as (keyof ProfileState)[]).some((k) => profile[k] !== saved[k]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  // Dialog: focus, Escape, focus trap
  useEffect(() => {
    if (!showDelete) return;
    const trigger = deleteTriggerRef.current;
    confirmInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDelete(false);
        setConfirmText("");
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [showDelete]);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setStatus("");
  };

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or GIF).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarUrl(url);
    setAvatarError(null);
    setStatus("");
  };

  const removeAvatar = () => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = null;
    setAvatarUrl(null);
    setAvatarError(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(profile);
    setStatus("Profile changes saved.");
  };

  const onReset = () => {
    setProfile(saved);
    removeAvatar();
    setStatus("");
  };

  const closeDelete = () => {
    setShowDelete(false);
    setConfirmText("");
  };

  const confirmDelete = () => {
    setDeleted(true);
    closeDelete();
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const canDelete = confirmText === profile.username;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-indigo-700">Northwind Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your profile, security and workspace preferences.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-10">
        {/* Sidebar */}
        <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <li key={s.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${focusRing} ${
                      isActive
                        ? "bg-indigo-50 text-indigo-800"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`size-4 shrink-0 ${isActive ? "text-indigo-700" : "text-slate-500"}`}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <main className="mt-4 min-w-0 space-y-8 lg:mt-0">
          {deleted ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Account deletion scheduled</p>
                <p className="mt-0.5">
                  Your account will be permanently removed in 14 days. Sign in again before then to
                  cancel.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleted(false)}
                  className={`mt-2 font-medium underline underline-offset-2 ${focusRing}`}
                >
                  Undo
                </button>
              </div>
            </div>
          ) : null}

          {active !== "profile" ? (
            <Placeholder section={activeSection} />
          ) : (
            <>
              <section
                aria-labelledby={id("profile-heading")}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <form onSubmit={onSubmit} onReset={onReset} noValidate={false}>
                  <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
                    <h2 id={id("profile-heading")} className="text-lg font-semibold">
                      Profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      This information appears on your public profile and in team mentions.
                    </p>
                  </div>

                  <div className="space-y-6 px-4 py-6 sm:px-6">
                    {/* Avatar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div
                        className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-800 ring-4 ring-white shadow"
                        role="img"
                        aria-label={
                          avatarUrl ? "Your new profile photo preview" : `Avatar with initials ${initials}`
                        }
                      >
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <span aria-hidden="true">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
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
                            className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 ${focusRing}`}
                          >
                            {avatarUrl ? (
                              <Camera className="size-4" aria-hidden="true" />
                            ) : (
                              <Upload className="size-4" aria-hidden="true" />
                            )}
                            {avatarUrl ? "Change photo" : "Upload photo"}
                          </button>
                          {avatarUrl ? (
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${focusRing}`}
                            >
                              <X className="size-4" aria-hidden="true" />
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <p id={id("avatar-hint")} className="mt-2 text-xs text-slate-500">
                          PNG, JPG or GIF. Max 2 MB. Square images work best.
                        </p>
                        {avatarError ? (
                          <p role="alert" className="mt-1 text-xs font-medium text-red-700">
                            {avatarError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="First name" htmlFor={id("first")}>
                        <input
                          id={id("first")}
                          type="text"
                          autoComplete="given-name"
                          required
                          value={profile.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Last name" htmlFor={id("last")}>
                        <input
                          id={id("last")}
                          type="text"
                          autoComplete="family-name"
                          required
                          value={profile.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Email address"
                        htmlFor={id("email")}
                        hint="We'll send a confirmation link if you change this."
                        className="sm:col-span-2"
                      >
                        <input
                          id={id("email")}
                          type="email"
                          autoComplete="email"
                          required
                          aria-describedby={`${id("email")}-hint`}
                          value={profile.email}
                          onChange={(e) => update("email", e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Username"
                        htmlFor={id("username")}
                        hint="Letters, numbers and underscores only."
                      >
                        <div className="flex rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/30">
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500"
                          >
                            @
                          </span>
                          <input
                            id={id("username")}
                            type="text"
                            autoComplete="username"
                            required
                            pattern="[A-Za-z0-9_]+"
                            aria-describedby={`${id("username")}-hint`}
                            value={profile.username}
                            onChange={(e) => update("username", e.target.value)}
                            className="block w-full min-w-0 rounded-r-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </Field>
                      <Field label="Job title" htmlFor={id("title")}>
                        <input
                          id={id("title")}
                          type="text"
                          autoComplete="organization-title"
                          value={profile.jobTitle}
                          onChange={(e) => update("jobTitle", e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <SelectField
                        label="Department"
                        id={id("role")}
                        value={profile.role}
                        onChange={(v) => update("role", v)}
                        options={ROLES}
                      />
                      <SelectField
                        label="Language"
                        id={id("language")}
                        value={profile.language}
                        onChange={(v) => update("language", v)}
                        options={LANGUAGES}
                      />
                      <SelectField
                        label="Time zone"
                        id={id("timezone")}
                        value={profile.timezone}
                        onChange={(v) => update("timezone", v)}
                        options={TIMEZONES}
                        className="sm:col-span-2"
                      />
                      <Field
                        label="Bio"
                        htmlFor={id("bio")}
                        className="sm:col-span-2"
                      >
                        <textarea
                          id={id("bio")}
                          rows={4}
                          maxLength={BIO_MAX}
                          aria-describedby={`${id("bio")}-count`}
                          value={profile.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          className={`${inputClass} resize-y`}
                        />
                        <p
                          id={`${id("bio")}-count`}
                          className="mt-1.5 text-right text-xs text-slate-500"
                        >
                          {profile.bio.length}/{BIO_MAX} characters
                        </p>
                      </Field>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse items-stretch gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p role="status" aria-live="polite" className="flex min-h-5 items-center gap-1.5 text-sm text-emerald-700">
                      {status ? (
                        <>
                          <Check className="size-4" aria-hidden="true" />
                          {status}
                        </>
                      ) : null}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="reset"
                        disabled={!dirty}
                        className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                      >
                        Discard changes
                      </button>
                      <button
                        type="submit"
                        disabled={!dirty}
                        className={`rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {/* Danger zone */}
              <section
                aria-labelledby={id("danger-heading")}
                className="rounded-2xl border border-red-200 bg-white shadow-sm"
              >
                <div className="border-b border-red-200 px-4 py-5 sm:px-6">
                  <h2
                    id={id("danger-heading")}
                    className="flex items-center gap-2 text-lg font-semibold text-red-700"
                  >
                    <AlertTriangle className="size-5" aria-hidden="true" />
                    Danger zone
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Irreversible actions. Please proceed with care.
                  </p>
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Export your data</h3>
                      <p className="mt-0.5 text-sm text-slate-600">
                        Download a copy of your projects, comments and activity as a ZIP archive.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 ${focusRing}`}
                    >
                      Request export
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Delete account</h3>
                      <p className="mt-0.5 text-sm text-slate-600">
                        Permanently remove your account, projects and personal data. This cannot be
                        undone.
                      </p>
                    </div>
                    <button
                      ref={deleteTriggerRef}
                      type="button"
                      onClick={() => setShowDelete(true)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete account
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Delete confirmation dialog */}
      {showDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={id("dlg-title")}
            aria-describedby={id("dlg-desc")}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id={id("dlg-title")} className="text-lg font-semibold text-slate-900">
                  Delete your account?
                </h2>
                <p id={id("dlg-desc")} className="mt-1 text-sm text-slate-600">
                  All of your projects and personal data will be permanently deleted after a 14-day
                  grace period.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor={id("confirm")} className="mb-1.5 block text-sm font-medium text-slate-800">
                Type <span className="font-mono font-semibold">{profile.username}</span> to confirm
              </label>
              <input
                ref={confirmInputRef}
                id={id("confirm")}
                type="text"
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDelete}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={confirmDelete}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
