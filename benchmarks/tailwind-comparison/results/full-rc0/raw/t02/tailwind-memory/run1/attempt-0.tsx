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
  Check,
  CreditCard,
  Palette,
  Shield,
  Trash2,
  Upload,
  User,
  Users,
  X,
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
  icon: ReactNode;
}

const SECTIONS: SectionDef[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your public information",
    icon: <User aria-hidden="true" className="size-4 shrink-0" />,
  },
  {
    id: "account",
    label: "Account & security",
    description: "Password and sign-in",
    icon: <Shield aria-hidden="true" className="size-4 shrink-0" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email and push alerts",
    icon: <Bell aria-hidden="true" className="size-4 shrink-0" />,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and density",
    icon: <Palette aria-hidden="true" className="size-4 shrink-0" />,
  },
  {
    id: "team",
    label: "Team",
    description: "Members and roles",
    icon: <Users aria-hidden="true" className="size-4 shrink-0" />,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plans and invoices",
    icon: <CreditCard aria-hidden="true" className="size-4 shrink-0" />,
  },
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
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "es-ES", label: "Español" },
  { value: "ja-JP", label: "日本語" },
];

const ROLES = [
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "manager", label: "Product manager" },
  { value: "marketing", label: "Marketing lead" },
  { value: "other", label: "Other" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okafor",
  email: "maya.okafor@northwind.example",
  username: "mayaokafor",
  role: "designer",
  timezone: "America/New_York",
  language: "en-US",
  bio: "Designing calm, accessible tools for logistics teams. Previously at Harbor Freight Labs.",
};

const BIO_LIMIT = 200;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-600/30";

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="mt-1.5 text-xs font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={id} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function getInitials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

