I have what I need. The design is:

-   Vertical `Tabs` with sections for Profile, Notifications, Security and Danger zone, as in the gold example.
-   The profile panel is `keepMounted`. It has an avatar upload built from a native file input with a preview, a `Form` of inputs and selects, and a `Textarea` for the bio.
-   The Danger zone uses a `Dialog` to confirm deletion, and the confirm button stays disabled until the workspace name is typed.

I'm using a plain hidden file input and a local object URL for the avatar rather than `MediaUpload`, which needs `compressorjs` and an async handler. The input is labelled for accessibility.

```tsx
"use client";

import {
  Avatar,
  Button,
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
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const WORKSPACE_NAME = "Northwind Studio";

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
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "design-lead", label: "Design lead" },
  { value: "engineer", label: "Software engineer" },
  { value: "product", label: "Product manager" },
  { value: "founder", label: "Founder" },
];

const DIGEST_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function SettingsPage() {
  const { addToast } = useToast();

  // Profile form state
  const [displayName, setDisplayName] = useState("Maya Okonkwo");
  const [email, setEmail] = useState("maya.okonkwo@northwind.studio");
  const [jobTitle, setJobTitle] = useState("Head of Product Design");
  const [bio, setBio] = useState(
    "Designing calm, legible tools for small teams. Previously at Linden Labs and Fieldnote.",
  );
  const [role, setRole] = useState("design-lead");
  const [timezone, setTimezone] = useState("europe-berlin");
  const [language, setLanguage] = useState("en");

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Notification state
  const [productUpdates, setProductUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState("weekly");

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);

  // Danger zone state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Release the object URL when it is replaced or the page unmounts.
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
      setAvatarError("That file is larger than 2 MB. Try a smaller image.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleAvatarRemove = () => {
    setAvatarUrl(undefined);
    setAvatarError(null);
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Profile saved" });
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const handleDelete = () => {
    closeDeleteDialog();
    addToast({
      variant: "danger",
      message: `${WORKSPACE_NAME} is scheduled for deletion`,
    });
  };

  const confirmMatches = confirmText.trim() === WORKSPACE_NAME;

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Account &amp; workspace
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Update your profile, choose what lands in your inbox and manage the {WORKSPACE_NAME} workspace.
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
            <Tab value="danger" size="l" prefixIcon="warning">
              Danger zone
            </Tab>
          </TabList>

          {/* Profile */}
          <TabPanel value="profile" keepMounted fillWidth>
            <Column background="surface" border radius="l" padding="24" gap="32" fillWidth>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m">
                  Profile
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  This information is visible to everyone in your workspace.
                </Text>
              </Column>

              <Row gap="24" vertical="center" wrap>
                <Avatar size="xl" src={avatarUrl} value={avatarUrl ? undefined : "MO"} />
                <Column gap="8">
                  <Row gap="8" wrap>
                    <input
                      ref={fileInputRef}
                      id="avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      aria-describedby="avatar-hint"
                      hidden
                    />
                    <Button
                      size="s"
                      variant="secondary"
                      prefixIcon="upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarUrl ? "Replace photo" : "Upload photo"}
                    </Button>
                    {avatarUrl && (
                      <Button size="s" variant="tertiary" prefixIcon="trash" onClick={handleAvatarRemove}>
                        Remove
                      </Button>
                    )}
                  </Row>
                  <Text id="avatar-hint" variant="label-default-s" onBackground="neutral-weak">
                    JPG, PNG or WebP. Max 2 MB.
                  </Text>
                  {avatarError && (
                    <Text role="alert" variant="label-default-s" onBackground="danger-medium">
                      {avatarError}
                    </Text>
                  )}
                </Column>
              </Row>

              <Form as="form" columns={{ xl: 2, l: 2, m: 2, s: 1, xs: 1 }} onSubmit={handleProfileSubmit}>
                <Input
                  id="display-name"
                  label="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
                <Input
                  id="job-title"
                  label="Job title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  description="We send receipts and security alerts here."
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
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  characterCount
                />
                <Row span={2} gap="12" wrap>
                  <Button type="submit">Save changes</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setDisplayName("Maya Okonkwo");
                      setJobTitle("Head of Product Design");
                      setEmail("maya.okonkwo@northwind.studio");
                      setRole("design-lead");
                      setTimezone("europe-berlin");
                      setLanguage("en");
                      setBio(
                        "Designing calm, legible tools for small teams. Previously at Linden Labs and Fieldnote.",
                      );
                    }}
                  >
                    Reset
                  </Button>
                </Row>
              </Form>
            </Column>
          </TabPanel>

          {/* Notifications */}
          <TabPanel value="notifications" gap="8" fillWidth>
            <Column gap="4" paddingBottom="8">
              <Heading as="h2" variant="heading-strong-m">
                Notifications
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Choose which emails and alerts you receive.
              </Text>
            </Column>
            <Setting label="Product updates" description="Release notes and new features">
              <Switch
                checked={productUpdates}
                onToggle={() => setProductUpdates(!productUpdates)}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Mentions and replies" description="When a teammate @mentions you or replies to your comment">
              <Switch checked={mentions} onToggle={() => setMentions(!mentions)} ariaLabel="Mentions and replies" />
            </Setting>
            <SettingGroup
              label="Activity digest"
              info="A single summary email of what changed across your projects."
              control={
                <Switch checked={digest} onToggle={() => setDigest(!digest)} ariaLabel="Activity digest" />
              }
              open={digest}
            >
              <Setting label="Frequency" description="How often the digest is sent">
                <Select
                  id="digest-frequency"
                  value={digestFrequency}
                  onSelect={(value) => setDigestFrequency(value as string)}
                  options={DIGEST_FREQUENCIES}
                />
              </Setting>
            </SettingGroup>
          </TabPanel>

          {/* Security */}
          <TabPanel value="security" gap="8" fillWidth>
            <Column gap="4" paddingBottom="8">
              <Heading as="h2" variant="heading-strong-m">
                Security
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Keep your account protected.
              </Text>
            </Column>
            <Setting
              label="Two-factor authentication"
              description="Require a code from your authenticator app when signing in"
            >
              <Switch
                checked={twoFactor}
                onToggle={() => {
                  const next = !twoFactor;
                  setTwoFactor(next);
                  addToast({
                    variant: next ? "success" : "info",
                    message: next ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
                  });
                }}
                ariaLabel="Two-factor authentication"
              />
            </Setting>
            <Setting label="Password" description="Last changed 3 months ago">
              <Button size="s" variant="secondary" prefixIcon="lock">
                Change password
              </Button>
            </Setting>
          </TabPanel>

          {/* Danger zone */}
          <TabPanel value="danger" fillWidth>
            <Column background="surface" border="danger-alpha-medium" radius="l" padding="24" gap="24" fillWidth>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m" onBackground="danger-medium">
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  These actions are permanent. Take a moment before you continue.
                </Text>
              </Column>

              <Row gap="16" vertical="center" horizontal="between" wrap s={{ direction: "column", vertical: "start" }}>
                <Column gap="4" flex={1}>
                  <Text variant="body-strong-m">Export workspace data</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Download every project, comment and file as a ZIP archive.
                  </Text>
                </Column>
                <Button
                  variant="secondary"
                  size="s"
                  prefixIcon="download"
                  onClick={() => addToast({ variant: "info", message: "Export started. We'll email you a link." })}
                >
                  Export data
                </Button>
              </Row>

              <Row gap="16" vertical="center" horizontal="between" wrap s={{ direction: "column", vertical: "start" }}>
                <Column gap="4" flex={1}>
                  <Text variant="body-strong-m">Delete workspace</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Permanently delete {WORKSPACE_NAME} and all of its data. This cannot be undone.
                  </Text>
                </Column>
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
        description={`This permanently removes ${WORKSPACE_NAME}, its projects and its members' access.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth wrap>
            <Button variant="secondary" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!confirmMatches} onClick={handleDelete}>
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Column gap="16">
          <Feedback
            variant="danger"
            title="This action cannot be undone"
            description="All projects, files and billing history will be erased."
          />
          <Input
            id="confirm-workspace-name"
            label={`Type "${WORKSPACE_NAME}" to confirm`}
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            autoComplete="off"
          />
        </Column>
      </Dialog>
    </Column>
  );
}
```