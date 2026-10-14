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
  CheckCircle2,
  CreditCard,
  Lock,
  Palette,
  Trash2,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type SectionId =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "team"
  | "billing";

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
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
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
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "design-lead", label: "Design lead" },
  { value: "engineer", label: "Software engineer" },
  { value: "product", label: "Product manager" },
  { value: "other", label: "Other" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Priya",
  lastName: "Raman",
  username: "priya.raman",
  email: "priya.raman@northwind.example",
  role: "design-lead",
  timezone: "Europe/London",
  language: "en",
  bio: "Design lead at Northwind. I care about calm interfaces, clear writing and accessible defaults.",
};

const BIO_MAX = 200;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 aria-[invalid=true]:border-red-600";

const buttonFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
  className?: string;
}

function Field({ label, htmlFor, hint, hintId, error, errorId, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-slate-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function initialsOf(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileState, string>>>({});
  const [status, setStatus] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const avatarUrlRef = useRef<string | null>(null);

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const dirty = (Object.keys(profile) as (keyof ProfileState)[]).some(
    (k) => profile[k] !== saved[k],
  );
  const dirtyOrAvatar = dirty;

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  // Dialog: focus management, Escape and focus trap.
  useEffect(() => {
    if (!confirmOpen) return;
    confirmInputRef.current?.focus();
    const trigger = deleteTriggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
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
  }, [confirmOpen]);

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setStatus("");
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or GIF).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Please choose a smaller one.");
      return;
    }
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarUrl(url);
    setAvatarError("");
    setStatus("");
  }

  function removeAvatar() {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = null;
    setAvatarUrl(null);
    setAvatarError("");
  }

  function validate(): Partial<Record<keyof ProfileState, string>> {
    const next: Partial<Record<keyof ProfileState, string>> = {};
    if (!profile.firstName.trim()) next.firstName = "Enter your first name.";
    if (!profile.lastName.trim()) next.lastName = "Enter your last name.";
    if (!/^[a-z0-9._-]{3,30}$/i.test(profile.username))
      next.username = "Use 3–30 letters, numbers, dots, dashes or underscores.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      next.email = "Enter a valid email address.";
    if (profile.bio.length > BIO_MAX) next.bio = `Keep your bio under ${BIO_MAX} characters.`;
    return next;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    const firstKey = (Object.keys(found) as (keyof ProfileState)[]).find((k) => found[k]);
    if (firstKey) {
      setStatus("");
      document.getElementById(id(firstKey))?.focus();
      return;
    }
    setSaved(profile);
    setStatus("Profile saved. Your changes are now live.");
  }

  function onReset() {
    setProfile(saved);
    setErrors({});
    setStatus("");
  }

  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const canDelete = confirmText.trim() === profile.username;

  if (deleted) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div role="status" className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Account scheduled for deletion</h1>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ve emailed a confirmation to {profile.email}. You have 14 days to change your mind
            before your data is permanently removed.
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleted(false);
              setConfirmText("");
            }}
            className={`mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 ${buttonFocus}`}
          >
            Cancel deletion
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your profile, security and workspace preferences.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        {/* Sidebar */}
        <nav aria-label="Settings sections" className="lg:w-64 lg:shrink-0">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <li key={s.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${buttonFocus} ${
                      isActive
                        ? "bg-indigo-50 text-indigo-800"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 space-y-8">
          {active !== "profile" ? (
            <section
              aria-labelledby={id("section-title")}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 id={id("section-title")} className="text-lg font-semibold">
                {activeSection.label}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{activeSection.description}</p>
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Nothing to configure here yet. Head back to{" "}
                <button
                  type="button"
                  onClick={() => setActive("profile")}
                  className={`rounded font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900 ${buttonFocus}`}
                >
                  Profile
                </button>{" "}
                to update your details.
              </div>
            </section>
          ) : (
            <>
              <section
                aria-labelledby={id("profile-title")}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 px-5 py-4 sm:px-8 sm:py-5">
                  <h2 id={id("profile-title")} className="text-lg font-semibold">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This information is visible to people in your workspace.
                  </p>
                </div>

                <form onSubmit={onSubmit} noValidate className="px-5 py-6 sm:px-8">
                  {/* Avatar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-semibold text-white"
                      role="img"
                      aria-label={avatarUrl ? "Your profile photo" : `Initials avatar for ${profile.firstName} ${profile.lastName}`}
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initialsOf(profile.firstName, profile.lastName)
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
                          className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 ${buttonFocus}`}
                        >
                          <Camera className="h-4 w-4" aria-hidden="true" />
                          {avatarUrl ? "Change photo" : "Upload photo"}
                        </button>
                        {avatarUrl ? (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${buttonFocus}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <p id={id("avatar-hint")} className="mt-2 text-xs text-slate-600">
                        PNG, JPG or GIF. Maximum size 2 MB.
                      </p>
                      {avatarError ? (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
                          {avatarError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <hr className="my-6 border-slate-200" />

                  <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                    <Field
                      label="First name"
                      htmlFor={id("firstName")}
                      error={errors.firstName}
                      errorId={id("firstName-err")}
                    >
                      <input
                        id={id("firstName")}
                        type="text"
                        autoComplete="given-name"
                        value={profile.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        aria-invalid={errors.firstName ? true : undefined}
                        aria-describedby={errors.firstName ? id("firstName-err") : undefined}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Last name"
                      htmlFor={id("lastName")}
                      error={errors.lastName}
                      errorId={id("lastName-err")}
                    >
                      <input
                        id={id("lastName")}
                        type="text"
                        autoComplete="family-name"
                        value={profile.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        aria-invalid={errors.lastName ? true : undefined}
                        aria-describedby={errors.lastName ? id("lastName-err") : undefined}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Username"
                      htmlFor={id("username")}
                      hint="Your profile lives at northwind.example/u/username."
                      hintId={id("username-hint")}
                      error={errors.username}
                      errorId={id("username-err")}
                    >
                      <input
                        id={id("username")}
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={profile.username}
                        onChange={(e) => update("username", e.target.value)}
                        aria-invalid={errors.username ? true : undefined}
                        aria-describedby={errors.username ? id("username-err") : id("username-hint")}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Email address"
                      htmlFor={id("email")}
                      error={errors.email}
                      errorId={id("email-err")}
                    >
                      <input
                        id={id("email")}
                        type="email"
                        autoComplete="email"
                        value={profile.email}
                        onChange={(e) => update("email", e.target.value)}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={errors.email ? id("email-err") : undefined}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Role" htmlFor={id("role")}>
                      <select
                        id={id("role")}
                        value={profile.role}
                        onChange={(e) => update("role", e.target.value)}
                        className={inputClass}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Language" htmlFor={id("language")}>
                      <select
                        id={id("language")}
                        value={profile.language}
                        onChange={(e) => update("language", e.target.value)}
                        className={inputClass}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Time zone" htmlFor={id("timezone")} className="sm:col-span-2">
                      <select
                        id={id("timezone")}
                        value={profile.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                        className={inputClass}
                      >
                        {TIMEZONES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Bio"
                      htmlFor={id("bio")}
                      className="sm:col-span-2"
                      error={errors.bio}
                      errorId={id("bio-err")}
                    >
                      <textarea
                        id={id("bio")}
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        aria-invalid={errors.bio ? true : undefined}
                        aria-describedby={`${id("bio-count")}${errors.bio ? ` ${id("bio-err")}` : ""}`}
                        className={`${inputClass} resize-y`}
                      />
                      <p
                        id={id("bio-count")}
                        className={`mt-1.5 text-right text-xs ${
                          profile.bio.length > BIO_MAX ? "font-medium text-red-700" : "text-slate-600"
                        }`}
                      >
                        {profile.bio.length}/{BIO_MAX}
                      </p>
                    </Field>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <p role="status" aria-live="polite" className="flex-1 text-sm text-emerald-700">
                      {status ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          {status}
                        </span>
                      ) : null}
                    </p>
                    <button
                      type="button"
                      onClick={onReset}
                      disabled={!dirtyOrAvatar}
                      className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${buttonFocus}`}
                    >
                      Discard changes
                    </button>
                    <button
                      type="submit"
                      disabled={!dirty && !avatarUrl}
                      className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${buttonFocus}`}
                    >
                      Save changes
                    </button>
                  </div>
                </form>
              </section>

              {/* Danger zone */}
              <section
                aria-labelledby={id("danger-title")}
                className="rounded-2xl border border-red-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-5 py-4 sm:px-8 rounded-t-2xl">
                  <AlertTriangle className="h-5 w-5 text-red-700" aria-hidden="true" />
                  <h2 id={id("danger-title")} className="text-lg font-semibold text-red-800">
                    Danger zone
                  </h2>
                </div>
                <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Delete this account</h3>
                    <p className="mt-1 max-w-prose text-sm text-slate-600">
                      Permanently remove your profile, projects and 3 shared workspaces. This action
                      can&apos;t be undone after the 14-day grace period.
                    </p>
                  </div>
                  <button
                    ref={deleteTriggerRef}
                    type="button"
                    onClick={() => {
                      setConfirmText("");
                      setConfirmOpen(true);
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete account
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id("dlg-title")}
            aria-describedby={id("dlg-desc")}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id={id("dlg-title")} className="text-base font-semibold text-slate-900">
                  Delete your account?
                </h2>
                <p id={id("dlg-desc")} className="mt-1 text-sm text-slate-600">
                  This will schedule your account for permanent deletion. To confirm, type your
                  username <strong className="font-semibold text-slate-900">{profile.username}</strong> below.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor={id("confirm")} className="mb-1.5 block text-sm font-medium text-slate-800">
                Confirm username
              </label>
              <input
                ref={confirmInputRef}
                id={id("confirm")}
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 ${buttonFocus}`}
              >
                Keep my account
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => {
                  setConfirmOpen(false);
                  setDeleted(true);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
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
