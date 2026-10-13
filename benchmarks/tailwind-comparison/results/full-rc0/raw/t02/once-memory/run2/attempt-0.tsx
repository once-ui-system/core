"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { Avatar, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

type SectionId = "profile" | "account" | "notifications" | "security" | "danger";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", description: "Your public identity and contact details" },
  { id: "account", label: "Preferences", description: "Language, region and time zone" },
  { id: "notifications", label: "Notifications", description: "Choose what reaches your inbox" },
  { id: "security", label: "Security", description: "Password and sign-in protection" },
  { id: "danger", label: "Danger zone", description: "Irreversible account actions" },
];

const ROLES = ["Product designer", "Frontend engineer", "Engineering manager", "Product manager", "Founder"];
const LANGUAGES = ["English (US)", "English (UK)", "Deutsch", "Español", "Français", "Português"];
const TIMEZONES = [
  "Pacific Time (UTC−08:00)",
  "Mountain Time (UTC−07:00)",
  "Central Time (UTC−06:00)",
  "Eastern Time (UTC−05:00)",
  "London (UTC+00:00)",
  "Central European Time (UTC+01:00)",
  "India Standard Time (UTC+05:30)",
];

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  website: string;
  bio: string;
  language: string;
  timezone: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Lindqvist",
  username: "maya.lindqvist",
  email: "maya@northwind.studio",
  role: "Product designer",
  website: "https://northwind.studio",
  bio: "Designing calm interfaces for complex tools. Currently building the design system at Northwind Studio.",
  language: "English (US)",
  timezone: "Central European Time (UTC+01:00)",
};

const BIO_LIMIT = 200;

