```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import {
  Avatar,
  Button,
  Column,
  Flex,
  Heading,
  Input,
  Row,
  Text,
  Textarea,
} from "@once-ui-system/core";

type SectionId = "profile" | "account" | "notifications" | "security" | "danger";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", description: "Your public information" },
  { id: "account", label: "Account", description: "Email and workspace" },
  { id: "notifications", label: "Notifications", description: "What we email you about" },
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
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product management" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 180;

const nativeFieldStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "0 12px",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "var(--font-size-s)",
};

const resetButtonStyle: CSSProperties = {
  font: "inherit",
  cursor: "pointer",
};

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId();
  return (
    <Column gap="8" fillWidth>
      <label htmlFor={id}>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        style={nativeFieldStyle}
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
  const labelId = useId();
  const descId = useId();
  return (
    <Row
      fillWidth
      horizontal="between"
      vertical="center"
      gap="16"
      paddingY="12"
      style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}
    >
      <Column gap="4" flex={1} minWidth={0}>
        <Text id={labelId} variant="label-default-m" onBackground="neutral-strong">
          {label}
        </Text>
        <Text id={descId} variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        onClick={() => onChange(!checked)}
        style={{
          ...resetButtonStyle,
          flexShrink: 0,
          width: 44,
          height: 26,
          borderRadius: 13,
          border: "1px solid var(--neutral-alpha-medium)",
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
          background: checked ? "var(--brand-solid-strong)" : "var(--neutral-alpha-weak)",
          transition: "background 0.15s ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "block",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </Row>
  );
}

interface CardProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
}

function SectionCard({ id, title, subtitle, children, danger }: CardProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      style={{
        scrollMarginTop: 24,
        border: danger
          ? "1px solid var(--danger-alpha-strong)"
          : "1px solid var(--neutral-alpha-weak)",
        borderRadius: "var(--radius-l)",
        background: "var(--surface-background)",
        padding: "clamp(16px, 4vw, 28px)",
      }}
    >
      <Column gap="24" fillWidth>
        <Column gap="4">
          <Heading as="h2" id={headingId} variant="heading-strong-l">
            {title}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {subtitle}
          </Text>
        </Column>
        {children}
      </Column>
    </section>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");

  // Profile
  const [firstName, setFirstName] = useState("Maya");
  const [lastName, setLastName] = useState("Okafor");
  const [username, setUsername] = useState("maya.okafor");
  const [role, setRole] = useState("design");
  const [bio, setBio] = useState(
    "Product designer focused on design systems and accessible interfaces. Currently building tools for small teams.",
  );
  const [timezone, setTimezone] = useState("Europe/London");
  const [language, setLanguage] = useState("en");
  const [website, setWebsite] = useState("mayaokafor.design");

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<string | null>(null);

  // Account
  const [email, setEmail] = useState("maya@northwind.studio");

  // Notifications
  const [notifProduct, setNotifProduct] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);

  // Form state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [bioTouched, setBioTouched] = useState(false);

  // Danger zone
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
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
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarUrl(url);
    setAvatarError(null);
    setSaveStatus("idle");
  };

  const removeAvatar = () => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = null;
    setAvatarUrl(null);
    setAvatarError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus("saved");
  };

  const markDirty = () => {
    if (saveStatus !== "idle") setSaveStatus("idle");
  };

  const goTo = (id: SectionId) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const fullName = `${firstName} ${lastName}`.trim();
  const canDelete = confirmText.trim() === "delete my account";

  if (deleted) {
    return (
      <Column fillWidth horizontal="center" padding="24" paddingY="64">
        <Column maxWidth={32} gap="16" horizontal="center" align="center">
          <Heading as="h1" variant="heading-strong-xl">
            Account scheduled for deletion
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak" role="status">
            We sent a confirmation to {email}. You have 14 days to change your mind before your
            data is permanently removed.
          </Text>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleted(false);
              setConfirming(false);
              setConfirmText("");
            }}
          >
            Undo and restore account
          </Button>
        </Column>
      </Column>
    );
  }

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth={72} gap="24">
        <Column gap="8" as="header">
          <Heading as="h1" variant="display-strong-xs">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, account preferences and security for Northwind Studio.
          </Text>
        </Column>

        <div className="settings-layout">
          {/* Sidebar */}
          <nav aria-label="Settings sections" className="settings-nav">
            <ul className="settings-nav-list">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                const isDanger = s.id === "danger";
                return (
                  <li key={s.id} style={{ minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      aria-current={isActive ? "true" : undefined}
                      style={{
                        ...resetButtonStyle,
                        width: "100%",
                        textAlign: "left",
                        minHeight: 44,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-m)",
                        border: "1px solid transparent",
                        background: isActive ? "var(--neutral-alpha-weak)" : "transparent",
                        color: isDanger
                          ? "var(--danger-on-background-strong)"
                          : "var(--neutral-on-background-strong)",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "var(--font-size-s)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.label}
                      <span
                        className="settings-nav-desc"
                        style={{
                          display: "block",
                          fontWeight: 400,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--neutral-on-background-weak)",
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

          {/* Content */}
          <Column flex={1} minWidth={0} gap="24">
            <SectionCard
              id="profile"
              title="Profile"
              subtitle="This information appears on your public profile and in shared projects."
            >
              <form onSubmit={handleSave}>
                <Column gap="24" fillWidth>
                  {/* Avatar */}
                  <Flex gap="16" vertical="center" wrap fillWidth>
                    <Avatar
                      size="xl"
                      src={avatarUrl ?? undefined}
                      value={avatarUrl ? undefined : `${firstName.charAt(0)}${lastName.charAt(0)}`}
                    />
                    <Column gap="8" flex={1} minWidth={12}>
                      <Text variant="label-default-m" onBackground="neutral-strong">
                        Profile photo
                      </Text>
                      <Row gap="8" wrap>
                        <input
                          ref={fileRef}
                          id="avatar-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleAvatar}
                          aria-describedby="avatar-help"
                          style={{
                            position: "absolute",
                            width: 1,
                            height: 1,
                            opacity: 0,
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                          tabIndex={-1}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="s"
                          onClick={() => fileRef.current?.click()}
                        >
                          {avatarUrl ? "Change photo" : "Upload photo"}
                        </Button>
                        {avatarUrl ? (
                          <Button type="button" variant="tertiary" size="s" onClick={removeAvatar}>
                            Remove
                          </Button>
                        ) : null}
                      </Row>
                      <Text id="avatar-help" variant="body-default-xs" onBackground="neutral-weak">
                        PNG, JPG or WebP, up to 2 MB. Square images work best.
                      </Text>
                      {avatarError ? (
                        <Text variant="body-default-xs" onBackground="danger-medium" role="alert">
                          {avatarError}
                        </Text>
                      ) : null}
                    </Column>
                  </Flex>

                  <div className="settings-row">
                    <Input
                      id="first-name"
                      label="First name"
                      value={firstName}
                      autoComplete="given-name"
                      required
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setFirstName(e.target.value);
                        markDirty();
                      }}
                    />
                    <Input
                      id="last-name"
                      label="Last name"
                      value={lastName}
                      autoComplete="family-name"
                      required
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setLastName(e.target.value);
                        markDirty();
                      }}
                    />
                  </div>

                  <Input
                    id="username"
                    label="Username"
                    value={username}
                    autoComplete="username"
                    description="Your profile lives at northwind.studio/@username"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setUsername(e.target.value);
                      markDirty();
                    }}
                  />

                  <Input
                    id="website"
                    label="Website"
                    value={website}
                    type="text"
                    autoComplete="url"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setWebsite(e.target.value);
                      markDirty();
                    }}
                  />

                  <div className="settings-row">
                    <SelectField
                      label="Role"
                      value={role}
                      options={ROLES}
                      onChange={(v) => {
                        setRole(v);
                        markDirty();
                      }}
                    />
                    <SelectField
                      label="Language"
                      value={language}
                      options={LANGUAGES}
                      onChange={(v) => {
                        setLanguage(v);
                        markDirty();
                      }}
                    />
                  </div>

                  <SelectField
                    label="Time zone"
                    value={timezone}
                    options={TIMEZONES}
                    onChange={(v) => {
                      setTimezone(v);
                      markDirty();
                    }}
                  />

                  <Column gap="8" fillWidth>
                    <Textarea
                      id="bio"
                      label="Bio"
                      lines={4}
                      value={bio}
                      maxLength={BIO_LIMIT}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        setBio(e.target.value.slice(0, BIO_LIMIT));
                        setBioTouched(true);
                        markDirty();
                      }}
                    />
                    <Text
                      variant="body-default-xs"
                      onBackground={bio.length >= BIO_LIMIT ? "danger-medium" : "neutral-weak"}
                      aria-live={bioTouched ? "polite" : "off"}
                    >
                      {bio.length}/{BIO_LIMIT} characters
                    </Text>
                  </Column>

                  <Row gap="12" vertical="center" wrap>
                    <Button type="submit" variant="primary" size="m">
                      Save changes
                    </Button>
                    <Text variant="body-default-s" onBackground="neutral-weak" role="status">
                      {saveStatus === "saved"
                        ? `Saved profile for ${fullName || "your account"}.`
                        : ""}
                    </Text>
                  </Row>
                </Column>
              </form>
            </SectionCard>

            <SectionCard
              id="account"
              title="Account"
              subtitle="The email address we use for sign-in and receipts."
            >
              <Input
                id="email"
                label="Email address"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              <Text variant="body-default-s" onBackground="neutral-weak">
                Workspace: Northwind Studio · Plan: Team (5 seats)
              </Text>
            </SectionCard>

            <SectionCard
              id="notifications"
              title="Notifications"
              subtitle="Choose which updates land in your inbox."
            >
              <Column fillWidth>
                <ToggleRow
                  label="Product updates"
                  description="New features and improvements, about once a month."
                  checked={notifProduct}
                  onChange={setNotifProduct}
                />
                <ToggleRow
                  label="Comments and mentions"
                  description="When a teammate replies to you or mentions you."
                  checked={notifComments}
                  onChange={setNotifComments}
                />
                <ToggleRow
                  label="Weekly digest"
                  description="A Monday summary of activity across your projects."
                  checked={notifDigest}
                  onChange={setNotifDigest}
                />
                <ToggleRow
                  label="Marketing emails"
                  description="Offers, events and community news."
                  checked={notifMarketing}
                  onChange={setNotifMarketing}
                />
              </Column>
            </SectionCard>

            <SectionCard id="security" title="Security" subtitle="Keep your account protected.">
              <Column fillWidth>
                <ToggleRow
                  label="Two-factor authentication"
                  description="Require a code from your authenticator app when signing in."
                  checked={twoFactor}
                  onChange={setTwoFactor}
                />
              </Column>
              <Row gap="12" wrap>
                <Button type="button" variant="secondary" size="s">
                  Change password
                </Button>
                <Button type="button" variant="tertiary" size="s">
                  Sign out of other devices
                </Button>
              </Row>
            </SectionCard>

            <SectionCard
              id="danger"
              title="Danger zone"
              subtitle="These actions are permanent. Please proceed carefully."
              danger
            >
              <Flex
                fillWidth
                gap="16"
                horizontal="between"
                vertical="center"
                wrap
                paddingBottom="16"
                style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}
              >
                <Column gap="4" flex={1} minWidth={16}>
                  <Text variant="label-default-m" onBackground="neutral-strong">
                    Export your data
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Download a copy of your projects, comments and profile as a ZIP archive.
                  </Text>
                </Column>
                <Button type="button" variant="secondary" size="s">
                  Request export
                </Button>
              </Flex>

              <Column gap="16" fillWidth>
                <Column gap="4">
                  <Text variant="label-default-m" onBackground="danger-medium">
                    Delete account
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Permanently remove your account, projects and all associated data. This cannot
                    be undone after 14 days.
                  </Text>
                </Column>

                {!confirming ? (
                  <Row>
                    <Button
                      type="button"
                      variant="danger"
                      size="s"
                      onClick={() => setConfirming(true)}
                    >
                      Delete account…
                    </Button>
                  </Row>
                ) : (
                  <Column
                    gap="12"
                    padding="16"
                    fillWidth
                    style={{
                      border: "1px solid var(--danger-alpha-medium)",
                      borderRadius: "var(--radius-m)",
                    }}
                  >
                    <Input
                      id="confirm-delete"
                      label='Type "delete my account" to confirm'
                      value={confirmText}
                      autoComplete="off"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setConfirmText(e.target.value)
                      }
                    />
                    <Row gap="8" wrap>
                      <Button
                        type="button"
                        variant="danger"
                        size="s"
                        disabled={!canDelete}
                        onClick={() => setDeleted(true)}
                      >
                        Permanently delete
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="s"
                        onClick={() => {
                          setConfirming(false);
                          setConfirmText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Row>
                  </Column>
                )}
              </Column>
            </SectionCard>
          </Column>
        </div>
      </Column>

      <style>{`
        .settings-layout {
          display: flex;
          flex-direction: row;
          gap: 24px;
          width: 100%;
          align-items: flex-start;
        }
        .settings-nav {
          flex: 0 0 240px;
          min-width: 0;
          position: sticky;
          top: 24px;
        }
        .settings-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .settings-row {
          display: flex;
          flex-direction: row;
          gap: 16px;
          width: 100%;
        }
        .settings-row > * {
          flex: 1 1 0;
          min-width: 0;
        }
        @media (max-width: 800px) {
          .settings-layout { flex-direction: column; align-items: stretch; }
          .settings-nav { position: static; flex: 0 0 auto; width: 100%; overflow-x: auto; }
          .settings-nav-list { flex-direction: row; gap: 8px; padding-bottom: 4px; }
          .settings-nav-desc { display: none !important; }
          .settings-nav-list button { border-color: var(--neutral-alpha-medium) !important; }
        }
        @media (max-width: 600px) {
          .settings-row { flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; transition: none !important; }
        }
      `}</style>
    </Column>
  );
}
```