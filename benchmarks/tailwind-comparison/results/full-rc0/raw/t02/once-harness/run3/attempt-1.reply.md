The `span` prop isn't on `Row`, so I wrapped the buttons in a plain `div` with a `gridColumn: "1 / -1"` style to span the full form width. `Input` and `Textarea` do list `span` as a prop, so those stay as they were. I haven't re-run the type check.

```tsx
"use client";

import {
  Avatar,
  Button,
  Column,
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
  Text,
  Textarea,
  Dialog,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const WORKSPACE_NAME = "Northwind Studio";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const TIMEZONES = [
  { value: "america-los_angeles", label: "Pacific Time (Los Angeles)" },
  { value: "america-new_york", label: "Eastern Time (New York)" },
  { value: "europe-london", label: "Greenwich Mean Time (London)" },
  { value: "europe-berlin", label: "Central European Time (Berlin)" },
  { value: "asia-tokyo", label: "Japan Standard Time (Tokyo)" },
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
  { value: "manager", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

export default function SettingsPage() {
  const { addToast } = useToast();

  // Profile
  const [displayName, setDisplayName] = useState("Amelia Parker");
  const [username, setUsername] = useState("amelia.parker");
  const [email, setEmail] = useState("amelia@northwind.studio");
  const [role, setRole] = useState("designer");
  const [timezone, setTimezone] = useState("europe-berlin");
  const [language, setLanguage] = useState("en");
  const [bio, setBio] = useState(
    "Designing calm, fast interfaces for small teams. Currently focused on onboarding and billing flows.",
  );
  const [saving, setSaving] = useState(false);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Notifications
  const [productUpdates, setProductUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");
  const [digestHour, setDigestHour] = useState("09");

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Revoke object URLs we created so they do not leak.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (JPG, PNG or WebP).");
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
    setAvatarUrl(null);
    setAvatarError(null);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      addToast({ variant: "success", message: "Profile saved" });
    }, 600);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const confirmDelete = () => {
    closeDeleteDialog();
    addToast({
      variant: "danger",
      message: `Deletion of ${WORKSPACE_NAME} has been scheduled`,
    });
  };

  const deleteEnabled = confirmText.trim() === WORKSPACE_NAME;

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Manage your account
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Update your profile, choose how we reach you, and control access to the {WORKSPACE_NAME} workspace.
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
            <Tab value="workspace" size="l" prefixIcon="settings">
              Workspace
            </Tab>
          </TabList>

          {/* PROFILE */}
          <TabPanel value="profile" keepMounted fillWidth>
            <Column background="surface" border radius="l" padding="24" gap="32" s={{ padding: "16" }}>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m">
                  Profile
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  This information is visible to people you collaborate with.
                </Text>
              </Column>

              <Row gap="20" vertical="center" wrap>
                <Avatar size="xl" src={avatarUrl ?? undefined} value="AP" />
                <Column gap="8">
                  <Row gap="8" wrap>
                    <Button
                      size="s"
                      variant="secondary"
                      prefixIcon="upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload photo
                    </Button>
                    {avatarUrl && (
                      <Button size="s" variant="tertiary" prefixIcon="trash" onClick={removeAvatar}>
                        Remove
                      </Button>
                    )}
                  </Row>
                  <Text
                    id="avatar-hint"
                    variant="label-default-s"
                    onBackground={avatarError ? "danger-medium" : "neutral-weak"}
                  >
                    {avatarError ?? "JPG, PNG or WebP. Max 2 MB."}
                  </Text>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                    aria-label="Upload profile photo"
                    aria-describedby="avatar-hint"
                    hidden
                  />
                </Column>
              </Row>

              <Form as="form" columns={{ xl: 2, s: 1 }} onSubmit={handleSave}>
                <Input
                  id="display-name"
                  label="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
                <Input
                  id="username"
                  label="Username"
                  prefix="@"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Select
                  id="role"
                  label="Role"
                  value={role}
                  onSelect={(value) => setRole(value as string)}
                  options={ROLES}
                />
                <Select
                  id="timezone"
                  label="Timezone"
                  value={timezone}
                  onSelect={(value) => setTimezone(value as string)}
                  options={TIMEZONES}
                  searchable
                />
                <Select
                  id="language"
                  label="Language"
                  value={language}
                  onSelect={(value) => setLanguage(value as string)}
                  options={LANGUAGES}
                />
                <Textarea
                  id="bio"
                  label="Bio"
                  lines={4}
                  span={2}
                  characterCount
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  description="A short introduction shown on your public profile."
                />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Row gap="12" wrap>
                    <Button type="submit" loading={saving}>
                      Save changes
                    </Button>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </Row>
                </div>
              </Form>
            </Column>
          </TabPanel>

          {/* NOTIFICATIONS */}
          <TabPanel value="notifications" gap="8" fillWidth>
            <Column gap="4" paddingBottom="8">
              <Heading as="h2" variant="heading-strong-m">
                Notifications
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Choose what lands in your inbox.
              </Text>
            </Column>
            <Setting label="Product updates" description="Release notes and new features, about twice a month.">
              <Switch
                checked={productUpdates}
                onToggle={() => setProductUpdates(!productUpdates)}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Mentions and replies" description="When a teammate mentions you or replies to your comment.">
              <Switch checked={mentions} onToggle={() => setMentions(!mentions)} ariaLabel="Mentions and replies" />
            </Setting>
            <SettingGroup
              label="Weekly digest"
              info="A summary of activity across your projects, sent once a week."
              control={<Switch checked={digest} onToggle={() => setDigest(!digest)} ariaLabel="Weekly digest" />}
              open={digest}
            >
              <Setting label="Day" description="When the digest is sent">
                <Select
                  id="digest-day"
                  value={digestDay}
                  onSelect={(value) => setDigestDay(value as string)}
                  options={[
                    { value: "monday", label: "Monday" },
                    { value: "wednesday", label: "Wednesday" },
                    { value: "friday", label: "Friday" },
                  ]}
                />
              </Setting>
              <Setting label="Time" description="In your timezone">
                <Select
                  id="digest-hour"
                  value={digestHour}
                  onSelect={(value) => setDigestHour(value as string)}
                  options={[
                    { value: "07", label: "07:00" },
                    { value: "09", label: "09:00" },
                    { value: "12", label: "12:00" },
                    { value: "17", label: "17:00" },
                  ]}
                />
              </Setting>
            </SettingGroup>
          </TabPanel>

          {/* SECURITY */}
          <TabPanel value="security" gap="8" fillWidth>
            <Column gap="4" paddingBottom="8">
              <Heading as="h2" variant="heading-strong-m">
                Security
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Keep your account safe.
              </Text>
            </Column>
            <Setting
              label="Two-factor authentication"
              description="Require a code from your authenticator app when signing in."
            >
              <Switch
                checked={twoFactor}
                onToggle={() => {
                  setTwoFactor(!twoFactor);
                  addToast({
                    variant: "success",
                    message: twoFactor ? "Two-factor authentication disabled" : "Two-factor authentication enabled",
                  });
                }}
                ariaLabel="Two-factor authentication"
              />
            </Setting>
            <Setting label="New sign-in alerts" description="Email me when a new device signs in to my account.">
              <Switch checked={loginAlerts} onToggle={() => setLoginAlerts(!loginAlerts)} ariaLabel="New sign-in alerts" />
            </Setting>
            <Setting label="Password" description="Last changed 3 months ago.">
              <Button variant="secondary" size="s" prefixIcon="lock">
                Change password
              </Button>
            </Setting>
          </TabPanel>

          {/* WORKSPACE + DANGER ZONE */}
          <TabPanel value="workspace" gap="24" fillWidth>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Workspace
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Settings for {WORKSPACE_NAME}. Only owners can change these.
              </Text>
            </Column>

            <Column
              as="section"
              aria-labelledby="danger-heading"
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
              s={{ padding: "16" }}
            >
              <Heading id="danger-heading" as="h3" variant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Deleting this workspace permanently removes all projects, files and member access. This cannot be
                undone.
              </Text>
              <Row>
                <Button variant="danger" size="s" prefixIcon="trash" onClick={() => setDeleteOpen(true)}>
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </TabPanel>
        </Tabs>
      </Column>

      <Dialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        title="Delete this workspace?"
        description={`This will permanently delete ${WORKSPACE_NAME}, including 24 projects and 1,280 files.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth wrap>
            <Button variant="secondary" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!deleteEnabled} onClick={confirmDelete}>
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Column gap="16">
          <Feedback
            variant="danger"
            title="This action is permanent"
            description="Members will lose access immediately."
          />
          <Input
            id="confirm-delete"
            label={`Type "${WORKSPACE_NAME}" to confirm`}
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
          />
        </Column>
      </Dialog>
    </Column>
  );
}
```