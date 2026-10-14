"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Column, Row, Flex, Heading, Text, Line } from "@once-ui-system/core";

type SectionId = "profile" | "account" | "notifications" | "danger";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", description: "Your public information" },
  { id: "account", label: "Account", description: "Email and security" },
  { id: "notifications", label: "Notifications", description: "How we reach you" },
  { id: "danger", label: "Danger zone", description: "Irreversible actions" },
];

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "America/New_York", label: "Eastern Time (UTC−05:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Berlin", label: "Central European Time (UTC+01:00)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const VISIBILITY = [
  { value: "public", label: "Public — anyone can see my profile" },
  { value: "members", label: "Members only" },
  { value: "private", label: "Private — only me" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  timezone: string;
  language: string;
  visibility: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Lindqvist",
  username: "mayalindqvist",
  email: "maya.lindqvist@northwind.studio",
  bio: "Product designer at Northwind Studio. I care about calm interfaces, good defaults and well-labelled form fields.",
  website: "https://mayalindqvist.design",
  timezone: "Europe/Berlin",
  language: "en",
  visibility: "members",
};

const BIO_MAX = 200;

const styles = `
.sp-root { width: 100%; max-width: 1120px; margin: 0 auto; padding: 32px 20px 64px; box-sizing: border-box; }
.sp-layout { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
@media (min-width: 880px) { .sp-layout { grid-template-columns: 260px minmax(0, 1fr); gap: 40px; } .sp-root { padding: 48px 32px 80px; } }
.sp-nav { display: flex; flex-direction: row; gap: 6px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
@media (min-width: 880px) { .sp-nav { flex-direction: column; overflow: visible; position: sticky; top: 24px; padding-bottom: 0; } }
.sp-nav-link { display: flex; flex-direction: column; gap: 2px; text-align: left; padding: 10px 14px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--neutral-on-background-strong); cursor: pointer; font: inherit; white-space: nowrap; min-height: 44px; }
.sp-nav-link:hover { background: var(--neutral-alpha-weak); }
.sp-nav-link:focus-visible, .sp-btn:focus-visible, .sp-field:focus-visible, .sp-switch:focus-visible, .sp-avatar-btn:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.sp-nav-link[aria-current="true"] { background: var(--neutral-alpha-weak); border-color: var(--neutral-alpha-medium); }
.sp-nav-desc { display: none; }
@media (min-width: 880px) { .sp-nav-desc { display: block; } }
.sp-card { background: var(--surface-background); border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; padding: 20px; scroll-margin-top: 24px; }
@media (min-width: 640px) { .sp-card { padding: 28px; } }
.sp-card-danger { border-color: var(--danger-alpha-strong, #d9534f); }
.sp-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 640px) { .sp-grid { grid-template-columns: 1fr 1fr; } .sp-span { grid-column: 1 / -1; } }
.sp-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--neutral-on-background-strong); }
.sp-hint { font-size: 13px; color: var(--neutral-on-background-weak); margin-top: 6px; }
.sp-error { font-size: 13px; color: var(--danger-on-background-strong, #c0392b); margin-top: 6px; }
.sp-field { width: 100%; box-sizing: border-box; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--neutral-alpha-strong); background: var(--page-background); color: var(--neutral-on-background-strong); font: inherit; font-size: 15px; }
textarea.sp-field { resize: vertical; min-height: 96px; line-height: 1.5; }
.sp-field[aria-invalid="true"] { border-color: var(--danger-solid-strong, #c0392b); }
.sp-btn { min-height: 44px; padding: 10px 18px; border-radius: 10px; border: 1px solid var(--neutral-alpha-strong); background: transparent; color: var(--neutral-on-background-strong); font: inherit; font-weight: 600; cursor: pointer; }
.sp-btn:hover:not(:disabled) { background: var(--neutral-alpha-weak); }
.sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sp-btn-primary { background: var(--brand-solid-strong); border-color: var(--brand-solid-strong); color: var(--brand-on-solid-strong, #fff); }
.sp-btn-primary:hover:not(:disabled) { background: var(--brand-solid-medium); }
.sp-btn-danger { background: var(--danger-solid-strong, #c0392b); border-color: var(--danger-solid-strong, #c0392b); color: #fff; }
.sp-btn-danger:hover:not(:disabled) { background: var(--danger-solid-medium, #a93226); }
.sp-btn-outline-danger { border-color: var(--danger-solid-strong, #c0392b); color: var(--danger-on-background-strong, #c0392b); }
.sp-avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--brand-solid-strong); color: var(--brand-on-solid-strong, #fff); font-size: 30px; font-weight: 700; overflow: hidden; }
.sp-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sp-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; }
.sp-row { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 640px) { .sp-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 24px; } }
.sp-switch { position: relative; width: 48px; height: 28px; border-radius: 999px; border: 1px solid var(--neutral-alpha-strong); background: var(--neutral-alpha-medium); cursor: pointer; flex-shrink: 0; padding: 0; transition: background 0.15s; }
.sp-switch[aria-checked="true"] { background: var(--brand-solid-strong); border-color: var(--brand-solid-strong); }
.sp-switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 0.15s; }
.sp-switch[aria-checked="true"]::after { transform: translateX(20px); }
.sp-status { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--neutral-solid-strong); color: var(--neutral-on-solid-strong); padding: 12px 20px; border-radius: 12px; font-size: 14px; z-index: 50; max-width: calc(100vw - 32px); }
.sp-dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 100; }
.sp-dialog { background: var(--surface-background); border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; padding: 24px; width: 100%; max-width: 440px; box-sizing: border-box; }
.sp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .sp-switch, .sp-switch::after { transition: none; } }
`;

