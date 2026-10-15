Now I'll write the page.

The profile panel keeps its form mounted and uses a native file input with an object-URL preview. The danger zone confirms deletion in a Dialog that requires typing the workspace name.

```tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  Form,
  Heading,
  Input,
  NumberInput,
  Row,
  Select,
  Setting,
  SettingGroup,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const WORKSPACE_NAME = "northwind-studio";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const TIMEZONES = [
  { value: "america-los-angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "america-new-york", label: "Eastern Time (UTC−05:00)" },
  { value: "europe-london", label: "London (UTC+00:00)" },
  { value: "europe-berlin", label: "Central European Time (UTC+01:00)" },
  { value: "asia-kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "asia-tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

const ROLES = [
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product management" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Lindqvist",
  email: "maya.lindqvist@northwind.studio",
  jobTitle: "Lead product designer",
  role: "design",
  timezone: "europe-berlin",
  language: "en",
  bio: "Designing calm, fast interfaces for small teams. Currently working on the Northwind onboarding rebuild.",
};

export default function SettingsPage() {
  const { addToast } = useToast();
  const uid = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [productUpdates, setProductUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestHour, setDigestHour] = useState(9);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  // Revoke the object URL when it is replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
    addToast({ variant: "success", message: "Photo updated. Save changes to keep it." });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(profile);
      addToast({ variant: "success", message: "Profile saved" });
    }, 600);
  };

  const handleReset = () => {
    setProfile(saved);
    setEmailError(null);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setConfirmName("");
  };

  const handleDelete = () => {
    closeDeleteDialog();
    addToast({ variant: "danger", message: "Workspace scheduled for deletion" });
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Account
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, notifications and the {WORKSPACE_NAME} workspace.
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
            <Tab value="workspace" size="l" prefixIcon="settings">
              Workspace
            </Tab>
          </TabList>

          {/* Profile */}
          <TabPanel value="profile" keepMounted flex={1} gap="24">
            <Column background="surface" border radius="l" padding="24" gap="32" s={{ padding: "16" }}>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m">
                  Profile
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  This information appears on your comments, mentions and shared files.
                </Text>
              </Column>

              <Row gap="20" vertical="center" wrap>
                <Avatar size="xl" src={avatarUrl ?? undefined} value={initials} />
                <Column gap="8" flex={1} minWidth={12}>
                  <Row gap="8" wrap>
                    <input
                      ref={fileInputRef}
                      id={`${uid}-avatar`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      hidden
                      aria-describedby={`${uid}-avatar-help`}
                    />
                    <Button
                      type="button"
                      size="s"
                      variant="secondary"
                      prefixIcon="upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload photo
                    </Button>
                    {avatarUrl ? (
                      <Button
                        type="button"
                        size="s"
                        variant="tertiary"
                        onClick={() => {
                          setAvatarUrl(null);
                          setAvatarError(null);
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </Row>
                  <Text id={`${uid}-avatar-help`} variant="label-default-s" onBackground="neutral-weak">
                    JPG, PNG or WebP, up to 2 MB. Square images work best.
                  </Text>
                  {avatarError ? (
                    <Text role="alert" variant="label-default-s" onBackground="danger-medium">
                      {avatarError}
                    </Text>
                  ) : null}
                </Column>
              </Row>

              <form onSubmit={handleSubmit} noValidate aria-label="Profile details">
                <Column gap="24">
                  <Form columns={{ xl: 2, l: 2, m: 2, s: 1, xs: 1 }}>
                    <Input
                      id={`${uid}-first-name`}
                      label="First name"
                      value={profile.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      autoComplete="given-name"
                    />
                    <Input
                      id={`${uid}-last-name`}
                      label="Last name"
                      value={profile.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      autoComplete="family-name"
                    />
                    <Input
                      id={`${uid}-email`}
                      label="Email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        update("email", e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      autoComplete="email"
                      error={emailError !== null}
                      errorMessage={emailError}
                      span={2}
                    />
                    <Input
                      id={`${uid}-job-title`}
                      label="Job title"
                      value={profile.jobTitle}
                      onChange={(e) => update("jobTitle", e.target.value)}
                      autoComplete="organization-title"
                    />
                    <Select
                      id={`${uid}-role`}
                      label="Primary role"
                      value={profile.role}
                      onSelect={(value) => update("role", value as string)}
                      options={ROLES}
                    />
                    <Select
                      id={`${uid}-timezone`}
                      label="Timezone"
                      value={profile.timezone}
                      onSelect={(value) => update("timezone", value as string)}
                      options={TIMEZONES}
                      searchable
                    />
                    <Select
                      id={`${uid}-language`}
                      label="Language"
                      value={profile.language}
                      onSelect={(value) => update("language", value as string)}
                      options={LANGUAGES}
                    />
                    <Textarea
                      id={`${uid}-bio`}
                      label="Short bio"
                      lines={4}
                      value={profile.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      description="Up to 200 characters. Shown on your public profile."
                      span={2}
                    />
                  </Form>

                  <Row gap="12" wrap vertical="center">
                    <Button type="submit" loading={saving} disabled={!dirty}>
                      Save changes
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleReset} disabled={!dirty || saving}>
                      Cancel
                    </Button>
                    <Text role="status" variant="label-default-s" onBackground="neutral-weak">
                      {dirty ? "You have unsaved changes." : "All changes saved."}
                    </Text>
                  </Row>
                </Column>
              </form>
            </Column>
          </TabPanel>

          {/* Notifications */}
          <TabPanel value="notifications" flex={1} gap="8">
            <Column gap="4" paddingBottom="16">
              <Heading as="h2" variant="heading-strong-m">
                Notifications
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Choose what reaches your inbox. Changes apply immediately.
              </Text>
            </Column>
            <Setting label="Product updates" description="Release notes and changelog highlights">
              <Switch
                checked={productUpdates}
                onToggle={setProductUpdates}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Mentions and replies" description="When a teammate mentions you or replies to your comment">
              <Switch checked={mentions} onToggle={setMentions} ariaLabel="Mentions and replies" />
            </Setting>
            <SettingGroup
              label="Weekly digest"
              info="A single summary of activity across your projects, sent once a week on Mondays."
              control={<Switch checked={digest} onToggle={setDigest} ariaLabel="Weekly digest" />}
              open={digest}
            >
              <Setting label="Send at" description="Hour of the day, in your timezone">
                <NumberInput
                  id={`${uid}-digest-hour`}
                  min={0}
                  max={23}
                  value={digestHour}
                  onChange={setDigestHour}
                />
              </Setting>
            </SettingGroup>
            <Setting
              label="Security alerts"
              description="New sign-ins and password changes. Recommended."
            >
              <Switch
                checked={securityAlerts}
                onToggle={setSecurityAlerts}
                ariaLabel="Security alerts"
              />
            </Setting>
          </TabPanel>

          {/* Workspace */}
          <TabPanel value="workspace" flex={1} gap="24">
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Workspace
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Settings for {WORKSPACE_NAME}. Only owners can change these.
              </Text>
            </Column>

            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
              s={{ padding: "16" }}
              role="region"
              aria-labelledby={`${uid}-danger-title`}
            >
              <Heading as="h3" id={`${uid}-danger-title`} variant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Column gap="16">
                <Row gap="16" vertical="center" horizontal="between" wrap>
                  <Column gap="4" flex={1} minWidth={16}>
                    <Text variant="label-strong-m">Transfer ownership</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Hand this workspace to another member. You will become an admin.
                    </Text>
                  </Column>
                  <Button type="button" variant="secondary" size="s">
                    Transfer
                  </Button>
                </Row>
                <Row gap="16" vertical="center" horizontal="between" wrap>
                  <Column gap="4" flex={1} minWidth={16}>
                    <Text variant="label-strong-m">Delete workspace</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Permanently remove all projects, files and members. This cannot be undone.
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
            </Column>
          </TabPanel>
        </Tabs>
      </Column>

      <Dialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        title="Delete this workspace?"
        description={`This permanently deletes ${WORKSPACE_NAME}, including every project and file. Type the workspace name to confirm.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button type="button" variant="secondary" onClick={closeDeleteDialog}>
              Keep workspace
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={confirmName !== WORKSPACE_NAME}
              onClick={handleDelete}
            >
              Delete forever
            </Button>
          </Row>
        }
      >
        <Input
          id={`${uid}-confirm-name`}
          label={`Type "${WORKSPACE_NAME}" to confirm`}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          autoComplete="off"
        />
      </Dialog>
    </Column>
  );
}
```