const css = `
.sp-shell { display: grid; grid-template-columns: 1fr; gap: 24px; width: 100%; max-width: 1080px; margin: 0 auto; padding: 24px 16px 64px; box-sizing: border-box; }
@media (min-width: 880px) { .sp-shell { grid-template-columns: 260px minmax(0, 1fr); gap: 40px; padding: 48px 24px 96px; } }
.sp-nav { display: flex; flex-direction: row; gap: 4px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
@media (min-width: 880px) { .sp-nav { flex-direction: column; overflow: visible; position: sticky; top: 24px; align-self: start; } }
.sp-nav-link { display: flex; flex-direction: column; gap: 2px; padding: 10px 14px; border-radius: 10px; text-decoration: none; color: var(--neutral-on-background-medium); white-space: nowrap; border: 1px solid transparent; flex-shrink: 0; font-family: inherit; background: transparent; cursor: pointer; text-align: left; }
.sp-nav-link:hover { background: var(--neutral-alpha-weak); color: var(--neutral-on-background-strong); }
.sp-nav-link:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.sp-nav-link[aria-current="true"] { background: var(--neutral-alpha-weak); border-color: var(--neutral-alpha-medium); color: var(--neutral-on-background-strong); }
.sp-nav-link.sp-danger { color: var(--danger-on-background-strong); }
.sp-nav-desc { display: none; font-size: 12px; font-weight: 400; color: var(--neutral-on-background-weak); white-space: normal; }
@media (min-width: 880px) { .sp-nav-desc { display: block; } }
.sp-card { border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); border-radius: 16px; padding: 20px; box-sizing: border-box; scroll-margin-top: 24px; }
@media (min-width: 600px) { .sp-card { padding: 28px; } }
.sp-card.sp-danger-card { border-color: var(--danger-alpha-medium); }
.sp-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 600px) { .sp-grid.sp-two { grid-template-columns: 1fr 1fr; } }
.sp-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.sp-label { font-size: 14px; font-weight: 500; color: var(--neutral-on-background-strong); }
.sp-hint { font-size: 12px; color: var(--neutral-on-background-weak); }
.sp-input, .sp-select, .sp-textarea { width: 100%; box-sizing: border-box; min-height: 44px; padding: 10px 12px; font: inherit; font-size: 15px; color: var(--neutral-on-background-strong); background: var(--page-background); border: 1px solid var(--neutral-alpha-medium); border-radius: 10px; transition: border-color .15s, box-shadow .15s; }
.sp-textarea { resize: vertical; min-height: 110px; line-height: 1.5; }
.sp-input:hover, .sp-select:hover, .sp-textarea:hover { border-color: var(--neutral-alpha-strong); }
.sp-input:focus-visible, .sp-select:focus-visible, .sp-textarea:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 1px; border-color: transparent; }
.sp-input[aria-invalid="true"] { border-color: var(--danger-solid-strong); }
.sp-error { font-size: 12px; color: var(--danger-on-background-strong); }
.sp-switch-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-top: 1px solid var(--neutral-alpha-weak); }
.sp-switch-row:first-of-type { border-top: none; }
.sp-switch { appearance: none; -webkit-appearance: none; flex-shrink: 0; width: 44px; height: 26px; border-radius: 999px; background: var(--neutral-alpha-strong); position: relative; cursor: pointer; border: none; transition: background .15s; margin: 0; }
.sp-switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.sp-switch:checked { background: var(--brand-solid-strong); }
.sp-switch:checked::after { transform: translateX(18px); }
.sp-switch:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 3px; }
.sp-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.sp-danger-row { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; border-top: 1px solid var(--neutral-alpha-weak); }
.sp-danger-row:first-of-type { border-top: none; padding-top: 0; }
@media (min-width: 600px) { .sp-danger-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 24px; } }
.sp-btn-danger { min-height: 40px; padding: 0 16px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid var(--danger-solid-strong); background: transparent; color: var(--danger-on-background-strong); white-space: nowrap; }
.sp-btn-danger:hover { background: var(--danger-alpha-weak); }
.sp-btn-danger:focus-visible { outline: 2px solid var(--danger-solid-strong); outline-offset: 2px; }
.sp-btn-danger.sp-solid { background: var(--danger-solid-strong); color: #fff; }
.sp-btn-danger.sp-solid:hover { opacity: .9; background: var(--danger-solid-strong); }
.sp-btn-danger:disabled { opacity: .45; cursor: not-allowed; }
.sp-btn-plain { min-height: 40px; padding: 0 16px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid var(--neutral-alpha-medium); background: transparent; color: var(--neutral-on-background-strong); }
.sp-btn-plain:hover { background: var(--neutral-alpha-weak); }
.sp-btn-plain:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.sp-status { font-size: 14px; color: var(--success-on-background-strong); }
.sp-visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.sp-dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 1000; }
.sp-dialog { width: 100%; max-width: 440px; background: var(--page-background); border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
.sp-avatar-row { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
@media (min-width: 600px) { .sp-avatar-row { flex-direction: row; align-items: center; gap: 24px; } }
.sp-avatar-img { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 1px solid var(--neutral-alpha-medium); flex-shrink: 0; }
@media (prefers-reduced-motion: reduce) { .sp-switch, .sp-switch::after, .sp-input, .sp-select, .sp-textarea { transition: none; } }
`;

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  if (value.trim() === "") return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="sp-field">
      <label className="sp-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="sp-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="sp-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function ToggleRow({ id, title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="sp-switch-row">
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <label htmlFor={id} className="sp-label">
          {title}
        </label>
        <span className="sp-hint" id={`${id}-desc`}>
          {description}
        </span>
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="sp-switch"
        checked={checked}
        aria-describedby={`${id}-desc`}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      />
    </div>
  );
}

