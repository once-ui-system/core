The design is a sidebar-style section nav (a horizontal scroller on phones) and a profile form with an avatar uploader, inputs and selects. A danger zone with a confirm dialog sits at the bottom. To keep the strict-TypeScript risk low, I'm using Once UI layout primitives (`Column`, `Row`, `Flex`, `Heading`, `Text`, `Button`, `Line`) and native, token-styled form controls.

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent, ReactNode } from "react";
import { Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type SectionId = "profile" | "account" | "notifications" | "security" | "danger";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", description: "Your public information" },
  { id: "account", label: "Account", description: "Email and preferences" },
  { id: "notifications", label: "Notifications", description: "Alerts and digests" },
  { id: "security", label: "Security", description: "Password and sessions" },
  { id: "danger", label: "Danger zone", description: "Irreversible actions" },
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
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "pm", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 200;

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: "2.75rem",
  padding: "0.625rem 0.875rem",
  font: "inherit",
  fontSize: "var(--static-font-size-m, 1rem)",
  color: "var(--neutral-on-background-strong)",
  background: "var(--neutral-alpha-weak)",
  border: "1px solid var(--neutral-alpha-medium)",
  borderRadius: "var(--radius-m, 0.75rem)",
  outlineOffset: 2,
};

const labelStyle: CSSProperties = {
  fontSize: "var(--static-font-size-s, 0.875rem)",
  fontWeight: 600,
  color: "var(--neutral-on-background-strong)",
};

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  hintId?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, hint, error, hintId, children }: FieldProps) {
  return (
    <Column gap="8" fillWidth>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
      </label>
      {children}
      {error ? (
        <span id={hintId} role="alert" style={{ color: "var(--danger-on-background-strong)", fontSize: "0.8125rem" }}>
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
          {hint}
        </span>
      ) : null}
    </Column>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <Field label={label} htmlFor={id}>
      <div style={{ position: "relative", width: "100%" }}>
        <select
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          style={{ ...fieldStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "0.95rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--neutral-on-background-weak)",
            fontSize: "0.75rem",
          }}
        >
          ▾
        </span>
      </div>
    </Field>
  );
}

interface ToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ id, label, description, checked, onChange }: ToggleProps) {
  const descId = `${id}-desc`;
  return (
    <Row fillWidth horizontal="between" vertical="center" gap="16">
      <Column gap="4" style={{ minWidth: 0 }}>
        <label htmlFor={id} style={{ ...labelStyle, cursor: "pointer" }}>
          {label}
        </label>
        <span id={descId} style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
          {description}
        </span>
      </Column>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descId}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          width: 44,
          height: 26,
          padding: 2,
          borderRadius: 999,
          border: "1px solid var(--neutral-alpha-medium)",
          background: checked ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
          transition: "background 150ms ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.35)" }}
        />
      </button>
    </Row>
  );
}

