"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const TIMEZONES = [
  { value: "europe-berlin", label: "Berlin (GMT+1)" },
  { value: "europe-london", label: "London (GMT+0)" },
  { value: "america-new-york", label: "New York (GMT-5)" },
  { value: "america-los-angeles", label: "Los Angeles (GMT-8)" },
  { value: "asia-tokyo", label: "Tokyo (GMT+9)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

const ROLES = [
  { value: "design-lead", label: "Design lead" },
  { value: "engineer", label: "Software engineer" },
  { value: "product", label: "Product manager" },
  { value: "other", label: "Other" },
];

const WORKSPACE_NAME = "Northwind Studio";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: Profile = {
  firstName: "Marta",
  lastName: "Kowalczyk",
  email: "marta.kowalczyk@northwind.studio",
  username: "marta.k",
  role: "design-lead",
  timezone: "europe-berlin",
  language: "en",
  bio: "Leading the design systems team. Previously product design at a logistics startup in Gdańsk.",
};

export default function SettingsPage() {
  const { addToast } = useToast();

  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<Profile>(INITIAL_PROFILE);
  const [saving, setSaving] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailNotes, setEmailNotes] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Revoke object URLs when replaced or on unmount.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const dirty = (Object.keys(profile) as (keyof Profile)[]).some(
    (key) => profile[key] !== saved[key],
  );
  const emailValid = /^\S+@\S+\.\S+$/.test(profile.email);
  const nameValid = profile.firstName.trim().length > 0;

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailValid || !nameValid || !dirty) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaved(profile);
      setSaving(false);
      addToast({ variant: "success", message: "Profile changes saved" });
    }, 700);
  };

  const handleReset = () => {
    setProfile(saved);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const handleDelete = () => {
    closeDelete();
    addToast({
      variant: "danger",
      message: `${WORKSPACE_NAME} is scheduled for deletion`,
    });
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16">
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Account
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, notifications and workspace for {WORKSPACE_NAME}.
          </Text>
        </Column>

        <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
          <TabList aria-label="Settings sections" minWidth={14} s={{ direction: "row" }}>
            <Tab value="profile" size="l" prefixIcon="person">
              Profile
            </Tab>
            <Tab value="notifications" size="l" prefixIcon="bell">
              Notifications
            </Tab>
            <Tab value="security" size="l" prefixIcon="lock">
              Security
            </Tab>
            <Tab value="danger" size="l" prefixIcon="danger">
              Danger zone
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted fillWidth>
            <form onSubmit={handleSubmit} noValidate aria-label="Profile settings">
              <Column background="surface" border radius="l" padding="24" gap="32">
                <Column gap="8">
                  <Heading as="h2" variant="heading-strong-m">
                    Profile
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    This information appears on your public profile and in comments.
                  </Text>
                </Column>

                <Row gap="24" vertical="center" wrap>
                  <Avatar size="xl" src={avatarUrl} value={initials} />
                  <Column gap="8" flex={1} minWidth={14}>
                    <Row gap="12" wrap>
                      <Button
                        type="button"
                        size="s"
                        variant="secondary"
                        prefixIcon="upload"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload photo
                      </Button>
                      {avatarUrl && (
                        <Button
                          type="button"
                          size="s"
                          variant="tertiary"
                          onClick={() => setAvatarUrl(undefined)}
                        >
                          Remove
                        </Button>
                      )}
                    </Row>
                    <input
                      ref={fileInputRef}
                      id="avatar-upload"
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={handleAvatarChange}
                      aria-label="Upload profile photo"
                      aria-describedby="avatar-hint"
                      hidden
                    />
                    <Text
                      id="avatar-hint"
                      variant="label-default-s"
                      onBackground={avatarError ? "danger-medium" : "neutral-weak"}
                      role={avatarError ? "alert" : undefined}
                    >
                      {avatarError ?? "PNG, JPG or WebP, up to 2 MB."}
                    </Text>
                  </Column>
                </Row>

                <Form columns={{ xl: 2, l: 2, m: 2, s: 1, xs: 1 }}>
                  <Input
                    id="first-name"
                    label="First name"
                    value={profile.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    error={!nameValid}
                    errorMessage={!nameValid ? "First name is required" : undefined}
                    autoComplete="given-name"
                  />
                  <Input
                    id="last-name"
                    label="Last name"
                    value={profile.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                  <Input
                    id="email"
                    label="Email address"
                    type="email"
                    value={profile.email}
                    onChange={(e) => update("email", e.target.value)}
                    error={!emailValid}
                    errorMessage={!emailValid ? "Enter a valid email address" : undefined}
                    autoComplete="email"
                  />
                  <Input
                    id="username"
                    label="Username"
                    value={profile.username}
                    onChange={(e) => update("username", e.target.value)}
                    description="Used in your profile link."
                    autoComplete="username"
                  />
                  <Select
                    id="role"
                    label="Role"
                    value={profile.role}
                    onSelect={(value) => update("role", value as string)}
                    options={ROLES}
                  />
                  <Select
                    id="language"
                    label="Language"
                    value={profile.language}
                    onSelect={(value) => update("language", value as string)}
                    options={LANGUAGES}
                  />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Select
                      id="timezone"
                      label="Timezone"
                      value={profile.timezone}
                      onSelect={(value) => update("timezone", value as string)}
                      options={TIMEZONES}
                      searchable
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Textarea
                      id="bio"
                      label="Bio"
                      lines={4}
                      value={profile.bio}
                      onChange={(e) => update("bio", e.target.value.slice(0, 240))}
                      description="A short introduction, up to 240 characters."
                      characterCount
                    />
                  </div>
                </Form>

                <Row gap="12" wrap>
                  <Button type="submit" loading={saving} disabled={!dirty || !emailValid || !nameValid}>
                    Save changes
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset} disabled={!dirty || saving}>
                    Discard
                  </Button>
                </Row>
              </Column>
            </form>
          </TabPanel>

          <TabPanel value="notifications" gap="8" fillWidth>
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Notifications
            </Heading>
            <Setting
              label="Email notifications"
              description="Activity on projects you own or follow"
            >
              <Switch
                checked={emailNotes}
                onToggle={setEmailNotes}
                ariaLabel="Email notifications"
              />
            </Setting>
            <Setting label="Mentions" description="When a teammate @mentions you in a comment">
              <Switch checked={mentions} onToggle={setMentions} ariaLabel="Mentions" />
            </Setting>
            <Setting
              label="Product news"
              description="Occasional release notes and tips"
            >
              <Switch checked={marketing} onToggle={setMarketing} ariaLabel="Product news" />
            </Setting>
          </TabPanel>

          <TabPanel value="security" gap="8" fillWidth>
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Security
            </Heading>
            <Setting
              label="Two-factor authentication"
              description="Require a code from your authenticator app at sign-in"
            >
              <Switch
                checked={twoFactor}
                onToggle={(next) => {
                  setTwoFactor(next);
                  addToast({
                    variant: "success",
                    message: next
                      ? "Two-factor authentication enabled"
                      : "Two-factor authentication disabled",
                  });
                }}
                ariaLabel="Two-factor authentication"
              />
            </Setting>
          </TabPanel>

          <TabPanel value="danger" fillWidth>
            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="24"
            >
              <Column gap="8">
                <Heading as="h2" variant="heading-strong-m" onBackground="danger-medium">
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  These actions are permanent. Take a moment to make sure you want to continue.
                </Text>
              </Column>

              <Row
                gap="16"
                vertical="center"
                horizontal="between"
                wrap
                paddingTop="16"
                borderTop
              >
                <Column gap="4" flex={1} minWidth={14}>
                  <Text variant="label-strong-m">Export workspace data</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Download projects, comments and files as a ZIP archive.
                  </Text>
                </Column>
                <Button
                  type="button"
                  variant="secondary"
                  size="s"
                  prefixIcon="download"
                  onClick={() =>
                    addToast({
                      variant: "success",
                      message: "Export started. We'll email you a download link.",
                    })
                  }
                >
                  Request export
                </Button>
              </Row>

              <Row
                gap="16"
                vertical="center"
                horizontal="between"
                wrap
                paddingTop="16"
                borderTop
              >
                <Column gap="4" flex={1} minWidth={14}>
                  <Text variant="label-strong-m">Delete workspace</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Permanently remove {WORKSPACE_NAME}, its 42 projects and all member access.
                  </Text>
                </Column>
                <Button
                  type="button"
                  variant="danger"
                  size="s"
                  prefixIcon="trash"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </TabPanel>
        </Tabs>
      </Column>

      <Dialog
        open={deleteOpen}
        onClose={closeDelete}
        title="Delete this workspace?"
        description="This cannot be undone. All projects, files and member access will be removed."
        footer={
          <Row gap="12" horizontal="end" wrap fillWidth>
            <Button type="button" variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={confirmText !== WORKSPACE_NAME}
              onClick={handleDelete}
            >
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Input
          id="confirm-delete"
          label={`Type "${WORKSPACE_NAME}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
      </Dialog>
    </Column>
  );
}