export default function SettingsPage() {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [active, setActive] = useState<SectionId>("profile");
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileState | "avatar", string>>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [notif, setNotif] = useState({
    product: true,
    comments: true,
    digest: false,
    marketing: false,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [dialog, setDialog] = useState<null | "deactivate" | "delete">(null);
  const [confirmText, setConfirmText] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    profile: null,
    account: null,
    notifications: null,
    security: null,
    danger: null,
  });

    // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  // Track active section while scrolling
  useEffect(() => {
    const entries = Object.entries(sectionRefs.current) as [SectionId, HTMLElement | null][];
    const observer = new IntersectionObserver(
      (items) => {
        const visible = items
          .filter((i) => i.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-section") as SectionId | null;
          if (id) setActive(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    entries.forEach(([, el]) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Dialog: focus management, Escape, focus trap
  useEffect(() => {
    if (!dialog) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusables = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDialog(null);
        setConfirmText("");
      } else if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
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
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocusRef.current?.focus();
    };
  }, [dialog]);

  const goTo = (id: SectionId) => {
    setActive(id);
    const el = sectionRefs.current[id];
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }
  };

  const setField = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved("");
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, avatar: "Please choose an image file (PNG, JPG or WebP)." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((er) => ({ ...er, avatar: "That image is larger than 2 MB. Try a smaller one." }));
      e.target.value = "";
      return;
    }
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarUrl(url);
    setErrors((er) => ({ ...er, avatar: undefined }));
    setStatusMsg(`Photo ${file.name} selected. Save changes to apply it.`);
    setSaved("");
  };

  const removeAvatar = () => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = null;
    setAvatarUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatusMsg("Profile photo removed.");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Partial<Record<keyof ProfileState, string>> = {};
    if (!profile.firstName.trim()) next.firstName = "First name is required.";
    if (!profile.lastName.trim()) next.lastName = "Last name is required.";
    if (!/^[a-z0-9._-]{3,30}$/i.test(profile.username)) {
      next.username = "Use 3–30 letters, numbers, dots, dashes or underscores.";
    }
    if (!isValidEmail(profile.email)) next.email = "Enter a valid email address.";
    if (!isValidUrl(profile.website)) next.website = "Enter a full URL starting with https://";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0];
      document.getElementById(fid(firstKey))?.focus();
      setSaved("");
      return;
    }
    setSaved("Changes saved just now.");
  };

  const onReset = () => {
    setProfile(INITIAL_PROFILE);
    setErrors({});
    setSaved("");
    removeAvatar();
  };

  const closeDialog = () => {
    setDialog(null);
    setConfirmText("");
  };

  const confirmDialog = () => {
    const kind = dialog;
    closeDialog();
    setStatusMsg(
      kind === "delete"
        ? "Account deletion requested. You will receive a confirmation email."
        : "Your account has been deactivated.",
    );
  };

  const confirmWord = dialog === "delete" ? "DELETE" : "DEACTIVATE";
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  const bioLeft = BIO_LIMIT - profile.bio.length;

  const describedBy = (name: keyof ProfileState, hasHint: boolean): string | undefined => {
    if (errors[name]) return `${fid(name)}-error`;
    return hasHint ? `${fid(name)}-hint` : undefined;
  };

  const sectionProps = (id: SectionId, headingId: string): {
    ref: (el: HTMLElement | null) => void;
    "data-section": SectionId;
    "aria-labelledby": string;
    tabIndex: number;
    style: CSSProperties;
  } => ({
    ref: (el) => {
      sectionRefs.current[id] = el;
    },
    "data-section": id,
    "aria-labelledby": headingId,
    tabIndex: -1,
    style: { outline: "none" },
  });

  return (
    <>
      <style>{css}</style>
      <div className="sp-shell">
        <aside aria-label="Settings navigation">
          <nav className="sp-nav" aria-label="Settings sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sp-nav-link${s.id === "danger" ? " sp-danger" : ""}`}
                aria-current={active === s.id ? "true" : undefined}
                onClick={() => goTo(s.id)}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                <span className="sp-nav-desc">{s.description}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <Column gap="4" paddingBottom="8">
            <Heading as="h1" variant="heading-strong-xl">
              Settings
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Manage your profile, preferences and account security.
            </Text>
          </Column>

          <div role="status" aria-live="polite" className="sp-visually-hidden">
            {statusMsg}
          </div>

          {/* Profile */}
          <section className="sp-card" {...sectionProps("profile", fid("h-profile"))}>
            <form onSubmit={onSubmit} noValidate aria-labelledby={fid("h-profile")}>
              <Column gap="24">
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-l" id={fid("h-profile")}>
                    Profile
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    This information is shown on your public page and in comments.
                  </Text>
                </Column>

                <div className="sp-avatar-row">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="sp-avatar-img" src={avatarUrl} alt="Your new profile photo preview" />
                  ) : (
                    <Avatar size="xl" value={initials || "?"} />
                  )}
                  <Column gap="8">
                    <Row gap="8" wrap>
                      <input
                        ref={fileRef}
                        id={fid("avatar")}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sp-visually-hidden"
                        onChange={onAvatarChange}
                        aria-describedby={`${fid("avatar")}-hint`}
                      />
                      <button
                        type="button"
                        className="sp-btn-plain"
                        onClick={() => fileRef.current?.click()}
                      >
                        {avatarUrl ? "Change photo" : "Upload photo"}
                      </button>
                      {avatarUrl ? (
                        <button type="button" className="sp-btn-plain" onClick={removeAvatar}>
                          Remove
                        </button>
                      ) : null}
                    </Row>
                    {errors.avatar ? (
                      <span className="sp-error" role="alert" id={`${fid("avatar")}-hint`}>
                        {errors.avatar}
                      </span>
                    ) : (
                      <span className="sp-hint" id={`${fid("avatar")}-hint`}>
                        PNG, JPG or WebP. Max 2 MB. Square images work best.
                      </span>
                    )}
                  </Column>
                </div>

                <div className="sp-grid sp-two">
                  <Field id={fid("firstName")} label="First name" error={errors.firstName}>
                    <input
                      id={fid("firstName")}
                      className="sp-input"
                      value={profile.firstName}
                      autoComplete="given-name"
                      aria-invalid={errors.firstName ? true : undefined}
                      aria-describedby={describedBy("firstName", false)}
                      aria-required="true"
                      onChange={(e) => setField("firstName", e.target.value)}
                    />
                  </Field>
                  <Field id={fid("lastName")} label="Last name" error={errors.lastName}>
                    <input
                      id={fid("lastName")}
                      className="sp-input"
                      value={profile.lastName}
                      autoComplete="family-name"
                      aria-invalid={errors.lastName ? true : undefined}
                      aria-describedby={describedBy("lastName", false)}
                      aria-required="true"
                      onChange={(e) => setField("lastName", e.target.value)}
                    />
                  </Field>
                  <Field
                    id={fid("username")}
                    label="Username"
                    hint="Your profile lives at northwind.studio/@username"
                    error={errors.username}
                  >
                    <input
                      id={fid("username")}
                      className="sp-input"
                      value={profile.username}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={errors.username ? true : undefined}
                      aria-describedby={describedBy("username", true)}
                      onChange={(e) => setField("username", e.target.value)}
                    />
                  </Field>
                  <Field id={fid("email")} label="Email address" error={errors.email}>
                    <input
                      id={fid("email")}
                      className="sp-input"
                      type="email"
                      value={profile.email}
                      autoComplete="email"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={describedBy("email", false)}
                      aria-required="true"
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </Field>
                  <Field id={fid("role")} label="Role">
                    <select
                      id={fid("role")}
                      className="sp-select"
                      value={profile.role}
                      onChange={(e) => setField("role", e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id={fid("website")} label="Website" error={errors.website}>
                    <input
                      id={fid("website")}
                      className="sp-input"
                      type="url"
                      inputMode="url"
                      value={profile.website}
                      autoComplete="url"
                      aria-invalid={errors.website ? true : undefined}
                      aria-describedby={describedBy("website", false)}
                      onChange={(e) => setField("website", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sp-field">
                  <label className="sp-label" htmlFor={fid("bio")}>
                    Bio
                  </label>
                  <textarea
                    id={fid("bio")}
                    className="sp-textarea"
                    value={profile.bio}
                    maxLength={BIO_LIMIT}
                    aria-describedby={`${fid("bio")}-hint`}
                    onChange={(e) => setField("bio", e.target.value)}
                  />
                  <span className="sp-hint" id={`${fid("bio")}-hint`}>
                    {bioLeft} characters remaining
                  </span>
                </div>

                <div className="sp-actions">
                  <Button type="submit" variant="primary" size="m">
                    Save changes
                  </Button>
                  <button type="button" className="sp-btn-plain" onClick={onReset}>
                    Discard
                  </button>
                  {saved ? (
                    <span className="sp-status" role="status">
                      {saved}
                    </span>
                  ) : null}
                </div>
              </Column>
            </form>
          </section>

          {/* Preferences */}
          <section className="sp-card" {...sectionProps("account", fid("h-account"))}>
            <Column gap="24">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l" id={fid("h-account")}>
                  Preferences
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Dates, times and the interface language follow these choices.
                </Text>
              </Column>
              <div className="sp-grid sp-two">
                <Field id={fid("language")} label="Language">
                  <select
                    id={fid("language")}
                    className="sp-select"
                    value={profile.language}
                    onChange={(e) => setField("language", e.target.value)}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id={fid("timezone")} label="Time zone">
                  <select
                    id={fid("timezone")}
                    className="sp-select"
                    value={profile.timezone}
                    onChange={(e) => setField("timezone", e.target.value)}
                  >
                    {TIMEZONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Column>
          </section>

          {/* Notifications */}
          <section className="sp-card" {...sectionProps("notifications", fid("h-notif"))}>
            <Column gap="16">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l" id={fid("h-notif")}>
                  Notifications
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Pick the emails you want to receive at {profile.email}.
                </Text>
              </Column>
              <div>
                <ToggleRow
                  id={fid("n-product")}
                  title="Product updates"
                  description="New features and improvements, about twice a month."
                  checked={notif.product}
                  onChange={(v) => setNotif((n) => ({ ...n, product: v }))}
                />
                <ToggleRow
                  id={fid("n-comments")}
                  title="Comments and mentions"
                  description="When someone replies to you or mentions @maya.lindqvist."
                  checked={notif.comments}
                  onChange={(v) => setNotif((n) => ({ ...n, comments: v }))}
                />
                <ToggleRow
                  id={fid("n-digest")}
                  title="Weekly digest"
                  description="A Monday summary of activity across your projects."
                  checked={notif.digest}
                  onChange={(v) => setNotif((n) => ({ ...n, digest: v }))}
                />
                <ToggleRow
                  id={fid("n-marketing")}
                  title="Tips and offers"
                  description="Occasional guides, events and partner discounts."
                  checked={notif.marketing}
                  onChange={(v) => setNotif((n) => ({ ...n, marketing: v }))}
                />
              </div>
            </Column>
          </section>

          {/* Security */}
          <section className="sp-card" {...sectionProps("security", fid("h-security"))}>
            <Column gap="16">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l" id={fid("h-security")}>
                  Security
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Keep your account safe with a strong password and a second factor.
                </Text>
              </Column>
              <ToggleRow
                id={fid("2fa")}
                title="Two-factor authentication"
                description={
                  twoFactor
                    ? "Enabled. You'll be asked for a code from your authenticator app at sign-in."
                    : "Add an extra step at sign-in using an authenticator app."
                }
                checked={twoFactor}
                onChange={setTwoFactor}
              />
              <div className="sp-switch-row">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="sp-label">Password</span>
                  <span className="sp-hint">Last changed 4 months ago</span>
                </div>
                <button
                  type="button"
                  className="sp-btn-plain"
                  onClick={() => setStatusMsg("A password reset link was sent to your email.")}
                >
                  Change password
                </button>
              </div>
            </Column>
          </section>

          {/* Danger zone */}
          <section className="sp-card sp-danger-card" {...sectionProps("danger", fid("h-danger"))}>
            <Column gap="16">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l" id={fid("h-danger")}>
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  These actions affect your whole account. Please read each one carefully.
                </Text>
              </Column>
              <div>
                <div className="sp-danger-row">
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="sp-label">Deactivate account</span>
                    <span className="sp-hint">
                      Hide your profile and pause all notifications. You can reactivate by signing in again.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="sp-btn-danger"
                    onClick={() => setDialog("deactivate")}
                  >
                    Deactivate
                  </button>
                </div>
                <div className="sp-danger-row">
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="sp-label">Delete account</span>
                    <span className="sp-hint">
                      Permanently remove your account, 14 projects and 212 files. This cannot be undone.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="sp-btn-danger sp-solid"
                    onClick={() => setDialog("delete")}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </Column>
          </section>
        </main>
      </div>

      {dialog ? (
        <div
          className="sp-dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            ref={dialogRef}
            className="sp-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={fid("dlg-title")}
            aria-describedby={fid("dlg-desc")}
          >
            <Heading as="h2" variant="heading-strong-m" id={fid("dlg-title")}>
              {dialog === "delete" ? "Delete your account?" : "Deactivate your account?"}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak" id={fid("dlg-desc")}>
              {dialog === "delete"
                ? "All of your projects, files and comments will be permanently erased. This action cannot be undone."
                : "Your profile will be hidden until you sign in again. Your data stays intact."}
            </Text>
            <div className="sp-field">
              <label className="sp-label" htmlFor={fid("confirm")}>
                Type {confirmWord} to confirm
              </label>
              <input
                id={fid("confirm")}
                className="sp-input"
                value={confirmText}
                autoComplete="off"
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
            <div className="sp-actions" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="sp-btn-plain" onClick={closeDialog}>
                Cancel
              </button>
              <button
                type="button"
                className="sp-btn-danger sp-solid"
                disabled={confirmText !== confirmWord}
                onClick={confirmDialog}
              >
                {dialog === "delete" ? "Delete account" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
