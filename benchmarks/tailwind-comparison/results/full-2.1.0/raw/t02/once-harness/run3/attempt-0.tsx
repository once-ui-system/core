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

const TIMEZONES = [
  { value: "america-los-angeles", label: "Pacific Time (Los Angeles)" },
  { value: "america-new-york", label: "Eastern Time (New York)" },
  { value: "europe-london", label: "Greenwich Mean Time (London)" },
  { value: "europe-berlin", label: "Central European Time (Berlin)" },
  { value: "asia-kolkata", label: "India Standard Time (Mumbai)" },
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
  { value: "design", label: "Product design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product management" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Something else" },
];

const DIGEST_DAYS = [
  { value: "mon", label: "Monday" },
  { value: "wed", label: "Wednesday" },
  { value: "fri", label: "Friday" },
];

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
};

const INITIAL_PROFILE: ProfileState = {
  firstName: "Marta",
  lastName: "Okonkwo",
  email: "marta.okonkwo@fieldnotes.studio",
  username: "marta.okonkwo",
  role: "design",
  timezone: "europe-berlin",
  language: "en",
  bio: "Product designer at Fieldnotes. I care about calm interfaces, clear copy and shipping small improvements every week.",
};

export default function SettingsPage() {
  const { addToast } = useToast();

  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productUpdates, setProductUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("mon");
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Revoke object URLs created for the avatar preview.
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

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

  const handleCancel = () => {
    setProfile(saved);
    setEmailError(null);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const handleDelete = () => {
    closeDelete();
    addToast({
      variant: "danger",
      message: "Deletion is disabled in this demo workspace.",
    });
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "?";
  const deleteConfirmed = confirmText.trim() === "fieldnotes-studio";

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
            Manage your profile, notifications and workspace for Fieldnotes Studio.
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

          <TabPanel value="profile" keepMounted fillWidth>
            <Column background="surface" border radius="l" padding="24" gap="32" s={{ padding: "16" }}>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-m">
                  Profile
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  This information appears on your public profile and in comments.
                </Text>
              </Column>

              <Row gap="20" vertical="center" wrap>
                <Avatar
                  size="xl"
                  src={avatarUrl ?? undefined}
                  value={avatarUrl ? undefined : initials}
                  unoptimized
                />
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
                        onClick={() => {
                          setAvatarUrl(null);
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
                    onChange={handleAvatarChange}
                    hidden
                    aria-label="Upload profile photo"
                    tabIndex={-1}
                  />
                  <Text
                    variant="label-default-s"
                    onBackground={avatarError ? "danger-medium" : "neutral-weak"}
                    role={avatarError ? "alert" : undefined}
                  >
                    {avatarError ?? "JPG, PNG or WebP, up to 2 MB."}
                  </Text>
                </Column>
              </Row>

              <form onSubmit={handleSubmit} aria-label="Profile details">
                <Column gap="32">
                  <Form columns={{ xl: 2, l: 2, m: 2, s: 1, xs: 1 }} density="spacious">
                    <Input
                      id="first-name"
                      label="First name"
                      value={profile.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      autoComplete="given-name"
                      required
                    />
                    <Input
                      id="last-name"
                      label="Last name"
                      value={profile.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      autoComplete="family-name"
                      required
                    />
                    <Input
                      id="email"
                      label="Email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        update("email", e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      autoComplete="email"
                      error={Boolean(emailError)}
                      errorMessage={emailError}
                      required
                    />
                    <Input
                      id="username"
                      label="Username"
                      prefix={<Text variant="label-default-s" onBackground="neutral-weak">@</Text>}
                      value={profile.username}
                      onChange={(e) => update("username", e.target.value)}
                      autoComplete="username"
                      description="Used in your profile link."
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
                        onChange={(e) => update("bio", e.target.value)}
                        characterCount
                        description={`Shown beneath ${fullName || "your name"} on your profile.`}
                      />
                    </div>
                  </Form>

                  <Row gap="12" wrap>
                    <Button type="submit" loading={saving} disabled={!dirty || saving}>
                      Save changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={!dirty || saving}
                    >
                      Cancel
                    </Button>
                  </Row>
                </Column>
              </form>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" gap="8" fillWidth>
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Notifications
            </Heading>
            <Setting label="Product updates" description="Release notes and what's new in Fieldnotes.">
              <Switch
                checked={productUpdates}
                onToggle={setProductUpdates}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Mentions and replies" description="When a teammate mentions you or replies to your comment.">
              <Switch checked={mentions} onToggle={setMentions} ariaLabel="Mentions and replies" />
            </Setting>
            <SettingGroup
              label="Weekly digest"
              info="A single email summarising activity across the projects you follow."
              control={<Switch checked={digest} onToggle={setDigest} ariaLabel="Weekly digest" />}
              open={digest}
            >
              <Setting label="Send on" description="Delivered at 9:00 in your timezone.">
                <Select
                  id="digest-day"
                  label="Day"
                  value={digestDay}
                  onSelect={(value) => setDigestDay(value as string)}
                  options={DIGEST_DAYS}
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

          <TabPanel value="workspace" gap="24" fillWidth>
            <Column gap="4">
              <Heading as="h2" variant="heading-strong-m">
                Workspace
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Fieldnotes Studio · 12 members · Created March 2023
              </Text>
            </Column>

            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
              s={{ padding: "16" }}
            >
              <Column gap="8">
                <Heading as="h3" variant="heading-strong-m" onBackground="danger-medium">
                  Danger zone
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Deleting the workspace permanently removes all 48 projects, 1,320 notes and
                  member access. This action cannot be undone.
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
        title="Delete Fieldnotes Studio?"
        description="This permanently deletes the workspace and everything in it. Type the workspace name to confirm."
        footer={
          <Row gap="12" horizontal="end" wrap>
            <Button variant="secondary" onClick={closeDelete}>
              Keep workspace
            </Button>
            <Button variant="danger" disabled={!deleteConfirmed} onClick={handleDelete}>
              Delete permanently
            </Button>
          </Row>
        }
      >
        <Input
          id="confirm-delete"
          label="Workspace name"
          placeholder="fieldnotes-studio"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          description={
            <>
              Type <strong>fieldnotes-studio</strong> to continue.
            </>
          }
          autoComplete="off"
        />
      </Dialog>
    </Column>
  );
}