function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  hintId,
  errorId,
  span,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
  hintId?: string;
  errorId?: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "sp-span" : undefined}>
      <label className="sp-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <div className="sp-hint" id={hintId}>
          {hint}
        </div>
      )}
      {error && (
        <div className="sp-error" id={errorId} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
  describedBy: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="sp-switch"
      onClick={() => onChange(!checked)}
    />
  );
}

export default function SettingsPage() {
  const uid = useId();
  const [active, setActive] = useState<SectionId>("profile");
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>("");
  const [notif, setNotif] = useState({ product: true, digest: false, security: true });
  const [dialog, setDialog] = useState<null | "deactivate" | "delete">(null);
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const refs: Record<SectionId, React.RefObject<HTMLElement | null>> = {
    profile: useRef<HTMLElement | null>(null),
    account: useRef<HTMLElement | null>(null),
    notifications: useRef<HTMLElement | null>(null),
    danger: useRef<HTMLElement | null>(null),
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProfileState, string>> = {};
    if (!profile.firstName.trim()) e.firstName = "First name is required.";
    if (!profile.lastName.trim()) e.lastName = "Last name is required.";
    if (!/^[a-z0-9_]{3,20}$/.test(profile.username))
      e.username = "Use 3–20 lowercase letters, numbers or underscores.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Enter a valid email address.";
    if (profile.website && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(profile.website))
      e.website = "Enter a full URL starting with http:// or https://.";
    if (profile.bio.length > BIO_MAX) e.bio = `Bio must be ${BIO_MAX} characters or fewer.`;
    return e;
  }, [profile]);

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved) || avatarUrl !== null;
  const hasErrors = Object.keys(errors).length > 0;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "?";

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(""), 3500);
    return () => window.clearTimeout(t);
  }, [status]);

  // Track the active section while scrolling.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.getAttribute("data-section") as SectionId);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    (Object.keys(refs) as SectionId[]).forEach((k) => {
      const el = refs[k].current;
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog: focus management, Escape, focus trap.
  useEffect(() => {
    if (!dialog) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusables = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>("button:not(:disabled), input, [href], select, textarea"),
          )
        : [];
    focusables()[0]?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        closeDialog();
        return;
      }
      if (ev.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  function closeDialog() {
    setDialog(null);
    setConfirmText("");
  }

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function blur(key: string) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  function goTo(id: SectionId) {
    setActive(id);
    const el = refs[id].current;
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("Use a PNG, JPEG or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 2 MB.");
      return;
    }
    setAvatarError("");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setAvatarUrl(url);
    e.target.value = "";
  }

  function removeAvatar() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setAvatarUrl(null);
    setAvatarError("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      website: true,
      bio: true,
    });
    if (hasErrors) {
      setStatus("Please fix the highlighted fields.");
      const firstKey = (Object.keys(errors) as (keyof ProfileState)[])[0];
      document.getElementById(`${uid}-${firstKey}`)?.focus();
      return;
    }
    setSaved(profile);
    setStatus("Profile saved.");
  }

  function onReset() {
    setProfile(saved);
    setTouched({});
    setAvatarError("");
    if (avatarUrl) removeAvatar();
  }

  const err = (k: keyof ProfileState) => (touched[k] ? errors[k] : undefined);
  const fid = (k: string) => `${uid}-${k}`;
  const describe = (k: keyof ProfileState, hasHint: boolean) =>
    err(k) ? `${fid(k)}-err` : hasHint ? `${fid(k)}-hint` : undefined;

  const confirmTarget = dialog === "delete" ? "DELETE" : "DEACTIVATE";

  return (
    <Flex fillWidth horizontal="center">
      <style>{styles}</style>
      <div className="sp-root">
        <Column gap="8" paddingBottom="32">
          <Heading as="h1" variant="display-strong-xs">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, account preferences and workspace security.
          </Text>
        </Column>

        <div className="sp-layout">
          <nav aria-label="Settings sections" className="sp-nav">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="sp-nav-link"
                aria-current={active === s.id ? "true" : undefined}
                onClick={() => goTo(s.id)}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>{s.label}</span>
                <span
                  className="sp-nav-desc"
                  style={{ fontSize: 13, color: "var(--neutral-on-background-weak)" }}
                >
                  {s.description}
                </span>
              </button>
            ))}
          </nav>

          <Column gap="24" fillWidth>
            {/* PROFILE */}
            <section
              className="sp-card"
              data-section="profile"
              ref={refs.profile as React.RefObject<HTMLElement>}
              aria-labelledby={fid("h-profile")}
            >
              <form onSubmit={onSubmit} noValidate>
                <Column gap="24">
                  <Column gap="4">
                    <Heading as="h2" variant="heading-strong-l" id={fid("h-profile")}>
                      Profile
                    </Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      This information is shown on your public profile.
                    </Text>
                  </Column>

                  <Row gap="20" vertical="center" wrap>
                    <div className="sp-avatar" aria-hidden={avatarUrl ? undefined : true}>
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Your new profile photo preview" />
                      ) : (
                        initials
                      )}
                    </div>
                    <Column gap="8" flex={1} style={{ minWidth: 200 }}>
                      <Text variant="label-default-m" id={fid("avatar-label")}>
                        Profile photo
                      </Text>
                      <Row gap="8" wrap>
                        <input
                          ref={fileRef}
                          id={fid("avatar")}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sp-sr"
                          onChange={onAvatarChange}
                          aria-describedby={`${fid("avatar-hint")}${avatarError ? ` ${fid("avatar-err")}` : ""}`}
                          tabIndex={-1}
                        />
                        <button
                          type="button"
                          className="sp-btn"
                          aria-labelledby={`${fid("avatar-label")} ${fid("avatar-btn")}`}
                          id={fid("avatar-btn")}
                          onClick={() => fileRef.current?.click()}
                        >
                          {avatarUrl ? "Change photo" : "Upload photo"}
                        </button>
                        {avatarUrl && (
                          <button type="button" className="sp-btn" onClick={removeAvatar}>
                            Remove
                          </button>
                        )}
                      </Row>
                      <div className="sp-hint" id={fid("avatar-hint")} style={{ marginTop: 0 }}>
                        PNG, JPEG or WebP. Maximum size 2 MB.
                      </div>
                      {avatarError && (
                        <div className="sp-error" id={fid("avatar-err")} role="alert" style={{ marginTop: 0 }}>
                          {avatarError}
                        </div>
                      )}
                    </Column>
                  </Row>

                  <Line />

                  <div className="sp-grid">
                    <Field label="First name" htmlFor={fid("firstName")} error={err("firstName")} errorId={`${fid("firstName")}-err`}>
                      <input
                        id={fid("firstName")}
                        className="sp-field"
                        value={profile.firstName}
                        autoComplete="given-name"
                        required
                        aria-required="true"
                        aria-invalid={err("firstName") ? true : undefined}
                        aria-describedby={describe("firstName", false)}
                        onChange={(e) => update("firstName", e.target.value)}
                        onBlur={() => blur("firstName")}
                      />
                    </Field>
                    <Field label="Last name" htmlFor={fid("lastName")} error={err("lastName")} errorId={`${fid("lastName")}-err`}>
                      <input
                        id={fid("lastName")}
                        className="sp-field"
                        value={profile.lastName}
                        autoComplete="family-name"
                        required
                        aria-required="true"
                        aria-invalid={err("lastName") ? true : undefined}
                        aria-describedby={describe("lastName", false)}
                        onChange={(e) => update("lastName", e.target.value)}
                        onBlur={() => blur("lastName")}
                      />
                    </Field>
                    <Field
                      label="Username"
                      htmlFor={fid("username")}
                      hint="Your profile lives at northwind.studio/u/username."
                      hintId={`${fid("username")}-hint`}
                      error={err("username")}
                      errorId={`${fid("username")}-err`}
                    >
                      <input
                        id={fid("username")}
                        className="sp-field"
                        value={profile.username}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-invalid={err("username") ? true : undefined}
                        aria-describedby={describe("username", true)}
                        onChange={(e) => update("username", e.target.value)}
                        onBlur={() => blur("username")}
                      />
                    </Field>
                    <Field label="Email" htmlFor={fid("email")} error={err("email")} errorId={`${fid("email")}-err`}>
                      <input
                        id={fid("email")}
                        type="email"
                        className="sp-field"
                        value={profile.email}
                        autoComplete="email"
                        aria-invalid={err("email") ? true : undefined}
                        aria-describedby={describe("email", false)}
                        onChange={(e) => update("email", e.target.value)}
                        onBlur={() => blur("email")}
                      />
                    </Field>
                    <Field
                      label="Website"
                      htmlFor={fid("website")}
                      span
                      error={err("website")}
                      errorId={`${fid("website")}-err`}
                    >
                      <input
                        id={fid("website")}
                        type="url"
                        className="sp-field"
                        value={profile.website}
                        autoComplete="url"
                        aria-invalid={err("website") ? true : undefined}
                        aria-describedby={describe("website", false)}
                        onChange={(e) => update("website", e.target.value)}
                        onBlur={() => blur("website")}
                      />
                    </Field>
                    <Field
                      label="Bio"
                      htmlFor={fid("bio")}
                      span
                      hint={`${profile.bio.length}/${BIO_MAX} characters`}
                      hintId={`${fid("bio")}-hint`}
                      error={err("bio")}
                      errorId={`${fid("bio")}-err`}
                    >
                      <textarea
                        id={fid("bio")}
                        className="sp-field"
                        rows={4}
                        value={profile.bio}
                        aria-invalid={err("bio") ? true : undefined}
                        aria-describedby={describe("bio", true)}
                        onChange={(e) => update("bio", e.target.value)}
                        onBlur={() => blur("bio")}
                      />
                    </Field>
                    <Field label="Time zone" htmlFor={fid("timezone")}>
                      <select
                        id={fid("timezone")}
                        className="sp-field"
                        value={profile.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                      >
                        {TIMEZONES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Language" htmlFor={fid("language")}>
                      <select
                        id={fid("language")}
                        className="sp-field"
                        value={profile.language}
                        onChange={(e) => update("language", e.target.value)}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Profile visibility" htmlFor={fid("visibility")} span>
                      <select
                        id={fid("visibility")}
                        className="sp-field"
                        value={profile.visibility}
                        onChange={(e) => update("visibility", e.target.value)}
                      >
                        {VISIBILITY.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="sp-actions">
                    <button type="button" className="sp-btn" onClick={onReset} disabled={!dirty}>
                      Discard changes
                    </button>
                    <button type="submit" className="sp-btn sp-btn-primary" disabled={!dirty}>
                      Save changes
                    </button>
                  </div>
                </Column>
              </form>
            </section>

            {/* ACCOUNT */}
            <section
              className="sp-card"
              data-section="account"
              ref={refs.account as React.RefObject<HTMLElement>}
              aria-labelledby={fid("h-account")}
            >
              <Column gap="20">
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-l" id={fid("h-account")}>
                    Account
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Keep your sign-in details and sessions secure.
                  </Text>
                </Column>
                <div className="sp-row">
                  <Column gap="4">
                    <Text variant="label-strong-m">Password</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Last changed 4 months ago.
                    </Text>
                  </Column>
                  <button type="button" className="sp-btn" onClick={() => setStatus("Password reset email sent.")}>
                    Change password
                  </button>
                </div>
                <Line />
                <div className="sp-row">
                  <Column gap="4">
                    <Text variant="label-strong-m">Active sessions</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      3 devices are signed in, including this MacBook Pro in Berlin.
                    </Text>
                  </Column>
                  <button type="button" className="sp-btn" onClick={() => setStatus("Signed out of 2 other devices.")}>
                    Sign out other devices
                  </button>
                </div>
              </Column>
            </section>

            {/* NOTIFICATIONS */}
            <section
              className="sp-card"
              data-section="notifications"
              ref={refs.notifications as React.RefObject<HTMLElement>}
              aria-labelledby={fid("h-notifications")}
            >
              <Column gap="20">
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-l" id={fid("h-notifications")}>
                    Notifications
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Choose which emails you would like to receive.
                  </Text>
                </Column>
                {(
                  [
                    { key: "product", title: "Product updates", desc: "New features and improvements, about twice a month." },
                    { key: "digest", title: "Weekly digest", desc: "A Monday summary of activity across your projects." },
                    { key: "security", title: "Security alerts", desc: "Sign-ins from new devices and password changes." },
                  ] as const
                ).map((n, i) => (
                  <React.Fragment key={n.key}>
                    {i > 0 && <Line />}
                    <div className="sp-row" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Column gap="4" style={{ minWidth: 0 }}>
                        <Text variant="label-strong-m" id={fid(`n-${n.key}-t`)}>
                          {n.title}
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak" id={fid(`n-${n.key}-d`)}>
                          {n.desc}
                        </Text>
                      </Column>
                      <Toggle
                        id={fid(`n-${n.key}`)}
                        checked={notif[n.key]}
                        onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))}
                        labelledBy={fid(`n-${n.key}-t`)}
                        describedBy={fid(`n-${n.key}-d`)}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </Column>
            </section>

            {/* DANGER ZONE */}
            <section
              className="sp-card sp-card-danger"
              data-section="danger"
              ref={refs.danger as React.RefObject<HTMLElement>}
              aria-labelledby={fid("h-danger")}
            >
              <Column gap="20">
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-l" id={fid("h-danger")}>
                    Danger zone
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    These actions affect your whole account. Please proceed carefully.
                  </Text>
                </Column>
                <div className="sp-row">
                  <Column gap="4">
                    <Text variant="label-strong-m">Deactivate account</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Hide your profile and pause notifications. You can reactivate by signing in again.
                    </Text>
                  </Column>
                  <button type="button" className="sp-btn sp-btn-outline-danger" onClick={() => setDialog("deactivate")}>
                    Deactivate
                  </button>
                </div>
                <Line />
                <div className="sp-row">
                  <Column gap="4">
                    <Text variant="label-strong-m">Delete account</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Permanently remove your account, 14 projects and all uploaded files. This cannot be undone.
                    </Text>
                  </Column>
                  <button type="button" className="sp-btn sp-btn-danger" onClick={() => setDialog("delete")}>
                    Delete account
                  </button>
                </div>
              </Column>
            </section>
          </Column>
        </div>
      </div>

      <div aria-live="polite" role="status">
        {status && <div className="sp-status">{status}</div>}
      </div>

      {dialog && (
        <div
          className="sp-dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            className="sp-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={fid("dlg-title")}
            aria-describedby={fid("dlg-desc")}
            ref={dialogRef}
          >
            <Column gap="16">
              <Heading as="h2" variant="heading-strong-l" id={fid("dlg-title")}>
                {dialog === "delete" ? "Delete your account?" : "Deactivate your account?"}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak" id={fid("dlg-desc")}>
                {dialog === "delete"
                  ? "This permanently deletes your profile, projects and files. This action cannot be undone."
                  : "Your profile will be hidden until you sign in again."}
              </Text>
              <div>
                <label className="sp-label" htmlFor={fid("confirm")}>
                  Type <strong>{confirmTarget}</strong> to confirm
                </label>
                <input
                  id={fid("confirm")}
                  className="sp-field"
                  value={confirmText}
                  autoComplete="off"
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
              <div className="sp-actions">
                <button type="button" className="sp-btn" onClick={closeDialog}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="sp-btn sp-btn-danger"
                  disabled={confirmText !== confirmTarget}
                  onClick={() => {
                    const msg = dialog === "delete" ? "Account deletion requested." : "Account deactivated.";
                    closeDialog();
                    setStatus(msg);
                  }}
                >
                  {dialog === "delete" ? "Delete account" : "Deactivate"}
                </button>
              </div>
            </Column>
          </div>
        </div>
      )}
    </Flex>
  );
}