function Panel({
  id,
  title,
  description,
  children,
  danger,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  danger?: boolean;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      style={{
        scrollMarginTop: "1.5rem",
        width: "100%",
        boxSizing: "border-box",
        padding: "clamp(1rem, 3vw, 1.75rem)",
        borderRadius: "var(--radius-xl, 1.25rem)",
        background: "var(--surface-background)",
        border: `1px solid ${danger ? "var(--danger-alpha-strong)" : "var(--neutral-alpha-medium)"}`,
      }}
    >
      <Column gap="24" fillWidth>
        <Column gap="4">
          <Heading as="h2" id={headingId} variant="heading-strong-l">
            {title}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        </Column>
        {children}
      </Column>
    </section>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export default function SettingsPage() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [active, setActive] = useState<SectionId>("profile");

  // Profile form
  const [fullName, setFullName] = useState("Maya Okonkwo");
  const [username, setUsername] = useState("mayaokonkwo");
  const [email, setEmail] = useState("maya@northwind.studio");
  const [role, setRole] = useState("designer");
  const [company, setCompany] = useState("Northwind Studio");
  const [website, setWebsite] = useState("https://northwind.studio");
  const [bio, setBio] = useState(
    "Designing calm, legible interfaces for logistics teams. Previously at Parcel & Co.",
  );
  const [timezone, setTimezone] = useState("Europe/London");
  const [language, setLanguage] = useState("en");

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Preferences
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Form state
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; username?: string }>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // Danger zone
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Highlight nav item for the section in view
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Dialog: focus management, Escape, focus trap
  useEffect(() => {
    if (!confirmOpen) return;
    confirmInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
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
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [confirmOpen]);

  const goTo = (sectionId: SectionId) => {
    setActive(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      e.target.value = "";
      return;
    }
    setAvatarError("");
    setAvatarUrl(URL.createObjectURL(file));
    setStatus("Photo selected. Save changes to apply it.");
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    setAvatarError("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus("Photo removed. Save changes to apply it.");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) next.username = "Use 3–20 letters, numbers or underscores.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("");
      return;
    }
    setSaving(true);
    setStatus("");
    window.setTimeout(() => {
      setSaving(false);
      setStatus("Profile saved. Your changes are live.");
    }, 700);
  };

  const onReset = () => {
    setFullName("Maya Okonkwo");
    setUsername("mayaokonkwo");
    setEmail("maya@northwind.studio");
    setRole("designer");
    setCompany("Northwind Studio");
    setWebsite("https://northwind.studio");
    setBio("Designing calm, legible interfaces for logistics teams. Previously at Parcel & Co.");
    setTimezone("Europe/London");
    setLanguage("en");
    setErrors({});
    setStatus("Changes discarded.");
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmText("");
  };

  const canDelete = confirmText.trim() === username;

  const nameErrId = id("name-err");
  const userErrId = id("user-err");
  const emailErrId = id("email-err");
  const bioHintId = id("bio-hint");

  const invalidStyle = (hasError: boolean): CSSProperties =>
    hasError ? { ...fieldStyle, borderColor: "var(--danger-solid-strong)" } : fieldStyle;

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24" style={{ boxSizing: "border-box" }}>
      <style>{`
        .st-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; width: 100%; max-width: 68rem; }
        .st-nav { position: sticky; top: 0; z-index: 2; margin: 0 -0.25rem; padding: 0.5rem 0.25rem; background: var(--page-background); }
        .st-nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: thin; }
        .st-nav li { flex: 0 0 auto; }
        .st-nav-desc { display: none; }
        .st-grid2 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .st-navbtn { width: 100%; text-align: left; font: inherit; cursor: pointer; border-radius: var(--radius-m, 0.75rem);
          padding: 0.625rem 0.875rem; min-height: 2.75rem; border: 1px solid transparent; background: transparent;
          color: var(--neutral-on-background-strong); }
        .st-navbtn:hover { background: var(--neutral-alpha-weak); }
        .st-navbtn[aria-current="true"] { background: var(--neutral-alpha-medium); border-color: var(--neutral-alpha-strong); }
        .st-layout input:focus-visible, .st-layout select:focus-visible, .st-layout textarea:focus-visible,
        .st-layout button:focus-visible, .st-dialog button:focus-visible, .st-dialog input:focus-visible {
          outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
        .st-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .st-btn-danger { font: inherit; font-weight: 600; cursor: pointer; min-height: 2.75rem; padding: 0.5rem 1.1rem;
          border-radius: var(--radius-m, 0.75rem); border: 1px solid var(--danger-solid-strong);
          background: var(--danger-solid-strong); color: #fff; }
        .st-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }
        .st-btn-outline { font: inherit; font-weight: 600; cursor: pointer; min-height: 2.75rem; padding: 0.5rem 1.1rem;
          border-radius: var(--radius-m, 0.75rem); border: 1px solid var(--danger-alpha-strong);
          background: transparent; color: var(--danger-on-background-strong); }
        .st-btn-neutral { font: inherit; font-weight: 600; cursor: pointer; min-height: 2.75rem; padding: 0.5rem 1.1rem;
          border-radius: var(--radius-m, 0.75rem); border: 1px solid var(--neutral-alpha-medium);
          background: transparent; color: var(--neutral-on-background-strong); }
        @media (min-width: 40rem) { .st-grid2 { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 56rem) {
          .st-layout { grid-template-columns: 16rem minmax(0, 1fr); gap: 2rem; align-items: start; }
          .st-nav { top: 1.5rem; margin: 0; padding: 0; background: transparent; }
          .st-nav ul { flex-direction: column; overflow: visible; gap: 0.25rem; }
          .st-nav-desc { display: block; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div className="st-layout">
        <aside className="st-nav" aria-label="Settings sections">
          <Column gap="16" fillWidth>
            <Column gap="4" className="st-nav-desc">
              <Heading as="h1" variant="heading-strong-xl">
                Settings
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Manage your profile and account.
              </Text>
            </Column>
            <nav aria-label="Settings">
              <ul>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="st-navbtn"
                      aria-current={active === s.id ? "true" : undefined}
                      onClick={() => goTo(s.id)}
                    >
                      <span style={{ display: "block", fontWeight: 600, whiteSpace: "nowrap", color: s.id === "danger" ? "var(--danger-on-background-strong)" : undefined }}>
                        {s.label}
                      </span>
                      <span className="st-nav-desc" style={{ fontSize: "0.8125rem", color: "var(--neutral-on-background-weak)" }}>
                        {s.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </Column>
        </aside>

        <main>
          <Column gap="24" fillWidth>
            <h1 className="st-sr">Account settings</h1>

            <Panel id="profile" title="Profile" description="This information is shown on your public profile.">
              <form onSubmit={onSubmit} noValidate aria-describedby={id("status")}>
                <Column gap="24" fillWidth>
                  {/* Avatar */}
                  <Row gap="16" vertical="center" wrap fillWidth>
                    <div
                      role="img"
                      aria-label={avatarUrl ? "Your new profile photo" : `Avatar with initials ${initialsOf(fullName)}`}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        flexShrink: 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "var(--brand-on-background-strong)",
                        background: "var(--brand-alpha-medium)",
                        border: "1px solid var(--neutral-alpha-medium)",
                      }}
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        initialsOf(fullName)
                      )}
                    </div>
                    <Column gap="8" style={{ minWidth: 0, flex: "1 1 14rem" }}>
                      <Row gap="8" wrap>
                        <input
                          ref={fileRef}
                          id={id("avatar")}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={onAvatarChange}
                          className="st-sr"
                          aria-describedby={id("avatar-hint")}
                        />
                        <button type="button" className="st-btn-neutral" onClick={() => fileRef.current?.click()}>
                          Upload photo
                        </button>
                        {avatarUrl ? (
                          <button type="button" className="st-btn-neutral" onClick={removeAvatar}>
                            Remove
                          </button>
                        ) : null}
                      </Row>
                      <span
                        id={id("avatar-hint")}
                        role={avatarError ? "alert" : undefined}
                        style={{
                          fontSize: "0.8125rem",
                          color: avatarError ? "var(--danger-on-background-strong)" : "var(--neutral-on-background-weak)",
                        }}
                      >
                        {avatarError || "PNG, JPG or WebP. Up to 2 MB, square works best."}
                      </span>
                    </Column>
                  </Row>

                  <div className="st-grid2">
                    <Field label="Full name" htmlFor={id("name")} error={errors.fullName} hintId={nameErrId}>
                      <input
                        id={id("name")}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        required
                        aria-invalid={errors.fullName ? true : undefined}
                        aria-describedby={errors.fullName ? nameErrId : undefined}
                        style={invalidStyle(Boolean(errors.fullName))}
                      />
                    </Field>
                    <Field
                      label="Username"
                      htmlFor={id("username")}
                      error={errors.username}
                      hint="Your profile lives at northwind.app/@username"
                      hintId={userErrId}
                    >
                      <input
                        id={id("username")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-invalid={errors.username ? true : undefined}
                        aria-describedby={userErrId}
                        style={invalidStyle(Boolean(errors.username))}
                      />
                    </Field>
                  </div>

                  <Field label="Email address" htmlFor={id("email")} error={errors.email} hintId={emailErrId}>
                    <input
                      id={id("email")}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? emailErrId : undefined}
                      style={invalidStyle(Boolean(errors.email))}
                    />
                  </Field>

                  <div className="st-grid2">
                    <SelectField id={id("role")} label="Role" value={role} options={ROLES} onChange={setRole} />
                    <Field label="Company" htmlFor={id("company")}>
                      <input
                        id={id("company")}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                        style={fieldStyle}
                      />
                    </Field>
                  </div>

                  <Field label="Website" htmlFor={id("website")}>
                    <input
                      id={id("website")}
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      autoComplete="url"
                      style={fieldStyle}
                    />
                  </Field>

                  <Field
                    label="Bio"
                    htmlFor={id("bio")}
                    hint={`${bio.length}/${BIO_LIMIT} characters`}
                    hintId={bioHintId}
                  >
                    <textarea
                      id={id("bio")}
                      value={bio}
                      maxLength={BIO_LIMIT}
                      rows={4}
                      onChange={(e) => setBio(e.target.value)}
                      aria-describedby={bioHintId}
                      style={{ ...fieldStyle, resize: "vertical", minHeight: "6rem" }}
                    />
                  </Field>

                  <div className="st-grid2">
                    <SelectField id={id("tz")} label="Time zone" value={timezone} options={TIMEZONES} onChange={setTimezone} />
                    <SelectField id={id("lang")} label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
                  </div>

                  <Row gap="12" vertical="center" wrap>
                    <Button type="submit" variant="primary" size="m" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                    <button type="button" className="st-btn-neutral" onClick={onReset}>
                      Discard
                    </button>
                    <span id={id("status")} role="status" aria-live="polite" style={{ fontSize: "0.875rem", color: "var(--neutral-on-background-weak)" }}>
                      {status}
                    </span>
                  </Row>
                </Column>
              </form>
            </Panel>

            <Panel id="account" title="Account" description="Sign-in details and regional preferences.">
              <Column gap="16" fillWidth>
                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Column gap="4">
                    <span style={labelStyle}>Plan</span>
                    <span style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                      Team plan · 8 seats · renews on 14 March 2026
                    </span>
                  </Column>
                  <button type="button" className="st-btn-neutral">
                    Manage billing
                  </button>
                </Row>
                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Column gap="4">
                    <span style={labelStyle}>Connected accounts</span>
                    <span style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                      GitHub and Google are linked to this account.
                    </span>
                  </Column>
                  <button type="button" className="st-btn-neutral">
                    Review
                  </button>
                </Row>
              </Column>
            </Panel>

            <Panel id="notifications" title="Notifications" description="Choose what lands in your inbox.">
              <Column gap="20" fillWidth>
                <Toggle
                  id={id("n-digest")}
                  label="Weekly digest"
                  description="A Monday summary of activity across your projects."
                  checked={weeklyDigest}
                  onChange={setWeeklyDigest}
                />
                <Toggle
                  id={id("n-mentions")}
                  label="Mentions and replies"
                  description="Get an email when a teammate mentions you."
                  checked={mentions}
                  onChange={setMentions}
                />
                <Toggle
                  id={id("n-news")}
                  label="Product updates"
                  description="Occasional news about new features and releases."
                  checked={productNews}
                  onChange={setProductNews}
                />
              </Column>
            </Panel>

            <Panel id="security" title="Security" description="Keep your account protected.">
              <Column gap="20" fillWidth>
                <Toggle
                  id={id("s-2fa")}
                  label="Two-factor authentication"
                  description="Require a code from your authenticator app when signing in."
                  checked={twoFactor}
                  onChange={setTwoFactor}
                />
                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Column gap="4">
                    <span style={labelStyle}>Password</span>
                    <span style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                      Last changed 3 months ago.
                    </span>
                  </Column>
                  <button type="button" className="st-btn-neutral">
                    Change password
                  </button>
                </Row>
              </Column>
            </Panel>

            <Panel
              id="danger"
              title="Danger zone"
              description="These actions are permanent and cannot be undone."
              danger
            >
              {deleted ? (
                <div role="status" style={{ color: "var(--neutral-on-background-strong)" }}>
                  Your account has been scheduled for deletion. A confirmation email is on its way to {email}.
                </div>
              ) : (
                <Column gap="16" fillWidth>
                  <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                    <Column gap="4" style={{ flex: "1 1 16rem", minWidth: 0 }}>
                      <span style={labelStyle}>Export your data</span>
                      <span style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                        Download a copy of your projects, comments and settings.
                      </span>
                    </Column>
                    <button type="button" className="st-btn-outline">
                      Request export
                    </button>
                  </Row>
                  <div style={{ height: 1, background: "var(--danger-alpha-medium)" }} role="separator" />
                  <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                    <Column gap="4" style={{ flex: "1 1 16rem", minWidth: 0 }}>
                      <span style={{ ...labelStyle, color: "var(--danger-on-background-strong)" }}>Delete account</span>
                      <span style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                        Permanently remove your account, projects and all associated data.
                      </span>
                    </Column>
                    <button
                      ref={triggerRef}
                      type="button"
                      className="st-btn-danger"
                      aria-haspopup="dialog"
                      onClick={() => setConfirmOpen(true)}
                    >
                      Delete account
                    </button>
                  </Row>
                </Column>
              )}
            </Panel>
          </Column>
        </main>
      </div>

      {confirmOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.6)",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            ref={dialogRef}
            className="st-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={id("dlg-title")}
            aria-describedby={id("dlg-desc")}
            style={{
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "100%",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: "1.5rem",
              borderRadius: "var(--radius-xl, 1.25rem)",
              background: "var(--page-background)",
              border: "1px solid var(--danger-alpha-strong)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <Column gap="16" fillWidth>
              <Heading as="h2" id={id("dlg-title")} variant="heading-strong-l">
                Delete your account?
              </Heading>
              <Text id={id("dlg-desc")} variant="body-default-s" onBackground="neutral-weak">
                This permanently deletes your profile, 14 projects and all comments. Type{" "}
                <strong style={{ color: "var(--neutral-on-background-strong)" }}>{username}</strong> to confirm.
              </Text>
              <input
                ref={confirmInputRef}
                aria-label={`Type ${username} to confirm`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                style={fieldStyle}
              />
              <Row gap="12" horizontal="end" wrap>
                <button type="button" className="st-btn-neutral" onClick={closeConfirm}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="st-btn-danger"
                  disabled={!canDelete}
                  onClick={() => {
                    setDeleted(true);
                    closeConfirm();
                  }}
                >
                  Delete permanently
                </button>
              </Row>
            </Column>
          </div>
        </div>
      ) : null}
    </Column>
  );
}
```