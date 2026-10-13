```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Avatar, Button, Column, Heading, Input, Row, Text, Textarea, useToast } from "@once-ui-system/core";

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

interface Option {
  value: string;
  label: string;
}

const TIMEZONES: Option[] = [
  { value: "America/Los_Angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "America/New_York", label: "Eastern Time (UTC−05:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Berlin", label: "Central European Time (UTC+01:00)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES: Option[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const ROLES: Option[] = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product management" },
  { value: "marketing", label: "Marketing" },
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
  firstName: "Maya",
  lastName: "Okafor",
  username: "mayaokafor",
  email: "maya.okafor@northwind.example",
  role: "design",
  timezone: "Europe/London",
  language: "en",
  bio: "Product designer at Northwind. I care about calm interfaces, clear writing and design systems that scale.",
};

const BIO_LIMIT = 200;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const selectStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "2.5rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "var(--font-size-s)",
};

interface SelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId();
  return (
    <Column gap="8" fillWidth>
      <label htmlFor={id}>
        <Text variant="label-default-s" onBackground="neutral-strong">
          {label}
        </Text>
      </label>
      <select
        id={id}
        value={value}
        style={selectStyle}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Column>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <Row fillWidth horizontal="between" vertical="center" gap="16" paddingY="12">
      <Column gap="4" flex={1} style={{ minWidth: 0 }}>
        <label htmlFor={id}>
          <Text variant="label-default-m" onBackground="neutral-strong">
            {label}
          </Text>
        </label>
        <Text id={descId} variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-describedby={descId}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        style={{ width: "2.5rem", height: "1.5rem", accentColor: "var(--brand-solid-strong)", flexShrink: 0 }}
      />
    </Row>
  );
}

function SectionCard({
  id,
  title,
  description,
  children,
  danger,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      style={{
        scrollMarginTop: "1.5rem",
        border: `1px solid ${danger ? "var(--danger-alpha-strong)" : "var(--neutral-alpha-medium)"}`,
        borderRadius: "var(--radius-l)",
        background: "var(--surface-background)",
        padding: "clamp(1rem, 4vw, 1.5rem)",
      }}
    >
      <Column gap="24" fillWidth>
        <Column gap="4">
          <Heading as="h2" id={`${id}-title`} variant="heading-strong-l">
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

export default function SettingsPage() {
  const { addToast } = useToast();
  const [active, setActive] = useState<SectionId>("profile");
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileState, string>>>({});
  const [notify, setNotify] = useState({ product: true, digest: false, security: true });
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const confirmId = useId();

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or WebP).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError("");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setAvatarUrl(url);
  };

  const removeAvatar = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setAvatarUrl(null);
    setAvatarError("");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Partial<Record<keyof ProfileState, string>> = {};
    if (!profile.firstName.trim()) next.firstName = "First name is required.";
    if (!profile.lastName.trim()) next.lastName = "Last name is required.";
    if (!/^[a-z0-9_]{3,20}$/i.test(profile.username)) {
      next.username = "Use 3–20 letters, numbers or underscores.";
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaved(profile);
    addToast({ variant: "success", message: "Profile changes saved." });
  };

  const onReset = () => {
    setProfile(saved);
    setErrors({});
  };

  const goTo = (id: SectionId) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteReady = confirmText === profile.username;

  const onDelete = () => {
    if (!deleteReady) return;
    setConfirming(false);
    setConfirmText("");
    addToast({ variant: "danger", message: "Account deletion requested. Check your email to confirm." });
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <Column fillWidth horizontal="center" paddingX="m" paddingY="24">
      <Column fillWidth gap="32" style={{ maxWidth: "64rem" }}>
        <Column as="header" gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, account preferences and workspace access.
          </Text>
        </Column>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "flex-start",
          }}
        >
          <nav
            aria-label="Settings sections"
            style={{ flex: "1 1 14rem", maxWidth: "100%", minWidth: 0, position: "sticky", top: "1rem" }}
          >
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "0.25rem",
              }}
            >
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                const isDanger = s.id === "danger";
                return (
                  <li key={s.id} style={{ flex: "1 1 auto" }}>
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      aria-current={isActive ? "true" : undefined}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        font: "inherit",
                        padding: "0.625rem 0.75rem",
                        minHeight: "2.75rem",
                        borderRadius: "var(--radius-m)",
                        border: "1px solid transparent",
                        background: isActive ? "var(--neutral-alpha-weak)" : "transparent",
                        color: isDanger ? "var(--danger-on-background-strong)" : "var(--neutral-on-background-strong)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <span style={{ display: "block", fontSize: "var(--font-size-s)" }}>{s.label}</span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "var(--font-size-xs)",
                          color: "var(--neutral-on-background-weak)",
                          fontWeight: 400,
                        }}
                      >
                        {s.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main style={{ flex: "3 1 22rem", minWidth: 0 }}>
            <Column gap="24" fillWidth>
              <SectionCard
                id="profile"
                title="Profile"
                description="This information is shown on your public profile and in shared projects."
              >
                <form onSubmit={onSubmit} noValidate aria-label="Profile form">
                  <Column gap="24" fillWidth>
                    <Row gap="16" vertical="center" wrap>
                      <Avatar src={avatarUrl ?? undefined} value={avatarUrl ? undefined : `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`} size="xl" />
                      <Column gap="8">
                        <Text variant="label-default-m" onBackground="neutral-strong">
                          {fullName || "Your name"}
                        </Text>
                        <Row gap="8" wrap>
                          <Button type="button" variant="secondary" size="s" onClick={() => fileRef.current?.click()}>
                            Upload photo
                          </Button>
                          {avatarUrl && (
                            <Button type="button" variant="tertiary" size="s" onClick={removeAvatar}>
                              Remove
                            </Button>
                          )}
                        </Row>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={onAvatarChange}
                          aria-label="Upload profile photo"
                          style={{ display: "none" }}
                        />
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          PNG, JPG or WebP, up to 2 MB.
                        </Text>
                        <div role="status" aria-live="polite">
                          {avatarError && (
                            <Text variant="body-default-xs" onBackground="danger-weak">
                              {avatarError}
                            </Text>
                          )}
                        </div>
                      </Column>
                    </Row>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <Input
                        id="firstName"
                        label="First name"
                        value={profile.firstName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update("firstName", e.target.value)}
                        error={!!errors.firstName}
                        errorMessage={errors.firstName}
                        autoComplete="given-name"
                      />
                      <Input
                        id="lastName"
                        label="Last name"
                        value={profile.lastName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update("lastName", e.target.value)}
                        error={!!errors.lastName}
                        errorMessage={errors.lastName}
                        autoComplete="family-name"
                      />
                      <Input
                        id="username"
                        label="Username"
                        value={profile.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update("username", e.target.value)}
                        error={!!errors.username}
                        errorMessage={errors.username}
                        autoComplete="username"
                      />
                      <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={profile.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update("email", e.target.value)}
                        error={!!errors.email}
                        errorMessage={errors.email}
                        autoComplete="email"
                      />
                      <SelectField label="Role" value={profile.role} options={ROLES} onChange={(v) => update("role", v)} />
                      <SelectField
                        label="Language"
                        value={profile.language}
                        options={LANGUAGES}
                        onChange={(v) => update("language", v)}
                      />
                      <SelectField
                        label="Time zone"
                        value={profile.timezone}
                        options={TIMEZONES}
                        onChange={(v) => update("timezone", v)}
                      />
                    </div>

                    <Column gap="8">
                      <Textarea
                        id="bio"
                        label="Bio"
                        lines={4}
                        value={profile.bio}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          update("bio", e.target.value.slice(0, BIO_LIMIT))
                        }
                      />
                      <Text variant="body-default-xs" onBackground="neutral-weak" align="right">
                        {profile.bio.length}/{BIO_LIMIT} characters
                      </Text>
                    </Column>

                    <Row gap="12" wrap horizontal="end">
                      <Button type="button" variant="tertiary" onClick={onReset} disabled={!dirty}>
                        Discard changes
                      </Button>
                      <Button type="submit" variant="primary" disabled={!dirty}>
                        Save changes
                      </Button>
                    </Row>
                  </Column>
                </form>
              </SectionCard>

              <SectionCard
                id="account"
                title="Account"
                description="Security and sign-in details for your Northwind account."
              >
                <Column gap="12" fillWidth>
                  <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                    <Column gap="4">
                      <Text variant="label-default-m" onBackground="neutral-strong">
                        Password
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Last changed 3 months ago
                      </Text>
                    </Column>
                    <Button
                      type="button"
                      variant="secondary"
                      size="s"
                      onClick={() => addToast({ variant: "success", message: "Password reset link sent to your email." })}
                    >
                      Send reset link
                    </Button>
                  </Row>
                  <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                    <Column gap="4">
                      <Text variant="label-default-m" onBackground="neutral-strong">
                        Active sessions
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        2 devices: MacBook Pro (London), iPhone 15
                      </Text>
                    </Column>
                    <Button
                      type="button"
                      variant="secondary"
                      size="s"
                      onClick={() => addToast({ variant: "success", message: "Signed out of all other devices." })}
                    >
                      Sign out others
                    </Button>
                  </Row>
                </Column>
              </SectionCard>

              <SectionCard
                id="notifications"
                title="Notifications"
                description="Choose which updates you want to receive by email."
              >
                <Column fillWidth>
                  <ToggleRow
                    label="Product updates"
                    description="New features and improvements, about twice a month."
                    checked={notify.product}
                    onChange={(v) => setNotify((n) => ({ ...n, product: v }))}
                  />
                  <ToggleRow
                    label="Weekly digest"
                    description="A Monday summary of activity across your projects."
                    checked={notify.digest}
                    onChange={(v) => setNotify((n) => ({ ...n, digest: v }))}
                  />
                  <ToggleRow
                    label="Security alerts"
                    description="Sign-ins from new devices and password changes."
                    checked={notify.security}
                    onChange={(v) => setNotify((n) => ({ ...n, security: v }))}
                  />
                </Column>
              </SectionCard>

              <SectionCard
                id="danger"
                title="Danger zone"
                description="These actions are permanent and cannot be undone."
                danger
              >
                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Column gap="4" flex={1} style={{ minWidth: "12rem" }}>
                    <Text variant="label-default-m" onBackground="neutral-strong">
                      Delete account
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Permanently remove your profile, projects and all associated data.
                    </Text>
                  </Column>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setConfirming(true)}
                    aria-expanded={confirming}
                    aria-controls={`${confirmId}-panel`}
                  >
                    Delete account
                  </Button>
                </Row>
                {confirming && (
                  <div
                    id={`${confirmId}-panel`}
                    role="group"
                    aria-labelledby={`${confirmId}-heading`}
                    style={{
                      border: "1px solid var(--danger-alpha-strong)",
                      borderRadius: "var(--radius-m)",
                      padding: "1rem",
                    }}
                  >
                    <Column gap="16" fillWidth>
                      <Text id={`${confirmId}-heading`} variant="label-default-m" onBackground="neutral-strong">
                        Type <strong>{profile.username}</strong> to confirm deletion
                      </Text>
                      <Input
                        id={`${confirmId}-input`}
                        label="Username confirmation"
                        value={confirmText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmText(e.target.value)}
                        autoComplete="off"
                      />
                      <Row gap="12" wrap horizontal="end">
                        <Button
                          type="button"
                          variant="tertiary"
                          onClick={() => {
                            setConfirming(false);
                            setConfirmText("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="button" variant="danger" disabled={!deleteReady} onClick={onDelete}>
                          Permanently delete
                        </Button>
                      </Row>
                    </Column>
                  </div>
                )}
              </SectionCard>
            </Column>
          </main>
        </div>
      </Column>
    </Column>
  );
}
```