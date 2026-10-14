The `Column as="form"` is typed as a div, so its submit handler can't take a `FormEvent<HTMLFormElement>`. I removed the `as="form"` and `onSubmit` from the Column, wrapped the content in a native `<form>` element, and moved the submit handler there.

```tsx
"use client";

import {
  Avatar,
  Button,
  Checkbox,
  Column,
  Dialog,
  Feedback,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  SettingGroup,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const TIMEZONES = [
  { value: "america-los_angeles", label: "Pacific Time (Los Angeles)" },
  { value: "america-new_york", label: "Eastern Time (New York)" },
  { value: "europe-london", label: "Greenwich Mean Time (London)" },
  { value: "europe-berlin", label: "Central European Time (Berlin)" },
  { value: "asia-kolkata", label: "India Standard Time (Kolkata)" },
  { value: "asia-tokyo", label: "Japan Standard Time (Tokyo)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

const ROLES = [
  { value: "design-lead", label: "Design lead" },
  { value: "engineer", label: "Software engineer" },
  { value: "product", label: "Product manager" },
  { value: "research", label: "Researcher" },
  { value: "other", label: "Other" },
];

const INITIAL_PROFILE = {
  firstName: "Marisol",
  lastName: "Quintero",
  username: "marisol.q",
  email: "marisol@fieldnotes.studio",
  role: "design-lead",
  timezone: "europe-berlin",
  language: "en",
  bio: "Design lead at Fieldnotes. I run the component library and write about interface systems on the side.",
};

type Profile = typeof INITIAL_PROFILE;

export default function SettingsPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<Profile>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [emailDigest, setEmailDigest] = useState(true);
  const [digestMentions, setDigestMentions] = useState(true);
  const [digestComments, setDigestComments] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [twoFactor, setTwoFactor] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved) || avatarUrl !== undefined;
  const canDelete = confirmText.trim() === "fieldnotes";

  // Revoke object URLs we created for the avatar preview.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const update = (key: keyof Profile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const updateSelect = (key: keyof Profile) => (value: string | string[]) => {
    setProfile((prev) => ({ ...prev, [key]: Array.isArray(value) ? (value[0] ?? "") : value }));
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setAvatarError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarUrl(undefined);
    setAvatarError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(profile);
    addToast({ variant: "success", message: "Profile saved" });
  };

  const handleReset = () => {
    setProfile(saved);
    setAvatarUrl(undefined);
    setAvatarError(null);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const confirmDelete = () => {
    closeDelete();
    addToast({ variant: "danger", message: "Deletion scheduled. Check your email to confirm." });
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16">
      <Column maxWidth="l" gap="32">
        <Column gap="8">
          <Text variant="label-default-s" onBackground="brand-medium">
            Account
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Settings
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, notifications and security for the Fieldnotes workspace.
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
            <Tab value="security" size="l" prefixIcon="security">
              Security
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted fillWidth gap="32">
            <form onSubmit={handleSubmit} aria-labelledby="profile-heading" noValidate={false}>
              <Column background="surface" border radius="l" padding="24" gap="32">
                <Column gap="4">
                  <Heading as="h2" id="profile-heading" variant="heading-strong-l">
                    Profile
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    This information appears on your public page and in comments.
                  </Text>
                </Column>

                <Row gap="20" vertical="center" wrap>
                  <Avatar size="xl" src={avatarUrl} value={initials} />
                  <Column gap="8">
                    <Row gap="8" wrap>
                      <Button
                        type="button"
                        size="s"
                        variant="secondary"
                        prefixIcon="upload"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarUrl ? "Replace photo" : "Upload photo"}
                      </Button>
                      {avatarUrl && (
                        <Button type="button" size="s" variant="tertiary" onClick={removeAvatar}>
                          Remove
                        </Button>
                      )}
                    </Row>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFile}
                      hidden
                      aria-label="Upload profile photo"
                    />
                    <Text id="avatar-hint" variant="label-default-s" onBackground="neutral-weak">
                      JPG, PNG or WebP, up to 2 MB.
                    </Text>
                  </Column>
                </Row>
                {avatarError && (
                  <div role="alert">
                    <Feedback variant="danger" title="Photo not added" description={avatarError} />
                  </div>
                )}

                <Form columns={{ xl: 2, s: 1 }}>
                  <Input
                    id="first-name"
                    label="First name"
                    value={profile.firstName}
                    onChange={update("firstName")}
                    autoComplete="given-name"
                    required
                  />
                  <Input
                    id="last-name"
                    label="Last name"
                    value={profile.lastName}
                    onChange={update("lastName")}
                    autoComplete="family-name"
                    required
                  />
                  <Input
                    id="username"
                    label="Username"
                    value={profile.username}
                    onChange={update("username")}
                    autoComplete="username"
                    description="Letters, numbers and dots."
                  />
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={update("email")}
                    autoComplete="email"
                    required
                  />
                  <Select
                    id="role"
                    label="Role"
                    value={profile.role}
                    onSelect={updateSelect("role")}
                    options={ROLES}
                  />
                  <Select
                    id="language"
                    label="Language"
                    value={profile.language}
                    onSelect={updateSelect("language")}
                    options={LANGUAGES}
                  />
                  <Select
                    id="timezone"
                    label="Time zone"
                    value={profile.timezone}
                    onSelect={updateSelect("timezone")}
                    options={TIMEZONES}
                    searchable
                  />
                </Form>

                <Textarea
                  id="bio"
                  label="Bio"
                  lines={4}
                  value={profile.bio}
                  onChange={update("bio")}
                  characterCount
                  description="A short introduction, shown on your public page."
                />

                <Row gap="12" vertical="center" wrap>
                  <Button type="submit" disabled={!dirty}>
                    Save changes
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleReset} disabled={!dirty}>
                    Reset
                  </Button>
                  {dirty && (
                    <Tag scheme="warning" size="s">
                      Unsaved changes
                    </Tag>
                  )}
                </Row>
              </Column>
            </form>

            <Column
              as="section"
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
              aria-labelledby="danger-heading"
            >
              <Column gap="4">
                <Heading as="h2" id="danger-heading" variant="heading-strong-l" onBackground="danger-medium">
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  These actions are permanent and cannot be undone.
                </Text>
              </Column>
              <Row gap="16" vertical="center" horizontal="between" wrap>
                <Column gap="4" flex={1} minWidth={16}>
                  <Text variant="label-strong-m">Delete workspace</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Removes the Fieldnotes workspace, 148 documents and all member access.
                  </Text>
                </Column>
                <Button type="button" variant="danger" prefixIcon="trash" onClick={() => setDeleteOpen(true)}>
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" fillWidth gap="8">
            <Heading as="h2" variant="heading-strong-l" paddingBottom="8">
              Notifications
            </Heading>
            <SettingGroup
              label="Email digest"
              info="One summary email instead of a message for every event."
              control={
                <Switch
                  checked={emailDigest}
                  onToggle={setEmailDigest}
                  ariaLabel="Email digest"
                />
              }
              open={emailDigest}
            >
              <Column padding="16" gap="12">
                <Checkbox
                  label="Mentions"
                  description="When someone mentions you in a document"
                  checked={digestMentions}
                  onToggle={setDigestMentions}
                />
                <Checkbox
                  label="Comments"
                  description="Replies to threads you started"
                  checked={digestComments}
                  onToggle={setDigestComments}
                />
              </Column>
            </SettingGroup>
            <Setting label="Product updates" description="Release notes and changelog">
              <Switch
                checked={productUpdates}
                onToggle={setProductUpdates}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Push notifications" description="Alerts on this device">
              <Switch
                checked={pushEnabled}
                onToggle={setPushEnabled}
                ariaLabel="Push notifications"
              />
            </Setting>
          </TabPanel>

          <TabPanel value="security" fillWidth gap="8">
            <Heading as="h2" variant="heading-strong-l" paddingBottom="8">
              Security
            </Heading>
            <Setting
              label="Two-factor authentication"
              description="Require a code from your authenticator app at sign-in"
            >
              <Switch
                checked={twoFactor}
                onToggle={setTwoFactor}
                ariaLabel="Two-factor authentication"
              />
            </Setting>
            <Setting label="Password" description="Last changed 3 months ago">
              <Button
                type="button"
                size="s"
                variant="secondary"
                onClick={() => addToast({ variant: "success", message: "Reset link sent to your email" })}
              >
                Send reset link
              </Button>
            </Setting>
          </TabPanel>
        </Tabs>
      </Column>

      <Dialog
        open={deleteOpen}
        onClose={closeDelete}
        title="Delete Fieldnotes workspace?"
        description="This permanently removes all documents and member access. Type the workspace name to confirm."
        footer={
          <Row gap="12" horizontal="end" fillWidth wrap>
            <Button type="button" variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button type="button" variant="danger" disabled={!canDelete} onClick={confirmDelete}>
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Input
          id="confirm-delete"
          label="Type “fieldnotes” to confirm"
          value={confirmText}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmText(event.target.value)}
          autoComplete="off"
        />
      </Dialog>
    </Column>
  );
}
```