export default function SettingsPage() {
  const uid = useId();
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
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const id = (name: string) => `${uid}-${name}`;
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  // Revoke object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Dialog: focus management, Escape, focus trap
  useEffect(() => {
    if (!confirmOpen) return;
    const trigger = deleteTriggerRef.current;
    confirmInputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setConfirmText("");
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [confirmOpen]);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setStatus("");
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
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
    setAvatarError("");
    setAvatarUrl(URL.createObjectURL(file));
    setStatus("");
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    setAvatarError("");
  };

  const validate = (): Partial<Record<keyof ProfileState, string>> => {
    const next: Partial<Record<keyof ProfileState, string>> = {};
    if (!profile.firstName.trim()) next.firstName = "Enter your first name.";
    if (!profile.lastName.trim()) next.lastName = "Enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      next.email = "Enter a valid email address.";
    if (!/^[a-z0-9_]{3,20}$/.test(profile.username))
      next.username = "Use 3–20 lowercase letters, numbers or underscores.";
    if (profile.bio.length > BIO_LIMIT)
      next.bio = `Bio must be ${BIO_LIMIT} characters or fewer.`;
    return next;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("");
      const firstKey = Object.keys(next)[0];
      document.getElementById(id(firstKey))?.focus();
      return;
    }
    setSaved(profile);
    setStatus("Profile changes saved.");
  };

  const onReset = () => {
    setProfile(saved);
    setErrors({});
    setStatus("");
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmText("");
  };

  const CONFIRM_PHRASE = profile.username;
  const canDelete = confirmText === CONFIRM_PHRASE;

  const describedBy = (name: keyof ProfileState, hasHint: boolean) => {
    if (errors[name]) return `${id(name)}-error`;
    return hasHint ? `${id(name)}-hint` : undefined;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              N
            </span>
            <span className="text-sm font-semibold">Northwind Workspace</span>
          </div>
          <span className="hidden text-sm text-slate-500 sm:inline">
            {profile.email}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your profile, security and workspace preferences.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Sidebar */}
          <nav aria-label="Settings sections" className="lg:w-64 lg:shrink-0">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {SECTIONS.map((s) => {
                const isActive = s.id === active;
                return (
                  <li key={s.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActive(s.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:whitespace-normal ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {s.icon}
                      <span className="flex flex-col">
                        <span>{s.label}</span>
                        <span className="hidden text-xs font-normal text-slate-500 lg:block">
                          {s.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-8">
            {active !== "profile" ? (
              <section
                aria-labelledby={id("placeholder-title")}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2
                  id={id("placeholder-title")}
                  className="text-lg font-semibold"
                >
                  {activeSection.label}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {activeSection.description}. These preferences aren&apos;t
                  configured yet — head back to Profile to edit your details.
                </p>
                <button
                  type="button"
                  onClick={() => setActive("profile")}
                  className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Go to Profile
                </button>
              </section>
            ) : (
              <>
                <form
                  onSubmit={onSubmit}
                  onReset={(e) => {
                    e.preventDefault();
                    onReset();
                  }}
                  noValidate
                  aria-labelledby={id("profile-title")}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 p-6 sm:px-8">
                    <h2
                      id={id("profile-title")}
                      className="text-lg font-semibold"
                    >
                      Profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      This information appears on your public profile and in
                      shared projects.
                    </p>
                  </div>

                  <div className="space-y-6 p-6 sm:px-8">
                    {/* Avatar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Your profile photo"
                          className="size-20 rounded-full object-cover ring-2 ring-white outline outline-slate-200"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={`Avatar with initials ${getInitials(profile.firstName, profile.lastName)}`}
                          className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-semibold text-white"
                        >
                          {getInitials(profile.firstName, profile.lastName)}
                        </div>
                      )}
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
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            <Upload aria-hidden="true" className="size-4" />
                            Upload photo
                          </button>
                          {avatarUrl ? (
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              <X aria-hidden="true" className="size-4" />
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <p
                          id={id("avatar-hint")}
                          className="mt-2 text-xs text-slate-500"
                        >
                          PNG, JPG or GIF. Maximum size 2 MB.
                        </p>
                        {avatarError ? (
                          <p
                            role="alert"
                            className="mt-1 text-xs font-medium text-red-700"
                          >
                            {avatarError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="First name"
                        htmlFor={id("firstName")}
                        error={errors.firstName}
                      >
                        <input
                          id={id("firstName")}
                          type="text"
                          autoComplete="given-name"
                          value={profile.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                          aria-invalid={errors.firstName ? true : undefined}
                          aria-describedby={describedBy("firstName", false)}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Last name"
                        htmlFor={id("lastName")}
                        error={errors.lastName}
                      >
                        <input
                          id={id("lastName")}
                          type="text"
                          autoComplete="family-name"
                          value={profile.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                          aria-invalid={errors.lastName ? true : undefined}
                          aria-describedby={describedBy("lastName", false)}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Email address"
                        htmlFor={id("email")}
                        error={errors.email}
                        className="sm:col-span-2"
                      >
                        <input
                          id={id("email")}
                          type="email"
                          autoComplete="email"
                          value={profile.email}
                          onChange={(e) => update("email", e.target.value)}
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={describedBy("email", false)}
                          className={inputClass}
                        />
                      </Field>
                      <Field
                        label="Username"
                        htmlFor={id("username")}
                        hint="Your profile lives at northwind.example/@username."
                        error={errors.username}
                        className="sm:col-span-2"
                      >
                        <input
                          id={id("username")}
                          type="text"
                          autoComplete="username"
                          value={profile.username}
                          onChange={(e) => update("username", e.target.value)}
                          aria-invalid={errors.username ? true : undefined}
                          aria-describedby={describedBy("username", true)}
                          className={inputClass}
                        />
                      </Field>
                      <SelectField
                        id={id("role")}
                        label="Role"
                        value={profile.role}
                        options={ROLES}
                        onChange={(v) => update("role", v)}
                      />
                      <SelectField
                        id={id("language")}
                        label="Language"
                        value={profile.language}
                        options={LANGUAGES}
                        onChange={(v) => update("language", v)}
                      />
                      <SelectField
                        id={id("timezone")}
                        label="Time zone"
                        value={profile.timezone}
                        options={TIMEZONES}
                        onChange={(v) => update("timezone", v)}
                        className="sm:col-span-2"
                      />
                      <Field
                        label="Bio"
                        htmlFor={id("bio")}
                        error={errors.bio}
                        className="sm:col-span-2"
                      >
                        <textarea
                          id={id("bio")}
                          rows={4}
                          value={profile.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          aria-invalid={errors.bio ? true : undefined}
                          aria-describedby={`${id("bio-count")}${errors.bio ? ` ${id("bio-error")}` : ""}`}
                          className={`${inputClass} resize-y`}
                        />
                        <p
                          id={id("bio-count")}
                          className={`mt-1.5 text-right text-xs ${
                            profile.bio.length > BIO_LIMIT
                              ? "font-medium text-red-700"
                              : "text-slate-500"
                          }`}
                        >
                          {profile.bio.length}/{BIO_LIMIT}
                        </p>
                      </Field>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <p
                      role="status"
                      aria-live="polite"
                      className="flex min-h-5 items-center gap-1.5 text-sm font-medium text-emerald-700"
                    >
                      {status ? (
                        <>
                          <Check aria-hidden="true" className="size-4" />
                          {status}
                        </>
                      ) : null}
                    </p>
                    <div className="flex gap-3 sm:justify-end">
                      <button
                        type="reset"
                        disabled={!dirty}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={!dirty}
                        className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        Save changes
                      </button>
                    </div>
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
                      <AlertTriangle aria-hidden="true" className="size-5" />
                      Danger zone
                    </h2>
                    <p className="mt-1 text-sm text-red-900/80">
                      These actions are permanent and can&apos;t be undone.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Delete this account
                      </h3>
                      <p className="mt-1 max-w-prose text-sm text-slate-600">
                        Permanently remove your profile, 14 projects and all
                        associated files from Northwind Workspace. Teammates
                        will lose access to anything you own.
                      </p>
                    </div>
                    <button
                      ref={deleteTriggerRef}
                      type="button"
                      onClick={() => setConfirmOpen(true)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Delete account
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id("dialog-title")}
            aria-describedby={id("dialog-desc")}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id={id("dialog-title")}
              className="text-lg font-semibold text-slate-900"
            >
              Delete your account?
            </h2>
            <p id={id("dialog-desc")} className="mt-2 text-sm text-slate-600">
              This will permanently delete your account and all of your data.
              To confirm, type{" "}
              <strong className="font-semibold text-slate-900">
                {CONFIRM_PHRASE}
              </strong>{" "}
              below.
            </p>
            <label htmlFor={id("confirm")} className="sr-only">
              Type {CONFIRM_PHRASE} to confirm
            </label>
            <input
              ref={confirmInputRef}
              id={id("confirm")}
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={`${inputClass} mt-4`}
              placeholder={CONFIRM_PHRASE}
            />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => {
                  setDeleted(true);
                  closeConfirm();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleted ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start gap-3 rounded-xl bg-slate-900 p-4 text-sm text-white shadow-lg"
        >
          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          <p className="flex-1">
            Account deletion requested. We&apos;ve emailed {profile.email} with
            a link to finish the process within 7 days.
          </p>
          <button
            type="button"
            onClick={() => setDeleted(false)}
            aria-label="Dismiss notification"
            className="rounded p-0.5 text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
