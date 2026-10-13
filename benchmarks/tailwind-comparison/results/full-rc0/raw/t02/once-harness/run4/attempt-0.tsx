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
  { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
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
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const DIGEST_DAYS = [
  { value: "monday", label: "Monday" },
  { value: "friday", label: "Friday" },
  { value: "sunday", label: "Sunday" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Amara",
  lastName: "Okafor",
  displayName: "Amara Okafor",
  email: "amara.okafor@northwind.studio",
  role: "design-lead",
  timezone: "europe-berlin",
  language: "en",
  bio: "Design lead at Northwind Studio. I care about calm interfaces, clear writing and shipping small things often.",
};

export default function SettingsPage() {
  const { addToast } = useToast();

  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [saving, setSaving] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrlRef = useRef<string | undefined>(undefined);

  const [productUpdates, setProductUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [mentions, setMentions] = useState(false);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");

  const [twoFactor, setTwoFactor] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Release the object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
  const emailInvalid = emailTouched && !emailValid;
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "?";

  const update =
    (key: keyof ProfileState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const setSelect = (key: keyof ProfileState) => (value: string | string[]) => {
    setProfile((prev) => ({ ...prev, [key]: Array.isArray(value) ? (value[0] ?? "") : value }));
  };

  const setAvatar = (next: string | undefined) => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = next;
    setAvatarUrl(next);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("That file isn't an image. Choose a JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatar(URL.createObjectURL(file));
    addToast({ variant: "success", message: "Photo updated. Save changes to keep it." });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    if (!emailValid) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(profile);
      addToast({ variant: "success", message: "Profile saved" });
    }, 700);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
  };

  const confirmDelete = () => {
    closeDelete();
    addToast({
      variant: "danger",
      message: `${WORKSPACE_NAME} is scheduled for deletion in 14 days.`,
    });
  };

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
            <Tab value="workspace" size="l" prefixIcon="settings">
              Workspace
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted flex={1} gap="24">
            <Column background="surface" border radius="l" padding="24" gap="32" s={{ padding: "16" }}>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m">
                  Profile
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  This information is visible to people in your workspace.
                </Text>
              </Column>

              <Row gap="20" vertical="center" wrap>
                <Avatar size="xl" src={avatarUrl} value={initials} />
                <Column gap="8" flex={1} minWidth={12}>
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
                      <Button
                        size="s"
                        variant="tertiary"
                        prefixIcon="trash"
                        onClick={() => {
                          setAvatar(undefined);
                          setAvatarError(null);
                        }}
                      >
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
                    tabIndex={-1}
                  />
                  <Text
                    variant="label-default-s"
                    onBackground={avatarError ? "danger-medium" : "neutral-weak"}
                    role={avatarError ? "alert" : undefined}
                  >
                    {avatarError ?? "JPG, PNG or WebP, up to 2 MB. Square images work best."}
                  </Text>
                </Column>
              </Row>

              <Form as="form" columns={{ xl: 2, s: 1 }} onSubmit={handleSubmit} aria-label="Profile details">
                <Input
                  id="first-name"
                  label="First name"
                  value={profile.firstName}
                  onChange={update("firstName")}
                  autoComplete="given-name"
                />
                <Input
                  id="last-name"
                  label="Last name"
                  value={profile.lastName}
                  onChange={update("lastName")}
                  autoComplete="family-name"
                />
                <Input
                  id="display-name"
                  label="Display name"
                  value={profile.displayName}
                  onChange={update("displayName")}
                  description="Shown on comments and mentions."
                  span={2}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={update("email")}
                  onBlur={() => setEmailTouched(true)}
                  error={emailInvalid}
                  errorMessage={emailInvalid ? "Enter a valid email address." : undefined}
                  autoComplete="email"
                  span={2}
                />
                <Select
                  id="role"
                  label="Role"
                  value={profile.role}
                  onSelect={setSelect("role")}
                  options={ROLES}
                />
                <Select
                  id="language"
                  label="Language"
                  value={profile.language}
                  onSelect={setSelect("language")}
                  options={LANGUAGES}
                />
                <Select
                  id="timezone"
                  label="Timezone"
                  value={profile.timezone}
                  onSelect={setSelect("timezone")}
                  options={TIMEZONES}
                  searchable
                  span={2}
                />
                <Textarea
                  id="bio"
                  label="Bio"
                  lines={4}
                  value={profile.bio}
                  onChange={update("bio")}
                  characterCount
                  description="A short introduction for your profile page."
                  span={2}
                />
                <Row gap="12" wrap vertical="center" style={{ gridColumn: "1 / -1" }}>
                  <Button type="submit" loading={saving} disabled={!dirty || saving}>
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!dirty || saving}
                    onClick={() => {
                      setProfile(saved);
                      setEmailTouched(false);
                    }}
                  >
                    Discard
                  </Button>
                  <Text variant="label-default-s" onBackground="neutral-weak" aria-live="polite">
                    {dirty ? "You have unsaved changes." : "All changes saved."}
                  </Text>
                </Row>
              </Form>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" flex={1} gap="8">
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Notifications
            </Heading>
            <Setting label="Product updates" description="Release notes and new features.">
              <Switch
                checked={productUpdates}
                onToggle={() => setProductUpdates(!productUpdates)}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting
              label="Security alerts"
              description="New sign-ins and changes to your account."
            >
              <Switch
                checked={securityAlerts}
                onToggle={() => setSecurityAlerts(!securityAlerts)}
                ariaLabel="Security alerts"
              />
            </Setting>
            <Setting label="Mentions" description="When a teammate mentions you in a comment.">
              <Switch
                checked={mentions}
                onToggle={() => setMentions(!mentions)}
                ariaLabel="Mentions"
              />
            </Setting>
            <SettingGroup
              label="Weekly digest"
              info="A single email summarising the week's activity across your projects."
              control={
                <Switch
                  checked={digest}
                  onToggle={() => setDigest(!digest)}
                  ariaLabel="Weekly digest"
                />
              }
              open={digest}
            >
              <Setting label="Send on" description="Delivered at 9:00 in your timezone.">
                <Select
                  id="digest-day"
                  label="Day"
                  value={digestDay}
                  onSelect={(value) =>
                    setDigestDay(Array.isArray(value) ? (value[0] ?? "monday") : value)
                  }
                  options={DIGEST_DAYS}
                />
              </Setting>
            </SettingGroup>
          </TabPanel>

          <TabPanel value="security" flex={1} gap="8">
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Security
            </Heading>
            <Setting
              label="Two-factor authentication"
              description="Require a code from your authenticator app when signing in."
            >
              <Switch
                checked={twoFactor}
                onToggle={() => {
                  setTwoFactor(!twoFactor);
                  addToast({
                    variant: twoFactor ? "info" : "success",
                    message: twoFactor
                      ? "Two-factor authentication turned off"
                      : "Two-factor authentication turned on",
                  });
                }}
                ariaLabel="Two-factor authentication"
              />
            </Setting>
            <Setting
              label="Public profile"
              description="Let anyone with the link see your name, role and bio."
            >
              <Switch
                checked={publicProfile}
                onToggle={() => setPublicProfile(!publicProfile)}
                ariaLabel="Public profile"
              />
            </Setting>
          </TabPanel>

          <TabPanel value="workspace" flex={1} gap="24">
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Workspace
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Actions here affect everyone in {WORKSPACE_NAME}.
              </Text>
            </Column>
            <Column
              as="section"
              aria-labelledby="danger-zone-title"
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="20"
              s={{ padding: "16" }}
            >
              <Column gap="8">
                <Heading
                  as="h3"
                  id="danger-zone-title"
                  variant="heading-strong-m"
                  onBackground="danger-medium"
                >
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Deleting a workspace removes all projects, files and member access. This can't be
                  undone after the 14-day grace period.
                </Text>
              </Column>
              <Row>
                <Button
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
        description={`This will schedule ${WORKSPACE_NAME} and all of its data for permanent deletion.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth wrap>
            <Button variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              prefixIcon="trash"
              disabled={deleteConfirm !== WORKSPACE_NAME}
              onClick={confirmDelete}
            >
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <Input
            id="delete-confirm"
            label={`Type "${WORKSPACE_NAME}" to confirm`}
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            autoComplete="off"
          />
        </Column>
      </Dialog>
    </Column>
  );
}
