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
  Tag,
  Text,
  Textarea,
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
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "manager", label: "Product manager" },
  { value: "founder", label: "Founder" },
];

export default function SettingsPage() {
  const { addToast } = useToast();

  // Profile form state
  const [name, setName] = useState("Amelia Hartmann");
  const [handle, setHandle] = useState("ameliah");
  const [email, setEmail] = useState("amelia@northwind.studio");
  const [role, setRole] = useState("designer");
  const [timezone, setTimezone] = useState("europe-berlin");
  const [language, setLanguage] = useState("en");
  const [bio, setBio] = useState(
    "Designing calm, fast interfaces for small teams. Currently focused on onboarding and billing flows.",
  );
  const [saving, setSaving] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
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
    setAvatarUrl(undefined);
    setAvatarError(null);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      addToast({ variant: "success", message: "Profile changes saved" });
    }, 600);
  };

  // Notifications
  const [productUpdates, setProductUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestHour, setDigestHour] = useState(8);
  const [marketing, setMarketing] = useState(false);

  // Danger zone
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === WORKSPACE_NAME;

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmText("");
  };

  const confirmDelete = () => {
    if (!canDelete) return;
    closeDelete();
    addToast({
      variant: "danger",
      message: `${WORKSPACE_NAME} is scheduled for deletion in 7 days`,
    });
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Account and workspace
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Manage your profile, notification preferences and the {WORKSPACE_NAME} workspace.
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
            <Tab value="danger" size="l" prefixIcon="warning">
              Danger zone
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted fillWidth>
            <Column fillWidth gap="24">
              <Column background="surface" border radius="l" padding="24" gap="24" s={{ padding: "16" }}>
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-m">
                    Profile
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    This information is visible to people in your workspace.
                  </Text>
                </Column>

                <Row gap="20" vertical="center" wrap>
                  <Avatar size="xl" src={avatarUrl} value="AH" />
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFile}
                      aria-label="Upload profile photo"
                      hidden
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

                <Form as="form" columns={{ xl: 2, s: 1 }} onSubmit={handleSave}>
                  <Input
                    id="profile-name"
                    label="Display name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <Input
                    id="profile-handle"
                    label="Username"
                    prefix="@"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                  />
                  <Input
                    id="profile-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <Select
                    id="profile-role"
                    label="Role"
                    value={role}
                    onSelect={(value) => setRole(value as string)}
                    options={ROLES}
                  />
                  <Select
                    id="profile-timezone"
                    label="Timezone"
                    value={timezone}
                    onSelect={(value) => setTimezone(value as string)}
                    options={TIMEZONES}
                    searchable
                  />
                  <Select
                    id="profile-language"
                    label="Language"
                    value={language}
                    onSelect={(value) => setLanguage(value as string)}
                    options={LANGUAGES}
                  />
                  <Textarea
                    id="profile-bio"
                    label="Short bio"
                    lines={4}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    description="A sentence or two. Shown on your public profile."
                    span={2}
                  />
                  <Row gap="12" wrap span={2}>
                    <Button type="submit" loading={saving}>
                      Save changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setName("Amelia Hartmann");
                        setHandle("ameliah");
                        setEmail("amelia@northwind.studio");
                        setRole("designer");
                        setTimezone("europe-berlin");
                        setLanguage("en");
                      }}
                    >
                      Reset
                    </Button>
                  </Row>
                </Form>
              </Column>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" fillWidth gap="8">
            <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
              Notifications
            </Heading>
            <Setting label="Product updates" description="Release notes and new features">
              <Switch
                checked={productUpdates}
                onToggle={() => setProductUpdates(!productUpdates)}
                ariaLabel="Product updates"
              />
            </Setting>
            <Setting label="Mentions and replies" description="When a teammate mentions you or replies to your comment">
              <Switch checked={mentions} onToggle={() => setMentions(!mentions)} ariaLabel="Mentions and replies" />
            </Setting>
            <SettingGroup
              label="Weekly digest"
              info="A single email each Monday summarising activity across your projects."
              control={
                <Switch checked={digest} onToggle={() => setDigest(!digest)} ariaLabel="Weekly digest" />
              }
              open={digest}
            >
              <Setting label="Send at" description="Hour of the day in your timezone (0–23)">
                <NumberInput id="digest-hour" min={0} max={23} value={digestHour} onChange={setDigestHour} />
              </Setting>
            </SettingGroup>
            <Setting label="Tips and offers" description="Occasional emails about workshops and partner deals">
              <Switch checked={marketing} onToggle={() => setMarketing(!marketing)} ariaLabel="Tips and offers" />
            </Setting>
          </TabPanel>

          <TabPanel value="danger" fillWidth>
            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="24"
              s={{ padding: "16" }}
            >
              <Column gap="8">
                <Row gap="12" vertical="center" wrap>
                  <Heading as="h2" variant="heading-strong-m" onBackground="danger-medium">
                    Danger zone
                  </Heading>
                  <Tag scheme="danger" size="s" prefixIcon="warning">
                    Irreversible
                  </Tag>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  These actions affect everyone in {WORKSPACE_NAME}. Please read each one carefully before continuing.
                </Text>
              </Column>

              <Row gap="16" vertical="center" horizontal="between" wrap>
                <Column gap="4" flex={1} minWidth={16}>
                  <Text variant="label-strong-m">Transfer ownership</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Hand the workspace to another admin. You will become a regular member.
                  </Text>
                </Column>
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() =>
                    addToast({ variant: "info", message: "Choose an admin to transfer ownership to." })
                  }
                >
                  Transfer
                </Button>
              </Row>

              <Row gap="16" vertical="center" horizontal="between" wrap>
                <Column gap="4" flex={1} minWidth={16}>
                  <Text variant="label-strong-m">Delete workspace</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Permanently remove 42 projects, 18 members and all billing history.
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
        onClose={closeDelete}
        title={`Delete ${WORKSPACE_NAME}?`}
        description="This cannot be undone. All projects, files and members will be removed after a 7-day grace period."
        footer={
          <Row gap="12" horizontal="end" fillWidth wrap>
            <Button variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!canDelete} onClick={confirmDelete}>
              Delete workspace
            </Button>
          </Row>
        }
      >
        <Column gap="12" paddingTop="8">
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
